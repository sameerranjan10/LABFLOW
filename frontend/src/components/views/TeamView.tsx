import React, { useState } from "react";
import { TeamMember, INITIAL_TEAM } from "@/data/labflowData";
import { StatusBadge } from "@/components/StatusBadge";
import { Users, Plus, Search, Mail, ShieldCheck } from "lucide-react";

export const TeamView: React.FC = () => {
  const [team, setTeam] = useState<TeamMember[]>(INITIAL_TEAM);
  const [search, setSearch] = useState("");

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
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Staff & Laboratory Operations Team
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Role-based access control (RBAC), phlebotomist schedules, and technician shift rosters.
          </p>
        </div>

        <button
          onClick={() => alert("Invite staff member modal...")}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          + Invite Team Member
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
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Last Active</th>
                <th className="py-3.5 px-4 text-right">Action</th>
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
                    <button
                      onClick={() => alert(`Managing permissions for ${tm.name}`)}
                      className="px-2.5 py-1 text-xs font-semibold rounded bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                    >
                      Edit Permissions
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
