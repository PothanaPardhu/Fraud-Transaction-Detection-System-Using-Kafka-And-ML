# services/simulator/stream_producer.py

import json
import time
import random
from generator import TransactionGenerator

try:
    from kafka import KafkaProducer
    KAFKA_AVAILABLE = True
except ImportError:
    KAFKA_AVAILABLE = False


def run_simulator(topic_name: str = "incoming-transactions", bootstrap_servers: str = "localhost:9092", tps: int = 2):
    producer = None
    if KAFKA_AVAILABLE:
        try:
            producer = KafkaProducer(
                bootstrap_servers=bootstrap_servers,
                value_serializer=lambda v: json.dumps(v).encode('utf-8'),
                acks='all',
                retries=3
            )
            print(f"[*] Connected to Kafka Broker at {bootstrap_servers}")
        except Exception:
            print("[!] Kafka Broker connection not active. Operating in Local Console Simulation Mode...")
    else:
        print("[!] kafka-python not installed. Operating in Local Console Simulation Mode...")

    print(f"[*] Starting Transaction Streamer for topic: '{topic_name}' @ ~{tps} TPS...")
    print("Press Ctrl+C to stop.\n" + "-" * 60)

    count = 0
    try:
        while True:
            is_fraud = random.random() < 0.15
            txn = TransactionGenerator.generate_transaction(is_fraud_scenario=is_fraud)
            count += 1

            if producer:
                producer.send(topic_name, value=txn)
                producer.flush()
                print(f"[{count}] [KAFKA PUSH] Txn: {txn['transaction_id']} | Amount: ${txn['amount']} | FraudScenario: {is_fraud}")
            else:
                print(f"[{count}] [CONSOLE STREAM] Txn: {txn['transaction_id']} | Method: {txn['payment_method']} | Amount: ${txn['amount']} | City: {txn['city']} | FraudScenario: {is_fraud}")

            time.sleep(1.0 / tps)
    except KeyboardInterrupt:
        print("\n[*] Simulator stopped by user.")


if __name__ == "__main__":
    run_simulator()