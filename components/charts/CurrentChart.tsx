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
  { time: "10:00", I: 0.38 },
  { time: "11:00", I: 0.42 },
  { time: "12:00", I: 0.40 },
  { time: "13:00", I: 0.45 },
];

export default function CurrentChart() {
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
            dataKey="I"
            stroke="#22c55e"
            fill="#14532d"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
