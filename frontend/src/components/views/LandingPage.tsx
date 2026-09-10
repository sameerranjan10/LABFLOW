"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FlaskConical,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Cpu,
  Barcode,
  FileSpreadsheet,
  Clock,
  ChevronRight,
  Activity,
  Layers,
  FileCheck2,
  Building2,
  Zap,
  TestTube2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Search,
  Bell,
  User,
  Settings,
  HelpCircle,
  LayoutDashboard,
  FileText,
  Compass,
  Send,
} from "lucide-react";

interface LandingPageProps {
  onGoToSignIn: () => void;
  onGoToSignUp: () => void;
  onExplorePlatform?: () => void;
}

// ----------------------------------------------------------------------
// DATA TYPES & DATA FOR HERO WORKFLOW PREVIEW MOCKUP
// ----------------------------------------------------------------------
interface HeroStepData {
  id: string;
  name: string;
  badge: string;
  icon: React.ElementType;
  description: string;
  sampleTests: { name: string; tag: string; icon: string }[];
}

const HERO_STEPS: HeroStepData[] = [
  {
    id: "request",
    name: "Test Request",
    badge: "Requisition Ingested",
    icon: FileSpreadsheet,
    description: "New test order created and registered in the system queue.",
    sampleTests: [
      { name: "Complete Blood Count (CBC)", tag: "Hematology", icon: "🩸" },
      { name: "Blood Glucose", tag: "Biochemistry", icon: "💧" },
      { name: "Lipid Profile", tag: "Lipids", icon: "🧪" },
    ],
  },
  {
    id: "collection",
    name: "Sample Collection",
    badge: "In Progress",
    icon: TestTube2,
    description: "Sample collected and registered with unique barcode in the system.",
    sampleTests: [
      { name: "Complete Blood Count (CBC)", tag: "EDTA Tube", icon: "🩸" },
      { name: "Blood Glucose", tag: "Fluoride Tube", icon: "💧" },
      { name: "Lipid Profile", tag: "SST Tube", icon: "🧪" },
    ],
  },
  {
    id: "processing",
    name: "Processing",
    badge: "Preparation Active",
    icon: Cpu,
    description: "Specimen centrifuging and auto-routing to target analyzer line.",
    sampleTests: [
      { name: "Complete Blood Count (CBC)", tag: "Centrifuged", icon: "🩸" },
      { name: "Blood Glucose", tag: "Aliquoted", icon: "💧" },
      { name: "Lipid Profile", tag: "Prepped", icon: "🧪" },
    ],
  },
  {
    id: "testing",
    name: "Testing",
    badge: "Assays Running",
    icon: FlaskConical,
    description: "Analyzer executing assays with real-time QC interval monitoring.",
    sampleTests: [
      { name: "Complete Blood Count (CBC)", tag: "Running", icon: "🩸" },
      { name: "Blood Glucose", tag: "Running", icon: "💧" },
      { name: "Lipid Profile", tag: "Queued", icon: "🧪" },
    ],
  },
  {
    id: "result",
    name: "Result Ready",
    badge: "Verified",
    icon: FileCheck2,
    description: "Values validated against biological ranges and ready for sign-off.",
    sampleTests: [
      { name: "Complete Blood Count (CBC)", tag: "Verified", icon: "🩸" },
      { name: "Blood Glucose", tag: "Normal Range", icon: "💧" },
      { name: "Lipid Profile", tag: "Ready", icon: "🧪" },
    ],
  },
];

// ----------------------------------------------------------------------
// DATA FOR SECTION 2: HOW IT WORKS (5 HORIZONTAL CONNECTED STEPS)
// ----------------------------------------------------------------------
interface HowItWorksStep {
  number: string;
  title: string;
  description: string;
  icon: React.ElementType;
  detailPreview: string;
}

const HOW_IT_WORKS_STEPS: HowItWorksStep[] = [
  {
    number: "01",
    title: "Test Request",
    description: "Create a test order with patient and test information.",
    icon: FileSpreadsheet,
    detailPreview: "Order requisitions auto-indexed with department and priority tags.",
  },
  {
    number: "02",
    title: "Sample Collection",
    description: "Record sample collection and assign it to the workflow.",
    icon: TestTube2,
    detailPreview: "Unique barcode assigned to maintain continuous chain of custody.",
  },
  {
    number: "03",
    title: "Processing",
    description: "Track the sample as it moves through laboratory processing.",
    icon: Cpu,
    detailPreview: "Automated accessioning, centrifuging, and analyzer line routing.",
  },
  {
    number: "04",
    title: "Testing",
    description: "Manage testing status and laboratory workflow.",
    icon: FlaskConical,
    detailPreview: "Bi-directional HL7 analyzer interface feeds live assay data.",
  },
  {
    number: "05",
    title: "Results",
    description: "Record and review test results before reporting.",
    icon: FileCheck2,
    detailPreview: "Digital sign-off and instant FHIR-compliant diagnostic bundle release.",
  },
];

// ----------------------------------------------------------------------
// DATA FOR SECTION 3: FEATURES (6 CARDS WITH VIBRANT ICON BADGES)
// ----------------------------------------------------------------------
interface FeatureCardData {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  expandedInfo: string;
}

const FEATURE_CARDS: FeatureCardData[] = [
  {
    id: "requests",
    title: "Patient & Test Requests",
    description: "Create and manage patient test orders easily.",
    icon: FileSpreadsheet,
    iconBg: "bg-sky-100 border border-sky-200/80",
    iconColor: "text-sky-600",
    expandedInfo: "Intuitive requisition entry with automatic panel bundling, STAT priority flags, and doctor referral tags.",
  },
  {
    id: "tracking",
    title: "Sample Tracking",
    description: "Track every sample from collection to testing.",
    icon: TestTube2,
    iconBg: "bg-teal-100 border border-teal-200/80",
    iconColor: "text-teal-600",
    expandedInfo: "End-to-end barcode scanning, container volume verification, and real-time specimen location audit trail.",
  },
  {
    id: "workflow",
    title: "Smart Workflow",
    description: "Automatically organize laboratory processes.",
    icon: Cpu,
    iconBg: "bg-indigo-100 border border-indigo-200/80",
    iconColor: "text-indigo-600",
    expandedInfo: "Bi-directional auto-analyzer interfaces route samples to designated testing benches without manual entry.",
  },
  {
    id: "management",
    title: "Test Management",
    description: "Manage tests, priorities, and processing status.",
    icon: Layers,
    iconBg: "bg-amber-100 border border-amber-200/80",
    iconColor: "text-amber-600",
    expandedInfo: "Configurable biological reference intervals, delta checks against patient history, and department queue control.",
  },
  {
    id: "results",
    title: "Results & Reports",
    description: "Record results and generate clear reports.",
    icon: FileCheck2,
    iconBg: "bg-emerald-100 border border-emerald-200/80",
    iconColor: "text-emerald-600",
    expandedInfo: "Automated panic value detection, pathologist digital sign-off, and FHIR R4 JSON & PDF report generation.",
  },
  {
    id: "dashboard",
    title: "Real-Time Dashboard",
    description: "Monitor laboratory activity from one place.",
    icon: Activity,
    iconBg: "bg-purple-100 border border-purple-200/80",
    iconColor: "text-purple-600",
    expandedInfo: "High-level overview of live specimen stages, turnaround times, exception alerts, and operational benchmarks.",
  },
];

// ----------------------------------------------------------------------
// MAIN LANDING PAGE COMPONENT
// ----------------------------------------------------------------------
export const LandingPage: React.FC<LandingPageProps> = ({
  onGoToSignIn,
  onGoToSignUp,
  onExplorePlatform,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // HERO STEPPER ACTIVE STATE
  const [activeHeroStepId, setActiveHeroStepId] = useState<string>("collection");
  const activeHeroStep = HERO_STEPS.find((s) => s.id === activeHeroStepId) || HERO_STEPS[1];

  // HOW IT WORKS ACTIVE STEP
  const [activeHowStepIndex, setActiveHowStepIndex] = useState<number>(1);
  const activeHowStep = HOW_IT_WORKS_STEPS[activeHowStepIndex];

  // EXPANDED FEATURE STATE
  const [expandedFeatureId, setExpandedFeatureId] = useState<string | null>(null);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 selection:bg-sky-500 selection:text-white font-sans antialiased">
      {/* NAVBAR */}
      <header
        className={`h-18 fixed top-0 left-0 right-0 z-40 transition-all duration-300 px-6 lg:px-16 flex items-center justify-between ${
          isScrolled
            ? "bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs"
            : "bg-transparent border-b border-transparent"
        }`}
      >
        {/* LOGO */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex items-center gap-2.5 cursor-pointer text-left focus:outline-none group"
        >
          <div className="w-9 h-9 rounded-xl bg-sky-600 flex items-center justify-center text-white shadow-xs group-hover:bg-sky-700 transition-colors">
            <FlaskConical className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-black tracking-tight text-slate-900">
            LabFlow
          </span>
        </button>

        {/* NAV LINKS */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-600">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="text-sky-600 font-bold hover:text-sky-700 transition-colors cursor-pointer"
          >
            Home
          </button>
          <button
            onClick={() => scrollToSection("features")}
            className="hover:text-sky-600 transition-colors cursor-pointer"
          >
            Features
          </button>
          <button
            onClick={() => scrollToSection("how-it-works")}
            className="hover:text-sky-600 transition-colors cursor-pointer"
          >
            How It Works
          </button>
          <button
            onClick={() => scrollToSection("about")}
            className="hover:text-sky-600 transition-colors cursor-pointer"
          >
            About
          </button>
        </nav>

        {/* RIGHT BUTTONS */}
        <div className="flex items-center gap-3">
          <button
            onClick={onGoToSignIn}
            className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-sky-600 transition-colors cursor-pointer"
          >
            Sign In
          </button>
          <button
            onClick={onGoToSignUp}
            className="px-4.5 py-2.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5 hover:-translate-y-0.5"
          >
            Get Started
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="pt-28 pb-16 lg:pt-36 lg:pb-24 px-6 lg:px-16 max-w-7xl mx-auto relative bg-[#F8FAFC]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          {/* LEFT HERO TEXT */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-5 space-y-6 text-left"
          >
            {/* PILL BADGE */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-100/80 border border-sky-200 text-sky-800 text-xs font-bold">
              Laboratory Management Platform
            </div>

            {/* HEADLINE */}
            <h1 className="text-4xl sm:text-5xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.1]">
              Every test.<br />
              One connected<br />
              <span className="text-sky-600">workflow.</span>
            </h1>

            {/* SUBTITLE */}
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
              LabFlow streamlines laboratory operations by connecting patient requests, sample tracking, testing, and results in one intelligent workspace.
            </p>

            {/* HERO BUTTONS */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onGoToSignUp}
                className="px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-md shadow-sky-600/20 transition-all flex items-center gap-2 cursor-pointer hover:-translate-y-0.5"
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => scrollToSection("how-it-works")}
                className="px-5 py-3 bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs rounded-xl border border-slate-300/80 shadow-2xs transition-all cursor-pointer flex items-center gap-2 hover:-translate-y-0.5"
              >
                <Compass className="w-4 h-4 text-sky-600" />
                Explore Workflow
              </button>
            </div>

            {/* 4 VIBRANT BENEFIT PILLS UNDER HERO TEXT */}
            <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-white border border-sky-100 shadow-2xs space-y-1.5">
                <div className="w-9 h-9 rounded-full bg-sky-100 border border-sky-200 text-sky-600 flex items-center justify-center">
                  <Zap className="w-4.5 h-4.5" />
                </div>
                <span className="text-[11px] font-bold text-slate-900 leading-tight">Faster<br />Workflow</span>
              </div>

              <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-white border border-teal-100 shadow-2xs space-y-1.5">
                <div className="w-9 h-9 rounded-full bg-teal-100 border border-teal-200 text-teal-600 flex items-center justify-center">
                  <Barcode className="w-4.5 h-4.5" />
                </div>
                <span className="text-[11px] font-bold text-slate-900 leading-tight">Real-Time<br />Tracking</span>
              </div>

              <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-white border border-indigo-100 shadow-2xs space-y-1.5">
                <div className="w-9 h-9 rounded-full bg-indigo-100 border border-indigo-200 text-indigo-600 flex items-center justify-center">
                  <Building2 className="w-4.5 h-4.5" />
                </div>
                <span className="text-[11px] font-bold text-slate-900 leading-tight">Centralized<br />Records</span>
              </div>

              <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-white border border-emerald-100 shadow-2xs space-y-1.5">
                <div className="w-9 h-9 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-600 flex items-center justify-center">
                  <Cpu className="w-4.5 h-4.5" />
                </div>
                <span className="text-[11px] font-bold text-slate-900 leading-tight">Automated<br />Processes</span>
              </div>
            </div>
          </motion.div>

          {/* RIGHT HERO VISUAL (MOCKUP WITH HANDWRITTEN SCRIPT & APP CONTAINER) */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="lg:col-span-7 relative"
          >
            {/* HANDWRITTEN SCRIPT OVERLAY TOP RIGHT */}
            <div className="absolute -top-10 right-4 z-20 pointer-events-none hidden sm:block">
              <div className="relative text-sky-700 font-serif italic text-sm font-semibold tracking-wide">
                <span>From Samples to Smiles</span>
                <svg className="w-20 h-6 absolute -bottom-4 right-0 text-sky-400 opacity-75" viewBox="0 0 100 30" fill="none">
                  <path d="M5 25 C 30 5, 70 35, 95 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
            </div>

            {/* DUAL-PANEL DASHBOARD APP WINDOW */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xl shadow-sky-950/15 overflow-hidden flex flex-col md:flex-row font-sans text-slate-900">
              {/* DARK NAVY SIDEBAR */}
              <div className="w-full md:w-44 bg-[#0F172A] text-slate-300 p-4 flex flex-col justify-between border-r border-slate-800 shrink-0">
                <div className="space-y-4">
                  {/* SIDEBAR BRAND */}
                  <div className="flex items-center gap-2 px-1">
                    <div className="w-6 h-6 rounded-lg bg-sky-500 text-white flex items-center justify-center">
                      <FlaskConical className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-sm font-bold text-white tracking-tight">LabFlow</span>
                  </div>

                  {/* NAV ITEMS */}
                  <nav className="space-y-1 text-xs">
                    <div className="px-2.5 py-1.5 rounded-lg bg-sky-600 text-white font-bold flex items-center gap-2 shadow-xs">
                      <LayoutDashboard className="w-3.5 h-3.5" />
                      <span>Dashboard</span>
                    </div>
                    <div className="px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-white flex items-center gap-2">
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      <span>Requests</span>
                    </div>
                    <div className="px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-white flex items-center gap-2">
                      <TestTube2 className="w-3.5 h-3.5" />
                      <span>Samples</span>
                    </div>
                    <div className="px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-white flex items-center gap-2">
                      <Cpu className="w-3.5 h-3.5" />
                      <span>Testing</span>
                    </div>
                    <div className="px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-white flex items-center gap-2">
                      <FileCheck2 className="w-3.5 h-3.5" />
                      <span>Results</span>
                    </div>
                    <div className="px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-white flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5" />
                      <span>Reports</span>
                    </div>
                  </nav>
                </div>

                <div className="pt-4 border-t border-slate-800 space-y-1 text-xs text-slate-400">
                  <div className="px-2.5 py-1 flex items-center gap-2 hover:text-white">
                    <Settings className="w-3.5 h-3.5" /> Settings
                  </div>
                  <div className="px-2.5 py-1 flex items-center gap-2 hover:text-white">
                    <HelpCircle className="w-3.5 h-3.5" /> Help
                  </div>
                </div>
              </div>

              {/* MAIN APP CANVAS */}
              <div className="flex-1 p-5 bg-slate-50/70 space-y-4 min-w-0">
                {/* SEARCH & USER BAR */}
                <div className="flex items-center justify-between gap-3 text-xs">
                  <div className="relative flex-1 max-w-xs">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
                    <input
                      type="text"
                      readOnly
                      placeholder="Search anything..."
                      className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white border border-slate-200 text-[11px] text-slate-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded-md bg-white border border-slate-200 text-slate-400">
                      <Bell className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-2 py-1 rounded-lg">
                      <div className="w-5 h-5 rounded-full bg-sky-600 text-white font-bold text-[10px] flex items-center justify-center">
                        U
                      </div>
                      <div className="text-[10px] text-left leading-tight hidden sm:block">
                        <span className="font-bold text-slate-800 block">Lab User</span>
                        <span className="text-slate-400 block text-[9px]">Laboratory</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* WORKFLOW OVERVIEW TITLE & HORIZONTAL STEPPER */}
                <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs space-y-3">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">Workflow Overview</h3>
                    <p className="text-[10px] text-slate-500">Track each sample from request to result</p>
                  </div>

                  {/* STEPPER PROGRESS LINE & BUTTONS */}
                  <div className="grid grid-cols-5 gap-1 text-[9px] font-bold text-slate-500 text-center relative pt-2">
                    {HERO_STEPS.map((st, idx) => {
                      const isActive = st.id === activeHeroStepId;
                      const isPast = HERO_STEPS.findIndex((s) => s.id === activeHeroStepId) > idx;

                      return (
                        <button
                          key={st.id}
                          onClick={() => setActiveHeroStepId(st.id)}
                          className="flex flex-col items-center gap-1 cursor-pointer focus:outline-none"
                        >
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] transition-all ${
                              isPast
                                ? "bg-emerald-500 text-white"
                                : isActive
                                ? "bg-sky-600 text-white ring-2 ring-sky-200 shadow-xs"
                                : "bg-slate-100 text-slate-400 border border-slate-200"
                            }`}
                          >
                            {isPast ? "✓" : idx + 1}
                          </div>
                          <span className={`truncate w-full ${isActive ? "text-sky-600 font-bold" : "text-slate-500"}`}>
                            {st.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* ACTIVE SAMPLE CARD PREVIEW */}
                <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-sky-100 border border-sky-200 text-sky-600 flex items-center justify-center shrink-0">
                      <TestTube2 className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        {activeHeroStep.name}
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        {activeHeroStep.description}
                      </span>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                        {activeHeroStep.badge}
                      </span>
                    </div>
                  </div>

                  <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center shrink-0">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>

                {/* 3 SAMPLE TEST CARDS */}
                <div className="grid grid-cols-3 gap-2">
                  {activeHeroStep.sampleTests.map((t, i) => (
                    <div
                      key={i}
                      className="bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs space-y-1 text-left hover:border-sky-300 transition-colors"
                    >
                      <div className="w-5 h-5 rounded-md bg-sky-50 text-sky-600 flex items-center justify-center text-[10px] font-bold">
                        {t.icon}
                      </div>
                      <span className="text-[10px] font-bold text-slate-900 block truncate">
                        {t.name}
                      </span>
                      <div className="flex items-center justify-between text-[9px] text-slate-400 pt-1">
                        <span className="truncate">{t.tag}</span>
                        <ChevronRight className="w-3 h-3 text-sky-500" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* FLOATING BADGE BOTTOM RIGHT */}
            <div className="absolute -bottom-6 -right-2 z-20 hidden sm:flex items-center gap-2 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-sky-200/80 shadow-xl text-xs font-semibold text-slate-800">
              <Sparkles className="w-4 h-4 text-sky-500 animate-pulse" />
              <span>A smoother lab workflow for a healthier tomorrow.</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SECTION 2: HOW IT WORKS (5 HORIZONTAL CONNECTED STEPS WITH SLATE BACKDROP) */}
      <section id="how-it-works" className="py-16 lg:py-24 bg-slate-100/80 border-y border-slate-200/80 relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-16 space-y-12 text-center">
          {/* BADGE & HEADLINE */}
          <div className="space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-100 text-sky-800 text-xs font-bold uppercase tracking-wider border border-sky-200">
              HOW IT WORKS
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              See How LabFlow Works
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              From test request to final result, every step stays connected.
            </p>
          </div>

          {/* 5 HORIZONTAL CONNECTED CIRCULAR STEPS */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative items-start">
            {HOW_IT_WORKS_STEPS.map((stp, idx) => {
              const IconComp = stp.icon;
              const isActive = idx === activeHowStepIndex;

              return (
                <div key={stp.number} className="relative flex flex-col items-center text-center space-y-3 group">
                  {/* ARROW CONNECTOR FOR DESKTOP */}
                  {idx < HOW_IT_WORKS_STEPS.length - 1 && (
                    <div className="hidden md:block absolute top-7 left-[60%] right-[-40%] z-0 text-slate-300">
                      <ArrowRight className="w-5 h-5 mx-auto text-slate-300" />
                    </div>
                  )}

                  {/* CIRCULAR ICON BUTTON */}
                  <button
                    onClick={() => setActiveHowStepIndex(idx)}
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center z-10 transition-all cursor-pointer ${
                      isActive
                        ? "bg-sky-600 text-white shadow-lg shadow-sky-500/30 scale-105 ring-4 ring-sky-100"
                        : "bg-white text-sky-600 hover:bg-sky-50 border border-sky-200/80 shadow-xs"
                    }`}
                  >
                    <IconComp className="w-6 h-6" />
                  </button>

                  {/* STEP NUMBER & TITLE */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-black text-slate-400 block">
                      {stp.number}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 block">
                      {stp.title}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed max-w-[180px] mx-auto">
                      {stp.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ACTIVE STEP DETAILS PREVIEW CARD */}
          <div className="max-w-2xl mx-auto p-5 rounded-2xl bg-white border-l-4 border-l-sky-600 border border-slate-200 shadow-md text-left flex items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 block">
                Step {activeHowStep.number} — {activeHowStep.title}
              </span>
              <p className="text-xs text-slate-700 font-medium">
                {activeHowStep.detailPreview}
              </p>
            </div>
            <button
              onClick={() => setActiveHowStepIndex((prev) => (prev + 1) % HOW_IT_WORKS_STEPS.length)}
              className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shrink-0 shadow-xs"
            >
              Next Step →
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 3: FEATURES (EVERYTHING YOUR LAB NEEDS, IN ONE PLACE) */}
      <section id="features" className="py-16 lg:py-24 max-w-7xl mx-auto px-6 lg:px-16 space-y-12 bg-white">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 text-left max-w-xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-100 text-sky-800 text-xs font-bold uppercase tracking-wider border border-sky-200">
              FEATURES
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Everything Your Lab Needs, In One Place
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Powerful features to simplify and automate your laboratory operations.
            </p>
          </div>

          <button
            onClick={() => scrollToSection("features")}
            className="px-4 py-2.5 rounded-xl border border-slate-300/80 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-2 transition-colors cursor-pointer self-start md:self-auto"
          >
            View All Features
            <ArrowRight className="w-4 h-4 text-sky-600" />
          </button>
        </div>

        {/* 6 FEATURE CARDS GRID WITH COLORFUL ICON BADGES */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURE_CARDS.map((ft) => {
            const IconComp = ft.icon;
            const isExpanded = expandedFeatureId === ft.id;

            return (
              <motion.div
                key={ft.id}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2 }}
                onClick={() => setExpandedFeatureId(isExpanded ? null : ft.id)}
                className={`p-6 rounded-2xl bg-slate-50/50 border transition-all cursor-pointer flex flex-col justify-between gap-4 ${
                  isExpanded
                    ? "bg-white border-sky-500 shadow-md ring-2 ring-sky-500/20"
                    : "border-slate-200/90 hover:bg-white hover:border-sky-300 shadow-2xs hover:shadow-lg"
                }`}
              >
                <div className="space-y-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${ft.iconBg}`}>
                    <IconComp className={`w-5 h-5 ${ft.iconColor}`} />
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900">{ft.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed mt-1">{ft.description}</p>
                  </div>

                  {/* EXPANDED TEXT */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="pt-2 border-t border-slate-100 text-xs text-slate-600"
                      >
                        {ft.expandedInfo}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex justify-end pt-2">
                  <div className="w-7 h-7 rounded-full bg-white border border-slate-200 text-slate-400 group-hover:text-sky-600 flex items-center justify-center transition-colors shadow-2xs">
                    <ArrowRight className="w-3.5 h-3.5 text-sky-500" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* SECTION 4: CTA SPLIT BANNER ("FOR A HEALTHIER TOMORROW") */}
      <section className="py-16 max-w-7xl mx-auto px-6 lg:px-16">
        <div className="bg-gradient-to-r from-sky-100 via-blue-100 to-sky-200 rounded-3xl border border-sky-300/80 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch">
          {/* LEFT MICROSCOPE IMAGE WITH HANDWRITTEN SCRIPT */}
          <div className="lg:col-span-5 relative min-h-[260px] lg:min-h-full overflow-hidden bg-slate-900">
            <img
              src="https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=800&q=80"
              alt="Microscope Laboratory"
              className="w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-500"
            />
            {/* OVERLAY SCRIPT TEXT */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent flex items-end p-6">
              <div className="text-white font-serif italic text-lg font-bold tracking-wide">
                <span>Better Labs Brighter Lives</span>
                <svg className="w-24 h-4 text-sky-400 opacity-80 mt-1" viewBox="0 0 100 20" fill="none">
                  <path d="M5 15 C 40 2, 60 18, 95 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
            </div>
          </div>

          {/* RIGHT CALL-TO-ACTION TEXT */}
          <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center space-y-5 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-sky-300/80 text-sky-800 text-xs font-bold uppercase tracking-wider self-start shadow-2xs">
              FOR A HEALTHIER TOMORROW
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              Bring Your Laboratory Workflow Into One Place.
            </h2>

            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed max-w-lg">
              Start managing laboratory operations faster, smarter, and more efficiently with LabFlow.
            </p>

            <div>
              <button
                onClick={onGoToSignUp}
                className="px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-md shadow-sky-600/20 transition-all flex items-center gap-2 cursor-pointer hover:-translate-y-0.5"
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: DARK NAVY FOOTER FOR STRONG VISUAL GROUNDING */}
      <footer className="py-12 bg-[#0F172A] text-slate-300 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-6 lg:px-16 grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
          {/* BRAND BIO & SOCIALS */}
          <div className="md:col-span-2 space-y-4 text-left">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-sky-500 text-white flex items-center justify-center font-bold">
                <FlaskConical className="w-4.5 h-4.5" />
              </div>
              <span className="text-xl font-black text-white tracking-tight">LabFlow</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              A modern laboratory management platform for smarter workflows and better healthcare.
            </p>

            <div className="flex items-center gap-3 text-slate-400">
              <a href="#" onClick={(e) => e.preventDefault()} aria-label="GitHub" className="hover:text-sky-400 transition-colors">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
              </a>
              <a href="#" onClick={(e) => e.preventDefault()} aria-label="LinkedIn" className="hover:text-sky-400 transition-colors">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/></svg>
              </a>
              <a href="#" onClick={(e) => e.preventDefault()} aria-label="Twitter" className="hover:text-sky-400 transition-colors">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.05c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/></svg>
              </a>
              <a href="#" onClick={(e) => e.preventDefault()} aria-label="YouTube" className="hover:text-sky-400 transition-colors">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
            </div>
          </div>

          {/* PRODUCT */}
          <div className="space-y-2 text-left">
            <h4 className="text-xs font-bold text-white">Product</h4>
            <ul className="space-y-1.5 text-slate-400">
              <li><button onClick={() => scrollToSection("features")} className="hover:text-white cursor-pointer">Features</button></li>
              <li><button onClick={() => scrollToSection("how-it-works")} className="hover:text-white cursor-pointer">How It Works</button></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); alert("LabFlow Pricing details."); }} className="hover:text-white">Pricing</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); alert("LabFlow Frequently Asked Questions."); }} className="hover:text-white">FAQ</a></li>
            </ul>
          </div>

          {/* COMPANY */}
          <div className="space-y-2 text-left">
            <h4 className="text-xs font-bold text-white">Company</h4>
            <ul className="space-y-1.5 text-slate-400">
              <li><button onClick={() => scrollToSection("about")} className="hover:text-white cursor-pointer">About</button></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); alert("LabFlow Careers."); }} className="hover:text-white">Careers</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); alert("Contact support@labflow.io"); }} className="hover:text-white">Contact</a></li>
            </ul>
          </div>

          {/* STAY UPDATED SUBSCRIBE */}
          <div className="space-y-2 text-left">
            <h4 className="text-xs font-bold text-white">Stay Updated</h4>
            <p className="text-[11px] text-slate-400">Get the latest updates and news.</p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert("Subscribed successfully to LabFlow updates!");
              }}
              className="flex items-center gap-1.5 pt-1"
            >
              <input
                type="email"
                required
                placeholder="Enter your email"
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <button
                type="submit"
                className="p-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white shrink-0 cursor-pointer transition-colors"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* BOTTOM COPYRIGHT ROW */}
        <div className="max-w-7xl mx-auto px-6 lg:px-16 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-400 text-[11px]">
          <span>© 2026 LabFlow. All rights reserved.</span>
          <span>Smarter Labs. Healthier Tomorrows.</span>
        </div>
      </footer>
    </div>
  );
};
