// apps/frontend/src/components/layout/Topbar.tsx
"use client";

import { Bell, Activity, Search } from "lucide-react";

export default function Topbar() {
  return (
    <header className="h-16 border-b border-white/10 bg-[#0B0F19]/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Search Bar */}
      <div className="relative w-80">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search Transaction ID, Customer, or IP..."
          className="w-full bg-[#111827] border border-white/10 rounded-lg pl-9 pr-4 py-1.5 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 font-mono-code transition"
        />
      </div>

      {/* Status Badges */}
      <div className="flex items-center gap-4">
        {/* Live Stream Indicator */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-xs font-medium text-emerald-400 font-mono-code">KAFKA STREAM LIVE</span>
        </div>

        {/* Engine Latency */}
        <div className="flex items-center gap-1.5 text-xs text-gray-400 font-mono-code bg-white/5 px-2.5 py-1 rounded border border-white/10">
          <Activity className="w-3.5 h-3.5 text-blue-400" />
          <span>8.4 ms avg</span>
        </div>

        {/* Notifications */}
        <button className="p-2 text-gray-400 hover:text-white rounded-lg bg-white/5 hover:bg-white/10 relative transition">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>
      </div>
    </header>
  );
}