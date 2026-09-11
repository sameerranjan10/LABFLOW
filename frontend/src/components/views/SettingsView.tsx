"use client";

import React, { useState, useEffect } from "react";
import {
  Building2,
  TestTube2,
  ShieldCheck,
  Save,
  CreditCard,
  CheckCircle2,
  Download,
  Plus,
  Clock,
  Sparkles,
  Zap,
  X,
} from "lucide-react";
import { LAB_ROLES_PERMISSIONS, PRESET_LAB_USERS, LabRole } from "@/lib/roles";

interface TestCatalogItem {
  code: string;
  name: string;
  loinc: string;
  dept: string;
  tat: string;
  price: string;
  status: string;
}

const INITIAL_TEST_CATALOG: TestCatalogItem[] = [
  { code: "CBC-01", name: "Complete Blood Count (CBC)", loinc: "58410-2", dept: "Hematology", tat: "45m", price: "$28", status: "Active" },
  { code: "CMP-02", name: "Comprehensive Metabolic Panel", loinc: "24323-8", dept: "Biochemistry", tat: "60m", price: "$42", status: "Active" },
  { code: "LIP-03", name: "Lipid Profile Standard", loinc: "57698-3", dept: "Biochemistry", tat: "40m", price: "$35", status: "Active" },
  { code: "TROP-04", name: "Troponin I High-Sensitivity (STAT)", loinc: "49563-0", dept: "Immunoassay", tat: "25m", price: "$55", status: "Active" },
  { code: "HBA1C-05", name: "Glycated Hemoglobin (HbA1c)", loinc: "4548-4", dept: "Diabetes Care", tat: "30m", price: "$32", status: "Active" },
  { code: "TSH-06", name: "Thyroid Stimulating Hormone", loinc: "3016-3", dept: "Endocrinology", tat: "50m", price: "$38", status: "Active" },
  { code: "URIN-07", name: "Urinalysis Routine & Microscopic", loinc: "24356-8", dept: "Clinical Path", tat: "30m", price: "$22", status: "Active" },
  { code: "COV-08", name: "RT-PCR Viral Multiplex Panel", loinc: "94500-6", dept: "Molecular Lab", tat: "120m", price: "$65", status: "Active" },
];

const TABS = [
  { id: "Billing", label: "Billing & Monetization", icon: CreditCard },
  { id: "Organization", label: "Organization Profile", icon: Building2 },
  { id: "Test Types", label: "Diagnostic Test Catalog", icon: TestTube2 },
  { id: "Roles & Permissions", label: "RBAC & Permissions", icon: ShieldCheck },
];

export const SettingsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState("Billing");
  const [selectedPlan, setSelectedPlan] = useState<"starter" | "professional" | "enterprise">("professional");
  const [saveToast, setSaveToast] = useState(false);

  const [orgName, setOrgName] = useState("Apex Diagnostics & Reference Laboratories");
  const [orgLicense, setOrgLicense] = useState("NABL-LAB-2026-8492");
  const [orgAddress, setOrgAddress] = useState("Plot 14, Healthcare Hub, Main Boulevard");
  const [orgEmail, setOrgEmail] = useState("ops@apexdiagnostics.com");
  const [usedQuota, setUsedQuota] = useState(3842);
  const [maxQuota, setMaxQuota] = useState(5000);

  const [testCatalog, setTestCatalog] = useState<TestCatalogItem[]>(INITIAL_TEST_CATALOG);

  // Modals
  const [isAddTestOpen, setIsAddTestOpen] = useState(false);

  // Add Test Form State
  const [newTestCode, setNewTestCode] = useState("");
  const [newTestName, setNewTestName] = useState("");
  const [newTestLoinc, setNewTestLoinc] = useState("");
  const [newTestDept, setNewTestDept] = useState("Hematology");
  const [newTestTat, setNewTestTat] = useState("45m");
  const [newTestPrice, setNewTestPrice] = useState("$30");

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          if (data.settings) {
            if (data.settings.organization) {
              setOrgName(data.settings.organization.name || "Apex Diagnostics & Reference Laboratories");
              setOrgLicense(data.settings.organization.license || "NABL-LAB-2026-8492");
              setOrgAddress(data.settings.organization.address || "Plot 14, Healthcare Hub, Main Boulevard");
              setOrgEmail(data.settings.organization.email || "ops@apexdiagnostics.com");
            }
            if (data.settings.billing) {
              setSelectedPlan(data.settings.billing.plan || "professional");
              setUsedQuota(data.settings.billing.usedQuota || 3842);
              setMaxQuota(data.settings.billing.maxQuota || 5000);
            }
            if (data.settings.testCatalog && data.settings.testCatalog.length > 0) {
              setTestCatalog(data.settings.testCatalog);
            }
          }
        }
      } catch (e) {
        console.warn("Settings fetch fallback:", e);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async () => {
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
    try {
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organization: {
            name: orgName,
            license: orgLicense,
            address: orgAddress,
            email: orgEmail,
          },
          billing: {
            plan: selectedPlan,
            usedQuota,
            maxQuota: selectedPlan === "starter" ? 500 : selectedPlan === "professional" ? 5000 : 50000,
            renewsAt: "2026-10-01",
          },
          testCatalog,
        }),
      });
    } catch (e) {
      console.warn("Settings persist error:", e);
    }
  };

  const handleAddVolumePack = async () => {
    const newMax = maxQuota + 1000;
    setMaxQuota(newMax);
    try {
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          billing: {
            plan: selectedPlan,
            usedQuota,
            maxQuota: newMax,
            renewsAt: "2026-10-01",
          },
        }),
      });
      setSaveToast(true);
      setTimeout(() => setSaveToast(false), 3000);
    } catch (e) {
      console.warn("Volume pack error:", e);
    }
  };

  const handleAddTestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTestCode || !newTestName) return;

    const newPanel: TestCatalogItem = {
      code: newTestCode.toUpperCase(),
      name: newTestName,
      loinc: newTestLoinc || "99999-9",
      dept: newTestDept,
      tat: newTestTat,
      price: newTestPrice.startsWith("$") ? newTestPrice : `$${newTestPrice}`,
      status: "Active",
    };

    const updatedCatalog = [newPanel, ...testCatalog];
    setTestCatalog(updatedCatalog);
    setIsAddTestOpen(false);

    try {
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testCatalog: updatedCatalog }),
      });
      setSaveToast(true);
      setTimeout(() => setSaveToast(false), 3000);
    } catch (e) {
      console.warn("Test panel persist error:", e);
    }

    setNewTestCode("");
    setNewTestName("");
    setNewTestLoinc("");
  };

  const handleDownloadInvoice = (invoiceId: string) => {
    const invoiceContent = `========================================================
APEX DIAGNOSTICS & REFERENCE LABORATORIES
TAX INVOICE / PAYMENT RECEIPT
========================================================
Invoice Number: ${invoiceId}
Billing Cycle: September 2026
Plan: ${selectedPlan.toUpperCase()} TIER (Diagnostic LIMS Enterprise)
Tests Processed Quota: ${usedQuota} / ${maxQuota} Tests
Amount Paid: $149.00 USD
Payment Status: COMPLETED (Credit Card •••• 4242)
License: ${orgLicense}
Address: ${orgAddress}
Date: 2026-09-01
========================================================
Verified via 21 CFR Part 11 Electronic Billing Ledger.
`;
    const blob = new Blob([invoiceContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${invoiceId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const invoices = [
    { id: "INV-2026-0891", date: "Sep 01, 2026", amount: "$149.00", status: "Paid", plan: "Professional Tier (Monthly)" },
    { id: "INV-2026-0743", date: "Aug 01, 2026", amount: "$149.00", status: "Paid", plan: "Professional Tier (Monthly)" },
    { id: "INV-2026-0612", date: "Jul 01, 2026", amount: "$149.00", status: "Paid", plan: "Professional Tier (Monthly)" },
  ];

  const quotaPercent = Math.min(100, Math.round((usedQuota / maxQuota) * 100));

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Platform Settings & Enterprise Operations
            </h1>
            <span className="bg-indigo-50 text-indigo-700 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-indigo-200">
              DATABASE CONNECTED
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure laboratory branches, test catalog, RBAC matrices, subscription billing, and LIMS integrations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {saveToast && (
            <span className="text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 font-semibold animate-in fade-in flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Settings Saved to Database
            </span>
          )}
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </div>

      {/* TWO COLUMN SETTINGS LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* LEFT NAV TABS */}
        <div className="labflow-card p-2 space-y-1 h-fit">
          {TABS.map((tab) => {
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
          {/* BILLING & MONETIZATION */}
          {activeTab === "Billing" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    SaaS Subscription & Diagnostic Monetization
                  </h2>
                  <p className="text-xs text-slate-500">
                    Tiered laboratory subscription with automated usage tracking and per-test volume discounts.
                  </p>
                </div>
                <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5" />
                  Active Plan: {selectedPlan.toUpperCase()}
                </span>
              </div>

              {/* USAGE METER */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-700">Monthly Diagnostic Test Quota</span>
                  <span className="font-mono font-bold text-slate-900">
                    {usedQuota.toLocaleString()} / {maxQuota.toLocaleString()} Tests Used ({quotaPercent}%)
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${quotaPercent}%` }}></div>
                </div>
                <div className="flex justify-between items-center text-[11px] text-slate-500">
                  <span>Billing Cycle Renews: Oct 01, 2026 (20 days remaining)</span>
                  <button
                    onClick={handleAddVolumePack}
                    className="font-medium text-indigo-600 hover:underline cursor-pointer bg-transparent border-none p-0 text-[11px]"
                  >
                    + Add Volume Pack (+1,000 Tests)
                  </button>
                </div>
              </div>

              {/* 3 PRICING TIERS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* STARTER */}
                <div
                  onClick={() => {
                    setSelectedPlan("starter");
                    setMaxQuota(500);
                  }}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    selectedPlan === "starter"
                      ? "border-indigo-600 bg-indigo-50/30 shadow-xs"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">STARTER</span>
                    {selectedPlan === "starter" && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                  </div>
                  <div className="mt-2">
                    <span className="text-2xl font-black text-slate-900">$49</span>
                    <span className="text-xs text-slate-500 font-medium"> / month</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">Single collection center & basic tests</p>
                  <ul className="mt-3 space-y-1.5 text-[11px] text-slate-600">
                    <li>• Up to 500 tests/month</li>
                    <li>• 1 Collection Center</li>
                    <li>• Standard TAT Dashboard</li>
                    <li>• PDF Report Generation</li>
                  </ul>
                </div>

                {/* PROFESSIONAL (POPULAR) */}
                <div
                  onClick={() => {
                    setSelectedPlan("professional");
                    setMaxQuota(5000);
                  }}
                  className={`p-4 rounded-xl border-2 relative transition-all cursor-pointer ${
                    selectedPlan === "professional"
                      ? "border-indigo-600 bg-indigo-50/40 shadow-md ring-2 ring-indigo-500/20"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="absolute -top-2.5 right-4 bg-indigo-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" /> Most Popular
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-700">PROFESSIONAL</span>
                    {selectedPlan === "professional" && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                  </div>
                  <div className="mt-2">
                    <span className="text-2xl font-black text-slate-900">$149</span>
                    <span className="text-xs text-slate-500 font-medium"> / month</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">Full clinical lab network & auto-panic alerts</p>
                  <ul className="mt-3 space-y-1.5 text-[11px] text-slate-600">
                    <li>• Up to 5,000 tests/month</li>
                    <li>• 5 Collection Centers</li>
                    <li>• Chain-of-Custody Timelines</li>
                    <li>• Panic SMS & WhatsApp Dispatch</li>
                    <li>• Dual-Persona Patient Summaries</li>
                  </ul>
                </div>

                {/* ENTERPRISE */}
                <div
                  onClick={() => {
                    setSelectedPlan("enterprise");
                    setMaxQuota(50000);
                  }}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    selectedPlan === "enterprise"
                      ? "border-indigo-600 bg-indigo-50/30 shadow-xs"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">ENTERPRISE</span>
                    {selectedPlan === "enterprise" && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                  </div>
                  <div className="mt-2">
                    <span className="text-2xl font-black text-slate-900">$499</span>
                    <span className="text-xs text-slate-500 font-medium"> / month</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">Multi-site hospital LIMS & analyzer integration</p>
                  <ul className="mt-3 space-y-1.5 text-[11px] text-slate-600">
                    <li>• Up to 50,000 tests/month</li>
                    <li>• Unlimited Collection Centers</li>
                    <li>• ASTM / HL7 Analyzer Bridge</li>
                    <li>• Custom FHIR R4 Ingestion</li>
                    <li>• 99.99% SLA & Dedicated Account Lead</li>
                  </ul>
                </div>
              </div>

              {/* INVOICE HISTORY */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Recent Billing Invoices
                  </h3>
                  <button
                    onClick={() => handleDownloadInvoice("INV-2026-0891")}
                    className="text-[11px] text-indigo-600 hover:underline font-semibold cursor-pointer"
                  >
                    Download Latest Statement
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="bg-slate-50 border-y border-slate-200 text-[11px] text-slate-500 uppercase font-semibold">
                        <th className="py-2 px-3">Invoice</th>
                        <th className="py-2 px-3">Date</th>
                        <th className="py-2 px-3">Description</th>
                        <th className="py-2 px-3">Amount</th>
                        <th className="py-2 px-3">Status</th>
                        <th className="py-2 px-3 text-right">Receipt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {invoices.map((inv) => (
                        <tr key={inv.id} className="hover:bg-slate-50/50">
                          <td className="py-2 px-3 font-mono font-semibold text-slate-900">{inv.id}</td>
                          <td className="py-2 px-3 text-slate-600">{inv.date}</td>
                          <td className="py-2 px-3 text-slate-700">{inv.plan}</td>
                          <td className="py-2 px-3 font-bold text-slate-900">{inv.amount}</td>
                          <td className="py-2 px-3">
                            <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-200">
                              {inv.status}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-right">
                            <button
                              onClick={() => handleDownloadInvoice(inv.id)}
                              className="text-slate-500 hover:text-indigo-600 p-1 cursor-pointer"
                              title="Download Text Receipt"
                            >
                              <Download className="w-3.5 h-3.5 inline" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ORGANIZATION PROFILE */}
          {activeTab === "Organization" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Organization Profile & Accreditation
                  </h2>
                  <p className="text-xs text-slate-500">
                    Primary laboratory legal identity, regulatory accreditations, and dispatch letterhead.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Organization Name</label>
                  <input
                    type="text"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">License & NABL Accreditation Number</label>
                  <input
                    type="text"
                    value={orgLicense}
                    onChange={(e) => setOrgLicense(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Headquarters Location</label>
                  <input
                    type="text"
                    value={orgAddress}
                    onChange={(e) => setOrgAddress(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Support / Dispatch Email</label>
                  <input
                    type="email"
                    value={orgEmail}
                    onChange={(e) => setOrgEmail(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end">
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  Save Organization Profile
                </button>
              </div>
            </div>
          )}

          {/* TEST CATALOG */}
          {activeTab === "Test Types" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Diagnostic Test Catalog & Turnaround SLAs
                  </h2>
                  <p className="text-xs text-slate-500">
                    Standardized test menu with LOINC codes, department routing, SLA benchmarks, and patient pricing.
                  </p>
                </div>
                <button
                  onClick={() => setIsAddTestOpen(true)}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg shadow-xs flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  + Add Test Panel
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-slate-50 border-y border-slate-200 text-[11px] text-slate-500 uppercase font-semibold">
                      <th className="py-2.5 px-3">Code</th>
                      <th className="py-2.5 px-3">Test Name</th>
                      <th className="py-2.5 px-3">LOINC</th>
                      <th className="py-2.5 px-3">Department</th>
                      <th className="py-2.5 px-3">SLA TAT</th>
                      <th className="py-2.5 px-3">Price</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-sans">
                    {testCatalog.map((item) => (
                      <tr key={item.code} className="hover:bg-slate-50/60">
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{item.code}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">{item.name}</td>
                        <td className="py-2.5 px-3 font-mono text-indigo-600 bg-indigo-50/50 px-1.5 py-0.5 rounded text-[11px]">
                          {item.loinc}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">{item.dept}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-700 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {item.tat}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">{item.price}</td>
                        <td className="py-2.5 px-3">
                          <span className="bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded text-[10px] border border-emerald-200">
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* RBAC MATRIX */}
          {activeTab === "Roles & Permissions" && (
            <div className="space-y-4">
              <div className="border-b border-slate-200 pb-3">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Role-Based Access Control (RBAC) Matrix (6 Personas)
                </h2>
                <p className="text-xs text-slate-500">
                  Granular functional boundaries governing diagnostic orders, accessioning, analysis, sign-off, and patient delivery.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {(Object.keys(PRESET_LAB_USERS) as LabRole[]).map((roleKey) => {
                  const u = PRESET_LAB_USERS[roleKey];
                  const perms = LAB_ROLES_PERMISSIONS[roleKey];
                  return (
                    <div key={roleKey} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{u.badge}</span>
                        <span className="text-[10px] font-mono text-indigo-600 uppercase font-semibold">{roleKey}</span>
                      </div>
                      <p className="text-[11px] text-slate-600">{u.title}</p>
                      <div className="pt-2 border-t border-slate-200 space-y-1 text-[11px]">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Order Creation</span>
                          <span className={perms.canCreateOrders ? "text-emerald-700 font-bold" : "text-slate-400"}>
                            {perms.canCreateOrders ? "Granted" : "Restricted"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Analyzer Processing</span>
                          <span className={perms.canProcessSamples ? "text-emerald-700 font-bold" : "text-slate-400"}>
                            {perms.canProcessSamples ? "Granted" : "Restricted"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Result Sign-Off</span>
                          <span className={perms.canReleaseReports ? "text-emerald-700 font-bold" : "text-slate-400"}>
                            {perms.canReleaseReports ? "Granted" : "Restricted"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Billing & Org Admin</span>
                          <span className={perms.canManageSettings ? "text-emerald-700 font-bold" : "text-slate-400"}>
                            {perms.canManageSettings ? "Granted" : "Restricted"}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ADD TEST MODAL */}
      {isAddTestOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Add New Diagnostic Test Panel</h3>
              <button onClick={() => setIsAddTestOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddTestSubmit} className="p-5 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Test Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CRP-09"
                    value={newTestCode}
                    onChange={(e) => setNewTestCode(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg uppercase font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">LOINC Code</label>
                  <input
                    type="text"
                    placeholder="e.g. 1988-5"
                    value={newTestLoinc}
                    onChange={(e) => setNewTestLoinc(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Test Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. C-Reactive Protein (High-Sensitivity)"
                  value={newTestName}
                  onChange={(e) => setNewTestName(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department</label>
                  <select
                    value={newTestDept}
                    onChange={(e) => setNewTestDept(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Hematology">Hematology</option>
                    <option value="Biochemistry">Biochemistry</option>
                    <option value="Immunoassay">Immunoassay</option>
                    <option value="Molecular Lab">Molecular Lab</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target TAT</label>
                  <input
                    type="text"
                    placeholder="30m"
                    value={newTestTat}
                    onChange={(e) => setNewTestTat(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Price</label>
                  <input
                    type="text"
                    placeholder="$30"
                    value={newTestPrice}
                    onChange={(e) => setNewTestPrice(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddTestOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                >
                  Save Test Panel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
