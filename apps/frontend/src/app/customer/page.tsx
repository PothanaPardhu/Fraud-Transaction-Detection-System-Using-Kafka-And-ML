// apps/frontend/src/app/customer/page.tsx
"use client";

import { ShieldCheck, Smartphone, AlertCircle, Lock, ArrowUpRight } from "lucide-react";

export default function CustomerPortalPage() {
  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <span>Security & Account Protection Portal</span>
          <ShieldCheck className="w-6 h-6 text-emerald-400" />
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          Review personal risk scores, verify authorized hardware devices, and inspect protected payment activity.
        </p>
      </div>

      {/* Risk Gauge Card */}
      <div className="glass-card p-6 rounded-2xl border border-emerald-500/20 bg-emerald-950/10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="text-xs text-emerald-400 font-mono-code font-semibold uppercase tracking-wider">
            ACCOUNT SAFETY INDEX
          </span>
          <h2 className="text-2xl font-bold text-white">Low Fraud Risk Status</h2>
          <p className="text-xs text-gray-300 max-w-md leading-relaxed">
            Your behavioral spending baseline and trusted hardware fingerprints are matched against global threat databases.
          </p>
        </div>

        <div className="text-center p-4 bg-[#111827] rounded-xl border border-white/10 min-w-[140px]">
          <span className="text-3xl font-bold font-mono-code text-emerald-400">12/100</span>
          <span className="text-[10px] text-gray-400 block font-mono-code mt-1">SAFE SCORE</span>
        </div>
      </div>

      {/* Trusted Devices Section */}
      <div className="glass-card p-5 rounded-xl border border-white/10 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-semibold text-white">Recognized & Trusted Devices</h3>
          </div>
          <span className="text-xs font-mono-code text-gray-400">2 Active Devices</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono-code">
          <div className="p-3.5 bg-white/[0.02] rounded-lg border border-white/5 flex items-center justify-between">
            <div>
              <p className="text-white font-semibold">MacBook Pro 16" (M2 Max)</p>
              <p className="text-[10px] text-gray-400">Chrome • San Francisco, US • Active Now</p>
            </div>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">
              TRUSTED
            </span>
          </div>

          <div className="p-3.5 bg-white/[0.02] rounded-lg border border-white/5 flex items-center justify-between">
            <div>
              <p className="text-white font-semibold">iPhone 15 Pro</p>
              <p className="text-[10px] text-gray-400">Mobile App • 2 hours ago</p>
            </div>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">
              TRUSTED
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}