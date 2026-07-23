// apps/frontend/src/types/index.ts

export type UserRole = "CUSTOMER" | "FRAUD_ANALYST" | "ADMINISTRATOR" | "SUPER_ADMIN";

export type DecisionStatus = "APPROVE" | "BLOCK" | "HOLD" | "OTP_REQUIRED";

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface Transaction {
  transaction_id: string;
  customer_id: string;
  sender_account: string;
  receiver_account: string;
  amount: number;
  currency: string;
  merchant_name: string;
  merchant_category: string;
  payment_method: string;
  timestamp: string;
  location: {
    city: string;
    country: string;
    latitude: number;
    longitude: number;
  };
  device_id: string;
  ip_address: string;
  risk_score: number;
  fraud_probability: number;
  decision: DecisionStatus;
  risk_level: RiskLevel;
  prediction_time_ms: number;
  human_explanation: string;
  top_contributing_features?: Record<string, number>;
}

export interface SystemHealth {
  status: "OPERATIONAL" | "DEGRADED" | "DOWN";
  kafka_health: "HEALTHY" | "LAGGING" | "DOWN";
  redis_health: "HEALTHY" | "DOWN";
  db_health: "HEALTHY" | "DOWN";
  tps: number;
  avg_latency_ms: number;
}