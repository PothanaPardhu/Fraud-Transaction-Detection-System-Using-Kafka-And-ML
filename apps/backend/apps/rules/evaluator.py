# apps/backend/apps/rules/evaluator.py

from .models import FraudRule, RuleOperator, RuleAction, Blacklist


class RuleEngine:
    """
    In-memory / DB Rule Evaluator for Real-Time Fraud Assessment.
    Calculates Rule Violations, Action Overrides, and Score Penalties.
    """

    @staticmethod
    def evaluate_transaction(transaction_data: dict) -> dict:
        """
        Evaluates a raw transaction dictionary against all active Fraud Rules and Blacklists.
        
        Returns:
            dict containing:
                - is_triggered (bool)
                - forced_action (str or None)
                - total_score_penalty (int)
                - triggered_rules (list of dicts)
                - explanations (list of strings)
        """
        results = {
            "is_triggered": False,
            "forced_action": None,
            "total_score_penalty": 0,
            "triggered_rules": [],
            "explanations": []
        }

        # 1. Check Blacklists First (Highest Priority)
        blacklist_hit = RuleEngine._check_blacklists(transaction_data)
        if blacklist_hit:
            results["is_triggered"] = True
            results["forced_action"] = RuleAction.BLOCK
            results["total_score_penalty"] = 100
            results["triggered_rules"].append({
                "rule_code": "BLACKLIST_MATCH",
                "name": f"Blacklisted {blacklist_hit['entity_type']}",
                "action": RuleAction.BLOCK,
                "score_penalty": 100
            })
            results["explanations"].append(f"Transaction matched active Blacklist: {blacklist_hit['reason']}")
            return results  # Immediate exit on Blacklist match

        # 2. Evaluate Dynamic Active Fraud Rules
        active_rules = FraudRule.objects.filter(is_active=True).order_by('priority')

        for rule in active_rules:
            # Get attribute value from transaction payload safely
            field_val = transaction_data.get(rule.field_name)
            if field_val is None:
                continue

            # Perform Operator Comparison
            if RuleEngine._compare(field_val, rule.operator, rule.threshold_value):
                results["is_triggered"] = True
                results["total_score_penalty"] += rule.score_penalty
                
                rule_info = {
                    "rule_code": rule.rule_code,
                    "name": rule.name,
                    "action": rule.action,
                    "score_penalty": rule.score_penalty
                }
                results["triggered_rules"].append(rule_info)
                results["explanations"].append(
                    f"Triggered rule '{rule.name}': {rule.field_name} ({field_val}) {rule.operator} {rule.threshold_value}"
                )

                # Escalate forced action if necessary (BLOCK > HOLD > TRIGGER_OTP)
                if rule.action == RuleAction.BLOCK:
                    results["forced_action"] = RuleAction.BLOCK
                elif rule.action == RuleAction.HOLD and results["forced_action"] != RuleAction.BLOCK:
                    results["forced_action"] = RuleAction.HOLD
                elif rule.action == RuleAction.TRIGGER_OTP and not results["forced_action"]:
                    results["forced_action"] = RuleAction.TRIGGER_OTP

        # Cap penalty at 100 max
        results["total_score_penalty"] = min(results["total_score_penalty"], 100)
        return results

    @staticmethod
    def _check_blacklists(data: dict) -> dict or None:
        """Helper to test customer ID, IP, device, merchant, and account against active Blacklists."""
        checks = [
            ('CUSTOMER', data.get('customer_id')),
            ('IP', data.get('ip_address')),
            ('DEVICE', data.get('device_id')),
            ('MERCHANT', data.get('merchant_name')),
            ('CARD', data.get('sender_account'))
        ]

        for entity_type, val in checks:
            if val and Blacklist.objects.filter(entity_type=entity_type, value=val, is_active=True).exists():
                entry = Blacklist.objects.get(entity_type=entity_type, value=val, is_active=True)
                return {"entity_type": entity_type, "value": val, "reason": entry.reason}
        return None

    @staticmethod
    def _compare(field_val, operator: str, threshold_str: str) -> bool:
        """Executes operator comparison with type coercion."""
        try:
            # Numeric Comparisons
            if operator in [RuleOperator.GREATER_THAN, RuleOperator.GREATER_THAN_EQUAL, RuleOperator.LESS_THAN, RuleOperator.LESS_THAN_EQUAL]:
                f_val = float(field_val)
                t_val = float(threshold_str)
                if operator == RuleOperator.GREATER_THAN: return f_val > t_val
                if operator == RuleOperator.GREATER_THAN_EQUAL: return f_val >= t_val
                if operator == RuleOperator.LESS_THAN: return f_val < t_val
                if operator == RuleOperator.LESS_THAN_EQUAL: return f_val <= t_val

            # String / Equality Comparisons
            s_val = str(field_val).strip().upper()
            st_val = str(threshold_str).strip().upper()

            if operator == RuleOperator.EQUALS: return s_val == st_val
            if operator == RuleOperator.NOT_EQUALS: return s_val != st_val
            
            # List Inclusions (comma-separated string expected)
            if operator == RuleOperator.CONTAINS:
                items = [item.strip() for item in st_val.split(',')]
                return s_val in items

            if operator == RuleOperator.NOT_CONTAINS:
                items = [item.strip() for item in st_val.split(',')]
                return s_val not in items

        except (ValueError, TypeError):
            return False
        return False