"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

/* ================= TYPES ================= */
type RawPowerData = {
  id: number;
  tegangan: number;
  arus: number;
  daya_watt: number;
  energi_kwh: number;
  frekuensi: number;
  pf: number;
  created_at: string;
};

type LiveChartData = {
  time: string;
  power: number;
};

/* ================= PAGE ================= */
export default function RealtimeMonitoringPage() {
  const [allData, setAllData] = useState<RawPowerData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentData, setCurrentData] = useState<RawPowerData | null>(null);
  const [liveChartData, setLiveChartData] = useState<LiveChartData[]>([]);
  const [isLive, setIsLive] = useState(true);

  /* ===== FETCH ALL DATA ONCE ===== */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:3001/power");
        const json: RawPowerData[] = await res.json();
        
        if (json.length > 0) {
          setAllData(json);
          setCurrentData(json[0]);
          setIsLive(true);
          
          setLiveChartData([
            {
              time: new Date(json[0].created_at).toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              }),
              power: json[0].daya_watt,
            },
          ]);
        }
      } catch (e) {
        console.error("API error", e);
        setIsLive(false);
      }
    };

    fetchData();
  }, []);

  /* ===== CYCLE THROUGH DATA EVERY 5 SECONDS ===== */
  useEffect(() => {
    if (allData.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % allData.length;
        const nextData = allData[nextIndex];
        
        setCurrentData(nextData);

        setLiveChartData((prev) => {
          const newPoint = {
            time: new Date(nextData.created_at).toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            }),
            power: nextData.daya_watt,
          };

          const updated = [...prev, newPoint];
          return updated.slice(-20);
        });

        return nextIndex;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [allData]);

  if (!currentData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <motion.div 
            className="rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-gray-600">Loading real-time data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-8 bg-gray-50 min-h-screen">
      {/* ================= HEADER ================= */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between"
      >
        <div>
          <h1 className="text-4xl font-bold text-gray-900">
            Real-time Monitoring
          </h1>
          <p className="text-gray-600 mt-2">Live electrical data streaming</p>
        </div>

        {/* LIVE BADGE */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className={`flex items-center gap-2 px-4 py-2 rounded-full ${
            isLive ? "bg-green-100" : "bg-red-100"
          }`}
        >
          <motion.span
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className={`h-3 w-3 rounded-full ${
              isLive ? "bg-green-500" : "bg-red-500"
            }`}
          />
          <span
            className={`font-semibold ${
              isLive ? "text-green-700" : "text-red-700"
            }`}
          >
            {isLive ? "Live Streaming" : "Disconnected"}
          </span>
        </motion.div>
      </motion.div>

      {/* ================= GAUGE CARDS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <GaugeCard
          title="Voltage"
          value={currentData.tegangan}
          unit="V"
          max={250}
          color="#3b82f6"
        />

        <GaugeCard
          title="Current"
          value={currentData.arus}
          unit="A"
          max={10}
          color="#10b981"
        />

        <GaugeCard
          title="Power"
          value={currentData.daya_watt}
          unit="W"
          max={2000}
          color="#f59e0b"
        />
      </div>

      {/* ================= ADDITIONAL METRICS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Frequency"
          value={currentData.frekuensi}
          unit="Hz"
          icon="📡"
          status={currentData.frekuensi >= 45 && currentData.frekuensi <= 55 ? "Stable" : "Unstable"}
        />

        <MetricCard
          title="Power Factor"
          value={currentData.pf}
          unit=""
          icon="⚡"
          status={currentData.pf > 0.8 ? "Good" : "Poor"}
        />

        <MetricCard
          title="Energy Used"
          value={currentData.energi_kwh}
          unit="kWh"
          icon="🔋"
          status={currentData.energi_kwh < 2 ? "Efficient" : "High"}
        />
      </div>

      {/* ================= LIVE POWER CHART ================= */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-3xl p-8 shadow-lg"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Live Power Consumption</h2>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <motion.span 
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="h-2 w-2 bg-blue-500 rounded-full"
            />
            <span>Updating every 5 seconds</span>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={liveChartData}>
            <defs>
              <linearGradient id="colorPower" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="time"
              tick={{ fill: "#6b7280", fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              tick={{ fill: "#6b7280" }}
              label={{ value: 'Power (W)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: 12,
                padding: "12px",
              }}
              labelStyle={{ fontWeight: "bold", marginBottom: "8px" }}
            />
            <Line
              type="monotone"
              dataKey="power"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ fill: "#3b82f6", r: 5 }}
              activeDot={{ r: 8 }}
              animationDuration={1000}
              animationEasing="ease-in-out"
            />
          </LineChart>
        </ResponsiveContainer>

        <div className="mt-4 flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-gray-600">Power Consumption</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Current: </span>
            <motion.span 
              key={currentData.daya_watt}
              initial={{ scale: 1.2, color: "#3b82f6" }}
              animate={{ scale: 1, color: "#2563eb" }}
              className="font-bold"
            >
              {currentData.daya_watt} W
            </motion.span>
          </div>
        </div>
      </motion.div>

      {/* ================= DATA SOURCE INFO ================= */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center gap-3"
      >
        <div className="text-blue-600 text-2xl">ℹ️</div>
        <div className="flex-1">
          <p className="text-sm text-blue-900 font-medium">
            Data Source: Database Record {currentIndex + 1} of {allData.length}
          </p>
          <p className="text-xs text-blue-700 mt-1">
            Cycling through historical data every 5 seconds to simulate real-time monitoring
          </p>
        </div>
      </motion.div>
    </div>
  );
}

/* ================= CIRCULAR GAUGE WITH FRAMER MOTION ================= */
function GaugeCard({
  title,
  value,
  unit,
  max,
  color,
}: {
  title: string;
  value: number;
  unit: string;
  max: number;
  color: string;
}) {
  const percentage = Math.min((value / max) * 100, 100);
  const circumference = 2 * Math.PI * 90;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
    >
      <h3 className="text-xl font-bold mb-4 text-gray-900">{title}</h3>

      <div className="relative flex items-center justify-center mb-4">
        <svg width="200" height="200" viewBox="0 0 200 200">
          <circle
            cx="100"
            cy="100"
            r="90"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="12"
          />

          <motion.circle
            cx="100"
            cy="100"
            r="90"
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: "easeInOut" }}
            transform="rotate(-90 100 100)"
          />

          <text
            x="100"
            y="95"
            textAnchor="middle"
            className="text-4xl font-bold"
            fill="#111827"
          >
            {value.toFixed(1)}
          </text>
          <text
            x="100"
            y="115"
            textAnchor="middle"
            className="text-lg"
            fill="#9ca3af"
          >
            {unit}
          </text>
        </svg>

        <motion.div
          key={value}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full"
        >
          {percentage.toFixed(0)}%
        </motion.div>
      </div>

      <div className="text-center text-sm text-gray-500">
        Range: 0 - {max} {unit}
      </div>
    </motion.div>
  );
}

/* ================= METRIC CARD WITH ANIMATION ================= */
function MetricCard({
  title,
  value,
  unit,
  icon,
  status,
}: {
  title: string;
  value: number;
  unit: string;
  icon: string;
  status: string;
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-2xl p-6 shadow-lg transition-all"
    >
      <div className="flex items-center justify-between mb-3">
        <motion.span 
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          className="text-3xl"
        >
          {icon}
        </motion.span>
        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
          status === "Good" || status === "Stable" || status === "Efficient"
            ? "bg-green-100 text-green-700"
            : "bg-yellow-100 text-yellow-700"
        }`}>
          {status}
        </span>
      </div>
      <h3 className="text-sm text-gray-600 mb-2">{title}</h3>
      <div className="flex items-end gap-2">
        <motion.span 
          key={value}
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-4xl font-bold text-gray-900"
        >
          {value.toFixed(2)}
        </motion.span>
        {unit && <span className="text-xl text-gray-400 pb-1">{unit}</span>}
      </div>
    </motion.div>
  );
}