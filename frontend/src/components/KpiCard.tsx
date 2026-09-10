import React from "react";

interface KpiCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral" | "critical";
  subtext?: string;
  icon: React.ReactNode;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  change,
  changeType = "positive",
  subtext,
  icon,
}) => {
  const getChangeBadgeStyle = () => {
    switch (changeType) {
      case "positive":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "negative":
        return "bg-slate-100 text-slate-700 border-slate-200";
      case "critical":
        return "bg-red-50 text-red-700 border-red-200 font-bold animate-pulse";
      default:
        return "bg-amber-50 text-amber-700 border-amber-200";
    }
  };

  return (
    <div className="labflow-card labflow-card-hover p-4 flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
          {title}
        </span>
        <div className="p-2 rounded-lg bg-slate-50 text-slate-600 border border-slate-100">
          {icon}
        </div>
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <span className="text-2xl font-bold text-slate-900 tracking-tight">
          {value}
        </span>
        {change && (
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs border ${getChangeBadgeStyle()}`}>
            {change}
          </span>
        )}
      </div>

      {subtext && (
        <p className="mt-1.5 text-xs text-slate-500 font-normal truncate">
          {subtext}
        </p>
      )}
    </div>
  );
};
