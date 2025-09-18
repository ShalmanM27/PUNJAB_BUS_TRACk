import os
from motor.motor_asyncio import AsyncIOMotorClient
from web3 import Web3
from dotenv import load_dotenv

load_dotenv()  # Load environment variables from .env

# ---------------- MongoDB ----------------
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "punjab_bus_tracking")

client = AsyncIOMotorClient(MONGODB_URI)
db = client[MONGO_DB_NAME]

# ---------------- Web3 / Blockchain ----------------
RPC_URL = os.getenv("RPC_URL")
CONTRACT_ADDRESS = os.getenv("CONTRACT_ADDRESS")
ACCOUNT_ADDRESS = os.getenv("ACCOUNT_ADDRESS")
PRIVATE_KEY = os.getenv("PRIVATE_KEY")

if not RPC_URL:
    raise RuntimeError("RPC_URL must be set in environment variables")

w3 = Web3(Web3.HTTPProvider(RPC_URL))

if not w3.is_connected():
    raise RuntimeError(f"Could not connect to RPC at {RPC_URL}")

if not CONTRACT_ADDRESS:
    raise RuntimeError("CONTRACT_ADDRESS must be set in environment variables")

if not Web3.is_address(CONTRACT_ADDRESS):
    raise RuntimeError(f"CONTRACT_ADDRESS {CONTRACT_ADDRESS} is not a valid address")

CONTRACT_ADDRESS_CHECKSUM = Web3.to_checksum_address(CONTRACT_ADDRESS)

# Optional: checksum account address if provided
ACCOUNT_ADDRESS_CHECKSUM = None
if ACCOUNT_ADDRESS:
    if not Web3.is_address(ACCOUNT_ADDRESS):
        raise RuntimeError("ACCOUNT_ADDRESS is not a valid address")
    ACCOUNT_ADDRESS_CHECKSUM = Web3.to_checksum_address(ACCOUNT_ADDRESS)

# Load ABI
import json
ABI_PATH = os.path.join(os.path.dirname(__file__), "abi.json")
if not os.path.exists(ABI_PATH):
    raise RuntimeError(f"ABI file not found at {ABI_PATH}")

with open(ABI_PATH, "r", encoding="utf-8") as f:
    ABI = json.load(f)

contract = w3.eth.contract(address=CONTRACT_ADDRESS_CHECKSUM, abi=ABI)
