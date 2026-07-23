// apps/frontend/src/components/layout/Sidebar.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { UserRole } from "@/types";
import {
  LayoutDashboard,
  UserCheck,
  BarChart3,
  Cpu,
  Sliders,
  User,
  ShieldAlert,
  LogOut,
  X,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  allowedRoles: UserRole[];
}

const NAV_ITEMS: NavItem[] = [
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

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  // Prevent SSR/hydration mismatch for Zustand state
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fallback to SUPER_ADMIN if user or user.role is not yet loaded
  const userRole: UserRole = user?.role || "SUPER_ADMIN";

  // Filter menu options based on active role permissions
  const visibleNavItems = NAV_ITEMS.filter((item) =>
    item.allowedRoles.includes(userRole)
  );

  return (
    <aside
      className={`flex h-screen w-64 flex-col justify-between border-r border-white/10 bg-[#0B0F19] p-4 transition-transform duration-200 select-none shrink-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-3 px-2 py-1">
            <div className="p-2 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <span className="font-bold text-sm tracking-wide text-white block">FraudShield AI</span>
              <span className="text-[9px] font-mono-code text-blue-400 block uppercase">
                {mounted ? userRole.replace("_", " ") : "SUPER ADMIN"}
              </span>
            </div>
          </Link>

          <button
            onClick={onClose}
            className="rounded-lg border border-white/10 p-2 text-gray-400 transition hover:bg-white/10 hover:text-white md:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1">
          {visibleNavItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-mono-code transition ${
                  isActive
                    ? "bg-blue-600 text-white font-semibold shadow-lg shadow-blue-600/20"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-gray-400"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Session Footer */}
      <div className="pt-4 border-t border-white/10 space-y-3">
        <div className="px-2">
          <p className="text-xs font-bold text-white font-mono-code truncate">
            {mounted && user?.email ? user.email : "pardhu@fraudshield.ai"}
          </p>
          <span className="text-[10px] text-emerald-400 font-mono-code block mt-0.5">● Session Active</span>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono-code text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}