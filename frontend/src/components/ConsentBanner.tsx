"use client";

import React, { useState } from "react";
import { ShieldCheck, ShieldAlert, FileKey, ToggleLeft, ToggleRight, Lock } from "lucide-react";

interface ConsentBannerProps {
  patientName: string;
  isConsentActive: boolean;
  onToggleConsent: (active: boolean) => void;
  canManageConsent: boolean;
}

export function ConsentBanner({
  patientName,
  isConsentActive,
  onToggleConsent,
  canManageConsent,
}: ConsentBannerProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div
      className={`rounded-xl border p-3 text-xs transition-colors ${
        isConsentActive
          ? "border-emerald-900/60 bg-emerald-950/20 text-emerald-300"
          : "border-rose-900/60 bg-rose-950/30 text-rose-300"
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          {isConsentActive ? (
            <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
          ) : (
            <ShieldAlert className="h-4 w-4 text-rose-400 shrink-0" />
          )}

          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-100">
                DISHA / ABDM Patient Consent Artifact:
              </span>
              <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800 text-slate-300">
                ABDM-CONSENT-9942
              </span>
              <span
                className={`font-mono text-[10px] px-1.5 py-0.2 rounded font-bold ${
                  isConsentActive
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-rose-500/20 text-rose-400"
                }`}
              >
                {isConsentActive ? "ACTIVE CONSENT GRANTED" : "CONSENT REVOKED / PROCESSING PAUSED"}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Purpose: Clinical Decision Support & Medication Reconciliation for {patientName}.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-[11px] text-sky-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <FileKey className="h-3 w-3" />
            <span>{showDetails ? "Hide Scope" : "View Scope"}</span>
          </button>

          {canManageConsent ? (
            <button
              onClick={() => onToggleConsent(!isConsentActive)}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-slate-200 hover:bg-slate-700 transition cursor-pointer"
            >
              {isConsentActive ? (
                <>
                  <ToggleRight className="h-4 w-4 text-emerald-400" />
                  <span>Revoke Consent</span>
                </>
              ) : (
                <>
                  <ToggleLeft className="h-4 w-4 text-rose-400" />
                  <span>Grant Consent</span>
                </>
              )}
            </button>
          ) : (
            <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono bg-slate-900/60 px-2 py-0.5 rounded border border-slate-800">
              <Lock className="h-3 w-3" />
              <span>Patient Managed</span>
            </div>
          )}
        </div>
      </div>

      {showDetails && (
        <div className="mt-2.5 pt-2.5 border-t border-slate-800/80 text-[11px] text-slate-300 space-y-1 bg-slate-950/40 p-2 rounded-lg">
          <div className="font-semibold text-slate-200">Consent Scope & Legal Policy Details:</div>
          <div>• <strong>Data Custodian:</strong> Level-1 Academic Trauma Center</div>
          <div>• <strong>Permitted Processing:</strong> De-identified NLP Entity Extraction, RxNorm Lookup, Safety Audit.</div>
          <div>• <strong>Explicit Exclusion:</strong> No commercial data sales, no unencrypted cloud transit, automatic expiration in 30 days.</div>
          <div>• <strong>Revocation Right:</strong> Patient or proxy may revoke access instantly at any time.</div>
        </div>
      )}
    </div>
  );
}
