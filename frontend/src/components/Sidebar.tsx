import React from "react";
import {
  LayoutDashboard,
  FileSpreadsheet,
  TestTube2,
  Cpu,
  FileCheck2,
  FileText,
  Bell,
  History,
  Users,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  FlaskConical,
  Building2,
  LogOut,
  Globe,
} from "lucide-react";

export type NavView =
  | "dashboard"
  | "patients"
  | "orders"
  | "samples"
  | "processing"
  | "results"
  | "reports"
  | "alerts"
  | "audit"
  | "team"
  | "settings"
  | "login"
  | "signup"
  | "landing";

import { LabRole, LabUser } from "@/lib/roles";

interface SidebarProps {
  currentView: NavView;
  onNavigate: (view: NavView) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  unreadAlertCount?: number;
  currentRole?: LabRole;
  currentUser?: LabUser;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  collapsed,
  onToggleCollapse,
  unreadAlertCount = 5,
  currentRole = "administrator",
  currentUser,
}) => {
  const userRole = currentUser?.role || currentRole || "administrator";

  const getOperationsNav = () => {
    switch (userRole) {
      case "patient":
        return [
          { id: "reports" as NavView, label: "My Diagnostic Reports", icon: FileText },
        ];
      case "doctor":
        return [
          { id: "dashboard" as NavView, label: "Physician Overview", icon: LayoutDashboard },
          { id: "patients" as NavView, label: "Patient Directory", icon: Users },
          { id: "orders" as NavView, label: "Patient Orders", icon: FileSpreadsheet },
          { id: "reports" as NavView, label: "Released Reports", icon: FileText },
        ];
      case "pathologist":
        return [
          { id: "dashboard" as NavView, label: "Pathology Overview", icon: LayoutDashboard },
          { id: "patients" as NavView, label: "Patient Directory", icon: Users },
          { id: "results" as NavView, label: "Result Sign-off", icon: FileCheck2 },
          { id: "reports" as NavView, label: "Report Release", icon: FileText },
        ];
      case "lab_technician":
        return [
          { id: "dashboard" as NavView, label: "Workbench Overview", icon: LayoutDashboard },
          { id: "samples" as NavView, label: "Specimen Intake", icon: TestTube2 },
          { id: "processing" as NavView, label: "Analyzer Line", icon: Cpu },
          { id: "results" as NavView, label: "Assay Results", icon: FileCheck2 },
        ];
      case "collection_staff":
        return [
          { id: "dashboard" as NavView, label: "Phlebotomy Overview", icon: LayoutDashboard },
          { id: "patients" as NavView, label: "Patient Directory", icon: Users },
          { id: "orders" as NavView, label: "Intake Orders", icon: FileSpreadsheet },
          { id: "samples" as NavView, label: "Sample Collection", icon: TestTube2 },
        ];
      case "administrator":
      default:
        return [
          { id: "dashboard" as NavView, label: "Operations Dashboard", icon: LayoutDashboard },
          { id: "patients" as NavView, label: "Patient Directory", icon: Users },
          { id: "orders" as NavView, label: "Orders Management", icon: FileSpreadsheet },
          { id: "samples" as NavView, label: "Sample Tracking", icon: TestTube2 },
          { id: "processing" as NavView, label: "Processing Workbench", icon: Cpu },
          { id: "results" as NavView, label: "Results Review", icon: FileCheck2 },
          { id: "reports" as NavView, label: "Diagnostic Reports", icon: FileText },
        ];
    }
  };

  const getMonitoringNav = () => {
    switch (userRole) {
      case "patient":
        return [{ id: "alerts" as NavView, label: "Health Alerts", icon: Bell, badge: unreadAlertCount }];
      case "lab_technician":
      case "collection_staff":
        return [{ id: "alerts" as NavView, label: "Operational Alerts", icon: Bell, badge: unreadAlertCount }];
      case "doctor":
      case "pathologist":
      case "administrator":
      default:
        return [
          { id: "alerts" as NavView, label: "Alerts", icon: Bell, badge: unreadAlertCount },
          { id: "audit" as NavView, label: "Audit Trail", icon: History },
        ];
    }
  };

  const getAdminNav = () => {
    if (userRole === "administrator") {
      return [
        { id: "team" as NavView, label: "Team", icon: Users },
        { id: "settings" as NavView, label: "Platform Settings", icon: Settings },
      ];
    }
    return [];
  };

  const operationsNav = getOperationsNav();
  const monitoringNav = getMonitoringNav();
  const adminNav = getAdminNav();

  return (
    <aside
      className={`bg-white border-r border-slate-200 flex flex-col transition-all duration-200 z-30 select-none ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* BRANDING HEADER */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between">
        {!collapsed ? (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-extrabold tracking-tight text-slate-900 leading-none block">
                LABFLOW
              </span>
              <span className="text-[10px] font-medium text-slate-500 block mt-0.5">
                Laboratory Workflow Management
              </span>
            </div>
          </div>
        ) : (
          <div className="mx-auto w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
            <FlaskConical className="w-5 h-5" />
          </div>
        )}

        <button
          onClick={onToggleCollapse}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* WORKSPACE SELECTOR */}
      {!collapsed && (
        <div className="mx-3 my-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center gap-2 text-xs">
          <Building2 className="w-4 h-4 text-indigo-600 shrink-0" />
          <div className="min-w-0 flex-1">
            <span className="font-bold text-slate-900 block truncate">
              Apex Diagnostics
            </span>
            <span className="text-[11px] text-slate-500 block truncate">
              Main Laboratory
            </span>
          </div>
        </div>
      )}

      {/* NAVIGATION SECTIONS */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6">
        {currentRole === "patient" ? (
          <div>
            {!collapsed && (
              <h4 className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Patient Health Portal
              </h4>
            )}
            <nav className="space-y-0.5">
              <button
                onClick={() => onNavigate("reports")}
                title={collapsed ? "My Reports" : undefined}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  currentView === "reports"
                    ? "bg-indigo-50 text-indigo-700 font-bold border border-indigo-200/60"
                    : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                }`}
              >
                <FileText className={`w-4 h-4 shrink-0 ${currentView === "reports" ? "text-indigo-600" : "text-slate-400"}`} />
                {!collapsed && <span className="truncate">My Diagnostic Reports</span>}
              </button>
            </nav>
          </div>
        ) : (
          <>
            {/* OPERATIONS */}
            <div>
              {!collapsed && (
                <h4 className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Operations
                </h4>
              )}
              <nav className="space-y-0.5">
                {operationsNav.map((item) => {
                  const Icon = item.icon;
                  const active = currentView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onNavigate(item.id)}
                      title={collapsed ? item.label : undefined}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        active
                          ? "bg-indigo-50 text-indigo-700 font-bold border border-indigo-200/60"
                          : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${active ? "text-indigo-600" : "text-slate-400"}`} />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </button>
                  );
                })}
              </nav>
            </div>

        {/* MONITORING */}
        <div>
          {!collapsed && (
            <h4 className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Monitoring
            </h4>
          )}
          <nav className="space-y-0.5">
            {monitoringNav.map((item) => {
              const Icon = item.icon;
              const active = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  title={collapsed ? item.label : undefined}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    active
                      ? "bg-indigo-50 text-indigo-700 font-bold border border-indigo-200/60"
                      : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${active ? "text-indigo-600" : "text-slate-400"}`} />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </div>
                  {!collapsed && item.badge ? (
                    <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>
        </div>

        {/* ADMINISTRATION */}
        {adminNav.length > 0 && (
          <div>
            {!collapsed && (
              <h4 className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Administration
              </h4>
            )}
            <nav className="space-y-0.5">
              {adminNav.map((item) => {
                const Icon = item.icon;
                const active = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    title={collapsed ? item.label : undefined}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      active
                        ? "bg-indigo-50 text-indigo-700 font-bold border border-indigo-200/60"
                        : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${active ? "text-indigo-600" : "text-slate-400"}`} />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </button>
                );
              })}
            </nav>
          </div>
        )}
        </>
        )}

        {/* VIEWS TOGGLE */}
        {!collapsed && (
          <div className="pt-2 border-t border-slate-100 space-y-1">
            <button
              onClick={() => onNavigate("landing")}
              className="w-full text-left px-2.5 py-1.5 rounded-md text-[11px] font-medium text-slate-500 hover:text-indigo-600 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5" />
              Marketing Landing Page
            </button>
          </div>
        )}
      </div>

      {/* BOTTOM USER PROFILE & SUPPORT */}
      <div className="p-3 border-t border-slate-200 bg-slate-50/50 space-y-2">
        {!collapsed && (
          <button
            onClick={() => alert("Support ticket created. Support team notified.")}
            className="w-full flex items-center gap-2 text-xs text-slate-600 hover:text-slate-900 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-slate-400" />
            <span>Help & Support</span>
          </button>
        )}

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-full bg-sky-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
              {currentUser?.avatarInitials || currentUser?.name?.slice(0, 2).toUpperCase() || "AU"}
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <span className="text-xs font-bold text-slate-900 block truncate">
                  {currentUser?.name || "Admin User"}
                </span>
                <span className="text-[10px] text-slate-500 block truncate font-medium">
                  {currentUser?.badge || currentUser?.title || "Lab Operations Manager"}
                </span>
              </div>
            )}
          </div>

          {!collapsed && (
            <button
              onClick={() => onNavigate("login")}
              className="text-slate-400 hover:text-red-600 p-1 rounded-md hover:bg-red-50 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
