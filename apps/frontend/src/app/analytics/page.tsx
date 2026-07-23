// apps/frontend/src/app/analytics/page.tsx
"use client";

import { useState } from "react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  BarChart, 
  Bar, 
  Cell, 
  PieChart, 
  Pie 
} from "recharts";
import { Download, Calendar, Filter, PieChart as PieIcon, TrendingUp, MapPin, CreditCard } from "lucide-react";

// Mock Aggregated Analytics Data
const TREND_DATA = [
  { time: "00:00", total: 420, fraud: 12 },
  { time: "04:00", total: 180, fraud: 8 },
  { time: "08:00", total: 890, fraud: 34 },
  { time: "12:00", total: 1450, fraud: 68 },
  { time: "16:00", total: 1200, fraud: 52 },
  { time: "20:00", total: 980, fraud: 41 },
];

const COUNTRY_DATA = [
  { country: "US", count: 142, rate: "3.2%" },
  { country: "GB", count: 88, rate: "2.8%" },
  { country: "IN", count: 112, rate: "4.1%" },
  { country: "JP", count: 34, rate: "1.1%" },
  { country: "DE", count: 56, rate: "2.0%" },
];

const METHOD_DATA = [
  { name: "Credit Card", value: 45, color: "#3B82F6" },
  { name: "UPI / P2P", value: 30, color: "#06B6D4" },
  { name: "Net Banking", value: 15, color: "#F59E0B" },
  { name: "Crypto Wallet", value: 10, color: "#EF4444" },
];

export default function AnalyticsDashboardPage() {
  const [timeframe, setTimeframe] = useState("24h");

  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8,Time,Total Transactions,Fraud Blocked\n" + 
      TREND_DATA.map(e => `${e.time},${e.total},${e.fraud}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `fraudshield_analytics_${timeframe}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header & Export Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <span>Fraud Intelligence & Analytics</span>
            <TrendingUp className="w-5 h-5 text-blue-400" />
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Historical threat patterns, geographic concentration, and payment channel risk profiles.
          </p>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-[#111827] border border-white/10 rounded-lg p-1 text-xs font-mono-code">
            {["24h", "7d", "30d", "YTD"].map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1 rounded transition ${
                  timeframe === tf ? "bg-blue-600 text-white font-bold" : "text-gray-400 hover:text-white"
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10 px-3 py-1.5 rounded-lg text-xs font-mono-code font-semibold transition"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Hero Chart: Hourly Fraud vs Total Volume */}
      <div className="glass-card rounded-xl border border-white/10 p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div>
            <h3 className="text-sm font-semibold text-white">Transaction Volume vs. Fraud Attempts</h3>
            <p className="text-[11px] text-gray-400 font-mono-code">Comparing total inbound throughput to blocked threat events</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono-code">
            <span className="flex items-center gap-1.5 text-blue-400">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Total Volume
            </span>
            <span className="flex items-center gap-1.5 text-red-400">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Blocked Threats
            </span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={TREND_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorFraud" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" stroke="#6B7280" fontSize={11} />
              <YAxis stroke="#6B7280" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: "#111827", borderColor: "rgba(255,255,255,0.1)", borderRadius: "8px" }}
                itemStyle={{ fontSize: "12px", fontFamily: "JetBrains Mono" }}
              />
              <Area type="monotone" dataKey="total" stroke="#3B82F6" fillOpacity={1} fill="url(#colorTotal)" />
              <Area type="monotone" dataKey="fraud" stroke="#EF4444" fillOpacity={1} fill="url(#colorFraud)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid: Geographic & Channel Risk Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Country Threat Breakdown (7 cols) */}
        <div className="lg:col-span-7 glass-card rounded-xl border border-white/10 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-white">Geographic Fraud Concentration</h3>
            </div>
            <span className="text-xs font-mono-code text-gray-400">Top Inbound Regions</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={COUNTRY_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="country" stroke="#6B7280" fontSize={11} />
                <YAxis stroke="#6B7280" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#111827", borderColor: "rgba(255,255,255,0.1)", borderRadius: "8px" }}
                  itemStyle={{ color: "#10B981", fontSize: "12px", fontFamily: "JetBrains Mono" }}
                />
                <Bar dataKey="count" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Method Risk Shares (5 cols) */}
        <div className="lg:col-span-5 glass-card rounded-xl border border-white/10 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-semibold text-white">Fraud by Payment Method</h3>
            </div>
          </div>

          <div className="h-44 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={METHOD_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {METHOD_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "#111827", borderColor: "rgba(255,255,255,0.1)", borderRadius: "8px" }}
                  itemStyle={{ fontSize: "11px", fontFamily: "JetBrains Mono" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-2 text-xs font-mono-code pt-2 border-t border-white/5">
            {METHOD_DATA.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-gray-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>{item.name}</span>
                </span>
                <span className="text-gray-400 font-bold">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}