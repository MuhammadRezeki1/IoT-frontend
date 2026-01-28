export type RekomendasiItem = {
    type: string;
    label: string;
    value: number;
    unit: string;
    color: string;
    text: string;
    rule: string;
    insight: string;
  };
  
  export function getRekomendasi(P: number, E: number, V: number): RekomendasiItem[] {
    return [
      {
        type: "efisiensi",
        label: "Efisiensi Energi",
        value: Math.round((P / 5000) * 100),
        unit: "%",
        color: P / 5000 > 0.6 ? "#10b981" : "#fbbf24",
        text: "Optimal",
        rule: ">60%: Optimal, ≤60%: Kurang Optimal",
        insight: "Efisiensi penggunaan energi dibanding kapasitas maksimal.",
      },
      {
        type: "konsumsi",
        label: "Konsumsi Harian",
        value: Number(E.toFixed(2)),
        unit: "kWh",
        color: "#3b82f6",
        text: "Aktual",
        rule: "Perbandingan konsumsi harian dengan rata-rata historis",
        insight: "Dasar analisis biaya dan evaluasi efisiensi harian.",
      },
      {
        type: "beban",
        label: "Prediksi Beban Puncak",
        value: P,
        unit: "W",
        color: P > 4000 ? "#ef4444" : "#10b981",
        text: P > 4000 ? "⚠ Tinggi" : "Normal",
        rule: "<4000 W: Normal, ≥4000 W: Tinggi",
        insight: "Prediksi beban puncak untuk mengantisipasi overload.",
      },
      {
        type: "kualitasV",
        label: "Kualitas Tegangan",
        value: V,
        unit: "V",
        color: V < 210 || V > 240 ? "#ef4444" : "#10b981",
        text: V < 210 || V > 240 ? "Abnormal" : "Normal",
        rule: "210–240 V: Normal, <210 V: Under Voltage, >240 V: Over Voltage",
        insight: "Evaluasi kualitas suplai listrik untuk keamanan alat.",
      },
    ];
  }
  