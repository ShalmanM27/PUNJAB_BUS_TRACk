# backend/app/blockchain/config.py
import os
import json
from web3 import Web3
from dotenv import load_dotenv

load_dotenv()

RPC_URL = os.getenv("RPC_URL")
CONTRACT_ADDRESS = os.getenv("CONTRACT_ADDRESS")
ACCOUNT_ADDRESS = os.getenv("ACCOUNT_ADDRESS")
PRIVATE_KEY = os.getenv("PRIVATE_KEY")

w3 = Web3(Web3.HTTPProvider(RPC_URL))

if not w3.is_connected():
    raise RuntimeError(f"Could not connect to RPC at {RPC_URL}")

if not CONTRACT_ADDRESS or not Web3.is_address(CONTRACT_ADDRESS):
    raise RuntimeError("Invalid or missing CONTRACT_ADDRESS")

CONTRACT_ADDRESS = Web3.to_checksum_address(CONTRACT_ADDRESS)

if not ACCOUNT_ADDRESS or not Web3.is_address(ACCOUNT_ADDRESS):
    raise RuntimeError("Invalid or missing ACCOUNT_ADDRESS")

ACCOUNT_ADDRESS = Web3.to_checksum_address(ACCOUNT_ADDRESS)

ABI_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "abi.json")
if not os.path.exists(ABI_PATH):
    raise RuntimeError("ABI file not found at {}".format(ABI_PATH))

with open(ABI_PATH, "r") as f:
    ABI = json.load(f)

contract = w3.eth.contract(address=CONTRACT_ADDRESS, abi=ABI)
