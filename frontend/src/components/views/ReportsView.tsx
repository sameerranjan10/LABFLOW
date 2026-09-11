"use client";

import React, { useState } from "react";
import { LabReport } from "@/data/labflowData";
import { StatusBadge } from "@/components/StatusBadge";
import { FileText, Eye, Download, Send, Search, Filter, Mail, CheckCircle2, MessageSquare } from "lucide-react";

interface ReportsViewProps {
  reports: LabReport[];
  onSelectReport: (report: LabReport) => void;
  onReleaseReport: (reportId: string) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  reports,
  onSelectReport,
  onReleaseReport,
}) => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [emailStatusMsg, setEmailStatusMsg] = useState<string | null>(null);
  const [waStatusMsg, setWaStatusMsg] = useState<string | null>(null);

  const filtered = reports.filter((rpt) => {
    const q = search.toLowerCase();
    const matchesSearch =
      rpt.id.toLowerCase().includes(q) ||
      rpt.orderId.toLowerCase().includes(q) ||
      rpt.patient.name.toLowerCase().includes(q) ||
      rpt.patient.mrn.toLowerCase().includes(q) ||
      (rpt.patient.phone && rpt.patient.phone.toLowerCase().includes(q)) ||
      (rpt.doctorName && rpt.doctorName.toLowerCase().includes(q)) ||
      (rpt.priority && rpt.priority.toLowerCase().includes(q)) ||
      (rpt.location && rpt.location.toLowerCase().includes(q)) ||
      rpt.tests.some((t) => t.toLowerCase().includes(q));

    const matchesStatus = statusFilter === "ALL" || rpt.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const releasedCount = reports.filter((r) => r.status === "Released").length;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Diagnostic Report Release Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Final medical report verification, digital signatures, and patient notification dispatch.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
            Released Today: <strong className="text-emerald-700">{releasedCount} Reports</strong>
          </span>
        </div>
      </div>

      {emailStatusMsg && (
        <div className="p-3 bg-sky-50 text-sky-800 border border-sky-200 rounded-lg text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
          <span>{emailStatusMsg}</span>
        </div>
      )}
      {waStatusMsg && (
        <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <MessageSquare className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{waStatusMsg}</span>
        </div>
      )}

      {/* SEARCH AND FILTERS */}
      <div className="labflow-card p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search report ID, order ID, patient..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">All Report Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Pending Review">Pending Review</option>
            <option value="Approved">Approved</option>
            <option value="Released">Released</option>
          </select>
        </div>
      </div>

      {/* REPORTS TABLE */}
      <div className="labflow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200 tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Report / Order</th>
                <th className="py-3.5 px-4">Patient Information</th>
                <th className="py-3.5 px-4">Referring Doctor</th>
                <th className="py-3.5 px-4">Priority</th>
                <th className="py-3.5 px-4">Tests Ordered</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Requisition Time</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((rpt) => (
                <tr key={rpt.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="font-mono font-bold text-indigo-600">{rpt.id}</div>
                    <div className="text-[11px] font-mono text-slate-500 font-semibold">{rpt.orderId}</div>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="font-semibold text-slate-900">{rpt.patient.name}</div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      <span>{rpt.patient.mrn}</span> • <span>{rpt.patient.age}y/{rpt.patient.gender}</span>
                    </div>
                    {rpt.patient.phone && (
                      <div className="text-[10px] text-slate-400 font-mono">{rpt.patient.phone}</div>
                    )}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="font-semibold text-slate-800">{rpt.doctorName || "Dr. Priya Sharma, MD"}</div>
                    <div className="text-[10px] text-slate-400">{rpt.location || "Main Laboratory"}</div>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      rpt.priority === "STAT"
                        ? "bg-red-100 text-red-700 border border-red-200"
                        : rpt.priority === "Urgent"
                        ? "bg-amber-100 text-amber-700 border border-amber-200"
                        : "bg-blue-100 text-blue-700 border border-blue-200"
                    }`}>
                      {rpt.priority || "Normal"}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="flex flex-wrap gap-1">
                      {rpt.tests.map((t, idx) => (
                        <span key={idx} className="bg-indigo-50 text-indigo-800 border border-indigo-100 text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap">
                          {t}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <StatusBadge type="status" value={rpt.status} size="sm" />
                    {rpt.releasedAt && (
                      <div className="text-[10px] text-emerald-600 font-mono mt-0.5">Signed {rpt.releasedAt}</div>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-500 whitespace-nowrap text-[11px]">
                    {rpt.createdAt}
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onSelectReport(rpt)}
                        className="px-2 py-1 text-xs font-semibold rounded bg-indigo-50 text-indigo-700 hover:bg-indigo-100 flex items-center gap-1 cursor-pointer"
                        title="View Full Report (18 Attributes)"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </button>

                      <button
                        onClick={() => {
                          const link = document.createElement("a");
                          link.href = `/api/reports/${rpt.id}/pdf`;
                          link.download = `Apex_Report_${rpt.id}.pdf`;
                          link.target = "_blank";
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                        className="px-2 py-1 text-xs font-semibold rounded bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300 flex items-center gap-1 cursor-pointer"
                        title="Download Official 18-Attribute PDF Report"
                      >
                        <Download className="w-3.5 h-3.5 text-rose-600" />
                        PDF
                      </button>

                      <button
                        onClick={async () => {
                          const targetEmail = "niteshnemalpuri17@gmail.com";
                          setEmailStatusMsg(`Preparing email dispatch and PDF for ${targetEmail}...`);
                          
                          // Trigger automated PDF download
                          const pdfLink = document.createElement("a");
                          pdfLink.href = `/api/reports/${rpt.id}/pdf`;
                          pdfLink.download = `Apex_Report_${rpt.id}.pdf`;
                          document.body.appendChild(pdfLink);
                          pdfLink.click();
                          document.body.removeChild(pdfLink);

                          try {
                            const res = await fetch("/api/reports/email", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                reportId: rpt.id,
                                recipientEmail: targetEmail,
                                recipientName: "Parent / Guardian",
                                patientName: rpt.patient.name,
                              }),
                            });
                            const data = await res.json();
                            if (res.ok) {
                              if (data.sentDirectly) {
                                setEmailStatusMsg(`Report & PDF delivered via SMTP to ${targetEmail}!`);
                              } else {
                                if (data.gmailComposeUrl) {
                                  window.open(data.gmailComposeUrl, "_blank");
                                } else if (data.mailtoUrl) {
                                  window.location.href = data.mailtoUrl;
                                }
                                setEmailStatusMsg(`Official PDF downloaded & Gmail opened for ${targetEmail}! Drag the PDF into Gmail.`);
                              }
                            } else {
                              const mailto = `mailto:${targetEmail}?subject=Diagnostic Report ${rpt.id}&body=Report for ${rpt.patient.name}: http://localhost:3000/api/reports/${rpt.id}/pdf`;
                              window.open(mailto, "_blank");
                              setEmailStatusMsg(`PDF downloaded & mail client opened for ${targetEmail}`);
                            }
                          } catch (err) {
                            const mailto = `mailto:${targetEmail}?subject=Diagnostic Report ${rpt.id}&body=Report for ${rpt.patient.name}: http://localhost:3000/api/reports/${rpt.id}/pdf`;
                            window.open(mailto, "_blank");
                            setEmailStatusMsg(`PDF downloaded & mail client opened for ${targetEmail}`);
                          }
                          setTimeout(() => setEmailStatusMsg(null), 7000);
                        }}
                        className="px-2 py-1 text-xs font-semibold rounded bg-sky-50 text-sky-700 hover:bg-sky-100 flex items-center gap-1 cursor-pointer"
                        title="Send Official PDF Report via Email to Parent"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        Email Parent
                      </button>

                      <button
                        onClick={async () => {
                          const targetPhone = rpt.patient.phone || "+91 98000 11111";
                          setWaStatusMsg(`Preparing WhatsApp notification & downloading PDF for ${targetPhone}...`);
                          
                          // Trigger automated PDF download
                          const pdfLink = document.createElement("a");
                          pdfLink.href = `/api/reports/${rpt.id}/pdf`;
                          pdfLink.download = `Apex_Report_${rpt.id}.pdf`;
                          document.body.appendChild(pdfLink);
                          pdfLink.click();
                          document.body.removeChild(pdfLink);

                          try {
                            const res = await fetch("/api/reports/whatsapp", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                reportId: rpt.id,
                                recipientPhone: targetPhone,
                                recipientName: rpt.patient.name,
                                patientName: rpt.patient.name,
                              }),
                            });
                            const data = await res.json();
                            if (res.ok && data.directLink) {
                              window.open(data.directLink, "_blank");
                              setWaStatusMsg(`Official PDF downloaded & WhatsApp Web launched for ${rpt.patient.name}! Drag PDF into chat.`);
                            } else {
                              const cleanDigits = targetPhone.replace(/[^\d]/g, "");
                              const fallback = `https://api.whatsapp.com/send?phone=${cleanDigits}&text=${encodeURIComponent(`Dear ${rpt.patient.name}, your official PDF diagnostic lab report (${rpt.id}) is ready: http://localhost:3000/api/reports/${rpt.id}/pdf`)}`;
                              window.open(fallback, "_blank");
                              setWaStatusMsg(`PDF downloaded & WhatsApp opened for ${targetPhone}`);
                            }
                          } catch (err) {
                            const cleanDigits = targetPhone.replace(/[^\d]/g, "");
                            const fallback = `https://api.whatsapp.com/send?phone=${cleanDigits}&text=${encodeURIComponent(`Dear ${rpt.patient.name}, your official PDF diagnostic lab report (${rpt.id}) is ready: http://localhost:3000/api/reports/${rpt.id}/pdf`)}`;
                            window.open(fallback, "_blank");
                            setWaStatusMsg(`PDF downloaded & WhatsApp opened for ${targetPhone}`);
                          }
                          setTimeout(() => setWaStatusMsg(null), 7000);
                        }}
                        className="px-2 py-1 text-xs font-semibold rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 flex items-center gap-1 cursor-pointer"
                        title={`Send PDF Report via WhatsApp to ${rpt.patient.phone || "+91 98000 11111"}`}
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        WhatsApp
                      </button>

                      {rpt.status !== "Released" && (
                        <button
                          onClick={() => onReleaseReport(rpt.id)}
                          className="px-2 py-1 text-xs font-semibold rounded bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-1 cursor-pointer"
                          title="Release Report"
                        >
                          <Send className="w-3 h-3" />
                          Release
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
