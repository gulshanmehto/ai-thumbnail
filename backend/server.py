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
    description: str = "" # Optional now, as we use structured inputs
    thumbnail_text: str
    aspect_ratio: str
    subject_image: str
    reference_image: Optional[str] = None # Optional if using preset
    # New Structured Inputs
    image_type: str = "face" # face, faceless
    crop_type: str = "close-up" # close-up, half-body
    style_mode: str = "upload" # upload, preset
    style_preset: Optional[str] = None
    intent: str = "viral" # viral, emotional, educational, etc.
    expression_level: str = "medium" # subtle, medium, extreme

# Style Presets Configuration
STYLE_PRESETS = {
    "MrBeast Style": "High saturation, bright lighting, vibrant background, hyper-realistic, high energy, sharp focus, 'MrBeast' aesthetic",
    "Podcast Style": "Professional studio lighting, dark bokeh background, serious/thoughtful tone, high contrast, cinematic depth of field",
    "Bollywood Reaction": "Dramatic lighting, high contrast, emotional intensity, vibrant colors, expressive, cinematic styling",
    "Education Clean": "Bright, clean white/gradient background, organized composition, minimalist, approachable and professional",
    "Meme Thumbnail": "Impact font style, deep fried visuals (optional), exaggerated features, internet culture aesthetic, high contrast",
    "Brand Clean": "Corporate memphis influence, clean lines, solid colors, professional, trustworthy, minimalist"
}

# Intent Mappings
INTENT_PROMPTS = {
    "viral": "Clickbait style, high curiosity gap, vibrant colors, maximum visual impact, extreme clarity",
    "emotional": "Moody lighting, dramatic shadows, focus on facial connection, cinematic color grading",
    "educational": "Clear focus, balanced composition, bright and approachable, trustworthiness",
    "podcast": "Intimate setting, depth of field, focus on speaker looking at camera, professional vibe",
    "faceless": "Focus on object/text, mystery, illustrative or photographic composition, strong visual storytelling",
    "brand": "Consistent lighting, clean aesthetic, professional presentation"
}

# Expression Mappings
EXPRESSION_PROMPTS = {
    "subtle": "Neutral expression, slight smile, relaxed features, approachable look, natural eye contact",
    "medium": "Engaging expression, eyes slightly wide, mouth slightly open (if talking), active engagement",
    "extreme": "Shocked face, jaw drop, eyes popping out, extreme contouring, high contrast lighting, exaggerated reaction"
}

# --- AUTHENTICATION MODULES (Restored) ---

class SignupRequest(BaseModel):
    email: EmailStr
    password: str
    name: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

async def get_current_user(request: Request):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        # Check cookie as fallback
        cookie_token = request.cookies.get("session_token")
        if cookie_token:
            auth_header = f"Bearer {cookie_token}"
        else:
            raise HTTPException(status_code=401, detail="Not authenticated")
    
    token = auth_header.split(" ")[1] if auth_header.startswith("Bearer ") else auth_header
    
    session = await db.sessions.find_one({"session_token": token})
    if not session:
        raise HTTPException(status_code=401, detail="Invalid session")
        
    user = await db.users.find_one({"user_id": session["user_id"]})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
        
    return user

@api_router.post("/auth/signup")
async def signup(req: SignupRequest):
    if await db.users.find_one({"email": req.email}):
        raise HTTPException(status_code=400, detail="Email already registered")
        
    user_id = str(uuid.uuid4())
    hashed = get_password_hash(req.password)
    
    user_doc = {
        "user_id": user_id,
        "email": req.email,
        "name": req.name,
        "password": hashed,
        "credits": 5,
        "created_at": datetime.now(timezone.utc),
        "picture": f"https://api.dicebear.com/7.x/avataaars/svg?seed={req.name}"
    }
    await db.users.insert_one(user_doc)
    
    token = str(uuid.uuid4())
    await db.sessions.insert_one({
        "session_token": token,
        "user_id": user_id,
        "created_at": datetime.now(timezone.utc)
    })
    
    u_resp = user_doc.copy()
    if "password" in u_resp: del u_resp["password"]
    if "_id" in u_resp: u_resp["_id"] = str(u_resp["_id"])
    
    return {"session_token": token, "user": u_resp}

@api_router.post("/auth/login")
async def login(req: LoginRequest):
    user = await db.users.find_one({"email": req.email})
    if not user or not verify_password(req.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
        
    token = str(uuid.uuid4())
    await db.sessions.insert_one({
        "session_token": token,
        "user_id": user["user_id"],
        "created_at": datetime.now(timezone.utc)
    })
    
    u_resp = user.copy()
    if "password" in u_resp: del u_resp["password"]
    if "_id" in u_resp: u_resp["_id"] = str(u_resp["_id"])
    
    return {"session_token": token, "user": u_resp}

@api_router.get("/auth/me")
async def get_me(user: dict = Depends(get_current_user)):
    u_resp = user.copy()
    if "password" in u_resp: del u_resp["password"]
    if "_id" in u_resp: u_resp["_id"] = str(u_resp["_id"])
    return u_resp

@api_router.post("/auth/logout")
async def logout(request: Request):
    auth_header = request.headers.get("Authorization")
    if auth_header and "Bearer " in auth_header:
        token = auth_header.split(" ")[1]
        await db.sessions.delete_one({"session_token": token})
    return {"status": "ok"}

@api_router.post("/generate")
async def generate_thumbnail(req: GenerateRequest, request: Request, user: dict = Depends(get_current_user)):
    if user["credits"] <= 0:
        raise HTTPException(status_code=402, detail="No credits left")
        
    try:
        if not GOOGLE_API_KEY or GOOGLE_API_KEY == "your_google_api_key":
            raise HTTPException(status_code=500, detail="Google API Key not configured")

        def clean_b64(b64_str):
            if not b64_str: return None
            if "base64," in b64_str:
                return b64_str.split("base64,")[1]
            return b64_str

        async def fetch_image_b64(img_input):
            if not img_input: return None
            if img_input.startswith("http"):
                async with httpx.AsyncClient() as client:
                    resp = await client.get(img_input)
                    if resp.status_code == 200:
                        return base64.b64encode(resp.content).decode("utf-8")
            return clean_b64(img_input)

        subject_b64 = await fetch_image_b64(req.subject_image)
        # Reference is optional now (if preset used)
        reference_b64 = await fetch_image_b64(req.reference_image) if req.reference_image else None

        # Build Prompt (Simplified Workflow)
        generation_prompt = f"""
Create a high-quality YouTube thumbnail.

Task:
1. Use the SUBJECT from the first image provided. Keep their likeness/appearance.
2. Use the STYLE and COMPOSITION from the second image provided (Reference).
3. The thumbnail aspect ratio must be {req.aspect_ratio}.
4. The overall scene description is: "{req.description}".
5. IMPORTANT: You MUST BAKE the following text into the image clearly and professionally: "{req.thumbnail_text}".

Make it eye-catching, high contrast, and professional.
"""

        # Initialize client
        from google import genai as genai_client
        from google.genai import types
        
        client = genai_client.Client(api_key=GOOGLE_API_KEY)
        
        # Prepare inputs list
        contents_payload = [generation_prompt]
        
        # Add subject image
        if subject_b64:
             contents_payload.append(types.Part.from_bytes(data=base64.b64decode(subject_b64), mime_type="image/png"))
        
        # Add reference image IF available
        if reference_b64:
             contents_payload.append(types.Part.from_bytes(data=base64.b64decode(reference_b64), mime_type="image/png"))

        # Generate
        response = await asyncio.to_thread(
            client.models.generate_content,
            model="gemini-3-pro-image-preview",
            contents=contents_payload,
            config=types.GenerateContentConfig(response_modalities=['Image', 'Text'])
        )
        
        # ... [Rest of image processing logic logic matches original] ... (Extracting image, saving, etc)
        img_data_b64 = None
        for part in response.candidates[0].content.parts:
            if hasattr(part, 'inline_data') and part.inline_data is not None:
                img_bytes = part.inline_data.data
                img_data_b64 = base64.b64encode(img_bytes).decode("utf-8")
                break
        
        if not img_data_b64:
            text_response = ""
            for part in response.candidates[0].content.parts:
                if hasattr(part, 'text') and part.text:
                    text_response = part.text
            logger.error(f"No image generated. Response: {text_response}")
            raise HTTPException(status_code=500, detail="Failed to generate image. The AI declined the request.")
        
        logger.info("Successfully generated thumbnail with Gemini native image generation")
        
        # 1. Deduct Credit
        await db.users.update_one({"user_id": user["user_id"]}, {"$inc": {"credits": -1}})
        
        # 2. Save image
        img_filename = f"{uuid.uuid4()}.png"
        img_path = os.path.join("static", "images", img_filename)
        async with aiofiles.open(img_path, "wb") as f:
            await f.write(base64.b64decode(img_data_b64))
        
        backend_url = os.getenv("BACKEND_URL", "http://localhost:8000")
        image_url = f"{backend_url}/api/static/images/{img_filename}"

        # 3. Save to DB
        thumb_id = str(uuid.uuid4())
        thumbnail = {
            "id": thumb_id,
            "user_id": user["user_id"],
            "description": req.description, # Keep strict prompt hidden, save user intent
            "thumbnail_text": req.thumbnail_text,
            "aspect_ratio": req.aspect_ratio,
            "image_url": image_url,
            "created_at": datetime.now(timezone.utc),
            "meta": { # Save new metadata for future reference
                "intent": req.intent,
                "style_mode": req.style_mode,
                "style_preset": req.style_preset
            }
        }
        await db.thumbnails.insert_one(thumbnail)
        
        return {"image": f"data:image/png;base64,{img_data_b64}", "credits": user["credits"] - 1, "image_url": image_url}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# --- PAYU PAYMENTS ---
class CheckoutRequest(BaseModel):
    pack_id: str

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
    
    # Hash Order: key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5|udf6|udf7|udf8|udf9|udf10|SALT
    hash_params = [
        PAYU_KEY,
        txnid,
        amount_str,
        productinfo,
        firstname,
        email,
        udf1,
        udf2,
        "", "", "", "", "", "", "", "", # udf3 to udf10
        PAYU_SALT
    ]
    hash_str = "|".join(hash_params)
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
        
        # Safe timezone handling
        created_at = session["created_at"]
        if created_at.tzinfo is None:
            created_at = created_at.replace(tzinfo=timezone.utc)
            
        # Check if session expired (24 hours)
        if datetime.now(timezone.utc) - created_at > timedelta(hours=24):
            await db.admin_sessions.delete_one({"session_id": session_id})
            logger.warning(f"Expired Admin Session ID: {session_id}")
            raise HTTPException(status_code=401, detail="Session expired")
        
        # Safe Conversion: Ensure this is a clean dict for FastAPI
        safe_session = {
            "session_id": session["session_id"],
            "created_at": created_at,
            "id": str(session["_id"]) if "_id" in session else None
        }
        return safe_session
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Auth Error: {str(e)}")
        # Return a 401 instead of 500 so frontend handles it better
        raise HTTPException(status_code=401, detail=f"Auth Error: {str(e)}")

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
    return {"status": "authenticated", "admin_id": admin.get("session_id")}

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

# --- USER THUMBNAIL MANAGEMENT ---

@api_router.get("/thumbnails")
async def get_user_thumbnails(user: dict = Depends(get_current_user)):
    """Fetch all thumbnails generated by the current user"""
    thumbnails = await db.thumbnails.find({"user_id": user["user_id"]}).sort("created_at", -1).to_list(100)
    
    # helper for json serialization
    results = []
    for t in thumbnails:
        t_out = t.copy()
        t_out["id"] = t.get("id", str(t["_id"])) if "id" in t else str(t["_id"])
        if "_id" in t_out: del t_out["_id"]
        results.append(t_out)
        
    return results

@api_router.delete("/thumbnails/{thumb_id}")
async def delete_thumbnail(thumb_id: str, user: dict = Depends(get_current_user)):
    """Delete a specific thumbnail"""
    result = await db.thumbnails.delete_one({"id": thumb_id, "user_id": user["user_id"]})
    if result.deleted_count == 0:
        # Try matching by _id if id not found (legacy)
        try:
             from bson import ObjectId
             if ObjectId.is_valid(thumb_id):
                 result = await db.thumbnails.delete_one({"_id": ObjectId(thumb_id), "user_id": user["user_id"]})
        except:
             pass
             
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Thumbnail not found or unauthorized")
        
    return {"success": True}

app.include_router(api_router)

