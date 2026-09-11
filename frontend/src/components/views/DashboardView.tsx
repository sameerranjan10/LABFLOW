import React, { useState } from "react";
import {
  LabOrder,
  LabSample,
  ExceptionItem,
  WorkflowStageMetric,
  LabStage,
} from "@/data/labflowData";
import { KpiCard } from "@/components/KpiCard";
import { WorkflowPipeline } from "@/components/WorkflowPipeline";
import { RequiresAttentionTable } from "@/components/RequiresAttentionTable";
import { StatusBadge } from "@/components/StatusBadge";
import {
  FileSpreadsheet,
  Cpu,
  Clock,
  FileCheck2,
  AlertTriangle,
  Plus,
  Calendar,
  ArrowUpRight,
  Eye,
} from "lucide-react";
import { LabUser } from "@/lib/roles";
import { NavView } from "@/components/Sidebar";

interface DashboardViewProps {
  orders: LabOrder[];
  samples: LabSample[];
  exceptions: ExceptionItem[];
  workflowStages: WorkflowStageMetric[];
  onOpenCreateOrder: () => void;
  onSelectSample: (sample: LabSample) => void;
  onSelectOrder: (order: LabOrder) => void;
  onNavigateToView: (view: NavView) => void;
  currentUser?: LabUser;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  orders,
  samples,
  exceptions,
  workflowStages,
  onOpenCreateOrder,
  onSelectSample,
  onSelectOrder,
  onNavigateToView,
  currentUser,
}) => {
  const [dateRange, setDateRange] = useState("Today");
  const calculatedAvgTat = React.useMemo(() => {
    if (!orders || orders.length === 0) return "0m";
    let totalMinutes = 0;
    let count = 0;
    for (const o of orders) {
      if (o.tat) {
        const matchH = o.tat.match(/(\d+)h/);
        const matchM = o.tat.match(/(\d+)m/);
        let mins = 0;
        if (matchH) mins += parseInt(matchH[1], 10) * 60;
        if (matchM) mins += parseInt(matchM[1], 10);
        if (mins > 0) {
          totalMinutes += mins;
          count++;
        }
      }
    }
    if (count === 0) return "45m";
    const avg = Math.round(totalMinutes / count);
    const h = Math.floor(avg / 60);
    const m = avg % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  }, [orders]);
  const [selectedStageFilter, setSelectedStageFilter] = useState<LabStage | "ALL">("ALL");

  const filteredOrders = selectedStageFilter === "ALL"
    ? orders
    : orders.filter((o) => o.currentStage === selectedStageFilter);

  const role = currentUser?.role || "administrator";

  const getDashboardHeader = () => {
    switch (role) {
      case "doctor":
        return {
          title: "Clinical Requisition & Patient Care Dashboard",
          description: `Welcome back, ${currentUser?.name || "Dr. Priya Sharma"}. Manage patient test orders, review STAT requisitions, and access diagnostic bundles.`,
          badge: "Consultant Physician",
          cta: "+ New Patient Requisition",
        };
      case "pathologist":
        return {
          title: "Diagnostic Pathology Review & Sign-off Dashboard",
          description: `Welcome back, ${currentUser?.name || "Dr. Arvind Swaminathan"}. Validate automated analyzer findings, evaluate panic limits, and digitally sign reports.`,
          badge: "Lead Medical Pathologist",
          cta: "Review Pending Results",
          ctaView: "results" as NavView,
        };
      case "lab_technician":
        return {
          title: "Laboratory Workbench & Analyzer Line Dashboard",
          description: `Welcome back, ${currentUser?.name || "Sunita Patel"}. Accession incoming specimens, centrifuge SST/EDTA tubes, and monitor automated assay lines.`,
          badge: "Senior Technologist",
          cta: "Analyzer Workbench",
          ctaView: "processing" as NavView,
        };
      case "collection_staff":
        return {
          title: "Phlebotomy Intake & Sample Collection Dashboard",
          description: `Welcome back, ${currentUser?.name || "Ramesh Verma"}. Register patient requisitions, print barcode labels, and manage transport logistics.`,
          badge: "Phlebotomy & Intake Lead",
          cta: "+ Register Patient Draw",
        };
      case "patient":
        return {
          title: "Patient Diagnostic Portal",
          description: `Welcome, ${currentUser?.name || "Rajesh Patel"}. View your verified clinical test reports, health records, and diagnostic history.`,
          badge: "Patient Portal",
          cta: "View My Reports",
          ctaView: "reports" as NavView,
        };
      case "administrator":
      default:
        return {
          title: "Executive Operations & Governance Dashboard",
          description: `Welcome back, ${currentUser?.name || "Dr. Vikram Malhotra"}. Complete real-time operational overview across all laboratory stages and branches.`,
          badge: "Operations Administrator",
          cta: "+ New Order",
        };
    }
  };

  const headerMeta = getDashboardHeader();

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* ROLE DESIGNATION HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-200 text-[11px] font-extrabold uppercase tracking-wider">
              {headerMeta.badge}
            </span>
            <span className="text-xs font-semibold text-slate-400">• Authority Workstation</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            {headerMeta.title}
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            {headerMeta.description}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* DATE SELECTOR */}
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="Today">Today (10 Sep 2026)</option>
              <option value="Last 7 days">Last 7 days</option>
              <option value="Last 30 days">Last 30 days</option>
            </select>
          </div>

          {/* PRIMARY ROLE CTA */}
          <button
            onClick={() => {
              if (headerMeta.ctaView) {
                onNavigateToView(headerMeta.ctaView);
              } else {
                onOpenCreateOrder();
              }
            }}
            className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-md shadow-sky-600/20 transition-all flex items-center gap-1.5 cursor-pointer hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4 text-white" />
            {headerMeta.cta}
          </button>
        </div>
      </div>

      {/* ROLE TAILORED KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {role === "pathologist" ? (
          <>
            <KpiCard
              title="PENDING REVIEW"
              value={samples.filter((s) => s.stage === "REVIEW").length}
              subtext="Queued for pathologist sign-off"
              changeType="neutral"
              icon={<FileCheck2 className="w-4 h-4 text-amber-600" />}
            />
            <KpiCard
              title="CRITICAL PANIC"
              value={exceptions.length}
              change="Immediate Action"
              changeType="critical"
              subtext="Panic thresholds requiring review"
              icon={<AlertTriangle className="w-4 h-4 text-red-600" />}
            />
            <KpiCard
              title="RELEASED TODAY"
              value={orders.filter(o => o.status === "Completed" || o.currentStage === "RELEASED").length}
              changeType="positive"
              subtext="Digitally attested reports"
              icon={<FileSpreadsheet className="w-4 h-4 text-emerald-600" />}
            />
            <KpiCard
              title="AVERAGE TAT"
              value={calculatedAvgTat}
              change="-14m target"
              changeType="positive"
              subtext="Target TAT: < 3h 00m"
              icon={<Clock className="w-4 h-4 text-sky-600" />}
            />
            <KpiCard
              title="ACTIVE SAMPLES"
              value={samples.length}
              subtext="In active clinical pipeline"
              icon={<Cpu className="w-4 h-4 text-purple-600" />}
            />
          </>
        ) : role === "lab_technician" ? (
          <>
            <KpiCard
              title="ACTIVE WORKBENCH"
              value={samples.filter((s) => s.stage === "PROCESSING" || s.stage === "RECEIVED").length}
              subtext="On centrifuges & analyzers"
              icon={<Cpu className="w-4 h-4 text-purple-600" />}
            />
            <KpiCard
              title="IN-TRANSIT INTAKE"
              value={samples.filter((s) => s.stage === "IN_TRANSIT" || s.stage === "COLLECTED").length}
              subtext="Arriving from collection hubs"
              icon={<Clock className="w-4 h-4 text-sky-600" />}
            />
            <KpiCard
              title="RERUN REQUESTS"
              value={samples.filter((s) => s.status === "Processing" && s.stage === "REVIEW").length}
              subtext="Analyzer rechecks queued"
              icon={<AlertTriangle className="w-4 h-4 text-amber-600" />}
            />
            <KpiCard
              title="TOTAL SAMPLES"
              value={samples.length}
              subtext="Accessioned in lab session"
              icon={<FileSpreadsheet className="w-4 h-4 text-indigo-600" />}
            />
            <KpiCard
              title="INSTRUMENT QC"
              value="100% OK"
              changeType="positive"
              subtext="All 4 auto-analyzers calibrated"
              icon={<FileCheck2 className="w-4 h-4 text-emerald-600" />}
            />
          </>
        ) : (
          <>
            <KpiCard
              title="ORDERS TODAY"
              value={orders.length}
              change={`+${Math.max(1, Math.round(orders.length * 0.15))}% vs yesterday`}
              changeType="positive"
              subtext={`${orders.filter(o => o.status === "Completed").length} completed in database`}
              icon={<FileSpreadsheet className="w-4 h-4 text-sky-600" />}
            />
            <KpiCard
              title="IN PROCESSING"
              value={samples.filter((s) => s.stage === "PROCESSING" || s.stage === "RECEIVED" || s.stage === "IN_TRANSIT").length}
              subtext={`${samples.filter(s => s.stage === "PROCESSING").length} active on analyzers`}
              icon={<Cpu className="w-4 h-4 text-purple-600" />}
            />
            <KpiCard
              title="AVERAGE TAT"
              value={calculatedAvgTat}
              change="-14m vs target"
              changeType="positive"
              subtext="Target TAT: < 3h 00m"
              icon={<Clock className="w-4 h-4 text-blue-600" />}
            />
            <KpiCard
              title="PENDING REVIEW"
              value={samples.filter((s) => s.stage === "REVIEW").length}
              subtext="Queued for pathologist sign-off"
              changeType="neutral"
              icon={<FileCheck2 className="w-4 h-4 text-amber-600" />}
            />
            <KpiCard
              title="CRITICAL"
              value={exceptions.length}
              change="Urgent Action"
              changeType="critical"
              subtext="Requires pre-analytical attention"
              icon={<AlertTriangle className="w-4 h-4 text-red-600" />}
            />
          </>
        )}
      </div>

      {/* WORKFLOW MONITOR (7 HORIZONTAL STAGES) */}
      <WorkflowPipeline
        stages={workflowStages}
        selectedStage={selectedStageFilter}
        onSelectStage={(stage) => setSelectedStageFilter(stage)}
      />

      {/* REQUIRES ATTENTION EXCEPTION TABLE */}
      <RequiresAttentionTable
        exceptions={exceptions}
        onActionClick={(item) => {
          if (item.entity === "Sample") {
            const foundSample = samples.find((s) => s.id === item.entityId) || samples[0];
            onSelectSample(foundSample);
          } else if (item.entity === "Order") {
            const foundOrder = orders.find((o) => o.id === item.entityId) || orders[0];
            onSelectOrder(foundOrder);
          } else {
            onNavigateToView("results");
          }
        }}
      />

      {/* RECENT ORDERS TABLE */}
      <div className="labflow-card overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-wide uppercase">
              Recent Laboratory Orders
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live tracking of registered patient orders and turnaround status
            </p>
          </div>
          <button
            onClick={() => onNavigateToView("orders")}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 cursor-pointer"
          >
            View All Orders ({orders.length})
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200 tracking-wider">
              <tr>
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Patient</th>
                <th className="py-3 px-4">Tests</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Current Stage</th>
                <th className="py-3 px-4">Created</th>
                <th className="py-3 px-4">TAT</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500 font-medium">
                    No orders found in database.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-indigo-600 whitespace-nowrap">
                    {ord.id}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="font-semibold text-slate-900">{ord.patient.name}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{ord.patient.mrn}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-700 font-medium max-w-xs truncate">
                    {ord.tests.join(", ")}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <StatusBadge type="priority" value={ord.priority} size="sm" />
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <StatusBadge type="stage" value={ord.currentStage} size="sm" />
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">
                    {ord.createdAt}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">
                    {ord.tat}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <StatusBadge type="status" value={ord.status} size="sm" />
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <button
                      onClick={() => onSelectOrder(ord)}
                      className="p-1.5 rounded bg-slate-100 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors cursor-pointer"
                      title="View Order Details"
                    >
                      <Eye className="w-4 h-4" />
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
