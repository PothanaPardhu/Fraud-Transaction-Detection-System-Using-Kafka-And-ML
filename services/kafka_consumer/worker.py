# services/kafka_consumer/worker.py

import os
import sys
import json
import time
import importlib.util

# 1. Setup absolute paths
CURRENT_FILE_PATH = os.path.abspath(__file__)
KAFKA_CONSUMER_DIR = os.path.dirname(CURRENT_FILE_PATH)
SERVICES_DIR = os.path.dirname(KAFKA_CONSUMER_DIR)
ROOT_DIR = os.path.dirname(SERVICES_DIR)
BACKEND_DIR = os.path.join(ROOT_DIR, "apps", "backend")

if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

# 2. Setup Django Environment
import django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

# Django Model & Utility Imports
from apps.transactions.models import Transaction, FraudAlert, DecisionOutcome, RiskLevel
from apps.rules.evaluator import RuleEngine
from apps.rules.models import RuleAction
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

# Dynamic File-Spec Imports for Feature Store & Predictor
def import_from_path(module_name, file_path):
    spec = importlib.util.spec_from_file_location(module_name, file_path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module

store_mod = import_from_path("store", os.path.join(SERVICES_DIR, "feature_store", "store.py"))
RealTimeFeatureStore = store_mod.RealTimeFeatureStore

predictor_mod = import_from_path("predictor", os.path.join(ROOT_DIR, "apps", "ml_engine", "src", "predictor.py"))
FraudPredictor = predictor_mod.FraudPredictor

# Kafka Imports
from kafka import KafkaConsumer, KafkaProducer
from kafka.errors import NoBrokersAvailable


class FraudShieldWorker:
    """Production Real-Time Kafka Streaming & Dual-Engine Evaluation Worker."""

    def __init__(self, bootstrap_servers="localhost:9092"):
        print("[*] Initializing FraudShield AI Kafka Processing Engine...")
        
        # Connect to Redis Feature Store
        self.feature_store = RealTimeFeatureStore()
        
        # Load ML Engine Model
        self.predictor = FraudPredictor()
        
        # Django Channels Layer for Real-Time UI WebSocket Push
        self.channel_layer = get_channel_layer()

        # Connect Consumer with Retry Loop
        self.consumer = self._create_kafka_consumer(bootstrap_servers)

        # Connect Producer with Retry Loop
        self.producer = self._create_kafka_producer(bootstrap_servers)
        
        print("[*] Worker successfully attached to Kafka Broker & Redis Feature Store.")

    def _create_kafka_consumer(self, bootstrap_servers):
        for attempt in range(1, 6):
            try:
                consumer = KafkaConsumer(
                    "incoming-transactions",
                    bootstrap_servers=bootstrap_servers,
                    value_deserializer=lambda x: json.loads(x.decode("utf-8")),
                    auto_offset_reset="latest",
                    group_id="fraudshield-worker-group",
                    api_version=(2, 5, 0),
                    session_timeout_ms=10000,
                    request_timeout_ms=30000,  # Must be strictly > session_timeout_ms
                    reconnect_backoff_ms=1000
                )
                return consumer
            except Exception as e:
                print(f"[!] Kafka Consumer connection attempt {attempt}/5 failed ({e}). Retrying in 2s...")
                time.sleep(2)
        raise ConnectionError("Could not connect to Kafka Broker on localhost:9092")

    def _create_kafka_producer(self, bootstrap_servers):
        for attempt in range(1, 6):
            try:
                producer = KafkaProducer(
                    bootstrap_servers=bootstrap_servers,
                    value_serializer=lambda v: json.dumps(v).encode("utf-8"),
                    api_version=(2, 5, 0),
                    request_timeout_ms=30000
                )
                return producer
            except Exception as e:
                print(f"[!] Kafka Producer connection attempt {attempt}/5 failed ({e}). Retrying in 2s...")
                time.sleep(2)
        raise ConnectionError("Could not connect Kafka Producer to localhost:9092")

    def run(self):
        print("\n[*] Listening for real-time transactions on 'incoming-transactions'...")
        print("=" * 70)

        while True:
            try:
                for msg in self.consumer:
                    raw_txn = msg.value
                    txn_id = raw_txn.get("transaction_id")
                    
                    # --- 1. Real-Time Feature Enrichment (Redis) ---
                    enriched_txn = self.feature_store.enrich_transaction(raw_txn)

                    # --- 2. Dynamic Rule Engine Evaluation ---
                    rule_result = RuleEngine.evaluate_transaction(enriched_txn)

                    # --- 3. ML Inference & SHAP Explanation ---
                    ml_result = self.predictor.predict_transaction(enriched_txn)

                    # --- 4. Decision Engine Synthesis ---
                    final_decision, risk_level = self._combine_rules_and_ml(rule_result, ml_result)

                    # Combined explanations
                    combined_explanations = list(rule_result["explanations"])
                    if ml_result["human_explanation"] and ml_result["human_explanation"] != "Normal transaction behavior pattern":
                        combined_explanations.append(f"ML Insight: {ml_result['human_explanation']}")
                    
                    explanation_text = " | ".join(combined_explanations) if combined_explanations else "Legitimate transaction pattern verified"

                    # Prepare Output Payload
                    evaluation_payload = {
                        "transaction": enriched_txn,
                        "fraud_score": ml_result["risk_score"],
                        "fraud_probability": ml_result["fraud_probability"],
                        "risk_level": risk_level,
                        "decision": final_decision,
                        "prediction_time_ms": ml_result["prediction_time_ms"],
                        "human_explanation": explanation_text,
                        "top_contributing_features": ml_result["top_contributing_features"],
                        "triggered_rules": rule_result["triggered_rules"]
                    }

                    # --- 5. Downstream Kafka Event Routing ---
                    if final_decision in [DecisionOutcome.BLOCK, DecisionOutcome.HOLD]:
                        self.producer.send("fraud-transactions", value=evaluation_payload)
                    else:
                        self.producer.send("approved-transactions", value=evaluation_payload)
                    self.producer.flush()

                    # --- 6. Broadcast Real-Time Push to Next.js UI via Django Channels ---
                    if self.channel_layer:
                        try:
                            async_to_sync(self.channel_layer.group_send)(
                                "live_fraud_stream",
                                {
                                    "type": "send_transaction_update",
                                    "data": evaluation_payload
                                }
                            )
                        except Exception:
                            pass

                    # Log execution summary
                    color_tag = "[BLOCKED]" if final_decision in [DecisionOutcome.BLOCK, DecisionOutcome.HOLD] else "[APPROVED]"
                    print(f"{color_tag} Txn: {txn_id} | Amount: ${enriched_txn['amount']} | Score: {ml_result['risk_score']}/100 | Decision: {final_decision} ({ml_result['prediction_time_ms']} ms)")

            except Exception as e:
                print(f"[!] Warning: Consumer loop hit temporary error: {e}. Re-establishing loop...")
                time.sleep(1)

    def _combine_rules_and_ml(self, rule_res: dict, ml_res: dict):
        forced_action = rule_res.get("forced_action")
        ml_score = ml_res["risk_score"]

        if forced_action == RuleAction.BLOCK or ml_score >= 80:
            return DecisionOutcome.BLOCK, RiskLevel.CRITICAL
        elif forced_action == RuleAction.HOLD or ml_score >= 60:
            return DecisionOutcome.HOLD, RiskLevel.HIGH
        elif forced_action == RuleAction.TRIGGER_OTP or ml_score >= 40:
            return DecisionOutcome.OTP_REQUIRED, RiskLevel.MEDIUM
        else:
            return DecisionOutcome.APPROVE, RiskLevel.LOW


if __name__ == "__main__":
    try:
        worker = FraudShieldWorker()
        worker.run()
    except KeyboardInterrupt:
        print("\n[*] FraudShield Worker stopped cleanly.")
    except Exception as e:
        print(f"[!] Worker Fatal Error: {e}")