import React from "react";
import { WorkflowStageMetric, LabStage } from "@/data/labflowData";
import { ArrowRight, AlertCircle } from "lucide-react";

interface WorkflowPipelineProps {
  stages: WorkflowStageMetric[];
  selectedStage?: LabStage | "ALL";
  onSelectStage?: (stage: LabStage | "ALL") => void;
}

export const WorkflowPipeline: React.FC<WorkflowPipelineProps> = ({
  stages,
  selectedStage = "ALL",
  onSelectStage,
}) => {
  return (
    <div className="labflow-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-wide uppercase">
            Laboratory Workflow Pipeline
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time tracking of specimen progression across 7 operational stages
          </p>
        </div>
        {selectedStage !== "ALL" && (
          <button
            onClick={() => onSelectStage && onSelectStage("ALL")}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium underline cursor-pointer"
          >
            Clear Stage Filter (Show All)
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
        {stages.map((st, idx) => {
          const isSelected = selectedStage === st.key;
          const isLast = idx === stages.length - 1;

          return (
            <div key={st.key} className="flex flex-col md:flex-row items-center gap-1">
              <button
                onClick={() => onSelectStage && onSelectStage(st.key)}
                className={`w-full p-3 rounded-lg border text-left transition-all cursor-pointer ${
                  isSelected
                    ? "border-indigo-600 bg-indigo-50/50 shadow-sm ring-1 ring-indigo-600"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 tracking-wider uppercase truncate">
                    {st.label}
                  </span>
                  {st.delayedCount && st.delayedCount > 0 ? (
                    <span className="flex items-center gap-0.5 text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                      <AlertCircle className="w-3 h-3 text-amber-600" />
                      {st.delayedCount}
                    </span>
                  ) : null}
                </div>

                <div className="mt-2 flex items-baseline justify-between">
                  <span className={`text-xl font-extrabold ${isSelected ? "text-indigo-700" : "text-slate-900"}`}>
                    {st.count}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">
                    avg {st.avgTime}
                  </span>
                </div>

                <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      st.key === "RELEASED"
                        ? "bg-emerald-500"
                        : st.key === "PROCESSING"
                        ? "bg-purple-500"
                        : st.key === "REVIEW"
                        ? "bg-amber-500"
                        : "bg-indigo-500"
                    }`}
                    style={{ width: `${Math.min(100, Math.max(15, (st.count / 100) * 100))}%` }}
                  ></div>
                </div>
              </button>

              {!isLast && (
                <div className="hidden md:flex items-center justify-center text-slate-300 px-0.5">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
