"use client";

import React, { useState } from "react";
import { LabReport, LabOrder } from "@/data/labflowData";
import {
  X,
  Download,
  Send,
  CheckCircle,
  FileText,
  Printer,
  Mail,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  User,
  MessageSquare,
  Phone,
  ExternalLink,
  Share2,
  Stethoscope,
  Activity,
  MapPin,
  Sparkles,
} from "lucide-react";

interface ReportPreviewModalProps {
  report: LabReport | null;
  orders?: LabOrder[];
  onClose: () => void;
  onReleaseReport?: (reportId: string) => void;
}

export interface ClinicalParameter {
  category: string;
  name: string;
  result: string | number;
  unit: string;
  referenceRange: string;
  flag: "Normal" | "High" | "Low" | "Desirable";
}

export function getParametersForReport(tests: string[]): ClinicalParameter[] {
  const result: ClinicalParameter[] = [];
  const testsStr = (tests || []).join(" ").toLowerCase();

  // 1. Complete Blood Count (CBC)
  if (testsStr.includes("cbc") || testsStr.includes("blood count") || testsStr.includes("hemogram")) {
    result.push(
      { category: "Hematology", name: "Hemoglobin (Hb)", result: 13.2, unit: "g/dL", referenceRange: "12.0 – 16.0", flag: "Normal" },
      { category: "Hematology", name: "Total Leukocyte Count (WBC)", result: "11.8 ↑", unit: "10³/µL", referenceRange: "4.0 – 11.0", flag: "High" },
      { category: "Hematology", name: "Platelet Count", result: 245, unit: "10³/µL", referenceRange: "150 – 450", flag: "Normal" },
      { category: "Hematology", name: "Red Blood Cells (RBC)", result: 4.45, unit: "10⁶/µL", referenceRange: "4.0 – 5.2", flag: "Normal" },
      { category: "Hematology", name: "Packed Cell Volume (PCV / Hematocrit)", result: 39.5, unit: "%", referenceRange: "36.0 – 46.0", flag: "Normal" },
      { category: "Hematology", name: "Mean Corpuscular Volume (MCV)", result: 88.8, unit: "fL", referenceRange: "80.0 – 100.0", flag: "Normal" },
      { category: "Hematology", name: "Mean Corpuscular Hemoglobin (MCH)", result: 29.6, unit: "pg", referenceRange: "27.0 – 32.0", flag: "Normal" },
      { category: "Hematology", name: "MCHC", result: 33.4, unit: "g/dL", referenceRange: "31.5 – 34.5", flag: "Normal" },
      { category: "Differential", name: "Neutrophils (Segmented)", result: "72 ↑", unit: "%", referenceRange: "40 – 70", flag: "High" },
      { category: "Differential", name: "Lymphocytes", result: 22, unit: "%", referenceRange: "20 – 45", flag: "Normal" },
      { category: "Differential", name: "Monocytes", result: 4, unit: "%", referenceRange: "2 – 8", flag: "Normal" },
      { category: "Differential", name: "Eosinophils", result: 2, unit: "%", referenceRange: "1 – 6", flag: "Normal" }
    );
  }

  // 2. Lipid Profile
  if (testsStr.includes("lipid")) {
    result.push(
      { category: "Lipid Profile", name: "Total Cholesterol", result: 184, unit: "mg/dL", referenceRange: "< 200", flag: "Desirable" },
      { category: "Lipid Profile", name: "HDL Cholesterol (Good)", result: 52, unit: "mg/dL", referenceRange: "> 40", flag: "Normal" },
      { category: "Lipid Profile", name: "LDL Cholesterol (Calculated)", result: 106, unit: "mg/dL", referenceRange: "< 100", flag: "High" },
      { category: "Lipid Profile", name: "VLDL Cholesterol", result: 26, unit: "mg/dL", referenceRange: "10 – 30", flag: "Normal" },
      { category: "Lipid Profile", name: "Serum Triglycerides", result: 130, unit: "mg/dL", referenceRange: "< 150", flag: "Normal" },
      { category: "Lipid Profile", name: "Total Cholesterol / HDL Ratio", result: 3.54, unit: "Ratio", referenceRange: "< 4.5", flag: "Normal" }
    );
  }

  // 3. Liver Function Test (LFT)
  if (testsStr.includes("liver") || testsStr.includes("lft")) {
    result.push(
      { category: "Liver Function (LFT)", name: "Total Bilirubin", result: 0.85, unit: "mg/dL", referenceRange: "0.2 – 1.2", flag: "Normal" },
      { category: "Liver Function (LFT)", name: "Direct (Conjugated) Bilirubin", result: 0.22, unit: "mg/dL", referenceRange: "0.0 – 0.3", flag: "Normal" },
      { category: "Liver Function (LFT)", name: "SGOT / AST", result: 28, unit: "U/L", referenceRange: "10 – 40", flag: "Normal" },
      { category: "Liver Function (LFT)", name: "SGPT / ALT", result: 32, unit: "U/L", referenceRange: "7 – 56", flag: "Normal" },
      { category: "Liver Function (LFT)", name: "Alkaline Phosphatase (ALP)", result: 84, unit: "U/L", referenceRange: "44 – 147", flag: "Normal" },
      { category: "Liver Function (LFT)", name: "Total Protein", result: 7.2, unit: "g/dL", referenceRange: "6.0 – 8.3", flag: "Normal" },
      { category: "Liver Function (LFT)", name: "Serum Albumin", result: 4.3, unit: "g/dL", referenceRange: "3.5 – 5.0", flag: "Normal" },
      { category: "Liver Function (LFT)", name: "Serum Globulin", result: 2.9, unit: "g/dL", referenceRange: "2.0 – 3.5", flag: "Normal" }
    );
  }

  // 4. Kidney Function Test (KFT / Renal)
  if (testsStr.includes("kidney") || testsStr.includes("kft") || testsStr.includes("renal")) {
    result.push(
      { category: "Renal Function (KFT)", name: "Serum Creatinine", result: 0.92, unit: "mg/dL", referenceRange: "0.60 – 1.20", flag: "Normal" },
      { category: "Renal Function (KFT)", name: "Blood Urea Nitrogen (BUN)", result: 14.5, unit: "mg/dL", referenceRange: "7.0 – 20.0", flag: "Normal" },
      { category: "Renal Function (KFT)", name: "Serum Uric Acid", result: 4.6, unit: "mg/dL", referenceRange: "3.5 – 7.2", flag: "Normal" },
      { category: "Renal Function (KFT)", name: "Serum Sodium (Na+)", result: 140, unit: "mEq/L", referenceRange: "135 – 145", flag: "Normal" },
      { category: "Renal Function (KFT)", name: "Serum Potassium (K+)", result: 4.2, unit: "mEq/L", referenceRange: "3.5 – 5.1", flag: "Normal" },
      { category: "Renal Function (KFT)", name: "Serum Chloride (Cl-)", result: 101, unit: "mEq/L", referenceRange: "96 – 106", flag: "Normal" }
    );
  }

  // 5. Thyroid Profile (T3/T4/TSH)
  if (testsStr.includes("thyroid") || testsStr.includes("tsh") || testsStr.includes("t3") || testsStr.includes("t4")) {
    result.push(
      { category: "Endocrinology", name: "Total Triiodothyronine (T3)", result: 1.22, unit: "ng/mL", referenceRange: "0.80 – 2.00", flag: "Normal" },
      { category: "Endocrinology", name: "Total Thyroxine (T4)", result: 8.4, unit: "µg/dL", referenceRange: "5.1 – 14.1", flag: "Normal" },
      { category: "Endocrinology", name: "Thyroid Stimulating Hormone (TSH)", result: 2.15, unit: "µIU/mL", referenceRange: "0.40 – 4.20", flag: "Normal" }
    );
  }

  // 6. Diabetes / Glucose / HbA1c
  if (testsStr.includes("glucose") || testsStr.includes("sugar") || testsStr.includes("hba1c")) {
    result.push(
      { category: "Glycemic Profile", name: "Fasting / Random Blood Glucose", result: 92, unit: "mg/dL", referenceRange: "70 – 100", flag: "Normal" },
      { category: "Glycemic Profile", name: "Glycated Hemoglobin (HbA1c)", result: 5.6, unit: "%", referenceRange: "< 5.7", flag: "Normal" },
      { category: "Glycemic Profile", name: "Estimated Average Glucose (eAG)", result: 114, unit: "mg/dL", referenceRange: "90 – 120", flag: "Normal" }
    );
  }

  // 7. Urine Routine & Microscopy
  if (testsStr.includes("urine")) {
    result.push(
      { category: "Urinalysis", name: "Urine Appearance & Color", result: "Pale Yellow / Clear", unit: "Visual", referenceRange: "Pale Yellow / Clear", flag: "Normal" },
      { category: "Urinalysis", name: "Specific Gravity", result: "1.018", unit: "Index", referenceRange: "1.005 – 1.030", flag: "Normal" },
      { category: "Urinalysis", name: "pH", result: "6.0", unit: "pH", referenceRange: "5.0 – 7.5", flag: "Normal" },
      { category: "Urinalysis", name: "Urine Protein / Albumin", result: "Nil", unit: "mg/dL", referenceRange: "Negative", flag: "Normal" },
      { category: "Urinalysis", name: "Urine Glucose", result: "Nil", unit: "mg/dL", referenceRange: "Negative", flag: "Normal" },
      { category: "Urinalysis", name: "Pus Cells (WBC)", result: "1–2", unit: "/ HPF", referenceRange: "0 – 5", flag: "Normal" }
    );
  }

  // Fallback if no specific panel matched
  if (result.length === 0) {
    result.push(
      { category: "Hematology", name: "Hemoglobin (Hb)", result: 12.4, unit: "g/dL", referenceRange: "12.0 – 16.0", flag: "Normal" },
      { category: "Hematology", name: "Total Leukocyte Count (WBC)", result: "12.8 ↑", unit: "10³/µL", referenceRange: "4.0 – 11.0", flag: "High" },
      { category: "Hematology", name: "Platelet Count", result: 210, unit: "10³/µL", referenceRange: "150 – 450", flag: "Normal" },
      { category: "Biochemistry & Renal", name: "Fasting Blood Glucose", result: 94, unit: "mg/dL", referenceRange: "70 – 100", flag: "Normal" },
      { category: "Biochemistry & Renal", name: "Serum Creatinine", result: 0.95, unit: "mg/dL", referenceRange: "0.60 – 1.20", flag: "Normal" },
      { category: "Lipid Profile", name: "Total Cholesterol", result: 184, unit: "mg/dL", referenceRange: "< 200", flag: "Desirable" }
    );
  }

  return result;
}

export const ReportPreviewModal: React.FC<ReportPreviewModalProps> = ({
  report,
  orders,
  onClose,
  onReleaseReport,
}) => {
  const [activeChannel, setActiveChannel] = useState<"email" | "whatsapp">("email");

  // Resolve matching order and metadata
  const matchingOrder = orders?.find((o) => o.id === report?.orderId);
  const doctorName = report?.doctorName || matchingOrder?.doctorName || "Dr. Priya Sharma, MD";
  const priority = report?.priority || matchingOrder?.priority || "Normal";
  const location = report?.location || matchingOrder?.location || "Main Laboratory - Accessioning";
  const sampleType = report?.sampleType || matchingOrder?.sampleType || "Whole Blood (EDTA)";
  const sampleId = report?.sampleId || matchingOrder?.sampleId || (report ? `SMP-${report.id.replace("RPT-", "")}` : "SMP-20491");
  const patientPhone = report?.patient.phone || matchingOrder?.patient.phone || "+91 98765 43210";
  const testsList = report?.tests && report.tests.length > 0 ? report.tests : matchingOrder?.tests && matchingOrder.tests.length > 0 ? matchingOrder.tests : ["CBC (Complete Blood Count)"];
  const createdAtFormatted = report?.createdAt || (matchingOrder ? `${matchingOrder.createdDate} ${matchingOrder.createdAt}` : "2026-09-10 09:42 AM");
  const collector = report?.collector || "Sunita Verma";

  // Email State
  const [parentEmail, setParentEmail] = useState("niteshnemalpuri17@gmail.com");
  const [parentName, setParentName] = useState(report?.patient ? `${report.patient.name}'s Family` : "Parent / Guardian");
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSentSuccess, setEmailSentSuccess] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [showEmailForm, setShowEmailForm] = useState(false);

  // WhatsApp State
  const [whatsappPhone, setWhatsappPhone] = useState(patientPhone);
  const [whatsappRecipient, setWhatsappRecipient] = useState(report?.patient.name || "Patient");
  const [customWaNote, setCustomWaNote] = useState("");
  const [isSendingWhatsApp, setIsSendingWhatsApp] = useState(false);
  const [waSentSuccess, setWaSentSuccess] = useState<string | null>(null);
  const [waError, setWaError] = useState<string | null>(null);
  const [showWaForm, setShowWaForm] = useState(false);

  if (!report) return null;

  const handleSendEmailToParent = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSendingEmail(true);
    setEmailError(null);
    setEmailSentSuccess(null);

    const targetEmail = parentEmail.trim() || "niteshnemalpuri17@gmail.com";

    try {
      const res = await fetch("/api/reports/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportId: report.id,
          recipientEmail: targetEmail,
          recipientName: parentName,
          patientName: report.patient.name,
          customMessage: "Please find attached the official clinical laboratory diagnostic report.",
        }),
      });

      const data = await res.json();
      if (res.ok) {
        if (data.sentDirectly) {
          setEmailSentSuccess(`Report delivered to ${targetEmail} via ${data.provider} (ID: ${data.messageId || "DELIVERED"})`);
        } else {
          // Open Gmail Web draft or native mail client
          if (data.gmailComposeUrl) {
            window.open(data.gmailComposeUrl, "_blank");
          } else if (data.mailtoUrl) {
            window.location.href = data.mailtoUrl;
          }
          setEmailSentSuccess(`Gmail draft launched for ${targetEmail}. Click 'Send' in Gmail.`);
        }
      } else {
        handleOpenEmailClient();
        setEmailSentSuccess(`Email draft opened for ${targetEmail}`);
      }
    } catch (err) {
      console.warn("Email dispatch error:", err);
      handleOpenEmailClient();
      setEmailSentSuccess(`Email client opened for ${targetEmail}`);
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleOpenEmailClient = () => {
    const targetEmail = parentEmail.trim() || "niteshnemalpuri17@gmail.com";
    const subject = `Official Diagnostic Lab Report: ${report.patient.name} (${report.id})`;
    const body = `Dear ${parentName},\n\nYour diagnostic laboratory report for ${report.patient.name} (MRN: ${report.patient.mrn}) from Apex Diagnostics & Reference Laboratories is verified and ready.\n\nReport ID: ${report.id}\nOrder ID: ${report.orderId}\nReferring Clinician: ${doctorName}\nOrder Priority: ${priority}\nFacility Location: ${location}\nTests Requested: ${testsList.join(", ")}\nSpecimen Type: ${sampleType}\nReviewing Pathologist: ${report.reviewer}\n\nView and download your official signed PDF report:\nhttp://localhost:3000/api/reports/${report.id}/pdf\n\nSincerely,\nApex Diagnostics Support Team\n+91 11 4000 8000`;
    window.location.href = `mailto:${encodeURIComponent(targetEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleSendWhatsApp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSendingWhatsApp(true);
    setWaError(null);
    setWaSentSuccess(null);

    const targetPhone = whatsappPhone.trim() || report.patient.phone || "+91 98000 11111";

    // 1. Automatically trigger download of official signed PDF report
    const pdfLink = document.createElement("a");
    pdfLink.href = `/api/reports/${report.id}/pdf`;
    pdfLink.download = `Apex_Report_${report.id}.pdf`;
    document.body.appendChild(pdfLink);
    pdfLink.click();
    document.body.removeChild(pdfLink);

    try {
      const res = await fetch("/api/reports/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportId: report.id,
          recipientPhone: targetPhone,
          recipientName: whatsappRecipient,
          patientName: report.patient.name,
          customMessage: customWaNote || "Your verified laboratory test report is now available.",
        }),
      });

      const data = await res.json();
      if (res.ok && data.directLink) {
        window.open(data.directLink, "_blank");
        setWaSentSuccess(`Official PDF downloaded & WhatsApp Web launched for ${targetPhone}! Drag PDF into chat or send link.`);
      } else {
        const cleanDigits = targetPhone.replace(/[^\d]/g, "");
        const fallback = `https://api.whatsapp.com/send?phone=${cleanDigits}&text=${encodeURIComponent(`Dear ${whatsappRecipient}, your official PDF diagnostic lab report (${report.id}) is ready: http://localhost:3000/api/reports/${report.id}/pdf`)}`;
        window.open(fallback, "_blank");
        setWaSentSuccess(`Official PDF downloaded & WhatsApp launched for ${targetPhone}`);
      }
    } catch (err) {
      console.warn("WhatsApp dispatch error:", err);
      const cleanDigits = targetPhone.replace(/[^\d]/g, "");
      const fallback = `https://api.whatsapp.com/send?phone=${cleanDigits}&text=${encodeURIComponent(`Dear ${whatsappRecipient}, your official PDF diagnostic lab report (${report.id}) is ready: http://localhost:3000/api/reports/${report.id}/pdf`)}`;
      window.open(fallback, "_blank");
      setWaSentSuccess(`Official PDF downloaded & WhatsApp launched for ${targetPhone}`);
    } finally {
      setIsSendingWhatsApp(false);
    }
  };

  const handleDownloadReport = () => {
    const link = document.createElement("a");
    link.href = `/api/reports/${report.id}/pdf`;
    link.download = `Apex_Report_${report.id}.pdf`;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* HEADER */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  Diagnostic Report: {report.id}
                </h2>
                <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-200">
                  {report.status.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Patient: <strong>{report.patient.name}</strong> ({report.patient.mrn}) • 18 Laboratory Attributes
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MULTI-CHANNEL DISPATCH BANNER (EMAIL & WHATSAPP) */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 space-y-2.5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-1.5 p-0.5 bg-slate-200/80 rounded-lg border border-slate-300">
              <button
                type="button"
                onClick={() => setActiveChannel("email")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                  activeChannel === "email"
                    ? "bg-white text-indigo-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Mail className="w-3.5 h-3.5 text-indigo-600" />
                <span>Email Dispatch</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveChannel("whatsapp")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                  activeChannel === "whatsapp"
                    ? "bg-white text-emerald-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                <span>WhatsApp Dispatch</span>
              </button>
            </div>

            <div className="text-[11px] text-slate-500 font-mono flex items-center gap-2">
              <span>Patient: <strong className="text-slate-800">{report.patient.name}</strong></span>
              <span>•</span>
              <span>MRN: <strong className="text-slate-800">{report.patient.mrn}</strong></span>
            </div>
          </div>

          {/* ACTIVE CHANNEL CONTENT */}
          {activeChannel === "email" && (
            <div className="bg-white p-3 rounded-lg border border-indigo-100 shadow-2xs space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="text-xs">
                  <span className="font-bold text-slate-700">Target Email:</span>{" "}
                  <span className="font-mono text-indigo-700 font-semibold">{parentEmail}</span>
                  <button
                    onClick={() => setShowEmailForm(!showEmailForm)}
                    className="ml-2 text-[11px] text-indigo-600 hover:underline font-semibold cursor-pointer"
                  >
                    {showEmailForm ? "Hide" : "Edit Recipient"}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleOpenEmailClient}
                    className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-300 flex items-center gap-1 cursor-pointer"
                    title="Open draft in system Email client"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Mail App (mailto:)
                  </button>
                  <button
                    onClick={() => handleSendEmailToParent()}
                    disabled={isSendingEmail}
                    className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isSendingEmail ? (
                      <>
                        <Clock className="w-3 h-3 animate-spin" />
                        Sending Email...
                      </>
                    ) : (
                      <>
                        <Send className="w-3 h-3" />
                        Send Email Now
                      </>
                    )}
                  </button>
                </div>
              </div>

              {showEmailForm && (
                <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row gap-2 items-center text-xs">
                  <div className="flex-1 w-full">
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">Recipient Email Address</label>
                    <input
                      type="email"
                      value={parentEmail}
                      onChange={(e) => setParentEmail(e.target.value)}
                      placeholder="niteshnemalpuri17@gmail.com"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                    />
                  </div>
                  <div className="w-full sm:w-48">
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">Recipient Label</label>
                    <input
                      type="text"
                      value={parentName}
                      onChange={(e) => setParentName(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              )}

              {emailSentSuccess && (
                <div className="text-xs text-emerald-800 bg-emerald-100/90 border border-emerald-300 rounded-lg p-2 flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{emailSentSuccess}</span>
                </div>
              )}
              {emailError && (
                <div className="text-xs text-red-800 bg-red-100/90 border border-red-300 rounded-lg p-2 flex items-center gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{emailError}</span>
                </div>
              )}
            </div>
          )}

          {activeChannel === "whatsapp" && (
            <div className="bg-white p-3 rounded-lg border border-emerald-100 shadow-2xs space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="text-xs">
                  <span className="font-bold text-slate-700">WhatsApp Phone:</span>{" "}
                  <span className="font-mono text-emerald-700 font-bold">{whatsappPhone}</span>
                  <span className="text-slate-400 text-[11px] ml-1.5">({whatsappRecipient})</span>
                  <button
                    onClick={() => setShowWaForm(!showWaForm)}
                    className="ml-2 text-[11px] text-emerald-600 hover:underline font-semibold cursor-pointer"
                  >
                    {showWaForm ? "Hide" : "Edit Number"}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSendWhatsApp()}
                    disabled={isSendingWhatsApp}
                    className="px-3.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isSendingWhatsApp ? (
                      <>
                        <Clock className="w-3 h-3 animate-spin" />
                        Generating WhatsApp Link...
                      </>
                    ) : (
                      <>
                        <MessageSquare className="w-3.5 h-3.5 fill-white" />
                        Send via WhatsApp Now
                      </>
                    )}
                  </button>
                </div>
              </div>

              {showWaForm && (
                <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">WhatsApp Mobile (+CountryCode)</label>
                    <input
                      type="text"
                      value={whatsappPhone}
                      onChange={(e) => setWhatsappPhone(e.target.value)}
                      placeholder="+91 98000 11111"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">Recipient Name</label>
                    <input
                      type="text"
                      value={whatsappRecipient}
                      onChange={(e) => setWhatsappRecipient(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">Custom Clinical Note (Optional)</label>
                    <input
                      type="text"
                      value={customWaNote}
                      onChange={(e) => setCustomWaNote(e.target.value)}
                      placeholder="e.g. Please discuss these test findings with Dr. Priya Sharma."
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              )}

              {waSentSuccess && (
                <div className="text-xs text-emerald-800 bg-emerald-100/90 border border-emerald-300 rounded-lg p-2 flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{waSentSuccess}</span>
                </div>
              )}
              {waError && (
                <div className="text-xs text-red-800 bg-red-100/90 border border-red-300 rounded-lg p-2 flex items-center gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{waError}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* REPORT DOCUMENT SIMULATION */}
        <div className="p-6 space-y-6 bg-slate-50/40 max-h-[60vh] overflow-y-auto font-sans">
          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-xs space-y-6">
            {/* REPORT HEADER */}
            <div className="flex justify-between items-start border-b border-slate-200 pb-4">
              <div>
                <h1 className="text-xl font-extrabold text-indigo-900 tracking-tight">
                  APEX DIAGNOSTICS & REFERENCE LABORATORIES
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  NABL, CAP & ISO 15189 Accredited Central Pathology Facility
                </p>
                <p className="text-xs text-slate-400">
                  Plot 14, Healthcare Hub, Main Boulevard • Dispatch Hotline: +91 11 4000 8000
                </p>
              </div>
              <div className="text-right font-mono text-xs">
                <span className={`font-bold px-2.5 py-1 rounded-full inline-block ${
                  report.status === "Released" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                }`}>
                  {report.status.toUpperCase()}
                </span>
                <p className="text-slate-500 text-[11px] mt-1 font-sans">
                  Requisition: <strong className="text-slate-800 font-mono">{createdAtFormatted}</strong>
                </p>
              </div>
            </div>

            {/* PATIENT & CLINICAL REQUISITION METADATA GRID (ALL ENTERED ORDER DATA) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              {/* Box 1: Patient Demographics */}
              <div className="space-y-1.5 bg-white p-3 rounded-lg border border-slate-200/80 shadow-2xs">
                <div className="flex items-center gap-1.5 text-indigo-700 font-bold text-[11px] uppercase tracking-wider pb-1 border-b border-slate-100">
                  <User className="w-3.5 h-3.5" />
                  1. Patient Demographics
                </div>
                <p><span className="text-slate-500">Patient Name:</span> <strong className="text-slate-900">{report.patient.name}</strong></p>
                <p><span className="text-slate-500">MRN / Patient ID:</span> <code className="text-slate-800 font-bold bg-slate-100 px-1 py-0.5 rounded">{report.patient.mrn}</code></p>
                <p><span className="text-slate-500">Age / Gender:</span> <strong className="text-slate-800">{report.patient.age} Yrs</strong> / <span className="text-slate-700">{report.patient.gender}</span></p>
                <p><span className="text-slate-500">Contact Phone:</span> <strong className="text-slate-800 font-mono">{patientPhone}</strong></p>
                <p><span className="text-slate-500">Patient Email:</span> <span className="text-indigo-600 font-mono text-[11px] truncate block">{parentEmail}</span></p>
              </div>

              {/* Box 2: Order & Clinical Requisition */}
              <div className="space-y-1.5 bg-white p-3 rounded-lg border border-slate-200/80 shadow-2xs">
                <div className="flex items-center gap-1.5 text-indigo-700 font-bold text-[11px] uppercase tracking-wider pb-1 border-b border-slate-100">
                  <Stethoscope className="w-3.5 h-3.5" />
                  2. Clinical Requisition
                </div>
                <p><span className="text-slate-500">Referring Doctor:</span> <strong className="text-indigo-950 font-bold">{doctorName}</strong></p>
                <p className="flex items-center gap-2">
                  <span className="text-slate-500">Order Priority:</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    priority === "STAT"
                      ? "bg-red-100 text-red-700 border border-red-200"
                      : priority === "Urgent"
                      ? "bg-amber-100 text-amber-700 border border-amber-200"
                      : "bg-blue-100 text-blue-700 border border-blue-200"
                  }`}>
                    {priority}
                  </span>
                </p>
                <p><span className="text-slate-500">Accessioning Facility:</span> <span className="text-slate-800 font-medium">{location}</span></p>
                <p><span className="text-slate-500">Order ID:</span> <code className="text-indigo-600 font-bold font-mono">{report.orderId}</code></p>
                <p><span className="text-slate-500">Requisition Date:</span> <span className="text-slate-700 font-mono text-[11px]">{createdAtFormatted}</span></p>
              </div>

              {/* Box 3: Specimen & Logistics */}
              <div className="space-y-1.5 bg-white p-3 rounded-lg border border-slate-200/80 shadow-2xs">
                <div className="flex items-center gap-1.5 text-indigo-700 font-bold text-[11px] uppercase tracking-wider pb-1 border-b border-slate-100">
                  <FileText className="w-3.5 h-3.5" />
                  3. Specimen & Tracking
                </div>
                <p><span className="text-slate-500">Specimen Tube:</span> <strong className="text-slate-800">{sampleType}</strong></p>
                <p><span className="text-slate-500">Sample Barcode:</span> <code className="text-purple-700 font-mono font-bold bg-purple-50 px-1 py-0.5 rounded">{sampleId}</code></p>
                <p><span className="text-slate-500">Phlebotomist / Collector:</span> <span className="text-slate-800 font-medium">{collector}</span></p>
                <p><span className="text-slate-500">Report Ref ID:</span> <code className="text-slate-800 font-mono font-bold">{report.id}</code></p>
                <p><span className="text-slate-500">Attesting Pathologist:</span> <span className="text-slate-800 font-semibold">{report.reviewer}</span></p>
              </div>
            </div>

            {/* TESTS ORDERED PANEL BANNER */}
            <div className="flex flex-wrap items-center gap-2 p-3 bg-indigo-50/70 border border-indigo-100 rounded-lg text-xs">
              <span className="font-bold text-indigo-950 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-indigo-600" />
                Tests Requested in Order Requisition:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {testsList.map((testName, i) => (
                  <span key={i} className="bg-white border border-indigo-200 text-indigo-800 px-2.5 py-0.5 rounded-full font-semibold text-[11px] shadow-2xs flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                    {testName}
                  </span>
                ))}
              </div>
            </div>

            {/* DYNAMIC CLINICAL PARAMETER TABLE */}
            {(() => {
              const activeParameters = getParametersForReport(testsList);
              return (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-indigo-600" />
                      Laboratory Test Parameters & Differential Breakdown ({activeParameters.length} Attributes)
                    </h3>
                    <span className="text-[11px] text-slate-500 font-mono">
                      Method: Laser Flow Cytometry & Photometry
                    </span>
                  </div>

                  <div className="overflow-x-auto border border-slate-200 rounded-lg shadow-2xs">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-3">Test Parameter</th>
                          <th className="py-2.5 px-3">Observed Value</th>
                          <th className="py-2.5 px-3">Units</th>
                          <th className="py-2.5 px-3">Biological Reference Interval</th>
                          <th className="py-2.5 px-3 text-right">Clinical Flag</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {activeParameters.map((p, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-2 px-3">
                              <span className="font-semibold text-slate-900">{p.name}</span>
                              <span className="text-[10px] text-slate-400 block font-mono">{p.category}</span>
                            </td>
                            <td className={`py-2 px-3 font-mono font-bold ${
                              p.flag === "High" ? "text-amber-700 bg-amber-50/50" : "text-slate-900"
                            }`}>
                              {p.result}
                            </td>
                            <td className="py-2 px-3 font-mono text-slate-500">{p.unit}</td>
                            <td className="py-2 px-3 font-mono text-slate-600">{p.referenceRange}</td>
                            <td className="py-2 px-3 text-right">
                              <span
                                className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${
                                  p.flag === "High"
                                    ? "bg-amber-100 text-amber-800 border-amber-300"
                                    : p.flag === "Desirable"
                                    ? "bg-blue-50 text-blue-700 border-blue-200"
                                    : "bg-emerald-50 text-emerald-700 border-emerald-200"
                                }`}
                              >
                                {p.flag.toUpperCase()}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* PATHOLOGIST REMARKS & CLINICAL INTERPRETATION */}
                  <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-indigo-600" />
                      Pathologist Clinical Remarks & Diagnostic Correlation:
                    </span>
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      Diagnostic clinical parameters for <strong className="text-slate-800">{testsList.join(", ")}</strong> have been evaluated and clinically correlated with referring clinician <strong className="text-slate-800">{doctorName}</strong>. Observed values for patient <strong className="text-slate-800">{report.patient.name}</strong> align with standard biological reference intervals. Analyzers calibrated against certified NABL reference standards.
                    </p>
                  </div>
                </div>
              );
            })()}

            {/* PATHOLOGIST DIGITAL SIGNATURE */}
            <div className="pt-4 border-t border-slate-200 flex justify-between items-end text-xs">
              <div>
                <p className="text-[10px] text-slate-400">Electronic Verification Hash (21 CFR Part 11):</p>
                <p className="font-mono text-[10px] text-slate-600">SHA256: 8f92a410b00192e49c95d3129810ef3984920bcf884</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Accreditation: NABL-LAB-2026-8492</p>
              </div>
              <div className="text-right">
                <div className="font-bold text-slate-900">{report.reviewer}</div>
                <div className="text-[11px] text-slate-500">MD (Pathology), Lead Medical Consultant</div>
                <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">Digitally Verified & Release Certified</div>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleDownloadReport}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-rose-600" />
              Download Official PDF (18 Attributes)
            </button>
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Report
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-300 cursor-pointer"
            >
              Close
            </button>

            {/* Quick Action: Send via WhatsApp */}
            <button
              onClick={() => handleSendWhatsApp()}
              disabled={isSendingWhatsApp}
              className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Send Report via WhatsApp"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              WhatsApp
            </button>

            {/* Quick Action: Send via Email */}
            <button
              onClick={() => handleSendEmailToParent()}
              disabled={isSendingEmail}
              className="px-3 py-1.5 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-300 rounded-lg shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Send Report via Email"
            >
              <Mail className="w-3.5 h-3.5" />
              Email
            </button>

            {report.status !== "Released" && onReleaseReport && (
              <button
                onClick={() => {
                  onReleaseReport(report.id);
                  handleSendEmailToParent();
                  handleSendWhatsApp();
                }}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
                title="Release report and notify patient via Email & WhatsApp"
              >
                <Send className="w-3.5 h-3.5" />
                Release & Dispatch All
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
