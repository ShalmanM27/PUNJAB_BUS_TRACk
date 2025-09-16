from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "punjab_bus_tracking")

client = AsyncIOMotorClient(MONGO_URI)
db = client[DB_NAME]
