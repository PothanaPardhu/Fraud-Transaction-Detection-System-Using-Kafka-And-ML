// apps/frontend/src/components/dashboard/MetricCards.tsx
"use client";

import { ShieldCheck, ShieldAlert, DollarSign, Activity, Lock } from "lucide-react";
import { Transaction } from "@/types";

interface MetricProps {
  transactions: Transaction[];
  tps: number;
}

export default function MetricCards({ transactions, tps }: MetricProps) {
  const total = transactions.length || 1;
  const blocked = transactions.filter((t) => t.decision === "BLOCK").length;
  const approved = transactions.filter((t) => t.decision === "APPROVE").length;
  const held = transactions.filter((t) => t.decision === "HOLD").length;

  const fraudRate = ((blocked / total) * 100).toFixed(1);
  const revenueSaved = transactions
    .filter((t) => t.decision === "BLOCK")
    .reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {/* 1. Live Throughput (TPS) */}
      <div className="glass-card p-4 rounded-xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-400 font-medium">Live Throughput</span>
          <Activity className="w-4 h-4 text-blue-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono-code text-white">{tps}</span>
          <span className="text-xs text-gray-400 font-mono-code">TPS</span>
        </div>
        <div className="w-full bg-white/5 h-1 rounded-full mt-3 overflow-hidden">
          <div className="bg-blue-500 h-full w-[70%] animate-pulse" />
        </div>
      </div>

      {/* 2. Fraud Rate Gauge */}
      <div className="glass-card p-4 rounded-xl">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-400 font-medium">Real-Time Fraud Rate</span>
          <ShieldAlert className="w-4 h-4 text-red-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono-code text-red-400">{fraudRate}%</span>
          <span className="text-[10px] text-red-400/80 bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20">
            {blocked} Threats
          </span>
        </div>
        <div className="w-full bg-white/5 h-1 rounded-full mt-3 overflow-hidden">
          <div className="bg-red-500 h-full" style={{ width: `${Math.min(parseFloat(fraudRate) * 3, 100)}%` }} />
        </div>
      </div>

      {/* 3. Approved Transactions */}
      <div className="glass-card p-4 rounded-xl">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-400 font-medium">Approved Events</span>
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono-code text-cyan-400">{approved}</span>
          <span className="text-xs text-gray-400 font-mono-code">/ {total}</span>
        </div>
        <div className="w-full bg-white/5 h-1 rounded-full mt-3 overflow-hidden">
          <div className="bg-cyan-400 h-full" style={{ width: `${(approved / total) * 100}%` }} />
        </div>
      </div>

      {/* 4. Held / Review Queue */}
      <div className="glass-card p-4 rounded-xl">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-400 font-medium">Review / Hold Queue</span>
          <Lock className="w-4 h-4 text-amber-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono-code text-amber-400">{held}</span>
          <span className="text-xs text-gray-400 font-mono-code">Pending</span>
        </div>
        <div className="w-full bg-white/5 h-1 rounded-full mt-3 overflow-hidden">
          <div className="bg-amber-400 h-full" style={{ width: `${(held / total) * 100}%` }} />
        </div>
      </div>

      {/* 5. Revenue Saved */}
      <div className="glass-card p-4 rounded-xl border border-emerald-500/20 bg-emerald-950/10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-emerald-400 font-medium">Revenue Protected</span>
          <DollarSign className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold font-mono-code text-emerald-400">
            ${revenueSaved.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        <p className="text-[10px] text-gray-400 mt-2 font-mono-code">Sub-15ms Automated Block</p>
      </div>
    </div>
  );
}