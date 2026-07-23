# apps/backend/apps/notifications/services.py

import logging
from apps.transactions.models import FraudAlert, Transaction

logger = logging.getLogger("fraudshield.notifications")


class NotificationService:
    """Multi-channel alert dispatch engine for flagged fraud events."""

    @staticmethod
    def dispatch_alert(evaluation_payload: dict):
        decision = evaluation_payload.get("decision")
        txn = evaluation_payload.get("transaction", {})
        score = evaluation_payload.get("fraud_score", 0)

        alert_message = (
            f"🚨 [FRAUD ALERT] Transaction {txn.get('transaction_id')} "
            f"for ${txn.get('amount')} BLOCKED | Risk Score: {score}/100 | "
            f"Reason: {evaluation_payload.get('human_explanation')}"
        )

        # 1. Log to Centralized Audit Stream
        logger.warning(alert_message)

        # 2. Print high-priority alert to console/stdout webhook simulation
        if score >= 80 or decision == "BLOCK":
            print(f"\n{'='*70}\n{alert_message}\n{'='*70}\n")