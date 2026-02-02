"use client";

import { useEffect, useState } from "react";
import { Zap, DollarSign, TrendingUp, Download, FileText, Calendar } from "lucide-react";
import { motion } from "framer-motion";

/* ================= TYPES ================= */
type MonthlyReport = {
  month: number;
  year: number;
  period: string;
  total_energy: number;
  avg_daily_energy: number;
  peak_date: string | null;
};

type CurrentMonthReport = {
  month: number;
  year: number;
  total_energy: number;
  avg_daily_energy: number;
  peak_date: string | null;
};

type Statistics = {
  total_energy: number;
  avg_daily_usage: number;
  peak_usage: number;
  peak_hour: string;
};

/* ================= MAIN PAGE ================= */
export default function ReportsPage() {
  const [monthlyReports, setMonthlyReports] = useState<MonthlyReport[]>([]);
  const [currentMonth, setCurrentMonth] = useState<CurrentMonthReport | null>(null);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingReport, setGeneratingReport] = useState(false);

  /* ===== FETCH DATA FROM API ===== */
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch monthly reports (12 bulan terakhir)
        const reportsRes = await fetch("http://localhost:3001/power/reports/monthly");
        const reportsData: MonthlyReport[] = await reportsRes.json();
        setMonthlyReports(reportsData);

        // Fetch current month report
        const currentRes = await fetch("http://localhost:3001/power/reports/current-month");
        const currentData: CurrentMonthReport = await currentRes.json();
        setCurrentMonth(currentData);

        // Fetch statistics (30 hari terakhir)
        const statsRes = await fetch("http://localhost:3001/power/statistics?days=30");
        const statsData: Statistics = await statsRes.json();
        setStatistics(statsData);

        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch reports data:", error);
        setLoading(false);
      }
    };

    fetchData();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchData, 300000);
    return () => clearInterval(interval);
  }, []);

  /* ===== CALCULATE METRICS ===== */
  const calculateMetrics = () => {
    if (!currentMonth || !statistics) {
      return {
        monthlyEnergy: 0,
        energyChange: 0,
        estimatedCost: 0,
        efficiencyScore: 92,
      };
    }

    // Current month energy
    const monthlyEnergy = currentMonth.total_energy;

    // Compare with previous month
    const previousMonth = monthlyReports.find(
      (r) => r.month === (currentMonth.month === 1 ? 12 : currentMonth.month - 1)
    );
    const energyChange = previousMonth
      ? ((monthlyEnergy - previousMonth.total_energy) / previousMonth.total_energy) * 100
      : 0;

    // Estimated cost
    const estimatedCost = monthlyEnergy * 0.12;

    // Efficiency score (based on avg daily usage vs capacity)
    const efficiencyScore = 92;

    return {
      monthlyEnergy,
      energyChange,
      estimatedCost,
      efficiencyScore,
    };
  };

  const metrics = calculateMetrics();

  /* ===== HANDLE REPORT GENERATION ===== */
  const handleGenerateReport = () => {
    setGeneratingReport(true);
    
    setTimeout(() => {
      setGeneratingReport(false);
      const reportContent = `
📊 MONTHLY ENERGY REPORT
=========================

Current Month: ${currentMonth?.month}/${currentMonth?.year}
Total Energy: ${currentMonth?.total_energy.toFixed(2)} kWh
Avg Daily: ${currentMonth?.avg_daily_energy.toFixed(2)} kWh
Peak Date: ${currentMonth?.peak_date || 'N/A'}

Last 30 Days Statistics:
- Total: ${statistics?.total_energy.toFixed(2)} kWh
- Average: ${statistics?.avg_daily_usage.toFixed(2)} kWh/day
- Peak: ${statistics?.peak_usage.toFixed(2)} kWh
- Peak Hour: ${statistics?.peak_hour}

Historical Data (${monthlyReports.length} months):
${monthlyReports.map(r => `  ${r.period}: ${r.total_energy.toFixed(2)} kWh`).join('\n')}
      `;
      
      alert("Report Generated!\n\n" + reportContent);
    }, 2000);
  };

  /* ===== HANDLE EXPORT PDF ===== */
  const handleExportPDF = () => {
    alert(`Exporting comprehensive PDF report...
    
Data Included:
- ${monthlyReports.length} months of historical data
- Current month: ${currentMonth?.total_energy.toFixed(2)} kWh
- Trend analysis and forecasts

In production, this would generate a professional PDF.`);
  };

  /* ===== LOADING STATE ===== */
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div 
            className="rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-gray-600">Loading reports data...</p>
        </motion.div>
      </div>
    );
  }

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* HEADER */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between mb-8"
      >
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600 mt-2">Monthly electricity consumption reports</p>
          <p className="text-sm text-gray-500 mt-1">
            {monthlyReports.length} months of historical data available
          </p>
        </div>

        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            <Download size={20} />
            Export PDF
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGenerateReport}
            disabled={generatingReport}
            className="flex items-center gap-2 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
          >
            <FileText size={20} />
            {generatingReport ? "Generating..." : "Generate Report"}
          </motion.button>
        </div>
      </motion.div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <MetricCard
          icon={<Zap size={32} />}
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
          label="Current Month"
          value={metrics.monthlyEnergy}
          unit="kWh"
          subtitle={
            <span className={`text-sm ${metrics.energyChange >= 0 ? 'text-red-600' : 'text-green-600'}`}>
              {metrics.energyChange >= 0 ? '+' : ''}{metrics.energyChange.toFixed(1)}% vs last month
            </span>
          }
        />

        <MetricCard
          icon={<DollarSign size={32} />}
          iconBgColor="bg-yellow-100"
          iconColor="text-yellow-600"
          label="Estimated Cost"
          value={metrics.estimatedCost}
          unit="$"
          isPrice
          subtitle={<span className="text-sm text-gray-600">@ $0.12/kWh</span>}
        />

        <MetricCard
          icon={<TrendingUp size={32} />}
          iconBgColor="bg-green-100"
          iconColor="text-green-600"
          label="Avg Daily"
          value={currentMonth?.avg_daily_energy || 0}
          unit="kWh"
          subtitle={<span className="text-sm text-gray-600">This month</span>}
        />

        <MetricCard
          icon={<Calendar size={32} />}
          iconBgColor="bg-purple-100"
          iconColor="text-purple-600"
          label="Peak Date"
          value={currentMonth?.peak_date ? new Date(currentMonth.peak_date).getDate() : 0}
          unit=""
          subtitle={
            <span className="text-sm text-gray-600">
              {currentMonth?.peak_date 
                ? monthNames[new Date(currentMonth.peak_date).getMonth()] 
                : 'N/A'}
            </span>
          }
        />
      </div>

      {/* MONTHLY SUMMARY */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl p-8 shadow-sm mb-8"
      >
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Monthly Summary</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SummaryItem
            label="Total Energy (30 days)"
            value={statistics?.total_energy || 0}
            unit="kWh"
          />

          <SummaryItem
            label="Average Daily Usage"
            value={statistics?.avg_daily_usage || 0}
            unit="kWh"
          />

          <SummaryItem
            label="Peak Usage"
            value={statistics?.peak_usage || 0}
            unit="kWh"
          />

          <SummaryItem
            label="Peak Hour"
            value={statistics?.peak_hour || '18:00'}
            unit=""
            isText
          />
        </div>
      </motion.div>

      {/* HISTORICAL DATA TABLE */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-3xl p-8 shadow-sm"
      >
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Historical Monthly Data</h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Period</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Total Energy</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Avg Daily</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Peak Date</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Cost</th>
              </tr>
            </thead>
            <tbody>
              {monthlyReports.map((report, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">
                    {monthNames[report.month - 1]} {report.year}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900">
                    {report.total_energy.toFixed(2)} kWh
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900">
                    {report.avg_daily_energy.toFixed(2)} kWh
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {report.peak_date 
                      ? new Date(report.peak_date).toLocaleDateString() 
                      : 'N/A'}
                  </td>
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">
                    ${(report.total_energy * 0.12).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}

/* ================= COMPONENTS ================= */
function MetricCard({ icon, iconBgColor, iconColor, label, value, unit, isPrice = false, subtitle }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition"
    >
      <div className={`w-14 h-14 ${iconBgColor} rounded-xl flex items-center justify-center mb-4`}>
        <div className={iconColor}>{icon}</div>
      </div>

      <p className="text-gray-600 text-sm mb-2">{label}</p>

      <div className="flex items-end gap-1 mb-2">
        {isPrice && <span className="text-3xl font-bold">{unit}</span>}
        <span className="text-4xl font-bold text-gray-900">
          {typeof value === 'number' ? value.toFixed(2) : value}
        </span>
        {!isPrice && unit && <span className="text-xl text-gray-500 pb-1">{unit}</span>}
      </div>

      {subtitle}
    </motion.div>
  );
}

function SummaryItem({ label, value, unit, isText = false }: any) {
  return (
    <div className="bg-gray-50 rounded-xl p-6">
      <p className="text-gray-600 text-sm mb-2">{label}</p>
      <div className="flex items-end gap-2">
        <span className="text-3xl font-bold text-gray-900">
          {isText ? value : (typeof value === 'number' ? value.toFixed(2) : value)}
        </span>
        {unit && <span className="text-lg text-gray-500 pb-1">{unit}</span>}
      </div>
    </div>
  );
}