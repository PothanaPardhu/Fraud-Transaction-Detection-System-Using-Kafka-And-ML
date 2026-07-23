# services/simulator/generator.py

import uuid
import random
from datetime import datetime, timezone

PAYMENT_METHODS = ['UPI', 'CREDIT_CARD', 'DEBIT_CARD', 'ATM', 'POS', 'NET_BANKING', 'WALLET']
CHANNELS = ['MOBILE', 'WEB', 'ATM', 'POS']

MERCHANTS = [
    {"name": "Amazon Online", "category": "E-COMMERCE", "risk": "LOW"},
    {"name": "Uber Rides", "category": "TRANSPORT", "risk": "LOW"},
    {"name": "Starbucks Coffee", "category": "DINING", "risk": "LOW"},
    {"name": "CryptoExchange X", "category": "CRYPTO", "risk": "HIGH"},
    {"name": "Global Casino Ltd", "category": "GAMBLING", "risk": "CRITICAL"},
]

CITIES_LOCATIONS = [
    {"city": "New York", "country": "USA", "lat": 40.7128, "lon": -74.0060},
    {"city": "London", "country": "UK", "lat": 51.5074, "lon": -0.1278},
    {"city": "Mumbai", "country": "INDIA", "lat": 19.0760, "lon": 72.8777},
    {"city": "Tokyo", "country": "JAPAN", "lat": 35.6762, "lon": 139.6503},
    {"city": "Moscow", "country": "RUSSIA", "lat": 55.7558, "lon": 37.6173},
]

DEVICES = [
    {"os": "iOS 17.4", "browser": "Safari 17.2", "network": "5G"},
    {"os": "Android 14", "browser": "Chrome 122", "network": "4G"},
    {"os": "Windows 11", "browser": "Edge 121", "network": "FIBER"},
]


class TransactionGenerator:
    """Generates synthetic bank transaction payloads."""

    @staticmethod
    def generate_transaction(is_fraud_scenario: bool = False) -> dict:
        txn_id = f"TXN-{uuid.uuid4().hex[:12].upper()}"
        cust_id = f"CUST-{random.randint(10000, 99999)}"
        merchant = random.choice(MERCHANTS)
        loc = random.choice(CITIES_LOCATIONS)
        device = random.choice(DEVICES)
        payment_method = random.choice(PAYMENT_METHODS)

        amount = round(random.uniform(5.0, 450.0), 2)
        previous_fraud_count = 0
        card_present = payment_method in ['ATM', 'POS']

        if is_fraud_scenario:
            fraud_type = random.choice(['HIGH_AMOUNT', 'CRITICAL_MERCHANT', 'HIGH_RISK_GEO'])
            if fraud_type == 'HIGH_AMOUNT':
                amount = round(random.uniform(9500.0, 50000.0), 2)
            elif fraud_type == 'CRITICAL_MERCHANT':
                merchant = {"name": "Global Casino Ltd", "category": "GAMBLING", "risk": "CRITICAL"}
                amount = round(random.uniform(3000.0, 15000.0), 2)
            elif fraud_type == 'HIGH_RISK_GEO':
                loc = {"city": "Moscow", "country": "RUSSIA", "lat": 55.7558, "lon": 37.6173}
                previous_fraud_count = random.randint(1, 3)

        return {
            "transaction_id": txn_id,
            "customer_id": cust_id,
            "sender_account": f"ACC-{random.randint(10000000, 99999999)}",
            "receiver_account": f"ACC-{random.randint(10000000, 99999999)}",
            "amount": amount,
            "currency": "USD",
            "merchant_name": merchant["name"],
            "merchant_category": merchant["category"],
            "merchant_risk_level": merchant["risk"],
            "payment_method": payment_method,
            "channel": random.choice(CHANNELS),
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "card_present": card_present,
            "latitude": loc["lat"],
            "longitude": loc["lon"],
            "country": loc["country"],
            "city": loc["city"],
            "device_id": f"DEV-{uuid.uuid4().hex[:8].upper()}",
            "browser": device["browser"],
            "operating_system": device["os"],
            "ip_address": f"{random.randint(1, 254)}.{random.randint(0, 255)}.{random.randint(0, 255)}.{random.randint(1, 254)}",
            "network_type": device["network"],
            "account_age_days": random.randint(10, 1500),
            "daily_spending_so_far": round(random.uniform(20.0, 800.0), 2),
            "previous_fraud_count": previous_fraud_count,
        }