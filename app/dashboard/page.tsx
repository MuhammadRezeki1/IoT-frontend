"use client";

import { useEffect, useState } from "react";
import {
  Gauge,
  Activity,
  Zap,
  Battery,
  Radio,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  Info,
} from "lucide-react";

import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { getApiUrl, apiConfig, ApiResponse, PowerData } from "@/lib/api-config";

/* ================= TYPES ================= */
type RawPowerData = PowerData;

type ChartData = {
  time: string;
  tegangan: number;
  arus: number;
  daya: number;
};

/* ================= PAGE ================= */
export default function DashboardPage() {
  // 7 data terakhir untuk semua keperluan
  const [last7Data, setLast7Data] = useState<RawPowerData[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  
  // UI states
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [systemOnline, setSystemOnline] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /* ===== FETCH 7 DATA TERAKHIR DARI DATABASE ===== */
  useEffect(() => {
    const fetch7Data = async () => {
      try {
        console.log('📡 [Dashboard] Fetching from:', getApiUrl(apiConfig.endpoints.last7Data));
        
        const res = await fetch(getApiUrl(apiConfig.endpoints.last7Data));
        
        if (!res.ok) {
          const errorText = await res.text();
          console.error('❌ [Dashboard] API Error:', res.status, errorText);
          setSystemOnline(false);
          setLoading(false);
          setError(`Failed to fetch data: ${res.status}`);
          return;
        }

        const response: ApiResponse<RawPowerData[]> = await res.json();
        console.log('✅ [Dashboard] Raw response:', response);

        // Extract data from wrapper { success, data, count }
        let data: RawPowerData[] = [];
        
        if (response.success !== undefined && response.data !== undefined) {
          data = response.data;
          console.log('📦 [Dashboard] Extracted data from wrapper:', data);
        } else if (Array.isArray(response)) {
          data = response as unknown as RawPowerData[];
          console.log('📦 [Dashboard] Direct array response:', data);
        } else {
          console.error('❌ [Dashboard] Unexpected response format:', response);
          setSystemOnline(false);
          setLoading(false);
          return;
        }

        if (!Array.isArray(data)) {
          console.error('❌ [Dashboard] Data is not an array:', data);
          setSystemOnline(false);
          setLoading(false);
          return;
        }

        console.log('✅ [Dashboard] Received', data.length, 'records');
        console.log('📊 [Dashboard] First record:', data[0]);
        console.log('📊 [Dashboard] Last record:', data[data.length - 1]);

        if (data && data.length > 0) {
          // Convert all numeric values properly
          const processedData: RawPowerData[] = data.map(item => ({
            id: item.id,
            tegangan: Number(item.tegangan) || 0,
            arus: Number(item.arus) || 0,
            daya_watt: Number(item.daya_watt) || 0,
            energi_kwh: Number(item.energi_kwh) || 0,
            frekuensi: Number(item.frekuensi) || 50,
            pf: Number(item.pf) || 0.95,
            created_at: item.created_at,
          }));

          console.log('✨ [Dashboard] Processed data:', processedData);

          setLast7Data(processedData);
          
          // Map untuk chart (Voltage, Current, Power)
          const mapped: ChartData[] = processedData.map((item) => {
            const date = new Date(item.created_at);
            const timeLabel = date.toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
            });

            return {
              time: timeLabel,
              tegangan: item.tegangan,
              arus: item.arus,
              daya: item.daya_watt,
            };
          });

          console.log('📈 [Dashboard] Chart data:', mapped);

          setChartData(mapped);
          setLastUpdated(new Date().toLocaleTimeString("id-ID"));
          setSystemOnline(true);
          setLoading(false);
          setError(null);
        } else {
          console.warn('⚠️ [Dashboard] No data received');
          setSystemOnline(true);
          setLoading(false);
          setError('No data available yet');
        }
      } catch (e) {
        console.error("❌ [Dashboard] Failed to fetch:", e);
        setSystemOnline(false);
        setLoading(false);
        setError(e instanceof Error ? e.message : 'Unknown error');
      }
    };

    fetch7Data();
    // Refresh every 10 seconds
    const interval = setInterval(fetch7Data, 10000);
    return () => clearInterval(interval);
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-xl text-gray-600">Loading dashboard...</p>
          <p className="mt-2 text-sm text-gray-500">Connecting to {apiConfig.baseUrl}</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && last7Data.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Data Available</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
            <p className="text-sm text-blue-900 font-semibold mb-2">Troubleshooting:</p>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Check if backend is running at {apiConfig.baseUrl}</li>
              <li>• Verify MQTT device is sending data</li>
              <li>• Check if hourly_energy table has records</li>
              <li>• Wait for data to be saved (batch interval: 1 minute)</li>
            </ul>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // No data state
  if (last7Data.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <div className="text-gray-400 text-6xl mb-4">📊</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Waiting for Data</h2>
          <p className="text-gray-600 mb-4">
            No records found in the database yet.
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-900">
              Make sure your IoT device is sending data via MQTT.
              Data is saved every 1 minute to the database.
            </p>
          </div>
          <div className="mt-4 text-sm text-gray-500">
            Auto-refreshing every 10 seconds...
          </div>
        </div>
      </div>
    );
  }

  // Get latest data (last item) for current metrics
  const latest = last7Data[last7Data.length - 1];

  /* ===== STATUS LOGIC ===== */
  const voltageStatus =
    latest.tegangan >= 200 && latest.tegangan <= 240 ? "Normal" : "Abnormal";
  const currentStatus = latest.arus < 10 ? "Normal" : "High";
  const powerStatus = latest.daya_watt < 2000 ? "Normal" : "High";
  const energyStatus = latest.energi_kwh < 2 ? "Efficient" : "High";
  const freqStatus =
    (latest.frekuensi || 50) >= 49 && (latest.frekuensi || 50) <= 61 ? "Stable" : "Unstable";
  const pfStatus = latest.pf > 0.8 ? "Good" : "Poor";

  /* ===== CALCULATE SUMMARY DATA ===== */
  const energyUsed = latest.energi_kwh;
  const estimatedCost = (energyUsed * 0.12).toFixed(2);
  const co2Equivalent = (energyUsed * 0.5).toFixed(2);

  // Calculate average from 7 data
  const avgPower = (last7Data.reduce((sum, item) => sum + item.daya_watt, 0) / last7Data.length).toFixed(2);
  const avgVoltage = (last7Data.reduce((sum, item) => sum + item.tegangan, 0) / last7Data.length).toFixed(2);
  const avgCurrent = (last7Data.reduce((sum, item) => sum + item.arus, 0) / last7Data.length).toFixed(2);

  return (
    <div className="space-y-14 p-8">
      {/* ================= HERO ================= */}
      <section className="rounded-4xl bg-gradient-to-br from-blue-600 to-cyan-400 px-10 py-16 shadow-2xl animate-fadeIn">
        <div className="flex justify-center mb-6">
          <span 
            className={`inline-flex items-center gap-2 rounded-full px-4 py-1 text-white text-sm transition-all duration-300 ${
              systemOnline ? 'bg-white/20' : 'bg-red-500/30'
            }`}
          >
            <span 
              className={`h-2 w-2 rounded-full animate-pulse ${
                systemOnline ? 'bg-green-400' : 'bg-red-400'
              }`} 
            />
            {systemOnline ? 'System Online' : 'System Offline'}
          </span>
        </div>

        <h1 className="text-center text-white font-extrabold text-5xl md:text-6xl animate-slideDown">
          Energy Monitoring Dashboard
        </h1>

        <p className="mx-auto mt-6 max-w-175 text-center text-white/90 text-lg animate-slideUp">
          Real-time insights from last {last7Data.length} database records
        </p>
      </section>

      {/* ✅ REMOVED: Data Info Badge (kurang profesional) */}

      {/* ================= SYSTEM OVERVIEW ================= */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-4xl font-bold text-black">Current Metrics</h2>
          <span className="text-sm text-gray-500">
            Last updated: {lastUpdated}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <MetricCard 
            label="Voltage" 
            value={Number(latest.tegangan.toFixed(2))} 
            unit="V" 
            status={voltageStatus} 
            icon={<Gauge />} 
            delay="0.1s" 
          />
          <MetricCard 
            label="Current" 
            value={Number(latest.arus.toFixed(2))} 
            unit="A" 
            status={currentStatus} 
            icon={<Activity />} 
            delay="0.2s" 
          />
          <MetricCard 
            label="Power" 
            value={Number(latest.daya_watt.toFixed(2))} 
            unit="Watt" 
            status={powerStatus} 
            icon={<Zap />} 
            delay="0.3s" 
          />
          <MetricCard 
            label="Energy Used" 
            value={Number(latest.energi_kwh.toFixed(4))} 
            unit="kWh" 
            status={energyStatus} 
            icon={<Battery />} 
            delay="0.4s" 
          />
          <MetricCard 
            label="Frequency" 
            value={Number((latest.frekuensi || 50).toFixed(2))} 
            unit="Hz" 
            status={freqStatus} 
            icon={<Radio />} 
            delay="0.5s" 
          />
          <MetricCard 
            label="Power Factor" 
            value={Number(latest.pf.toFixed(2))} 
            unit="" 
            status={pfStatus} 
            icon={<TrendingUp />} 
            delay="0.6s" 
          />
        </div>
      </section>

      {/* ================= 7 DATA TRENDS ================= */}
      <section className="mt-12 bg-gray-50 rounded-3xl p-8 space-y-6 animate-fadeIn">
        <h2 className="text-4xl font-bold text-black">
          Power Trends
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ===== POWER OVER TIME (7 DATA) ===== */}
          <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm hover:shadow-xl transition-all duration-300 min-h-100 animate-slideInLeft">
            <h3 className="text-2xl font-bold mb-4">Power Consumption</h3>
            <p className="text-sm text-gray-600 mb-6">
              Average: {avgPower} W | Latest: {latest.daya_watt.toFixed(2)} W
            </p>

            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="powerGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.1} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="time" 
                  tick={{ fill: "#6b7280", fontSize: 12 }} 
                />
                <YAxis tick={{ fill: "#6b7280" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    padding: '12px',
                  }}
                  formatter={(value: any) => {
                    return [`${Number(value).toFixed(2)} W`, "Power"];
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="daya"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  fill="url(#powerGradient)"
                  animationDuration={1000}
                  animationBegin={0}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* ===== VOLTAGE & CURRENT (7 DATA) ===== */}
          <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm hover:shadow-xl transition-all duration-300 min-h-100 animate-slideInRight">
            <h3 className="text-2xl font-bold mb-4">
              Voltage & Current
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Avg Voltage: {avgVoltage} V | Avg Current: {avgCurrent} A
            </p>

            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="time" 
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                />
                <YAxis yAxisId="left" stroke="#3b82f6" tick={{ fill: "#6b7280" }} />
                <YAxis yAxisId="right" orientation="right" stroke="#10b981" tick={{ fill: "#6b7280" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    padding: '12px',
                  }}
                  formatter={(value: any, name?: string) => {
                    if (name === "Voltage (V)") return [`${Number(value).toFixed(2)} V`, name!];
                    if (name === "Current (A)") return [`${Number(value).toFixed(2)} A`, name!];
                    return [`${Number(value).toFixed(2)}`, "Value"];
                  }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="line"
                />
                <Line 
                  yAxisId="left" 
                  type="monotone" 
                  dataKey="tegangan" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: "#3b82f6", r: 4 }}
                  name="Voltage (V)"
                  animationDuration={1000}
                />
                <Line 
                  yAxisId="right" 
                  type="monotone" 
                  dataKey="arus" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  dot={{ fill: "#10b981", r: 4 }}
                  name="Current (A)"
                  animationDuration={1000}
                  animationBegin={200}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* ================= ENERGY CONSUMPTION BAR CHART (7 DATA) ================= */}
      <section className="mt-12 bg-gray-50 p-8 rounded-3xl animate-fadeIn">
        <h2 className="text-4xl font-bold mb-8">Energy Usage Comparison</h2>

        <div className="rounded-4xl border border-gray-200 bg-white p-10 shadow-sm hover:shadow-xl transition-all duration-300 min-h-175">
          <h3 className="text-3xl font-bold mb-8">
            Recent Energy Consumption (kWh)
          </h3>

          <ResponsiveContainer width="100%" height={600}>
            <BarChart 
              data={last7Data.map((item, index) => ({
                name: `Record ${index + 1}`,
                time: new Date(item.created_at).toLocaleTimeString("id-ID", {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
                energy: Number(item.energi_kwh),
              }))}
              margin={{ top: 20, right: 40, left: 20, bottom: 40 }}
            >
              <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="time" 
                tick={{ fill: "#6b7280", fontSize: 14 }} 
                axisLine={{ stroke: '#e5e7eb' }}
                tickLine={false}
              />
              <YAxis 
                domain={[0, 'auto']} 
                axisLine={false}
                tick={{ fill: "#6b7280", fontSize: 12 }}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: "#d1d5db", opacity: 0.3 }}
                content={({ active, payload }) =>
                  active && payload && payload.length ? (
                    <div className="bg-white border border-gray-200 rounded-2xl px-5 py-4 shadow-xl">
                      <p className="font-bold text-lg text-gray-900 mb-1">
                        {payload[0].payload.name}
                      </p>
                      <p className="text-sm text-gray-600 mb-2">
                        {payload[0].payload.time}
                      </p>
                      <p className="text-green-600 text-base font-semibold">
                        Energy: {Number(payload[0].value).toFixed(4)} kWh
                      </p>
                    </div>
                  ) : null
                }
              />
              <Bar
                dataKey="energy"
                fill="#10b981"
                radius={[12, 12, 0, 0]}
                animationDuration={1000}
                animationBegin={0}
                maxBarSize={100}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* ================= ADDITIONAL FEATURES ================= */}
      <section className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* ===== CARD 1 - SYSTEM ALERTS ===== */}
        <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm hover:shadow-xl transition-all duration-300 animate-scaleIn" style={{ animationDelay: '0.1s' }}>
          <h3 className="text-3xl font-bold mb-2">System Alerts</h3>
          <p className="text-gray-600 mb-6">Recent notifications and warnings</p>

          <div className="space-y-4">
            {/* Alert Success */}
            <div className="bg-green-100 border border-green-300 rounded-2xl p-5 flex gap-3 hover:scale-[1.02] transition-transform duration-200">
              <CheckCircle className="text-green-600 shrink-0" size={24} />
              <div className="flex-1">
                <p className="font-semibold text-green-900">System operational</p>
                <p className="text-sm text-green-600 mt-1">{last7Data.length} records loaded</p>
              </div>
            </div>

            {/* Alert Warning */}
            {latest.tegangan > 240 || latest.tegangan < 200 ? (
              <div className="bg-yellow-100 border border-yellow-200 rounded-2xl p-5 flex gap-3 hover:scale-[1.02] transition-transform duration-200">
                <AlertTriangle className="text-yellow-600 shrink-0" size={24} />
                <div className="flex-1">
                  <p className="font-semibold text-yellow-900">Voltage {voltageStatus.toLowerCase()}</p>
                  <p className="text-sm text-yellow-600 mt-1">Current: {latest.tegangan.toFixed(2)} V</p>
                </div>
              </div>
            ) : (
              <div className="bg-blue-100 border border-blue-300 rounded-2xl p-5 flex gap-3 hover:scale-[1.02] transition-transform duration-200">
                <Info className="text-blue-600 shrink-0" size={24} />
                <div className="flex-1">
                  <p className="font-semibold text-blue-900">All systems operational</p>
                  <p className="text-sm text-blue-600 mt-1">Voltage: {latest.tegangan.toFixed(2)} V</p>
                </div>
              </div>
            )}

            {/* Alert Info */}
            <div className="bg-blue-100 border border-blue-300 rounded-2xl p-5 flex gap-3 hover:scale-[1.02] transition-transform duration-200">
              <Info className="text-blue-600 shrink-0" size={24} />
              <div className="flex-1">
                <p className="font-semibold text-blue-900">Database sync active</p>
                <p className="text-sm text-blue-600 mt-1">Connected to {apiConfig.baseUrl}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ===== CARD 2 - STATISTICS FROM 7 DATA ===== */}
        <div className="relative rounded-3xl border border-gray-200 bg-white p-8 shadow-sm hover:shadow-xl transition-all duration-300 animate-scaleIn" style={{ animationDelay: '0.2s' }}>
          <div className="absolute top-6 right-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
            <TrendingUp size={24} />
          </div>

          <h3 className="text-3xl font-bold mb-2">Statistics</h3>
          <p className="text-gray-600 mb-6">Average values from recent data</p>

          <div className="space-y-4">
            {/* Average Power */}
            <div className="bg-gray-100 rounded-2xl p-6 flex items-center gap-4 hover:scale-[1.02] transition-transform duration-200">
              <div className="bg-blue-100 p-2 rounded-xl shrink-0">
                <Zap className="text-blue-500" size={28} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600">Avg Power</p>
                <p className="text-3xl font-bold">{avgPower} W</p>
              </div>
            </div>

            {/* Average Voltage */}
            <div className="bg-gray-100 rounded-2xl p-6 flex items-center gap-4 hover:scale-[1.02] transition-transform duration-200">
              <div className="bg-green-100 p-2 rounded-xl shrink-0">
                <Gauge className="text-green-500" size={28} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600">Avg Voltage</p>
                <p className="text-3xl font-bold">{avgVoltage} V</p>
              </div>
            </div>

            {/* Average Current */}
            <div className="bg-gray-100 rounded-2xl p-6 flex items-center gap-4 hover:scale-[1.02] transition-transform duration-200">
              <div className="bg-yellow-100 p-2 rounded-xl shrink-0">
                <Activity className="text-yellow-500" size={28} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600">Avg Current</p>
                <p className="text-3xl font-bold">{avgCurrent} A</p>
              </div>
            </div>
          </div>

          {/* System Status */}
          <div className="mt-6 inline-flex items-center gap-2 bg-green-100 rounded-full px-5 py-3">
            <span className="h-3 w-3 bg-green-600 rounded-full animate-pulse" />
            <span className="font-bold text-green-600">System Normal</span>
          </div>
        </div>
      </section>

      {/* ================= CUSTOM ANIMATIONS ================= */}
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
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
        }

        .animate-slideDown {
          animation: slideDown 0.8s ease-out forwards;
        }

        .animate-slideUp {
          animation: slideUp 0.8s ease-out forwards;
          animation-delay: 0.2s;
          opacity: 0;
        }

        .animate-slideInLeft {
          animation: slideInLeft 0.8s ease-out forwards;
        }

        .animate-slideInRight {
          animation: slideInRight 0.8s ease-out forwards;
        }

        .animate-scaleIn {
          animation: scaleIn 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}

/* ================= METRIC CARD ================= */
function MetricCard({
  label,
  value,
  unit,
  status,
  icon,
  delay = "0s",
}: {
  label: string;
  value: number;
  unit: string;
  status: string;
  icon: React.ReactNode;
  delay?: string;
}) {
  return (
    <div 
      className="relative rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:scale-[1.03] hover:shadow-xl animate-scaleIn"
      style={{ animationDelay: delay }}
    >
      <div className="absolute top-6 right-6 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600 transition-transform duration-300 hover:scale-110">
        {icon}
      </div>

      <p className="text-sm text-gray-500 uppercase">{label}</p>

      <div className="mt-3 flex items-end gap-2">
        <span className="text-5xl font-bold">{value}</span>
        <span className="text-2xl text-gray-400">{unit}</span>
      </div>

      <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-sm text-green-700">
        <span className="h-2 w-2 rounded-full bg-green-600 animate-pulse" />
        {status}
      </span>
    </div>
  );
}