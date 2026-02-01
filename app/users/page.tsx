"use client";

import { useState } from "react";
import { User, Edit, Trash2, UserPlus, Search } from "lucide-react";

/* ================= TYPES ================= */
type UserRole = "Admin" | "User" | "Viewer";

type UserData = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  lastActive: string;
  avatar?: string;
};

type ActivityLog = {
  id: string;
  userName: string;
  action: string;
  timestamp: string;
};

/* ================= MAIN PAGE ================= */
export default function UserManagementPage() {
  const [searchQuery, setSearchQuery] = useState("");

  /* ===== USER DATA ===== */
  const users: UserData[] = [
    {
      id: "1",
      name: "Bob Johnson",
      email: "bob@example.com",
      role: "User",
      lastActive: "3 days ago",
    },
    {
      id: "2",
      name: "John Doe",
      email: "john@example.com",
      role: "Admin",
      lastActive: "2 hours ago",
    },
    {
      id: "3",
      name: "Jane Smith",
      email: "jane@example.com",
      role: "User",
      lastActive: "1 day ago",
    },
    {
      id: "4",
      name: "Alice Cooper",
      email: "alice@example.com",
      role: "Viewer",
      lastActive: "5 days ago",
    },
  ];

  /* ===== ACTIVITY LOG DATA ===== */
  const activityLogs: ActivityLog[] = [
    {
      id: "1",
      userName: "John Doe",
      action: "Changed voltage threshold",
      timestamp: "2 hours ago",
    },
    {
      id: "2",
      userName: "Jane Smith",
      action: "Viewed energy report",
      timestamp: "1 day ago",
    },
    {
      id: "3",
      userName: "John Doe",
      action: "Added new device",
      timestamp: "2 days ago",
    },
    {
      id: "4",
      userName: "Bob Johnson",
      action: "Updated notification settings",
      timestamp: "3 days ago",
    },
  ];

  /* ===== FILTER USERS ===== */
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  /* ===== GET ROLE BADGE COLOR ===== */
  const getRoleBadgeColor = (role: UserRole) => {
    const colors = {
      Admin: "bg-red-100 text-red-700 border-red-200",
      User: "bg-blue-100 text-blue-700 border-blue-200",
      Viewer: "bg-gray-100 text-gray-700 border-gray-200",
    };
    return colors[role];
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* ================= HEADER ================= */}
      <div className="mb-8 animate-fadeIn">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600 mt-2">Manage users and view activity logs</p>
          </div>

          {/* ADD USER BUTTON */}
          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg">
            <UserPlus size={20} />
            Add User
          </button>
        </div>
      </div>

      {/* ================= SEARCH BAR ================= */}
      <div className="mb-8 animate-slideDown" style={{ animationDelay: "0.1s" }}>
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* ================= USERS LIST ================= */}
      <div className="bg-white rounded-3xl p-8 shadow-sm mb-8 animate-slideUp" style={{ animationDelay: "0.2s" }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-gray-900">Users</h2>
          <span className="text-sm text-gray-600 font-medium">
            {filteredUsers.length} {filteredUsers.length === 1 ? "user" : "users"}
          </span>
        </div>

        <div className="space-y-4">
          {filteredUsers.map((user, index) => (
            <UserCard
              key={user.id}
              user={user}
              getRoleBadgeColor={getRoleBadgeColor}
              delay={`${0.3 + index * 0.05}s`}
            />
          ))}

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No users found matching your search.</p>
            </div>
          )}
        </div>
      </div>

      {/* ================= ACTIVITY LOG ================= */}
      <div className="bg-white rounded-3xl p-8 shadow-sm animate-slideUp" style={{ animationDelay: "0.4s" }}>
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Activity Log</h2>

        <div className="space-y-4">
          {activityLogs.map((log, index) => (
            <ActivityLogCard key={log.id} log={log} delay={`${0.5 + index * 0.05}s`} />
          ))}
        </div>
      </div>

      {/* ================= CUSTOM STYLES ================= */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideRight {
          from {
            opacity: 0;
            transform: translateX(-15px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }

        .animate-slideDown {
          animation: slideDown 0.5s ease-out forwards;
          opacity: 0;
        }

        .animate-slideUp {
          animation: slideUp 0.5s ease-out forwards;
          opacity: 0;
        }

        .animate-slideRight {
          animation: slideRight 0.4s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}

/* ================= USER CARD COMPONENT ================= */
function UserCard({
  user,
  getRoleBadgeColor,
  delay,
}: {
  user: UserData;
  getRoleBadgeColor: (role: UserRole) => string;
  delay: string;
}) {
  return (
    <div
      className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all duration-300 hover:shadow-md animate-slideRight group cursor-pointer"
      style={{ animationDelay: delay }}
    >
      {/* LEFT SECTION - User Info */}
      <div className="flex items-center gap-4 flex-1">
        {/* AVATAR */}
        <div className="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
          {user.avatar || <User size={28} />}
        </div>

        {/* USER DETAILS */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
            {user.name}
          </h3>
          <p className="text-sm text-gray-600">{user.email}</p>
        </div>
      </div>

      {/* MIDDLE SECTION - Role & Last Active */}
      <div className="flex items-center gap-6 mr-6">
        {/* ROLE BADGE */}
        <span
          className={`px-4 py-1.5 rounded-full text-sm font-semibold border-2 ${getRoleBadgeColor(
            user.role
          )}`}
        >
          {user.role}
        </span>

        {/* LAST ACTIVE */}
        <span className="text-sm text-gray-600 font-medium min-w-[100px]">
          {user.lastActive}
        </span>
      </div>

      {/* RIGHT SECTION - Action Buttons */}
      <div className="flex items-center gap-3">
        {/* EDIT BUTTON */}
        <button className="px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-blue-50 hover:border-blue-500 hover:text-blue-600 transition-all duration-300 flex items-center gap-2">
          <Edit size={16} />
          Edit
        </button>

        {/* REMOVE BUTTON */}
        <button className="px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-red-50 hover:border-red-500 hover:text-red-600 transition-all duration-300 flex items-center gap-2">
          <Trash2 size={16} />
          Remove
        </button>
      </div>
    </div>
  );
}

/* ================= ACTIVITY LOG CARD COMPONENT ================= */
function ActivityLogCard({ log, delay }: { log: ActivityLog; delay: string }) {
  return (
    <div
      className="flex items-center gap-4 p-6 bg-blue-50 rounded-2xl hover:bg-blue-100 transition-all duration-300 hover:shadow-md animate-slideRight group cursor-pointer"
      style={{ animationDelay: delay }}
    >
      {/* AVATAR */}
      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
        <User size={24} />
      </div>

      {/* ACTIVITY DETAILS */}
      <div className="flex-1">
        <p className="text-gray-900 font-medium">
          <span className="font-bold text-gray-900">{log.userName}</span>{" "}
          <span className="text-gray-700">{log.action}</span>
        </p>
        <p className="text-sm text-gray-600 mt-1">{log.timestamp}</p>
      </div>
    </div>
  );
}