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
  { time: "10:00", P: 48 },
  { time: "11:00", P: 52 },
  { time: "12:00", P: 50 },
  { time: "13:00", P: 55 },
];

export default function PowerChart() {
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
            dataKey="P"
            stroke="#a855f7"
            fill="#581c87"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
