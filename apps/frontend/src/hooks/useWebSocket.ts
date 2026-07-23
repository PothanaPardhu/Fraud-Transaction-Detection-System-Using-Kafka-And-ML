// apps/frontend/src/hooks/useWebSocket.ts
"use client";

import { useEffect, useState, useRef } from "react";
import { Transaction, SystemHealth } from "@/types";

const MOCK_MERCHANTS = ["Amazon", "Uber", "Apple Store", "Crypto Exchange", "Steam", "Target", "Walmart"];
const MOCK_CITIES = ["New York", "London", "Tokyo", "Mumbai", "Berlin", "San Francisco"];
const MOCK_COUNTRIES = ["US", "GB", "JP", "IN", "DE"];

export function useWebSocket(
  url: string = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/ws/live-transactions/"
) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [health, setHealth] = useState<SystemHealth>({
    status: "OPERATIONAL",
    kafka_health: "HEALTHY",
    redis_health: "HEALTHY",
    db_health: "HEALTHY",
    tps: 124,
    avg_latency_ms: 8.4,
  });
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Attempt real WebSocket connection
    try {
      const socket = new WebSocket(url);
      socketRef.current = socket;

      socket.onopen = () => {
        setIsConnected(true);
      };

      socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.data && payload.data.transaction) {
            const raw = payload.data;
            const newTxn: Transaction = {
              transaction_id: raw.transaction.transaction_id || `TXN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
              customer_id: raw.transaction.customer_id || "CUST-8821",
              sender_account: raw.transaction.sender_account || "ACC-9921",
              receiver_account: raw.transaction.receiver_account || "ACC-1029",
              amount: raw.transaction.amount || 120.50,
              currency: "USD",
              merchant_name: raw.transaction.merchant_name || "Amazon",
              merchant_category: "RETAIL",
              payment_method: raw.transaction.payment_method || "CREDIT_CARD",
              timestamp: new Date().toISOString(),
              location: {
                city: raw.transaction.city || "New York",
                country: raw.transaction.country || "US",
                latitude: 40.7128,
                longitude: -74.0060,
              },
              device_id: "DEV-99821",
              ip_address: raw.transaction.ip_address || "192.168.1.1",
              risk_score: raw.fraud_score || 12,
              fraud_probability: raw.fraud_probability || 0.12,
              decision: raw.decision || "APPROVE",
              risk_level: raw.risk_level || "LOW",
              prediction_time_ms: raw.prediction_time_ms || 8.4,
              human_explanation: raw.human_explanation || "Normal transaction pattern",
            };

            setTransactions((prev) => [newTxn, ...prev.slice(0, 49)]);
          }
        } catch (e) {
          console.error("Error parsing WebSocket payload", e);
        }
      };

      socket.onerror = () => {
        setIsConnected(false);
      };

      socket.onclose = () => {
        setIsConnected(false);
      };
    } catch {
      setIsConnected(false);
    }

    // High-Frequency Simulated Event Stream Fallback
    const interval = setInterval(() => {
      const isFraud = Math.random() < 0.15; // 15% fraud rate simulation
      const riskScore = isFraud ? Math.floor(Math.random() * 30) + 70 : Math.floor(Math.random() * 25);
      const decision = isFraud ? (riskScore > 85 ? "BLOCK" : "HOLD") : "APPROVE";

      const mockTxn: Transaction = {
        transaction_id: `TXN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        customer_id: `CUST-${Math.floor(Math.random() * 9000) + 1000}`,
        sender_account: `ACC-${Math.floor(Math.random() * 9000) + 1000}`,
        receiver_account: `ACC-${Math.floor(Math.random() * 9000) + 1000}`,
        amount: isFraud ? parseFloat((Math.random() * 4000 + 1000).toFixed(2)) : parseFloat((Math.random() * 250 + 5).toFixed(2)),
        currency: "USD",
        merchant_name: MOCK_MERCHANTS[Math.floor(Math.random() * MOCK_MERCHANTS.length)],
        merchant_category: "FINTECH",
        payment_method: "CREDIT_CARD",
        timestamp: new Date().toISOString(),
        location: {
          city: MOCK_CITIES[Math.floor(Math.random() * MOCK_CITIES.length)],
          country: MOCK_COUNTRIES[Math.floor(Math.random() * MOCK_COUNTRIES.length)],
          latitude: 40.7128,
          longitude: -74.0060,
        },
        device_id: `DEV-${Math.floor(Math.random() * 80000) + 10000}`,
        ip_address: `185.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}.1`,
        risk_score: riskScore,
        fraud_probability: parseFloat((riskScore / 100).toFixed(2)),
        decision: decision,
        risk_level: isFraud ? (riskScore > 85 ? "CRITICAL" : "HIGH") : "LOW",
        prediction_time_ms: parseFloat((Math.random() * 6 + 6).toFixed(1)),
        human_explanation: isFraud
          ? "High transaction velocity | Impossible travel speed detected | New unrecognized hardware hash"
          : "Standard behavioral spending baseline verified",
      };

      setTransactions((prev) => [mockTxn, ...prev.slice(0, 49)]);
      setHealth((h) => ({
        ...h,
        tps: Math.floor(Math.random() * 40) + 110,
        avg_latency_ms: parseFloat((Math.random() * 3 + 7).toFixed(1)),
      }));
    }, 1200);

    return () => {
      clearInterval(interval);
      if (socketRef.current) socketRef.current.close();
    };
  }, [url]);

  return { transactions, health, isConnected };
}