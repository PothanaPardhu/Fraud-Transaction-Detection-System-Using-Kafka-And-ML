// apps/frontend/src/app/rules/page.tsx
"use client";

import { useState } from "react";
import { Sliders, Shield, Plus, ToggleLeft, ToggleRight, CheckCircle2, AlertTriangle, Trash2 } from "lucide-react";

interface Rule {
  id: string;
  name: string;
  description: string;
  condition: string;
  action: "BLOCK" | "HOLD" | "TRIGGER_OTP";
  isActive: boolean;
  type: "THRESHOLD" | "VELOCITY" | "BLACKLIST";
}

const INITIAL_RULES: Rule[] = [
  {
    id: "RULE-101",
    name: "High Value Sudden Velocity Threshold",
    description: "Triggers when single transaction exceeds $3,500 and velocity > 3 in 5 minutes.",
    condition: "amount > 3500 AND tx_count_5m > 3",
    action: "BLOCK",
    isActive: true,
    type: "VELOCITY",
  },
  {
    id: "RULE-102",
    name: "Impossible Travel Speed Spike",
    description: "Flags user when consecutive transactions occur > 900 km/h calculated distance.",
    condition: "speed_kmh > 900",
    action: "BLOCK",
    isActive: true,
    type: "THRESHOLD",
  },
  {
    id: "RULE-103",
    name: "Unrecognized Device First-Time Purchase",
    description: "Requires OTP when device fingerprint is new and transaction amount exceeds $500.",
    condition: "is_new_device == True AND amount > 500",
    action: "TRIGGER_OTP",
    isActive: true,
    type: "THRESHOLD",
  },
  {
    id: "RULE-104",
    name: "Blacklisted Country IP Ingress",
    description: "Holds transaction for analyst review when IP resolves to high-risk region list.",
    condition: "ip_country IN ['HIGH_RISK_LIST']",
    action: "HOLD",
    isActive: false,
    type: "BLACKLIST",
  },
];

export default function RuleEnginePage() {
  const [rules, setRules] = useState<Rule[]>(INITIAL_RULES);
  const [savedStatus, setSavedStatus] = useState<string | null>(null);

  const toggleRule = (id: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isActive: !r.isActive } : r))
    );
    triggerNotice("Rule state updated dynamically");
  };

  const deleteRule = (id: string) => {
    setRules((prev) => prev.filter((r) => r.id !== id));
    triggerNotice("Rule removed from evaluation engine");
  };

  const triggerNotice = (msg: string) => {
    setSavedStatus(msg);
    setTimeout(() => setSavedStatus(null), 3000);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <span>Dynamic Rule Engine Settings</span>
            <Sliders className="w-5 h-5 text-blue-400" />
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Configure risk overrides, velocity parameters, and hard decision policies in real time without restarting backend services.
          </p>
        </div>

        <button
          onClick={() => triggerNotice("New rule modal opened")}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-xs font-mono-code font-bold transition shadow-lg shadow-blue-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Rule</span>
        </button>
      </div>

      {savedStatus && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-lg font-mono-code flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{savedStatus}</span>
        </div>
      )}

      {/* Rules List */}
      <div className="space-y-4">
        {rules.map((rule) => (
          <div
            key={rule.id}
            className={`glass-card p-5 rounded-xl border transition flex flex-col md:flex-row md:items-center justify-between gap-4 ${
              rule.isActive ? "border-white/10" : "border-white/5 opacity-60"
            }`}
          >
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono-code text-blue-400 font-bold">{rule.id}</span>
                <h3 className="text-sm font-semibold text-white">{rule.name}</h3>
                <span
                  className={`text-[9px] font-mono-code font-bold px-2 py-0.5 rounded ${
                    rule.action === "BLOCK"
                      ? "bg-red-500/20 text-red-400 border border-red-500/30"
                      : rule.action === "HOLD"
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                  }`}
                >
                  ACTION: {rule.action}
                </span>
              </div>
              <p className="text-xs text-gray-400">{rule.description}</p>
              <div className="p-2 bg-[#111827] rounded border border-white/5 text-[11px] font-mono-code text-emerald-400 w-fit">
                IF ({rule.condition})
              </div>
            </div>

            {/* Toggle & Action Buttons */}
            <div className="flex items-center gap-4 border-t md:border-t-0 pt-3 md:pt-0 border-white/10">
              <button
                onClick={() => toggleRule(rule.id)}
                className="flex items-center gap-2 text-xs font-mono-code text-gray-300 hover:text-white transition"
              >
                {rule.isActive ? (
                  <ToggleRight className="w-7 h-7 text-emerald-400" />
                ) : (
                  <ToggleLeft className="w-7 h-7 text-gray-600" />
                )}
                <span>{rule.isActive ? "ACTIVE" : "DISABLED"}</span>
              </button>

              <button
                onClick={() => deleteRule(rule.id)}
                className="p-2 text-gray-500 hover:text-red-400 hover:bg-white/5 rounded-lg transition"
                title="Delete Rule"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}