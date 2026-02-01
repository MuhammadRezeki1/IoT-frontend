"use client";

import { useState, useEffect } from "react";
import { Calendar } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

/* ================= TYPES ================= */
type TimeFilter = "Daily" | "Weekly" | "Monthly";

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

type TrendData = {
  time: string;
  energy: number;
};

type DailyUsageData = {
  day: string;
  usage: number;
  date: string;
};

type Statistics = {
  total_energy: number;
  avg_daily_usage: number;
  peak_usage: number;
  peak_hour: string;
};

/* ================= MAIN PAGE ================= */
export default function EnergyUsageHistoryPage() {
  const [activeFilter, setActiveFilter] = useState<TimeFilter>("Monthly");
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [dailyUsageData, setDailyUsageData] = useState<DailyUsageData[]>([]);
  const [statistics, setStatistics] = useState<Statistics>({
    total_energy: 0,
    avg_daily_usage: 0,
    peak_usage: 0,
    peak_hour: "18:00",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rawData, setRawData] = useState<RawPowerData[]>([]);

  /* ===== FETCH DATA FROM API ===== */
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Ambil semua data dari endpoint utama
        const res = await fetch("http://localhost:3001/power");
        if (!res.ok) {
          throw new Error(`Failed to fetch data: ${res.status}`);
        }
        const json: RawPowerData[] = await res.json();

        // Simpan raw data
        setRawData(json);

        if (json.length > 0) {
          // Generate statistics dari raw data
          generateStatistics(json);
          
          // Generate trend data berdasarkan filter
          generateTrendData(json, activeFilter);
          
          // Generate daily usage untuk bar chart
          generateDailyUsageData(json);
        } else {
          setTrendData([]);
          setDailyUsageData([]);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setError(error instanceof Error ? error.message : "Unknown error");
        
        setStatistics({
          total_energy: 0,
          avg_daily_usage: 0,
          peak_usage: 0,
          peak_hour: "18:00",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  /* ===== UPDATE TREND DATA SAAT FILTER BERUBAH ===== */
  useEffect(() => {
    if (rawData.length > 0) {
      generateTrendData(rawData, activeFilter);
    }
  }, [activeFilter, rawData]);

  /* ===== GENERATE STATISTICS ===== */
  const generateStatistics = (data: RawPowerData[]) => {
    if (data.length === 0) return;

    const energyValues = data.map(item => item.energi_kwh);
    const totalEnergy = energyValues.reduce((a, b) => a + b, 0);
    const avgEnergy = totalEnergy / energyValues.length;
    const peakEnergy = Math.max(...energyValues);

    // Hitung peak hour
    const hourCounts: { [key: number]: number } = {};
    data.forEach(item => {
      const hour = new Date(item.created_at).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    let peakHour = 18;
    let maxCount = 0;
    for (const hour in hourCounts) {
      if (hourCounts[hour] > maxCount) {
        maxCount = hourCounts[hour];
        peakHour = parseInt(hour);
      }
    }

    setStatistics({
      total_energy: parseFloat(totalEnergy.toFixed(2)),
      avg_daily_usage: parseFloat(avgEnergy.toFixed(2)),
      peak_usage: parseFloat(peakEnergy.toFixed(2)),
      peak_hour: `${peakHour}:00`,
    });
  };

  /* ===== GENERATE TREND DATA ===== */
  const generateTrendData = (data: RawPowerData[], filter: TimeFilter) => {
    if (data.length === 0) {
      setTrendData([]);
      return;
    }

    let processed: TrendData[] = [];

    if (filter === "Daily") {
      // Simulasi 24 jam dari data yang ada
      processed = simulateDailyData(data);
    } else if (filter === "Weekly") {
      // Simulasi 7 hari dari data yang ada
      processed = simulateWeeklyData(data);
    } else {
      // Simulasi 30 hari dari data yang ada
      processed = simulateMonthlyData(data);
    }

    setTrendData(processed);
  };

  /* ===== GENERATE DAILY USAGE DATA ===== */
  const generateDailyUsageData = (data: RawPowerData[]) => {
    if (data.length === 0) {
      setDailyUsageData([]);
      return;
    }

    const usage = simulateWeeklyDataForBarChart(data);
    setDailyUsageData(usage);
  };

  /* ===== SIMULASI DAILY (24 JAM) - NILAI REAL ===== */
  const simulateDailyData = (data: RawPowerData[]): TrendData[] => {
    const result: TrendData[] = [];
    const baseValues = data.slice(0, Math.min(7, data.length));

    for (let hour = 0; hour < 24; hour++) {
      // Ambil data secara cyclic
      const sourceData = baseValues[hour % baseValues.length];
      
      // Variasi waktu SANGAT KECIL
      let timeMultiplier = 1.0;
      if (hour >= 0 && hour < 6) {
        timeMultiplier = 0.92; // Dini hari sedikit lebih rendah
      } else if (hour >= 6 && hour < 12) {
        timeMultiplier = 0.97; // Pagi
      } else if (hour >= 12 && hour < 18) {
        timeMultiplier = 1.02; // Siang
      } else if (hour >= 18 && hour < 22) {
        timeMultiplier = 1.05; // Malam peak
      } else {
        timeMultiplier = 0.95; // Malam
      }
      
      // Random variation SANGAT KECIL (±1%)
      const variation = (Math.random() - 0.5) * 0.02;
      const energy = sourceData.energi_kwh * timeMultiplier * (1 + variation);
      
      result.push({
        time: `${hour}:00`,
        energy: parseFloat(energy.toFixed(2)),
      });
    }

    return result;
  };

  /* ===== SIMULASI WEEKLY (7 HARI) - NILAI REAL ===== */
  const simulateWeeklyData = (data: RawPowerData[]): TrendData[] => {
    const result: TrendData[] = [];
    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const baseValues = data.slice(0, Math.min(7, data.length));

    for (let i = 0; i < 7; i++) {
      const sourceData = baseValues[i % baseValues.length];
      
      // Weekend SEDIKIT lebih tinggi (maksimal +3%)
      let dayMultiplier = 1.0;
      if (i === 5 || i === 6) { // Sabtu & Minggu
        dayMultiplier = 1.03;
      } else if (i === 0 || i === 4) { // Senin & Jumat
        dayMultiplier = 1.01;
      } else {
        dayMultiplier = 0.99;
      }
      
      // Random variation SANGAT KECIL (±1%)
      const variation = (Math.random() - 0.5) * 0.02;
      const energy = sourceData.energi_kwh * dayMultiplier * (1 + variation);
      
      result.push({
        time: dayNames[i],
        energy: parseFloat(energy.toFixed(2)),
      });
    }

    return result;
  };

  /* ===== SIMULASI MONTHLY (30 HARI) - NILAI REAL ===== */
  const simulateMonthlyData = (data: RawPowerData[]): TrendData[] => {
    const result: TrendData[] = [];
    const baseValues = data.slice(0, Math.min(7, data.length));

    for (let day = 1; day <= 30; day++) {
      const sourceData = baseValues[(day - 1) % baseValues.length];
      
      // Pattern mingguan SANGAT KECIL (maksimal ±2%)
      const dayOfWeek = day % 7;
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const weekendMultiplier = isWeekend ? 1.02 : 0.99;
      
      // Pattern bulanan SANGAT KECIL (maksimal ±1.5%)
      let monthPattern = 1.0;
      if (day <= 10) {
        monthPattern = 0.985;
      } else if (day <= 20) {
        monthPattern = 1.015;
      } else {
        monthPattern = 1.0;
      }
      
      // Random variation SANGAT KECIL (±0.5%)
      const variation = (Math.random() - 0.5) * 0.01;
      const energy = sourceData.energi_kwh * weekendMultiplier * monthPattern * (1 + variation);
      
      result.push({
        time: `Day ${day}`,
        energy: parseFloat(energy.toFixed(2)),
      });
    }

    return result;
  };

  /* ===== SIMULASI WEEKLY DATA UNTUK BAR CHART - NILAI REAL ===== */
  const simulateWeeklyDataForBarChart = (data: RawPowerData[]): DailyUsageData[] => {
    const result: DailyUsageData[] = [];
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const baseValues = data.slice(0, Math.min(7, data.length));
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayIndex = date.getDay();
      
      const sourceData = baseValues[i % baseValues.length];
      
      // Weekend SEDIKIT lebih tinggi (maksimal +3%)
      const isWeekend = dayIndex === 0 || dayIndex === 6;
      const multiplier = isWeekend ? 1.03 : 0.99;
      
      // Random variation SANGAT KECIL (±1%)
      const variation = (Math.random() - 0.5) * 0.02;
      const energy = sourceData.energi_kwh * multiplier * (1 + variation);
      
      result.push({
        day: dayNames[dayIndex],
        usage: parseFloat(energy.toFixed(2)),
        date: dateStr,
      });
    }

    return result;
  };

  /* ===== HANDLE DATE RANGE PICKER ===== */
  const handleDateRangeClick = () => {
    alert("Date range picker would open here. You can integrate a date picker library like react-datepicker.");
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-sm max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Data</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500 mb-4">
            Please make sure the backend server is running on http://localhost:3001
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* ================= HEADER ================= */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">
            Energy Usage History
          </h1>
          <p className="text-gray-600 mt-2">Historical tracking and analysis</p>
        </div>

        <button
          onClick={handleDateRangeClick}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          <Calendar size={20} className="text-gray-600" />
          <span className="text-sm font-medium text-gray-700">
            Select Date Range
          </span>
        </button>
      </div>

      {/* ================= TIME FILTER TABS ================= */}
      <div className="bg-white rounded-2xl p-6 mb-8 shadow-sm">
        <div className="flex gap-3">
          {(["Daily", "Weekly", "Monthly"] as TimeFilter[]).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                activeFilter === filter
                  ? "bg-blue-500 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* ================= CHARTS SECTION ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* ===== ENERGY CONSUMPTION TREND (LINE CHART) ===== */}
        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Energy Consumption Trend
          </h2>

          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={trendData}>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="#e5e7eb" 
                  vertical={false}
                />
                <XAxis
                  dataKey="time"
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                  axisLine={{ stroke: "#e5e7eb" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: 8,
                    padding: "8px 12px",
                  }}
                  labelStyle={{ fontWeight: "600", marginBottom: 4 }}
                  formatter={(value: any) => [`${value} kWh`, "Energy"]}
                />
                <Line
                  type="monotone"
                  dataKey="energy"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 6, fill: "#3b82f6" }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[350px] flex items-center justify-center text-gray-500">
              No data available
            </div>
          )}
        </div>

        {/* ===== DAILY KWH USAGE (BAR CHART) ===== */}
        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Daily kWh Usage
          </h2>

          {dailyUsageData.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={dailyUsageData}>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="#e5e7eb" 
                  vertical={false}
                />
                <XAxis
                  dataKey="day"
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                  axisLine={{ stroke: "#e5e7eb" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: 8,
                    padding: "8px 12px",
                  }}
                  cursor={{ fill: "#f3f4f6", opacity: 0.3 }}
                  formatter={(value: any) => [`${value} kWh`, "Usage"]}
                />
                <Bar
                  dataKey="usage"
                  fill="#10b981"
                  radius={[8, 8, 0, 0]}
                  maxBarSize={60}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[350px] flex items-center justify-center text-gray-500">
              No data available
            </div>
          )}
        </div>
      </div>

      {/* ================= STATISTICS SUMMARY ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <StatCard
          title="Total Energy Used"
          value={(statistics?.total_energy || 0).toFixed(1)}
          unit="kWh"
          change="+12.5%"
          isPositive={false}
        />
        <StatCard
          title="Average Usage"
          value={(statistics?.avg_daily_usage || 0).toFixed(2)}
          unit="kWh"
          change="+5.2%"
          isPositive={false}
        />
        <StatCard
          title="Peak Usage Time"
          value={statistics?.peak_hour || "18:00"}
          unit="Time"
          change="Consistent"
          isPositive={true}
        />
      </div>

      {/* ================= DETAILED TABLE ================= */}
      <div className="mt-8 bg-white rounded-2xl p-8 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Detailed History
        </h2>
        
        <div className="overflow-x-auto">
          {dailyUsageData.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Energy (kWh)
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Cost ($)
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {dailyUsageData.map((item, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {item.day}, {new Date(item.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {item.usage.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">
                      ${(item.usage * 0.12).toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.usage > 6.5
                          ? "bg-red-100 text-red-700"
                          : item.usage > 5.5
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-green-100 text-green-700"
                      }`}>
                        {item.usage > 6.5 ? "High" : item.usage > 5.5 ? "Normal" : "Low"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-8 text-center text-gray-500">
              No data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ================= STAT CARD COMPONENT ================= */
function StatCard({
  title,
  value,
  unit,
  change,
  isPositive,
}: {
  title: string;
  value: string;
  unit: string;
  change: string;
  isPositive: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition">
      <p className="text-sm text-gray-600 mb-2">{title}</p>
      <div className="flex items-end gap-2 mb-3">
        <span className="text-4xl font-bold text-gray-900">{value}</span>
        <span className="text-lg text-gray-500 pb-1">{unit}</span>
      </div>
      <div className="flex items-center gap-2">
        <span
          className={`text-sm font-medium ${
            isPositive ? "text-green-600" : "text-red-600"
          }`}
        >
          {change}
        </span>
        <span className="text-xs text-gray-500">vs last period</span>
      </div>
    </div>
  );
}