// apps/frontend/src/app/kafka/page.tsx
"use client";

import { useState, useEffect } from "react";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  BarChart, 
  Bar 
} from "recharts";
import { Cpu, Server, Activity, Layers } from "lucide-react";

interface TopicInfo {
  name: string;
  partitions: number;
  replicationFactor: number;
  messageCount: number;
  status: "HEALTHY" | "LAGGING" | "DLQ_TRIGGERED";
  color: string;
}

const KAFKA_TOPICS: TopicInfo[] = [
  { name: "incoming-transactions", partitions: 6, replicationFactor: 3, messageCount: 142850, status: "HEALTHY", color: "#3B82F6" },
  { name: "validated-transactions", partitions: 6, replicationFactor: 3, messageCount: 142812, status: "HEALTHY", color: "#06B6D4" },
  { name: "fraud-transactions", partitions: 4, replicationFactor: 3, messageCount: 12410, status: "HEALTHY", color: "#EF4444" },
  { name: "approved-transactions", partitions: 4, replicationFactor: 3, messageCount: 128400, status: "HEALTHY", color: "#10B981" },
  { name: "blocked-transactions", partitions: 4, replicationFactor: 3, messageCount: 2002, status: "HEALTHY", color: "#F59E0B" },
  { name: "notifications", partitions: 2, replicationFactor: 2, messageCount: 8910, status: "HEALTHY", color: "#8B5CF6" },
  { name: "audit-events", partitions: 2, replicationFactor: 2, messageCount: 142850, status: "HEALTHY", color: "#64748B" },
  { name: "dlq-transactions", partitions: 2, replicationFactor: 2, messageCount: 38, status: "DLQ_TRIGGERED", color: "#DC2626" },
];

const PARTITION_LOAD = [
  { partition: "P-0", count: 24100 },
  { partition: "P-1", count: 23800 },
  { partition: "P-2", count: 24500 },
  { partition: "P-3", count: 23900 },
  { partition: "P-4", count: 22800 },
  { partition: "P-5", count: 23750 },
];

export default function KafkaMonitorPage() {
  const [lagData, setLagData] = useState<any[]>([]);

  useEffect(() => {
    const initial = Array.from({ length: 12 }, (_, i) => ({
      time: `${i * 5}s ago`,
      workerGroupA: Math.floor(Math.random() * 8) + 2,
      workerGroupB: Math.floor(Math.random() * 15) + 5,
    })).reverse();
    setLagData(initial);

    const interval = setInterval(() => {
      setLagData((prev) => [
        ...prev.slice(1),
        {
          time: "Just now",
          workerGroupA: Math.floor(Math.random() * 8) + 2,
          workerGroupB: Math.floor(Math.random() * 15) + 5,
        },
      ]);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <span>Apache Kafka Cluster Stream Monitor</span>
            <Cpu className="w-5 h-5 text-blue-400" />
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Real-time topic partitions, consumer group lag metrics, and event stream throughput.
          </p>
        </div>

        {/* Cluster Status Badge */}
        <div className="flex items-center gap-3 glass-card px-4 py-2 rounded-xl border border-white/10">
          <Server className="w-4 h-4 text-emerald-400" />
          <div className="text-xs font-mono-code">
            <span className="text-gray-400">Broker Cluster: </span>
            <span className="text-emerald-400 font-bold">3/3 ONLINE</span>
          </div>
        </div>
      </div>

      {/* Topic Queues Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {KAFKA_TOPICS.map((topic) => (
          <div key={topic.name} className="glass-card p-4 rounded-xl space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-mono-code text-white truncate max-w-[150px]">{topic.name}</span>
              <span
                className={`text-[9px] font-mono-code font-bold px-1.5 py-0.5 rounded ${
                  topic.status === "DLQ_TRIGGERED"
                    ? "bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse"
                    : "bg-emerald-500/20 text-emerald-400"
                }`}
              >
                {topic.status}
              </span>
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <div>
                {/* FORCED LOCALE EN-US + SUPPRESS HYDRATION WARNING FIX */}
                <span className="text-xl font-bold font-mono-code text-white" suppressHydrationWarning>
                  {topic.messageCount.toLocaleString("en-US")}
                </span>
                <span className="text-[10px] text-gray-400 block font-mono-code">Total Messages</span>
              </div>
              <div className="text-right text-[10px] font-mono-code text-gray-400 space-y-0.5">
                <div>{topic.partitions} Partitions</div>
                <div>RF: {topic.replicationFactor}</div>
              </div>
            </div>

            <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
              <div className="h-full" style={{ width: "85%", backgroundColor: topic.color }} />
            </div>
          </div>
        ))}
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Consumer Lag Line Chart (7 cols) */}
        <div className="lg:col-span-7 glass-card rounded-xl border border-white/10 p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-400" />
                <span>Consumer Group Lag (Events Pending)</span>
              </h3>
              <p className="text-[11px] text-gray-400 font-mono-code">Unprocessed message queue delta per consumer worker</p>
            </div>
            <span className="text-xs font-mono-code text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              LOW LAG (&lt; 20 ms)
            </span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lagData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="time" stroke="#6B7280" fontSize={10} />
                <YAxis stroke="#6B7280" fontSize={10} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#111827", borderColor: "rgba(255,255,255,0.1)", borderRadius: "8px" }}
                  itemStyle={{ fontSize: "11px", fontFamily: "JetBrains Mono" }}
                />
                <Line type="monotone" dataKey="workerGroupA" stroke="#3B82F6" strokeWidth={2} dot={false} name="Worker Group Alpha" />
                <Line type="monotone" dataKey="workerGroupB" stroke="#06B6D4" strokeWidth={2} dot={false} name="Worker Group Beta" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Partition Throughput Distribution (5 cols) */}
        <div className="lg:col-span-5 glass-card rounded-xl border border-white/10 p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-semibold text-white">Partition Load Balancing</h3>
            </div>
            <span className="text-xs font-mono-code text-gray-400">incoming-transactions</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={PARTITION_LOAD} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="partition" stroke="#6B7280" fontSize={10} />
                <YAxis stroke="#6B7280" fontSize={10} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#111827", borderColor: "rgba(255,255,255,0.1)", borderRadius: "8px" }}
                  itemStyle={{ color: "#A855F7", fontSize: "11px", fontFamily: "JetBrains Mono" }}
                />
                <Bar dataKey="count" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
} 