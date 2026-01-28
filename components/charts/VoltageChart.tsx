"use client";

import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";

const data = [
  { time: "10:00", V: 229 },
  { time: "11:00", V: 231 },
  { time: "12:00", V: 228 },
];

export default function VoltageChart() {
  return (
    <div className="h-[260px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <XAxis dataKey="time" stroke="#a1a1aa" />
          <YAxis stroke="#a1a1aa" />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="V"
            stroke="#3b82f6"
            fill="#1e3a8a"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
