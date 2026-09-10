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
}) => {
  const [dateRange, setDateRange] = useState("Today");
  const [selectedStageFilter, setSelectedStageFilter] = useState<LabStage | "ALL">("ALL");

  const filteredOrders = selectedStageFilter === "ALL"
    ? orders
    : orders.filter((o) => o.currentStage === selectedStageFilter);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Operations Overview
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor your laboratory workflow in real time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* DATE SELECTOR */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white shadow-xs text-xs font-semibold text-slate-700">
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

          {/* PRIMARY CTA */}
          <button
            onClick={onOpenCreateOrder}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            + New Order
          </button>
        </div>
      </div>

      {/* 5 KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard
          title="ORDERS TODAY"
          value={orders.length}
          change={`+${Math.max(1, Math.round(orders.length * 0.15))}% vs yesterday`}
          changeType="positive"
          subtext={`${orders.filter(o => o.status === "Completed").length} completed in database`}
          icon={<FileSpreadsheet className="w-4 h-4 text-indigo-600" />}
        />
        <KpiCard
          title="IN PROCESSING"
          value={samples.filter((s) => s.stage === "PROCESSING" || s.stage === "RECEIVED" || s.stage === "IN_TRANSIT").length}
          subtext={`${samples.filter(s => s.stage === "PROCESSING").length} active on analyzers`}
          icon={<Cpu className="w-4 h-4 text-purple-600" />}
        />
        <KpiCard
          title="AVERAGE TAT"
          value="1h 45m"
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
              {filteredOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-indigo-600 whitespace-nowrap">
                    {ord.id}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="font-semibold text-slate-900">{ord.patient.name}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{ord.patient.mrn}</div>
                    {ord.patient.email && (
                      <div className="text-[10px] text-indigo-600 font-sans truncate max-w-[170px]" title={ord.patient.email}>
                        ✉ {ord.patient.email}
                      </div>
                    )}
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
