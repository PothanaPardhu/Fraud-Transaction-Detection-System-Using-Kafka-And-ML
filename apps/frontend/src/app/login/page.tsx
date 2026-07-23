// apps/frontend/src/app/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { UserRole } from "@/types";
import { ShieldAlert, KeyRound, User, ArrowRight, Lock, CheckCircle2 } from "lucide-react";

export default function LoginPage() {
  const router = Router();
  const { login } = useAuthStore();
  const [email, setEmail] = useState("pardhu@fraudshield.ai");
  const [role, setRole] = useState<UserRole>("SUPER_ADMIN");
  const [mfaCode, setMfaCode] = useState("882109");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      login(email, role);
      setIsLoading(false);
      router.push("/dashboard");
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center p-6 selection:bg-blue-500 selection:text-white">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 rounded-2xl glass-card border border-white/10 overflow-hidden shadow-2xl">
        {/* Left Section: Enterprise Branding */}
        <div className="p-8 bg-gradient-to-br from-blue-900/30 via-[#0B0F19] to-indigo-950/40 flex flex-col justify-between border-b md:border-b-0 md:border-r border-white/10">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <div>
                <h1 className="font-bold text-lg text-white">FraudShield AI</h1>
                <p className="text-[10px] text-gray-400 font-mono-code">Enterprise SOC Portal</p>
              </div>
            </div>

            <div className="space-y-3 pt-6">
              <h2 className="text-xl font-bold text-white">Command Center Access</h2>
              <p className="text-xs text-gray-400 leading-relaxed font-sans">
                Authenticate using multi-factor credentials to access real-time event streams, model explainability, and analyst controls.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2 font-mono-code text-[11px] text-gray-400">
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>TLS 1.3 Encrypted Session</span>
            </div>
            <div>Cluster: US-EAST-1 (Active)</div>
          </div>
        </div>

        {/* Right Section: Form */}
        <div className="p-8 space-y-6 flex flex-col justify-center">
          <div>
            <h3 className="text-lg font-bold text-white">Sign In</h3>
            <p className="text-xs text-gray-400 mt-1">Select your access tier and confirm credentials</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-[10px] font-mono-code text-gray-400 uppercase tracking-wider block mb-1.5">
                Corporate Identity
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#111827] border border-white/10 rounded-lg pl-9 pr-4 py-2 text-xs text-white font-mono-code focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-mono-code text-gray-400 uppercase tracking-wider block mb-1.5">
                Role Authority Tier
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full bg-[#111827] border border-white/10 rounded-lg px-3 py-2 text-xs text-blue-300 font-mono-code focus:outline-none focus:border-blue-500"
              >
                <option value="SUPER_ADMIN">Super Administrator (Full Rights)</option>
                <option value="ADMINISTRATOR">System Administrator</option>
                <option value="FRAUD_ANALYST">Fraud Operations Analyst</option>
                <option value="CUSTOMER">Customer View</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-mono-code text-gray-400 uppercase tracking-wider block mb-1.5">
                Authenticator Code (MFA)
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  required
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  className="w-full bg-[#111827] border border-white/10 rounded-lg pl-9 pr-4 py-2 text-xs text-white font-mono-code focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-lg text-xs font-mono-code font-bold transition shadow-lg shadow-blue-600/20 pt-3"
            >
              {isLoading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Authenticate & Enter Console</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}