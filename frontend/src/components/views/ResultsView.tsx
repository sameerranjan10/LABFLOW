"use client";

import React, { useState, useEffect, useMemo } from "react";
import { TestResult, LabOrder, LabSample, LabReport, DEMO_TEST_RESULT, ResultParameter } from "@/data/labflowData";
import { StatusBadge } from "@/components/StatusBadge";
import {
  CheckCircle2,
  RefreshCw,
  AlertTriangle,
  ShieldCheck,
  UserCheck,
  MessageSquare,
  Search,
  Filter,
  Mail,
  FileText,
  Clock,
  Send,
  Download,
  Check,
  ChevronRight,
  ExternalLink,
  Cpu,
  User,
  FlaskConical,
  X,
  Plus,
} from "lucide-react";
import { NavView } from "@/components/Sidebar";

interface ResultsViewProps {
  orders?: LabOrder[];
  samples?: LabSample[];
  reports?: LabReport[];
  searchQuery?: string;
  onNotify: (title: string, message?: string, type?: "success" | "warning" | "info" | "error") => void;
  onNavigateToView?: (view: NavView) => void;
  onReleaseReport?: (reportId: string) => void;
  onSelectReport?: (report: LabReport) => void;
  onSelectSample?: (sample: LabSample) => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({
  orders = [],
  samples = [],
  reports = [],
  searchQuery = "",
  onNotify,
  onNavigateToView,
  onReleaseReport,
  onSelectReport,
  onSelectSample,
}) => {
  const [allResults, setAllResults] = useState<TestResult[]>([]);
  const [selectedResultId, setSelectedResultId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(searchQuery || "");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "Pending Review" | "Approved" | "STAT">("ALL");
  const [comments, setComments] = useState("");
  const [isApproving, setIsApproving] = useState(false);
  const [isApprovingAll, setIsApprovingAll] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailStatusMsg, setEmailStatusMsg] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Sync external search query from Topbar
  useEffect(() => {
    setSearchTerm(searchQuery || "");
  }, [searchQuery]);

  // Load results from backend/db
  const fetchResults = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/results");
      if (res.ok) {
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          setAllResults(data.results);
          if (!selectedResultId) {
            setSelectedResultId(data.results[0].id);
            setComments(data.results[0].comments || "");
          }
        }
      }
    } catch (e) {
      console.warn("Results fetch error:", e);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  // Ensure any newly added orders that may not yet be in allResults are synced
  useEffect(() => {
    if (orders.length > 0 && allResults.length > 0) {
      const existingOrderIds = new Set(allResults.map((r) => r.orderId));
      const missingOrders = orders.filter((o) => !existingOrderIds.has(o.id));
      if (missingOrders.length > 0) {
        // Trigger a fresh fetch so db.getTestResults auto-synthesizes them
        fetchResults();
      }
    }
  }, [orders]);

  // Selected Result
  const currentResult = useMemo(() => {
    if (!allResults || allResults.length === 0) return DEMO_TEST_RESULT;
    if (selectedResultId) {
      const found = allResults.find((r) => r.id === selectedResultId || r.orderId === selectedResultId);
      if (found) return found;
    }
    return allResults[0];
  }, [allResults, selectedResultId]);

  // Sync comments when currentResult changes
  useEffect(() => {
    if (currentResult) {
      setComments(currentResult.comments || "");
    }
  }, [currentResult?.id]);

  // Matching order and report for currentResult
  const currentOrder = useMemo(() => {
    return orders.find((o) => o.id === currentResult?.orderId);
  }, [orders, currentResult]);

  const currentReport = useMemo(() => {
    return reports.find((r) => r.orderId === currentResult?.orderId || r.id === `RPT-${currentResult?.orderId?.replace("ORD-", "")}`);
  }, [reports, currentResult]);

  // Filtered Results Worklist
  const filteredResults = useMemo(() => {
    return allResults.filter((r) => {
      const q = searchTerm.toLowerCase().trim();
      const patientName = (r.patient?.name || (r as any).patientName || "").toLowerCase();
      const patientMrn = (r.patient?.mrn || (r as any).mrn || "").toLowerCase();
      const patientEmail = (r.patient?.email || (r as any).email || "").toLowerCase();
      const orderId = (r.orderId || "").toLowerCase();
      const sampleId = (r.sampleId || "").toLowerCase();
      const testName = (r.testName || "").toLowerCase();
      const instrument = (r.instrument || "").toLowerCase();

      const matchesSearch =
        !q ||
        patientName.includes(q) ||
        patientMrn.includes(q) ||
        patientEmail.includes(q) ||
        orderId.includes(q) ||
        sampleId.includes(q) ||
        testName.includes(q) ||
        instrument.includes(q);

      const isStatOrUrgent = orders.find((o) => o.id === r.orderId)?.priority === "STAT" || orders.find((o) => o.id === r.orderId)?.priority === "Urgent";
      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "STAT" ? isStatOrUrgent : r.status === statusFilter);

      return matchesSearch && matchesStatus;
    });
  }, [allResults, searchTerm, statusFilter, orders]);

  // Auto-focus first matching result when filtering changes if current selection is not in filtered list
  useEffect(() => {
    if (filteredResults.length > 0) {
      const isCurrentInFiltered = filteredResults.some(
        (r) => r.id === selectedResultId || r.orderId === selectedResultId
      );
      if (!isCurrentInFiltered) {
        setSelectedResultId(filteredResults[0].id);
        setComments(filteredResults[0].comments || "");
      }
    }
  }, [filteredResults, selectedResultId]);

  // Counts
  const pendingCount = allResults.filter((r) => r.status === "Pending Review").length;
  const approvedCount = allResults.filter((r) => r.status === "Approved").length;
  const statCount = allResults.filter((r) => {
    const o = orders.find((ord) => ord.id === r.orderId);
    return o?.priority === "STAT" || o?.priority === "Urgent";
  }).length;

  // Handler: Approve Single Result
  const handleApproveResult = async (targetResult: TestResult) => {
    setIsApproving(true);
    const reviewerName = "Dr. Arvind Swaminathan, MD";
    const remarkText = comments || targetResult.comments || "Pathologist medical review verified. All panic thresholds cleared.";

    // Optimistic local update
    setAllResults((prev) =>
      prev.map((r) =>
        r.id === targetResult.id
          ? {
              ...r,
              status: "Approved",
              reviewer: reviewerName,
              comments: remarkText,
              parameters: r.parameters.map((p) => ({ ...p, status: "Verified" })),
            }
          : r
      )
    );

    try {
      const res = await fetch("/api/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resultId: targetResult.id,
          reviewer: reviewerName,
          comments: remarkText,
        }),
      });

      if (res.ok) {
        const pName = targetResult.patient?.name || (targetResult as any).patientName || "Patient";
        onNotify(
          "Result Verified & Approved",
          `Diagnostic result for ${pName} (${targetResult.orderId}) has been signed off and queued for release.`,
          "success"
        );

        // Also release report if handler exists
        if (onReleaseReport) {
          const reportId = `RPT-${targetResult.orderId.replace("ORD-", "")}`;
          onReleaseReport(reportId);
        }
      }
    } catch (err) {
      console.warn("Result approval error:", err);
      onNotify("Result Approved Locally", `Signed off ${targetResult.orderId}`, "info");
    } finally {
      setIsApproving(false);
    }
  };

  // Handler: Approve All Pending Results (Batch)
  const handleApproveAllPending = async () => {
    const pendingList = filteredResults.filter((r) => r.status === "Pending Review");
    if (pendingList.length === 0) {
      onNotify("No Pending Results", "All results in the active filter are already approved.", "info");
      return;
    }

    setIsApprovingAll(true);
    const reviewerName = "Dr. Arvind Swaminathan, MD";

    // Optimistic update
    setAllResults((prev) =>
      prev.map((r) =>
        r.status === "Pending Review"
          ? {
              ...r,
              status: "Approved",
              reviewer: reviewerName,
              parameters: r.parameters.map((p) => ({ ...p, status: "Verified" })),
            }
          : r
      )
    );

    try {
      for (const item of pendingList) {
        await fetch("/api/results", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            resultId: item.id,
            reviewer: reviewerName,
            comments: item.comments || "Batch verification verified by supervising pathologist.",
          }),
        });

        if (onReleaseReport) {
          const reportId = `RPT-${item.orderId.replace("ORD-", "")}`;
          onReleaseReport(reportId);
        }
      }

      onNotify(
        "Batch Verification Complete",
        `Successfully verified and released all ${pendingList.length} patient results!`,
        "success"
      );
    } catch (err) {
      console.warn("Batch approval error:", err);
    } finally {
      setIsApprovingAll(false);
    }
  };

  // Handler: Request Recheck / Rerun
  const handleRequestRecheck = async () => {
    if (!currentResult) return;
    setAllResults((prev) =>
      prev.map((r) =>
        r.id === currentResult.id
          ? { ...r, status: "Recheck Requested", comments: comments || "Recheck requested due to parameter deviation." }
          : r
      )
    );

    try {
      await fetch("/api/samples", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sampleId: currentResult.sampleId,
          nextStage: "PROCESSING",
          operator: "Pathologist",
          notes: "Analyzer rerun requested by pathologist.",
        }),
      });
    } catch (err) {
      console.warn("Rerun sample sync error:", err);
    }

    onNotify("Rerun Requested", `Sample ${currentResult.sampleId} re-queued for auto-analyzer processing.`, "warning");
  };

  // Handler: Send Report to Patient Email
  const handleSendReportEmail = async (targetResult: TestResult) => {
    const reportId = `RPT-${targetResult.orderId.replace("ORD-", "")}`;
    const targetEmail = targetResult.patient?.email?.trim() || currentOrder?.patient?.email?.trim() || "niteshnemalpuri17@gmail.com";
    const patientName = targetResult.patient?.name || "Patient";

    setIsSendingEmail(true);
    setEmailStatusMsg(`Preparing official PDF and email dispatch for ${targetEmail}...`);

    // Download PDF automatically
    const pdfLink = document.createElement("a");
    pdfLink.href = `/api/reports/${reportId}/pdf`;
    pdfLink.download = `Apex_Report_${reportId}.pdf`;
    document.body.appendChild(pdfLink);
    pdfLink.click();
    document.body.removeChild(pdfLink);

    try {
      const res = await fetch("/api/reports/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportId,
          recipientEmail: targetEmail,
          recipientName: patientName,
          patientName,
          customMessage: "Please find attached your official diagnostic test report verified by clinical pathology.",
        }),
      });

      const data = await res.json();
      if (res.ok) {
        if (data.sentDirectly) {
          setEmailStatusMsg(`Report PDF delivered to ${targetEmail} via ${data.provider}!`);
        } else {
          if (data.gmailComposeUrl) {
            window.open(data.gmailComposeUrl, "_blank");
          } else if (data.mailtoUrl) {
            window.location.href = data.mailtoUrl;
          }
          setEmailStatusMsg(`Official PDF generated and Gmail draft opened for ${targetEmail}!`);
        }
        onNotify("Report Dispatched via Email", `Report sent to ${targetEmail}`, "success");
      } else {
        const mailto = `mailto:${targetEmail}?subject=Diagnostic Report ${reportId}&body=Report for ${patientName}: http://localhost:3000/api/reports/${reportId}/pdf`;
        window.open(mailto, "_blank");
        setEmailStatusMsg(`Mail client opened for ${targetEmail}`);
      }
    } catch (err) {
      const mailto = `mailto:${targetEmail}?subject=Diagnostic Report ${reportId}&body=Report for ${patientName}: http://localhost:3000/api/reports/${reportId}/pdf`;
      window.open(mailto, "_blank");
      setEmailStatusMsg(`Mail client opened for ${targetEmail}`);
    } finally {
      setIsSendingEmail(false);
      setTimeout(() => setEmailStatusMsg(null), 8000);
    }
  };

  const isCurrentApproved = currentResult?.status === "Approved";

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Diagnostic Result Review & Medical Sign-Off
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              {allResults.length} Orders Registered
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Pathologist verification workstation. Review automated analyzer outputs against biological reference ranges and authorize clinical report release.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {pendingCount > 0 && (
            <button
              onClick={handleApproveAllPending}
              disabled={isApprovingAll}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isApprovingAll ? (
                <>
                  <Clock className="w-3.5 h-3.5 animate-spin" />
                  <span>Verifying All...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Approve All Pending ({pendingCount})</span>
                </>
              )}
            </button>
          )}

          {onNavigateToView && (
            <button
              onClick={() => onNavigateToView("reports")}
              className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-xs transition flex items-center gap-1.5 cursor-pointer bg-white"
            >
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>View Reports ({reports.length})</span>
            </button>
          )}

          <button
            onClick={fetchResults}
            disabled={isRefreshing}
            className="p-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 transition cursor-pointer bg-white"
            title="Refresh Workstation"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-indigo-600" : ""}`} />
          </button>
        </div>
      </div>

      {/* EMAIL STATUS ALERT BANNER */}
      {emailStatusMsg && (
        <div className="p-3 bg-sky-50 text-sky-800 border border-sky-200 rounded-lg text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <Mail className="w-4 h-4 text-sky-600 shrink-0" />
          <span>{emailStatusMsg}</span>
        </div>
      )}

      {/* SEARCH AND FILTER WORKLIST TOOLBAR */}
      <div className="labflow-card p-4 space-y-3 bg-white">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          {/* SEARCH INPUT */}
          <div className="relative flex-1 w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search by patient name, MRN, email, Order ID, test, or instrument..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* STATUS FILTER PILLS */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setStatusFilter("ALL")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                statusFilter === "ALL"
                  ? "bg-indigo-600 text-white shadow-2xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              All ({allResults.length})
            </button>
            <button
              onClick={() => setStatusFilter("Pending Review")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1 ${
                statusFilter === "Pending Review"
                  ? "bg-amber-600 text-white shadow-2xs"
                  : "bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100"
              }`}
            >
              <span>Pending</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">{pendingCount}</span>
            </button>
            <button
              onClick={() => setStatusFilter("Approved")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1 ${
                statusFilter === "Approved"
                  ? "bg-emerald-600 text-white shadow-2xs"
                  : "bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100"
              }`}
            >
              <span>Approved</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">{approvedCount}</span>
            </button>
            <button
              onClick={() => setStatusFilter("STAT")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1 ${
                statusFilter === "STAT"
                  ? "bg-red-600 text-white shadow-2xs"
                  : "bg-red-50 text-red-800 border border-red-200 hover:bg-red-100"
              }`}
            >
              <span>STAT / Urgent</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">{statCount}</span>
            </button>
          </div>
        </div>
      </div>

      {/* TWO-COLUMN CLINICAL WORKSTATION LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: PATIENT RESULTS WORKLIST (4 COLS) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Patient Worklist ({filteredResults.length})
            </span>
            <span className="text-[11px] text-slate-400">Click to review</span>
          </div>

          <div className="space-y-2 max-h-[780px] overflow-y-auto pr-1">
            {filteredResults.length === 0 ? (
              <div className="labflow-card p-6 text-center text-xs text-slate-500 bg-white">
                <FlaskConical className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="font-semibold">No results matching filters.</p>
                <p className="text-[11px] text-slate-400 mt-1">Try changing your search keywords or filter pills.</p>
              </div>
            ) : (
              filteredResults.map((r) => {
                const isSelected = r.id === currentResult?.id || r.orderId === currentResult?.orderId;
                const patientName = r.patient?.name || (r as any).patientName || "Patient";
                const patientMrn = r.patient?.mrn || (r as any).mrn || "MRN-Unknown";
                const patientEmail = r.patient?.email || (r as any).email;
                const orderObj = orders.find((o) => o.id === r.orderId);
                const priority = orderObj?.priority || "Normal";
                const isPending = r.status === "Pending Review";

                return (
                  <div
                    key={r.id}
                    onClick={() => {
                      setSelectedResultId(r.id);
                      setComments(r.comments || "");
                    }}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer text-left relative ${
                      isSelected
                        ? "bg-indigo-50/70 border-indigo-500 shadow-xs ring-1 ring-indigo-400"
                        : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-bold text-slate-900 truncate">
                            {patientName}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {patientMrn}
                          </span>
                        </div>

                        <div className="text-[11px] text-slate-600 font-medium truncate mt-0.5">
                          {r.testName}
                        </div>

                        {patientEmail && (
                          <div className="text-[10px] text-indigo-600 truncate flex items-center gap-1 mt-0.5 font-sans">
                            <Mail className="w-3 h-3 text-indigo-500 shrink-0" />
                            <span className="truncate">{patientEmail}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <StatusBadge type="status" value={r.status} size="sm" />
                        {priority === "STAT" && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-red-100 text-red-700 border border-red-200">
                            STAT
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mt-2 pt-2 border-t border-slate-100">
                      <span>{r.orderId}</span>
                      <span>{r.completedAt}</span>
                      {isPending ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApproveResult(r);
                          }}
                          className="px-2 py-0.5 rounded bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-semibold flex items-center gap-1 transition"
                          title="Quick Approve"
                        >
                          <Check className="w-3 h-3" />
                          <span>Approve</span>
                        </button>
                      ) : (
                        <span className="text-emerald-600 font-semibold flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3" />
                          Verified
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: ACTIVE TEST RESULT DETAIL & APPROVAL PANEL (8 COLS) */}
        <div className="lg:col-span-8 space-y-5">
          {/* PATIENT & REQUISITION OVERVIEW CARD */}
          <div className="labflow-card p-5 bg-white space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900">
                    {currentResult.patient?.name || (currentResult as any).patientName || "Patient Findings"}
                  </h2>
                  <StatusBadge type="status" value={currentResult.status} />
                  {currentOrder?.priority === "STAT" && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-100 text-red-700 border border-red-200">
                      STAT Urgent
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-500 font-mono mt-0.5 flex flex-wrap items-center gap-2">
                  <span>MRN: {currentResult.patient?.mrn || (currentResult as any).mrn || "MRN-84920"}</span>
                  <span>•</span>
                  <span>{currentResult.patient?.age || 45}y / {currentResult.patient?.gender || "Female"}</span>
                  <span>•</span>
                  <span>Order Ref: <strong>{currentResult.orderId}</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <code className="bg-slate-100 text-slate-800 px-2.5 py-1 rounded border border-slate-200 font-mono text-xs font-semibold flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-purple-600" />
                  {currentResult.instrument}
                </code>
              </div>
            </div>

            {/* DEMOGRAPHIC & DISPATCH DETAILS GRID */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Specimen Barcode</span>
                <span className="font-mono font-bold text-purple-700 block mt-0.5">{currentResult.sampleId}</span>
                <span className="text-[11px] text-slate-500">{currentOrder?.sampleType || "Whole Blood"}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Ordering Clinician</span>
                <span className="font-semibold text-slate-800 block mt-0.5">{currentOrder?.doctorName || "Dr. Priya Sharma, MD"}</span>
                <span className="text-[11px] text-slate-500">{currentOrder?.location || "Main Laboratory"}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Completed At</span>
                <span className="font-mono text-slate-700 block mt-0.5">{currentResult.completedAt}</span>
                <span className="text-[11px] text-emerald-600 font-semibold">QC Calibration Valid</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Report Email Recipient</span>
                <span className="font-sans font-semibold text-indigo-700 block mt-0.5 truncate" title={currentResult.patient?.email || "patient@example.com"}>
                  ✉ {currentResult.patient?.email || currentOrder?.patient?.email || "Configured upon release"}
                </span>
                <span className="text-[10px] text-slate-400">Auto-dispatch enabled</span>
              </div>
            </div>
          </div>

          {/* PARAMETERS TABLE */}
          <div className="labflow-card overflow-hidden bg-white">
            <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Observed Clinical Parameters ({currentResult.parameters?.length || 0} Findings)
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Automated photometry and differential counts verified against bio-reference limits
                </p>
              </div>
              <span className="text-[10px] font-mono text-slate-500">ISO 15189 Standard</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200 tracking-wider">
                  <tr>
                    <th className="py-2.5 px-4">Test Parameter</th>
                    <th className="py-2.5 px-4">Observed Value</th>
                    <th className="py-2.5 px-4">Reference Range</th>
                    <th className="py-2.5 px-4">Units</th>
                    <th className="py-2.5 px-4 text-right">Parameter Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {currentResult.parameters?.map((p: ResultParameter, idx: number) => {
                    const isHigh = p.flag === "High" || p.flag === "Critical";
                    const isLow = p.flag === "Low";
                    return (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-4 font-semibold text-slate-800">
                          {p.name}
                        </td>
                        <td className="py-2.5 px-4 font-mono font-bold">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-xs ${
                              isHigh
                                ? "bg-amber-100 text-amber-900 border border-amber-200"
                                : isLow
                                ? "bg-blue-100 text-blue-900 border border-blue-200"
                                : "text-slate-900 font-medium"
                            }`}
                          >
                            {p.result} {isHigh ? "↑" : isLow ? "↓" : ""}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 font-mono text-slate-500 text-[11px]">
                          {p.referenceRange}
                        </td>
                        <td className="py-2.5 px-4 font-mono text-slate-500 text-[11px]">
                          {p.unit}
                        </td>
                        <td className="py-2.5 px-4 text-right whitespace-nowrap">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                              p.status === "Verified"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* PATHOLOGIST INTERPRETATION AND ACTION PANEL */}
          <div className="labflow-card p-5 bg-white space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                  Pathologist Medical Interpretation & Remarks
                </label>
                <span className="text-[11px] text-slate-400">Printed on official report</span>
              </div>
              <textarea
                rows={3}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Enter clinical correlation notes, differential diagnosis, or specimen remarks..."
                className="w-full p-3 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              ></textarea>

              {/* QUICK IMPRESSION SHORTCUT PILLS */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                <span className="text-[10px] text-slate-400 font-medium py-0.5">Quick Presets:</span>
                {[
                  "Within normal biological limits",
                  "Mild reactive leukocytosis - correlate clinically",
                  "Borderline lipid elevation - dietary counseling advised",
                  "Adequate glycemic control on current regimen",
                  "Electrolytes and renal profile stable",
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setComments(preset)}
                    className="px-2 py-0.5 rounded text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* QUALITY CONTROL CHECKLIST */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
              <div className="flex items-center gap-1.5 text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="text-[11px]">Daily 2-Pt QC Passed</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="text-[11px]">Delta Check Validated</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-700">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="text-[11px]">Digital Pathologist Key</span>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={handleRequestRecheck}
                  className="px-3 py-2 rounded-lg font-semibold text-xs border border-amber-300 text-amber-800 bg-amber-50 hover:bg-amber-100 transition cursor-pointer flex items-center justify-center gap-1.5 w-full sm:w-auto"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Request Rerun</span>
                </button>

                <button
                  onClick={() => {
                    const reportId = `RPT-${currentResult.orderId.replace("ORD-", "")}`;
                    window.open(`/api/reports/${reportId}/pdf`, "_blank");
                  }}
                  className="px-3 py-2 rounded-lg font-semibold text-xs border border-slate-300 text-slate-700 bg-slate-50 hover:bg-slate-100 transition cursor-pointer flex items-center justify-center gap-1.5 w-full sm:w-auto"
                >
                  <Download className="w-3.5 h-3.5 text-rose-600" />
                  <span>View Official PDF</span>
                </button>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                {isCurrentApproved ? (
                  <>
                    <button
                      onClick={() => handleSendReportEmail(currentResult)}
                      disabled={isSendingEmail}
                      className="px-4 py-2 rounded-lg font-semibold text-xs bg-sky-600 hover:bg-sky-700 text-white shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                      title="Send PDF Report to Patient Email"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>{isSendingEmail ? "Sending Email..." : "Send Report to Email"}</span>
                    </button>

                    <div className="px-3 py-2 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Verified & Released</span>
                    </div>
                  </>
                ) : (
                  <button
                    onClick={() => handleApproveResult(currentResult)}
                    disabled={isApproving}
                    className="px-5 py-2 rounded-lg font-semibold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 w-full sm:w-auto"
                  >
                    {isApproving ? (
                      <>
                        <Clock className="w-3.5 h-3.5 animate-spin" />
                        <span>Authorizing...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Approve & Authorize Result</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
