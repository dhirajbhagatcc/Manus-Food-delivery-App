import React from "react";

export function Spinner({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`animate-spin ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      width="16"
      height="16"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );
}

function scoreColor(n: number): string {
  if (n >= 75) return "bg-emerald-100 text-emerald-700";
  if (n >= 50) return "bg-amber-100 text-amber-700";
  return "bg-slate-100 text-slate-600";
}

export function ScoreBadge({
  label,
  value,
}: {
  label: string;
  value: number | null;
}) {
  if (value === null || value === undefined) return null;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${scoreColor(
        value
      )}`}
      title={`${label}: ${value}/100`}
    >
      {label} {value}
    </span>
  );
}

export function Pill({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${className}`}
    >
      {children}
    </span>
  );
}
