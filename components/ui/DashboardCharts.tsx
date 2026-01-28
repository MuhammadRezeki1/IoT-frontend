"use client";

import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ChartCardProps {
  title?: string; // optional sekarang aman
  value: number | string;
  unit?: string;
  status?: string;
  statusColor?: string;
  data: { name: string; value: number }[];
  rule?: string;
  insight?: string;
}

export default function ChartCard({
  title = "Chart", // default value agar tidak undefined
  value,
  unit,
  status,
  statusColor = "bg-blue-500",
  data,
  rule,
  insight,
}: ChartCardProps) {
  const [expanded, setExpanded] = useState(false);

  // Gradient ID aman walaupun title undefined
  const gradientId = (title ?? "chart").replace(/\s+/g, "-") + "-gradient";

  return (
    <div
      className="metric-card soft-glow rounded-2xl p-6 bg-white/5 cursor-pointer overflow-hidden transition-all duration-500 hover:scale-[1.015] hover:shadow-xl"
      onClick={() => setExpanded(!expanded)}
    >
      {/* HEADER */}
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-slate-400">{title}</p>
          <p className="text-2xl md:text-3xl font-bold mt-1">
            {value}
            {unit && <span className="text-base opacity-70 ml-1">{unit}</span>}
          </p>
        </div>
        {status && (
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold text-white transition-all duration-300`}
            style={{ backgroundColor: statusColor }}
          >
            {status}
          </span>
        )}
      </div>

      {/* CHART */}
      <div className="mt-6 w-full h-[200px] md:h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.6} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis dataKey="name" tick={{ fill: "#cbd5e1" }} />
            <YAxis tick={{ fill: "#cbd5e1" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#111827",
                border: "none",
                borderRadius: "8px",
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#22d3ee"
              strokeWidth={2}
              fillOpacity={1}
              fill={`url(#${gradientId})`}
              activeDot={{ r: 6, fill: "#8b5cf6" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Expandable Rule & Insight */}
      {rule && insight && (
        <div
          className={`transition-all duration-500 ease-in-out ${
            expanded ? "max-h-72 opacity-100 mt-4" : "max-h-0 opacity-0 mt-0"
          }`}
        >
          <div className="p-3 text-sm text-slate-300 bg-white/10 rounded-lg mt-3">
            <p>
              <b>Rule:</b> {rule}
            </p>
            <p className="mt-1">
              <b>Insight:</b> {insight}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
