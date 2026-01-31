from motor.motor_asyncio import AsyncIOMotorClient
import asyncio
import os
from dotenv import load_dotenv

load_dotenv()

async def check():
    url = os.getenv("MONGO_URL")
    print(f"Connecting to {url.split('@')[-1]}...")
    client = AsyncIOMotorClient(url)
    try:
        # The ismaster command is cheap and does not require auth.
        await client.admin.command('ismaster')
        print("MongoDB Connection: SUCCESS")
        db = client[os.getenv("DB_NAME", "ai_thumb")]
        collections = await db.list_collection_names()
        print(f"Collections in {db.name}: {collections}")
    except Exception as e:
        print(f"MongoDB Connection: FAILED\nError: {e}")

if __name__ == "__main__":
    asyncio.run(check())
