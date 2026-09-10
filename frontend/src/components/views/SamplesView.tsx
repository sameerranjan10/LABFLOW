import React, { useState } from "react";
import { LabSample, LabStage } from "@/data/labflowData";
import { StatusBadge } from "@/components/StatusBadge";
import { Search, Filter, TestTube2, Barcode, Eye } from "lucide-react";

interface SamplesViewProps {
  samples: LabSample[];
  onSelectSample: (sample: LabSample) => void;
}

export const SamplesView: React.FC<SamplesViewProps> = ({
  samples,
  onSelectSample,
}) => {
  const [search, setSearch] = useState("");
  const [stageTab, setStageTab] = useState<string>("ALL");

  const stageTabs = [
    { id: "ALL", label: "All Samples" },
    { id: "COLLECTED", label: "Collected" },
    { id: "IN_TRANSIT", label: "In Transit" },
    { id: "RECEIVED", label: "Received" },
    { id: "PROCESSING", label: "Processing" },
    { id: "REJECTED", label: "Rejected" },
    { id: "COMPLETED", label: "Completed" },
  ];

  const filtered = samples.filter((s) => {
    const matchesSearch =
      s.id.toLowerCase().includes(search.toLowerCase()) ||
      s.orderId.toLowerCase().includes(search.toLowerCase()) ||
      s.patient.name.toLowerCase().includes(search.toLowerCase()) ||
      s.barcode.toLowerCase().includes(search.toLowerCase()) ||
      s.test.toLowerCase().includes(search.toLowerCase());

    if (stageTab === "ALL") return matchesSearch;
    if (stageTab === "REJECTED") return matchesSearch && s.status === "Rejected";
    if (stageTab === "COMPLETED") return matchesSearch && s.stage === "RELEASED";
    return matchesSearch && s.stage === stageTab;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Specimen & Sample Tracking
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            End-to-end chain of custody, barcode scanning, and location history.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
          <Barcode className="w-4 h-4 text-purple-600" />
          <span className="text-slate-600">Active Barcoded Tubes:</span>
          <span className="font-bold text-slate-900">{samples.length}</span>
        </div>
      </div>

      {/* FILTER TABS & SEARCH */}
      <div className="labflow-card p-4 space-y-4">
        {/* STAGE TABS */}
        <div className="flex flex-wrap gap-1.5 border-b border-slate-200 pb-3">
          {stageTabs.map((tab) => {
            const active = stageTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setStageTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  active
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* SEARCH */}
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search sample ID, barcode, order ID, patient..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* SAMPLES TABLE */}
      <div className="labflow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200 tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Sample ID</th>
                <th className="py-3.5 px-4">Order ID</th>
                <th className="py-3.5 px-4">Patient Name</th>
                <th className="py-3.5 px-4">Sample Type</th>
                <th className="py-3.5 px-4">Test Assigned</th>
                <th className="py-3.5 px-4">Current Location</th>
                <th className="py-3.5 px-4">Stage</th>
                <th className="py-3.5 px-4">Collected At</th>
                <th className="py-3.5 px-4">TAT</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-slate-500">
                    No sample records found.
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-purple-700 whitespace-nowrap">
                      {s.id}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-indigo-600 whitespace-nowrap">
                      {s.orderId}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-semibold text-slate-900">{s.patient.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{s.barcode}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 whitespace-nowrap">
                      {s.sampleType}
                    </td>
                    <td className="py-3.5 px-4 text-slate-900 font-medium whitespace-nowrap">
                      {s.test}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 text-[11px] max-w-xs truncate">
                      {s.currentLocation}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <StatusBadge type="stage" value={s.stage} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600 whitespace-nowrap">
                      {s.collectedAt}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600 whitespace-nowrap">
                      {s.tat}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <StatusBadge type="status" value={s.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => onSelectSample(s)}
                        className="px-2.5 py-1 text-xs font-semibold rounded bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors cursor-pointer flex items-center gap-1 ml-auto"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Traceability
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
