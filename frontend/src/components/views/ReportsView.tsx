import React, { useState } from "react";
import { LabReport } from "@/data/labflowData";
import { StatusBadge } from "@/components/StatusBadge";
import { FileText, Eye, Download, Send, Search, Filter } from "lucide-react";

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

  const filtered = reports.filter((rpt) => {
    const matchesSearch =
      rpt.id.toLowerCase().includes(search.toLowerCase()) ||
      rpt.orderId.toLowerCase().includes(search.toLowerCase()) ||
      rpt.patient.name.toLowerCase().includes(search.toLowerCase()) ||
      rpt.tests.some((t) => t.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === "ALL" || rpt.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

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
            Released Today: <strong className="text-emerald-700">84 Reports</strong>
          </span>
        </div>
      </div>

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
                <th className="py-3.5 px-4">Report ID</th>
                <th className="py-3.5 px-4">Order ID</th>
                <th className="py-3.5 px-4">Patient Name</th>
                <th className="py-3.5 px-4">Tests Included</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Reviewer</th>
                <th className="py-3.5 px-4">Created</th>
                <th className="py-3.5 px-4">Released At</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((rpt) => (
                <tr key={rpt.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-indigo-600 whitespace-nowrap">
                    {rpt.id}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-semibold text-slate-700 whitespace-nowrap">
                    {rpt.orderId}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="font-semibold text-slate-900">{rpt.patient.name}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{rpt.patient.mrn}</div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 max-w-xs truncate">
                    {rpt.tests.join(", ")}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <StatusBadge type="status" value={rpt.status} size="sm" />
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 whitespace-nowrap">
                    {rpt.reviewer}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-500 whitespace-nowrap">
                    {rpt.createdAt}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-500 whitespace-nowrap">
                    {rpt.releasedAt || "—"}
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onSelectReport(rpt)}
                        className="px-2 py-1 text-xs font-semibold rounded bg-indigo-50 text-indigo-700 hover:bg-indigo-100 flex items-center gap-1 cursor-pointer"
                        title="View Report Preview"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
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
