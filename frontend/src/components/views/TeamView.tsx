"use client";

import React, { useState, useEffect } from "react";
import { TeamMember, INITIAL_TEAM } from "@/data/labflowData";
import { StatusBadge } from "@/components/StatusBadge";
import { Users, Plus, Search, Mail, ShieldCheck, CheckCircle2, X } from "lucide-react";

export const TeamView: React.FC = () => {
  const [team, setTeam] = useState<TeamMember[]>(INITIAL_TEAM);
  const [search, setSearch] = useState("");
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [role, setRole] = useState<TeamMember["role"]>("Lab Technician");
  const [department, setDepartment] = useState("Hematology");
  const [location, setLocation] = useState("Main Laboratory");
  const [email, setEmail] = useState("");

  useEffect(() => {
    async function loadTeam() {
      try {
        const res = await fetch("/api/team");
        if (res.ok) {
          const data = await res.json();
          if (data.team && data.team.length > 0) {
            setTeam(data.team);
          }
        }
      } catch (err) {
        console.warn("Using baseline team data:", err);
      }
    }
    loadTeam();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload: Omit<TeamMember, "id" | "lastActive"> = {
      name,
      role,
      department,
      location,
      email: email || `${name.toLowerCase().replace(/\s+/g, ".")}@labflow.io`,
      status: "Active",
    };

    try {
      const res = await fetch("/api/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.member) {
          setTeam((prev) => [data.member, ...prev]);
        }
      }
    } catch (err) {
      console.warn("Error persisting team member:", err);
      // Fallback local
      const fallback: TeamMember = {
        id: `tm-${Date.now()}`,
        ...payload,
        lastActive: "Just now",
      };
      setTeam((prev) => [fallback, ...prev]);
    }

    setIsInviteModalOpen(false);
    setName("");
    setEmail("");
    showToast(`Staff member ${name} invited and added to LabFlow database.`);
  };

  const handleStatusChange = async (memberId: string, newStatus: TeamMember["status"]) => {
    setTeam((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, status: newStatus, lastActive: "Just now" } : m))
    );

    try {
      await fetch("/api/team", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: memberId, status: newStatus }),
      });
      showToast(`Duty status updated to ${newStatus}.`);
    } catch (err) {
      console.warn("Status sync error:", err);
    }
  };

  const filtered = team.filter(
    (tm) =>
      tm.name.toLowerCase().includes(search.toLowerCase()) ||
      tm.role.toLowerCase().includes(search.toLowerCase()) ||
      tm.department.toLowerCase().includes(search.toLowerCase()) ||
      tm.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Staff & Laboratory Operations Team
            </h1>
            <span className="bg-indigo-50 text-indigo-700 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-indigo-200">
              {team.length} TEAM MEMBERS
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Role-based access control (RBAC), phlebotomist schedules, and technician shift schedules.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {toastMessage && (
            <span className="text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 font-semibold flex items-center gap-1.5 animate-in fade-in">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {toastMessage}
            </span>
          )}

          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            + Invite Team Member
          </button>
        </div>
      </div>

      {/* SEARCH */}
      <div className="labflow-card p-4">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search staff member name, role, department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* TEAM TABLE */}
      <div className="labflow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200 tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Staff Member</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4">Duty Status</th>
                <th className="py-3.5 px-4">Last Active</th>
                <th className="py-3.5 px-4 text-right">Roster Shift Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((tm) => (
                <tr key={tm.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-800 text-white font-bold text-xs flex items-center justify-center">
                        {tm.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{tm.name}</div>
                        <div className="text-[11px] text-slate-400">{tm.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {tm.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 font-medium whitespace-nowrap">
                    {tm.department}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 text-[11px] whitespace-nowrap">
                    {tm.location}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <StatusBadge type="status" value={tm.status} size="sm" />
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-500 whitespace-nowrap">
                    {tm.lastActive}
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <select
                      value={tm.status}
                      onChange={(e) =>
                        handleStatusChange(tm.id, e.target.value as TeamMember["status"])
                      }
                      className="px-2 py-1 text-[11px] font-semibold rounded border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                    >
                      <option value="Active">Active (On Duty)</option>
                      <option value="On Break">On Break</option>
                      <option value="Offline">Offline / Off Duty</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* INVITE MODAL */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Invite Laboratory Staff Member</h3>
                <p className="text-xs text-slate-500">Provision credentials and clinical workstation access.</p>
              </div>
              <button
                onClick={() => setIsInviteModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleInviteSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Kavita Deshmukh"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Role / Designation *</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as TeamMember["role"])}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="Lab Technician">Lab Technician (Testing & Ingestion)</option>
                  <option value="Sample Collector">Sample Collector / Phlebotomist</option>
                  <option value="Reviewer">Reviewer / Pathologist (Medical Sign-Off)</option>
                  <option value="Lab Manager">Lab Manager (Operations & QC)</option>
                  <option value="Reception">Accessioning / Reception Desk</option>
                  <option value="Operations Admin">Operations Admin / Logistics</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="Hematology">Hematology</option>
                    <option value="Biochemistry">Biochemistry</option>
                    <option value="Phlebotomy">Phlebotomy</option>
                    <option value="Pathology">Pathology</option>
                    <option value="Molecular Lab">Molecular Lab</option>
                    <option value="Operations">Operations</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Work Location</label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="Main Laboratory">Main Reference Lab</option>
                    <option value="Collection Center A">Collection Center A</option>
                    <option value="Collection Center B">Collection Center B</option>
                    <option value="Emergency Lab">Emergency Lab</option>
                    <option value="Route #4">Route #4 Logistics</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Official Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. kavita.d@labflow.io"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs"
                >
                  Confirm & Provision
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
