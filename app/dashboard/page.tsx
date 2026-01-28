"use client";

import { useState } from "react";
import ChartCard from "@/components/ui/DashboardCharts";

/* ================= TYPES ================= */
type SensorData = {
  type: string;
  label: string;
  value: number;
  unit: string;
  color: string;
  text: string;
  rule: string;
  insight: string;
};

type RekomendasiItem = SensorData;

/* ================= JAM ================= */
const jamLabels = ["09:00", "10:00", "11:00", "12:00", "13:00"];

/* ================= GENERATOR ================= */
function generateSensorData(base: number, varian: number) {
  return jamLabels.map((j) => ({
    name: j,
    value: Number(
      (base + (Math.random() * varian * 2 - varian)).toFixed(2)
    ),
  }));
}

/* ================= SENSOR (6) ================= */
const sensors: SensorData[] = [
  {
    type: "V",
    label: "Tegangan",
    value: 230,
    unit: "V",
    color: "#10b981",
    text: "Normal",
    rule: "210–240 V",
    insight: "Stabilitas tegangan suplai.",
  },
  {
    type: "I",
    label: "Arus",
    value: 2.5,
    unit: "A",
    color: "#fbbf24",
    text: "Beban Sedang",
    rule: "< 5 A",
    insight: "Beban arus aktif.",
  },
  {
    type: "P",
    label: "Daya",
    value: 500,
    unit: "W",
    color: "#3b82f6",
    text: "Aktif",
    rule: "< 4000 W",
    insight: "Daya terpakai.",
  },
  {
    type: "E",
    label: "Energi",
    value: 1.2,
    unit: "kWh",
    color: "#8b5cf6",
    text: "Kumulatif",
    rule: "Akumulatif",
    insight: "Energi total.",
  },
  {
    type: "F",
    label: "Frekuensi",
    value: 50,
    unit: "Hz",
    color: "#10b981",
    text: "Normal",
    rule: "49.5–50.5 Hz",
    insight: "Stabilitas sistem.",
  },
  {
    type: "PF",
    label: "Power Factor",
    value: 0.95,
    unit: "",
    color: "#10b981",
    text: "Baik",
    rule: "≥ 0.85",
    insight: "Efisiensi beban.",
  },
];

/* ================= RELAY ================= */
const relayDefault = true;

/* ================= REKOMENDASI (3 – KUALITAS TEGANGAN DIHAPUS) ================= */
function getRekomendasi(P: number, E: number): RekomendasiItem[] {
  return [
    {
      type: "efisiensi",
      label: "Efisiensi Energi",
      value: Math.round((P / 5000) * 100),
      unit: "%",
      color: P / 5000 > 0.6 ? "#10b981" : "#fbbf24",
      text: "Optimal",
      rule: ">60%",
      insight: "Efisiensi daya.",
    },
    {
      type: "konsumsi",
      label: "Konsumsi Harian",
      value: E,
      unit: "kWh",
      color: "#3b82f6",
      text: "Aktual",
      rule: "Monitoring harian",
      insight: "Estimasi biaya.",
    },
    {
      type: "beban",
      label: "Prediksi Beban",
      value: P,
      unit: "W",
      color: P > 4000 ? "#ef4444" : "#10b981",
      text: P > 4000 ? "Tinggi" : "Normal",
      rule: "< 4000 W",
      insight: "Antisipasi overload.",
    },
  ];
}

/* ================= KESIMPULAN ================= */
function generateKesimpulan(s: SensorData[], relayOn: boolean) {
  const V = s.find((x) => x.type === "V")!.value;
  const I = s.find((x) => x.type === "I")!.value;
  const P = s.find((x) => x.type === "P")!.value;
  const PF = s.find((x) => x.type === "PF")!.value;

  const masalah: string[] = [];
  if (V < 210 || V > 240) masalah.push("tegangan tidak stabil");
  if (I > 5) masalah.push("arus tinggi");
  if (P > 4000) masalah.push("beban berlebih");
  if (PF < 0.85) masalah.push("PF rendah");
  if (!relayOn) masalah.push("relay OFF");

  return masalah.length === 0
    ? {
        status: "SISTEM STABIL",
        color: "text-green-400",
        desc: "Semua parameter berada dalam batas aman dan sistem berjalan normal.",
      }
    : {
        status: "PERLU PERHATIAN",
        color: "text-yellow-400",
        desc: `Terdeteksi: ${masalah.join(", ")}`,
      };
}

/* ================= PAGE ================= */
export default function DashboardPage() {
  const [relayOn, setRelayOn] = useState(relayDefault);

  const rekomendasi = getRekomendasi(500, 1.2);
  const kesimpulan = generateKesimpulan(sensors, relayOn);

  return (
    <main className="dashboard-root">
      <div className="aurora-left" />
      <div className="aurora-right" />

      {/* NAVBAR */}
      <div className="center-container">
        <div className="dashboard-navbar">
          <h1 className="dashboard-title">⚡ Dashboard Energi IoT</h1>
          <p className="dashboard-subtitle">
            Monitoring & Analisis Realtime
          </p>
        </div>
      </div>

      {/* KESIMPULAN */}
      <div className="flex justify-center">
        <div className="kesimpulan-card">
          <div className="kesimpulan-aurora" />
          <div className="flex justify-between mb-2">
            <h2 className="font-bold">Kesimpulan Sistem</h2>
            <span className={`font-bold ${kesimpulan.color}`}>
              {kesimpulan.status}
            </span>
          </div>
          <p>{kesimpulan.desc}</p>
        </div>
      </div>

      {/* SENSOR + RELAY */}
      <div className="dashboard-charts grid grid-cols-1 xl:grid-cols-2 gap-8">
        {sensors.map((s) => (
          <ChartCard
            key={s.type}
            title={s.label}
            value={s.value}
            unit={s.unit}
            status={s.text}
            statusColor={s.color}
            data={generateSensorData(s.value, 0.4)}
            rule={s.rule}
            insight={s.insight}
          />
        ))}

        <ChartCard
          title="Status Relay"
          value={relayOn ? "ON" : "OFF"}
          status={relayOn ? "ON" : "OFF"}
          statusColor={relayOn ? "#10b981" : "#ef4444"}
          data={jamLabels.map((j) => ({
            name: j,
            value: relayOn ? 1 : 0,
          }))}
          rule="Manual Control"
          insight="Kontrol suplai listrik."
        />

        <div className="flex justify-center">
          <button className="button" onClick={() => setRelayOn(!relayOn)}>
            RELAY {relayOn ? "ON" : "OFF"}
          </button>
        </div>
      </div>

      {/* REKOMENDASI (3) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {rekomendasi.map((r) => (
          <ChartCard
            key={r.type}
            title={r.label}
            value={r.value}
            unit={r.unit}
            status={r.text}
            statusColor={r.color}
            data={generateSensorData(r.value, r.value * 0.05)}
            rule={r.rule}
            insight={r.insight}
          />
        ))}
      </div>
    </main>
  );
}
