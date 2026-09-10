"use client";

import React from "react";
import { User, Activity, AlertCircle, Pill, Heart, Thermometer, Wind } from "lucide-react";
import type { PatientInfo } from "@/data/mockData";

interface PatientContextCardProps {
  patient: PatientInfo;
}

export function PatientContextCard({ patient }: PatientContextCardProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 space-y-3">
      {/* Patient Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-950 border border-sky-800/60 text-sky-400">
            <User className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-100">{patient.name}</span>
              <span className="text-[11px] text-slate-400">
                {patient.age}y • {patient.gender}
              </span>
            </div>
            <span className="font-mono text-[10px] text-slate-500">{patient.mrn}</span>
          </div>
        </div>

        {/* Allergy Flag */}
        {patient.allergies && patient.allergies.length > 0 && (
          <div className="flex items-center gap-1.5 rounded-md bg-amber-500/10 border border-amber-500/30 px-2 py-1 text-[11px] text-amber-400">
            <AlertCircle className="h-3 w-3" />
            <span className="font-medium">{patient.allergies.join(", ")}</span>
          </div>
        )}
      </div>

      {/* Vitals Grid */}
      {patient.vitals && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="flex items-center gap-2 rounded-lg bg-slate-950/60 border border-slate-800/60 px-2.5 py-1.5">
            <Heart className="h-3.5 w-3.5 text-rose-400 shrink-0" />
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 uppercase">BP</span>
              <span className="font-mono text-xs font-semibold text-slate-200">{patient.vitals.bp}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-lg bg-slate-950/60 border border-slate-800/60 px-2.5 py-1.5">
            <Activity className="h-3.5 w-3.5 text-sky-400 shrink-0" />
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 uppercase">HR</span>
              <span className="font-mono text-xs font-semibold text-slate-200">{patient.vitals.hr} bpm</span>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-lg bg-slate-950/60 border border-slate-800/60 px-2.5 py-1.5">
            <Wind className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 uppercase">SpO2</span>
              <span className="font-mono text-xs font-semibold text-slate-200">{patient.vitals.spo2}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-lg bg-slate-950/60 border border-slate-800/60 px-2.5 py-1.5">
            <Thermometer className="h-3.5 w-3.5 text-amber-400 shrink-0" />
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 uppercase">Temp</span>
              <span className="font-mono text-xs font-semibold text-slate-200">{patient.vitals.temp}</span>
            </div>
          </div>
        </div>
      )}

      {/* Active Medications */}
      {patient.activeMeds && patient.activeMeds.length > 0 && (
        <div className="flex items-center gap-2 pt-0.5">
          <Pill className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <span className="text-[11px] text-slate-400 uppercase shrink-0 font-medium">Active Meds:</span>
          <div className="flex flex-wrap gap-1.5 overflow-hidden">
            {patient.activeMeds.map((med, idx) => (
              <span
                key={idx}
                className="inline-flex items-center rounded bg-slate-800/80 px-2 py-0.5 text-[11px] font-mono text-slate-300 border border-slate-700/60"
              >
                {med}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
