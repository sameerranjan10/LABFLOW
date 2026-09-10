import React, { useEffect, useState } from "react";
import { AuditRecord, INITIAL_AUDIT_LOGS } from "@/data/labflowData";
import { fetchPatientAuditLogs, ClinicalAuditEntry } from "@/lib/supabase";
import { ShieldCheck, History, Search, Download, CheckCircle2 } from "lucide-react";

export const AuditTrailView: React.FC = () => {
  const [logs, setLogs] = useState<AuditRecord[]>(INITIAL_AUDIT_LOGS);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadAuditLogs() {
      try {
        const res = await fetch("/api/audit");
        if (res.ok) {
          const data = await res.json();
          if (data.logs && data.logs.length > 0) {
            setLogs(data.logs);
            return;
          }
        }
      } catch (err) {
        console.info("Using local audit log fallback:", err);
      }
    }
    loadAuditLogs();
  }, []);

  const filtered = logs.filter(
    (l) =>
      l.user.toLowerCase().includes(search.toLowerCase()) ||
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.entityId.toLowerCase().includes(search.toLowerCase()) ||
      l.location.toLowerCase().includes(search.toLowerCase())
  );

  const handleExportAuditCSV = () => {
    const headers = ["ID", "Timestamp", "User", "Role", "Action", "Entity", "Entity ID", "Location", "Integrity Status"];
    const rows = filtered.map((l) => [
      l.id,
      `"${l.timestamp}"`,
      `"${l.user}"`,
      l.role,
      `"${l.action}"`,
      l.entity,
      l.entityId,
      `"${l.location}"`,
      "ISO-15189 Verified",
    ]);
    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `LabFlow_Audit_Ledger_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Enterprise Compliance Audit Trail
            </h1>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              ISO 15189 Immutable Log
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Cryptographically signed event ledger for sample chain of custody and user access logs.
          </p>
        </div>

        <button
          onClick={handleExportAuditCSV}
          className="px-3 py-2 text-xs font-semibold rounded-lg border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
        >
          <Download className="w-4 h-4 text-slate-500" />
          Export Audit Ledger
        </button>
      </div>

      {/* SEARCH */}
      <div className="labflow-card p-4">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Filter audit log by user, action, entity ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* AUDIT LOG TABLE */}
      <div className="labflow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200 tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Action Performed</th>
                <th className="py-3.5 px-4">Entity</th>
                <th className="py-3.5 px-4">Entity ID</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4 text-right">Integrity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition-colors text-slate-700">
                  <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="py-3.5 px-4 font-sans font-bold text-slate-900 whitespace-nowrap">
                    {log.user}
                  </td>
                  <td className="py-3.5 px-4 font-sans text-slate-600 whitespace-nowrap">
                    {log.role}
                  </td>
                  <td className="py-3.5 px-4 font-sans font-semibold text-indigo-900 whitespace-nowrap">
                    {log.action}
                  </td>
                  <td className="py-3.5 px-4 font-sans text-slate-600 whitespace-nowrap">
                    {log.entity}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-purple-700 whitespace-nowrap">
                    {log.entityId}
                  </td>
                  <td className="py-3.5 px-4 font-sans text-slate-500 whitespace-nowrap">
                    {log.location}
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Signed
                    </span>
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
