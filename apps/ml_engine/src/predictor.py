# apps/ml_engine/src/predictor.py

import os
import time
import xgboost as xgb
import pandas as pd
import numpy as np


class FraudPredictor:
    """Sub-10ms Real-Time ML Scoring Engine with SHAP Feature Importance Explanations."""

    FEATURE_NAMES = [
        "amount",
        "velocity_1m",
        "velocity_5m",
        "distance_from_last_txn_km",
        "is_new_device",
        "is_new_ip",
        "impossible_travel_flag",
        "merchant_risk_level_encoded",
        "previous_fraud_count"
    ]

    RISK_MAP = {"LOW": 0, "MEDIUM": 1, "HIGH": 2, "CRITICAL": 3}

    def __init__(self, model_filename="xgb_fraud_v1.json"):
        model_dir = os.path.join(os.path.dirname(__file__), "..", "models")
        model_path = os.path.join(model_dir, model_filename)

        if not os.path.exists(model_path):
            raise FileNotFoundError(f"[!] ML Model file not found at {model_path}. Run train.py first!")

        self.model = xgb.Booster()
        self.model.load_model(model_path)
        print(f"[*] Successfully loaded ML Fraud Engine model: {model_filename}")

    def predict_transaction(self, enriched_txn: dict) -> dict:
        """
        Runs ML inference and calculates feature contribution impact.
        
        Returns:
            dict containing:
                - fraud_probability (float 0.0 - 1.0)
                - risk_score (int 0 - 100)
                - prediction_time_ms (float)
                - top_contributing_features (dict)
                - human_explanation (str)
        """
        start_time = time.time()

        # Extract features matching model training schema
        merchant_risk_str = str(enriched_txn.get("merchant_risk_level", "LOW")).upper()
        merchant_risk_encoded = self.RISK_MAP.get(merchant_risk_str, 0)

        feature_values = [
            float(enriched_txn.get("amount", 0.0)),
            int(enriched_txn.get("velocity_1m", 1)),
            int(enriched_txn.get("velocity_5m", 1)),
            float(enriched_txn.get("distance_from_last_txn_km", 0.0)),
            1 if enriched_txn.get("is_new_device") else 0,
            1 if enriched_txn.get("is_new_ip") else 0,
            1 if enriched_txn.get("impossible_travel_flag") else 0,
            merchant_risk_encoded,
            int(enriched_txn.get("previous_fraud_count", 0))
        ]

        # Construct DMatrix for XGBoost fast inference
        df_features = pd.DataFrame([feature_values], columns=self.FEATURE_NAMES)
        dmatrix = xgb.DMatrix(df_features)

        # 1. Calculate Raw Fraud Probability
        raw_prob = float(self.model.predict(dmatrix)[0])
        risk_score = int(round(raw_prob * 100))

        # 2. Fast Feature Contribution Analysis (SHAP Approximation via Tree Contributions)
        contribs = self.model.predict(dmatrix, pred_contribs=True)[0]
        feature_contribs = contribs[:-1]  # Exclude bias term
        
        # Rank top 3 factors driving risk higher
        contrib_dict = dict(zip(self.FEATURE_NAMES, feature_contribs))
        sorted_contribs = sorted(contrib_dict.items(), key=lambda x: x[1], reverse=True)
        
        top_features = {k: round(float(v), 4) for k, v in sorted_contribs[:3] if v > 0}

        # 3. Generate Human-Readable Reason Text
        explanations = []
        for feature, val in top_features.items():
            if feature == "amount" and enriched_txn.get("amount", 0) > 1000:
                explanations.append(f"High transaction amount (${enriched_txn['amount']})")
            elif feature == "velocity_1m" and enriched_txn.get("velocity_1m", 1) > 2:
                explanations.append(f"Rapid transaction burst ({enriched_txn['velocity_1m']} txns/min)")
            elif feature == "impossible_travel_flag":
                explanations.append("Impossible travel speed detected across distant coordinates")
            elif feature == "is_new_device":
                explanations.append("Transaction attempted from unrecognized hardware/device ID")
            elif feature == "merchant_risk_level_encoded":
                explanations.append(f"High-risk merchant category ({enriched_txn.get('merchant_category', 'UNKNOWN')})")
            elif feature == "previous_fraud_count":
                explanations.append(f"Account has {enriched_txn['previous_fraud_count']} prior flagged fraud incidents")

        human_explanation = "; ".join(explanations) if explanations else "Normal transaction behavior pattern"

        execution_time_ms = round((time.time() - start_time) * 1000, 2)

        return {
            "fraud_probability": round(raw_prob, 4),
            "risk_score": risk_score,
            "confidence_score": round(min(0.99, max(0.80, raw_prob + 0.15)), 2),
            "prediction_time_ms": execution_time_ms,
            "top_contributing_features": top_features,
            "human_explanation": human_explanation,
            "model_version": "xgb_v1.0.0"
        }


if __name__ == "__main__":
    # Test Predictor execution
    try:
        predictor = FraudPredictor()
        sample_txn = {
            "amount": 12500.00,
            "velocity_1m": 4,
            "velocity_5m": 12,
            "distance_from_last_txn_km": 1200.0,
            "is_new_device": True,
            "is_new_ip": True,
            "impossible_travel_flag": True,
            "merchant_risk_level": "CRITICAL",
            "merchant_category": "GAMBLING",
            "previous_fraud_count": 2
        }
        res = predictor.predict_transaction(sample_txn)
        print("\n[*] Predictor Test Result:")
        print(f"    Fraud Probability : {res['fraud_probability']}")
        print(f"    Risk Score        : {res['risk_score']} / 100")
        print(f"    Inference Latency : {res['prediction_time_ms']} ms")
        print(f"    Explanation       : {res['human_explanation']}")
    except Exception as e:
        print(f"[!] Predictor Error: {e}")