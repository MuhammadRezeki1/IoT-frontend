"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const data = [
  { time: "10:00", relay: 1 },
  { time: "11:00", relay: 1 },
  { time: "12:00", relay: 0 },
  { time: "13:00", relay: 1 },
];

export default function RelayStatusChart() {
  return (
    <div className="h-[260px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis dataKey="time" stroke="#a1a1aa" />
          <YAxis domain={[0, 1]} stroke="#a1a1aa" />
          <Tooltip />
          <Line
            type="stepAfter"
            dataKey="relay"
            stroke="#22c55e"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
