// apps/frontend/src/app/page.tsx
"use client";

import Link from "next/link";
import { 
  ShieldAlert, 
  Zap, 
  Cpu, 
  Lock, 
  ArrowRight, 
  ChevronRight
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0B0F19] text-gray-100 flex flex-col justify-between selection:bg-blue-500 selection:text-white">
      {/* Navigation Header */}
      <nav className="h-20 border-b border-white/10 px-8 flex items-center justify-between sticky top-0 bg-[#0B0F19]/80 backdrop-blur-xl z-50">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <span className="font-bold text-lg tracking-wide text-white">FraudShield AI</span>
            <span className="text-[10px] block font-mono-code text-blue-400">ENTERPRISE SOC v2.4</span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8 text-xs font-mono-code text-gray-400">
          <a href="#features" className="hover:text-white transition">Architecture</a>
          <a href="#metrics" className="hover:text-white transition">Benchmarks</a>
          <a href="#security" className="hover:text-white transition">Compliance</a>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-xs font-mono-code font-bold transition shadow-lg shadow-blue-600/20"
          >
            <span>Launch SOC Console</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 pt-20 pb-16 max-w-6xl mx-auto text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs text-blue-400 font-mono-code">
          <Zap className="w-3.5 h-3.5 text-blue-400" />
          <span>Sub-15ms In-Memory ML Inference Engine</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Real-Time Fraud Prevention for <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-400">
            High-Velocity Payment Streams
          </span>
        </h1>

        <p className="text-gray-400 max-w-2xl mx-auto text-sm md:text-base leading-relaxed font-sans">
          Orchestrate Kafka event queues, sliding-window feature engineering, and Explainable XGBoost decision trees to neutralize fraud in real time.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/login"
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-8 py-3.5 rounded-xl font-mono-code text-sm font-bold transition shadow-xl shadow-blue-600/25"
          >
            <span>Access Analyst Workbench</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Live Architecture Metric Pill Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-12 max-w-4xl mx-auto">
          <div className="glass-card p-4 rounded-xl border border-white/10 text-left">
            <span className="text-[10px] text-gray-400 font-mono-code uppercase block">Latency Benchmark</span>
            <span className="text-2xl font-bold font-mono-code text-cyan-400">&lt; 14.2 ms</span>
          </div>

          <div className="glass-card p-4 rounded-xl border border-white/10 text-left">
            <span className="text-[10px] text-gray-400 font-mono-code uppercase block">Event Processing</span>
            <span className="text-2xl font-bold font-mono-code text-blue-400">10,000+ TPS</span>
          </div>

          <div className="glass-card p-4 rounded-xl border border-white/10 text-left">
            <span className="text-[10px] text-gray-400 font-mono-code uppercase block">Model Precision</span>
            <span className="text-2xl font-bold font-mono-code text-emerald-400">99.4% ROC-AUC</span>
          </div>

          <div className="glass-card p-4 rounded-xl border border-white/10 text-left">
            <span className="text-[10px] text-gray-400 font-mono-code uppercase block">Explainability</span>
            <span className="text-2xl font-bold font-mono-code text-purple-400">SHAP Tree Explainer</span>
          </div>
        </div>
      </section>

      {/* Feature Architecture Section */}
      <section id="features" className="px-6 py-16 border-t border-white/10 bg-white/[0.01]">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold text-white">Enterprise Event Pipeline</h2>
            <p className="text-xs text-gray-400 font-mono-code">Designed for scalable sub-second decision making</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-3">
              <Cpu className="w-8 h-8 text-blue-400" />
              <h3 className="text-base font-bold text-white">Distributed Kafka Queues</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                8 partitioned event streams ensuring load balance across active consumer groups and dead-letter queues.
              </p>
            </div>

            <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-3">
              <Zap className="w-8 h-8 text-emerald-400" />
              <h3 className="text-base font-bold text-white">Redis Velocity Windows</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Sliding-window counters compute real-time velocity metrics across 5-minute, 1-hour, and 24-hour intervals.
              </p>
            </div>

            <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-3">
              <Lock className="w-8 h-8 text-purple-400" />
              <h3 className="text-base font-bold text-white">SHAP Explainable AI</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Every decision includes granular feature attribution weights, eliminating black-box opacity for compliance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 px-8 text-center text-xs font-mono-code text-gray-500">
        <p>FraudShield AI Enterprise • Major Project Demonstration Environment</p>
      </footer>
    </div>
  );
}