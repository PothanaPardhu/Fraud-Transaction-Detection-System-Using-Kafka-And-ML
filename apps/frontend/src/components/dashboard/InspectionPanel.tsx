// apps/frontend/src/components/dashboard/InspectionPanel.tsx
"use client";

import { useState } from "react";
import { Transaction } from "@/types";
import ShapBarChart from "./ShapBarChart";
import { ShieldAlert, UserX, Lock, CheckCircle2, Ban, MapPin, Smartphone, Wifi, History } from "lucide-react";

interface InspectionPanelProps {
  transaction: Transaction | null;
  onActionComplete?: (action: string) => void;
}

export default function InspectionPanel({ transaction, onActionComplete }: InspectionPanelProps) {
  const [actionStatus, setActionStatus] = useState<string | null>(null);

  if (!transaction) {
    return (
      <div className="glass-card rounded-xl p-8 border border-white/10 text-center text-gray-400 h-full flex flex-col items-center justify-center space-y-3">
        <ShieldAlert className="w-10 h-10 text-gray-600 animate-pulse" />
        <p className="text-sm font-mono-code">Select any transaction from the stream to initiate deep investigation.</p>
      </div>
    );
  }

  const handleAction = (actionName: string) => {
    setActionStatus(`Action executed: ${actionName}`);
    if (onActionComplete) onActionComplete(actionName);
    setTimeout(() => setActionStatus(null), 3000);
  };

  const isBlocked = transaction.decision === "BLOCK";

  return (
    <div className="glass-card rounded-xl border border-white/10 p-5 space-y-5 h-full overflow-y-auto">
      {/* Header & Status Banner */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <span className="text-[10px] font-mono-code text-gray-400 uppercase tracking-widest">ACTIVE INVESTIGATION</span>
          <h3 className="text-lg font-bold text-white font-mono-code flex items-center gap-2">
            {transaction.transaction_id}
          </h3>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold font-mono-code ${
            isBlocked
              ? "bg-red-500/20 text-red-400 border border-red-500/30"
              : transaction.decision === "HOLD"
              ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
              : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
          }`}
        >
          {transaction.decision} ({transaction.risk_score}/100)
        </span>
      </div>

      {actionStatus && (
        <div className="p-3 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs rounded-lg font-mono-code flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{actionStatus}</span>
        </div>
      )}

      {/* Human Readable Explainable AI Summary */}
      <div className="p-3.5 bg-white/[0.02] rounded-lg border border-white/10 space-y-1.5">
        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">Explainable AI Reason Code</span>
        <p className="text-xs text-amber-300 font-mono-code leading-relaxed">{transaction.human_explanation}</p>
      </div>

      {/* SHAP Feature Importance Chart */}
      <ShapBarChart features={transaction.top_contributing_features} />

      {/* Device & Location Intelligence */}
      <div className="grid grid-cols-2 gap-3 text-xs font-mono-code">
        <div className="p-3 bg-white/[0.02] rounded-lg border border-white/5 space-y-1">
          <div className="flex items-center gap-1.5 text-gray-400">
            <MapPin className="w-3.5 h-3.5 text-blue-400" />
            <span>Location</span>
          </div>
          <p className="text-white font-semibold">{transaction.location.city}, {transaction.location.country}</p>
        </div>

        <div className="p-3 bg-white/[0.02] rounded-lg border border-white/5 space-y-1">
          <div className="flex items-center gap-1.5 text-gray-400">
            <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            <span>IP Address</span>
          </div>
          <p className="text-white font-semibold">{transaction.ip_address}</p>
        </div>

        <div className="p-3 bg-white/[0.02] rounded-lg border border-white/5 space-y-1">
          <div className="flex items-center gap-1.5 text-gray-400">
            <Smartphone className="w-3.5 h-3.5 text-purple-400" />
            <span>Device ID</span>
          </div>
          <p className="text-white font-semibold truncate">{transaction.device_id}</p>
        </div>

        <div className="p-3 bg-white/[0.02] rounded-lg border border-white/5 space-y-1">
          <div className="flex items-center gap-1.5 text-gray-400">
            <History className="w-3.5 h-3.5 text-amber-400" />
            <span>Latency</span>
          </div>
          <p className="text-white font-semibold">{transaction.prediction_time_ms} ms</p>
        </div>
      </div>

      {/* Analyst Action Mitigation Buttons */}
      <div className="pt-2 border-t border-white/10 space-y-2">
        <span className="text-[10px] uppercase font-mono-code text-gray-400 block mb-2">Analyst Action Controls</span>
        
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleAction("Transaction Approved")}
            className="flex items-center justify-center gap-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 py-2 rounded-lg text-xs font-mono-code font-semibold transition"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Approve Override</span>
          </button>

          <button
            onClick={() => handleAction("Transaction Rejected")}
            className="flex items-center justify-center gap-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 py-2 rounded-lg text-xs font-mono-code font-semibold transition"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Block Transaction</span>
          </button>

          <button
            onClick={() => handleAction(`Account ${transaction.customer_id} Frozen`)}
            className="flex items-center justify-center gap-1.5 bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 border border-amber-500/30 py-2 rounded-lg text-xs font-mono-code font-semibold transition"
          >
            <UserX className="w-3.5 h-3.5" />
            <span>Freeze Customer</span>
          </button>

          <button
            onClick={() => handleAction(`Device ${transaction.device_id} Blacklisted`)}
            className="flex items-center justify-center gap-1.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 border border-purple-500/30 py-2 rounded-lg text-xs font-mono-code font-semibold transition"
          >
            <Ban className="w-3.5 h-3.5" />
            <span>Blacklist Device</span>
          </button>
        </div>
      </div>
    </div>
  );
}