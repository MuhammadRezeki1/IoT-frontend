"use client";

import { useState, useEffect, JSX } from "react";
import { Power, Lightbulb, Fan, Tv, Zap } from "lucide-react";

/* ================= TYPES ================= */
type Device = {
  id: string;
  name: string;
  power: number;
  status: "ON" | "OFF";
  icon: "light" | "fan" | "tv";
};

/* ================= MAIN PAGE ================= */
export default function DeviceRelayControlPage() {
  const [relayStatus, setRelayStatus] = useState<boolean>(true);
  const [automationEnabled, setAutomationEnabled] = useState<boolean>(false);
  const [devices, setDevices] = useState<Device[]>([
    { id: "1", name: "Living Room Light", power: 60, status: "ON", icon: "light" },
    { id: "2", name: "Ceiling Fan", power: 75, status: "OFF", icon: "fan" },
    { id: "3", name: "TV", power: 120, status: "ON", icon: "tv" },
    { id: "4", name: "Kitchen Light", power: 40, status: "OFF", icon: "light" },
  ]);

  /* ===== TOGGLE RELAY ===== */
  const handleRelayToggle = () => {
    setRelayStatus(!relayStatus);
  };

  /* ===== TOGGLE AUTOMATION ===== */
  const handleAutomationToggle = () => {
    setAutomationEnabled(!automationEnabled);
  };

  /* ===== TOGGLE DEVICE ===== */
  const handleDeviceToggle = (deviceId: string) => {
    setDevices(
      devices.map((device) =>
        device.id === deviceId
          ? { ...device, status: device.status === "ON" ? "OFF" : "ON" }
          : device
      )
    );
  };

  /* ===== GET DEVICE ICON ===== */
  const getDeviceIcon = (icon: string) => {
    switch (icon) {
      case "light":
        return <Lightbulb size={32} className="text-green-600" />;
      case "fan":
        return <Fan size={32} className="text-gray-600" />;
      case "tv":
        return <Tv size={32} className="text-green-600" />;
      default:
        return <Zap size={32} className="text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* ================= HEADER ================= */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">
          Device &amp; Relay Control
        </h1>
        <p className="text-gray-600 mt-2">Control electrical devices remotely</p>
      </div>

      {/* ================= TOP CARDS (RELAY & AUTOMATION) ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        
        {/* ===== RELAY CONTROL CARD ===== */}
        <div className="bg-white rounded-3xl p-8 shadow-sm">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Relay Control
              </h2>
              <p className="text-gray-600 text-sm">Main power relay switch</p>
            </div>
            
            {/* RELAY ICON */}
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center">
              <Power size={32} className="text-green-600" />
            </div>
          </div>

          {/* POWER STATUS BOX */}
          <div className="bg-gray-50 rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  Power Status
                </h3>
                <p className="text-sm text-gray-600">
                  System is {relayStatus ? "active" : "inactive"}
                </p>
              </div>

              {/* TOGGLE SWITCH */}
              <button
                onClick={handleRelayToggle}
                className={`relative w-16 h-8 rounded-full transition-colors duration-300 ${
                  relayStatus ? "bg-green-500" : "bg-gray-300"
                }`}
                aria-label="Toggle relay"
              >
                <span
                  className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform duration-300 ${
                    relayStatus ? "translate-x-8" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* STATUS BADGE */}
          <div className="flex items-center justify-center">
            <span
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm ${
                relayStatus
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              <span
                className={`h-3 w-3 rounded-full ${
                  relayStatus ? "bg-green-600" : "bg-gray-500"
                }`}
              />
              {relayStatus ? "ON" : "OFF"}
            </span>
          </div>
        </div>

        {/* ===== AUTOMATION MODE CARD ===== */}
        <div className="bg-white rounded-3xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Automation Mode
          </h2>

          <div className="bg-gray-50 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  Smart Automation
                </h3>
                <p className="text-sm text-gray-600">Manual control mode</p>
              </div>

              {/* AUTOMATION TOGGLE */}
              <button
                onClick={handleAutomationToggle}
                className={`relative w-16 h-8 rounded-full transition-colors duration-300 ${
                  automationEnabled ? "bg-blue-500" : "bg-gray-300"
                }`}
                aria-label="Toggle automation"
              >
                <span
                  className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform duration-300 ${
                    automationEnabled ? "translate-x-8" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* INFO TEXT */}
          {automationEnabled && (
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm text-blue-800">
                🤖 Automation is enabled. Devices will be controlled automatically
                based on schedules and sensors.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ================= CONNECTED DEVICES ================= */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">
          Connected Devices
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {devices.map((device) => (
            <DeviceCard
              key={device.id}
              device={device}
              onToggle={() => handleDeviceToggle(device.id)}
              getIcon={getDeviceIcon}
            />
          ))}
        </div>
      </div>

      {/* ================= STATISTICS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Devices"
          value={devices.length.toString()}
          subtitle="Connected"
          color="blue"
        />
        <StatCard
          title="Active Devices"
          value={devices.filter((d) => d.status === "ON").length.toString()}
          subtitle="Currently ON"
          color="green"
        />
        <StatCard
          title="Total Power"
          value={devices
            .filter((d) => d.status === "ON")
            .reduce((sum, d) => sum + d.power, 0)
            .toString()}
          subtitle="Watts"
          color="orange"
        />
      </div>
    </div>
  );
}

/* ================= DEVICE CARD COMPONENT ================= */
function DeviceCard({
  device,
  onToggle,
  getIcon,
}: {
  device: Device;
  onToggle: () => void;
  getIcon: (icon: string) => JSX.Element;
}) {
  const isOn = device.status === "ON";

  return (
    <div
      className={`rounded-3xl p-6 shadow-sm transition-all ${
        isOn
          ? "bg-linear-to-br from-green-50 to-emerald-50 border-2 border-green-200"
          : "bg-white border-2 border-gray-200"
      }`}
    >
      {/* HEADER */}
      <div className="flex items-start justify-between mb-6">
        {/* ICON */}
        <div
          className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
            isOn ? "bg-green-100" : "bg-gray-100"
          }`}
        >
          {getIcon(device.icon)}
        </div>

        {/* STATUS BADGE */}
        <span
          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${
            isOn
              ? "bg-green-500 text-white"
              : "bg-gray-300 text-gray-600"
          }`}
        >
          <span className={`h-2 w-2 rounded-full ${isOn ? "bg-white" : "bg-gray-500"}`} />
          {device.status}
        </span>
      </div>

      {/* DEVICE INFO */}
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-900 mb-1">{device.name}</h3>
        <p className="text-sm text-gray-600">{device.power} W</p>
      </div>

      {/* TOGGLE BUTTON */}
      <button
        onClick={onToggle}
        className={`w-full py-3 rounded-xl font-bold text-white transition-all ${
          isOn
            ? "bg-red-500 hover:bg-red-600 shadow-lg shadow-red-200"
            : "bg-blue-500 hover:bg-blue-600 shadow-lg shadow-blue-200"
        }`}
      >
        {isOn ? "Turn Off" : "Turn On"}
      </button>
    </div>
  );
}

/* ================= STAT CARD COMPONENT ================= */
function StatCard({
  title,
  value,
  subtitle,
  color,
}: {
  title: string;
  value: string;
  subtitle: string;
  color: "blue" | "green" | "orange";
}) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    orange: "bg-orange-50 text-orange-600",
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <p className="text-sm text-gray-600 mb-2">{title}</p>
      <div className="flex items-end gap-2 mb-2">
        <span className="text-5xl font-bold text-gray-900">{value}</span>
        <span className="text-lg text-gray-500 pb-2">{subtitle}</span>
      </div>
      <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${colorClasses[color]}`}>
        Live Status
      </div>
    </div>
  );
}