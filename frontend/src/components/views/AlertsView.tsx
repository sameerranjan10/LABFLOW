"use client";

import React, { useState, useEffect } from "react";
import { AlertItem } from "@/data/labflowData";
import { NavView } from "@/components/Sidebar";
import {
  AlertOctagon,
  Clock,
  XCircle,
  FileCheck2,
  Info,
  ArrowUpRight,
  Cpu,
  RefreshCw,
  ShieldCheck,
  Zap,
  Activity,
  Server,
  Layers,
  CheckCircle2,
  Mail,
  Send,
  RotateCcw,
  Sliders,
  Sparkles,
  ChevronRight,
  ExternalLink,
  Flame,
  Trash2,
  AlertTriangle,
  Play,
} from "lucide-react";

interface AlertsViewProps {
  alerts: AlertItem[];
  onDismissAlert: (id: string) => void;
  onNavigateToView: (view: NavView) => void;
  onNotify?: (title: string, message?: string, type?: "success" | "warning" | "info" | "error") => void;
}

interface QueueInfo {
  id: string;
  name: string;
  driver: string;
  concurrency: number;
  rateLimit: string;
  active: number;
  waiting: number;
  completed: number;
  failed: number;
  delayed: number;
  status: string;
  latencyAvgMs: number;
  backendProvider: string;
}

interface QueueJob {
  id: string;
  queueId: string;
  channel: "EMAIL" | "WHATSAPP";
  recipient: string;
  recipientName: string;
  reportId: string;
  subject: string;
  timestamp: string;
  status: string;
  messageId: string;
  notes?: string;
}

export const AlertsView: React.FC<AlertsViewProps> = ({
  alerts: initialAlerts,
  onDismissAlert,
  onNavigateToView,
  onNotify,
}) => {
  const [activeTab, setActiveTab] = useState<"ALERTS" | "RESILIENCE" | "QUEUES">("ALERTS");
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [localAlerts, setLocalAlerts] = useState<AlertItem[]>(initialAlerts || []);
  const [isLoadingAlerts, setIsLoadingAlerts] = useState(false);
  const [isDismissingAll, setIsDismissingAll] = useState(false);

  const [simulationLogs, setSimulationLogs] = useState<Array<{ id: string; time: string; text: string; type: "error" | "success" | "info" }>>([]);
  const [isSimulating, setIsSimulating] = useState<string | null>(null);
  const [isRecovering, setIsRecovering] = useState<string | null>(null);

  // In-card real-time feedback for cards without alerts (cards 4 & 5)
  const [cardFeedback, setCardFeedback] = useState<Record<string, { type: "info" | "error" | "success"; text: string }>>({});

  // Queue state
  const [queues, setQueues] = useState<QueueInfo[]>([]);
  const [queueJobs, setQueueJobs] = useState<QueueJob[]>([]);
  const [queueMetrics, setQueueMetrics] = useState<any>(null);
  const [isLoadingQueues, setIsLoadingQueues] = useState(false);
  const [retryingJobId, setRetryingJobId] = useState<string | null>(null);
  const [isFlushingQueue, setIsFlushingQueue] = useState(false);
  const [isDispatchingTest, setIsDispatchingTest] = useState<string | null>(null);
  const [processingJobId, setProcessingJobId] = useState<string | null>(null);

  // Fetch real alerts from backend
  const fetchAlerts = async () => {
    setIsLoadingAlerts(true);
    try {
      const res = await fetch("/api/alerts");
      if (res.ok) {
        const data = await res.json();
        if (data.alerts) setLocalAlerts(data.alerts);
      }
    } catch (e) {
      console.warn("Alerts fetch error:", e);
    } finally {
      setIsLoadingAlerts(false);
    }
  };

  // Fetch real queue metrics from backend
  const fetchQueueData = async () => {
    setIsLoadingQueues(true);
    try {
      const res = await fetch("/api/queues");
      if (res.ok) {
        const data = await res.json();
        setQueues(data.queues || []);
        setQueueJobs(data.recentJobs || []);
        setQueueMetrics(data.metrics || null);
      }
    } catch (e) {
      console.warn("Queue fetch error:", e);
    } finally {
      setIsLoadingQueues(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchAlerts();
    fetchQueueData();
  }, []);

  // Sync prop changes
  useEffect(() => {
    if (initialAlerts && initialAlerts.length > 0) {
      setLocalAlerts(initialAlerts);
    }
  }, [initialAlerts]);

  // Refetch when switching to queues
  useEffect(() => {
    if (activeTab === "QUEUES") {
      fetchQueueData();
    }
  }, [activeTab]);

  // Telemetry log entry
  const logEvent = (text: string, type: "error" | "success" | "info" = "info") => {
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    setSimulationLogs((prev) => [{ id: `log-${Date.now()}-${Math.random()}`, time, text, type }, ...prev.slice(0, 19)]);
  };

  // Dismiss a single alert immediately from screen and backend
  const handleDismiss = async (alertId: string) => {
    setLocalAlerts((prev) => prev.filter((a) => a.id !== alertId));
    onDismissAlert(alertId);
    logEvent(`Alert ${alertId} dismissed from operational queue.`, "info");
  };

  // Dismiss all active alerts
  const handleDismissAll = async () => {
    setIsDismissingAll(true);
    setLocalAlerts([]);
    try {
      await fetch("/api/alerts?id=all", { method: "DELETE" });
      if (onNotify) {
        onNotify("All Alerts Cleared", "All operational alerts acknowledged and cleared.", "info");
      }
      logEvent("All operational alerts dismissed.", "info");
    } catch (e) {
      console.warn("Failed to dismiss all alerts:", e);
    } finally {
      setIsDismissingAll(false);
    }
  };

  // Quick 1-click clinical resolution handler
  const handleResolveAlert = async (alt: AlertItem) => {
    if (alt.id === "ALT-SIM-ANALYZER") {
      await handleRecover("ANALYZER_MAINTENANCE", "Sysmex XN-1000");
      return;
    }
    if (alt.id === "ALT-SIM-REJ") {
      await handleRecover("SAMPLE_REJECTION", "Redraw Requisition");
      return;
    }
    if (alt.id === "ALT-SIM-TAT") {
      await handleRecover("TAT_BREACH", "SLA Resolved");
      return;
    }
    if (alt.id === "ALT-SIM-DLQ") {
      await handleRecover("DELIVERY_FAILURE", "DLQ Notification");
      return;
    }

    // Regular alerts
    handleDismiss(alt.id);
    if (alt.category === "Delayed") {
      if (onNotify) {
        onNotify("STAT Priority Escalated", `Order ${alt.entityId} dispatched to priority STAT lane. Turnaround clock reset.`, "success");
      }
      logEvent(`STAT delay for ${alt.entityId} escalated and resolved.`, "success");
    } else if (alt.category === "Rejected") {
      if (onNotify) {
        onNotify("Redraw Dispatched", `Redraw barcode printed for ${alt.entityId}. Phlebotomy requisition logged.`, "success");
      }
      logEvent(`Specimen rejection for ${alt.entityId} resolved. Redraw order created.`, "success");
    } else if (alt.category === "Critical") {
      if (onNotify) {
        onNotify("Critical Value Paged", `Attending physician paged for ${alt.entityId}. Clinical exception logged.`, "success");
      }
      logEvent(`Critical panic value for ${alt.entityId} acknowledged and paged.`, "success");
    } else {
      if (onNotify) {
        onNotify("Alert Resolved", `Operational exception for ${alt.entityId} resolved.`, "success");
      }
      logEvent(`Alert ${alt.id} resolved.`, "success");
    }
  };

  // Trigger real failure simulation via backend
  const handleSimulate = async (scenario: string, label: string) => {
    setIsSimulating(scenario);
    logEvent(`Initiating Chaos Simulation: [${scenario}] - ${label}`, "info");

    try {
      const res = await fetch("/api/resilience", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "simulate", scenario }),
      });
      const data = await res.json();

      if (res.ok) {
        const impactText = data.result?.impact || data.result?.reason || data.result?.status || "Triggered successfully";
        logEvent(`Simulation Activated: ${impactText}`, "error");

        if (scenario === "DUPLICATE_ORDER") {
          setCardFeedback((prev) => ({
            ...prev,
            DUPLICATE_ORDER: {
              type: "info",
              text: "HTTP 409 Intercepted: Duplicate CBC order within 5m debounce rejected by Idempotency Key Guard.",
            },
          }));
        } else if (scenario === "INVALID_TRANSITION") {
          setCardFeedback((prev) => ({
            ...prev,
            INVALID_TRANSITION: {
              type: "error",
              text: "HTTP 400 Blocked: Illegal state jump ORDERED → RELEASED prevented. Strict clinical sequence enforced.",
            },
          }));
        }

        if (onNotify) {
          onNotify("Resilience Scenario Triggered", `Activated: ${label}`, "warning");
        }

        // Refresh alerts from backend
        await fetchAlerts();
        if (scenario === "DELIVERY_FAILURE") {
          await fetchQueueData();
        }
      } else {
        logEvent(`Simulation Error: ${data.error}`, "error");
      }
    } catch (err) {
      logEvent(`Failed to dispatch simulation: ${String(err)}`, "error");
    } finally {
      setIsSimulating(null);
    }
  };

  // Recover simulated failure via backend
  const handleRecover = async (scenario: string, label: string) => {
    setIsRecovering(scenario);
    logEvent(`Initiating Automated Recovery Sequence: [${scenario}]`, "info");

    try {
      const res = await fetch("/api/resilience", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "recover", scenario }),
      });
      const data = await res.json();

      if (res.ok) {
        logEvent(`Recovery Successful: ${data.result?.message || "Restored to nominal state"}`, "success");
        if (onNotify) {
          onNotify("System Recovered", `${label} restored to nominal operating state.`, "success");
        }
        if (scenario === "ALL") {
          setCardFeedback({});
        } else {
          setCardFeedback((prev) => {
            const next = { ...prev };
            delete next[scenario];
            return next;
          });
        }
        await fetchAlerts();
        await fetchQueueData();
      }
    } catch (err) {
      logEvent(`Recovery Error: ${String(err)}`, "error");
    } finally {
      setIsRecovering(null);
    }
  };

  // Retry Dead-Letter Queue Job via backend
  const handleRetryJob = async (jobId: string) => {
    setRetryingJobId(jobId);
    logEvent(`Retrying Dead-Letter Queue (DLQ) Job ${jobId}...`, "info");

    try {
      const res = await fetch("/api/queues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "retry_job", jobId }),
      });
      const data = await res.json();

      if (res.ok) {
        logEvent(`Job ${jobId} successfully re-dispatched! Status: Delivered (SMTP 250 OK)`, "success");
        if (onNotify) {
          onNotify("DLQ Job Recovered", `Job ${jobId} delivered successfully.`, "success");
        }
        await fetchQueueData();
        await fetchAlerts();
      } else {
        logEvent(`Retry failed for ${jobId}: ${data.error}`, "error");
      }
    } catch (err) {
      logEvent(`DLQ retry failed: ${String(err)}`, "error");
    } finally {
      setRetryingJobId(null);
    }
  };

  // Process / Deliver an individual pending job
  const handleProcessJob = async (jobId: string) => {
    setProcessingJobId(jobId);
    logEvent(`Processing & dispatching job ${jobId}...`, "info");

    try {
      const res = await fetch("/api/queues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "process_job", jobId }),
      });
      const data = await res.json();

      if (res.ok) {
        logEvent(`Job ${jobId} processed and delivered!`, "success");
        if (onNotify) {
          onNotify("Job Delivered", `Message job ${jobId} dispatched and delivered.`, "success");
        }
        await fetchQueueData();
      }
    } catch (err) {
      logEvent(`Job processing failed: ${String(err)}`, "error");
    } finally {
      setProcessingJobId(null);
    }
  };

  // Flush all queues & deliver all pending/failed jobs
  const handleFlushAllQueues = async () => {
    setIsFlushingQueue(true);
    logEvent("Flushing all BullMQ queues & clearing Dead-Letter backlog...", "info");

    try {
      const res = await fetch("/api/queues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "flush_queue" }),
      });
      const data = await res.json();

      if (res.ok) {
        logEvent(`Bulk Queue Flush Complete: ${data.result?.message || "All jobs delivered"}`, "success");
        if (onNotify) {
          onNotify("Queues Flushed", `Delivered ${data.result?.count ?? "all"} queued jobs. Backlog zeroed.`, "success");
        }
        await fetchQueueData();
        await fetchAlerts();
      }
    } catch (err) {
      logEvent(`Queue flush failed: ${String(err)}`, "error");
    } finally {
      setIsFlushingQueue(false);
    }
  };

  // Dispatch a simulated test job (Email or WhatsApp)
  const handleDispatchTestJob = async (channel: "EMAIL" | "WHATSAPP") => {
    setIsDispatchingTest(channel);
    logEvent(`Enqueueing simulated ${channel} notification into BullMQ worker pool...`, "info");

    try {
      const res = await fetch("/api/queues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "dispatch_test_job", channel }),
      });
      const data = await res.json();

      if (res.ok) {
        logEvent(`Test ${channel} job enqueued and delivered (ID: ${data.result?.id})`, "success");
        if (onNotify) {
          onNotify("Test Job Enqueued", `Simulated ${channel} notification dispatched to ${data.result?.recipientEmail || data.result?.recipientPhone}.`, "success");
        }
        await fetchQueueData();
      }
    } catch (err) {
      logEvent(`Failed to dispatch test job: ${String(err)}`, "error");
    } finally {
      setIsDispatchingTest(null);
    }
  };

  // Filter alerts by category
  const categories = [
    { id: "ALL", label: "All Categories" },
    { id: "Critical", label: "Critical" },
    { id: "Delayed", label: "Delayed" },
    { id: "Rejected", label: "Rejected" },
    { id: "Pending Review", label: "Pending Review" },
    { id: "Information", label: "Information" },
  ];

  const filteredAlerts = localAlerts.filter((alt) => {
    if (activeCategory === "ALL") return true;
    return alt.category === activeCategory;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Critical":
        return <AlertOctagon className="w-5 h-5 text-red-600 shrink-0" />;
      case "Delayed":
        return <Clock className="w-5 h-5 text-amber-600 shrink-0" />;
      case "Rejected":
        return <XCircle className="w-5 h-5 text-red-500 shrink-0" />;
      case "Pending Review":
        return <FileCheck2 className="w-5 h-5 text-blue-600 shrink-0" />;
      default:
        return <Info className="w-5 h-5 text-slate-500 shrink-0" />;
    }
  };

  const dlqCount = queueJobs.filter((j) => j.status === "Failed").length;
  const isDriftActive = localAlerts.some((a) => a.id === "ALT-SIM-ANALYZER");
  const isRejectionActive = localAlerts.some((a) => a.id === "ALT-SIM-REJ");
  const isTatActive = localAlerts.some((a) => a.id === "ALT-SIM-TAT");
  const isDlqActive = localAlerts.some((a) => a.id === "ALT-SIM-DLQ") || dlqCount > 0;

  const healthScore = Math.max(
    70,
    100 - localAlerts.filter((a) => a.category === "Critical").length * 6 - (dlqCount > 0 ? 5 : 0)
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto font-sans">
      {/* HEADER WITH RESILIENCE BADGES */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Failure Handling & Async Queue Center
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 border border-indigo-200 uppercase tracking-wide">
              Phase 3 Ready
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Operational exceptions, multi-analyzer failure handling, SLA breach escalation, chaos simulations, and BullMQ asynchronous message dispatch.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-xs flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-600 animate-pulse" />
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block leading-none">System Health</span>
              <span className="text-xs font-bold text-slate-800">{healthScore}% Integrity</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-xs flex items-center gap-2">
            <Server className="w-4 h-4 text-indigo-600" />
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block leading-none">DLQ Backlog</span>
              <span className={`text-xs font-bold ${dlqCount > 0 ? "text-red-600 font-mono" : "text-emerald-600"}`}>
                {dlqCount} In Dead-Letter
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* MASTER VIEW TABS */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-200">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("ALERTS")}
            className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "ALERTS"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <AlertOctagon className="w-4 h-4" />
            <span>Active Operational Alerts</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
              localAlerts.length > 0 ? "bg-red-100 text-red-700 font-bold" : "bg-slate-100 text-slate-500"
            }`}>
              {localAlerts.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("RESILIENCE")}
            className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "RESILIENCE"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Flame className="w-4 h-4 text-amber-500" />
            <span>Chaos & Resilience Simulator</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-800 font-semibold font-mono">
              6 Tests
            </span>
          </button>

          <button
            onClick={() => setActiveTab("QUEUES")}
            className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "QUEUES"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Layers className="w-4 h-4 text-sky-500" />
            <span>Async Message Queues & Workers</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-sky-100 text-sky-800 font-semibold font-mono">
              Topology
            </span>
          </button>
        </div>

        {activeTab === "QUEUES" && (
          <button
            onClick={fetchQueueData}
            disabled={isLoadingQueues}
            className="text-xs text-slate-600 hover:text-indigo-600 font-medium flex items-center gap-1.5 pb-2 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingQueues ? "animate-spin" : ""}`} />
            <span>Refresh Queues</span>
          </button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: OPERATIONAL ALERTS & PANIC VALUES */}
      {/* ========================================================================= */}
      {activeTab === "ALERTS" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* CATEGORY FILTER PILLS & GLOBAL ACTIONS */}
          <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs">
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => {
                const active = activeCategory === cat.id;
                const count = cat.id === "ALL" ? localAlerts.length : localAlerts.filter((a) => a.category === cat.id).length;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                      active
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    <span>{cat.label}</span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                      active ? "bg-indigo-700 text-white" : "bg-slate-200 text-slate-700"
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              {localAlerts.length > 0 && (
                <button
                  onClick={handleDismissAll}
                  disabled={isDismissingAll}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-red-700 hover:bg-red-50 border border-slate-200 hover:border-red-200 transition-colors flex items-center gap-1 cursor-pointer"
                  title="Dismiss all active alerts"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Dismiss All</span>
                </button>
              )}
              <button
                onClick={fetchAlerts}
                disabled={isLoadingAlerts}
                className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Refresh alerts"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingAlerts ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>

          {/* ALERTS LIST */}
          <div className="space-y-3">
            {filteredAlerts.length === 0 ? (
              <div className="bg-white p-12 rounded-xl border border-slate-200 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <h3 className="text-sm font-bold text-slate-800">No Active Alerts</h3>
                <p className="text-xs text-slate-500">
                  All laboratory operations and testing workstations operating within nominal safety thresholds.
                </p>
              </div>
            ) : (
              filteredAlerts.map((alt) => (
                <div
                  key={alt.id}
                  className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                    alt.category === "Critical"
                      ? "border-red-300 bg-red-50/40 border-l-4 border-l-red-600"
                      : alt.category === "Delayed"
                      ? "border-amber-300 bg-amber-50/40 border-l-4 border-l-amber-500"
                      : alt.category === "Rejected"
                      ? "border-rose-300 bg-rose-50/30 border-l-4 border-l-rose-500"
                      : alt.category === "Pending Review"
                      ? "border-sky-300 bg-sky-50/30 border-l-4 border-l-sky-500"
                      : "border-slate-200 bg-white border-l-4 border-l-slate-400"
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    {getCategoryIcon(alt.category)}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-xs font-bold text-slate-900">{alt.title}</h3>
                        <span className="font-mono text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200 font-semibold">
                          {alt.entityId}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">{alt.timestamp}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{alt.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    {alt.id === "ALT-SIM-ANALYZER" ? (
                      <button
                        onClick={() => handleRecover("ANALYZER_MAINTENANCE", "Sysmex XN-1000")}
                        disabled={isRecovering === "ANALYZER_MAINTENANCE"}
                        className="px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isRecovering === "ANALYZER_MAINTENANCE" ? "animate-spin" : ""}`} />
                        <span>Recalibrate & Restore</span>
                      </button>
                    ) : alt.id === "ALT-SIM-REJ" ? (
                      <button
                        onClick={() => handleRecover("SAMPLE_REJECTION", "Redraw Requisition")}
                        disabled={isRecovering === "SAMPLE_REJECTION"}
                        className="px-3 py-1.5 text-xs font-bold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <RotateCcw className={`w-3.5 h-3.5 ${isRecovering === "SAMPLE_REJECTION" ? "animate-spin" : ""}`} />
                        <span>Dispatch Redraw Requisition</span>
                      </button>
                    ) : alt.id === "ALT-SIM-TAT" ? (
                      <button
                        onClick={() => handleRecover("TAT_BREACH", "SLA Resolved")}
                        disabled={isRecovering === "TAT_BREACH"}
                        className="px-3 py-1.5 text-xs font-bold rounded-lg bg-amber-600 text-white hover:bg-amber-700 shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>Expedite STAT & Clear</span>
                      </button>
                    ) : alt.id === "ALT-SIM-DLQ" ? (
                      <button
                        onClick={() => handleRecover("DELIVERY_FAILURE", "DLQ Notification")}
                        disabled={isRecovering === "DELIVERY_FAILURE"}
                        className="px-3 py-1.5 text-xs font-bold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Retry DLQ Delivery</span>
                      </button>
                    ) : (
                      <>
                        {alt.category === "Delayed" && (
                          <button
                            onClick={() => handleResolveAlert(alt)}
                            className="px-3 py-1.5 text-xs font-bold rounded-lg bg-amber-600 text-white hover:bg-amber-700 shadow-xs flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Zap className="w-3.5 h-3.5" />
                            <span>Expedite STAT Lane</span>
                          </button>
                        )}

                        {alt.category === "Rejected" && (
                          <button
                            onClick={() => handleResolveAlert(alt)}
                            className="px-3 py-1.5 text-xs font-bold rounded-lg bg-rose-600 text-white hover:bg-rose-700 shadow-xs flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Dispatch Redraw</span>
                          </button>
                        )}

                        {alt.category === "Critical" && (
                          <button
                            onClick={() => handleResolveAlert(alt)}
                            className="px-3 py-1.5 text-xs font-bold rounded-lg bg-red-600 text-white hover:bg-red-700 shadow-xs flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Acknowledge & Page MD</span>
                          </button>
                        )}

                        {alt.category === "Pending Review" && (
                          <button
                            onClick={() => onNavigateToView("results")}
                            className="px-3 py-1.5 text-xs font-bold rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-xs flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <FileCheck2 className="w-3.5 h-3.5" />
                            <span>Review Results</span>
                          </button>
                        )}

                        {alt.actionable && alt.category !== "Pending Review" && (
                          <button
                            onClick={() => {
                              if (alt.category === "Rejected") onNavigateToView("samples");
                              else onNavigateToView("orders");
                            }}
                            className="px-2.5 py-1.5 text-xs font-medium rounded-lg text-indigo-700 hover:bg-indigo-50 border border-indigo-200 transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <span>Inspect</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </button>
                        )}
                      </>
                    )}

                    <button
                      onClick={() => handleDismiss(alt.id)}
                      className="px-2.5 py-1.5 text-xs font-medium rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Dismiss Alert"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: CHAOS & RESILIENCE SIMULATOR (PHASE 3 SHOWCASE) */}
      {/* ========================================================================= */}
      {activeTab === "RESILIENCE" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* BANNER */}
          <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl p-6 text-white shadow-lg border border-slate-800">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono text-amber-400 bg-amber-950/80 border border-amber-800 px-2.5 py-1 rounded font-bold uppercase tracking-wider">
                  Phase 3 • Production Reliability & Chaos Suite
                </span>
                <h2 className="text-lg font-bold mt-2">
                  Interactive Laboratory Fault Injection & Recovery Simulator
                </h2>
                <p className="text-xs text-slate-300 max-w-2xl mt-1 leading-relaxed">
                  Demonstrates the platform&apos;s ability to detect, mitigate, and recover from real-world diagnostic failure modes including hardware sensor drifts, pre-analytical sample rejections, turnaround-time breaches, duplicate submissions, and network delivery drops.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    handleRecover("ALL", "All Scenarios");
                    setSimulationLogs([]);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-white transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All Scenarios</span>
                </button>
              </div>
            </div>
          </div>

          {/* SIMULATION TEST SUITE GRID (6 SCENARIOS) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* 1. ANALYZER MAINTENANCE & SENSOR DRIFT */}
            <div className={`bg-white rounded-xl border p-4 shadow-xs flex flex-col justify-between space-y-3 transition-all ${
              isDriftActive ? "border-red-400 bg-red-50/20 ring-1 ring-red-400" : "border-slate-200"
            }`}>
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 uppercase">
                    Hardware Fault
                  </span>
                  {isDriftActive ? (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-800 border border-red-300 animate-pulse uppercase">
                      ● Fault Active
                    </span>
                  ) : (
                    <Cpu className="w-4 h-4 text-slate-400" />
                  )}
                </div>
                <h3 className="text-sm font-bold text-slate-900 mt-2">
                  Analyzer Sensor Drift & Maintenance
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Simulates optical flow sensor drift exceeding ±2.5 SD on the Sysmex XN-1000. Ingestion halts and pending tubes divert to backup.
                </p>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                <button
                  onClick={() => handleSimulate("ANALYZER_MAINTENANCE", "Analyzer Drift")}
                  disabled={isSimulating === "ANALYZER_MAINTENANCE" || isDriftActive}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-colors cursor-pointer text-center ${
                    isDriftActive
                      ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                      : "bg-red-50 text-red-700 hover:bg-red-100 border-red-200"
                  }`}
                >
                  {isSimulating === "ANALYZER_MAINTENANCE" ? "Injecting..." : "Simulate Drift"}
                </button>
                <button
                  onClick={() => handleRecover("ANALYZER_MAINTENANCE", "Sysmex Analyzer")}
                  disabled={isRecovering === "ANALYZER_MAINTENANCE"}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-colors cursor-pointer text-center ${
                    isDriftActive
                      ? "bg-emerald-600 text-white hover:bg-emerald-700 border-emerald-600 shadow-xs"
                      : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200"
                  }`}
                >
                  {isRecovering === "ANALYZER_MAINTENANCE" ? "Restoring..." : "Recalibrate"}
                </button>
              </div>
            </div>

            {/* 2. PRE-ANALYTICAL SAMPLE REJECTION */}
            <div className={`bg-white rounded-xl border p-4 shadow-xs flex flex-col justify-between space-y-3 transition-all ${
              isRejectionActive ? "border-rose-400 bg-rose-50/20 ring-1 ring-rose-400" : "border-slate-200"
            }`}>
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 uppercase">
                    Pre-Analytical
                  </span>
                  {isRejectionActive ? (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-300 animate-pulse uppercase">
                      ● Rejection Active
                    </span>
                  ) : (
                    <XCircle className="w-4 h-4 text-slate-400" />
                  )}
                </div>
                <h3 className="text-sm font-bold text-slate-900 mt-2">
                  Specimen Rejection & Auto-Redraw
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Simulates in-vitro gross hemolysis (Index &gt; 500 mg/dL). Rejects tube, appends rejection chain-of-custody, and triggers automated redraw requisition.
                </p>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                <button
                  onClick={() => handleSimulate("SAMPLE_REJECTION", "Gross Hemolysis Rejection")}
                  disabled={isSimulating === "SAMPLE_REJECTION" || isRejectionActive}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-colors cursor-pointer text-center ${
                    isRejectionActive
                      ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                      : "bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-200"
                  }`}
                >
                  {isSimulating === "SAMPLE_REJECTION" ? "Rejecting..." : "Reject Tube"}
                </button>
                <button
                  onClick={() => handleRecover("SAMPLE_REJECTION", "Redraw Dispatched")}
                  disabled={isRecovering === "SAMPLE_REJECTION"}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-colors cursor-pointer text-center ${
                    isRejectionActive
                      ? "bg-indigo-600 text-white hover:bg-indigo-700 border-indigo-600 shadow-xs"
                      : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200"
                  }`}
                >
                  {isRecovering === "SAMPLE_REJECTION" ? "Dispatching..." : "Dispatch Redraw"}
                </button>
              </div>
            </div>

            {/* 3. TAT SLA BREACH & DELAY ESCALATION */}
            <div className={`bg-white rounded-xl border p-4 shadow-xs flex flex-col justify-between space-y-3 transition-all ${
              isTatActive ? "border-amber-400 bg-amber-50/20 ring-1 ring-amber-400" : "border-slate-200"
            }`}>
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 uppercase">
                    Turnaround Time
                  </span>
                  {isTatActive ? (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300 animate-pulse uppercase">
                      ● SLA Breached
                    </span>
                  ) : (
                    <Clock className="w-4 h-4 text-slate-400" />
                  )}
                </div>
                <h3 className="text-sm font-bold text-slate-900 mt-2">
                  STAT SLA Breach & Auto-Escalation
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Simulates a 73m elapsed processing time against a 45m SLA. Escalates queue priority to STAT OVERDUE and generates doctor notification.
                </p>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                <button
                  onClick={() => handleSimulate("TAT_BREACH", "STAT SLA Breach")}
                  disabled={isSimulating === "TAT_BREACH" || isTatActive}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-colors cursor-pointer text-center ${
                    isTatActive
                      ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                      : "bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200"
                  }`}
                >
                  {isSimulating === "TAT_BREACH" ? "Breaching..." : "Simulate Breach"}
                </button>
                <button
                  onClick={() => handleRecover("TAT_BREACH", "SLA Resolved")}
                  disabled={isRecovering === "TAT_BREACH"}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-colors cursor-pointer text-center ${
                    isTatActive
                      ? "bg-amber-600 text-white hover:bg-amber-700 border-amber-600 shadow-xs"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-300"
                  }`}
                >
                  {isRecovering === "TAT_BREACH" ? "Clearing..." : "Clear Breach"}
                </button>
              </div>
            </div>

            {/* 4. DUPLICATE ORDER IDEMPOTENCY GUARD */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                    API Idempotency
                  </span>
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mt-2">
                  Duplicate Order Interception
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Simulates a duplicate test submission for the same patient within 5 mins. Idempotency middleware intercepts and prevents double billing.
                </p>
                {cardFeedback["DUPLICATE_ORDER"] && (
                  <div className="mt-2 p-2 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-[11px] font-medium leading-snug animate-in fade-in">
                    {cardFeedback["DUPLICATE_ORDER"].text}
                  </div>
                )}
              </div>
              <div className="pt-2 border-t border-slate-100">
                <button
                  onClick={() => handleSimulate("DUPLICATE_ORDER", "Duplicate Order Interception")}
                  disabled={isSimulating === "DUPLICATE_ORDER"}
                  className="w-full py-1.5 text-xs font-bold rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors cursor-pointer text-center"
                >
                  {isSimulating === "DUPLICATE_ORDER" ? "Testing Interception..." : "Test Idempotency Interception"}
                </button>
              </div>
            </div>

            {/* 5. INVALID STATE TRANSITION VIOLATION */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 uppercase">
                    State Invariant
                  </span>
                  <Sliders className="w-4 h-4 text-purple-600" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mt-2">
                  Illegal State Transition Violation
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Attempts to jump an un-analyzed tube from ORDERED directly to RELEASED. Core state-machine guard intercepts and enforces clinical protocol.
                </p>
                {cardFeedback["INVALID_TRANSITION"] && (
                  <div className="mt-2 p-2 rounded-lg bg-purple-50 border border-purple-200 text-purple-800 text-[11px] font-medium leading-snug animate-in fade-in">
                    {cardFeedback["INVALID_TRANSITION"].text}
                  </div>
                )}
              </div>
              <div className="pt-2 border-t border-slate-100">
                <button
                  onClick={() => handleSimulate("INVALID_TRANSITION", "Illegal State Transition")}
                  disabled={isSimulating === "INVALID_TRANSITION"}
                  className="w-full py-1.5 text-xs font-bold rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 transition-colors cursor-pointer text-center"
                >
                  {isSimulating === "INVALID_TRANSITION" ? "Testing Invariant..." : "Test State-Machine Guard"}
                </button>
              </div>
            </div>

            {/* 6. NOTIFICATION TIMEOUT & DEAD-LETTER QUEUE (DLQ) */}
            <div className={`bg-white rounded-xl border p-4 shadow-xs flex flex-col justify-between space-y-3 transition-all ${
              isDlqActive ? "border-red-400 bg-red-50/20 ring-1 ring-red-400" : "border-slate-200"
            }`}>
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 uppercase">
                    Queue & DLQ
                  </span>
                  {isDlqActive ? (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-800 border border-red-300 animate-pulse uppercase">
                      ● {dlqCount} In DLQ
                    </span>
                  ) : (
                    <Mail className="w-4 h-4 text-slate-400" />
                  )}
                </div>
                <h3 className="text-sm font-bold text-slate-900 mt-2">
                  SMTP Timeout & DLQ Auto-Retry
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Simulates an external email gateway failure. Job moves to Dead-Letter Queue (DLQ) with exponential backoff (2s, 4s, 8s) and manual retry hook.
                </p>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                <button
                  onClick={() => handleSimulate("DELIVERY_FAILURE", "Notification Timeout")}
                  disabled={isSimulating === "DELIVERY_FAILURE"}
                  className="flex-1 py-1.5 text-xs font-bold rounded-lg bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 transition-colors cursor-pointer text-center"
                >
                  {isSimulating === "DELIVERY_FAILURE" ? "Failing..." : "Simulate Timeout"}
                </button>
                <button
                  onClick={() => {
                    setActiveTab("QUEUES");
                    fetchQueueData();
                  }}
                  className="flex-1 py-1.5 text-xs font-bold rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer text-center flex items-center justify-center gap-1"
                >
                  <span>Inspect in DLQ</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* LIVE SIMULATION CONSOLE LOGS */}
          <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 shadow-md font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-bold text-slate-300">Live Resilience & Chaos Telemetry Stream</span>
              </div>
              <span className="text-[10px] text-slate-500">Real-time Ingestion • HTTP 200/409/503 Validation</span>
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {simulationLogs.length === 0 ? (
                <div className="text-slate-500 text-center py-4">
                  Select any simulation scenario card above to observe real-time fault injection and automated recovery behavior.
                </div>
              ) : (
                simulationLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-2">
                    <span className="text-slate-500 shrink-0">[{log.time}]</span>
                    <span
                      className={`break-all ${
                        log.type === "error"
                          ? "text-red-400 font-semibold"
                          : log.type === "success"
                          ? "text-emerald-400 font-semibold"
                          : "text-sky-300"
                      }`}
                    >
                      {log.text}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: ASYNC MESSAGE QUEUES & WORKER TOPOLOGY (PHASE 3 REQUIREMENT) */}
      {/* ========================================================================= */}
      {activeTab === "QUEUES" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* ARCHITECTURE TOPOLOGY VISUAL (INTERACTIVE SVG COMPONENT) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-sky-700 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded uppercase">
                  Architecture Visual • Asynchronous Pipeline
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-1">
                  Event-Driven Message Queue & Worker Broker Topology
                </h3>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Broker: BullMQ / Redis</span>
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-indigo-500" />
                  <span>Concurrency: 22 Workers</span>
                </span>
              </div>
            </div>

            {/* FLOW VISUAL */}
            <div className="bg-slate-900 rounded-xl p-6 text-white overflow-x-auto">
              <div className="min-w-[700px] flex items-center justify-between gap-4 text-xs font-mono">
                {/* 1. LIMS PRODUCER */}
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-center w-40 shrink-0">
                  <span className="text-[10px] text-indigo-400 font-bold block">PRODUCER</span>
                  <span className="font-bold text-white text-xs block mt-1">LIMS Core Engine</span>
                  <span className="text-[9px] text-slate-400 block mt-0.5">Order/Report Events</span>
                </div>

                <ChevronRight className="w-5 h-5 text-slate-500 shrink-0" />

                {/* 2. REDIS QUEUE BROKER */}
                <div className="bg-indigo-950 border border-indigo-700 rounded-lg p-3 text-center w-44 shrink-0 shadow-lg shadow-indigo-950">
                  <span className="text-[10px] text-indigo-300 font-bold block">MESSAGE BROKER</span>
                  <span className="font-bold text-indigo-100 text-xs block mt-1">Redis 7.2 Cluster</span>
                  <span className="text-[9px] text-indigo-300 block mt-0.5">BullMQ In-Memory Queue</span>
                </div>

                <ChevronRight className="w-5 h-5 text-slate-500 shrink-0" />

                {/* 3. PARALLEL WORKERS */}
                <div className="space-y-2 flex-1">
                  <div className="bg-slate-800 border border-slate-700 rounded p-2 flex items-center justify-between">
                    <span className="text-[11px] text-slate-200">📧 email-dispatch (4x)</span>
                    <span className="text-[9px] text-emerald-400 font-bold">25 jobs/s</span>
                  </div>
                  <div className="bg-slate-800 border border-slate-700 rounded p-2 flex items-center justify-between">
                    <span className="text-[11px] text-slate-200">📱 whatsapp-notify (6x)</span>
                    <span className="text-[9px] text-emerald-400 font-bold">80 jobs/s</span>
                  </div>
                  <div className="bg-slate-800 border border-slate-700 rounded p-2 flex items-center justify-between">
                    <span className="text-[11px] text-slate-200">🔬 telemetry-ingest (10x)</span>
                    <span className="text-[9px] text-emerald-400 font-bold">120 events/s</span>
                  </div>
                  <div className="bg-slate-800 border border-slate-700 rounded p-2 flex items-center justify-between">
                    <span className="text-[11px] text-slate-200">📄 pdf-render (2x)</span>
                    <span className="text-[9px] text-emerald-400 font-bold">10 renders/s</span>
                  </div>
                </div>

                <ChevronRight className="w-5 h-5 text-slate-500 shrink-0" />

                {/* 4. SINKS & DLQ */}
                <div className="space-y-2 w-44 shrink-0">
                  <div className="bg-emerald-950 border border-emerald-800 rounded p-2 text-center">
                    <span className="text-[10px] text-emerald-300 font-bold block">OUTPUT GATEWAYS</span>
                    <span className="text-[9px] text-emerald-200 block">SMTP • WhatsApp • S3</span>
                  </div>
                  <div className="bg-red-950 border border-red-800 rounded p-2 text-center">
                    <span className="text-[10px] text-red-300 font-bold block">DEAD-LETTER QUEUE</span>
                    <span className="text-[9px] text-red-200 block">Max 3 Retries + Alerting</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* QUEUES OVERVIEW METRICS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {queues.map((q) => (
              <div key={q.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded uppercase">
                    {q.driver}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-900">{q.name}</h4>
                  <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{q.id}</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center bg-slate-50 p-2 rounded-lg border border-slate-100 font-mono text-[10px]">
                  <div>
                    <span className="text-slate-400 block">Workers</span>
                    <span className="font-bold text-slate-800">{q.concurrency}x</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Done</span>
                    <span className="font-bold text-emerald-600">{q.completed}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Failed</span>
                    <span className={`font-bold ${q.failed > 0 ? "text-red-600" : "text-slate-600"}`}>{q.failed}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1">
                  <span>Latency: ~{q.latencyAvgMs}ms</span>
                  <span>Rate: {q.rateLimit}</span>
                </div>
              </div>
            ))}
          </div>

          {/* ASYNC DISPATCH LOG & DEAD-LETTER QUEUE TABLE */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h3 className="text-xs font-bold text-slate-900">
                  Recent Message Queue Jobs & Dead-Letter Telemetry
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Live record of all email, WhatsApp notifications, pending jobs, and Dead-Letter Queue (DLQ) retry attempts.
                </p>
              </div>

              {/* ACTION BUTTONS FOR QUEUES */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => handleDispatchTestJob("EMAIL")}
                  disabled={isDispatchingTest === "EMAIL"}
                  className="px-2.5 py-1.5 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>{isDispatchingTest === "EMAIL" ? "Sending..." : "+ Test Email"}</span>
                </button>
                <button
                  onClick={() => handleDispatchTestJob("WHATSAPP")}
                  disabled={isDispatchingTest === "WHATSAPP"}
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isDispatchingTest === "WHATSAPP" ? "Sending..." : "+ Test WhatsApp"}</span>
                </button>
                <button
                  onClick={handleFlushAllQueues}
                  disabled={isFlushingQueue}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                >
                  <Zap className={`w-3.5 h-3.5 ${isFlushingQueue ? "animate-spin" : ""}`} />
                  <span>{isFlushingQueue ? "Flushing..." : "Flush Queues & Deliver All"}</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-2.5">Job ID</th>
                    <th className="px-4 py-2.5">Channel</th>
                    <th className="px-4 py-2.5">Recipient</th>
                    <th className="px-4 py-2.5">Report ID</th>
                    <th className="px-4 py-2.5">Timestamp</th>
                    <th className="px-4 py-2.5">Status</th>
                    <th className="px-4 py-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {queueJobs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-slate-400 text-xs font-sans">
                        No asynchronous dispatch jobs currently in queue. Click &quot;+ Test Email&quot; or &quot;+ Test WhatsApp&quot; above to dispatch a job.
                      </td>
                    </tr>
                  ) : (
                    queueJobs.map((job) => (
                      <tr key={job.id} className="hover:bg-slate-50 transition-colors font-sans">
                        <td className="px-4 py-3 font-mono text-xs font-bold text-slate-900">{job.id}</td>
                        <td className="px-4 py-3">
                          {job.channel === "EMAIL" ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                              <Mail className="w-3 h-3" />
                              <span>EMAIL</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              <Send className="w-3 h-3" />
                              <span>WHATSAPP</span>
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-700">
                          <div>
                            <span className="font-medium text-slate-900 block">{job.recipient}</span>
                            <span className="text-[10px] text-slate-400">{job.recipientName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-indigo-600 font-semibold">{job.reportId}</td>
                        <td className="px-4 py-3 text-xs text-slate-500 font-mono">{job.timestamp}</td>
                        <td className="px-4 py-3">
                          {job.status === "Delivered" ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Delivered</span>
                            </span>
                          ) : job.status === "Failed" ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200 animate-pulse">
                              <XCircle className="w-3 h-3" />
                              <span>In DLQ</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              <Clock className="w-3 h-3" />
                              <span>Pending / Processing</span>
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {job.status === "Failed" ? (
                            <button
                              onClick={() => handleRetryJob(job.id)}
                              disabled={retryingJobId === job.id}
                              className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-red-600 hover:bg-red-700 text-white shadow-xs transition-colors flex items-center gap-1 ml-auto cursor-pointer"
                            >
                              <RotateCcw className={`w-3 h-3 ${retryingJobId === job.id ? "animate-spin" : ""}`} />
                              <span>Retry DLQ Job</span>
                            </button>
                          ) : job.status !== "Delivered" ? (
                            <button
                              onClick={() => handleProcessJob(job.id)}
                              disabled={processingJobId === job.id}
                              className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors flex items-center gap-1 ml-auto cursor-pointer"
                            >
                              <Play className={`w-3 h-3 ${processingJobId === job.id ? "animate-spin" : ""}`} />
                              <span>Deliver Now</span>
                            </button>
                          ) : (
                            <span className="text-[10px] font-mono text-emerald-600 font-bold">ACK 250 OK</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
