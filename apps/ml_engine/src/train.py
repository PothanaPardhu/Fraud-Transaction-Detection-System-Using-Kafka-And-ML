# apps/ml_engine/src/train.py

import os
import random
import numpy as np
import pandas as pd
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, roc_auc_score


def generate_synthetic_training_data(n_samples: int = 10000) -> pd.DataFrame:
    """Generates synthetic dataset representing legitimate vs fraudulent banking patterns."""
    np.random.seed(42)
    random.seed(42)

    data = []
    for _ in range(n_samples):
        is_fraud = np.random.rand() < 0.08  # 8% baseline fraud rate

        if is_fraud:
            amount = np.random.uniform(2500, 45000)
            velocity_1m = np.random.randint(3, 12)
            velocity_5m = np.random.randint(8, 30)
            distance_km = np.random.uniform(300, 8000)
            is_new_device = 1 if np.random.rand() < 0.85 else 0
            is_new_ip = 1 if np.random.rand() < 0.90 else 0
            impossible_travel = 1 if np.random.rand() < 0.60 else 0
            merchant_risk = np.random.choice([0, 1, 2, 3], p=[0.1, 0.2, 0.3, 0.4])  # Higher risk
            previous_fraud_count = np.random.randint(1, 5)
        else:
            amount = np.random.uniform(5, 450)
            velocity_1m = np.random.choice([1, 2], p=[0.85, 0.15])
            velocity_5m = np.random.randint(1, 5)
            distance_km = np.random.uniform(0, 50)
            is_new_device = 1 if np.random.rand() < 0.05 else 0
            is_new_ip = 1 if np.random.rand() < 0.10 else 0
            impossible_travel = 0
            merchant_risk = np.random.choice([0, 1, 2, 3], p=[0.7, 0.2, 0.08, 0.02])
            previous_fraud_count = 0

        data.append({
            "amount": amount,
            "velocity_1m": velocity_1m,
            "velocity_5m": velocity_5m,
            "distance_from_last_txn_km": distance_km,
            "is_new_device": is_new_device,
            "is_new_ip": is_new_ip,
            "impossible_travel_flag": impossible_travel,
            "merchant_risk_level_encoded": merchant_risk,
            "previous_fraud_count": previous_fraud_count,
            "is_fraud": 1 if is_fraud else 0
        })

    return pd.DataFrame(data)


def train_and_export_model():
    print("[*] Generating synthetic training dataset (10,000 samples)...")
    df = generate_synthetic_training_data(10000)

    X = df.drop(columns=['is_fraud'])
    y = df['is_fraud']

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    print("[*] Training XGBoost Fraud Detection Classifier...")
    model = xgb.XGBClassifier(
        n_estimators=100,
        max_depth=5,
        learning_rate=0.08,
        scale_pos_weight=11.5,  # Handle class imbalance
        eval_metric='auc',
        random_state=42
    )

    model.fit(X_train, y_train)

    # Evaluation
    preds = model.predict(X_test)
    probs = model.predict_proba(X_test)[:, 1]
    
    auc_score = roc_auc_score(y_test, probs)
    print(f"\n[+] Model Evaluation Results:")
    print(f"    ROC-AUC Score: {auc_score:.4f}")
    print("\nClassification Report:\n", classification_report(y_test, preds))

    # Export Model Artifacts
    output_dir = os.path.join(os.path.dirname(__file__), "..", "models")
    os.makedirs(output_dir, exist_ok=True)
    model_path = os.path.join(output_dir, "xgb_fraud_v1.json")
    
    model.save_model(model_path)
    print(f"[+] Successfully exported trained model to: {model_path}")


if __name__ == "__main__":
    train_and_export_model()