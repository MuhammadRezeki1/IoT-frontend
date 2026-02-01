"use client";

import {
  LayoutGrid,
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
import { usePathname } from "next/navigation";
import Link from "next/link";

const menus = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutGrid },
  { name: "Real-time Monitoring", href: "/realtime", icon: Activity },
  { name: "Energy Usage History", href: "/history", icon: Clock },
  { name: "Device & Relay Control", href: "/device", icon: Power },
  { name: "Reports", href: "/reports", icon: FileText },
  { name: "Alerts & Notifications", href: "/alerts", icon: Bell },
  { name: "Power Analysis", href: "/analysis", icon: BarChart3 },
  { name: "User Management", href: "/users", icon: Users },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-screen bg-white shadow-lg fixed left-0 top-0 overflow-y-auto">
      {/* Header */}
      <div className="h-20 flex items-center justify-between px-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">Energy Monitor</h1>
        <button className="p-2 hover:bg-gray-100 rounded-lg transition">
          <ChevronLeft size={20} className="text-gray-600" />
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="px-3 py-6 space-y-2">
        {menus.map((menu) => {
          const isActive = pathname === menu.href;
          const Icon = menu.icon;

          return (
            <Link
              key={menu.name}
              href={menu.href}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200
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
    </aside>
  );
}