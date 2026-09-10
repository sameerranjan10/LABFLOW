"use client";

import React from "react";
import { AlertOctagon, ShieldAlert, ArrowRight, Zap } from "lucide-react";
import type { DrugConflictData } from "@/data/mockData";

interface ClinicalAlertsProps {
  conflict: DrugConflictData;
}

export function ClinicalAlerts({ conflict }: ClinicalAlertsProps) {
  if (!conflict.detected) return null;

  return (
    <div className="rounded-xl border border-rose-600/50 bg-rose-950/30 p-4 space-y-3.5 shadow-lg shadow-rose-950/20">
      {/* Alert Header */}
      <div className="flex items-start justify-between gap-2 border-b border-rose-900/50 pb-2.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-600/20 border border-rose-500/40 text-rose-400">
            <AlertOctagon className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-300">
                CRITICAL CONTRAINDICATION DETECTED
              </span>
              <span className="rounded bg-rose-500/30 border border-rose-500/50 px-1.5 py-0.5 font-mono text-[10px] font-bold text-rose-200">
                {conflict.severity}
              </span>
            </div>
            <p className="text-xs text-rose-200/90 font-medium">
              {conflict.drugA.name} ({conflict.drugA.class}) ⟷ {conflict.drugB.name} ({conflict.drugB.class})
            </p>
          </div>
        </div>

        {/* Risk Score Pill */}
        <div className="flex flex-col items-end">
          <span className="text-[10px] uppercase font-semibold text-rose-400">Toxicity Risk</span>
          <div className="flex items-center gap-1 rounded-md bg-rose-600/30 border border-rose-500/60 px-2 py-0.5 text-xs font-mono font-bold text-rose-100">
            <Zap className="h-3 w-3 text-rose-400 fill-rose-400" />
            <span>{conflict.riskScore}%</span>
          </div>
        </div>
      </div>

      {/* Mechanism */}
      <div className="space-y-1">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-rose-300 uppercase tracking-wide">
          <ShieldAlert className="h-3.5 w-3.5" />
          Pharmacodynamic / Pharmacokinetic Mechanism
        </div>
        <p className="text-xs text-slate-300 leading-relaxed rounded-lg bg-slate-950/60 border border-rose-900/30 p-2.5">
          {conflict.mechanism}
        </p>
      </div>

      {/* Mandatory Counter-Actions */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-semibold text-rose-300 uppercase tracking-wide">
          Adversarial Safety Auditor — Required Counter-Actions:
        </span>
        <ul className="space-y-1.5">
          {conflict.counterActions.map((action, idx) => (
            <li
              key={idx}
              className="flex items-start gap-2 text-xs text-slate-200 bg-rose-950/20 rounded-md p-2 border border-rose-900/20"
            >
              <ArrowRight className="h-3.5 w-3.5 text-rose-400 shrink-0 mt-0.5" />
              <span>{action}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
