import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.getenv("MONGO_URL")
DB_NAME = os.getenv("DB_NAME", "ai_thumb")

async def add_credits(email, credits):
    print(f"Connecting to {MONGO_URL}...")
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    user = await db.users.find_one({"email": email})
    if not user:
        print(f"User {email} not found!")
        return

    print(f"Found user: {user['name']} (Current credits: {user.get('credits', 0)})")
    
    result = await db.users.update_one(
        {"email": email},
        {"$inc": {"credits": credits}}
    )
    
    if result.modified_count > 0:
        new_user = await db.users.find_one({"email": email})
        print(f"Successfully added {credits} credits.")
        print(f"New balance: {new_user['credits']}")
    else:
        print("No changes made.")

if __name__ == "__main__":
    email = "gulshan850@gmail.com"
    credits_to_add = 50 # Assuming Starter Plan (999)
    asyncio.run(add_credits(email, credits_to_add))
