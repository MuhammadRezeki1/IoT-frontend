"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle, 
  Info,
  Mail,
} from "lucide-react";

/* ================= TYPES ================= */
type RawPowerData = {
  id: number;
  tegangan?: number;
  tegangan_v?: number;
  arus?: number;
  arus_a?: number;
  daya_watt?: number;
  energi_kwh?: number;
  frekuensi?: number;
  pf?: number;
  faktor_daya?: number;
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
  const [error, setError] = useState<string | null>(null);
  const [apiEndpoint, setApiEndpoint] = useState<string>('');

  /* ===== FETCH DATA FROM DATABASE ===== */
  useEffect(() => {
    const fetchData = async () => {
      // Try multiple endpoint possibilities
      const endpoints = [
        'http://localhost:3001/power',
        'http://localhost:3001/power/all',
        'http://localhost:3001/api/power',
      ];

      let success = false;
      let lastError = '';

      for (const endpoint of endpoints) {
        try {
          console.log(`🔍 Trying endpoint: ${endpoint}`);
          const res = await fetch(endpoint);
          
          if (res.ok) {
            const json = await res.json();
            console.log('✅ Data received from:', endpoint);
            console.log('📊 Raw response:', json);

            // Handle different response formats
            let powerData: RawPowerData[] = [];
            
            if (Array.isArray(json)) {
              powerData = json;
            } else if (json && typeof json === 'object') {
              if (Array.isArray(json.data)) {
                powerData = json.data;
              } else if (Array.isArray(json.results)) {
                powerData = json.results;
              } else {
                console.warn('⚠️ Unknown response format:', json);
                continue;
              }
            }

            if (powerData.length === 0) {
              console.warn('⚠️ Empty data from:', endpoint);
              continue;
            }

            console.log(`✅ Processed ${powerData.length} power records`);
            
            setData(powerData);
            setApiEndpoint(endpoint);
            
            // Analyze data and generate alerts
            const generatedAlerts = analyzeDataForAlerts(powerData);
            setAlerts(generatedAlerts);
            
            // Calculate statistics
            const stats = calculateStatistics(generatedAlerts);
            setStatistics(stats);
            
            setLoading(false);
            setError(null);
            success = true;
            break; // Success, exit loop
          } else {
            console.warn(`❌ ${endpoint} returned ${res.status}`);
            lastError = `HTTP ${res.status} from ${endpoint}`;
          }
        } catch (e) {
          console.error(`❌ Error fetching from ${endpoint}:`, e);
          lastError = e instanceof Error ? e.message : 'Network error';
        }
      }

      if (!success) {
        setError(`Failed to fetch data from all endpoints. Last error: ${lastError}`);
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
    if (!Array.isArray(data)) {
      console.error('❌ analyzeDataForAlerts received non-array:', data);
      return [];
    }

    if (data.length === 0) {
      console.log('⚠️ No data to analyze');
      return [];
    }

    const alerts: Alert[] = [];
    let alertId = 1;

    console.log(`🔍 Analyzing ${data.length} records for alerts...`);

    // Sort data by date (newest first)
    const sortedData = [...data].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    // Only analyze last 50 records
    const recentData = sortedData.slice(0, 50);

    recentData.forEach((item) => {
      const timeAgo = getTimeAgo(item.created_at);
      
      // Normalize field names (handle both formats)
      const voltage = item.tegangan ?? item.tegangan_v ?? 220;
      const current = item.arus ?? item.arus_a ?? 0;
      const power = item.daya_watt ?? 0;
      const energy = item.energi_kwh ?? 0;
      const frequency = item.frekuensi ?? 50;
      const pf = item.pf ?? item.faktor_daya ?? 0.95;

      // Check for Overvoltage (> 240V)
      if (voltage > 240) {
        alerts.push({
          id: `alert-${alertId++}`,
          icon: "critical",
          title: `Overvoltage detected: ${voltage.toFixed(1)}V at ${new Date(item.created_at).toLocaleTimeString('id-ID')}`,
          time: timeAgo,
          severity: "High",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          iconColor: "text-red-600",
          category: "voltage",
        });
      }
      
      // Check for Undervoltage (< 200V)
      else if (voltage < 200 && voltage > 0) {
        alerts.push({
          id: `alert-${alertId++}`,
          icon: "warning",
          title: `Undervoltage warning: ${voltage.toFixed(1)}V at ${new Date(item.created_at).toLocaleTimeString('id-ID')}`,
          time: timeAgo,
          severity: "High",
          bgColor: "bg-yellow-50",
          borderColor: "border-yellow-200",
          iconColor: "text-yellow-600",
          category: "voltage",
        });
      }

      // Check for Overcurrent (> 5A)
      if (current > 5) {
        alerts.push({
          id: `alert-${alertId++}`,
          icon: "critical",
          title: `Overcurrent detected: ${current.toFixed(2)}A at ${new Date(item.created_at).toLocaleTimeString('id-ID')}`,
          time: timeAgo,
          severity: "High",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          iconColor: "text-red-600",
          category: "current",
        });
      }

      // Check for Low Power Factor (< 0.85)
      if (pf < 0.85 && pf > 0) {
        alerts.push({
          id: `alert-${alertId++}`,
          icon: "warning",
          title: `Power factor dropped to ${pf.toFixed(2)} at ${new Date(item.created_at).toLocaleTimeString('id-ID')}`,
          time: timeAgo,
          severity: "Medium",
          bgColor: "bg-yellow-50",
          borderColor: "border-yellow-200",
          iconColor: "text-yellow-600",
          category: "power_factor",
        });
      }

      // Check for Frequency deviation
      if ((frequency < 49.5 || frequency > 50.5) && frequency > 0) {
        alerts.push({
          id: `alert-${alertId++}`,
          icon: "warning",
          title: `Frequency deviation: ${frequency.toFixed(2)}Hz at ${new Date(item.created_at).toLocaleTimeString('id-ID')}`,
          time: timeAgo,
          severity: "Medium",
          bgColor: "bg-yellow-50",
          borderColor: "border-yellow-200",
          iconColor: "text-yellow-600",
          category: "frequency",
        });
      }

      // Check for High Power Consumption (> 600W)
      if (power > 600) {
        alerts.push({
          id: `alert-${alertId++}`,
          icon: "info",
          title: `High power consumption: ${power.toFixed(0)}W at ${new Date(item.created_at).toLocaleTimeString('id-ID')}`,
          time: timeAgo,
          severity: "Low",
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200",
          iconColor: "text-blue-600",
          category: "power",
        });
      }
    });

    // Add success alert for normal operation
    const recentNormalData = sortedData.filter(item => {
      const voltage = item.tegangan ?? item.tegangan_v ?? 220;
      const current = item.arus ?? item.arus_a ?? 0;
      const pf = item.pf ?? item.faktor_daya ?? 0.95;
      const frequency = item.frekuensi ?? 50;
      
      return voltage >= 200 && voltage <= 240 &&
             current < 5 &&
             pf >= 0.85 &&
             frequency >= 49.5 && frequency <= 50.5;
    });

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

    // Add info alert
    if (sortedData.length > 0) {
      const latestData = sortedData[0];
      const energy = latestData.energi_kwh ?? 0;
      const power = latestData.daya_watt ?? 0;
      
      alerts.push({
        id: `alert-${alertId++}`,
        icon: "info",
        title: `Latest reading - Energy: ${energy.toFixed(3)} kWh, Power: ${power.toFixed(0)}W`,
        time: getTimeAgo(latestData.created_at),
        severity: "Low",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
        iconColor: "text-blue-600",
        category: "report",
      });
    }

    const sortedAlerts = alerts.sort((a, b) => {
      const severityOrder = { High: 0, Medium: 1, Low: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });

    console.log(`✅ Generated ${sortedAlerts.length} alerts`);
    return sortedAlerts;
  };

  const calculateStatistics = (alerts: Alert[]): AlertStatistics => {
    return {
      critical: alerts.filter(a => a.icon === "critical").length,
      warning: alerts.filter(a => a.icon === "warning").length,
      info: alerts.filter(a => a.icon === "info").length,
      resolved: alerts.filter(a => a.icon === "success").length,
    };
  };

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

  const handleEmailToggle = () => {
    setEmailNotifications(!emailNotifications);
  };

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
          <p className="text-gray-600">Connecting to backend...</p>
          <p className="text-xs text-gray-500 mt-2">Trying multiple endpoints...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center bg-white p-8 rounded-2xl shadow-sm max-w-2xl">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Cannot Connect to Backend</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-4 text-left">
            <p className="text-sm font-semibold text-gray-700 mb-2">Troubleshooting:</p>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>1. Check if backend is running: <code className="bg-gray-200 px-1">npm run start:dev</code></li>
              <li>2. Verify backend port is 3001</li>
              <li>3. Test endpoint: <code className="bg-gray-200 px-1">curl http://localhost:3001/power</code></li>
              <li>4. Check CORS is enabled in backend</li>
              <li>5. Check browser console (F12) for errors</li>
            </ul>
          </div>
          
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold text-gray-900">
          Alerts & Notifications
        </h1>
        <p className="text-gray-600 mt-2">Safety monitoring and alerts</p>
        <p className="text-sm text-gray-500 mt-1">
          Analyzing {data.length} data records • {alerts.length} alerts detected
        </p>
        {apiEndpoint && (
          <p className="text-xs text-blue-600 mt-1">
            Connected to: {apiEndpoint}
          </p>
        )}
      </motion.div>

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
          >
            <motion.span
              animate={{ x: emailNotifications ? 32 : 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full"
            />
          </button>
        </div>
      </motion.div>

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
            {data.length} power records analyzed • {alerts.length} alerts generated • Auto-refresh: 30s • Updated: {new Date().toLocaleString('id-ID')}
          </p>
        </div>
      </motion.div>
    </div>
  );
}

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