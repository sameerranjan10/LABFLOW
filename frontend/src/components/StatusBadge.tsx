import React from "react";
import { OrderPriority, LabStage } from "@/data/labflowData";

interface StatusBadgeProps {
  type: "priority" | "stage" | "status" | "severity" | "flag";
  value: string;
  size?: "sm" | "md";
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ type, value, size = "md" }) => {
  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-xs font-medium" : "px-2.5 py-1 text-xs font-semibold";

  if (type === "priority") {
    const priority = value as OrderPriority;
    if (priority === "STAT") {
      return (
        <span className={`inline-flex items-center gap-1 rounded-md bg-red-50 text-red-700 border border-red-200 ${sizeClasses}`}>
          <span className="h-1.5 w-1.5 rounded-full bg-red-600 animate-pulse"></span>
          STAT
        </span>
      );
    }
    if (priority === "Urgent") {
      return (
        <span className={`inline-flex items-center gap-1 rounded-md bg-amber-50 text-amber-700 border border-amber-200 ${sizeClasses}`}>
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
          Urgent
        </span>
      );
    }
    return (
      <span className={`inline-flex items-center gap-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200 ${sizeClasses}`}>
        Normal
      </span>
    );
  }

  if (type === "severity") {
    if (value === "Critical") {
      return (
        <span className={`inline-flex items-center gap-1 rounded-md bg-red-50 text-red-700 border border-red-200 ${sizeClasses}`}>
          Critical
        </span>
      );
    }
    return (
      <span className={`inline-flex items-center gap-1 rounded-md bg-amber-50 text-amber-700 border border-amber-200 ${sizeClasses}`}>
        Warning
      </span>
    );
  }

  if (type === "flag") {
    if (value === "Critical") {
      return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-red-600 text-white">CRITICAL</span>;
    }
    if (value === "High") {
      return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">HIGH ↑</span>;
    }
    if (value === "Low") {
      return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-300">LOW ↓</span>;
    }
    return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">Normal</span>;
  }

  if (type === "stage") {
    const stageMap: Record<string, { bg: string; text: string; border: string }> = {
      ORDERED: { bg: "bg-slate-100", text: "text-slate-700", border: "border-slate-300" },
      COLLECTED: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
      IN_TRANSIT: { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200" },
      RECEIVED: { bg: "bg-sky-50", text: "text-sky-700", border: "border-sky-200" },
      PROCESSING: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
      REVIEW: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
      RELEASED: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
    };
    const style = stageMap[value] || { bg: "bg-slate-100", text: "text-slate-700", border: "border-slate-200" };
    return (
      <span className={`inline-flex items-center rounded-md border ${style.bg} ${style.text} ${style.border} ${sizeClasses}`}>
        {value.replace("_", " ")}
      </span>
    );
  }

  // default status
  const statusStyles: Record<string, string> = {
    "In Progress": "bg-blue-50 text-blue-700 border-blue-200",
    "Processing": "bg-purple-50 text-purple-700 border-purple-200",
    "Pending Review": "bg-amber-50 text-amber-800 border-amber-200",
    "Completed": "bg-emerald-50 text-emerald-700 border-emerald-200",
    "Approved": "bg-emerald-50 text-emerald-700 border-emerald-200",
    "Released": "bg-emerald-50 text-emerald-700 border-emerald-200",
    "Action Required": "bg-red-50 text-red-700 border-red-200",
    "Rejected": "bg-red-50 text-red-700 border-red-200",
    "Active": "bg-emerald-50 text-emerald-700 border-emerald-200",
    "On Break": "bg-amber-50 text-amber-700 border-amber-200",
    "Offline": "bg-slate-100 text-slate-500 border-slate-200",
  };

  const styleClass = statusStyles[value] || "bg-slate-100 text-slate-700 border-slate-200";

  return (
    <span className={`inline-flex items-center rounded-md border ${styleClass} ${sizeClasses}`}>
      {value}
    </span>
  );
};
