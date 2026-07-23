from django.contrib import admin
from .models import FraudRule, Blacklist


@admin.register(FraudRule)
class FraudRuleAdmin(admin.ModelAdmin):
    list_display = ('rule_code', 'name', 'field_name', 'operator', 'threshold_value', 'action', 'score_penalty', 'priority', 'is_active')
    list_filter = ('is_active', 'action', 'operator')
    search_fields = ('rule_code', 'name', 'field_name', 'description')
    ordering = ('priority', '-created_at')


@admin.register(Blacklist)
class BlacklistAdmin(admin.ModelAdmin):
    list_display = ('entity_type', 'value', 'reason', 'added_by', 'is_active', 'created_at')
    list_filter = ('entity_type', 'is_active')
    search_fields = ('value', 'reason', 'added_by')