"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const data = [
  { time: "10:00", R: 420, S: 380, T: 450 },
  { time: "11:00", R: 430, S: 390, T: 460 },
  { time: "12:00", R: 410, S: 370, T: 440 },
  { time: "13:00", R: 450, S: 400, T: 480 },
];

export default function PowerAreaChart() {
  return (
    <div className="w-full h-[350px]">
      {/* h-[350px] WAJIB */}
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip />

          <Area
            type="monotone"
            dataKey="R"
            stroke="#2563eb"
            fill="#93c5fd"
            name="Phase R"
          />
          <Area
            type="monotone"
            dataKey="S"
            stroke="#16a34a"
            fill="#86efac"
            name="Phase S"
          />
          <Area
            type="monotone"
            dataKey="T"
            stroke="#dc2626"
            fill="#fca5a5"
            name="Phase T"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
