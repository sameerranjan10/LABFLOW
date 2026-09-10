"use client";

import React, { useState } from "react";
import { Sidebar, NavView } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import { ToastContainer, ToastMessage } from "@/components/Toast";

import { DashboardView } from "@/components/views/DashboardView";
import { OrdersView } from "@/components/views/OrdersView";
import { SamplesView } from "@/components/views/SamplesView";
import { ProcessingView } from "@/components/views/ProcessingView";
import { ResultsView } from "@/components/views/ResultsView";
import { ReportsView } from "@/components/views/ReportsView";
import { AlertsView } from "@/components/views/AlertsView";
import { AuditTrailView } from "@/components/views/AuditTrailView";
import { TeamView } from "@/components/views/TeamView";
import { SettingsView } from "@/components/views/SettingsView";
import { LoginPage } from "@/components/views/LoginPage";
import { LandingPage } from "@/components/views/LandingPage";

import { CreateOrderModal } from "@/components/CreateOrderModal";
import { SampleDetailModal } from "@/components/SampleDetailModal";
import { ReportPreviewModal } from "@/components/ReportPreviewModal";

import {
  INITIAL_ORDERS,
  INITIAL_SAMPLES,
  INITIAL_EXCEPTIONS,
  INITIAL_WORKFLOW_STAGES,
  INITIAL_ALERTS,
  INITIAL_REPORTS,
  LabOrder,
  LabSample,
  LabReport,
  AlertItem,
} from "@/data/labflowData";

export const SplitScreenDashboard: React.FC = () => {
  const [currentView, setCurrentView] = useState<NavView>("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("Main Laboratory");

  // DATA STORES
  const [orders, setOrders] = useState<LabOrder[]>(INITIAL_ORDERS);
  const [samples, setSamples] = useState<LabSample[]>(INITIAL_SAMPLES);
  const [exceptions, setExceptions] = useState(INITIAL_EXCEPTIONS);
  const [workflowStages, setWorkflowStages] = useState(INITIAL_WORKFLOW_STAGES);
  const [alerts, setAlerts] = useState<AlertItem[]>(INITIAL_ALERTS);
  const [reports, setReports] = useState<LabReport[]>(INITIAL_REPORTS);

  // TOAST NOTIFICATIONS
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (title: string, message?: string, type: "success" | "warning" | "info" | "error" = "success") => {
    const newToast: ToastMessage = {
      id: `toast-${Date.now()}`,
      title,
      message,
      type,
    };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // MODAL STATES
  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false);
  const [selectedSampleDetail, setSelectedSampleDetail] = useState<LabSample | null>(null);
  const [selectedReportPreview, setSelectedReportPreview] = useState<LabReport | null>(null);

  // HANDLERS
  const handleCreateOrderSubmit = (newOrder: Partial<LabOrder>) => {
    const createdOrder = newOrder as LabOrder;
    setOrders((prev) => [createdOrder, ...prev]);

    // Create corresponding sample
    const createdSample: LabSample = {
      id: createdOrder.sampleId,
      orderId: createdOrder.id,
      patient: createdOrder.patient,
      sampleType: "Whole Blood (EDTA)",
      test: createdOrder.tests.join(", "),
      currentLocation: "Main Lab - Accessioning",
      stage: "ORDERED",
      collectedAt: createdOrder.createdAt,
      tat: "15m",
      status: "In Progress",
      barcode: `LBF-${createdOrder.patient.id}`,
      volume: "3.0 mL",
      timeline: [
        {
          id: `tl-new-${Date.now()}`,
          timestamp: createdOrder.createdAt,
          date: createdOrder.createdDate,
          event: "Order & Specimen Requisition Created",
          location: createdOrder.location,
          operator: "Admin User",
          details: "Barcode printed and queued for phlebotomy intake.",
          status: "active",
        },
      ],
    };
    setSamples((prev) => [createdSample, ...prev]);

    // Update workflow stage count
    setWorkflowStages((prev) =>
      prev.map((st) => (st.key === "ORDERED" ? { ...st, count: st.count + 1 } : st))
    );

    addToast("New Order Registered", `Order ${createdOrder.id} & Sample ${createdOrder.sampleId} created.`, "success");
  };

  const handleReleaseReport = (reportId: string) => {
    setReports((prev) =>
      prev.map((r) =>
        r.id === reportId ? { ...r, status: "Released", releasedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) } : r
      )
    );
    addToast("Report Released", `Diagnostic report ${reportId} digitally signed and dispatched.`, "success");
  };

  const handleDismissAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    addToast("Alert Acknowledged", "Exception dismissed from operational alert queue.", "info");
  };

  if (currentView === "login") {
    return (
      <LoginPage
        onLoginSuccess={() => {
          setCurrentView("dashboard");
          addToast("Authenticated Successfully", "Welcome back, Admin User.", "success");
        }}
        onRequestDemo={() => {
          alert("Demo request submitted! Our enterprise team will contact you.");
        }}
      />
    );
  }

  if (currentView === "landing") {
    return (
      <LandingPage
        onExplorePlatform={() => setCurrentView("dashboard")}
        onRequestDemo={() => {
          alert("Demo request submitted! Our enterprise team will contact you.");
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      <div className="flex-1 flex overflow-hidden">
        {/* SIDEBAR */}
        <div className={`md:block ${mobileMenuOpen ? "block absolute inset-y-0 left-0 z-40" : "hidden"}`}>
          <Sidebar
            currentView={currentView}
            onNavigate={(view) => {
              setCurrentView(view);
              setMobileMenuOpen(false);
            }}
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
            unreadAlertCount={alerts.length}
          />
        </div>

        {/* MAIN CONTENT CONTAINER */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50">
          {/* TOPBAR */}
          <Topbar
            currentView={currentView}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedLocation={selectedLocation}
            onLocationChange={setSelectedLocation}
            onOpenNotifications={() => setCurrentView("alerts")}
            unreadCount={alerts.length}
            onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
          />

          {/* VIEW SWITCHER */}
          <main className="flex-1 overflow-y-auto">
            {currentView === "dashboard" && (
              <DashboardView
                orders={orders}
                samples={samples}
                exceptions={exceptions}
                workflowStages={workflowStages}
                onOpenCreateOrder={() => setIsCreateOrderOpen(true)}
                onSelectSample={(sample) => setSelectedSampleDetail(sample)}
                onSelectOrder={() => setCurrentView("orders")}
                onNavigateToView={(view) => setCurrentView(view)}
              />
            )}

            {currentView === "orders" && (
              <OrdersView
                orders={orders}
                onOpenCreateOrder={() => setIsCreateOrderOpen(true)}
                onSelectOrder={() => addToast("Order Selected", "Viewing order requisition details.", "info")}
              />
            )}

            {currentView === "samples" && (
              <SamplesView
                samples={samples}
                onSelectSample={(sample) => setSelectedSampleDetail(sample)}
              />
            )}

            {currentView === "processing" && (
              <ProcessingView
                samples={samples}
                onSelectSample={(sample) => setSelectedSampleDetail(sample)}
                onNavigateToResults={() => setCurrentView("results")}
              />
            )}

            {currentView === "results" && (
              <ResultsView onNotify={addToast} />
            )}

            {currentView === "reports" && (
              <ReportsView
                reports={reports}
                onSelectReport={(report) => setSelectedReportPreview(report)}
                onReleaseReport={handleReleaseReport}
              />
            )}

            {currentView === "alerts" && (
              <AlertsView
                alerts={alerts}
                onDismissAlert={handleDismissAlert}
                onNavigateToView={(view) => setCurrentView(view)}
              />
            )}

            {currentView === "audit" && <AuditTrailView />}

            {currentView === "team" && <TeamView />}

            {currentView === "settings" && <SettingsView />}
          </main>
        </div>
      </div>

      {/* GLOBAL MODALS */}
      <CreateOrderModal
        isOpen={isCreateOrderOpen}
        onClose={() => setIsCreateOrderOpen(false)}
        onSubmitOrder={handleCreateOrderSubmit}
      />

      <SampleDetailModal
        sample={selectedSampleDetail}
        onClose={() => setSelectedSampleDetail(null)}
      />

      <ReportPreviewModal
        report={selectedReportPreview}
        onClose={() => setSelectedReportPreview(null)}
        onReleaseReport={handleReleaseReport}
      />

      {/* TOAST CONTAINER */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
};
