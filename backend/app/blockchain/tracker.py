# backend/app/blockchain/tracker.py
from web3 import Web3
from web3.exceptions import ContractLogicError
from .config import w3, contract, ACCOUNT_ADDRESS, PRIVATE_KEY
import time

def record_assignment(bus_id: str, source: str, destination: str, driver_id: str, timestamp: int):
    fn = contract.functions.recordAssignment(bus_id, source, destination, driver_id, timestamp)

    # Estimate gas
    try:
        gas_estimate = fn.estimate_gas({"from": ACCOUNT_ADDRESS})
    except Exception:
        gas_estimate = 300000

    nonce = w3.eth.get_transaction_count(ACCOUNT_ADDRESS, "pending")

    tx = fn.build_transaction({
        "from": ACCOUNT_ADDRESS,
        "nonce": nonce,
        "gas": gas_estimate,
        "gasPrice": w3.eth.gas_price,
        "chainId": 1043  # Adjust if needed for blockdag
    })

    signed_tx = w3.eth.account.sign_transaction(tx, private_key=PRIVATE_KEY)
    tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)

    # Wait for receipt optionally here or outside the function
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=180)

    return {
        "tx_hash": tx_hash.hex(),
        "status": receipt.status,
        "block_number": receipt.blockNumber
    }
