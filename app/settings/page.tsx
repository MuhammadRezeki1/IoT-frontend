"use client";

import { useState } from "react";
import {
  Save,
  RefreshCw,
  CheckCircle,
} from "lucide-react";

/* ================= TYPES ================= */
type TabType = "general" | "device" | "notifications" | "system";

/* ================= MAIN PAGE ================= */
export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("general");
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  /* ===== GENERAL SETTINGS STATE ===== */
  const [homeName, setHomeName] = useState("My Smart Home");
  const [timezone, setTimezone] = useState("UTC-5");

  /* ===== DEVICE SETTINGS STATE ===== */
  const [voltageThreshold, setVoltageThreshold] = useState("240");
  const [currentLimit, setCurrentLimit] = useState("10");
  const [minPowerFactor, setMinPowerFactor] = useState("0.85");

  /* ===== NOTIFICATION SETTINGS STATE ===== */
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [emailAddress, setEmailAddress] = useState("user@example.com");

  /* ===== HANDLE SAVE CHANGES ===== */
  const handleSaveChanges = () => {
    setShowSaveSuccess(true);
    setTimeout(() => {
      setShowSaveSuccess(false);
    }, 3000);
  };

  /* ===== TAB BUTTONS ===== */
  const tabs = [
    { id: "general" as TabType, label: "General" },
    { id: "device" as TabType, label: "Device Settings" },
    { id: "notifications" as TabType, label: "Notifications" },
    { id: "system" as TabType, label: "System" },
  ];

  return (
    <div className="p-8">
      {/* ================= TABS NAVIGATION ================= */}
      <div className="mb-8 animate-slideDown" style={{ animationDelay: "0.1s" }}>
        <div className="flex gap-4 bg-white p-2 rounded-2xl shadow-sm">
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
              style={{
                animation: "slideRight 0.4s ease-out forwards",
                animationDelay: `${0.2 + index * 0.05}s`,
                opacity: 0,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ================= TAB CONTENT ================= */}
      <div className="bg-white rounded-3xl p-8 shadow-sm animate-slideUp" style={{ animationDelay: "0.3s" }}>
        {/* GENERAL TAB */}
        {activeTab === "general" && (
          <div className="animate-fadeIn">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">General Settings</h2>

            {/* HOME NAME */}
            <div className="mb-6">
              <label className="block text-lg font-bold text-gray-900 mb-3">
                Home Name
              </label>
              <input
                type="text"
                value={homeName}
                onChange={(e) => setHomeName(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            {/* TIMEZONE */}
            <div className="mb-8">
              <label className="block text-lg font-bold text-gray-900 mb-3">
                Timezone
              </label>
              <input
                type="text"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            {/* SAVE BUTTON */}
            <button
              onClick={handleSaveChanges}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              <Save size={20} />
              Save Changes
            </button>
          </div>
        )}

        {/* DEVICE SETTINGS TAB */}
        {activeTab === "device" && (
          <div className="animate-fadeIn">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Device Settings</h2>

            {/* VOLTAGE THRESHOLD */}
            <div className="mb-6">
              <label className="block text-lg font-bold text-gray-900 mb-3">
                Voltage Threshold (V)
              </label>
              <input
                type="number"
                value={voltageThreshold}
                onChange={(e) => setVoltageThreshold(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <p className="text-sm text-gray-600 mt-2">
                Alert when voltage exceeds this value
              </p>
            </div>

            {/* CURRENT LIMIT */}
            <div className="mb-6">
              <label className="block text-lg font-bold text-gray-900 mb-3">
                Current Limit (A)
              </label>
              <input
                type="number"
                value={currentLimit}
                onChange={(e) => setCurrentLimit(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <p className="text-sm text-gray-600 mt-2">
                Alert when current exceeds this value
              </p>
            </div>

            {/* MINIMUM POWER FACTOR */}
            <div className="mb-8">
              <label className="block text-lg font-bold text-gray-900 mb-3">
                Minimum Power Factor
              </label>
              <input
                type="text"
                value={minPowerFactor}
                onChange={(e) => setMinPowerFactor(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <p className="text-sm text-gray-600 mt-2">
                Alert when power factor drops below this value
              </p>
            </div>

            {/* SAVE BUTTON */}
            <button
              onClick={handleSaveChanges}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              <Save size={20} />
              Save Changes
            </button>
          </div>
        )}

        {/* NOTIFICATIONS TAB */}
        {activeTab === "notifications" && (
          <div className="animate-fadeIn">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Notification Settings
            </h2>

            {/* EMAIL ALERTS TOGGLE */}
            <div className="mb-8">
              <div className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    Email Alerts
                  </h3>
                  <p className="text-sm text-gray-600">
                    Receive notifications via email
                  </p>
                </div>

                {/* TOGGLE SWITCH */}
                <button
                  onClick={() => setEmailAlerts(!emailAlerts)}
                  className={`relative w-16 h-8 rounded-full transition-colors duration-300 ${
                    emailAlerts ? "bg-blue-600" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform duration-300 ${
                      emailAlerts ? "translate-x-8" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* EMAIL ADDRESS */}
            <div className="mb-8">
              <label className="block text-lg font-bold text-gray-900 mb-3">
                Email Address
              </label>
              <input
                type="email"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            {/* SAVE BUTTON */}
            <button
              onClick={handleSaveChanges}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              <Save size={20} />
              Save Changes
            </button>
          </div>
        )}

        {/* SYSTEM TAB */}
        {activeTab === "system" && (
          <div className="animate-fadeIn">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              System Information
            </h2>

            {/* FIRMWARE VERSION */}
            <div className="mb-6">
              <label className="block text-sm text-gray-600 mb-2">
                Firmware Version
              </label>
              <p className="text-2xl font-bold text-gray-900 font-mono">v2.4.1</p>
            </div>

            {/* LAST UPDATE */}
            <div className="mb-6">
              <label className="block text-sm text-gray-600 mb-2">
                Last Update
              </label>
              <p className="text-2xl font-bold text-gray-900">February 7, 2025</p>
            </div>

            {/* SYSTEM UPTIME */}
            <div className="mb-8">
              <label className="block text-sm text-gray-600 mb-2">
                System Uptime
              </label>
              <p className="text-2xl font-bold text-gray-900">15 days, 7 hours</p>
            </div>

            {/* ACTION BUTTON - HANYA CHECK FOR UPDATES */}
            <div className="flex gap-4">
              <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg">
                <RefreshCw size={20} />
                Check for Updates
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ================= SUCCESS NOTIFICATION ================= */}
      {showSaveSuccess && (
        <div className="fixed top-8 right-8 bg-green-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-slideInRight z-50">
          <CheckCircle size={24} />
          <div>
            <p className="font-bold">Changes Saved!</p>
            <p className="text-sm">Your settings have been updated successfully</p>
          </div>
        </div>
      )}

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

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
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

        .animate-slideInRight {
          animation: slideInRight 0.4s ease-out forwards;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}