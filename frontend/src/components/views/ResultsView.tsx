import React, { useState } from "react";
import { TestResult, DEMO_TEST_RESULT } from "@/data/labflowData";
import { StatusBadge } from "@/components/StatusBadge";
import { CheckCircle, RefreshCw, AlertTriangle, ShieldCheck, UserCheck, MessageSquare } from "lucide-react";

interface ResultsViewProps {
  onNotify: (title: string, message?: string, type?: "success" | "warning") => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({ onNotify }) => {
  const [allResults, setAllResults] = useState<TestResult[]>([]);
  const [result, setResult] = useState<TestResult>(DEMO_TEST_RESULT);
  const [comments, setComments] = useState(result.comments || "");
  const [isApproved, setIsApproved] = useState(result.status === "Approved");

  React.useEffect(() => {
    async function loadResult() {
      try {
        const res = await fetch("/api/results");
        if (res.ok) {
          const data = await res.json();
          if (data.results && data.results.length > 0) {
            setAllResults(data.results);
            const first = data.results[0];
            setResult(first);
            setComments(first.comments || "");
            setIsApproved(first.status === "Approved");
          }
        }
      } catch (e) {
        console.warn("Results fetch fallback:", e);
      }
    }
    loadResult();
  }, []);

  const handleApprove = async () => {
    setIsApproved(true);
    setResult((prev) => ({
      ...prev,
      status: "Approved",
      comments: comments,
      parameters: prev.parameters.map((p) => ({ ...p, status: "Verified" })),
    }));

    try {
      const res = await fetch("/api/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resultId: result.id,
          reviewer: "Dr. Arvind Swaminathan, MD",
          comments: comments || "Pathologist medical review verified. All panic thresholds cleared.",
        }),
      });
      if (res.ok) {
        const pName = result?.patient?.name || (result as any)?.patientName || "Aditi Rao";
        onNotify("Result Approved & Persisted in Database", `Test result for ${pName} (${result?.orderId || "ORD-10294"}) verified and pushed to Report Release queue.`, "success");
        return;
      }
    } catch (err) {
      console.warn("Backend result sync error:", err);
    }
    const pName = result?.patient?.name || (result as any)?.patientName || "Aditi Rao";
    onNotify("Result Approved Successfully", `Test result for ${pName} (${result?.orderId || "ORD-10294"}) approved.`, "success");
  };

  const handleRequestRecheck = async () => {
    setResult((prev) => ({
      ...prev,
      status: "Recheck Requested",
      comments: comments || "Recheck requested due to parameter deviation.",
    }));

    try {
      await fetch("/api/samples", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sampleId: result.sampleId,
          nextStage: "PROCESSING",
          operator: "Pathologist",
          notes: "Analyzer rerun requested by pathologist.",
        }),
      });
    } catch (err) {
      console.warn("Rerun sample sync error:", err);
    }

    onNotify("Recheck Requested & Sample Queued", `Sample ${result.sampleId} flagged for rerun on Sysmex analyzer.`, "warning");
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Result Review & Pathologist Verification
            </h1>
            <StatusBadge type="status" value={result.status} />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Verify automated analyzer output against biological reference ranges and panic limits.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">Instrument:</span>
          <code className="bg-slate-100 text-slate-800 px-2.5 py-1 rounded border border-slate-200 font-mono font-semibold">
            {result.instrument}
          </code>
        </div>
      </div>

      {/* MULTI-RESULT SWITCHER */}
      {allResults.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Select Ingested Result:</span>
          {allResults.map((r) => {
            const isSelected = r.id === result.id || r.orderId === result.orderId;
            const patientName = r.patient?.name || (r as any).patientName || "Patient";
            return (
              <button
                key={r.id}
                onClick={() => {
                  setResult(r);
                  setComments(r.comments || "");
                  setIsApproved(r.status === "Approved");
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer border whitespace-nowrap flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-2xs"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
              >
                <span>{patientName}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${isSelected ? "bg-indigo-700 text-indigo-100" : "bg-slate-100 text-slate-500"}`}>
                  {r.orderId}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* PATIENT & ORDER SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="labflow-card p-3.5 bg-slate-50/50">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Patient</span>
          <span className="text-sm font-bold text-slate-900 block mt-0.5">
            {result?.patient?.name || (result as any)?.patientName || "Aditi Rao"}
          </span>
          <span className="text-xs text-slate-500 font-mono">
            {result?.patient?.mrn || (result as any)?.mrn || "MRN-84920"} • {result?.patient?.gender || "Female"}, {result?.patient?.age || 47}y
          </span>
        </div>

        <div className="labflow-card p-3.5 bg-slate-50/50">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Order ID</span>
          <span className="text-sm font-mono font-bold text-sky-600 block mt-0.5">{result?.orderId || "ORD-10294"}</span>
          <span className="text-xs text-slate-500 font-mono">Sample: {result?.sampleId || "SMP-20491"}</span>
        </div>

        <div className="labflow-card p-3.5 bg-slate-50/50">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Test Name</span>
          <span className="text-sm font-bold text-slate-900 block mt-0.5">{result?.testName || "CBC (Complete Blood Count)"}</span>
          <span className="text-xs text-slate-500">Completed at {result?.completedAt || "11:15 AM"}</span>
        </div>

        <div className="labflow-card p-3.5 bg-slate-50/50">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Assigned Pathologist</span>
          <span className="text-sm font-semibold text-slate-900 block mt-0.5">{result?.reviewer || "Dr. Arvind Swaminathan, MD"}</span>
          <span className="text-xs text-emerald-600 font-medium">Medical License Verified</span>
        </div>
      </div>

      {/* MAIN TWO COLUMN LAYOUT: PARAMETER TABLE (LEFT 70%) & REVIEW PANEL (RIGHT 30%) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT 2 COLS: RESULT PARAMETERS TABLE */}
        <div className="lg:col-span-2 labflow-card overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 tracking-wide uppercase">
              Analyzed Parameter Values
            </h3>
            <span className="text-xs text-slate-500">
              Total Parameters: {result.parameters.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200 tracking-wider">
                <tr>
                  <th className="py-3 px-4">Parameter</th>
                  <th className="py-3 px-4">Result</th>
                  <th className="py-3 px-4">Unit</th>
                  <th className="py-3 px-4">Reference Range</th>
                  <th className="py-3 px-4">Flag</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {result.parameters.map((p, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900 whitespace-nowrap">
                      {p.name}
                    </td>
                    <td className={`py-3 px-4 font-mono font-bold text-sm whitespace-nowrap ${
                      p.flag === "High" || p.flag === "Critical" ? "text-amber-700" : "text-slate-900"
                    }`}>
                      {p.result}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">
                      {p.unit}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">
                      {p.referenceRange}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <StatusBadge type="flag" value={p.flag} size="sm" />
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded ${
                        p.status === "Verified"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-amber-50 text-amber-800 border border-amber-200"
                      }`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT COL: REVIEWER ACTIONS PANEL */}
        <div className="labflow-card p-5 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
              <UserCheck className="w-5 h-5 text-indigo-600" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Pathologist Sign-off Panel
                </h3>
                <p className="text-xs text-slate-500">
                  Reviewer: {result.reviewer}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                Clinical Interpretation / Comments
              </label>
              <textarea
                rows={4}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Enter pathologist remarks or clinical correlation notes..."
                className="w-full p-2.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              ></textarea>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5 text-xs">
              <span className="font-semibold text-slate-700 block">Verification Rules Checklist:</span>
              <ul className="space-y-1 text-slate-600 text-[11px]">
                <li className="flex items-center gap-1.5 text-emerald-700">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Daily QC Calibration Valid
                </li>
                <li className="flex items-center gap-1.5 text-emerald-700">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Delta Check Passed (Historical baseline OK)
                </li>
                <li className="flex items-center gap-1.5 text-amber-700">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> WBC 12.8 10³/µL requires clinical note
                </li>
              </ul>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="space-y-2 pt-3 border-t border-slate-200">
            <button
              onClick={handleApprove}
              disabled={isApproved}
              className={`w-full py-2.5 px-4 rounded-lg font-semibold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 ${
                isApproved
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300 cursor-not-allowed"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              {isApproved ? "Result Approved & Released" : "Approve Result"}
            </button>

            <button
              onClick={handleRequestRecheck}
              className="w-full py-2 px-4 rounded-lg font-semibold text-xs border border-amber-300 text-amber-800 bg-amber-50 hover:bg-amber-100 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Request Recheck / Rerun
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
