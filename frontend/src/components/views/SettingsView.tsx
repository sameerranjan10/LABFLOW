import React, { useState } from "react";
import { Building2, MapPin, Layers, TestTube2, GitFork, Bell, ShieldCheck, Plug, Save } from "lucide-react";

export const SettingsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState("Organization");

  const tabs = [
    { id: "Organization", label: "Organization", icon: Building2 },
    { id: "Locations", label: "Locations", icon: MapPin },
    { id: "Departments", label: "Departments", icon: Layers },
    { id: "Test Types", label: "Test Types", icon: TestTube2 },
    { id: "Workflow", label: "Workflow Rules", icon: GitFork },
    { id: "Notifications", label: "Notifications", icon: Bell },
    { id: "Roles & Permissions", label: "Roles & Permissions", icon: ShieldCheck },
    { id: "Integrations", label: "Integrations & LIMS Bridge", icon: Plug },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Platform Settings & Configuration
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure laboratory branches, test menu parameters, LIMS auto-interface rules, and notification webhooks.
          </p>
        </div>

        <button
          onClick={() => alert("Settings saved successfully!")}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          Save Changes
        </button>
      </div>

      {/* TWO COLUMN SETTINGS LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* LEFT NAV TABS */}
        <div className="labflow-card p-2 space-y-1 h-fit">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  active
                    ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? "text-indigo-600" : "text-slate-400"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* RIGHT CONTENT PANEL */}
        <div className="lg:col-span-3 labflow-card p-6 space-y-6">
          {activeTab === "Organization" && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2 uppercase tracking-wider">
                Organization Profile
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Organization Name</label>
                  <input type="text" defaultValue="Apex Diagnostics & Reference Laboratories" className="w-full p-2 border border-slate-300 rounded-lg" />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">License & NABL Accreditation Number</label>
                  <input type="text" defaultValue="NABL-LAB-2026-8492" className="w-full p-2 border border-slate-300 rounded-lg font-mono" />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Headquarters Location</label>
                  <input type="text" defaultValue="Plot 14, Healthcare Hub, Main Boulevard" className="w-full p-2 border border-slate-300 rounded-lg" />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Support Email</label>
                  <input type="email" defaultValue="ops@apexdiagnostics.com" className="w-full p-2 border border-slate-300 rounded-lg" />
                </div>
              </div>
            </div>
          )}

          {activeTab === "Locations" && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2 uppercase tracking-wider">
                Configured Laboratory Branches & Collection Centers
              </h2>
              <div className="space-y-2 text-xs">
                {["Main Laboratory (Central Processing Reference Lab)", "Collection Center A (City Center)", "Collection Center B (Westside Medical)", "Emergency Lab (Hospital Wing B)"].map((loc, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex justify-between items-center">
                    <span className="font-semibold text-slate-900">{loc}</span>
                    <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Active</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "Workflow" && (
            <div className="space-y-4 text-xs">
              <h2 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2 uppercase tracking-wider">
                Automated LIMS Workflow & Panic Threshold Rules
              </h2>
              <div className="space-y-3">
                <label className="flex items-center gap-2 font-semibold text-slate-800">
                  <input type="checkbox" defaultChecked className="rounded text-indigo-600" />
                  Auto-flag critical panic result values (e.g. Troponin &gt; 0.04 ng/mL)
                </label>
                <label className="flex items-center gap-2 font-semibold text-slate-800">
                  <input type="checkbox" defaultChecked className="rounded text-indigo-600" />
                  Enforce strict barcode verification before sample accessioning
                </label>
                <label className="flex items-center gap-2 font-semibold text-slate-800">
                  <input type="checkbox" defaultChecked className="rounded text-indigo-600" />
                  Trigger SMS / WhatsApp notification to patient upon report release
                </label>
              </div>
            </div>
          )}

          {activeTab !== "Organization" && activeTab !== "Locations" && activeTab !== "Workflow" && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2 uppercase tracking-wider">
                {activeTab} Configuration
              </h2>
              <p className="text-xs text-slate-500">
                Enterprise parameters for {activeTab} are synchronized across all connected laboratory workstations.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
