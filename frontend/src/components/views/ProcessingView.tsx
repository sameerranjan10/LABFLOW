import React, { useState } from "react";
import { LabSample } from "@/data/labflowData";
import { StatusBadge } from "@/components/StatusBadge";
import { Cpu, Play, RefreshCw, CheckCircle2, AlertOctagon, Settings, Layers } from "lucide-react";

interface ProcessingViewProps {
  samples: LabSample[];
  onSelectSample: (sample: LabSample) => void;
  onNavigateToResults: () => void;
}

export const ProcessingView: React.FC<ProcessingViewProps> = ({
  samples,
  onSelectSample,
  onNavigateToResults,
}) => {
  const [selectedWorkstation, setSelectedWorkstation] = useState("Hematology");

  const instruments = [
    { name: "Sysmex XN-1000", dept: "Hematology", status: "Running", activeBatch: 12, readyResults: 4, error: false },
    { name: "Roche Cobas c501", dept: "Biochemistry", status: "Running", activeBatch: 18, readyResults: 6, error: false },
    { name: "Bio-Rad Variant II", dept: "HbA1c / HPLC", status: "Calibrating", activeBatch: 5, readyResults: 1, error: false },
    { name: "Abbott Architect i2000", dept: "Immunology", status: "Maintenance", activeBatch: 0, readyResults: 0, error: true },
  ];

  const processingSamples = samples.filter((s) => s.stage === "PROCESSING" || s.stage === "RECEIVED");

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Laboratory Instrument & Batch Processing
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor automated auto-analyzers, batch queues, and pre-analytical centrifuges.
          </p>
        </div>

        <button
          onClick={onNavigateToResults}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
        >
          Go to Result Review Queue →
        </button>
      </div>

      {/* INSTRUMENT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {instruments.map((inst) => (
          <div key={inst.name} className="labflow-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {inst.dept}
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                  inst.error
                    ? "bg-red-50 text-red-700 border-red-200"
                    : inst.status === "Running"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-amber-50 text-amber-700 border-amber-200"
                }`}
              >
                {inst.status}
              </span>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900 font-mono">
                {inst.name}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Active Batch: <strong className="text-slate-800">{inst.activeBatch} specimens</strong>
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Ready for Review:</span>
              <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                {inst.readyResults} results
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* PROCESSING QUEUE TABLE */}
      <div className="labflow-card overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-600" />
            <h3 className="text-sm font-bold text-slate-900 tracking-wide uppercase">
              Active Specimen Processing Queue ({processingSamples.length})
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            Auto-Interface Protocol: HL7 v2.5 / LIMS Bridge
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200 tracking-wider">
              <tr>
                <th className="py-3 px-4">Sample ID</th>
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Patient</th>
                <th className="py-3 px-4">Test Requested</th>
                <th className="py-3 px-4">Assigned Instrument</th>
                <th className="py-3 px-4">Received Time</th>
                <th className="py-3 px-4">Run Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {processingSamples.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-purple-700 whitespace-nowrap">
                    {s.id}
                  </td>
                  <td className="py-3 px-4 font-mono text-indigo-600 font-semibold whitespace-nowrap">
                    {s.orderId}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-900 whitespace-nowrap">
                    {s.patient.name}
                  </td>
                  <td className="py-3 px-4 text-slate-800 font-medium whitespace-nowrap">
                    {s.test}
                  </td>
                  <td className="py-3 px-4 text-slate-600 text-[11px] whitespace-nowrap">
                    {s.currentLocation}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">
                    {s.collectedAt}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <StatusBadge type="status" value={s.status} size="sm" />
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap space-x-2">
                    <button
                      onClick={async () => {
                        try {
                          await fetch("/api/samples", {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              sampleId: s.id,
                              nextStage: "REVIEW",
                              operator: "Sysmex Automation Line",
                              notes: "Automated hematology run finished. Results transmitted to Pathologist review queue.",
                            }),
                          });
                        } catch (e) {
                          console.warn("Analyzer run sync error:", e);
                        }
                        onNavigateToResults();
                      }}
                      className="px-2.5 py-1 text-xs font-bold rounded bg-purple-600 text-white hover:bg-purple-700 cursor-pointer shadow-2xs transition"
                    >
                      Run Analyzer Ingestion
                    </button>
                    <button
                      onClick={() => onSelectSample(s)}
                      className="px-2.5 py-1 text-xs font-semibold rounded bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer"
                    >
                      Details
                    </button>
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
