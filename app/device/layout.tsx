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
  User,
  LogOut,
  AlertTriangle,
  CheckCircle,
  Info,
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

const notifications = [
  {
    id: 1,
    type: "warning",
    title: "Voltage spike detected at 14:32",
    time: "5 min ago",
    icon: AlertTriangle,
    bgColor: "bg-yellow-50",
    iconColor: "text-yellow-600",
  },
  {
    id: 2,
    type: "success",
    title: "Daily energy report ready",
    time: "1 hour ago",
    icon: CheckCircle,
    bgColor: "bg-green-50",
    iconColor: "text-green-600",
  },
  {
    id: 3,
    type: "info",
    title: "System operating normally",
    time: "2 hours ago",
    icon: Info,
    bgColor: "bg-blue-50",
    iconColor: "text-blue-600",
  },
];

export default function DeviceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
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
          <div className="flex h-20 items-center justify-between px-6 border-b border-gray-200">
            <h1 className="text-xl font-bold text-blue-600">Energy Monitor</h1>
            <button
              onClick={() => setOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ChevronLeft size={20} className="text-gray-600" />
            </button>
          </div>

          <nav className="px-3 py-6 space-y-2 overflow-y-auto h-[calc(100vh-80px)]">
            {menus.map((menu) => {
              const isActive = pathname === menu.href;
              const Icon = menu.icon;
              return (
                <Link
                  key={menu.name}
                  href={menu.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Icon size={20} className={isActive ? "text-white" : "text-gray-600"} />
                  <span className="text-sm font-medium">{menu.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex h-20 items-center bg-white px-6 shadow-sm border-b border-gray-200">
          <div className="flex items-center gap-4">
            {!open && (
              <button onClick={() => setOpen(true)} className="rounded-lg p-2 hover:bg-gray-100 transition">
                <ChevronLeft size={20} className="rotate-180 text-gray-600" />
              </button>
            )}
            <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          </div>

          <div className="ml-6 flex-1 max-w-md">
            <div className="relative">
              <input
                type="text"
                placeholder="Search devices, metrics..."
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-4">
            <div className="relative">
              <button 
                onClick={() => {
                  setNotifOpen(!notifOpen);
                  setProfileOpen(false);
                }}
                className="relative p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <Bell size={20} className="text-gray-600" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 animate-slideDown">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="font-bold text-lg text-gray-900">Notifications</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map((notif) => {
                      const Icon = notif.icon;
                      return (
                        <div key={notif.id} className="p-4 border-b border-gray-100 hover:bg-gray-50 transition cursor-pointer">
                          <div className="flex gap-3">
                            <div className={`p-2 rounded-lg ${notif.bgColor} shrink-0`}>
                              <Icon size={20} className={notif.iconColor} />
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900 text-sm">{notif.title}</p>
                              <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="p-3 border-t border-gray-200 text-center">
                    <button className="text-sm text-blue-600 font-semibold hover:text-blue-700">
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => {
                  setProfileOpen(!profileOpen);
                  setNotifOpen(false);
                }}
                className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-lg transition"
              >
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">U</div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-semibold text-gray-700">Admin User</p>
                  <p className="text-xs text-gray-500">admin@example.com</p>
                </div>
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 animate-slideDown">
                  <div className="p-4 border-b border-gray-200">
                    <p className="font-bold text-gray-900">My Account</p>
                  </div>
                  <div className="py-2">
                    <Link href="/profile" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition">
                      <User size={18} className="text-gray-600" />
                      <span className="text-sm text-gray-700">Profile</span>
                    </Link>
                    <Link href="/settings" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition">
                      <Settings size={18} className="text-gray-600" />
                      <span className="text-sm text-gray-700">Settings</span>
                    </Link>
                  </div>
                  <div className="border-t border-gray-200 py-2">
                    <button onClick={() => console.log("Logging out...")} className="flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition w-full text-left">
                      <LogOut size={18} className="text-red-600" />
                      <span className="text-sm text-red-600 font-semibold">Log out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>

      {(notifOpen || profileOpen) && (
        <div className="fixed inset-0 z-40" onClick={() => { setNotifOpen(false); setProfileOpen(false); }} />
      )}

      <style jsx>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideDown {
          animation: slideDown 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
}