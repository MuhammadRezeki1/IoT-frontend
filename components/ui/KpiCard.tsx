import clsx from "clsx";

export default function KpiCard({
  label,
  value,
  status,
  color,
}: {
  label: string;
  value: string;
  status: string;
  color: string;
}) {
  return (
    <div
      className="
        metric-card
        animate-fade-up
        rounded-xl
        bg-white/5
        p-4
        soft-glow
        relative
        z-10
      "
    >
      <p className="text-sm text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-2xl font-bold tracking-tight">
        {value}
      </p>

      <span
        className={clsx(
          "inline-block mt-2 px-3 py-1 rounded-md text-xs font-semibold text-white",
          color
        )}
      >
        {status}
      </span>
    </div>
  );
}
