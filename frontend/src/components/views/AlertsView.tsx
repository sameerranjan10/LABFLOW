import React, { useState } from "react";
import { AlertItem } from "@/data/labflowData";
import { StatusBadge } from "@/components/StatusBadge";
import { Bell, AlertOctagon, Clock, XCircle, FileCheck2, Info, ArrowUpRight, CheckCircle2 } from "lucide-react";

interface AlertsViewProps {
  alerts: AlertItem[];
  onDismissAlert: (id: string) => void;
  onNavigateToView: (view: any) => void;
}

export const AlertsView: React.FC<AlertsViewProps> = ({
  alerts,
  onDismissAlert,
  onNavigateToView,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>("ALL");

  const categories = [
    { id: "ALL", label: "All Categories" },
    { id: "Critical", label: "Critical" },
    { id: "Delayed", label: "Delayed" },
    { id: "Rejected", label: "Rejected" },
    { id: "Pending Review", label: "Pending Review" },
    { id: "Information", label: "Information" },
  ];

  const filtered = alerts.filter((alt) => {
    if (activeCategory === "ALL") return true;
    return alt.category === activeCategory;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Critical":
        return <AlertOctagon className="w-5 h-5 text-red-600 shrink-0" />;
      case "Delayed":
        return <Clock className="w-5 h-5 text-amber-600 shrink-0" />;
      case "Rejected":
        return <XCircle className="w-5 h-5 text-red-500 shrink-0" />;
      case "Pending Review":
        return <FileCheck2 className="w-5 h-5 text-blue-600 shrink-0" />;
      default:
        return <Info className="w-5 h-5 text-slate-500 shrink-0" />;
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Exception & Alert Center
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational exceptions, SLA warnings, critical result panic alerts, and sample rejections.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="bg-red-50 text-red-700 font-bold px-3 py-1.5 rounded-lg border border-red-200">
            {alerts.length} Active Operational Alerts
          </span>
        </div>
      </div>

      {/* CATEGORY TABS */}
      <div className="labflow-card p-3">
        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => {
            const active = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  active
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ALERTS LIST */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="labflow-card p-8 text-center text-slate-500 text-xs">
            No alerts present in category "{activeCategory}".
          </div>
        ) : (
          filtered.map((alt) => (
            <div
              key={alt.id}
              className={`labflow-card p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-l-4 ${
                alt.category === "Critical"
                  ? "border-l-red-600 bg-red-50/20"
                  : alt.category === "Delayed"
                  ? "border-l-amber-500 bg-amber-50/20"
                  : alt.category === "Rejected"
                  ? "border-l-red-500 bg-red-50/10"
                  : alt.category === "Pending Review"
                  ? "border-l-blue-500 bg-blue-50/20"
                  : "border-l-slate-400 bg-slate-50/40"
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                {getCategoryIcon(alt.category)}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-slate-900">
                      {alt.title}
                    </h3>
                    <span className="font-mono text-[10px] text-slate-400">
                      {alt.entityId}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      {alt.timestamp}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    {alt.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                {alt.actionable && (
                  <button
                    onClick={() => {
                      if (alt.category === "Pending Review") onNavigateToView("results");
                      else if (alt.category === "Rejected") onNavigateToView("samples");
                      else onNavigateToView("orders");
                    }}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    Resolve Issue
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={() => onDismissAlert(alt.id)}
                  className="px-2.5 py-1.5 text-xs font-medium rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Acknowledge Alert"
                >
                  Dismiss
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
