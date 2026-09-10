"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Search,
  MapPin,
  Bell,
  ChevronRight,
  Menu,
  ChevronDown,
  ShieldCheck,
  Stethoscope,
  TestTube2,
  UserCheck,
  HeartHandshake,
  LogIn,
  FileSpreadsheet,
  Barcode,
  FileText,
  ArrowUpRight,
  X,
} from "lucide-react";
import { NavView } from "@/components/Sidebar";
import { LabUser, LabRole, PRESET_LAB_USERS } from "@/lib/roles";
import { LabOrder, LabSample, LabReport } from "@/data/labflowData";

interface TopbarProps {
  currentView: NavView;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedLocation: string;
  onLocationChange: (loc: string) => void;
  onOpenNotifications: () => void;
  unreadCount?: number;
  onMobileMenuToggle?: () => void;
  currentUser: LabUser;
  onSelectUser: (user: LabUser) => void;
  orders?: LabOrder[];
  samples?: LabSample[];
  reports?: LabReport[];
  onNavigate?: (view: NavView) => void;
  onSelectSample?: (sample: LabSample) => void;
  onSelectReport?: (report: LabReport) => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  currentView,
  searchQuery,
  onSearchChange,
  selectedLocation,
  onLocationChange,
  onOpenNotifications,
  unreadCount = 5,
  onMobileMenuToggle,
  currentUser,
  onSelectUser,
  orders = [],
  samples = [],
  reports = [],
  onNavigate,
  onSelectSample,
  onSelectReport,
}) => {
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setRoleDropdownOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setSearchFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getBreadcrumbTitle = () => {
    switch (currentView) {
      case "dashboard":
        return "Operations Overview";
      case "orders":
        return "Order Management";
      case "samples":
        return "Specimen Tracking & Custody";
      case "processing":
        return "Laboratory Processing & QC";
      case "results":
        return "Result Verification & Sign-Off";
      case "reports":
        return "Diagnostic Report Release";
      case "alerts":
        return "Exception & Alert Center";
      case "audit":
        return "Compliance Audit Trail";
      case "team":
        return "Staff & Laboratory Team";
      case "settings":
        return "Platform Settings & Billing";
      case "login":
        return "Enterprise Authentication";
      case "landing":
        return "B2B Platform Overview";
      default:
        return "Operations";
    }
  };

  const getRoleIcon = (role: LabRole) => {
    switch (role) {
      case "administrator":
        return <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />;
      case "doctor":
        return <Stethoscope className="w-3.5 h-3.5 text-sky-600" />;
      case "pathologist":
        return <TestTube2 className="w-3.5 h-3.5 text-purple-600" />;
      case "lab_technician":
        return <UserCheck className="w-3.5 h-3.5 text-emerald-600" />;
      case "collection_staff":
        return <MapPin className="w-3.5 h-3.5 text-amber-600" />;
      case "patient":
        return <HeartHandshake className="w-3.5 h-3.5 text-rose-600" />;
    }
  };

  // SEARCH FILTERING
  const q = searchQuery.toLowerCase().trim();
  const matchedOrders = q
    ? orders.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.patient.name.toLowerCase().includes(q) ||
          o.patient.mrn.toLowerCase().includes(q) ||
          o.tests.some((t) => t.toLowerCase().includes(q))
      ).slice(0, 4)
    : [];

  const matchedSamples = q
    ? samples.filter(
        (s) =>
          s.id.toLowerCase().includes(q) ||
          s.barcode.toLowerCase().includes(q) ||
          s.patient.name.toLowerCase().includes(q) ||
          s.test.toLowerCase().includes(q)
      ).slice(0, 4)
    : [];

  const matchedReports = q
    ? reports.filter(
        (r) =>
          r.id.toLowerCase().includes(q) ||
          r.patient.name.toLowerCase().includes(q) ||
          r.reviewer.toLowerCase().includes(q) ||
          r.tests.some((t) => t.toLowerCase().includes(q))
      ).slice(0, 4)
    : [];

  const totalResults = matchedOrders.length + matchedSamples.length + matchedReports.length;

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between z-20 shrink-0 select-none relative">
      {/* LEFT: MOBILE MENU TOGGLE & BREADCRUMBS */}
      <div className="flex items-center gap-3">
        {onMobileMenuToggle && (
          <button
            onClick={onMobileMenuToggle}
            className="md:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <span className="font-semibold text-slate-400">LABFLOW</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="font-bold text-slate-900 tracking-tight">
            {getBreadcrumbTitle()}
          </span>
        </div>
      </div>

      {/* CENTER: GLOBAL SEARCH WITH LIVE RESULTS DROPDOWN */}
      <div ref={searchContainerRef} className="hidden sm:flex items-center w-full max-w-md mx-4 relative">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search patient, order ID, barcode, report..."
            value={searchQuery}
            onFocus={() => setSearchFocused(true)}
            onChange={(e) => {
              onSearchChange(e.target.value);
              setSearchFocused(true);
            }}
            className="w-full pl-9 pr-14 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shadow-2xs"
          />
          <div className="absolute inset-y-0 right-0 pr-2 flex items-center gap-1">
            {searchQuery ? (
              <button
                onClick={() => {
                  onSearchChange("");
                  setSearchFocused(false);
                }}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <span className="text-[10px] font-mono text-slate-400 bg-slate-200/60 px-1.5 py-0.5 rounded border border-slate-300">
                ⌘K
              </span>
            )}
          </div>
        </div>

        {/* SEARCH RESULTS DROPDOWN */}
        {searchFocused && q.length > 0 && (
          <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-50 max-h-96 overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-150">
            <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 flex justify-between items-center">
              <span>Search Results ({totalResults})</span>
              <span className="text-[10px] font-normal text-slate-400">Query: &quot;{searchQuery}&quot;</span>
            </div>

            {totalResults === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500">
                No matching orders, samples, or reports found.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {/* MATCHED ORDERS */}
                {matchedOrders.length > 0 && (
                  <div className="p-2 space-y-1">
                    <span className="text-[10px] font-bold text-indigo-600 uppercase px-2">Orders</span>
                    {matchedOrders.map((o) => (
                      <div
                        key={o.id}
                        onClick={() => {
                          setSearchFocused(false);
                          if (onNavigate) onNavigate("orders");
                        }}
                        className="px-2 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer flex items-center justify-between text-xs transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          <div>
                            <span className="font-bold text-slate-900 font-mono mr-2">{o.id}</span>
                            <span className="text-slate-700">{o.patient.name}</span>
                            <span className="text-[11px] text-slate-400 ml-1.5">({o.patient.mrn})</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">
                          {o.currentStage}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* MATCHED SAMPLES */}
                {matchedSamples.length > 0 && (
                  <div className="p-2 space-y-1">
                    <span className="text-[10px] font-bold text-purple-600 uppercase px-2">Samples</span>
                    {matchedSamples.map((s) => (
                      <div
                        key={s.id}
                        onClick={() => {
                          setSearchFocused(false);
                          if (onSelectSample) onSelectSample(s);
                          else if (onNavigate) onNavigate("samples");
                        }}
                        className="px-2 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer flex items-center justify-between text-xs transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Barcode className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                          <div>
                            <span className="font-bold text-purple-800 font-mono mr-2">{s.id}</span>
                            <span className="text-slate-800">{s.patient.name}</span>
                            <span className="text-[11px] text-slate-400 ml-1.5 font-mono">[{s.barcode}]</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-semibold bg-purple-50 text-purple-700 px-2 py-0.5 rounded">
                          {s.stage}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* MATCHED REPORTS */}
                {matchedReports.length > 0 && (
                  <div className="p-2 space-y-1">
                    <span className="text-[10px] font-bold text-emerald-600 uppercase px-2">Reports</span>
                    {matchedReports.map((r) => (
                      <div
                        key={r.id}
                        onClick={() => {
                          setSearchFocused(false);
                          if (onSelectReport) onSelectReport(r);
                          else if (onNavigate) onNavigate("reports");
                        }}
                        className="px-2 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer flex items-center justify-between text-xs transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <div>
                            <span className="font-bold text-slate-900 font-mono mr-2">{r.id}</span>
                            <span className="text-slate-800">{r.patient.name}</span>
                            <span className="text-[11px] text-slate-400 ml-1.5">by {r.reviewer}</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded">
                          {r.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* RIGHT: LOCATION SELECTOR, NOTIFICATIONS, RBAC PERSONA DROPDOWN */}
      <div className="flex items-center gap-3">
        {/* LOCATION SELECTOR */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 text-xs">
          <MapPin className="w-3.5 h-3.5 text-indigo-600" />
          <select
            value={selectedLocation}
            onChange={(e) => onLocationChange(e.target.value)}
            className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer"
          >
            <option value="Main Reference Lab (Central)">Main Reference Lab (Central)</option>
            <option value="Collection Center A (City)">Collection Center A (City)</option>
            <option value="Collection Center B (Westside)">Collection Center B (Westside)</option>
            <option value="Emergency Hospital Satellite">Emergency Hospital Satellite</option>
          </select>
        </div>

        {/* NOTIFICATION BELL */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Alerts & Notifications"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[10px] font-extrabold flex items-center justify-center border-2 border-white">
              {unreadCount}
            </span>
          )}
        </button>

        {/* RBAC ROLE / PERSONA SELECTOR */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
            className="flex items-center gap-2.5 p-1.5 pl-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
          >
            <div className="w-7 h-7 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center">
              {getRoleIcon(currentUser.role)}
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-bold text-slate-900 leading-none">
                {currentUser.name}
              </div>
              <div className="text-[10px] text-slate-500 font-medium leading-none mt-1">
                {currentUser.badge}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
          </button>

          {/* PERSONA SWITCHER DROPDOWN MENU */}
          {roleDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl bg-white shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Switch Operational Persona
              </div>
              <div className="py-1">
                {(Object.keys(PRESET_LAB_USERS) as LabRole[]).map((roleKey) => {
                  const u = PRESET_LAB_USERS[roleKey];
                  const isCurrent = currentUser.role === roleKey;
                  return (
                    <button
                      key={roleKey}
                      onClick={() => {
                        onSelectUser(u);
                        setRoleDropdownOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-left flex items-center gap-2.5 text-xs transition-colors cursor-pointer ${
                        isCurrent
                          ? "bg-indigo-50/70 text-indigo-900 font-semibold"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                        {getRoleIcon(roleKey)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold truncate">{u.name}</div>
                        <div className="text-[10px] text-slate-400 truncate">{u.title}</div>
                      </div>
                      {isCurrent && (
                        <div className="w-2 h-2 rounded-full bg-indigo-600 shrink-0"></div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
