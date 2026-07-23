from django.contrib import admin
from .models import Transaction, FraudAlert, DeviceFingerprint, AuditTrail


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('transaction_id', 'customer_id', 'amount', 'payment_method', 'channel', 'country', 'timestamp')
    list_filter = ('payment_method', 'channel', 'card_present', 'country')
    search_fields = ('transaction_id', 'customer_id', 'sender_account', 'receiver_account', 'ip_address', 'device_id')
    readonly_fields = ('id', 'created_at')


@admin.register(FraudAlert)
class FraudAlertAdmin(admin.ModelAdmin):
    list_display = ('transaction', 'risk_level', 'fraud_probability', 'risk_score', 'decision', 'is_reviewed', 'created_at')
    list_filter = ('risk_level', 'decision', 'is_reviewed', 'model_version')
    search_fields = ('transaction__transaction_id', 'transaction__customer_id', 'fraud_category')
    readonly_fields = ('id', 'created_at')


@admin.register(DeviceFingerprint)
class DeviceFingerprintAdmin(admin.ModelAdmin):
    list_display = ('device_id', 'browser', 'operating_system', 'is_trusted', 'first_seen', 'last_seen')
    list_filter = ('operating_system', 'browser', 'is_trusted')
    search_fields = ('device_id', 'device_hash')


@admin.register(AuditTrail)
class AuditTrailAdmin(admin.ModelAdmin):
    list_display = ('action_type', 'actor', 'target_entity', 'timestamp')
    list_filter = ('action_type', 'actor')
    search_fields = ('target_entity', 'actor')
    readonly_fields = ('id', 'timestamp')