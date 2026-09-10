"use client";

import React, { useState } from "react";
import {
  Stethoscope,
  UserCheck,
  Tag,
  ShieldCheck,
  Languages,
  Pill,
  AlertTriangle,
  FileCheck,
  FileSignature,
  CheckCircle,
  Lock,
} from "lucide-react";
import type { ClinicalScenario } from "@/data/mockData";
import { ClinicalAlerts } from "./ClinicalAlerts";
import type { UserRole } from "@/lib/auth";

interface DualPersonaViewProps {
  scenario: ClinicalScenario;
  persona: "clinician" | "patient";
  onPersonaChange: (p: "clinician" | "patient") => void;
  currentRole: UserRole;
  isAttested: boolean;
  onAttest: () => void;
}

export function DualPersonaView({
  scenario,
  persona,
  onPersonaChange,
  currentRole,
  isAttested,
  onAttest,
}: DualPersonaViewProps) {
  const [selectedLang, setSelectedLang] = useState<"en" | "hi" | "te">("en");
  const clinician = scenario.clinicianOutput;
  const patient = scenario.patientOutput;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/80 overflow-hidden flex flex-col">
      {/* Persona Mode Switch Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/60 px-4 py-2.5">
        {/* Toggle Switch */}
        <div className="flex items-center rounded-lg bg-slate-900 border border-slate-800 p-0.5">
          <button
            onClick={() => onPersonaChange("clinician")}
            className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
              persona === "clinician"
                ? "bg-sky-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Stethoscope className="h-3.5 w-3.5" />
            <span>Clinician View</span>
            <span className="text-[10px] opacity-75 font-mono">SOAP</span>
          </button>

          <button
            onClick={() => onPersonaChange("patient")}
            className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
              persona === "patient"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <UserCheck className="h-3.5 w-3.5" />
            <span>Patient View</span>
            <span className="text-[10px] opacity-75 font-mono">5th Grade</span>
          </button>
        </div>

        {/* Persona Meta & Safety Indicator */}
        <div className="flex items-center gap-2">
          {persona === "patient" ? (
            <div className="flex items-center gap-1.5">
              <span className="rounded bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[11px] font-mono text-emerald-400">
                {patient.readingLevel}
              </span>
              {/* Language Switcher */}
              {patient.regionalTranslations && (
                <div className="flex items-center rounded-md bg-slate-900 border border-slate-800 p-0.5 text-[11px]">
                  <Languages className="h-3 w-3 text-slate-400 ml-1.5 mr-1" />
                  <button
                    onClick={() => setSelectedLang("en")}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                      selectedLang === "en" ? "bg-slate-700 text-white" : "text-slate-400"
                    }`}
                  >
                    EN
                  </button>
                  <button
                    onClick={() => setSelectedLang("hi")}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                      selectedLang === "hi" ? "bg-slate-700 text-white" : "text-slate-400"
                    }`}
                  >
                    हिन्दी
                  </button>
                  <button
                    onClick={() => setSelectedLang("te")}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                      selectedLang === "te" ? "bg-slate-700 text-white" : "text-slate-400"
                    }`}
                  >
                    తెలుగు
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              {isAttested ? (
                <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-300 bg-emerald-950/40 border border-emerald-700/60 px-2 py-0.5 rounded">
                  <CheckCircle className="h-3 w-3 text-emerald-400" />
                  Physician Attested
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[11px] font-mono text-amber-300 bg-amber-950/40 border border-amber-800/40 px-2 py-0.5 rounded">
                  <FileSignature className="h-3 w-3 text-amber-400" />
                  Pending MD Attestation
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-4 space-y-4 max-h-[600px] overflow-y-auto">
        {/* Clinician View Mode */}
        {persona === "clinician" && (
          <div className="space-y-4">
            {/* Patient Role Advisory if Patient opens Clinician view */}
            {currentRole === "patient" && (
              <div className="flex items-center gap-2 rounded-lg border border-amber-800/60 bg-amber-950/20 p-2.5 text-xs text-amber-300">
                <Lock className="h-4 w-4 shrink-0" />
                <span>
                  <strong>Patient Notice:</strong> You are viewing raw technical clinical documentation. For easy instructions, please switch to <strong>Patient View</strong>.
                </span>
              </div>
            )}

            {/* Drug Interaction Alert Box if detected */}
            {clinician.drugConflict && <ClinicalAlerts conflict={clinician.drugConflict} />}

            {/* SOAP Note Sections */}
            <div className="space-y-3 font-sans">
              {/* Subjective */}
              <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
                <span className="text-[11px] font-mono uppercase tracking-wider text-sky-400 font-semibold block mb-1">
                  [S] Subjective
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">{clinician.soap.subjective}</p>
              </div>

              {/* Objective */}
              <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
                <span className="text-[11px] font-mono uppercase tracking-wider text-sky-400 font-semibold block mb-1">
                  [O] Objective
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">{clinician.soap.objective}</p>
              </div>

              {/* Assessment */}
              <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
                <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-semibold block mb-1">
                  [A] Assessment & Clinical Impression
                </span>
                <div className="text-xs text-slate-200 whitespace-pre-line leading-relaxed font-medium">
                  {clinician.soap.assessment}
                </div>
              </div>

              {/* Plan */}
              <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
                <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-semibold block mb-1">
                  [P] Treatment & Safety Plan
                </span>
                <div className="text-xs text-slate-200 whitespace-pre-line leading-relaxed">
                  {clinician.soap.plan}
                </div>
              </div>
            </div>

            {/* Human-In-The-Loop Attestation Gate */}
            <div
              className={`rounded-xl border p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                isAttested
                  ? "border-emerald-700/60 bg-emerald-950/30 text-emerald-200"
                  : "border-amber-700/60 bg-amber-950/20 text-amber-200"
              }`}
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <FileSignature className="h-4 w-4" />
                  <span className="text-xs font-semibold uppercase tracking-wide">
                    {isAttested
                      ? "Attending Physician Attestation Complete"
                      : "Clinical Decision Support — Human Attestation Required"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">
                  {isAttested
                    ? "Electronically signed by Dr. Priya Sharma, MD (NMC #64920). Plan authorized for EHR dissemination."
                    : "Per Healthcare Safety Principles, AI recommendations require review and confirmation by an attending clinician."}
                </p>
              </div>

              {currentRole === "attending_physician" && (
                <button
                  onClick={onAttest}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer shrink-0 shadow-sm ${
                    isAttested
                      ? "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-600"
                      : "bg-emerald-600 text-white hover:bg-emerald-500 border border-emerald-500 shadow-emerald-950"
                  }`}
                >
                  {isAttested ? "Re-Attest Plan" : "Digitally Sign Off & Approve"}
                </button>
              )}
            </div>

            {/* Diagnostic Codes Footer */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* ICD-10 */}
              <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-2.5">
                <div className="flex items-center gap-1.5 text-[11px] font-mono font-medium text-slate-400 uppercase mb-2">
                  <Tag className="h-3 w-3 text-sky-400" />
                  ICD-10 Diagnostic Codes
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {clinician.icd10Codes.map((c, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-sky-300 border border-slate-700/60"
                      title={c.display}
                    >
                      <strong className="text-sky-400">{c.code}</strong> {c.display}
                    </span>
                  ))}
                </div>
              </div>

              {/* RxNorm */}
              <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-2.5">
                <div className="flex items-center gap-1.5 text-[11px] font-mono font-medium text-slate-400 uppercase mb-2">
                  <Pill className="h-3 w-3 text-emerald-400" />
                  RxNorm Semantic Identifiers
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {clinician.rxNormCodes.map((r, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-emerald-300 border border-slate-700/60"
                      title={r.display}
                    >
                      <strong className="text-emerald-400">{r.code}</strong> {r.display}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Patient View Mode */}
        {persona === "patient" && (
          <div className="space-y-4">
            {/* Regional Translation Alert Banner if active */}
            {selectedLang !== "en" && patient.regionalTranslations && (
              <div className="rounded-lg border border-sky-800 bg-sky-950/40 p-3 space-y-1">
                <span className="text-xs font-semibold text-sky-300">
                  {patient.regionalTranslations[selectedLang]?.title}
                </span>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {patient.regionalTranslations[selectedLang]?.summary}
                </p>
                <p className="text-xs font-medium text-amber-300 pt-1">
                  ⚠️ {patient.regionalTranslations[selectedLang]?.warning}
                </p>
              </div>
            )}

            {/* Plain Summary */}
            <div className="rounded-xl border border-emerald-900/40 bg-emerald-950/20 p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
                <FileCheck className="h-4 w-4" />
                What You Need to Know (In Plain English)
              </div>
              <p className="text-sm text-slate-200 leading-relaxed font-normal">
                {patient.plainSummary}
              </p>
            </div>

            {/* Visual Pill & Medication Schedule */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
                <Pill className="h-3.5 w-3.5 text-sky-400" />
                Your Take-Home Medicine Schedule
              </div>
              <div className="grid grid-cols-1 gap-2.5">
                {patient.pillSchedule.map((item, idx) => {
                  const isStop = item.drug.startsWith("STOP");
                  return (
                    <div
                      key={idx}
                      className={`rounded-lg border p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${
                        isStop
                          ? "border-rose-800/60 bg-rose-950/30 text-rose-200"
                          : "border-slate-800 bg-slate-950/60 text-slate-200"
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-sm font-semibold ${
                              isStop ? "text-rose-300 font-bold" : "text-white"
                            }`}
                          >
                            {item.drug}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded bg-slate-800/80 font-mono text-slate-300">
                            {item.dose}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">{item.purpose}</p>
                        <p className="text-xs text-slate-300 pt-1 italic">{item.instructions}</p>
                      </div>

                      <div className="shrink-0 text-right">
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-medium inline-block ${
                            isStop
                              ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                              : "bg-sky-500/20 text-sky-300 border border-sky-500/30"
                          }`}
                        >
                          {item.timing}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Warning Signs Box */}
            <div className="rounded-xl border border-amber-900/40 bg-amber-950/20 p-3.5 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
                <AlertTriangle className="h-4 w-4" />
                Warning Signs — When to Call the Doctor or Go to the ER:
              </div>
              <ul className="space-y-1 pl-1">
                {patient.warningSigns.map((warning, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-slate-200">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>{warning}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
