// apps/frontend/src/components/layout/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  ShieldAlert, 
  LayoutDashboard, 
  UserCheck, 
  BarChart3, 
  Cpu, 
  Sliders, 
  User, 
  LogOut,
  ChevronRight
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { UserRole } from "@/types";

interface NavItem {
  label: string;
  href: string;
  icon: any;
  allowedRoles: UserRole[];
}

const navItems: NavItem[] = [
  {
    label: "Admin Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
    allowedRoles: ["SUPER_ADMIN", "ADMINISTRATOR"],
  },
  {
    label: "Analyst Workbench",
    href: "/workbench",
    icon: UserCheck,
    allowedRoles: ["SUPER_ADMIN", "ADMINISTRATOR", "FRAUD_ANALYST"],
  },
  {
    label: "Fraud Analytics",
    href: "/analytics",
    icon: BarChart3,
    allowedRoles: ["SUPER_ADMIN", "ADMINISTRATOR", "FRAUD_ANALYST"],
  },
  {
    label: "Kafka Stream Monitor",
    href: "/kafka",
    icon: Cpu,
    allowedRoles: ["SUPER_ADMIN", "ADMINISTRATOR"],
  },
  {
    label: "Rule Engine Config",
    href: "/rules",
    icon: Sliders,
    allowedRoles: ["SUPER_ADMIN", "ADMINISTRATOR"],
  },
  {
    label: "Customer Portal",
    href: "/customer",
    icon: User,
    allowedRoles: ["SUPER_ADMIN", "CUSTOMER"],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, setRole, logout } = useAuthStore();

  const currentRole = user?.role || "SUPER_ADMIN";

  return (
    <aside className="w-64 bg-[#0B0F19]/90 border-r border-white/10 flex flex-col justify-between h-screen sticky top-0 backdrop-blur-xl z-30">
      <div>
        {/* Brand Header */}
        <div className="p-5 flex items-center gap-3 border-b border-white/10">
          <div className="p-2 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-base tracking-wide text-white">FraudShield AI</h1>
            <p className="text-[11px] text-gray-400 font-mono-code">v2.4.0 • Enterprise</p>
          </div>
        </div>

        {/* Role Switcher */}
        <div className="px-4 py-3 border-b border-white/5 bg-white/[0.02]">
          <label className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold block mb-1">
            Simulate Role View
          </label>
          <select
            value={currentRole}
            onChange={(e) => setRole(e.target.value as UserRole)}
            className="w-full bg-[#111827] text-xs text-blue-300 border border-white/10 rounded px-2 py-1.5 outline-none focus:border-blue-500"
          >
            <option value="SUPER_ADMIN">Super Admin</option>
            <option value="ADMINISTRATOR">Administrator</option>
            <option value="FRAUD_ANALYST">Fraud Analyst</option>
            <option value="CUSTOMER">Customer View</option>
          </select>
        </div>

        {/* Nav List */}
        <nav className="p-3 space-y-1">
          {navItems
            .filter((item) => item.allowedRoles.includes(currentRole))
            .map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                    isActive
                      ? "bg-blue-600/20 text-blue-400 border border-blue-500/30 font-medium"
                      : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? "text-blue-400" : "text-gray-400"}`} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-4 h-4 text-blue-400" />}
                </Link>
              );
            })}
        </nav>
      </div>

      {/* Footer Profile */}
      <div className="p-4 border-t border-white/10 bg-white/[0.01]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-xs text-white">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : "PP"}
            </div>
            <div>
              <p className="text-xs font-semibold text-white truncate max-w-[110px]">{user?.name}</p>
              <p className="text-[10px] text-gray-400 font-mono-code">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="p-1.5 text-gray-400 hover:text-red-400 rounded-lg hover:bg-white/5 transition"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}