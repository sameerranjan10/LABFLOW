import React, { useState } from "react";
import { LabOrder, OrderPriority } from "@/data/labflowData";
import { StatusBadge } from "@/components/StatusBadge";
import { Plus, Search, Filter, Eye, FileSpreadsheet, Download } from "lucide-react";

interface OrdersViewProps {
  orders: LabOrder[];
  onOpenCreateOrder: () => void;
  onSelectOrder: (order: LabOrder) => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({
  orders,
  onOpenCreateOrder,
  onSelectOrder,
}) => {
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [locationFilter, setLocationFilter] = useState<string>("ALL");

  const filtered = orders.filter((ord) => {
    const matchesSearch =
      ord.id.toLowerCase().includes(search.toLowerCase()) ||
      ord.patient.name.toLowerCase().includes(search.toLowerCase()) ||
      ord.patient.mrn.toLowerCase().includes(search.toLowerCase()) ||
      ord.tests.some((t) => t.toLowerCase().includes(search.toLowerCase()));

    const matchesPriority = priorityFilter === "ALL" || ord.priority === priorityFilter;
    const matchesStatus = statusFilter === "ALL" || ord.status === statusFilter;
    const matchesLocation = locationFilter === "ALL" || ord.location.includes(locationFilter);

    return matchesSearch && matchesPriority && matchesStatus && matchesLocation;
  });

  const handleExportCSV = () => {
    const headers = ["Order ID", "Patient Name", "MRN", "Age", "Gender", "Tests", "Priority", "Stage", "Location", "Created", "TAT", "Status"];
    const rows = filtered.map((ord) => [
      ord.id,
      `"${ord.patient.name}"`,
      ord.patient.mrn,
      ord.patient.age,
      ord.patient.gender,
      `"${ord.tests.join("; ")}"`,
      ord.priority,
      ord.currentStage,
      `"${ord.location}"`,
      ord.createdAt,
      ord.tat,
      ord.status,
    ]);
    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `LabFlow_Orders_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Order Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage test requisitions, priority flags, and accessioning workflows.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 text-xs font-semibold rounded-lg border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500" />
            Export CSV
          </button>

          <button
            onClick={onOpenCreateOrder}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            + Create Order
          </button>
        </div>
      </div>

      {/* FILTERS & SEARCH BAR */}
      <div className="labflow-card p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* SEARCH */}
          <div className="relative lg:col-span-2">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search patient, order ID, MRN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* PRIORITY FILTER */}
          <div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">All Priorities</option>
              <option value="STAT">STAT Only</option>
              <option value="Urgent">Urgent Only</option>
              <option value="Normal">Normal Priority</option>
            </select>
          </div>

          {/* STATUS FILTER */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="In Progress">In Progress</option>
              <option value="Pending Review">Pending Review</option>
              <option value="Completed">Completed</option>
              <option value="Delayed">Delayed</option>
            </select>
          </div>

          {/* LOCATION FILTER */}
          <div>
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">All Locations</option>
              <option value="Main Laboratory">Main Laboratory</option>
              <option value="Collection Center A">Collection Center A</option>
              <option value="Collection Center B">Collection Center B</option>
              <option value="Emergency Lab">Emergency Lab</option>
            </select>
          </div>
        </div>
      </div>

      {/* ORDERS TABLE */}
      <div className="labflow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200 tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Order ID</th>
                <th className="py-3.5 px-4">Patient Details</th>
                <th className="py-3.5 px-4">Tests Requested</th>
                <th className="py-3.5 px-4">Priority</th>
                <th className="py-3.5 px-4">Current Stage</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4">Created Time</th>
                <th className="py-3.5 px-4">TAT</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-500">
                    No orders match the selected filters.
                  </td>
                </tr>
              ) : (
                filtered.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-600 whitespace-nowrap">
                      {ord.id}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-semibold text-slate-900">{ord.patient.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {ord.patient.mrn} • {ord.patient.gender}, {ord.patient.age}y
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium max-w-xs truncate">
                      {ord.tests.join(", ")}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <StatusBadge type="priority" value={ord.priority} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <StatusBadge type="stage" value={ord.currentStage} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 text-[11px] whitespace-nowrap">
                      {ord.location}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600 whitespace-nowrap">
                      {ord.createdAt}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600 whitespace-nowrap">
                      {ord.tat}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <StatusBadge type="status" value={ord.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => onSelectOrder(ord)}
                        className="px-2.5 py-1 text-xs font-semibold rounded bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors cursor-pointer"
                      >
                        View Order
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
