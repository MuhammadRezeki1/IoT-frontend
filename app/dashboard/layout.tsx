"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  X,
  ChevronDown,
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

type Notification = {
  id: string;
  type: "success" | "warning" | "info";
  title: string;
  message: string;
  time: string;
  read: boolean;
};

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
              aria-label="Close sidebar"
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
            <NotificationDropdown />
            <ProfileDropdown />
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

// ================= NOTIFICATION DROPDOWN COMPONENT =================
function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "warning",
      title: "High Voltage Alert",
      message: "Voltage exceeded threshold at 14:32",
      time: "2 hours ago",
      read: false,
    },
    {
      id: "2",
      type: "warning",
      title: "Overcurrent Warning",
      message: "Current limit reached on main line",
      time: "3 hours ago",
      read: false,
    },
    {
      id: "3",
      type: "success",
      title: "System Normal",
      message: "All systems operating normally",
      time: "5 hours ago",
      read: true,
    },
    {
      id: "4",
      type: "info",
      title: "Daily Report",
      message: "Energy report generated successfully",
      time: "1 day ago",
      read: true,
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle size={20} className="text-green-600" />;
      case "warning":
        return <AlertTriangle size={20} className="text-yellow-600" />;
      case "info":
        return <Info size={20} className="text-blue-600" />;
      default:
        return <Info size={20} className="text-gray-600" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell size={20} className="text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] bg-red-500 text-white text-xs font-bold rounded-full px-1">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 animate-slideDown">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500">
                <Bell size={32} className="mx-auto mb-2 text-gray-400" />
                <p>No notifications</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    !notif.read ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">{getIcon(notif.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-bold text-gray-900">
                          {notif.title}
                        </h4>
                        <button
                          onClick={() => deleteNotification(notif.id)}
                          className="flex-shrink-0 p-1 hover:bg-gray-200 rounded transition-colors"
                        >
                          <X size={14} className="text-gray-500" />
                        </button>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">{notif.time}</span>
                        {!notif.read && (
                          <button
                            onClick={() => markAsRead(notif.id)}
                            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                          >
                            Mark as read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="px-4 py-3 border-t border-gray-200 text-center">
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View all notifications
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

// ================= PROFILE DROPDOWN COMPONENT =================
function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    // Handle logout logic here
    console.log("Logging out...");
    router.push("/");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 hover:bg-gray-100 rounded-lg px-2 py-1 transition-colors"
      >
        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
          U
        </div>
        <div className="hidden md:block text-left">
          <p className="text-sm font-semibold text-gray-700">Admin User</p>
          <p className="text-xs text-gray-500">admin@example.com</p>
        </div>
        <ChevronDown
          size={16}
          className={`text-gray-500 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 animate-slideDown">
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                U
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">Admin User</p>
                <p className="text-xs text-gray-500 truncate">admin@example.com</p>
              </div>
            </div>
          </div>

          <div className="py-2">
            <button className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left">
              <User size={18} className="text-gray-600" />
              <span className="text-sm text-gray-700 font-medium">My Profile</span>
            </button>
            <button
              onClick={() => {
                setIsOpen(false);
                router.push("/settings");
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left"
            >
              <Settings size={18} className="text-gray-600" />
              <span className="text-sm text-gray-700 font-medium">Settings</span>
            </button>
          </div>

          <div className="border-t border-gray-200 py-2">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 transition-colors text-left group"
            >
              <LogOut size={18} className="text-gray-600 group-hover:text-red-600" />
              <span className="text-sm text-gray-700 font-medium group-hover:text-red-600">
                Logout
              </span>
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
}