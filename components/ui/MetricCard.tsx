"use client";

import { useState } from "react";
import clsx from "clsx";

export default function MetricCard({
  title,
  value,
  unit,
  status,
  statusColor,
  rule,
  insight,
  children,
}: {
  title: string;
  value: number | string;
  unit?: string;
  status: string;
  statusColor: string;
  rule: string;
  insight: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div
      onClick={() => setOpen(!open)}
      className={clsx(
        "metric-card soft-glow animate-fade-up",
        "cursor-pointer rounded-2xl",
        "bg-white/10 backdrop-blur-md",
        "p-5 xl:p-6",
        "transition-all duration-500 ease-out",
        "hover:bg-white/15"
      )}
    >
      {/* HEADER */}
      <div className="flex items-start justify-between">
        <h3 className="text-sm text-slate-300 tracking-wide">
          {title}
        </h3>

        <span
          className={clsx(
            "px-3 py-1 rounded-lg text-xs font-semibold text-white",
            statusColor
          )}
        >
          {status}
        </span>
      </div>

      {/* VALUE */}
      <div className="mt-3 flex items-baseline gap-1">
        <span className="text-3xl font-bold tracking-tight">
          {value}
        </span>
        {unit && (
          <span className="text-sm text-slate-400">
            {unit}
          </span>
        )}
      </div>

      {/* CHART */}
      <div className="mt-4 chart-smooth">
        {children}
      </div>

      {/* DETAIL (EXPAND) */}
      <div
        className={clsx(
          "grid transition-all duration-500 ease-out",
          open
            ? "grid-rows-[1fr] opacity-100 mt-4"
            : "grid-rows-[0fr] opacity-0 mt-0"
        )}
      >
        <div className="overflow-hidden text-xs text-slate-300 space-y-2">
          <p>
            <span className="font-semibold text-slate-200">
              Rule-Based:
            </span>{" "}
            {rule}
          </p>
          <p>
            <span className="font-semibold text-slate-200">
              Insight:
            </span>{" "}
            {insight}
          </p>
        </div>
      </div>
    </div>
  );
}
