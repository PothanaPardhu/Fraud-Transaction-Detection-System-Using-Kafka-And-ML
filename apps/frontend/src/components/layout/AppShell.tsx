// apps/frontend/src/components/layout/AppShell.tsx
"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Public routes where Sidebar & Topbar should NOT appear
  const isPublicRoute = pathname === "/" || pathname === "/login";

  // While mounting or on public pages, render simple container
  if (!mounted || isPublicRoute) {
    return <main className="w-full min-h-screen bg-[#0B0F19]">{children}</main>;
  }

  return (
    <div className="flex min-h-screen w-full bg-[#0B0F19] text-gray-100 overflow-x-hidden">
      {/* Left Sidebar Menu */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 p-2 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}