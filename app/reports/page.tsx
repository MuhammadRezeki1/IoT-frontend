"use client";

import { useEffect, useState } from "react";
import { Zap, DollarSign, TrendingUp, Download, FileText, Calendar } from "lucide-react";
import { motion } from "framer-motion";

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

type ReportType = {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
};

type CalculatedMetrics = {
  monthlyEnergy: number;
  energyChange: number;
  estimatedCost: number;
  efficiencyScore: number;
  totalEnergyConsumed: number;
  averageDailyUsage: number;
  peakPowerDemand: number;
  averagePowerFactor: number;
};

/* ================= MAIN PAGE ================= */
export default function ReportsPage() {
  const [data, setData] = useState<RawPowerData[]>([]);
  const [metrics, setMetrics] = useState<CalculatedMetrics | null>(null);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [loading, setLoading] = useState(true);

  /* ===== FETCH DATA FROM DATABASE ===== */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:3001/power");
        const json: RawPowerData[] = await res.json();
        
        setData(json);
        
        // Calculate metrics from real data
        const calculated = calculateMetrics(json);
        setMetrics(calculated);
        
        setLoading(false);
      } catch (e) {
        console.error("API error", e);
        setLoading(false);
      }
    };

    fetchData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  /* ===== CALCULATE METRICS FROM DATA ===== */
  const calculateMetrics = (data: RawPowerData[]): CalculatedMetrics => {
    if (data.length === 0) {
      return {
        monthlyEnergy: 0,
        energyChange: 0,
        estimatedCost: 0,
        efficiencyScore: 0,
        totalEnergyConsumed: 0,
        averageDailyUsage: 0,
        peakPowerDemand: 0,
        averagePowerFactor: 0,
      };
    }

    // Total energy consumed (sum of all energi_kwh)
    const totalEnergy = data.reduce((sum, item) => sum + item.energi_kwh, 0);
    
    // Average daily usage
    const uniqueDays = new Set(
      data.map(item => new Date(item.created_at).toDateString())
    ).size;
    const avgDailyUsage = totalEnergy / (uniqueDays || 1);
    
    // Peak power demand (max daya_watt)
    const peakPower = Math.max(...data.map(item => item.daya_watt));
    
    // Average power factor
    const avgPF = data.reduce((sum, item) => sum + item.pf, 0) / data.length;
    
    // Monthly energy (assuming current month)
    const currentMonth = new Date().getMonth();
    const monthlyData = data.filter(
      item => new Date(item.created_at).getMonth() === currentMonth
    );
    const monthlyEnergy = monthlyData.reduce((sum, item) => sum + item.energi_kwh, 0);
    
    // Energy change (compare first half vs second half of data)
    const midPoint = Math.floor(data.length / 2);
    const firstHalfEnergy = data.slice(0, midPoint).reduce((sum, item) => sum + item.energi_kwh, 0);
    const secondHalfEnergy = data.slice(midPoint).reduce((sum, item) => sum + item.energi_kwh, 0);
    const energyChange = firstHalfEnergy > 0 
      ? ((secondHalfEnergy - firstHalfEnergy) / firstHalfEnergy) * 100 
      : 0;
    
    // Estimated cost ($0.12 per kWh)
    const estimatedCost = totalEnergy * 0.12;
    
    // Efficiency score (based on power factor - higher PF = better efficiency)
    const efficiencyScore = Math.round(avgPF * 100);
    
    return {
      monthlyEnergy,
      energyChange,
      estimatedCost,
      efficiencyScore,
      totalEnergyConsumed: totalEnergy,
      averageDailyUsage: avgDailyUsage,
      peakPowerDemand: peakPower,
      averagePowerFactor: avgPF,
    };
  };

  /* ===== AVAILABLE REPORTS ===== */
  const availableReports: ReportType[] = [
    { 
      id: "1", 
      title: "Daily Energy Report", 
      description: "Detailed daily consumption analysis",
      icon: <Calendar size={24} className="text-blue-600" />
    },
    { 
      id: "2", 
      title: "Weekly Summary", 
      description: "Week-over-week performance analysis",
      icon: <FileText size={24} className="text-blue-600" />
    },
    { 
      id: "3", 
      title: "Monthly Analysis", 
      description: "Comprehensive monthly report with trends",
      icon: <FileText size={24} className="text-blue-600" />
    },
    { 
      id: "4", 
      title: "Annual Overview", 
      description: "Yearly trends and insights dashboard",
      icon: <FileText size={24} className="text-blue-600" />
    },
  ];

  /* ===== HANDLE REPORT GENERATION ===== */
  const handleGenerateReport = () => {
    setGeneratingReport(true);
    
    setTimeout(() => {
      setGeneratingReport(false);
      alert("Report generated successfully! In production, this would download a PDF with real data.");
    }, 2000);
  };

  /* ===== HANDLE REPORT DOWNLOAD ===== */
  const handleDownloadReport = (reportTitle: string) => {
    alert(`Downloading ${reportTitle}... 
    
Data Summary:
- Total Records: ${data.length}
- Total Energy: ${metrics?.totalEnergyConsumed.toFixed(2)} kWh
- Peak Power: ${metrics?.peakPowerDemand} W

In production, this would generate and download a PDF file.`);
  };

  /* ===== HANDLE PDF EXPORT ===== */
  const handleExportPDF = () => {
    alert(`Exporting current view as PDF...

Current Data:
- Total Entries: ${data.length}
- Date Range: ${data.length > 0 ? new Date(data[0].created_at).toLocaleDateString() : 'N/A'} - ${data.length > 0 ? new Date(data[data.length - 1].created_at).toLocaleDateString() : 'N/A'}

In production, this would generate a comprehensive PDF report.`);
  };

  /* ===== LOADING STATE ===== */
  if (loading || !metrics) {
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

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* ================= HEADER ================= */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between mb-8"
      >
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600 mt-2">Exportable electricity reports</p>
          <p className="text-sm text-gray-500 mt-1">
            Based on {data.length} data records
          </p>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition text-gray-700 font-medium"
          >
            <Download size={20} />
            Export PDF
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGenerateReport}
            disabled={generatingReport}
            className="flex items-center gap-2 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileText size={20} />
            {generatingReport ? "Generating..." : "Generate Report"}
          </motion.button>
        </div>
      </motion.div>

      {/* ================= METRIC CARDS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* MONTHLY ENERGY */}
        <MetricCard
          icon={<Zap size={32} />}
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
          label="Monthly Energy"
          value={metrics.monthlyEnergy}
          unit="kWh"
          subtitle={
            <span className={`flex items-center gap-1 text-sm ${
              metrics.energyChange >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              <TrendingUp size={16} />
              {metrics.energyChange >= 0 ? '+' : ''}{metrics.energyChange.toFixed(1)}% from baseline
            </span>
          }
        />

        {/* ESTIMATED COST */}
        <MetricCard
          icon={<DollarSign size={32} />}
          iconBgColor="bg-yellow-100"
          iconColor="text-yellow-600"
          label="Estimated Cost"
          value={metrics.estimatedCost}
          unit="$"
          isPrice
          subtitle={
            <span className="text-gray-600 text-sm">
              @ $0.12 per kWh
            </span>
          }
        />

        {/* EFFICIENCY SCORE */}
        <MetricCard
          icon={<TrendingUp size={32} />}
          iconBgColor="bg-green-100"
          iconColor="text-green-600"
          label="Efficiency Score"
          value={metrics.efficiencyScore}
          unit="%"
          subtitle={
            <span className="text-green-600 text-sm font-medium">
              {metrics.efficiencyScore >= 90 ? 'Excellent' : 
               metrics.efficiencyScore >= 80 ? 'Good' : 
               metrics.efficiencyScore >= 70 ? 'Fair' : 'Needs Improvement'} performance
            </span>
          }
        />
      </div>

      {/* ================= MONTHLY SUMMARY ================= */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-3xl p-8 shadow-sm mb-8"
      >
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Monthly Summary</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SummaryItem
            label="Total Energy Consumed"
            value={metrics.totalEnergyConsumed}
            unit="kWh"
          />

          <SummaryItem
            label="Average Daily Usage"
            value={metrics.averageDailyUsage}
            unit="kWh"
          />

          <SummaryItem
            label="Peak Power Demand"
            value={metrics.peakPowerDemand}
            unit="W"
          />

          <SummaryItem
            label="Average Power Factor"
            value={metrics.averagePowerFactor}
            unit=""
          />
        </div>
      </motion.div>

      {/* ================= AVAILABLE REPORTS ================= */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-3xl p-8 shadow-sm"
      >
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Available Reports</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {availableReports.map((report, index) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <ReportCard
                title={report.title}
                description={report.description}
                icon={report.icon}
                onDownload={() => handleDownloadReport(report.title)}
              />
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ================= DATA SOURCE INFO ================= */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center gap-3"
      >
        <div className="text-blue-600 text-2xl">ℹ️</div>
        <div className="flex-1">
          <p className="text-sm text-blue-900 font-medium">
            Data Source: Real-time Database
          </p>
          <p className="text-xs text-blue-700 mt-1">
            All metrics calculated from {data.length} power monitoring records • Last updated: {new Date().toLocaleString('id-ID')}
          </p>
        </div>
      </motion.div>
    </div>
  );
}

/* ================= METRIC CARD COMPONENT ================= */
function MetricCard({
  icon,
  iconBgColor,
  iconColor,
  label,
  value,
  unit,
  isPrice = false,
  subtitle,
}: {
  icon: React.ReactNode;
  iconBgColor: string;
  iconColor: string;
  label: string;
  value: number;
  unit: string;
  isPrice?: boolean;
  subtitle: React.ReactNode;
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-md transition"
    >
      <div className={`w-16 h-16 ${iconBgColor} rounded-2xl flex items-center justify-center mb-6`}>
        <div className={iconColor}>{icon}</div>
      </div>

      <p className="text-gray-600 text-sm mb-2">{label}</p>

      <div className="flex items-end gap-1 mb-4">
        {isPrice && <span className="text-4xl font-bold text-gray-900">{unit}</span>}
        <motion.span 
          key={value}
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-5xl font-bold text-gray-900"
        >
          {value.toFixed(2)}
        </motion.span>
        {!isPrice && <span className="text-2xl text-gray-500 pb-1">{unit}</span>}
      </div>

      <div>{subtitle}</div>
    </motion.div>
  );
}

/* ================= SUMMARY ITEM COMPONENT ================= */
function SummaryItem({
  label,
  value,
  unit,
}: {
  label: string;
  value: number;
  unit: string;
}) {
  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      className="bg-gray-50 rounded-2xl p-6"
    >
      <p className="text-gray-600 text-sm mb-2">{label}</p>
      <div className="flex items-end gap-2">
        <motion.span 
          key={value}
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-4xl font-bold text-gray-900"
        >
          {value.toFixed(2)}
        </motion.span>
        <span className="text-xl text-gray-500 pb-1">{unit}</span>
      </div>
    </motion.div>
  );
}

/* ================= REPORT CARD COMPONENT ================= */
function ReportCard({
  title,
  description,
  icon,
  onDownload,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  onDownload: () => void;
}) {
  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      className="bg-gray-50 rounded-2xl p-6 flex items-center justify-between hover:bg-gray-100 transition"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
          {icon}
        </div>

        <div>
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onDownload}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition text-gray-700 font-medium"
      >
        <Download size={18} />
        Download
      </motion.button>
    </motion.div>
  );
}