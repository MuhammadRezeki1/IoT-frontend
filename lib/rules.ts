export type SensorType = "V" | "I" | "P" | "E" | "F" | "PF";

export function statusColor(value: number, type: SensorType) {
  switch (type) {
    case "V":
      if (value < 210) return "bg-red-500";
      if (value > 240) return "bg-amber-400";
      return "bg-emerald-500";

    case "I":
      if (value < 0.5) return "bg-emerald-500";
      if (value < 5) return "bg-amber-400";
      return "bg-red-500";

    case "PF":
      if (value >= 0.85) return "bg-emerald-500";
      if (value >= 0.7) return "bg-amber-400";
      return "bg-red-500";

    case "F":
      return value >= 49.5 && value <= 50.5
        ? "bg-emerald-500"
        : "bg-red-500";

    case "P":
      return "bg-blue-500";

    case "E":
      return "bg-violet-500";
  }
}

export function statusText(value: number, type: SensorType) {
  switch (type) {
    case "V":
      return value < 210
        ? "Under Voltage"
        : value > 240
        ? "Over Voltage"
        : "Normal";

    case "I":
      return value < 0.5
        ? "Beban Ringan"
        : value < 5
        ? "Beban Sedang"
        : "Beban Tinggi";

    case "PF":
      return value >= 0.85
        ? "Baik"
        : value >= 0.7
        ? "Cukup"
        : "Buruk";

    case "F":
      return value >= 49.5 && value <= 50.5
        ? "Normal"
        : "Tidak Stabil";

    case "P":
      return "Aktif";

    case "E":
      return "Kumulatif";
  }
}

export function sensorRule(type: SensorType) {
  switch (type) {
    case "V":
      return "Normal: 210–240 V | Under <210 | Over >240";
    case "I":
      return "Ringan <0.5 A | Sedang <5 A | Tinggi ≥5 A";
    case "P":
      return "|P_sensor − P_teori| ≤ 10%";
    case "E":
      return "Energi = Σ(P × waktu) / 1000";
    case "F":
      return "Normal: 49.5–50.5 Hz";
    case "PF":
      return "Baik ≥0.85 | Buruk <0.70";
  }
}

export function sensorInsight(type: SensorType) {
  switch (type) {
    case "V":
      return "Menunjukkan kualitas suplai PLN dan keamanan perangkat.";
    case "I":
      return "Mencerminkan besarnya beban listrik aktif.";
    case "P":
      return "Validasi hasil pengukuran sensor daya.";
    case "E":
      return "Dasar estimasi biaya dan efisiensi energi.";
    case "F":
      return "Indikator kestabilan sistem kelistrikan.";
    case "PF":
      return "PF rendah → pemborosan energi & beban induktif.";
  }
}
