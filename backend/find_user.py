import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

async def run():
    client = AsyncIOMotorClient(os.getenv("MONGO_URL"))
    db = client[os.getenv("DB_NAME")]
    user = await db.users.find_one()
    if user:
        print(f"USER_EMAIL={user['email']}")
    else:
        print("NO_USER_FOUND")

if __name__ == "__main__":
    asyncio.run(run())
