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
  { time: "10:00", PF: 0.55 },
  { time: "11:00", PF: 0.56 },
  { time: "12:00", PF: 0.54 },
  { time: "13:00", PF: 0.53 },
];

export default function PowerFactorChart() {
  return (
    <div className="h-[260px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis dataKey="time" stroke="#a1a1aa" />
          <YAxis domain={[0, 1]} stroke="#a1a1aa" />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="PF"
            stroke="#ef4444"
            fill="#7f1d1d"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
