"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp,
  Lightbulb,
  Clock,
  DollarSign,
} from "lucide-react";
import { getApiUrl, apiConfig, buildUrl, ApiResponse } from "@/lib/api-config";

/* ================= TYPES ================= */
type Suggestion = {
  id: string;
  title: string;
  savings: string;
  borderColor: string;
  bgColor: string;
};

type PeakData = {
  time: string;
  usage: number;
  timestamp?: Date;
};

type LoadPatternDay = {
  day: string;
  morning: number;
  afternoon: number;
  evening: number;
  total_energy?: number;
};

type StatisticsData = {
  total_energy: number;
  avg_daily_usage: number;
  peak_usage: number;
  peak_hour: string;
  total_days?: number;
};

/* ================= DUMMY DATA ================= */
const DUMMY_PEAK_DATA: PeakData[] = [
  { time: "18:00", usage: 365 },
  { time: "19:00", usage: 455 },
  { time: "20:00", usage: 610 },
  { time: "21:00", usage: 525 },
  { time: "22:00", usage: 395 },
  { time: "23:00", usage: 305 },
  { time: "00:00", usage: 265 },
];

const DUMMY_LOAD_PATTERN: LoadPatternDay[] = [
  { day: "Mon", morning: 365, afternoon: 455, evening: 610 },
  { day: "Tue", morning: 395, afternoon: 375, evening: 525 },
  { day: "Wed", morning: 365, afternoon: 505, evening: 455 },
  { day: "Thu", morning: 455, afternoon: 610, evening: 395 },
  { day: "Fri", morning: 375, afternoon: 525, evening: 505 },
  { day: "Sat", morning: 505, afternoon: 365, evening: 610 },
  { day: "Sun", morning: 525, afternoon: 395, evening: 455 },
];

/* ================= MAIN PAGE ================= */
export default function PowerAnalysisPage() {
  const [hoveredPoint, setHoveredPoint] = useState<PeakData | null>(null);
  const [hoveredBar, setHoveredBar] = useState<LoadPatternDay | null>(null);
  
  // State untuk data dari backend
  const [powerFactor, setPowerFactor] = useState(0.95);
  const [peakUsageData, setPeakUsageData] = useState<PeakData[]>(DUMMY_PEAK_DATA);
  const [loadPatternData, setLoadPatternData] = useState<LoadPatternDay[]>(DUMMY_LOAD_PATTERN);
  const [statistics, setStatistics] = useState({
    peakHours: { time: "8PM - 10PM", description: "Highest consumption period" },
    efficiencyTrend: { value: "+5%", description: "Improvement this month" },
    savingsPotential: { value: "$35/mo", description: "With optimizations" },
  });
  const [loading, setLoading] = useState(true);

  /* ===== FETCH DATA DARI BACKEND ===== */
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      console.log('📡 [Analysis] Starting data fetch from:', apiConfig.baseUrl);
      
      await Promise.all([
        fetchPeakUsageData(),
        fetchLoadPatternData(),
        fetchPowerFactor(),
        fetchStatistics(),
      ]);
      
      setLoading(false);
    } catch (error) {
      console.error("❌ [Analysis] Error fetching data:", error);
      setLoading(false);
    }
  };

  const fetchPeakUsageData = async () => {
    try {
      console.log('📡 [Peak Usage] Fetching from:', getApiUrl(apiConfig.endpoints.peakUsage));
      
      const response = await fetch(getApiUrl(apiConfig.endpoints.peakUsage));
      
      if (!response.ok) {
        console.error(`❌ [Peak Usage] HTTP error: ${response.status}`);
        setPeakUsageData(DUMMY_PEAK_DATA);
        return;
      }
      
      const data = await response.json();
      console.log('✅ [Peak Usage] Response:', data);

      if (!Array.isArray(data) || data.length === 0) {
        console.log('⚠️ [Peak Usage] No data, using dummy');
        setPeakUsageData(DUMMY_PEAK_DATA);
        return;
      }

      // Limit to 10 records for readability
      const limitedData = data.slice(0, 10);
      
      const formattedData: PeakData[] = limitedData.map((item: any) => ({
        time: item.time,
        usage: Number(item.usage) || 0,
        timestamp: item.timestamp ? new Date(item.timestamp) : undefined,
      }));

      console.log('✨ [Peak Usage] Formatted:', formattedData.length, 'records');
      setPeakUsageData(formattedData);
    } catch (error) {
      console.error("❌ [Peak Usage] Error:", error);
      setPeakUsageData(DUMMY_PEAK_DATA);
    }
  };

  const fetchLoadPatternData = async () => {
    try {
      console.log('📡 [Load Pattern] Fetching from:', getApiUrl(apiConfig.endpoints.loadPattern));
      
      const response = await fetch(getApiUrl(apiConfig.endpoints.loadPattern));
      
      if (!response.ok) {
        console.error(`❌ [Load Pattern] HTTP error: ${response.status}`);
        setLoadPatternData(DUMMY_LOAD_PATTERN);
        return;
      }
      
      const data = await response.json();
      console.log('✅ [Load Pattern] Response:', data);

      if (!Array.isArray(data) || data.length === 0) {
        console.log('⚠️ [Load Pattern] No data, using dummy');
        setLoadPatternData(DUMMY_LOAD_PATTERN);
        return;
      }

      // Limit to 7 days for readability
      const limitedData = data.slice(-7);

      const formattedData: LoadPatternDay[] = limitedData.map((item: any) => ({
        day: item.day,
        morning: Number(item.morning) || 0,
        afternoon: Number(item.afternoon) || 0,
        evening: Number(item.evening) || 0,
        total_energy: item.total_energy ? Number(item.total_energy) : undefined,
      }));

      console.log('✨ [Load Pattern] Formatted:', formattedData.length, 'days');
      setLoadPatternData(formattedData);
    } catch (error) {
      console.error("❌ [Load Pattern] Error:", error);
      setLoadPatternData(DUMMY_LOAD_PATTERN);
    }
  };

  const fetchPowerFactor = async () => {
    try {
      console.log('📡 [Power Factor] Fetching from:', getApiUrl(apiConfig.endpoints.powerFactor));
      
      const response = await fetch(getApiUrl(apiConfig.endpoints.powerFactor));
      
      if (!response.ok) {
        console.error(`❌ [Power Factor] HTTP error: ${response.status}`);
        return;
      }
      
      const data = await response.json();
      console.log('✅ [Power Factor] Response:', data);

      if (data && data.power_factor) {
        const pf = Number(data.power_factor) || 0.95;
        setPowerFactor(parseFloat(pf.toFixed(2)));
        console.log('✨ [Power Factor] Set to:', pf);
      }
    } catch (error) {
      console.error("❌ [Power Factor] Error:", error);
    }
  };

  const fetchStatistics = async () => {
    try {
      const statsUrl = buildUrl(apiConfig.endpoints.statistics, { days: 30 });
      console.log('📡 [Statistics] Fetching from:', statsUrl);
      
      const response = await fetch(statsUrl);
      
      if (!response.ok) {
        console.error(`❌ [Statistics] HTTP error: ${response.status}`);
        return;
      }
      
      const json: ApiResponse<StatisticsData> = await response.json();
      console.log('✅ [Statistics] Response:', json);

      let statsData: StatisticsData;
      
      if ('data' in json && json.data) {
        statsData = json.data;
      } else {
        statsData = json as unknown as StatisticsData;
      }

      const totalEnergy = Number(statsData.total_energy) || 0;
      const peakHour = statsData.peak_hour || "6PM - 7PM";

      setStatistics({
        peakHours: {
          time: peakHour,
          description: "Highest consumption period",
        },
        efficiencyTrend: {
          value: "+5%",
          description: "Improvement this month",
        },
        savingsPotential: {
          value: `$${Math.round(totalEnergy * 0.15)}/mo`,
          description: "With optimizations",
        },
      });

      console.log('✨ [Statistics] Updated successfully');
    } catch (error) {
      console.error("❌ [Statistics] Error:", error);
    }
  };

  const powerFactorStatus = powerFactor >= 0.95 
    ? "Excellent" 
    : powerFactor >= 0.85 
    ? "Good" 
    : "Fair";

  const suggestions: Suggestion[] = [
    {
      id: "1",
      title: "Shift high-power usage to off-peak hours",
      savings: "$12/month",
      borderColor: "border-l-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      id: "2",
      title: "Improve power factor with capacitor banks",
      savings: "$8/month",
      borderColor: "border-l-green-500",
      bgColor: "bg-green-50",
    },
    {
      id: "3",
      title: "Replace inefficient devices",
      savings: "$15/month",
      borderColor: "border-l-yellow-500",
      bgColor: "bg-yellow-50",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-xl text-gray-600">Loading power analysis...</p>
        </div>
      </div>
    );
  }

  const maxLoadValue = Math.max(
    ...loadPatternData.flatMap(d => [d.morning, d.afternoon, d.evening])
  );

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Power Analysis</h1>
        <p className="text-gray-600 mt-2">Smart energy insights and recommendations</p>
      </div>

      {/* POWER FACTOR EFFICIENCY */}
      <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-3xl p-8 shadow-sm mb-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Power Factor Efficiency
            </h2>
            <p className="text-gray-600">Current system efficiency rating</p>
          </div>

          <div className="w-16 h-16 bg-green-200 rounded-2xl flex items-center justify-center">
            <TrendingUp size={32} className="text-green-600" />
          </div>
        </div>

        <div className="flex items-end gap-4 mb-4">
          <h3 className="text-8xl font-bold text-gray-900">{powerFactor}</h3>
          <span className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-bold mb-4">
            {powerFactorStatus}
          </span>
        </div>

        <div className="w-full h-3 bg-green-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 rounded-full transition-all duration-1000"
            style={{ width: `${powerFactor * 100}%` }}
          />
        </div>
      </div>

      {/* CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* PEAK USAGE TIME CHART - IMPROVED */}
        <div className="bg-white rounded-3xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Peak Usage Time ({peakUsageData.length} Records)
          </h2>

          <div className="relative h-80">
            <svg width="100%" height="100%" viewBox="0 0 500 320" className="overflow-visible">
              {/* Grid Lines */}
              {[280, 210, 140, 70].map((y, i) => (
                <line
                  key={`grid-${i}`}
                  x1="60"
                  y1={y}
                  x2="480"
                  y2={y}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                />
              ))}

              {/* Y-axis */}
              <text x="10" y="285" fontSize="13" fill="#6b7280" fontWeight="500">0</text>
              <text x="5" y="215" fontSize="13" fill="#6b7280" fontWeight="500">200</text>
              <text x="5" y="145" fontSize="13" fill="#6b7280" fontWeight="500">400</text>
              <text x="5" y="75" fontSize="13" fill="#6b7280" fontWeight="500">600</text>
              <text x="5" y="35" fontSize="13" fill="#6b7280" fontWeight="500">800</text>

              {/* Area gradient */}
              <defs>
                <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
                </linearGradient>
              </defs>

              {/* Area Path */}
              {peakUsageData.length > 0 && (
                <>
                  <path
                    d={`M ${peakUsageData.map((p, i) => {
                      const x = 60 + (i * 420 / (peakUsageData.length - 1));
                      const y = 280 - (p.usage / 800 * 250);
                      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                    }).join(' ')} L ${60 + (420 / (peakUsageData.length - 1)) * (peakUsageData.length - 1)} 280 L 60 280 Z`}
                    fill="url(#areaGradient)"
                  />

                  {/* Line */}
                  <path
                    d={peakUsageData.map((p, i) => {
                      const x = 60 + (i * 420 / (peakUsageData.length - 1));
                      const y = 280 - (p.usage / 800 * 250);
                      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                    }).join(' ')}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Points */}
                  {peakUsageData.map((point, i) => {
                    const x = 60 + (i * 420 / (peakUsageData.length - 1));
                    const y = 280 - (point.usage / 800 * 250);
                    return (
                      <circle
                        key={`point-${i}`}
                        cx={x}
                        cy={y}
                        r="5"
                        fill="#3b82f6"
                        stroke="white"
                        strokeWidth="2"
                        className="cursor-pointer hover:r-7 transition-all"
                        onMouseEnter={() => setHoveredPoint(point)}
                        onMouseLeave={() => setHoveredPoint(null)}
                      />
                    );
                  })}
                </>
              )}

              {/* X-axis labels - IMPROVED: Rotated */}
              {peakUsageData.map((p, i) => {
                const x = 60 + (i * 420 / (peakUsageData.length - 1));
                return (
                  <text
                    key={`label-${i}`}
                    x={x}
                    y="295"
                    fontSize="11"
                    fill="#6b7280"
                    textAnchor="end"
                    transform={`rotate(-45 ${x} 295)`}
                    fontWeight="500"
                  >
                    {p.time}
                  </text>
                );
              })}
            </svg>

            {/* Tooltip */}
            {hoveredPoint && (
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded-lg shadow-lg border border-blue-200 z-10">
                <p className="text-sm font-bold text-gray-900">{hoveredPoint.time}</p>
                <p className="text-xs text-blue-600">{hoveredPoint.usage}W</p>
              </div>
            )}
          </div>
        </div>

        {/* LOAD PATTERN ANALYSIS CHART - IMPROVED */}
        <div className="bg-white rounded-3xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Load Pattern Analysis (7 Days)
          </h2>

          <div className="relative h-80">
            <svg width="100%" height="100%" viewBox="0 0 500 320" className="overflow-visible">
              {/* Grid Lines */}
              {[280, 210, 140, 70].map((y, i) => (
                <line
                  key={`load-grid-${i}`}
                  x1="60"
                  y1={y}
                  x2="480"
                  y2={y}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                />
              ))}

              {/* Y-axis */}
              <text x="10" y="285" fontSize="13" fill="#6b7280" fontWeight="500">0</text>
              <text x="5" y="215" fontSize="13" fill="#6b7280" fontWeight="500">200</text>
              <text x="5" y="145" fontSize="13" fill="#6b7280" fontWeight="500">400</text>
              <text x="5" y="75" fontSize="13" fill="#6b7280" fontWeight="500">600</text>
              <text x="5" y="35" fontSize="13" fill="#6b7280" fontWeight="500">800</text>

              {/* Bars for each day */}
              {loadPatternData.map((day, index) => {
                const totalDays = loadPatternData.length;
                const chartWidth = 420;
                const groupWidth = chartWidth / totalDays;
                const x = 60 + (index * groupWidth);
                
                const barWidth = (groupWidth * 0.8) / 3;
                const spacing = barWidth * 0.1;

                const maxHeight = 250;
                const morningHeight = (day.morning / maxLoadValue) * maxHeight;
                const afternoonHeight = (day.afternoon / maxLoadValue) * maxHeight;
                const eveningHeight = (day.evening / maxLoadValue) * maxHeight;

                return (
                  <g
                    key={`bar-${index}`}
                    onMouseEnter={() => setHoveredBar(day)}
                    onMouseLeave={() => setHoveredBar(null)}
                    className="cursor-pointer"
                  >
                    {/* Morning */}
                    <rect
                      x={x}
                      y={280 - morningHeight}
                      width={barWidth}
                      height={morningHeight}
                      fill="#3b82f6"
                      rx="3"
                      className="hover:opacity-80 transition-opacity"
                    />

                    {/* Afternoon */}
                    <rect
                      x={x + barWidth + spacing}
                      y={280 - afternoonHeight}
                      width={barWidth}
                      height={afternoonHeight}
                      fill="#22c55e"
                      rx="3"
                      className="hover:opacity-80 transition-opacity"
                    />

                    {/* Evening */}
                    <rect
                      x={x + (barWidth + spacing) * 2}
                      y={280 - eveningHeight}
                      width={barWidth}
                      height={eveningHeight}
                      fill="#f59e0b"
                      rx="3"
                      className="hover:opacity-80 transition-opacity"
                    />

                    {/* Day Label */}
                    <text
                      x={x + (groupWidth / 2)}
                      y="300"
                      fontSize="13"
                      fill="#6b7280"
                      textAnchor="middle"
                      fontWeight="600"
                    >
                      {day.day}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Tooltip */}
            {hoveredBar && (
              <div className="absolute top-4 right-4 bg-white px-4 py-3 rounded-lg shadow-lg border border-gray-200 z-10">
                <p className="text-lg font-bold text-gray-900 mb-2">{hoveredBar.day}</p>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                    <span className="text-xs font-semibold">Morning: {hoveredBar.morning}W</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span className="text-xs font-semibold">Afternoon: {hoveredBar.afternoon}W</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                    <span className="text-xs font-semibold">Evening: {hoveredBar.evening}W</span>
                  </div>
                </div>
              </div>
            )}

            {/* Legend */}
            <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-6 mt-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span className="text-xs text-gray-700 font-medium">Morning</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span className="text-xs text-gray-700 font-medium">Afternoon</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                <span className="text-xs text-gray-700 font-medium">Evening</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ENERGY SAVING SUGGESTIONS */}
      <div className="bg-white rounded-3xl p-8 shadow-sm mb-8">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-14 h-14 bg-yellow-100 rounded-2xl flex items-center justify-center">
            <Lightbulb size={28} className="text-yellow-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Energy Saving Suggestions
            </h2>
            <p className="text-gray-600 mt-1">
              Personalized recommendations to reduce consumption
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className={`${suggestion.bgColor} border-l-4 ${suggestion.borderColor} rounded-xl p-5 hover:shadow-md transition-shadow`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-base font-bold text-gray-900">
                    {suggestion.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Potential savings: <span className="font-semibold">{suggestion.savings}</span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* STATISTICS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={Clock}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
          title="Peak Hours"
          value={statistics.peakHours.time}
          description={statistics.peakHours.description}
        />

        <StatCard
          icon={TrendingUp}
          iconBg="bg-green-100"
          iconColor="text-green-600"
          title="Efficiency Trend"
          value={statistics.efficiencyTrend.value}
          description={statistics.efficiencyTrend.description}
          valueColor="text-green-600"
        />

        <StatCard
          icon={Lightbulb}
          iconBg="bg-yellow-100"
          iconColor="text-yellow-600"
          title="Savings Potential"
          value={statistics.savingsPotential.value}
          description={statistics.savingsPotential.description}
          valueColor="text-yellow-600"
        />
      </div>
    </div>
  );
}

/* STAT CARD COMPONENT */
function StatCard({
  icon: Icon,
  iconBg,
  iconColor,
  title,
  value,
  description,
  valueColor = "text-gray-900",
}: {
  icon: any;
  iconBg: string;
  iconColor: string;
  title: string;
  value: string;
  description: string;
  valueColor?: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center`}>
          <Icon size={24} className={iconColor} />
        </div>
        <h3 className="text-base font-bold text-gray-900">{title}</h3>
      </div>

      <p className={`text-4xl font-bold ${valueColor} mb-2`}>{value}</p>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}