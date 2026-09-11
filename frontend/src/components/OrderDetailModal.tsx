"use client";

import React from "react";
import { LabOrder, LabSample } from "@/data/labflowData";
import { StatusBadge } from "@/components/StatusBadge";
import {
  X,
  FileSpreadsheet,
  User,
  Clock,
  MapPin,
  Stethoscope,
  Barcode,
  TestTube2,
  CheckCircle2,
  ShieldCheck,
  Download,
  Share2,
} from "lucide-react";

interface OrderDetailModalProps {
  order: LabOrder | null;
  sample?: LabSample | null;
  onClose: () => void;
  onOpenSampleDetail?: (sample: LabSample) => void;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  order,
  sample,
  onClose,
  onOpenSampleDetail,
}) => {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* HEADER */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-100 text-sky-700 border border-sky-200">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-slate-900 font-mono">
                  {order.id}
                </h2>
                <StatusBadge type="priority" value={order.priority} size="sm" />
                <StatusBadge type="stage" value={order.currentStage} size="sm" />
                <StatusBadge type="status" value={order.status} size="sm" />
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Official Clinical Requisition & Diagnostic Order Details
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* METADATA GRID */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* PATIENT & CLINICIAN CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* PATIENT INFO */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-sky-600" />
                  Patient Demographics
                </span>
                <span className="text-[10px] font-mono bg-sky-100 text-sky-800 px-2 py-0.5 rounded font-bold">
                  {order.patient.mrn}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div>
                  <span className="text-slate-400 block text-[10px]">Full Name</span>
                  <span className="font-bold text-slate-900">{order.patient.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Age / Gender</span>
                  <span className="font-semibold text-slate-800">{order.patient.age} Yrs / {order.patient.gender}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Contact Phone</span>
                  <span className="font-mono text-slate-700">{order.patient.phone || "+91 98765 43210"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Patient ID</span>
                  <span className="font-mono text-slate-700">{order.patient.id || "P-84920"}</span>
                </div>
              </div>
            </div>

            {/* CLINICIAN & REQUISITION INFO */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Stethoscope className="w-4 h-4 text-sky-600" />
                  Clinical Requisition Meta
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {order.createdDate || "2026-09-10"} {order.createdAt}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div>
                  <span className="text-slate-400 block text-[10px]">Referring Physician</span>
                  <span className="font-bold text-slate-900">{order.doctorName || "Dr. V. Sharma"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Lab Facility / Location</span>
                  <span className="font-semibold text-slate-800 truncate">{order.location}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Order Priority</span>
                  <span className="font-semibold text-sky-700">{order.priority}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Turnaround Time (TAT)</span>
                  <span className="font-mono text-emerald-600 font-bold">{order.tat}</span>
                </div>
              </div>
            </div>
          </div>

          {/* TESTS ORDERED PANEL */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <TestTube2 className="w-4 h-4 text-sky-600" />
                Requested Laboratory Tests ({order.tests.length})
              </h3>
              <span className="text-[11px] text-slate-400">Biological Reference Interval Checks Active</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {order.tests.map((testName, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="text-xs font-bold text-slate-800">{testName}</span>
                  </div>
                  <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-600">
                    LOINC Certified
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* SPECIMEN & BARCODE LINK */}
          <div className="p-4 rounded-xl bg-sky-50/60 border border-sky-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                <Barcode className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-slate-900">
                    Associated Specimen: {order.sampleId}
                  </span>
                  <span className="text-[10px] font-mono bg-purple-100 text-purple-800 px-2 py-0.5 rounded font-bold">
                    LBF-{order.patient.mrn.replace("MRN-", "")}-A
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Type: {sample?.sampleType || "Whole Blood (EDTA)"} • Location: {sample?.currentLocation || order.location}
                </p>
              </div>
            </div>

            {sample && onOpenSampleDetail && (
              <button
                onClick={() => {
                  onClose();
                  onOpenSampleDetail(sample);
                }}
                className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-lg shadow-xs transition-colors cursor-pointer shrink-0"
              >
                Track Specimen Custody
              </button>
            )}
          </div>
        </div>

        {/* FOOTER BUTTONS */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>ISO 15189 & 21 CFR Part 11 Audit Sealed</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
