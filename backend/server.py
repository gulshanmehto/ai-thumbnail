from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, Response
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
import hashlib
import hmac
import os
import uuid
import httpx
import google.generativeai as genai
import asyncio
from datetime import datetime, timezone, timedelta
from dotenv import load_dotenv
import logging
import base64
import aiofiles
import urllib.parse


# Load env
load_dotenv()

def get_password_hash(password: str) -> str:
    salt = os.urandom(16)
    hash_obj = hashlib.pbkdf2_hmac('sha256', password.encode(), salt, 100000)
    return f"{salt.hex()}:{hash_obj.hex()}"

def verify_password(password: str, stored_hash: str) -> bool:
    if not stored_hash or ":" not in stored_hash:
        return False
    salt_hex, hash_hex = stored_hash.split(":")
    salt = bytes.fromhex(salt_hex)
    expected_hash = bytes.fromhex(hash_hex)
    new_hash = hashlib.pbkdf2_hmac('sha256', password.encode(), salt, 100000)
    return hmac.compare_digest(new_hash, expected_hash)

# Config
MONGO_URL = os.getenv("MONGO_URL")
DB_NAME = os.getenv("DB_NAME", "ai_thumb")
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
PAYU_KEY = os.getenv("PAYU_MERCHANT_KEY")
PAYU_SALT = os.getenv("PAYU_MERCHANT_SALT")
PAYU_URL = os.getenv("PAYU_URL", "https://test.payu.in/_payment") # https://secure.payu.in/_payment for prod

if GOOGLE_API_KEY:
    genai.configure(api_key=GOOGLE_API_KEY)

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# App
app = FastAPI()

# Mount Static Files for Images
os.makedirs("static/images", exist_ok=True)
app.mount("/api/static", StaticFiles(directory="static"), name="static")

api_router = APIRouter(prefix="/api")

# CORS
cors_origins_raw = os.getenv("CORS_ORIGINS", "")
origins = [
    "http://localhost:3000", 
    "https://ai-thumbnail-phi.vercel.app",
    "https://www.quickthumb.me",
    "https://quickthumb.me"
] # Base fallbacks

if cors_origins_raw and cors_origins_raw != "*":
    extra_origins = [o.strip().rstrip("/") for o in cors_origins_raw.split(",") if o.strip()]
    origins.extend(extra_origins)
    # Remove duplicates
    origins = list(set(origins))

logger.info(f"Allowed CORS Origins: {origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["Authorization", "Content-Type", "X-Admin-Token", "Set-Cookie", "Cookie"], # Explicitly allow our custom header
)

# DB
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

# Models
class User(BaseModel):
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    created_at: datetime
    credits: int = 5

class GenerateRequest(BaseModel):
    description: str
    thumbnail_text: str
    aspect_ratio: str
    subject_image: str
    reference_image: str

class ThumbnailResponse(BaseModel):
    id: str
    user_id: str
    description: str
    thumbnail_text: str
    aspect_ratio: str
    image_url: Optional[str] = None
    created_at: datetime

class SignupRequest(BaseModel):
    email: EmailStr
    password: str
    name: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class CheckoutRequest(BaseModel):
    pack_id: str

# Auth Dependencies
async def get_current_user(request: Request):
    session_token = request.cookies.get("session_token")
    if not session_token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            session_token = auth_header.split(" ")[1]
    
    if not session_token:
        raise HTTPException(status_code=401, detail="Not authenticated")
        
    session = await db.user_sessions.find_one({"session_token": session_token}, {"_id": 0})
    if not session:
        raise HTTPException(status_code=401, detail="Invalid session")
        
    expires_at = session["expires_at"]
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
        
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Session expired")
        
    user = await db.users.find_one({"user_id": session["user_id"]})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    if "_id" in user:
        del user["_id"]
        
    return user

# Routes
@api_router.get("/")
async def root():
    return {"status": "ok"}

# --- AUTH ---
@api_router.post("/auth/signup")
async def signup(req: SignupRequest, response: Response):
    user = await db.users.find_one({"email": req.email})
    if user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    hashed_password = get_password_hash(req.password)
    
    new_user = {
        "user_id": user_id,
        "email": req.email,
        "name": req.name,
        "password_hash": hashed_password,
        "picture": f"https://api.dicebear.com/7.x/avataaars/svg?seed={req.name}",
        "credits": 3,
        "created_at": datetime.now(timezone.utc)
    }
    await db.users.insert_one(new_user)
    
    session_token = str(uuid.uuid4())
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    
    await db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": expires_at,
        "created_at": datetime.now(timezone.utc)
    })
    
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=7 * 24 * 60 * 60
    )
    
    # Don't return password hash or MongoDB _id
    if "password_hash" in new_user:
        del new_user["password_hash"]
    if "_id" in new_user:
        del new_user["_id"]
        
    return {"user": new_user, "session_token": session_token}

@api_router.post("/auth/login")
async def login(req: LoginRequest, response: Response):
    user = await db.users.find_one({"email": req.email})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not verify_password(req.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    session_token = str(uuid.uuid4())
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    
    await db.user_sessions.insert_one({
        "user_id": user["user_id"],
        "session_token": session_token,
        "expires_at": expires_at,
        "created_at": datetime.now(timezone.utc)
    })
    
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=7 * 24 * 60 * 60
    )
    
    # Don't return password hash
    if "password_hash" in user:
        del user["password_hash"]
    if "_id" in user:
        del user["_id"]
        
    return {"user": user, "session_token": session_token}

@api_router.get("/auth/me")
async def get_me(user: dict = Depends(get_current_user)):
    return user

@api_router.post("/auth/logout")
async def logout(response: Response, request: Request):
    session_token = request.cookies.get("session_token")
    if session_token:
        await db.user_sessions.delete_one({"session_token": session_token})
    response.delete_cookie("session_token")
    return {"status": "logged out"}

# --- GENERATION ---
@api_router.get("/thumbnails", response_model=List[ThumbnailResponse])
async def get_thumbnails(request: Request, user: dict = Depends(get_current_user)):
    thumbnails_cursor = db.thumbnails.find({"user_id": user["user_id"]}, {"_id": 0}).sort("created_at", -1)
    thumbnails = await thumbnails_cursor.to_list(length=100)
    return thumbnails

@api_router.get("/showcase", response_model=List[ThumbnailResponse])
async def get_showcase():
    thumbnails_cursor = db.thumbnails.find({}, {"_id": 0}).sort("created_at", -1).limit(40)
    thumbnails = await thumbnails_cursor.to_list(length=40)
    return thumbnails

@api_router.delete("/thumbnails/{thumbnail_id}")
async def delete_thumbnail(thumbnail_id: str, user: dict = Depends(get_current_user)):
    # Find the thumbnail first to verify ownership
    thumbnail = await db.thumbnails.find_one({"id": thumbnail_id, "user_id": user["user_id"]})
    if not thumbnail:
        raise HTTPException(status_code=404, detail="Thumbnail not found")
    
    # Delete the image file if it exists
    if thumbnail.get("image_url"):
        file_path = os.path.join("generated_images", os.path.basename(thumbnail["image_url"]))
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
            except Exception as e:
                logger.warning(f"Failed to delete image file: {e}")
    
    # Delete from database
    await db.thumbnails.delete_one({"id": thumbnail_id, "user_id": user["user_id"]})
    return {"message": "Thumbnail deleted successfully"}

@api_router.post("/generate")
async def generate_thumbnail(req: GenerateRequest, request: Request, user: dict = Depends(get_current_user)):
    if user["credits"] <= 0:
        raise HTTPException(status_code=402, detail="No credits left")
        
    try:
        # Check if API key is configured
        if not GOOGLE_API_KEY or GOOGLE_API_KEY == "your_google_api_key":
            raise HTTPException(status_code=500, detail="Google API Key not configured in .env")

        def clean_b64(b64_str):
            if "base64," in b64_str:
                return b64_str.split("base64,")[1]
            return b64_str

        async def fetch_image_b64(img_input):
            if img_input.startswith("http"):
                async with httpx.AsyncClient() as client:
                    resp = await client.get(img_input)
                    if resp.status_code == 200:
                        return base64.b64encode(resp.content).decode("utf-8")
            return clean_b64(img_input)

        subject_b64 = await fetch_image_b64(req.subject_image)
        reference_b64 = await fetch_image_b64(req.reference_image)

        # Determine dimensions based on aspect ratio for prompt context
        dimensions = "1280x720 (16:9 landscape)"
        if req.aspect_ratio == "9:16":
            dimensions = "720x1280 (9:16 portrait/vertical)"
        elif req.aspect_ratio == "1:1":
            dimensions = "1024x1024 (1:1 square)"

        # Use Gemini 2.0 Flash for image generation with native image output
        # Create the generation prompt that combines analysis and generation
        generation_prompt = f"""
Generate a professional YouTube thumbnail image based on the following:

SUBJECT IMAGE: [First attached image] - Use this person/object as the main subject. Keep their likeness accurate.

STYLE REFERENCE: [Second attached image] - Match the visual style, lighting, colors, composition and mood of this reference.

USER'S DESCRIPTION: "{req.description}"

TEXT TO INCLUDE ON THUMBNAIL: "{req.thumbnail_text}"
- Render this text prominently on the thumbnail
- Use bold, eye-catching typography
- Make the text highly readable with good contrast
- Position it strategically (top, bottom, or side)

REQUIREMENTS:
- Dimensions: {dimensions}
- Style: Professional YouTube thumbnail with high contrast, vibrant colors
- Appeal: Clickbait-style that grabs attention and maximizes CTR
- Quality: Clean, sharp, studio-quality output
- The main subject should be prominent and recognizable
- Include dramatic lighting and professional composition

Generate the thumbnail image now.
"""

        # Initialize the image generation client
        from google import genai as genai_client
        from google.genai import types
        
        client = genai_client.Client(api_key=GOOGLE_API_KEY)
        
        # Prepare image parts
        subject_image_part = types.Part.from_bytes(
            data=base64.b64decode(subject_b64),
            mime_type="image/png"
        )
        reference_image_part = types.Part.from_bytes(
            data=base64.b64decode(reference_b64),
            mime_type="image/png"
        )
        
        # Generate image using Gemini native image generation
        response = await asyncio.to_thread(
            client.models.generate_content,
            model="gemini-2.0-flash-exp-image-generation",
            contents=[
                generation_prompt,
                subject_image_part,
                reference_image_part
            ],
            config=types.GenerateContentConfig(
                response_modalities=['Image', 'Text']
            )
        )
        
        # Extract the generated image from response
        img_data_b64 = None
        for part in response.candidates[0].content.parts:
            if hasattr(part, 'inline_data') and part.inline_data is not None:
                img_bytes = part.inline_data.data
                img_data_b64 = base64.b64encode(img_bytes).decode("utf-8")
                break
        
        if not img_data_b64:
            # Fallback: Check if there's text response indicating an issue
            text_response = ""
            for part in response.candidates[0].content.parts:
                if hasattr(part, 'text') and part.text:
                    text_response = part.text
            logger.error(f"No image generated. Response: {text_response}")
            raise HTTPException(status_code=500, detail="Failed to generate image. The AI may have declined the request. Please try a different description.")
        
        logger.info("Successfully generated thumbnail with Gemini native image generation")
        
        # 1. Deduct Credit
        await db.users.update_one({"user_id": user["user_id"]}, {"$inc": {"credits": -1}})
        
        # 2. Save image to local storage
        img_filename = f"{uuid.uuid4()}.png"
        img_path = os.path.join("static", "images", img_filename)
        async with aiofiles.open(img_path, "wb") as f:
            await f.write(base64.b64decode(img_data_b64))
        
        # Get the backend URL for serving static files
        backend_url = os.getenv("BACKEND_URL", "http://localhost:8000")
        image_url = f"{backend_url}/api/static/images/{img_filename}"

        # 3. Save to DB
        thumb_id = str(uuid.uuid4())
        thumbnail = {
            "id": thumb_id,
            "user_id": user["user_id"],
            "description": req.description,
            "thumbnail_text": req.thumbnail_text,
            "aspect_ratio": req.aspect_ratio,
            "image_url": image_url,
            "created_at": datetime.now(timezone.utc),
        }
        await db.thumbnails.insert_one(thumbnail)
        
        return {"image": f"data:image/png;base64,{img_data_b64}", "credits": user["credits"] - 1, "image_url": image_url}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# --- PAYU PAYMENTS ---
# Define pricing packs
PACKS = {
    "pack_starter": {"amount": 999, "credits": 50, "name": "Starter Plan (50 Credits)"},
    "pack_creator": {"amount": 2499, "credits": 150, "name": "Creator Plan (150 Credits)"},
    "pack_pro": {"amount": 4999, "credits": 400, "name": "Pro/Agency Plan (400 Credits)"}
}

@api_router.post("/create-checkout-session")
async def create_checkout_session(req: CheckoutRequest, user: dict = Depends(get_current_user)):
    frontend_url = os.getenv('FRONTEND_URL', "http://localhost:3000")
    
    pack = PACKS.get(req.pack_id)
    if not pack:
        raise HTTPException(status_code=400, detail="Invalid pack ID")

    if not PAYU_KEY or not PAYU_SALT:
        # Fallback for testing/dev: Immediately grant credits
        logger.warning("PayU Keys missing. Auto-granting credits for demo mode.")
        await db.users.update_one({"user_id": user["user_id"]}, {"$inc": {"credits": pack["credits"]}})
        return {"url": f"{frontend_url}/dashboard?payment=success", "is_mock": True}

    txnid = f"tx_{uuid.uuid4().hex[:10]}"
    amount = float(pack["amount"])
    amount_str = "{:.2f}".format(amount)
    productinfo = pack["name"]
    firstname = user.get("name", "User").split()[0]
    email = user["email"]
    udf1 = user["user_id"]
    udf2 = req.pack_id
    
    # Hash Order: key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||SALT
    hash_str = f"{PAYU_KEY}|{txnid}|{amount_str}|{productinfo}|{firstname}|{email}|{udf1}|{udf2}|||||||||||{PAYU_SALT}"
    payu_hash = hashlib.sha512(hash_str.encode()).hexdigest()

    backend_url = os.getenv('BACKEND_URL', "https://ai-thumbnail-50sc.onrender.com")
    return {
        "payu_url": PAYU_URL,
        "params": {
            "key": PAYU_KEY,
            "txnid": txnid,
            "amount": amount_str,
            "productinfo": productinfo,
            "firstname": firstname,
            "email": email,
            "phone": "9999999999",
            "surl": f"{backend_url}/api/payu/success",
            "furl": f"{backend_url}/api/payu/failure",
            "hash": payu_hash,
            "service_provider": "payu_paisa",
            "udf1": user["user_id"],
            "udf2": req.pack_id,
            "udf3": "",
            "udf4": "",
            "udf5": ""
        }
    }

@api_router.post("/payu/success")
async def payu_success(request: Request):
    form_data = await request.form()
    # Verify Hash for security (Omitted for brevity - recommended in prod)
    # status = form_data.get("status")
    # txnid = form_data.get("txnid")
    # ... logic to find user/pack and update credits ...
    
    frontend_url = os.getenv('FRONTEND_URL', "http://localhost:3000")
    return Response(content=f"<html><script>window.location.href='{frontend_url}/dashboard?payment=success'</script></html>", media_type="text/html")

@api_router.post("/payu/failure")
async def payu_failure(request: Request):
    frontend_url = os.getenv('FRONTEND_URL', "http://localhost:3000")
    return Response(content=f"<html><script>window.location.href='{frontend_url}/pricing?payment=failed'</script></html>", media_type="text/html")

# --- ADMIN DASHBOARD APIs ---
# Note: These are read at runtime now for easier updates
def get_admin_credentials():
    return (
        os.getenv("ADMIN_EMAIL", "admin@quickthumb.me"),
        os.getenv("ADMIN_PASSWORD", "admin123")
    )

class AdminLoginRequest(BaseModel):
    email: str
    password: str

class DiscountCode(BaseModel):
    code: str
    discount_percent: int
    max_uses: Optional[int] = None
    valid_until: Optional[datetime] = None
    description: Optional[str] = None

async def get_admin_user(request: Request):
    """Verify admin session"""
    try:
        session_id = request.cookies.get("admin_session")
        if not session_id:
            # Fallback to header for cross-domain usage
            session_id = request.headers.get("X-Admin-Token")
            
        if not session_id:
            raise HTTPException(status_code=401, detail="Admin authentication required (No Token)")
        
        session = await db.admin_sessions.find_one({"session_id": session_id})
        if not session:
            logger.warning(f"Invalid Admin Session ID: {session_id}")
            raise HTTPException(status_code=401, detail="Invalid admin session")
        
        # Check if session expired (24 hours)
        if datetime.now(timezone.utc) - session["created_at"] > timedelta(hours=24):
            await db.admin_sessions.delete_one({"session_id": session_id})
            logger.warning(f"Expired Admin Session ID: {session_id}")
            raise HTTPException(status_code=401, detail="Session expired")
        
        # Convert to plain dict to avoid Pydantic issues
        session["_id"] = str(session["_id"]) 
        return session
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Auth Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Auth Error: {str(e)}")

@api_router.post("/admin/login")
async def admin_login(req: AdminLoginRequest, response: Response):
    admin_email, admin_password = get_admin_credentials()
    logger.info(f"Admin login attempt for: {req.email}")
    logger.info(f"Expected admin email: {admin_email}")
    
    if req.email.strip().lower() != admin_email.strip().lower() or req.password != admin_password:
        logger.warning(f"Admin login failed for: {req.email}")
        raise HTTPException(status_code=401, detail="Invalid admin credentials")
    
    session_id = str(uuid.uuid4())
    await db.admin_sessions.insert_one({
        "session_id": session_id,
        "created_at": datetime.now(timezone.utc)
    })
    
    response.set_cookie(
        key="admin_session",
        value=session_id,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=86400  # 24 hours
    )
    
    return {
        "success": True, 
        "message": "Admin logged in successfully",
        "session_id": session_id
    }

@api_router.get("/admin/check")
async def check_admin_session(admin: dict = Depends(get_admin_user)):
    return {"status": "authenticated", "admin_id": admin["session_id"]}

@api_router.post("/admin/logout")
async def admin_logout(response: Response):
    response.delete_cookie("admin_session")
    return {"success": True}

@api_router.get("/admin/stats")
async def get_admin_stats(admin: dict = Depends(get_admin_user)):
    """Get comprehensive dashboard statistics"""
    
    # Total users
    total_users = await db.users.count_documents({})
    
    # Users by signup date (last 30 days)
    thirty_days_ago = datetime.now(timezone.utc) - timedelta(days=30)
    new_users_30d = await db.users.count_documents({"created_at": {"$gte": thirty_days_ago}})
    
    # Total thumbnails generated
    total_thumbnails = await db.thumbnails.count_documents({})
    
    # Thumbnails generated today
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    thumbnails_today = await db.thumbnails.count_documents({"created_at": {"$gte": today_start}})
    
    # Total transactions
    total_transactions = await db.transactions.count_documents({})
    successful_transactions = await db.transactions.count_documents({"status": "success"})
    
    # Revenue calculation
    revenue_pipeline = [
        {"$match": {"status": "success"}},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
    ]
    revenue_result = await db.transactions.aggregate(revenue_pipeline).to_list(1)
    total_revenue = revenue_result[0]["total"] if revenue_result else 0
    
    # Active discount codes
    active_discounts = await db.discount_codes.count_documents({"is_active": True})
    
    # Users with paid plans (credits > 5, assuming 5 is free tier)
    paid_users = await db.users.count_documents({"credits": {"$gt": 5}})
    
    # Users by credit range
    free_tier_users = await db.users.count_documents({"credits": {"$lte": 5}})
    
    return {
        "total_users": total_users,
        "new_users_30d": new_users_30d,
        "total_thumbnails": total_thumbnails,
        "thumbnails_today": thumbnails_today,
        "total_transactions": total_transactions,
        "successful_transactions": successful_transactions,
        "total_revenue": total_revenue,
        "active_discounts": active_discounts,
        "paid_users": paid_users,
        "free_tier_users": free_tier_users
    }

@api_router.get("/admin/users")
async def get_all_users(
    admin: dict = Depends(get_admin_user),
    page: int = 1,
    limit: int = 20,
    search: Optional[str] = None
):
    """Get all users with pagination and search"""
    skip = (page - 1) * limit
    
    query = {}
    if search:
        query = {
            "$or": [
                {"email": {"$regex": search, "$options": "i"}},
                {"name": {"$regex": search, "$options": "i"}}
            ]
        }
    
    total = await db.users.count_documents(query)
    users_cursor = db.users.find(query).sort("created_at", -1).skip(skip).limit(limit)
    users = await users_cursor.to_list(limit)
    
    # Get thumbnail count for each user
    user_list = []
    for user in users:
        thumb_count = await db.thumbnails.count_documents({"user_id": user["user_id"]})
        user_list.append({
            "user_id": user["user_id"],
            "email": user["email"],
            "name": user["name"],
            "credits": user.get("credits", 0),
            "created_at": user["created_at"].isoformat() if user.get("created_at") else None,
            "thumbnail_count": thumb_count
        })
    
    return {
        "users": user_list,
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit
    }

@api_router.get("/admin/user/{user_id}")
async def get_user_details(user_id: str, admin: dict = Depends(get_admin_user)):
    """Get detailed info about a specific user"""
    user = await db.users.find_one({"user_id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    thumbnails = await db.thumbnails.find({"user_id": user_id}).sort("created_at", -1).to_list(50)
    transactions = await db.transactions.find({"user_id": user_id}).sort("created_at", -1).to_list(20)
    
    return {
        "user": {
            "user_id": user["user_id"],
            "email": user["email"],
            "name": user["name"],
            "credits": user.get("credits", 0),
            "created_at": user["created_at"].isoformat() if user.get("created_at") else None
        },
        "thumbnails": [{
            "id": t["id"],
            "description": t.get("description", ""),
            "image_url": t.get("image_url", ""),
            "created_at": t["created_at"].isoformat() if t.get("created_at") else None
        } for t in thumbnails],
        "transactions": [{
            "txn_id": t.get("txn_id", ""),
            "amount": t.get("amount", 0),
            "status": t.get("status", ""),
            "pack_id": t.get("pack_id", ""),
            "created_at": t["created_at"].isoformat() if t.get("created_at") else None
        } for t in transactions]
    }

@api_router.post("/admin/user/{user_id}/add-credits")
async def add_user_credits(user_id: str, credits: int, admin: dict = Depends(get_admin_user)):
    """Add credits to a user account"""
    result = await db.users.update_one(
        {"user_id": user_id},
        {"$inc": {"credits": credits}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"success": True, "message": f"Added {credits} credits to user"}

# Discount Codes Management
@api_router.get("/admin/discounts")
async def get_discount_codes(admin: dict = Depends(get_admin_user)):
    """Get all discount codes"""
    discounts = await db.discount_codes.find().sort("created_at", -1).to_list(100)
    return [{
        "id": str(d["_id"]),
        "code": d["code"],
        "discount_percent": d["discount_percent"],
        "max_uses": d.get("max_uses"),
        "uses": d.get("uses", 0),
        "valid_until": d["valid_until"].isoformat() if d.get("valid_until") else None,
        "description": d.get("description", ""),
        "is_active": d.get("is_active", True),
        "created_at": d["created_at"].isoformat() if d.get("created_at") else None
    } for d in discounts]

@api_router.post("/admin/discounts")
async def create_discount_code(discount: DiscountCode, admin: dict = Depends(get_admin_user)):
    """Create a new discount code"""
    existing = await db.discount_codes.find_one({"code": discount.code.upper()})
    if existing:
        raise HTTPException(status_code=400, detail="Discount code already exists")
    
    await db.discount_codes.insert_one({
        "code": discount.code.upper(),
        "discount_percent": discount.discount_percent,
        "max_uses": discount.max_uses,
        "uses": 0,
        "valid_until": discount.valid_until,
        "description": discount.description,
        "is_active": True,
        "created_at": datetime.now(timezone.utc)
    })
    
    return {"success": True, "message": "Discount code created"}

@api_router.delete("/admin/discounts/{code}")
async def delete_discount_code(code: str, admin: dict = Depends(get_admin_user)):
    """Delete a discount code"""
    result = await db.discount_codes.delete_one({"code": code.upper()})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Discount code not found")
    return {"success": True}

@api_router.patch("/admin/discounts/{code}/toggle")
async def toggle_discount_code(code: str, admin: dict = Depends(get_admin_user)):
    """Toggle discount code active status"""
    discount = await db.discount_codes.find_one({"code": code.upper()})
    if not discount:
        raise HTTPException(status_code=404, detail="Discount code not found")
    
    new_status = not discount.get("is_active", True)
    await db.discount_codes.update_one(
        {"code": code.upper()},
        {"$set": {"is_active": new_status}}
    )
    return {"success": True, "is_active": new_status}

@api_router.get("/admin/transactions")
async def get_transactions(
    admin: dict = Depends(get_admin_user),
    page: int = 1,
    limit: int = 20
):
    """Get recent transactions"""
    skip = (page - 1) * limit
    total = await db.transactions.count_documents({})
    
    transactions = await db.transactions.find().sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    
    return {
        "transactions": [{
            "txn_id": t.get("txn_id", ""),
            "user_id": t.get("user_id", ""),
            "email": t.get("email", ""),
            "amount": t.get("amount", 0),
            "status": t.get("status", ""),
            "pack_id": t.get("pack_id", ""),
            "created_at": t["created_at"].isoformat() if t.get("created_at") else None
        } for t in transactions],
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit
    }

@api_router.get("/admin/analytics/signups")
async def get_signup_analytics(admin: dict = Depends(get_admin_user)):
    """Get signup trends for the last 30 days"""
    thirty_days_ago = datetime.now(timezone.utc) - timedelta(days=30)
    
    pipeline = [
        {"$match": {"created_at": {"$gte": thirty_days_ago}}},
        {"$group": {
            "_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$created_at"}},
            "count": {"$sum": 1}
        }},
        {"$sort": {"_id": 1}}
    ]
    
    result = await db.users.aggregate(pipeline).to_list(30)
    return [{"date": r["_id"], "signups": r["count"]} for r in result]

@api_router.get("/admin/analytics/thumbnails")
async def get_thumbnail_analytics(admin: dict = Depends(get_admin_user)):
    """Get thumbnail generation trends for the last 30 days"""
    thirty_days_ago = datetime.now(timezone.utc) - timedelta(days=30)
    
    pipeline = [
        {"$match": {"created_at": {"$gte": thirty_days_ago}}},
        {"$group": {
            "_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$created_at"}},
            "count": {"$sum": 1}
        }},
        {"$sort": {"_id": 1}}
    ]
    
    result = await db.thumbnails.aggregate(pipeline).to_list(30)
    return [{"date": r["_id"], "thumbnails": r["count"]} for r in result]

@api_router.get("/admin/check")
async def check_admin_session(admin: dict = Depends(get_admin_user)):
    """Check if admin session is valid"""
    return {"authenticated": True}

app.include_router(api_router)

