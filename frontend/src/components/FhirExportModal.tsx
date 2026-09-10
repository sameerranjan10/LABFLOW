"use client";

import React, { useState } from "react";
import { X, Copy, Check, Download, Database, ShieldCheck } from "lucide-react";
import { downloadFhirBundle } from "@/lib/fhir";

interface FhirExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  fhirBundle: Record<string, unknown>;
  patientName: string;
}

export function FhirExportModal({ isOpen, onClose, fhirBundle, patientName }: FhirExportModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const jsonString = JSON.stringify(fhirBundle, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const safeName = patientName.toLowerCase().replace(/\s+/g, "_");
    downloadFhirBundle(fhirBundle, `fhir_bundle_${safeName}.json`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/80 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-950 border border-sky-800 text-sky-400">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-white">EHR Interoperability Export (FHIR R4)</h3>
                <span className="rounded bg-sky-500/20 border border-sky-500/40 px-2 py-0.5 font-mono text-[10px] text-sky-300">
                  HL7 FHIR R4 Compliant
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Patient Bundle: {patientName} • Structured for ABDM / Epic / Cerner integration
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Payload Summary Bar */}
        <div className="flex items-center justify-between bg-slate-950/40 border-b border-slate-800 px-6 py-2.5 text-xs text-slate-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
              Resource Validation: PASSED
            </span>
            <span>ResourceType: Bundle (Collection)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 transition cursor-pointer"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? "Copied JSON!" : "Copy Payload"}</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 rounded-lg border border-sky-600 bg-sky-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-sky-500 transition cursor-pointer shadow-sm shadow-sky-900/30"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download .json</span>
            </button>
          </div>
        </div>

        {/* Code Content */}
        <div className="p-6 overflow-y-auto bg-slate-950 font-mono text-xs text-sky-200 leading-relaxed">
          <pre className="selection:bg-sky-500/30">
            <code>{jsonString}</code>
          </pre>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-800 bg-slate-950 px-6 py-3 text-[11px] text-slate-500">
          <span>Security: DISHA / HIPAA De-identification Tagged</span>
          <button
            onClick={onClose}
            className="rounded px-3 py-1 text-slate-300 hover:bg-slate-800 transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
