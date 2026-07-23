// apps/frontend/src/components/dashboard/ShapBarChart.tsx
"use client";

import { useState, useEffect } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";

interface ShapBarChartProps {
  features?: Record<string, number>;
}

export default function ShapBarChart({ features }: ShapBarChartProps) {
  const [isMounted, setIsMounted] = useState(false);

  // Prevent SSR dimension calculation mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const defaultFeatures = {
    "Amount Deviation (>3.5x avg)": 0.42,
    "Velocity (5-min window)": 0.28,
    "New Device Fingerprint": 0.18,
    "Geographic Speed Delta": 0.12,
    "High Risk Country Match": 0.08,
  };

  const featureData = Object.entries(features || defaultFeatures).map(([name, weight]) => ({
    name,
    weight: parseFloat((weight * 100).toFixed(1)),
  }));

  if (!isMounted) {
    return (
      <div className="h-44 w-full bg-white/5 animate-pulse rounded-lg flex items-center justify-center text-xs text-gray-500 font-mono-code">
        Loading SHAP Tree Contributions...
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-gray-400 font-mono-code mb-1">
        <span>XGBoost + SHAP Tree Contributions</span>
        <span className="text-blue-400">% Risk Impact</span>
      </div>

      <div className="h-44 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={featureData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <XAxis type="number" stroke="#6B7280" fontSize={10} tickFormatter={(val) => `${val}%`} />
            <YAxis type="category" dataKey="name" stroke="#9CA3AF" fontSize={10} width={150} tickLine={false} />
            <Tooltip
              contentStyle={{ backgroundColor: "#111827", borderColor: "rgba(255,255,255,0.1)", borderRadius: "8px" }}
              itemStyle={{ color: "#3B82F6", fontSize: "11px", fontFamily: "JetBrains Mono" }}
            />
            <Bar dataKey="weight" radius={[0, 4, 4, 0]}>
              {featureData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.weight > 25 ? "#EF4444" : entry.weight > 15 ? "#F59E0B" : "#3B82F6"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}