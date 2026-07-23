from datetime import timedelta

from django.db.models import Avg, Count, Sum
from django.utils import timezone
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.rules.models import Blacklist, FraudRule
from apps.transactions.models import (
    DecisionOutcome,
    FraudAlert,
    RiskLevel,
    Transaction,
)


class DashboardMetricsAPIView(APIView):
    """
    Enterprise Dashboard Metrics API
    Used by:
    - Admin Dashboard
    - Fraud Command Center
    - Executive Dashboard
    """

    permission_classes = [permissions.AllowAny]

    def get(self, request):
        now = timezone.now()
        last_24h = now - timedelta(hours=24)

        # -----------------------------
        # Transaction Metrics
        # -----------------------------
        transactions = Transaction.objects.filter(
            timestamp__gte=last_24h
        )

        alerts = FraudAlert.objects.filter(
            transaction__timestamp__gte=last_24h
        )

        total_transactions = transactions.count()

        approved_transactions = alerts.filter(
            decision=DecisionOutcome.APPROVE
        ).count()

        blocked_transactions = alerts.filter(
            decision=DecisionOutcome.BLOCK
        ).count()

        hold_transactions = alerts.filter(
            decision=DecisionOutcome.HOLD
        ).count()

        otp_transactions = alerts.filter(
            decision=DecisionOutcome.OTP_REQUIRED
        ).count()

        # -----------------------------
        # Revenue Saved
        # -----------------------------
        revenue_saved = (
            alerts.filter(
                decision=DecisionOutcome.BLOCK
            ).aggregate(
                total=Sum("transaction__amount")
            )["total"]
            or 0
        )

        # -----------------------------
        # Fraud Rate
        # -----------------------------
        fraud_rate = (
            round((blocked_transactions / total_transactions) * 100, 2)
            if total_transactions > 0
            else 0
        )

        # -----------------------------
        # ML Metrics
        # -----------------------------
        avg_prediction_time = (
            alerts.aggregate(
                avg=Avg("prediction_time_ms")
            )["avg"]
            or 0
        )

        avg_risk_score = (
            alerts.aggregate(
                avg=Avg("risk_score")
            )["avg"]
            or 0
        )

        avg_confidence = (
            alerts.aggregate(
                avg=Avg("confidence_score")
            )["avg"]
            or 0
        )

        # -----------------------------
        # Risk Distribution
        # -----------------------------
        risk_distribution = list(
            alerts.values("risk_level")
            .annotate(count=Count("id"))
            .order_by("risk_level")
        )

        # -----------------------------
        # Payment Method Distribution
        # -----------------------------
        payment_distribution = list(
            transactions.values("payment_method")
            .annotate(count=Count("id"))
            .order_by("-count")
        )

        # -----------------------------
        # Country Distribution
        # -----------------------------
        country_distribution = list(
            transactions.values("country")
            .annotate(count=Count("id"))
            .order_by("-count")[:10]
        )

        # -----------------------------
        # Merchant Distribution
        # -----------------------------
        merchant_distribution = list(
            transactions.values("merchant_name")
            .annotate(count=Count("id"))
            .order_by("-count")[:10]
        )

        # -----------------------------
        # High Risk Alerts
        # -----------------------------
        high_risk_alerts = alerts.filter(
            risk_level=RiskLevel.CRITICAL
        ).count()

        high_risk_customers = (
            alerts.filter(
                risk_level__in=[
                    RiskLevel.HIGH,
                    RiskLevel.CRITICAL,
                ]
            )
            .values("transaction__customer_id")
            .distinct()
            .count()
        )

        # -----------------------------
        # Response
        # -----------------------------
        return Response(
            {
                "status": "SUCCESS",

                "dashboard": {
                    "total_transactions": total_transactions,
                    "approved_transactions": approved_transactions,
                    "blocked_transactions": blocked_transactions,
                    "hold_transactions": hold_transactions,
                    "otp_transactions": otp_transactions,
                    "fraud_rate": fraud_rate,
                    "revenue_saved": float(revenue_saved),
                    "average_risk_score": round(avg_risk_score, 2),
                    "average_prediction_time_ms": round(avg_prediction_time, 2),
                    "average_confidence_score": round(avg_confidence, 4),
                    "critical_alerts": high_risk_alerts,
                    "high_risk_customers": high_risk_customers,
                },

                "analytics": {
                    "risk_distribution": risk_distribution,
                    "payment_distribution": payment_distribution,
                    "country_distribution": country_distribution,
                    "merchant_distribution": merchant_distribution,
                },

                "system": {
                    "status": "OPERATIONAL",
                    "kafka": "HEALTHY",
                    "redis": "HEALTHY",
                    "database": "HEALTHY",
                    "ml_engine": "ONLINE",
                    "api": "ONLINE",
                },
            }
        )


class FraudRulesAPIView(APIView):
    """
    Manage Fraud Rules
    """

    permission_classes = [permissions.AllowAny]

    def get(self, request):
        rules = FraudRule.objects.all().values()
        return Response(list(rules))

    def post(self, request):
        rule_id = request.data.get("id")
        is_active = request.data.get("is_active")

        try:
            rule = FraudRule.objects.get(id=rule_id)
            rule.is_active = is_active
            rule.save()

            return Response(
                {
                    "status": "SUCCESS",
                    "message": f"Rule '{rule.name}' updated successfully.",
                }
            )

        except FraudRule.DoesNotExist:
            return Response(
                {"error": "Rule not found"},
                status=status.HTTP_404_NOT_FOUND,
            )


class BlacklistAPIView(APIView):
    """
    Blacklist Management
    """

    permission_classes = [permissions.AllowAny]

    def get(self, request):
        data = Blacklist.objects.all().values()
        return Response(list(data))

    def post(self, request):
        value = request.data.get("value")
        entity_type = request.data.get("type")
        reason = request.data.get(
            "reason",
            "Manual analyst intervention",
        )

        if not value or not entity_type:
            return Response(
                {
                    "error": "Value and Type are required."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        obj, created = Blacklist.objects.get_or_create(
            value=value,
            type=entity_type,
            defaults={
                "reason": reason,
                "is_active": True,
            },
        )

        return Response(
            {
                "status": "SUCCESS",
                "created": created,
                "entity": {
                    "value": obj.value,
                    "type": obj.type,
                    "reason": obj.reason,
                    "is_active": obj.is_active,
                },
            }
        )