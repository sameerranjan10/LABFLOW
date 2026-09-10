"use client";

import React, { useState, useRef, useEffect } from "react";
import { Search, MapPin, Bell, ChevronRight, Menu, ChevronDown, ShieldCheck, Stethoscope, TestTube2, UserCheck, HeartHandshake, LogIn } from "lucide-react";
import { NavView } from "@/components/Sidebar";
import { LabUser, LabRole, PRESET_LAB_USERS } from "@/lib/roles";

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
}) => {
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setRoleDropdownOpen(false);
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

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between z-20 shrink-0 select-none">
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

      {/* CENTER: GLOBAL SEARCH */}
      <div className="hidden sm:flex items-center w-full max-w-md mx-4">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search patient name, order ID, sample barcode..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-8 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-xs text-slate-400 hover:text-slate-600"
            >
              ×
            </button>
          )}
        </div>
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

        {/* 6-ROLE RBAC PERSONA DROPDOWN */}
        <div className="relative pl-2 border-l border-slate-200" ref={dropdownRef}>
          <button
            onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-2.5 py-1.5 text-xs transition cursor-pointer shadow-2xs"
            title="Switch Laboratory Persona (RBAC)"
          >
            <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-2xs">
              {currentUser.avatarInitials}
            </div>
            <div className="hidden md:block text-left">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900 leading-tight block">
                  {currentUser.name.split(",")[0]}
                </span>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {currentUser.badge}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 block leading-tight">
                {currentUser.title.split("&")[0]}
              </span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${roleDropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {/* DROPDOWN MENU */}
          {roleDropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 bg-white shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-1.5 border-b border-slate-100 flex justify-between items-center text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wider">
                <span>Phase 2 RBAC Personas</span>
                <span className="text-indigo-600">6 Roles</span>
              </div>

              <div className="space-y-1 pt-1.5">
                {(Object.keys(PRESET_LAB_USERS) as LabRole[]).map((roleKey) => {
                  const u = PRESET_LAB_USERS[roleKey];
                  const isSelected = u.id === currentUser.id;
                  return (
                    <button
                      key={u.id}
                      onClick={() => {
                        onSelectUser(u);
                        setRoleDropdownOpen(false);
                      }}
                      className={`w-full flex items-start justify-between rounded-lg p-2 text-left text-xs transition cursor-pointer ${
                        isSelected
                          ? "bg-indigo-50/70 border border-indigo-200"
                          : "hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="mt-0.5 p-1 rounded-md bg-slate-100">
                          {getRoleIcon(u.role)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            {u.name}
                            {isSelected && (
                              <span className="text-[9px] bg-indigo-600 text-white px-1.5 py-0.2 rounded font-mono">
                                ACTIVE
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500">{u.title}</div>
                          <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                            {u.location}
                          </div>
                        </div>
                      </div>
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
