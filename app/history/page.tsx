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

type TrendData = {
  time: string;
  energy: number;
  voltage?: number;
  current?: number;
  hour?: number;
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
  const [activeFilter, setActiveFilter] = useState<TimeFilter>("Daily");
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

  /* ===== FETCH STATISTICS ===== */
  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        console.log('📡 Fetching statistics...');
        const res = await fetch("http://localhost:3001/power/statistics?days=30");
        
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        
        const data = await res.json();
        console.log('✅ Statistics received:', data);
        setStatistics(data);
      } catch (err) {
        console.error("❌ Failed to fetch statistics:", err);
      }
    };

    fetchStatistics();
    const interval = setInterval(fetchStatistics, 60000);
    return () => clearInterval(interval);
  }, []);

  /* ===== FETCH TREND DATA BERDASARKAN FILTER ===== */
  useEffect(() => {
    const fetchTrendData = async () => {
      console.log(`\n🔄 [${activeFilter}] Starting fetch...`);
      setLoading(true);
      setError(null);

      try {
        let endpoint = "";
        if (activeFilter === "Daily") {
          endpoint = "http://localhost:3001/power/daily";
        } else if (activeFilter === "Weekly") {
          endpoint = "http://localhost:3001/power/weekly";
        } else {
          endpoint = "http://localhost:3001/power/monthly";
        }

        console.log(`📡 [${activeFilter}] Fetching from: ${endpoint}`);

        const res = await fetch(endpoint);
        
        console.log(`📨 [${activeFilter}] Response status: ${res.status}`);
        
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        
        const data = await res.json();
        
        console.log(`✅ [${activeFilter}] Data received:`, data);
        console.log(`📊 [${activeFilter}] Data length: ${data.length}`);

        if (data.length === 0) {
          console.warn(`⚠️ [${activeFilter}] Empty array returned from API`);
        }

        // Format data untuk grafik
        const formattedData = data.map((item: any) => ({
          time: item.time || `Hour ${item.hour || 0}`,
          energy: parseFloat(item.energy || item.total_energy || item.avg_energy || 0),
          voltage: item.voltage ? parseFloat(item.voltage) : undefined,
          current: item.current ? parseFloat(item.current) : undefined,
          hour: item.hour ? parseInt(item.hour) : undefined,
        }));

        console.log(`✨ [${activeFilter}] Formatted data:`, formattedData.slice(0, 3));
        
        setTrendData(formattedData);
        
      } catch (err) {
        console.error(`❌ [${activeFilter}] Fetch error:`, err);
        setError(err instanceof Error ? err.message : "Unknown error");
        setTrendData([]);
      } finally {
        setLoading(false);
        console.log(`🏁 [${activeFilter}] Fetch complete\n`);
      }
    };

    fetchTrendData();
  }, [activeFilter]);

  /* ===== FETCH DAILY USAGE DATA (Bar Chart) ===== */
  useEffect(() => {
    const fetchDailyUsage = async () => {
      try {
        console.log('📡 Fetching weekly data for bar chart...');
        const res = await fetch("http://localhost:3001/power/weekly");
        
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        
        const data = await res.json();
        console.log('✅ Weekly data for bar chart:', data);
        
        const formatted = data.map((item: any) => ({
          day: item.time,
          usage: parseFloat(item.energy || item.total_energy || 0),
          date: item.date || new Date().toISOString().split('T')[0],
        }));

        console.log('✨ Formatted bar chart data:', formatted);
        setDailyUsageData(formatted);
        
      } catch (err) {
        console.error("❌ Failed to fetch daily usage:", err);
        setDailyUsageData([]);
      }
    };

    fetchDailyUsage();
    const interval = setInterval(fetchDailyUsage, 300000);
    return () => clearInterval(interval);
  }, []);

  /* ===== HANDLE DATE RANGE PICKER ===== */
  const handleDateRangeClick = () => {
    alert("Date range picker - integrate react-datepicker if needed");
  };

  // Loading state
  if (loading && trendData.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading energy data...</p>
          <p className="text-sm text-gray-500 mt-2">Fetching {activeFilter.toLowerCase()} view</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && trendData.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-sm max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Data</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500 mb-4">
            Please make sure:
            <br />• Backend is running on http://localhost:3001
            <br />• Database has data in hourly_energy table
            <br />• Check browser console (F12) for details
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
        
        {/* Data Count Indicator */}
        <div className="mt-4 text-sm text-gray-600">
          Showing <span className="font-semibold text-blue-600">{trendData.length}</span> data points
          {activeFilter === "Daily" && " (Last 24 hours - hourly)"}
          {activeFilter === "Weekly" && " (Last 7 days - daily)"}
          {activeFilter === "Monthly" && " (Last 30 days - daily)"}
        </div>
      </div>

      {/* ================= CHARTS SECTION ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* ===== ENERGY CONSUMPTION TREND (LINE CHART) ===== */}
        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Energy Consumption Trend ({activeFilter})
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
                  tick={{ fill: "#6b7280", fontSize: 11 }}
                  axisLine={{ stroke: "#e5e7eb" }}
                  tickLine={false}
                  angle={activeFilter === "Daily" ? -45 : 0}
                  textAnchor={activeFilter === "Daily" ? "end" : "middle"}
                  height={activeFilter === "Daily" ? 60 : 30}
                  interval={activeFilter === "Daily" ? (trendData.length > 12 ? 1 : 0) : 0}
                />
                <YAxis
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  label={{ 
                    value: 'Energy (kWh)', 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { fill: "#6b7280", fontSize: 12 }
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: 8,
                    padding: "12px",
                  }}
                  labelStyle={{ fontWeight: "600", marginBottom: 4 }}
                  formatter={(value: any, name: string) => {
                    if (name === "energy") return [`${value} kWh`, "Energy"];
                    if (name === "voltage") return [`${value} V`, "Voltage"];
                    if (name === "current") return [`${value} A`, "Current"];
                    return [value, name];
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="energy"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  dot={activeFilter === "Daily" ? false : { r: 4, fill: "#3b82f6" }}
                  activeDot={{ r: 6, fill: "#3b82f6" }}
                  name="energy"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[350px] flex items-center justify-center text-gray-500">
              <div className="text-center">
                <div className="text-4xl mb-2">📊</div>
                <p className="font-medium">No data available</p>
                <p className="text-sm mt-1">
                  {activeFilter === "Daily" && "Check hourly_energy table"}
                  {activeFilter === "Weekly" && "Check daily_energy table (last 7 days)"}
                  {activeFilter === "Monthly" && "Check daily_energy table (last 30 days)"}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ===== DAILY KWH USAGE (BAR CHART) ===== */}
        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Daily kWh Usage (Last 7 Days)
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
                  label={{ 
                    value: 'Usage (kWh)', 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { fill: "#6b7280", fontSize: 12 }
                  }}
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
              <div className="text-center">
                <div className="text-4xl mb-2">📊</div>
                <p className="font-medium">No weekly data available</p>
                <p className="text-sm mt-1">Check daily_energy table</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ================= STATISTICS SUMMARY ================= */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
        <StatCard
          title="Total Energy Used"
          value={statistics.total_energy.toFixed(1)}
          unit="kWh"
          change="+12.5%"
          isPositive={false}
        />
        <StatCard
          title="Average Daily Usage"
          value={statistics.avg_daily_usage.toFixed(2)}
          unit="kWh"
          change="+5.2%"
          isPositive={false}
        />
        <StatCard
          title="Peak Usage"
          value={statistics.peak_usage.toFixed(2)}
          unit="kWh"
          change="Max"
          isPositive={true}
        />
        <StatCard
          title="Peak Hour"
          value={statistics.peak_hour}
          unit="Time"
          change="Today"
          isPositive={true}
        />
      </div>

      {/* ================= DETAILED TABLE ================= */}
      <div className="mt-8 bg-white rounded-2xl p-8 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Detailed History (Last 7 Days)
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
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition">
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {item.day}, {new Date(item.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">
                      {item.usage.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">
                      ${(item.usage * 0.12).toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.usage > 11
                          ? "bg-red-100 text-red-700"
                          : item.usage > 8.5
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-green-100 text-green-700"
                      }`}>
                        {item.usage > 11 ? "High" : item.usage > 8.5 ? "Normal" : "Low"}
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