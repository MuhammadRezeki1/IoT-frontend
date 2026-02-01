"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle, 
  Info,
  Mail,
  TrendingUp,
  Zap,
  Activity
} from "lucide-react";

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

type AlertSeverity = "High" | "Medium" | "Low";
type AlertType = "critical" | "warning" | "info" | "success";

type Alert = {
  id: string;
  icon: AlertType;
  title: string;
  time: string;
  severity: AlertSeverity;
  bgColor: string;
  borderColor: string;
  iconColor: string;
  category: string;
};

type AlertStatistics = {
  critical: number;
  warning: number;
  info: number;
  resolved: number;
};

/* ================= MAIN PAGE ================= */
export default function AlertsNotificationsPage() {
  const [data, setData] = useState<RawPowerData[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [statistics, setStatistics] = useState<AlertStatistics>({
    critical: 0,
    warning: 0,
    info: 0,
    resolved: 0,
  });
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [loading, setLoading] = useState(true);

  /* ===== FETCH DATA FROM DATABASE ===== */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:3001/power");
        const json: RawPowerData[] = await res.json();
        
        setData(json);
        
        // Analyze data and generate alerts
        const generatedAlerts = analyzeDataForAlerts(json);
        setAlerts(generatedAlerts);
        
        // Calculate statistics
        const stats = calculateStatistics(generatedAlerts);
        setStatistics(stats);
        
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

  /* ===== ANALYZE DATA FOR ALERTS ===== */
  const analyzeDataForAlerts = (data: RawPowerData[]): Alert[] => {
    const alerts: Alert[] = [];
    let alertId = 1;

    // Sort data by date (newest first)
    const sortedData = [...data].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    sortedData.forEach((item, index) => {
      const timeAgo = getTimeAgo(item.created_at);

      // Check for Overvoltage (> 240V)
      if (item.tegangan > 240) {
        alerts.push({
          id: `alert-${alertId++}`,
          icon: "critical",
          title: `Overvoltage detected: ${item.tegangan}V at ${new Date(item.created_at).toLocaleTimeString('id-ID')}`,
          time: timeAgo,
          severity: "High",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          iconColor: "text-red-600",
          category: "voltage",
        });
      }
      
      // Check for Undervoltage (< 200V)
      else if (item.tegangan < 200) {
        alerts.push({
          id: `alert-${alertId++}`,
          icon: "warning",
          title: `Undervoltage warning: ${item.tegangan}V at ${new Date(item.created_at).toLocaleTimeString('id-ID')}`,
          time: timeAgo,
          severity: "High",
          bgColor: "bg-yellow-50",
          borderColor: "border-yellow-200",
          iconColor: "text-yellow-600",
          category: "voltage",
        });
      }

      // Check for Overcurrent (> 5A for example)
      if (item.arus > 5) {
        alerts.push({
          id: `alert-${alertId++}`,
          icon: "critical",
          title: `Overcurrent detected on main line: ${item.arus}A at ${new Date(item.created_at).toLocaleTimeString('id-ID')}`,
          time: timeAgo,
          severity: "High",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          iconColor: "text-red-600",
          category: "current",
        });
      }

      // Check for Low Power Factor (< 0.85)
      if (item.pf < 0.85) {
        alerts.push({
          id: `alert-${alertId++}`,
          icon: "warning",
          title: `Power factor dropped to ${item.pf.toFixed(2)} at ${new Date(item.created_at).toLocaleTimeString('id-ID')}`,
          time: timeAgo,
          severity: "Medium",
          bgColor: "bg-yellow-50",
          borderColor: "border-yellow-200",
          iconColor: "text-yellow-600",
          category: "power_factor",
        });
      }

      // Check for Frequency deviation (not 50Hz ±0.5)
      if (item.frekuensi < 49.5 || item.frekuensi > 50.5) {
        alerts.push({
          id: `alert-${alertId++}`,
          icon: "warning",
          title: `Frequency deviation: ${item.frekuensi}Hz at ${new Date(item.created_at).toLocaleTimeString('id-ID')}`,
          time: timeAgo,
          severity: "Medium",
          bgColor: "bg-yellow-50",
          borderColor: "border-yellow-200",
          iconColor: "text-yellow-600",
          category: "frequency",
        });
      }

      // Check for High Power Consumption (> 600W)
      if (item.daya_watt > 600) {
        alerts.push({
          id: `alert-${alertId++}`,
          icon: "info",
          title: `High power consumption: ${item.daya_watt}W at ${new Date(item.created_at).toLocaleTimeString('id-ID')}`,
          time: timeAgo,
          severity: "Low",
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200",
          iconColor: "text-blue-600",
          category: "power",
        });
      }
    });

    // Add success/normal operation alerts for good readings
    const recentNormalData = sortedData.filter(item => 
      item.tegangan >= 200 && item.tegangan <= 240 &&
      item.arus < 5 &&
      item.pf >= 0.85 &&
      item.frekuensi >= 49.5 && item.frekuensi <= 50.5
    );

    if (recentNormalData.length > 0) {
      const latestNormal = recentNormalData[0];
      alerts.push({
        id: `alert-${alertId++}`,
        icon: "success",
        title: `System operating normally - All parameters within safe range`,
        time: getTimeAgo(latestNormal.created_at),
        severity: "Low",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
        iconColor: "text-green-600",
        category: "system",
      });
    }

    // Add daily energy report alert (based on most recent data)
    if (sortedData.length > 0) {
      alerts.push({
        id: `alert-${alertId++}`,
        icon: "info",
        title: `Daily energy report generated - Total: ${sortedData[0].energi_kwh.toFixed(2)} kWh`,
        time: getTimeAgo(sortedData[0].created_at),
        severity: "Low",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
        iconColor: "text-blue-600",
        category: "report",
      });
    }

    // Sort alerts by severity and time
    return alerts.sort((a, b) => {
      const severityOrder = { High: 0, Medium: 1, Low: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
  };

  /* ===== CALCULATE STATISTICS ===== */
  const calculateStatistics = (alerts: Alert[]): AlertStatistics => {
    const stats = {
      critical: alerts.filter(a => a.icon === "critical").length,
      warning: alerts.filter(a => a.icon === "warning").length,
      info: alerts.filter(a => a.icon === "info").length,
      resolved: alerts.filter(a => a.icon === "success").length,
    };

    return stats;
  };

  /* ===== GET TIME AGO ===== */
  const getTimeAgo = (dateString: string): string => {
    const now = new Date();
    const then = new Date(dateString);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  /* ===== GET ALERT ICON ===== */
  const getAlertIcon = (type: AlertType) => {
    const iconProps = { size: 24 };
    
    switch (type) {
      case "warning":
        return <AlertTriangle {...iconProps} className="text-yellow-600" />;
      case "critical":
        return <AlertCircle {...iconProps} className="text-red-600" />;
      case "success":
        return <CheckCircle {...iconProps} className="text-green-600" />;
      case "info":
        return <Info {...iconProps} className="text-blue-600" />;
      default:
        return <AlertCircle {...iconProps} className="text-gray-600" />;
    }
  };

  /* ===== GET SEVERITY BADGE ===== */
  const getSeverityBadge = (severity: AlertSeverity) => {
    const styles = {
      High: "bg-red-500 text-white",
      Medium: "bg-yellow-500 text-white",
      Low: "bg-blue-500 text-white",
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold ${styles[severity]}`}>
        {severity}
      </span>
    );
  };

  /* ===== TOGGLE EMAIL NOTIFICATIONS ===== */
  const handleEmailToggle = () => {
    setEmailNotifications(!emailNotifications);
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
          <p className="text-gray-600">Analyzing system data...</p>
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
        className="mb-8"
      >
        <h1 className="text-4xl font-bold text-gray-900">
          Alerts &amp; Notifications
        </h1>
        <p className="text-gray-600 mt-2">Safety monitoring and alerts</p>
        <p className="text-sm text-gray-500 mt-1">
          Analyzing {data.length} data records • {alerts.length} alerts detected
        </p>
      </motion.div>

      {/* ================= NOTIFICATION SETTINGS ================= */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-3xl p-8 shadow-sm mb-8"
      >
        <h2 className="text-3xl font-bold text-gray-900 mb-6">
          Notification Settings
        </h2>

        <div className="bg-gray-50 rounded-2xl p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Mail size={24} className="text-blue-600" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Email Notifications
              </h3>
              <p className="text-sm text-gray-600">
                Receive {statistics.critical + statistics.warning} critical/warning alerts via email
              </p>
            </div>
          </div>

          <button
            onClick={handleEmailToggle}
            className={`relative w-16 h-8 rounded-full transition-colors duration-300 ${
              emailNotifications ? "bg-blue-500" : "bg-gray-300"
            }`}
            aria-label="Toggle email notifications"
          >
            <motion.span
              animate={{ x: emailNotifications ? 32 : 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full"
            />
          </button>
        </div>
      </motion.div>

      {/* ================= ALERT STATISTICS ================= */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-3xl p-8 shadow-sm mb-8"
      >
        <h2 className="text-3xl font-bold text-gray-900 mb-6">
          Alert Statistics
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <StatCard
            label="Critical"
            count={statistics.critical}
            icon={<AlertCircle size={32} />}
            bgColor="bg-red-50"
            textColor="text-red-600"
            borderColor="border-red-200"
          />

          <StatCard
            label="Warning"
            count={statistics.warning}
            icon={<AlertTriangle size={32} />}
            bgColor="bg-yellow-50"
            textColor="text-yellow-600"
            borderColor="border-yellow-200"
          />

          <StatCard
            label="Info"
            count={statistics.info}
            icon={<Info size={32} />}
            bgColor="bg-blue-50"
            textColor="text-blue-600"
            borderColor="border-blue-200"
          />

          <StatCard
            label="Resolved"
            count={statistics.resolved}
            icon={<CheckCircle size={32} />}
            bgColor="bg-green-50"
            textColor="text-green-600"
            borderColor="border-green-200"
          />
        </div>
      </motion.div>

      {/* ================= RECENT ALERTS ================= */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-3xl p-8 shadow-sm mb-8"
      >
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Recent Alerts</h2>

        {alerts.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No alerts detected - System operating normally</p>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert, index) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.05 }}
              >
                <AlertCard
                  icon={getAlertIcon(alert.icon)}
                  title={alert.title}
                  time={alert.time}
                  severity={alert.severity}
                  bgColor={alert.bgColor}
                  borderColor={alert.borderColor}
                  getSeverityBadge={getSeverityBadge}
                />
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* ================= DATA SOURCE INFO ================= */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center gap-3"
      >
        <div className="text-blue-600 text-2xl">ℹ️</div>
        <div className="flex-1">
          <p className="text-sm text-blue-900 font-medium">
            Real-time Alert System
          </p>
          <p className="text-xs text-blue-700 mt-1">
            Alerts generated from {data.length} power monitoring records • Auto-refresh every 30 seconds • Last updated: {new Date().toLocaleString('id-ID')}
          </p>
        </div>
      </motion.div>
    </div>
  );
}

/* ================= ALERT CARD COMPONENT ================= */
function AlertCard({
  icon,
  title,
  time,
  severity,
  bgColor,
  borderColor,
  getSeverityBadge,
}: {
  icon: React.ReactNode;
  title: string;
  time: string;
  severity: AlertSeverity;
  bgColor: string;
  borderColor: string;
  getSeverityBadge: (severity: AlertSeverity) => React.ReactNode;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className={`${bgColor} border-2 ${borderColor} rounded-2xl p-6 flex items-start justify-between hover:shadow-md transition`}
    >
      <div className="flex items-start gap-4 flex-1">
        <div className="shrink-0">{icon}</div>

        <div className="flex-1">
          <div className="flex items-start justify-between gap-4">
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
            {getSeverityBadge(severity)}
          </div>
          <p className="text-sm text-gray-600 mt-1">{time}</p>
        </div>
      </div>
    </motion.div>
  );
}

/* ================= STAT CARD COMPONENT ================= */
function StatCard({
  label,
  count,
  icon,
  bgColor,
  textColor,
  borderColor,
}: {
  label: string;
  count: number;
  icon: React.ReactNode;
  bgColor: string;
  textColor: string;
  borderColor: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      className={`${bgColor} border-2 ${borderColor} rounded-2xl p-6 text-center hover:shadow-md transition`}
    >
      <div className={`${textColor} flex justify-center mb-4`}>
        {icon}
      </div>
      <p className="text-sm text-gray-600 mb-2">{label}</p>
      <motion.p 
        key={count}
        initial={{ scale: 1.2, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`text-6xl font-bold ${textColor}`}
      >
        {count}
      </motion.p>
    </motion.div>
  );
}