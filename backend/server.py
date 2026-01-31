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
origins = ["http://localhost:3000", "https://ai-thumbnail-phi.vercel.app"] # Base fallbacks

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
    allow_headers=["*"],
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

app.include_router(api_router)
