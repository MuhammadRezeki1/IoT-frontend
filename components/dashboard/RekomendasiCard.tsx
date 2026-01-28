"use client";

import { ReactNode } from "react";

type Props = {
  title: string;
  value: number;
  unit: string;
  badge: string;
  color: string;
  rule: string;
  insight: string;
  children: ReactNode;
};

export default function RekomendasiCard({
  title,
  value,
  unit,
  badge,
  color,
  rule,
  insight,
  children,
}: Props) {
  return (
    <div className="metric-card soft-glow rounded-2xl p-6 bg-black/30 backdrop-blur">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-4xl font-bold mt-2">
            {value}
            <span className="text-base opacity-70 ml-1">{unit}</span>
          </p>
        </div>

        <span
          className="px-3 py-1 rounded-full text-sm font-semibold"
          style={{ backgroundColor: color }}
        >
          {badge}
        </span>
      </div>

      <div className="mt-4">{children}</div>

      <div className="mt-4 text-sm opacity-80">
        <p><b>Rule:</b> {rule}</p>
        <p className="mt-1"><b>Insight:</b> {insight}</p>
      </div>
    </div>
  );
}
