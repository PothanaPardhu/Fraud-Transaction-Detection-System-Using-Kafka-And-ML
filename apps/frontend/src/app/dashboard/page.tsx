// apps/frontend/src/app/dashboard/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useWebSocket } from "@/hooks/useWebSocket";
import MetricCards from "@/components/dashboard/MetricCards";
import { Cpu, Database, Zap } from "lucide-react";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { transactions, health } = useWebSocket();

  return (
    <div className="p-6 space-y-6">
      {/* Executive Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <span>SOC Command Center</span>
            <span className="text-xs font-mono-code text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/20">
              CLUSTER-US-EAST-1
            </span>
          </h1>

          <p className="text-xs text-gray-400 mt-1">
            Real-time event stream evaluation, sliding-window feature engineering,
            and sub-15ms ML inference.
          </p>
        </div>

        {/* System Health Strip */}
        <div className="flex items-center gap-3 glass-card px-4 py-2 rounded-xl border border-white/10">
          <div className="flex items-center gap-1.5 text-xs text-gray-300 font-mono-code">
            <Cpu className="w-3.5 h-3.5 text-blue-400" />
            <span>Kafka: {health.kafka_health}</span>
          </div>

          <span className="text-gray-600">|</span>

          <div className="flex items-center gap-1.5 text-xs text-gray-300 font-mono-code">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span>Redis: {health.redis_health}</span>
          </div>

          <span className="text-gray-600">|</span>

          <div className="flex items-center gap-1.5 text-xs text-gray-300 font-mono-code">
            <Database className="w-3.5 h-3.5 text-purple-400" />
            <span>PostgreSQL: {health.db_health}</span>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <MetricCards transactions={transactions} tps={health.tps} />

      {/* Live Transaction Stream */}
      <div className="glass-card rounded-xl border border-white/10 p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>

            <h2 className="text-sm font-semibold text-white tracking-wide">
              Live Transaction Stream Feed
            </h2>
          </div>

          <span className="text-xs font-mono-code text-gray-400">
            Click any row to investigate in Workbench
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-gray-400 font-mono-code border-b border-white/5 uppercase text-[10px] tracking-wider">
                <th className="pb-3 pl-2">Time</th>
                <th className="pb-3">Transaction ID</th>
                <th className="pb-3">Customer</th>
                <th className="pb-3">Amount</th>
                <th className="pb-3">Merchant</th>
                <th className="pb-3">Risk Score</th>
                <th className="pb-3">Decision</th>
                <th className="pb-3 text-right pr-2">Latency</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5 font-mono-code">
              {transactions.slice(0, 10).map((txn) => {
                const isBlock = txn.decision === "BLOCK";
                const isHold = txn.decision === "HOLD";

                return (
                  <tr
                    key={txn.transaction_id}
                    onClick={() => router.push("/workbench")}
                    className="cursor-pointer transition hover:bg-blue-500/10 hover:shadow-[inset_0_0_0_1px_rgba(59,130,246,0.2)]"
                    title="Click to investigate in Analyst Workbench"
                  >
                    <td className="py-2.5 pl-2 text-gray-400">
                      {new Date(txn.timestamp).toLocaleTimeString()}
                    </td>

                    <td className="py-2.5 font-semibold text-blue-400">
                      {txn.transaction_id}
                    </td>

                    <td className="py-2.5 text-gray-300">
                      {txn.customer_id}
                    </td>

                    <td className="py-2.5 font-bold text-white">
                      ${txn.amount.toFixed(2)}
                    </td>

                    <td className="py-2.5 text-gray-300">
                      {txn.merchant_name}
                    </td>

                    <td className="py-2.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          txn.risk_score >= 70
                            ? "bg-red-500/20 text-red-400 border border-red-500/30"
                            : txn.risk_score >= 40
                            ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                            : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        }`}
                      >
                        {txn.risk_score}/100
                      </span>
                    </td>

                    <td className="py-2.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isBlock
                            ? "bg-red-500/10 text-red-400 border border-red-500/20"
                            : isHold
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        }`}
                      >
                        {txn.decision}
                      </span>
                    </td>

                    <td className="py-2.5 pr-2 text-right text-gray-400">
                      {txn.prediction_time_ms} ms
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}