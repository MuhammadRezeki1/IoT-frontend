"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const data = [
  { time: "10:00", E: 0.05 },
  { time: "11:00", E: 0.10 },
  { time: "12:00", E: 0.15 },
  { time: "13:00", E: 0.20 },
];

export default function EnergyChart() {
  return (
    <div className="h-[260px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis dataKey="time" stroke="#a1a1aa" />
          <YAxis stroke="#a1a1aa" />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="E"
            stroke="#facc15"
            fill="#713f12"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
