"use client";

import React, { useState, useEffect } from "react";
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
import { SignupPage } from "@/components/views/SignupPage";
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
import { LabUser, PRESET_LAB_USERS } from "@/lib/roles";

interface SplitScreenDashboardProps {
  initialView?: NavView;
}

export const SplitScreenDashboard: React.FC<SplitScreenDashboardProps> = ({
  initialView = "dashboard",
}) => {
  const [currentView, setCurrentView] = useState<NavView>(initialView);
  const [currentUser, setCurrentUser] = useState<LabUser>(PRESET_LAB_USERS.administrator);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("Main Reference Lab (Central)");

  const navigateTo = (view: NavView) => {
    setCurrentView(view);
    if (typeof window !== "undefined") {
      const targetPath = view === "dashboard" ? "/" : `/${view}`;
      window.history.pushState(null, "", targetPath);
    }
  };

  const handleSelectUser = (user: LabUser) => {
    setCurrentUser(user);
    if (user.role === "patient") {
      navigateTo("reports");
      addToast("Patient Portal Activated", `Logged in as ${user.name}. Viewing your diagnostic reports.`, "info");
    } else {
      addToast("Persona Switched", `Active user: ${user.name} (${user.badge})`, "success");
    }
  };

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

  // LIVE DATABASE INITIALIZATION (PHASE 3)
  useEffect(() => {
    async function loadDataFromDb() {
      try {
        const [ordersRes, samplesRes, reportsRes] = await Promise.all([
          fetch("/api/orders"),
          fetch("/api/samples"),
          fetch("/api/reports"),
        ]);
        if (ordersRes.ok) {
          const ordData = await ordersRes.json();
          if (ordData.orders && ordData.orders.length > 0) {
            setOrders(ordData.orders);
          }
        }
        if (samplesRes.ok) {
          const smpData = await samplesRes.json();
          if (smpData.samples && smpData.samples.length > 0) {
            setSamples(smpData.samples);
          }
        }
        if (reportsRes.ok) {
          const repData = await reportsRes.json();
          if (repData.reports && repData.reports.length > 0) {
            setReports(repData.reports);
          }
        }
      } catch (err) {
        console.warn("Using local fallback store:", err);
      }
    }
    loadDataFromDb();
  }, []);

  // MODAL STATES
  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false);
  const [selectedSampleDetail, setSelectedSampleDetail] = useState<LabSample | null>(null);
  const [selectedReportPreview, setSelectedReportPreview] = useState<LabReport | null>(null);

  // HANDLERS WITH PERSISTENCE (PHASE 3)
  const handleCreateOrderSubmit = async (newOrder: Partial<LabOrder>) => {
    const createdOrder = newOrder as LabOrder;

    // Persist via Backend API
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createdOrder),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.order) setOrders((prev) => [data.order, ...prev]);
        if (data.sample) setSamples((prev) => [data.sample, ...prev]);

        setWorkflowStages((prev) =>
          prev.map((st) => (st.key === "ORDERED" ? { ...st, count: st.count + 1 } : st))
        );

        addToast("Order Persisted to Database", `Order ${createdOrder.id} & Sample ${createdOrder.sampleId} written to disk.`, "success");
        return;
      }
    } catch (e) {
      console.warn("Database POST error, falling back to local state:", e);
    }

    // Local fallback
    setOrders((prev) => [createdOrder, ...prev]);
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
    setWorkflowStages((prev) =>
      prev.map((st) => (st.key === "ORDERED" ? { ...st, count: st.count + 1 } : st))
    );
    addToast("New Order Registered", `Order ${createdOrder.id} & Sample ${createdOrder.sampleId} created.`, "success");
  };

  const handleReleaseReport = async (reportId: string) => {
    setReports((prev) =>
      prev.map((r) =>
        r.id === reportId ? { ...r, status: "Released", releasedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) } : r
      )
    );

    try {
      await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId, signedBy: currentUser.name }),
      });
    } catch (e) {
      console.warn("Report release sync error:", e);
    }

    addToast("Report Released & Persisted", `Diagnostic report ${reportId} digitally signed and saved in database.`, "success");
  };

  const handleDismissAlert = async (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    try {
      await fetch(`/api/alerts?id=${id}`, { method: "DELETE" });
    } catch (e) {
      console.warn("Dismiss alert error:", e);
    }
    addToast("Alert Acknowledged", "Exception dismissed from operational alert queue.", "info");
  };

  if (currentView === "login") {
    return (
      <LoginPage
        onLoginSuccess={() => {
          setCurrentView("dashboard");
          addToast("Authenticated Successfully", "Welcome back, Admin User.", "success");
        }}
        onGoToSignUp={() => setCurrentView("signup")}
        onGoToLanding={() => setCurrentView("landing")}
      />
    );
  }

  if (currentView === "signup") {
    return (
      <SignupPage
        onSignUpSuccess={() => {
          setCurrentView("dashboard");
          addToast("Account Created", "Welcome to LabFlow! Your laboratory workspace is ready.", "success");
        }}
        onGoToLogin={() => setCurrentView("login")}
        onGoToLanding={() => setCurrentView("landing")}
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
              navigateTo(view);
              setMobileMenuOpen(false);
            }}
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
            unreadAlertCount={alerts.length}
            currentRole={currentUser.role}
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
            onOpenNotifications={() => navigateTo("alerts")}
            unreadCount={alerts.length}
            onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
            currentUser={currentUser}
            onSelectUser={handleSelectUser}
            orders={orders}
            samples={samples}
            reports={reports}
            onNavigate={(view) => navigateTo(view)}
            onSelectSample={(sample) => setSelectedSampleDetail(sample)}
            onSelectReport={(report) => setSelectedReportPreview(report)}
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
                onSelectOrder={() => navigateTo("orders")}
                onNavigateToView={(view) => navigateTo(view)}
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
                onNavigateToResults={() => navigateTo("results")}
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
                onNavigateToView={(view) => navigateTo(view)}
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
        onSampleUpdated={(updated) => {
          setSamples((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
          setOrders((prev) =>
            prev.map((o) =>
              o.sampleId === updated.id
                ? { ...o, currentStage: updated.stage, status: updated.status === "Completed" ? "Completed" : "In Progress" }
                : o
            )
          );
          addToast("Specimen Chain of Custody Updated", `Sample ${updated.id} stage is now ${updated.stage}.`, "info");
        }}
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
