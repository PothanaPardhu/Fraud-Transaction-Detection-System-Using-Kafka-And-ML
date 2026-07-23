// apps/frontend/src/app/workbench/page.tsx
"use client";

import { useState } from "react";
import { useWebSocket } from "@/hooks/useWebSocket";
import { Transaction } from "@/types";
import InspectionPanel from "@/components/dashboard/InspectionPanel";
import { Search, Filter, AlertTriangle } from "lucide-react";

export default function AnalystWorkbenchPage() {
  const { transactions } = useWebSocket();
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDecision, setFilterDecision] = useState<string>("ALL");

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch =
      t.transaction_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.customer_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.merchant_name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDecision = filterDecision === "ALL" || t.decision === filterDecision;

    return matchesSearch && matchesDecision;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Workbench Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <span>Fraud Analyst Workbench</span>
            <AlertTriangle className="w-5 h-5 text-amber-400" />
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Real-time threat investigation queue, SHAP explainability breakdown, and direct mitigation controls.
          </p>
        </div>
      </div>

      {/* Main Split-Screen Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-180px)]">
        {/* Left Column: Transaction Stream & Search Table (7 cols) */}
        <div className="lg:col-span-7 glass-card rounded-xl border border-white/10 p-5 flex flex-col h-full">
          {/* Search & Filter Controls */}
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search ID, Customer, or Merchant..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#111827] border border-white/10 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-gray-500 font-mono-code focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-[#111827] border border-white/10 rounded-lg px-2.5 py-1.5">
              <Filter className="w-3.5 h-3.5 text-gray-400" />
              <select
                value={filterDecision}
                onChange={(e) => setFilterDecision(e.target.value)}
                className="bg-transparent text-xs text-gray-300 font-mono-code outline-none"
              >
                <option value="ALL">All Events</option>
                <option value="BLOCK">Blocked Only</option>
                <option value="HOLD">Held / Review</option>
                <option value="APPROVE">Approved</option>
              </select>
            </div>
          </div>

          {/* Filtered Stream Table */}
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-[#0B0F19] z-10 border-b border-white/10">
                <tr className="text-gray-400 font-mono-code uppercase text-[10px] tracking-wider">
                  <th className="pb-3 pl-2">Transaction ID</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Risk Score</th>
                  <th className="pb-3">Decision</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono-code">
                {filteredTransactions.map((txn) => {
                  const isSelected = selectedTxn?.transaction_id === txn.transaction_id;
                  const isBlocked = txn.decision === "BLOCK";

                  return (
                    <tr
                      key={txn.transaction_id}
                      onClick={() => setSelectedTxn(txn)}
                      className={`cursor-pointer transition ${
                        isSelected
                          ? "bg-blue-600/20 border-l-2 border-blue-500"
                          : "hover:bg-white/[0.03]"
                      }`}
                    >
                      <td className="py-3 pl-2 text-blue-400 font-semibold">{txn.transaction_id}</td>
                      <td className="py-3 text-gray-300">{txn.customer_id}</td>
                      <td className="py-3 text-white font-bold">${txn.amount.toFixed(2)}</td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            txn.risk_score >= 70
                              ? "bg-red-500/20 text-red-400"
                              : txn.risk_score >= 40
                              ? "bg-amber-500/20 text-amber-400"
                              : "bg-emerald-500/20 text-emerald-400"
                          }`}
                        >
                          {txn.risk_score}/100
                        </span>
                      </td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isBlocked
                              ? "bg-red-500/10 text-red-400"
                              : txn.decision === "HOLD"
                              ? "bg-amber-500/10 text-amber-400"
                              : "bg-emerald-500/10 text-emerald-400"
                          }`}
                        >
                          {txn.decision}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Deep Inspection Panel (5 cols) */}
        <div className="lg:col-span-5 h-full">
          <InspectionPanel transaction={selectedTxn || filteredTransactions[0] || null} />
        </div>
      </div>
    </div>
  );
}