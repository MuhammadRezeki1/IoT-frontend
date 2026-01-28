"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const dummy = [
  { t: "08", v: 20 },
  { t: "10", v: 40 },
  { t: "12", v: 55 },
  { t: "14", v: 70 },
  { t: "16", v: 60 },
];

export default function RekomendasiAreaChart({ color }: { color: string }) {
  return (
    <div className="h-[180px] chart-smooth">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={dummy}>
          <XAxis dataKey="t" stroke="#a1a1aa" />
          <YAxis stroke="#a1a1aa" />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="v"
            stroke={color}
            fill={color}
            fillOpacity={0.25}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
