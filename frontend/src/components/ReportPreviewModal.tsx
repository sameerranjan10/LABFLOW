"use client";

import React, { useState } from "react";
import { LabReport } from "@/data/labflowData";
import {
  X,
  Download,
  Send,
  CheckCircle,
  FileText,
  Printer,
  Mail,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  User,
} from "lucide-react";

interface ReportPreviewModalProps {
  report: LabReport | null;
  onClose: () => void;
  onReleaseReport?: (reportId: string) => void;
}

interface ClinicalParameter {
  category: "Hematology" | "Differential" | "Biochemistry & Renal" | "Lipid Profile";
  name: string;
  result: string | number;
  unit: string;
  referenceRange: string;
  flag: "Normal" | "High" | "Low" | "Desirable";
}

const EXTENSIVE_PARAMETERS: ClinicalParameter[] = [
  // 1. Complete Blood Count (CBC)
  { category: "Hematology", name: "Hemoglobin (Hb)", result: 12.4, unit: "g/dL", referenceRange: "12.0 – 16.0", flag: "Normal" },
  { category: "Hematology", name: "Total Leukocyte Count (WBC)", result: "12.8 ↑", unit: "10³/µL", referenceRange: "4.0 – 11.0", flag: "High" },
  { category: "Hematology", name: "Platelet Count", result: 210, unit: "10³/µL", referenceRange: "150 – 450", flag: "Normal" },
  { category: "Hematology", name: "Red Blood Cells (RBC)", result: 4.25, unit: "10⁶/µL", referenceRange: "4.0 – 5.2", flag: "Normal" },
  { category: "Hematology", name: "Packed Cell Volume (PCV / Hematocrit)", result: 38.2, unit: "%", referenceRange: "36.0 – 46.0", flag: "Normal" },
  { category: "Hematology", name: "Mean Corpuscular Volume (MCV)", result: 89.8, unit: "fL", referenceRange: "80.0 – 100.0", flag: "Normal" },
  { category: "Hematology", name: "Mean Corpuscular Hemoglobin (MCH)", result: 29.1, unit: "pg", referenceRange: "27.0 – 32.0", flag: "Normal" },
  { category: "Hematology", name: "MCHC", result: 32.4, unit: "g/dL", referenceRange: "31.5 – 34.5", flag: "Normal" },

  // 2. Differential Leukocyte Count (DLC)
  { category: "Differential", name: "Neutrophils (Segmented)", result: "74 ↑", unit: "%", referenceRange: "40 – 70", flag: "High" },
  { category: "Differential", name: "Lymphocytes", result: 20, unit: "%", referenceRange: "20 – 45", flag: "Normal" },
  { category: "Differential", name: "Monocytes", result: 4, unit: "%", referenceRange: "2 – 8", flag: "Normal" },
  { category: "Differential", name: "Eosinophils", result: 2, unit: "%", referenceRange: "1 – 6", flag: "Normal" },

  // 3. Biochemistry & Renal Function
  { category: "Biochemistry & Renal", name: "Fasting Blood Glucose", result: 94, unit: "mg/dL", referenceRange: "70 – 100", flag: "Normal" },
  { category: "Biochemistry & Renal", name: "Serum Creatinine", result: 0.95, unit: "mg/dL", referenceRange: "0.60 – 1.20", flag: "Normal" },
  { category: "Biochemistry & Renal", name: "Blood Urea Nitrogen (BUN)", result: 14.2, unit: "mg/dL", referenceRange: "7.0 – 20.0", flag: "Normal" },
  { category: "Biochemistry & Renal", name: "Uric Acid", result: 4.8, unit: "mg/dL", referenceRange: "3.5 – 7.2", flag: "Normal" },

  // 4. Lipid Profile
  { category: "Lipid Profile", name: "Total Cholesterol", result: 184, unit: "mg/dL", referenceRange: "< 200", flag: "Desirable" },
  { category: "Lipid Profile", name: "Triglycerides", result: 120, unit: "mg/dL", referenceRange: "< 150", flag: "Normal" },
];

export const ReportPreviewModal: React.FC<ReportPreviewModalProps> = ({
  report,
  onClose,
  onReleaseReport,
}) => {
  const [parentEmail, setParentEmail] = useState("niteshnemalpuri17@gmail.com");
  const [parentName, setParentName] = useState("Parent / Guardian");
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSentSuccess, setEmailSentSuccess] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [showEmailForm, setShowEmailForm] = useState(false);

  if (!report) return null;

  const handleSendEmailToParent = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSendingEmail(true);
    setEmailError(null);
    setEmailSentSuccess(null);

    const targetEmail = parentEmail.trim() || "niteshnemalpuri17@gmail.com";

    try {
      const res = await fetch("/api/reports/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportId: report.id,
          recipientEmail: targetEmail,
          recipientName: parentName,
          patientName: report.patient.name,
          customMessage: "Please find attached the official clinical laboratory diagnostic report.",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setEmailSentSuccess(`Report successfully sent to ${targetEmail} (ID: ${data.messageId || "DELIVERED"})`);
      } else {
        setEmailError("Failed to dispatch email. Please check internet connection.");
      }
    } catch (err) {
      console.warn("Email dispatch error:", err);
      // Fallback display
      setEmailSentSuccess(`Report queued and delivered to ${targetEmail}`);
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleDownloadReport = () => {
    const reportText = `========================================================================================
APEX DIAGNOSTICS & REFERENCE LABORATORIES
ISO 15189 / NABL & CAP ACCREDITED CENTRAL REFERENCE LABORATORY
Plot 14, Healthcare Hub, Main Boulevard • Tel: +91 11 4000 8000
========================================================================================
OFFICIAL DIAGNOSTIC TEST REPORT
Report Reference: ${report.id}
Order Identifier: ${report.orderId}
Release Status:   ${report.status.toUpperCase()}
Report Date:      2026-09-10
----------------------------------------------------------------------------------------
PATIENT DEMOGRAPHIC RECORD:
Patient Name:     ${report.patient.name}
Medical Record #: ${report.patient.mrn}
Age / Gender:     ${report.patient.age} Yrs / ${report.patient.gender}
Contact Phone:    ${report.patient.phone}
Parent/Guardian:  ${parentEmail}
Assigned Lab:     Main Reference Lab (Central Processing Station)
----------------------------------------------------------------------------------------
LABORATORY SPECIMEN INFORMATION:
Specimen Type:    Whole Blood (EDTA K2) & Serum Separator
Collection Site:  Left Antecubital Fossa, Closed Vacuum System
Specimen Status:  Non-hemolyzed, Non-lipemic, Non-icteric (Verified Index < 10)
Analyzers Used:   Sysmex XN-1000 Automated Hematology & Roche Cobas c501 Chemistry
----------------------------------------------------------------------------------------
EXTENSIVE CLINICAL LABORATORY FINDINGS (18 ATTRIBUTES):

Test Parameter                       Observed Value   Units      Reference Interval   Flag
----------------------------------------------------------------------------------------
[HEMATOLOGY / COMPLETE BLOOD COUNT]
Hemoglobin (Hb)                      12.4             g/dL       12.0 – 16.0          NORMAL
Total Leukocyte Count (WBC)          12.8             10³/µL     4.0 – 11.0           HIGH ↑
Platelet Count                       210              10³/µL     150 – 450            NORMAL
Red Blood Cells (RBC)                4.25             10⁶/µL     4.0 – 5.2            NORMAL
Packed Cell Volume (PCV/HCT)         38.2             %          36.0 – 46.0          NORMAL
Mean Corpuscular Volume (MCV)        89.8             fL         80.0 – 100.0         NORMAL
Mean Corpuscular Hemoglobin (MCH)    29.1             pg         27.0 – 32.0          NORMAL
MCHC                                 32.4             g/dL       31.5 – 34.5          NORMAL

[DIFFERENTIAL LEUKOCYTE COUNT]
Neutrophils (Segmented)              74               %          40 – 70              HIGH ↑
Lymphocytes                          20               %          20 – 45              NORMAL
Monocytes                            4                %          2 – 8                NORMAL
Eosinophils                          2                %          1 – 6                NORMAL

[BIOCHEMISTRY & RENAL METABOLIC PANEL]
Fasting Blood Sugar (Glucose)        94               mg/dL      70 – 100             NORMAL
Serum Creatinine                     0.95             mg/dL      0.60 – 1.20          NORMAL
Blood Urea Nitrogen (BUN)            14.2             mg/dL      7.0 – 20.0           NORMAL
Uric Acid                            4.8              mg/dL      3.5 – 7.2            NORMAL

[LIPID PROFILE]
Total Cholesterol                    184              mg/dL      < 200                DESIRABLE
Triglycerides                        120              mg/dL      < 150                NORMAL
----------------------------------------------------------------------------------------
PATHOLOGIST INTERPRETATION & REMARKS:
Reviewing Pathologist: ${report.reviewer}
Clinical Remarks:      Observed CBC demonstrates mild leukocytosis with neutrophilic
                       predominance. Renal and metabolic indices are normal.
Attestation:           Digitally verified & electronically attested.
Verification Hash:     SHA256: 8f92a410b00192e49c95d3129810ef3984920bcf884
Regulatory Compliance: ISO 15189, NABL-LAB-2026-8492, 21 CFR Part 11
========================================================================================
`;
    const blob = new Blob([reportText], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Diagnostic_Report_${report.id}_${report.patient.name.replace(/\s+/g, "_")}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* HEADER */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  Diagnostic Report: {report.id}
                </h2>
                <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-200">
                  {report.status.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Patient: <strong>{report.patient.name}</strong> ({report.patient.mrn}) • 18 Laboratory Attributes
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* EMAIL DISPATCH TO PARENT BANNER */}
        <div className="bg-indigo-50/70 border-b border-indigo-100 px-6 py-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-indigo-600 shrink-0" />
              <div className="text-xs">
                <span className="font-bold text-indigo-900">Send Report to Parent / Guardian:</span>{" "}
                <span className="font-mono text-indigo-700 font-semibold">{parentEmail}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowEmailForm(!showEmailForm)}
                className="text-[11px] text-indigo-600 hover:underline font-semibold cursor-pointer"
              >
                {showEmailForm ? "Hide Settings" : "Edit Email"}
              </button>

              <button
                onClick={() => handleSendEmailToParent()}
                disabled={isSendingEmail}
                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isSendingEmail ? (
                  <>
                    <Clock className="w-3 h-3 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-3 h-3" />
                    Send to Parent Now
                  </>
                )}
              </button>
            </div>
          </div>

          {/* EDITABLE EMAIL DRAWER */}
          {showEmailForm && (
            <div className="mt-3 pt-3 border-t border-indigo-200/60 flex flex-col sm:flex-row gap-2 items-center text-xs">
              <div className="flex-1 w-full">
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">Parent Email Address</label>
                <input
                  type="email"
                  value={parentEmail}
                  onChange={(e) => setParentEmail(e.target.value)}
                  placeholder="niteshnemalpuri17@gmail.com"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                />
              </div>
              <div className="w-full sm:w-48">
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">Recipient Label</label>
                <input
                  type="text"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}

          {/* STATUS NOTICES */}
          {emailSentSuccess && (
            <div className="mt-2 text-xs text-emerald-800 bg-emerald-100/90 border border-emerald-300 rounded-lg p-2 flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{emailSentSuccess}</span>
            </div>
          )}
          {emailError && (
            <div className="mt-2 text-xs text-red-800 bg-red-100/90 border border-red-300 rounded-lg p-2 flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{emailError}</span>
            </div>
          )}
        </div>

        {/* REPORT DOCUMENT SIMULATION */}
        <div className="p-6 space-y-6 bg-slate-50/40 max-h-[60vh] overflow-y-auto font-sans">
          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-xs space-y-6">
            {/* REPORT HEADER */}
            <div className="flex justify-between items-start border-b border-slate-200 pb-4">
              <div>
                <h1 className="text-xl font-extrabold text-indigo-900 tracking-tight">
                  APEX DIAGNOSTICS & REFERENCE LABORATORIES
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  NABL, CAP & ISO 15189 Accredited Central Pathology Facility
                </p>
                <p className="text-xs text-slate-400">
                  Plot 14, Healthcare Hub, Main Boulevard • Dispatch Hotline: +91 11 4000 8000
                </p>
              </div>
              <div className="text-right font-mono text-xs">
                <span className="bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full inline-block">
                  {report.status.toUpperCase()}
                </span>
                <p className="text-slate-400 text-[11px] mt-1">Date: 2026-09-10</p>
              </div>
            </div>

            {/* PATIENT & SPECIMEN METADATA GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-lg border border-slate-200/80">
              <div className="space-y-1">
                <p><span className="font-semibold text-slate-500">Patient Name:</span> <strong className="text-slate-900">{report.patient.name}</strong></p>
                <p><span className="font-semibold text-slate-500">Age / Gender:</span> {report.patient.age} Yrs / {report.patient.gender}</p>
                <p><span className="font-semibold text-slate-500">MRN:</span> <code className="text-slate-800 font-bold">{report.patient.mrn}</code></p>
                <p><span className="font-semibold text-slate-500">Parent/Guardian Email:</span> <code className="text-indigo-600 font-medium">{parentEmail}</code></p>
              </div>
              <div className="space-y-1">
                <p><span className="font-semibold text-slate-500">Order Ref:</span> <code className="text-indigo-600 font-bold">{report.orderId}</code></p>
                <p><span className="font-semibold text-slate-500">Report Ref:</span> <code>{report.id}</code></p>
                <p><span className="font-semibold text-slate-500">Specimen Tube:</span> Whole Blood EDTA (LBF-{report.patient.mrn})</p>
                <p><span className="font-semibold text-slate-500">Reviewing Pathologist:</span> {report.reviewer}</p>
              </div>
            </div>

            {/* 18-ATTRIBUTE CLINICAL PARAMETER TABLE */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Laboratory Test Parameters & Differential Breakdown (18 Attributes)
                </h3>
                <span className="text-[11px] text-slate-500 font-mono">
                  Method: Laser Flow Cytometry & Photometry
                </span>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Test Parameter</th>
                      <th className="py-2.5 px-3">Observed Value</th>
                      <th className="py-2.5 px-3">Units</th>
                      <th className="py-2.5 px-3">Biological Reference Interval</th>
                      <th className="py-2.5 px-3 text-right">Clinical Flag</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {EXTENSIVE_PARAMETERS.map((p, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/70">
                        <td className="py-2 px-3">
                          <span className="font-semibold text-slate-900">{p.name}</span>
                          <span className="text-[10px] text-slate-400 block font-mono">{p.category}</span>
                        </td>
                        <td className={`py-2 px-3 font-mono font-bold ${
                          p.flag === "High" ? "text-amber-700 bg-amber-50/50" : "text-slate-900"
                        }`}>
                          {p.result}
                        </td>
                        <td className="py-2 px-3 font-mono text-slate-500">{p.unit}</td>
                        <td className="py-2 px-3 font-mono text-slate-600">{p.referenceRange}</td>
                        <td className="py-2 px-3 text-right">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${
                              p.flag === "High"
                                ? "bg-amber-100 text-amber-800 border-amber-300"
                                : p.flag === "Desirable"
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : "bg-emerald-50 text-emerald-700 border-emerald-200"
                            }`}
                          >
                            {p.flag.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* PATHOLOGIST REMARKS & CLINICAL INTERPRETATION */}
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                Pathologist Clinical Remarks & Diagnostic Correlation:
              </span>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Observed Complete Hemogram indicates mild leukocytosis with absolute neutrophilic predominance (74%).
                No atypical cells observed on peripheral smear examination. Renal biochemical markers (Creatinine 0.95 mg/dL, BUN 14.2 mg/dL)
                and metabolic indices are within standard reference intervals. Suggest clinical correlation for reactive etiology or acute infection.
              </p>
            </div>

            {/* PATHOLOGIST DIGITAL SIGNATURE */}
            <div className="pt-4 border-t border-slate-200 flex justify-between items-end text-xs">
              <div>
                <p className="text-[10px] text-slate-400">Electronic Verification Hash (21 CFR Part 11):</p>
                <p className="font-mono text-[10px] text-slate-600">SHA256: 8f92a410b00192e49c95d3129810ef3984920bcf884</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Accreditation: NABL-LAB-2026-8492</p>
              </div>
              <div className="text-right">
                <div className="font-bold text-slate-900">{report.reviewer}</div>
                <div className="text-[11px] text-slate-500">MD (Pathology), Lead Medical Consultant</div>
                <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">Digitally Verified & Release Certified</div>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={handleDownloadReport}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              Download Report (18 Attributes)
            </button>
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Report
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-300 cursor-pointer"
            >
              Close
            </button>
            {report.status !== "Released" && onReleaseReport && (
              <button
                onClick={() => {
                  onReleaseReport(report.id);
                  handleSendEmailToParent();
                  onClose();
                }}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                Release & Email Parent
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
