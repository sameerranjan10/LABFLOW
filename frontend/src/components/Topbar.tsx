import React from "react";
import { Search, MapPin, Bell, User, ChevronRight, Menu } from "lucide-react";
import { NavView } from "@/components/Sidebar";

interface TopbarProps {
  currentView: NavView;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedLocation: string;
  onLocationChange: (loc: string) => void;
  onOpenNotifications: () => void;
  unreadCount?: number;
  onMobileMenuToggle?: () => void;
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
}) => {
  const getBreadcrumbTitle = () => {
    switch (currentView) {
      case "dashboard":
        return "Operations Overview";
      case "orders":
        return "Order Management";
      case "samples":
        return "Specimen Tracking";
      case "processing":
        return "Laboratory Processing";
      case "results":
        return "Result Verification";
      case "reports":
        return "Report Release";
      case "alerts":
        return "Exception & Alert Center";
      case "audit":
        return "Compliance Audit Trail";
      case "team":
        return "Staff & Operations Team";
      case "settings":
        return "Platform Settings";
      case "login":
        return "Enterprise Authentication";
      case "landing":
        return "B2B Operations Overview";
      default:
        return "Dashboard";
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
            placeholder="Search patient name, order ID, sample ID, barcode..."
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

      {/* RIGHT: LOCATION SELECTOR, NOTIFICATIONS, PROFILE */}
      <div className="flex items-center gap-3">
        {/* LOCATION SELECTOR */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 text-xs">
          <MapPin className="w-3.5 h-3.5 text-indigo-600" />
          <select
            value={selectedLocation}
            onChange={(e) => onLocationChange(e.target.value)}
            className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer"
          >
            <option value="Main Laboratory">Main Laboratory</option>
            <option value="Collection Center A">Collection Center A</option>
            <option value="Collection Center B">Collection Center B</option>
            <option value="Emergency Lab">Emergency Lab</option>
            <option value="North Satellite Clinic">North Satellite Clinic</option>
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

        {/* USER PROFILE */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold text-xs flex items-center justify-center">
            AU
          </div>
          <div className="hidden xl:block text-left">
            <span className="text-xs font-bold text-slate-900 block leading-none">
              Admin User
            </span>
            <span className="text-[10px] text-slate-500 block mt-0.5 leading-none">
              Main Laboratory
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
