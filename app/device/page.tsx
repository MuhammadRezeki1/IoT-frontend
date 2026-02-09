"use client";

import { useState, useEffect, JSX } from "react";
import { Power, Lightbulb, Fan, Tv, Zap, Wifi, WifiOff, RefreshCw } from "lucide-react";

/* ================= TYPES ================= */
type Device = {
  id: string;
  name: string;
  power: number;
  status: "ON" | "OFF";
  icon: "light" | "fan" | "tv";
};

/* ================= API CONFIG ================= */
const API_BASE_URL = 'http://localhost:3001';

/* ================= MAIN PAGE ================= */
export default function DeviceRelayControlPage() {
  const [relayStatus, setRelayStatus] = useState<boolean>(false);
  const [automationEnabled, setAutomationEnabled] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [mqttConnected, setMqttConnected] = useState<boolean>(false);
  const [showNotification, setShowNotification] = useState<string | null>(null);

  const [devices, setDevices] = useState<Device[]>([
    { id: "1", name: "Living Room Light", power: 60, status: "OFF", icon: "light" },
    { id: "2", name: "Ceiling Fan", power: 75, status: "OFF", icon: "fan" },
    { id: "3", name: "TV", power: 120, status: "OFF", icon: "tv" },
    { id: "4", name: "Kitchen Light", power: 40, status: "OFF", icon: "light" },
  ]);

  /* ===== CHECK MQTT STATUS ===== */
  useEffect(() => {
    checkMqttStatus();
    const interval = setInterval(checkMqttStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const checkMqttStatus = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/power/status`);
      const data = await res.json();
      setMqttConnected(data.mqtt_connected);
    } catch (err) {
      console.error('Failed to check MQTT status:', err);
      setMqttConnected(false);
    }
  };

  /* ===== SHOW NOTIFICATION ===== */
  const notify = (message: string) => {
    setShowNotification(message);
    setTimeout(() => setShowNotification(null), 3000);
  };

  /* ===== TOGGLE RELAY (MQTT CONTROL) ===== */
  const handleRelayToggle = async () => {
    if (!mqttConnected) {
      notify('❌ MQTT tidak terhubung! Tidak bisa mengontrol relay.');
      return;
    }

    setLoading(true);
    const newStatus = !relayStatus;
    const command = newStatus ? 'on' : 'off';

    try {
      const res = await fetch(`${API_BASE_URL}/power/control`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: command }),
      });

      const result = await res.json();

      if (result.success) {
        setRelayStatus(newStatus);
        notify(`✅ Relay berhasil di-set ke ${command.toUpperCase()}`);
        
        // Update semua device status sesuai relay
        setDevices(devices.map(d => ({ ...d, status: newStatus ? "ON" : "OFF" })));
      } else {
        notify(`❌ ${result.message}`);
      }
    } catch (err) {
      console.error('Failed to toggle relay:', err);
      notify('❌ Gagal menghubungi server');
    } finally {
      setLoading(false);
    }
  };

  /* ===== REBOOT DEVICE ===== */
  const handleReboot = async () => {
    if (!confirm('⚠️ Yakin ingin reboot device? Semua perangkat akan restart.')) {
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/power/reboot`, {
        method: 'POST',
      });

      const result = await res.json();

      if (result.success) {
        notify('✅ Perintah reboot terkirim ke device');
      } else {
        notify('❌ Gagal mengirim perintah reboot');
      }
    } catch (err) {
      console.error('Failed to reboot:', err);
      notify('❌ Gagal menghubungi server');
    } finally {
      setLoading(false);
    }
  };

  /* ===== TOGGLE AUTOMATION ===== */
  const handleAutomationToggle = () => {
    setAutomationEnabled(!automationEnabled);
    notify(automationEnabled ? '🔧 Automation dimatikan' : '🤖 Automation diaktifkan');
  };

  /* ===== TOGGLE DEVICE ===== */
  const handleDeviceToggle = (deviceId: string) => {
    if (!relayStatus) {
      notify('⚠️ Relay utama harus ON terlebih dahulu!');
      return;
    }

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
        return <Lightbulb size={32} className="text-yellow-600" />;
      case "fan":
        return <Fan size={32} className="text-blue-600" />;
      case "tv":
        return <Tv size={32} className="text-purple-600" />;
      default:
        return <Zap size={32} className="text-gray-600" />;
    }
  };

  return (
    <div className="p-8">
      {/* ================= MQTT STATUS BADGE ================= */}
      <div className="mb-6">
        <div className="flex items-center gap-2">
          {mqttConnected ? (
            <span className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg font-semibold">
              <Wifi size={16} />
              MQTT Connected
            </span>
          ) : (
            <span className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg font-semibold">
              <WifiOff size={16} />
              MQTT Disconnected
            </span>
          )}
          <button
            onClick={checkMqttStatus}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* ================= TOP CARDS (RELAY & AUTOMATION) ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        
        {/* ===== RELAY CONTROL CARD ===== */}
        <div className="bg-white rounded-3xl p-8 shadow-lg border-2 border-gray-100">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Main Relay Control
              </h2>
              <p className="text-gray-600 text-sm">Master power switch via MQTT</p>
            </div>
            
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
              relayStatus ? 'bg-green-100' : 'bg-gray-100'
            }`}>
              <Power size={32} className={relayStatus ? 'text-green-600' : 'text-gray-400'} />
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
                disabled={loading || !mqttConnected}
                className={`relative w-16 h-8 rounded-full transition-all duration-300 ${
                  loading || !mqttConnected 
                    ? 'bg-gray-300 cursor-not-allowed' 
                    : relayStatus 
                      ? "bg-green-500 hover:bg-green-600" 
                      : "bg-gray-300 hover:bg-gray-400"
                }`}
                aria-label="Toggle relay"
              >
                <span
                  className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform duration-300 shadow-md ${
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
                  relayStatus ? "bg-green-600 animate-pulse" : "bg-gray-500"
                }`}
              />
              {relayStatus ? "RELAY ON" : "RELAY OFF"}
            </span>
          </div>
        </div>

        {/* ===== SYSTEM CONTROL CARD ===== */}
        <div className="bg-white rounded-3xl p-8 shadow-lg border-2 border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            System Control
          </h2>

          {/* AUTOMATION MODE */}
          <div className="bg-gray-50 rounded-2xl p-6 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  Smart Automation
                </h3>
                <p className="text-sm text-gray-600">
                  {automationEnabled ? 'Auto mode enabled' : 'Manual control mode'}
                </p>
              </div>

              <button
                onClick={handleAutomationToggle}
                className={`relative w-16 h-8 rounded-full transition-colors duration-300 ${
                  automationEnabled ? "bg-blue-500" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform duration-300 shadow-md ${
                    automationEnabled ? "translate-x-8" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* REBOOT BUTTON */}
          <button
            onClick={handleReboot}
            disabled={loading || !mqttConnected}
            className={`w-full py-4 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 ${
              loading || !mqttConnected
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-orange-500 hover:bg-orange-600 active:scale-95'
            }`}
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Rebooting...' : 'Reboot Device'}
          </button>

          {automationEnabled && (
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm text-blue-800">
                🤖 Automation enabled: Devices will be controlled automatically
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
              relayStatus={relayStatus}
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

      {/* ================= NOTIFICATION ================= */}
      {showNotification && (
        <div className="fixed top-8 right-8 bg-gray-900 text-white px-6 py-4 rounded-2xl shadow-2xl animate-slideInRight z-50 max-w-md">
          <p className="font-semibold">{showNotification}</p>
        </div>
      )}

      <style jsx>{`
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
        .animate-slideInRight {
          animation: slideInRight 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

/* ================= DEVICE CARD COMPONENT ================= */
function DeviceCard({
  device,
  relayStatus,
  onToggle,
  getIcon,
}: {
  device: Device;
  relayStatus: boolean;
  onToggle: () => void;
  getIcon: (icon: string) => JSX.Element;
}) {
  const isOn = device.status === "ON";

  return (
    <div
      className={`rounded-3xl p-6 shadow-lg transition-all border-2 ${
        isOn
          ? "bg-gradient-to-br from-green-50 to-emerald-50 border-green-300"
          : "bg-white border-gray-200"
      }`}
    >
      <div className="flex items-start justify-between mb-6">
        <div
          className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
            isOn ? "bg-white shadow-md" : "bg-gray-100"
          }`}
        >
          {getIcon(device.icon)}
        </div>

        <span
          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${
            isOn
              ? "bg-green-500 text-white"
              : "bg-gray-300 text-gray-600"
          }`}
        >
          <span className={`h-2 w-2 rounded-full ${isOn ? "bg-white animate-pulse" : "bg-gray-500"}`} />
          {device.status}
        </span>
      </div>

      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-900 mb-1">{device.name}</h3>
        <p className="text-sm text-gray-600">{device.power} W</p>
      </div>

      <button
        onClick={onToggle}
        disabled={!relayStatus}
        className={`w-full py-3 rounded-xl font-bold text-white transition-all ${
          !relayStatus
            ? 'bg-gray-300 cursor-not-allowed'
            : isOn
              ? "bg-red-500 hover:bg-red-600 shadow-lg shadow-red-200 active:scale-95"
              : "bg-blue-500 hover:bg-blue-600 shadow-lg shadow-blue-200 active:scale-95"
        }`}
      >
        {!relayStatus ? 'Relay OFF' : isOn ? "Turn Off" : "Turn On"}
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
    <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100">
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