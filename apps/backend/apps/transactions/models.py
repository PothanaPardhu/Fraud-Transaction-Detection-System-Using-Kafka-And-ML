import uuid
from django.db import models
from django.utils import timezone


class PaymentMethod(models.TextChoices):
    UPI = 'UPI', 'UPI'
    CREDIT_CARD = 'CREDIT_CARD', 'Credit Card'
    DEBIT_CARD = 'DEBIT_CARD', 'Debit Card'
    ATM = 'ATM', 'ATM Withdrawal'
    POS = 'POS', 'POS Payment'
    NET_BANKING = 'NET_BANKING', 'Net Banking'
    WALLET = 'WALLET', 'Wallet Payment'


class ChannelType(models.TextChoices):
    MOBILE = 'MOBILE', 'Mobile App'
    WEB = 'WEB', 'Web Portal'
    ATM = 'ATM', 'ATM Machine'
    POS = 'POS', 'POS Terminal'


class RiskLevel(models.TextChoices):
    LOW = 'LOW', 'Low Risk'
    MEDIUM = 'MEDIUM', 'Medium Risk'
    HIGH = 'HIGH', 'High Risk'
    CRITICAL = 'CRITICAL', 'Critical Risk'


class DecisionOutcome(models.TextChoices):
    APPROVE = 'APPROVE', 'Approve'
    BLOCK = 'BLOCK', 'Block'
    HOLD = 'HOLD', 'Hold for Review'
    OTP_REQUIRED = 'OTP_REQUIRED', 'Trigger 2FA/OTP'


class DeviceFingerprint(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    device_id = models.CharField(max_length=128, db_index=True)
    device_hash = models.CharField(max_length=256, db_index=True)
    browser = models.CharField(max_length=64)
    operating_system = models.CharField(max_length=64)
    screen_resolution = models.CharField(max_length=32, blank=True, null=True)
    user_agent = models.TextField()
    is_trusted = models.BooleanField(default=False)
    first_seen = models.DateTimeField(auto_now_add=True)
    last_seen = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['device_id', 'device_hash']),
        ]

    def __str__(self):
        return f"Device {self.device_id} ({self.operating_system})"


class Transaction(models.Model):
    # Primary Identifiers
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    transaction_id = models.CharField(max_length=128, unique=True, db_index=True)
    customer_id = models.CharField(max_length=64, db_index=True)
    sender_account = models.CharField(max_length=64, db_index=True)
    receiver_account = models.CharField(max_length=64, db_index=True)

    # Financial Details
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    currency = models.CharField(max_length=3, default='USD')
    
    # Merchant Details
    merchant_name = models.CharField(max_length=128)
    merchant_category = models.CharField(max_length=64, db_index=True)
    merchant_risk_level = models.CharField(max_length=16, choices=RiskLevel.choices, default=RiskLevel.LOW)

    # Transaction Context
    payment_method = models.CharField(max_length=32, choices=PaymentMethod.choices)
    channel = models.CharField(max_length=16, choices=ChannelType.choices)
    timestamp = models.DateTimeField(default=timezone.now, db_index=True)
    card_present = models.BooleanField(default=False)

    # Geolocation Intelligence
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    country = models.CharField(max_length=64, db_index=True)
    city = models.CharField(max_length=64)

    # Device & Network Fingerprint
    device_id = models.CharField(max_length=128, db_index=True)
    browser = models.CharField(max_length=64)
    operating_system = models.CharField(max_length=64)
    ip_address = models.GenericIPAddressField(db_index=True)
    network_type = models.CharField(max_length=32, default='4G/5G')

    # Behavioral Features (Captured at time of transaction)
    account_age_days = models.IntegerField(default=0)
    daily_spending_so_far = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    previous_fraud_count = models.IntegerField(default=0)

    # Evaluation Metadata
    is_processed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['customer_id', 'timestamp']),
            models.Index(fields=['merchant_category', 'timestamp']),
        ]

    def __str__(self):
        return f"Txn {self.transaction_id} - ${self.amount} ({self.payment_method})"


class FraudAlert(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    transaction = models.OneToOneField(Transaction, on_delete=models.CASCADE, related_name='fraud_alert')
    
    # ML & Rule Scoring Output
    fraud_probability = models.FloatField(db_index=True)  # Range 0.0 to 1.0
    risk_score = models.IntegerField(default=0)           # 0 to 100
    confidence_score = models.FloatField(default=0.0)
    risk_level = models.CharField(max_length=16, choices=RiskLevel.choices)
    decision = models.CharField(max_length=16, choices=DecisionOutcome.choices)

    # Explainable AI (SHAP & Reason Codes)
    fraud_category = models.CharField(max_length=64)
    top_contributing_features = models.JSONField(default=dict)  # e.g., {"amount_spike": +0.42, "new_ip": +0.31}
    human_explanation = models.TextField()

    # Model Lifecycle Audit
    model_version = models.CharField(max_length=32, default='xgb_v1.0.0')
    prediction_time_ms = models.FloatField(help_text="Inference execution time in milliseconds")

    # Analyst Workflow / Triage
    is_reviewed = models.BooleanField(default=False)
    reviewed_by = models.CharField(max_length=64, blank=True, null=True)
    analyst_action = models.CharField(max_length=32, blank=True, null=True)  # Approved, Confirmed Fraud, False Positive
    investigation_notes = models.TextField(blank=True, null=True)
    reviewed_at = models.DateTimeField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-fraud_probability']

    def __str__(self):
        return f"Alert [{self.risk_level}] - Score: {self.risk_score} (Txn: {self.transaction.transaction_id})"


class AuditTrail(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    action_type = models.CharField(max_length=64)  # RULE_TRIGGERED, ML_PREDICTION, ANALYST_OVERRIDE, BLACKLIST_ADD
    actor = models.CharField(max_length=64, default='SYSTEM')  # SYSTEM or Analyst Username
    target_entity = models.CharField(max_length=128)          # Transaction ID, Customer ID, or IP
    details = models.JSONField(default=dict)
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"AuditLog [{self.action_type}] by {self.actor} at {self.timestamp}"