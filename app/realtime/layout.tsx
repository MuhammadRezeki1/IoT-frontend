"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Activity,
  Clock,
  Power,
  FileText,
  Bell,
  BarChart3,
  Users,
  Settings,
  ChevronLeft,
} from "lucide-react";

const menus = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Real-time Monitoring", href: "/realtime", icon: Activity },
  { name: "Energy Usage History", href: "/history", icon: Clock },
  { name: "Device & Relay Control", href: "/device", icon: Power },
  { name: "Reports", href: "/reports", icon: FileText },
  { name: "Alerts & Notifications", href: "/alerts", icon: Bell },
  { name: "Power Analysis", href: "/analysis", icon: BarChart3 },
  { name: "User Management", href: "/users", icon: Users },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* ================= SIDEBAR ================= */}
      <aside
        className={`relative bg-white shadow-xl transition-all duration-300 ease-in-out ${
          open ? "w-64" : "w-0"
        }`}
      >
        <div
          className={`h-full overflow-hidden transition-opacity duration-300 ${
            open ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* HEADER */}
          <div className="flex h-20 items-center justify-between px-6 border-b border-gray-200">
            <h1 className="text-xl font-bold text-blue-600">
              Energy Monitor
            </h1>
            <button
              onClick={() => setOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ChevronLeft size={20} className="text-gray-600" />
            </button>
          </div>

          {/* NAVIGATION MENU */}
          <nav className="px-3 py-6 space-y-2 overflow-y-auto h-[calc(100vh-80px)]">
            {menus.map((menu) => {
              const isActive = pathname === menu.href;
              const Icon = menu.icon;

              return (
                <Link
                  key={menu.name}
                  href={menu.href}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                    ${
                      isActive
                        ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md"
                        : "text-gray-700 hover:bg-gray-100"
                    }
                  `}
                >
                  <Icon size={20} className={isActive ? "text-white" : "text-gray-600"} />
                  <span className="text-sm font-medium">{menu.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <div className="flex flex-1 flex-col">
        {/* ================= TOPBAR ================= */}
        <header className="flex h-20 items-center bg-white px-6 shadow-sm border-b border-gray-200">
          {/* LEFT SECTION - Toggle button when sidebar is closed */}
          <div className="flex items-center gap-4">
            {!open && (
              <button
                onClick={() => setOpen(true)}
                className="rounded-lg p-2 hover:bg-gray-100 transition"
                aria-label="Open sidebar"
              >
                <ChevronLeft size={20} className="rotate-180 text-gray-600" />
              </button>
            )}
            
            <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          </div>

          {/* SEARCH BAR */}
          <div className="ml-6 flex-1 max-w-md">
            <div className="relative">
              <input
                type="text"
                placeholder="Search devices, metrics..."
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <svg
                className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {/* RIGHT SECTION */}
          <div className="ml-auto flex items-center gap-4">
            {/* NOTIFICATION ICON */}
            <button className="relative p-2 hover:bg-gray-100 rounded-lg transition">
              <Bell size={20} className="text-gray-600" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            </button>

            {/* USER AVATAR */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                U
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-semibold text-gray-700">Admin User</p>
                <p className="text-xs text-gray-500">admin@example.com</p>
              </div>
            </div>
          </div>
        </header>

        {/* ================= CONTENT ================= */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}