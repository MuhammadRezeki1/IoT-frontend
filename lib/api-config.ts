// app/lib/api-config.ts

/**
 * ✅ Centralized API Configuration
 * Sesuai dengan Power Controller di backend NestJS
 */

// ✅ FIX: TypeScript-safe environment variable access
const API_BASE_URL = 
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_BASE_URL) || 
  'http://localhost:3001';

/**
 * Get full API endpoint URL
 * @param endpoint - API endpoint path (contoh: '/power/last7')
 * @returns Full URL
 */
export function getApiUrl(endpoint: string): string {
  // Pastikan endpoint dimulai dengan '/'
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanEndpoint}`;
}

/**
 * Helper function untuk build URL dengan query parameters
 * @param endpoint - Base endpoint
 * @param params - Query parameters
 * @returns Full URL with query string
 * 
 * @example
 * buildUrl('/power/range', { start: '2024-01-01', end: '2024-01-31' })
 * // Returns: http://localhost:3001/power/range?start=2024-01-01&end=2024-01-31
 */
export function buildUrl(endpoint: string, params?: Record<string, string | number | boolean>): string {
  const baseUrl = getApiUrl(endpoint);
  
  if (!params || Object.keys(params).length === 0) {
    return baseUrl;
  }
  
  const queryString = Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&');
  
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}

/**
 * Type-safe API request helper with error handling
 * @param endpoint - API endpoint
 * @param options - Fetch options
 * @returns Promise with typed response
 */
export async function apiRequest<T = any>(
  endpoint: string,
  options?: RequestInit
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const url = getApiUrl(endpoint);
    console.log(`📡 API Request: ${options?.method || 'GET'} ${url}`);
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`✅ API Response:`, data);
    
    return { success: true, data };
  } catch (error) {
    console.error(`❌ API Error:`, error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Export base URL dan semua endpoints
 */
export const apiConfig = {
  baseUrl: API_BASE_URL,
  
  endpoints: {
    // ================= MQTT CONTROL ENDPOINTS =================
    control: '/power/control',                    // POST - Control relay (on/off)
    reboot: '/power/reboot',                      // POST - Reboot device
    status: '/power/status',                      // GET  - MQTT connection status
    
    // ================= ALERTS ENDPOINTS =================
    alerts: '/power/alerts',                      // GET  - Get all alerts
    alertsTest: '/power/alerts/test',            // GET  - Test alerts system
    alertsSummary: '/power/alerts/summary',       // GET  - Get alert summary
    
    // ================= REALTIME ENDPOINTS =================
    realtime: '/power/realtime',                  // GET  - Get realtime MQTT data
    last7Data: '/power/last7',                    // GET  - Get last 7 records
    latest: '/power/latest',                      // GET  - Get latest single record
    all: '/power/all',                            // GET  - Get all records
    save: '/power',                               // POST - Save new power data
    
    // ================= ALL DATA ENDPOINTS (NO TIME FILTER) =================
    allHourly: '/power/hourly/all',              // GET  - All hourly data
    allDaily: '/power/daily/all',                // GET  - All daily data
    allMonthly: '/power/monthly/all',            // GET  - All monthly data
    
    // ================= STATISTICS ENDPOINTS =================
    statistics: '/power/statistics',              // GET  - Get statistics (query: ?days=30)
    
    // ================= REPORTS ENDPOINTS ================= (✅ ADDED)
    reportsMonthly: '/power/reports/monthly',     // GET  - All monthly reports
    reportsCurrentMonth: '/power/reports/current-month', // GET - Current month report
    
    // ================= ANALYSIS ENDPOINTS =================
    peakUsage: '/power/analysis/peak-usage',     // GET  - Peak usage analysis
    loadPattern: '/power/analysis/load-pattern', // GET  - Load pattern analysis
    powerFactor: '/power/analysis/power-factor', // GET  - Power factor average
    
    // ================= UTILITY ENDPOINTS =================
    range: '/power/range',                        // GET  - Get data by date range (query: ?start=...&end=...)
    
    // ================= MQTT BUFFER MANAGEMENT ENDPOINTS =================
    mqttSaveNow: '/power/mqtt/save-now',         // POST - Save buffered data now
    mqttBuffer: '/power/mqtt/buffer',            // GET  - Get buffered data
    mqttBufferStats: '/power/mqtt/buffer/stats', // GET  - Get buffer statistics
    
    // ================= MANUAL AGGREGATION ENDPOINTS =================
    aggregateDaily: '/power/aggregate/daily',     // POST - Trigger daily aggregation (query: ?date=...)
    aggregateWeekly: '/power/aggregate/weekly',   // POST - Trigger weekly aggregation
    aggregateMonthly: '/power/aggregate/monthly', // POST - Trigger monthly aggregation
    aggregateAll: '/power/aggregate/all',         // POST - Trigger all aggregations
    
    // ================= HEALTH CHECK =================
    health: '/power/health',                      // GET  - Health check
  },
};

/**
 * Typed API response interfaces (sesuai dengan backend)
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  count?: number;
  message?: string;
  timestamp?: string;
  error?: string;
}

export interface PowerData {
  id: number;
  tegangan: number;
  arus: number;
  daya_watt: number;
  energi_kwh: number;
  pf: number;
  frekuensi?: number;
  created_at: string;
}

export interface HourlyData {
  time: string;
  hour: number;
  energy: number;
  voltage: number;
  current: number;
  power_factor: number;
  timestamp: Date;
}

export interface DailyData {
  time: string;
  day_name: string;
  energy: number;
  total_energy: number;
  avg_energy: number;
  max_energy: number;
  min_energy: number;
  date: Date;
}

export interface MonthlyData {
  time: string;
  month: number;
  year: number;
  energy: number;
  total_energy: number;
  avg_daily_energy: number;
  peak_date?: Date;
}

export interface Statistics {
  total_energy: number;
  avg_daily_usage: number;
  peak_usage: number;
  peak_hour: string;
  total_days: number;
}

export interface MonthlyReport {
  month: number;
  year: number;
  period: string;
  total_energy: number;
  avg_daily_energy: number;
  peak_date?: Date;
}

export interface PeakUsageData {
  time: string;
  usage: number;
  voltage: number;
  current: number;
  power_factor: number;
  timestamp: Date;
}

export interface LoadPatternData {
  day: string;
  morning: number;
  afternoon: number;
  evening: number;
  date: Date;
  total_energy: number;
}

export interface AlertData {
  id: string;
  type: 'warning' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: string;
  week?: number;
  year?: number;
  energy?: number;
}

export interface AlertSummary {
  total: number;
  warning: number;
  info: number;
  success: number;
}

export interface MqttStatus {
  mqtt_connected: boolean;
  status: 'online' | 'offline' | 'error';
  buffer_size: number;
  timestamp: string;
}

export interface HealthCheck {
  success: boolean;
  status: 'healthy' | 'unhealthy';
  mqtt: {
    connected: boolean;
    buffer_size: number;
    has_realtime_data: boolean;
  };
  database: {
    has_data: boolean;
    latest_timestamp: string | null;
  };
  timestamp: string;
}

export default apiConfig;