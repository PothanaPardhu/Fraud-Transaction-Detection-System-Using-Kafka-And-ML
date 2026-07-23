import uuid
from django.db import models


class RuleOperator(models.TextChoices):
    GREATER_THAN = 'GT', 'Greater Than (>)'
    GREATER_THAN_EQUAL = 'GTE', 'Greater Than or Equal (>=)'
    LESS_THAN = 'LT', 'Less Than (<)'
    LESS_THAN_EQUAL = 'LTE', 'Less Than or Equal (<=)'
    EQUALS = 'EQ', 'Equals (==)'
    NOT_EQUALS = 'NEQ', 'Not Equals (!=)'
    CONTAINS = 'IN', 'Contains / In List'
    NOT_CONTAINS = 'NOT_IN', 'Not Contains / Not In List'


class RuleAction(models.TextChoices):
    BLOCK = 'BLOCK', 'Block Transaction Immediately'
    HOLD = 'HOLD', 'Hold for Manual Review'
    FLAG_HIGH_RISK = 'FLAG_HIGH_RISK', 'Boost Risk Score (+50)'
    TRIGGER_OTP = 'TRIGGER_OTP', 'Require OTP / 2FA'


class FraudRule(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=128, unique=True, help_text="e.g., High Transaction Amount Threshold")
    rule_code = models.CharField(max_length=64, unique=True, db_index=True, help_text="e.g., RULE_MAX_AMOUNT")
    description = models.TextField(blank=True, null=True)

    # Condition Details
    field_name = models.CharField(
        max_length=64, 
        help_text="Transaction attribute to check (e.g., amount, country, merchant_category, velocity_5m)"
    )
    operator = models.CharField(max_length=16, choices=RuleOperator.choices, default=RuleOperator.GREATER_THAN)
    threshold_value = models.CharField(
        max_length=256, 
        help_text="Threshold value, e.g., '10000' or comma-separated string 'RUSSIA,NORTH_KOREA'"
    )

    # Risk Impact & Action
    action = models.CharField(max_length=16, choices=RuleAction.choices, default=RuleAction.FLAG_HIGH_RISK)
    score_penalty = models.IntegerField(default=30, help_text="Points to add to risk score if rule triggers (0-100)")
    
    # Operational Controls
    is_active = models.BooleanField(default=True, db_index=True)
    priority = models.IntegerField(default=10, help_text="Lower numbers evaluate first (1 = highest priority)")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['priority', '-created_at']

    def __str__(self):
        status = "Active" if self.is_active else "Disabled"
        return f"[{self.rule_code}] {self.name} ({status})"


class BlacklistEntry(models.TextChoices):
    CUSTOMER = 'CUSTOMER', 'Customer ID'
    MERCHANT = 'MERCHANT', 'Merchant Name'
    IP_ADDRESS = 'IP', 'IP Address'
    DEVICE_ID = 'DEVICE', 'Device ID'
    CARD_ACCOUNT = 'CARD', 'Account Number'


class Blacklist(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    entity_type = models.CharField(max_length=16, choices=BlacklistEntry.choices, db_index=True)
    value = models.CharField(max_length=256, db_index=True, help_text="Value to block (e.g., IP address, Customer ID, Device Hash)")
    reason = models.TextField(help_text="Reason for blacklisting (e.g., Confirmed Chargeback Fraud)")
    added_by = models.CharField(max_length=64, default='SYSTEM')
    is_active = models.BooleanField(default=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        unique_together = ['entity_type', 'value']

    def __str__(self):
        return f"Blacklist [{self.entity_type}]: {self.value}"