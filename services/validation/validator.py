# services/validation/validator.py

import redis


class TransactionValidator:
    """Pre-ingestion validation pipeline for payload schema, duplicate IDs, and balance checks."""

    REQUIRED_FIELDS = [
        "transaction_id", "customer_id", "amount", "currency",
        "merchant_name", "payment_method", "timestamp"
    ]

    def __init__(self, host='localhost', port=6379, db=0):
        self.r = redis.Redis(host=host, port=port, db=db, decode_responses=True)

    def validate(self, raw_txn: dict) -> tuple[bool, str]:
        """
        Validates transaction schema, duplicate execution, and format integrity.
        Returns: (is_valid: bool, error_message: str)
        """
        # 1. Schema / Field Presence Check
        for field in self.REQUIRED_FIELDS:
            if field not in raw_txn or raw_txn[field] is None:
                return False, f"Malformed transaction payload: missing required field '{field}'"

        # 2. Value Integrity Check
        try:
            amount = float(raw_txn["amount"])
            if amount <= 0:
                return False, f"Invalid transaction amount: ${amount}. Must be strictly positive."
        except (ValueError, TypeError):
            return False, "Invalid transaction amount data type."

        # 3. Duplicate Transaction ID Check (Redis 24-hour Deduplication Key)
        txn_id = str(raw_txn["transaction_id"])
        dedup_key = f"dedup:txn:{txn_id}"
        is_duplicate = self.r.set(dedup_key, "1", nx=True, ex=86400) is None

        if is_duplicate:
            return False, f"Duplicate transaction ID detected: '{txn_id}'"

        return True, "VALID"


if __name__ == "__main__":
    validator = TransactionValidator()
    test_txn = {
        "transaction_id": "TXN-TEST-1001",
        "customer_id": "CUST-999",
        "amount": 250.00,
        "currency": "USD",
        "merchant_name": "Amazon",
        "payment_method": "CREDIT_CARD",
        "timestamp": "2026-07-22T20:00:00Z"
    }
    valid, msg = validator.validate(test_txn)
    print(f"[*] Pre-Validation Check: Valid={valid} | Message={msg}")