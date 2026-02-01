import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from datetime import datetime, timezone

load_dotenv()

MONGO_URL = os.getenv("MONGO_URL")
DB_NAME = os.getenv("DB_NAME", "ai_thumb")

async def insert_missing_transaction():
    print(f"Connecting to {MONGO_URL}...")
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    # Transaction Details from User's Screenshot
    txn_data = {
        "txn_id": "27099032534", # PayU ID
        "user_id": "unknown_will_fetch",
        "email": "gulshan850@gmail.com",
        "amount": 9.99,
        "status": "success",
        "pack_id": "pack_starter_monthly", # inferred from 9.99 price (likely test pricing or partial)
        "pack_name": "Starter Plan (Monthly) - Manual Restore",
        "credits_added": 50,
        "coupon_code": None,
        "created_at": datetime.now(timezone.utc) # Using current time, or could parse specific time
    }

    # 1. Find User ID
    user = await db.users.find_one({"email": txn_data["email"]})
    if not user:
        print(f"User {txn_data['email']} not found! Cannot link transaction.")
        return

    txn_data["user_id"] = user["user_id"]
    
    # 2. Check if already exists
    existing = await db.transactions.find_one({"txn_id": txn_data["txn_id"]})
    if existing:
        print(f"Transaction {txn_data['txn_id']} already exists in DB.")
        return

    # 3. Insert
    await db.transactions.insert_one(txn_data)
    print(f"Successfully inserted missing transaction {txn_data['txn_id']} for {txn_data['email']}")
    
    # 4. Optional: Ensure credits were added (Double check)
    # The previous script might have added them, but let's just log the current balance
    print(f"User current balance: {user.get('credits', 0)}")

if __name__ == "__main__":
    asyncio.run(insert_missing_transaction())
