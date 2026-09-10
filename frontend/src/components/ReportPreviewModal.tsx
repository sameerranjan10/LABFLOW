import React from "react";
import { LabReport } from "@/data/labflowData";
import { X, Download, Send, CheckCircle, FileText, Printer } from "lucide-react";

interface ReportPreviewModalProps {
  report: LabReport | null;
  onClose: () => void;
  onReleaseReport?: (reportId: string) => void;
}

export const ReportPreviewModal: React.FC<ReportPreviewModalProps> = ({
  report,
  onClose,
  onReleaseReport,
}) => {
  if (!report) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* HEADER */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Diagnostic Report Preview: {report.id}
              </h2>
              <p className="text-xs text-slate-500">
                Patient: {report.patient.name} ({report.patient.mrn})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* REPORT DOCUMENT SIMULATION */}
        <div className="p-8 space-y-6 bg-slate-50/30 max-h-[65vh] overflow-y-auto font-sans">
          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-xs space-y-6">
            {/* REPORT HEADER */}
            <div className="flex justify-between items-start border-b border-slate-200 pb-4">
              <div>
                <h1 className="text-xl font-extrabold text-indigo-900 tracking-tight">
                  APEX DIAGNOSTICS & PATHOLOGY
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  NABL & CAP Accredited Central Reference Laboratory
                </p>
                <p className="text-xs text-slate-400">
                  Plot 14, Healthcare Hub, Main Boulevard • Phone: +91 11 4000 8000
                </p>
              </div>
              <div className="text-right font-mono text-xs">
                <span className="bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full inline-block">
                  {report.status.toUpperCase()}
                </span>
                <p className="text-slate-400 text-[11px] mt-1">Date: 2026-09-10</p>
              </div>
            </div>

            {/* PATIENT INFO GRID */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-3 rounded-md border border-slate-100">
              <div>
                <p><span className="font-semibold text-slate-500">Patient Name:</span> <strong className="text-slate-900">{report.patient.name}</strong></p>
                <p><span className="font-semibold text-slate-500">Age / Gender:</span> {report.patient.age} Yrs / {report.patient.gender}</p>
                <p><span className="font-semibold text-slate-500">MRN:</span> <code className="text-slate-700">{report.patient.mrn}</code></p>
              </div>
              <div>
                <p><span className="font-semibold text-slate-500">Order ID:</span> <code className="text-indigo-600 font-bold">{report.orderId}</code></p>
                <p><span className="font-semibold text-slate-500">Report ID:</span> <code>{report.id}</code></p>
                <p><span className="font-semibold text-slate-500">Reviewing Pathologist:</span> {report.reviewer}</p>
              </div>
            </div>

            {/* TEST RESULTS SUMMARY TABLE */}
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                Laboratory Test Parameters
              </h3>
              <table className="w-full text-left text-xs border border-slate-200">
                <thead className="bg-slate-100 text-slate-600 font-semibold uppercase text-[10px]">
                  <tr>
                    <th className="p-2 border-b border-r border-slate-200">Test Name</th>
                    <th className="p-2 border-b border-r border-slate-200">Observed Value</th>
                    <th className="p-2 border-b border-r border-slate-200">Unit</th>
                    <th className="p-2 border-b border-slate-200">Reference Interval</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="p-2 font-medium border-r border-slate-200">Hemoglobin</td>
                    <td className="p-2 font-bold text-slate-900 border-r border-slate-200">12.4</td>
                    <td className="p-2 text-slate-500 border-r border-slate-200">g/dL</td>
                    <td className="p-2 text-slate-500">12.0 – 16.0</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-medium border-r border-slate-200">Total Leukocyte Count (WBC)</td>
                    <td className="p-2 font-bold text-amber-700 border-r border-slate-200">12.8 ↑</td>
                    <td className="p-2 text-slate-500 border-r border-slate-200">10³/µL</td>
                    <td className="p-2 text-slate-500">4.0 – 11.0</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-medium border-r border-slate-200">Platelet Count</td>
                    <td className="p-2 font-bold text-slate-900 border-r border-slate-200">210</td>
                    <td className="p-2 text-slate-500 border-r border-slate-200">10³/µL</td>
                    <td className="p-2 text-slate-500">150 – 450</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* PATHOLOGIST SIGNATURE */}
            <div className="pt-4 border-t border-slate-200 flex justify-between items-end text-xs">
              <div>
                <p className="text-[10px] text-slate-400">Electronic Verification Hash:</p>
                <p className="font-mono text-[10px] text-slate-500">SHA256: 8f92a410b00192e49c</p>
              </div>
              <div className="text-right">
                <div className="font-semibold text-slate-900">{report.reviewer}</div>
                <div className="text-[11px] text-slate-500">MD (Pathology), Lead Consultant</div>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => alert("Downloading PDF Report...")}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Download PDF
            </button>
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
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
                  onClose();
                }}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                Release Report & Notify Patient
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
