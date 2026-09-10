"use client";

import React from "react";
import { Sparkles, AlertTriangle, FileText, CheckCircle2 } from "lucide-react";

interface ScenarioPillsProps {
  activeScenarioId: string;
  onSelectScenario: (scenarioId: "consult" | "conflict" | "discharge") => void;
  isRunning: boolean;
}

const PRESETS = [
  {
    id: "consult" as const,
    label: "Scenario A: ER Triage & Vitals",
    badge: "Acute Triage",
    icon: Sparkles,
    accent: "hover:border-sky-500/50 hover:bg-sky-500/10",
    activeClass: "border-sky-500 bg-sky-500/20 text-sky-200 shadow-sm shadow-sky-900/40",
  },
  {
    id: "conflict" as const,
    label: "Scenario B: Drug Conflict",
    badge: "Warfarin + NSAID",
    icon: AlertTriangle,
    accent: "hover:border-rose-500/50 hover:bg-rose-500/10",
    activeClass: "border-rose-500 bg-rose-500/20 text-rose-200 shadow-sm shadow-rose-900/40",
  },
  {
    id: "discharge" as const,
    label: "Scenario C: Discharge Summary",
    badge: "COPD Taper",
    icon: FileText,
    accent: "hover:border-emerald-500/50 hover:bg-emerald-500/10",
    activeClass: "border-emerald-500 bg-emerald-500/20 text-emerald-200 shadow-sm shadow-emerald-900/40",
  },
];

export function ScenarioPills({ activeScenarioId, onSelectScenario, isRunning }: ScenarioPillsProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          1-Click Preset Scenarios (90s Demo Ready)
        </span>
        <span className="text-[11px] text-slate-500 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          Zero-Typing Walkthrough
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((preset) => {
          const Icon = preset.icon;
          const isActive = activeScenarioId === preset.id;
          return (
            <button
              key={preset.id}
              disabled={isRunning}
              onClick={() => onSelectScenario(preset.id)}
              className={`group relative flex items-center gap-2 px-3.5 py-2 rounded-lg border text-xs font-medium transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                isActive
                  ? preset.activeClass
                  : `border-slate-800 bg-slate-900/80 text-slate-300 ${preset.accent}`
              }`}
            >
              <Icon className={`w-3.5 h-3.5 transition-transform duration-200 group-hover:scale-110 ${
                isActive ? "text-white" : "text-slate-400"
              }`} />
              <span>{preset.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                  isActive
                    ? "bg-black/30 text-slate-200"
                    : "bg-slate-800/80 text-slate-400 group-hover:text-slate-300"
                }`}
              >
                {preset.badge}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
