import React from "react";
import { LabSample } from "@/data/labflowData";
import { StatusBadge } from "@/components/StatusBadge";
import { X, CheckCircle2, Clock, MapPin, User, Barcode, ShieldCheck } from "lucide-react";

interface SampleDetailModalProps {
  sample: LabSample | null;
  onClose: () => void;
}

export const SampleDetailModal: React.FC<SampleDetailModalProps> = ({
  sample,
  onClose,
}) => {
  if (!sample) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* HEADER */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100 text-purple-700">
              <Barcode className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 font-mono">
                  Sample {sample.id}
                </h2>
                <StatusBadge type="status" value={sample.status} size="sm" />
                <StatusBadge type="stage" value={sample.stage} size="sm" />
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Full Chain of Custody & Vertical Traceability Audit
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* METADATA BAR */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 bg-slate-50/50 border-b border-slate-200 text-xs">
          <div>
            <span className="text-slate-400 block font-medium uppercase text-[10px] tracking-wider">
              Patient
            </span>
            <span className="font-semibold text-slate-900 block mt-0.5">
              {sample.patient.name} ({sample.patient.gender}, {sample.patient.age}y)
            </span>
            <span className="text-slate-500 font-mono text-[11px]">
              {sample.patient.mrn}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block font-medium uppercase text-[10px] tracking-wider">
              Order Ref
            </span>
            <span className="font-mono font-bold text-indigo-600 block mt-0.5">
              {sample.orderId}
            </span>
            <span className="text-slate-500 text-[11px]">
              {sample.test}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block font-medium uppercase text-[10px] tracking-wider">
              Specimen Info
            </span>
            <span className="font-semibold text-slate-900 block mt-0.5">
              {sample.sampleType}
            </span>
            <span className="text-slate-500 text-[11px]">
              Volume: {sample.volume}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block font-medium uppercase text-[10px] tracking-wider">
              Current Location
            </span>
            <span className="font-semibold text-slate-900 block mt-0.5 truncate">
              {sample.currentLocation}
            </span>
            <span className="text-slate-500 font-mono text-[11px]">
              TAT: {sample.tat}
            </span>
          </div>
        </div>

        {/* BODY: VERTICAL TRACEABILITY TIMELINE */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-xs font-bold text-slate-800 tracking-wider uppercase flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Specimen Chain of Custody Timeline
            </h3>
            <span className="text-xs text-slate-500 font-mono">
              Barcode: {sample.barcode}
            </span>
          </div>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {sample.timeline.map((item, idx) => (
              <div key={item.id || idx} className="relative group">
                {/* Timeline Dot */}
                <div
                  className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center bg-white ${
                    item.status === "active"
                      ? "border-purple-600 text-purple-600 ring-4 ring-purple-100"
                      : "border-emerald-500 text-emerald-600"
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>

                <div className="bg-slate-50/80 border border-slate-200 rounded-lg p-3.5 hover:border-slate-300 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">
                      {item.event}
                    </span>
                    <span className="text-xs font-mono text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {item.timestamp} ({item.date})
                    </span>
                  </div>

                  <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-medium text-slate-700">Location:</span> {item.location}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-medium text-slate-700">Operator:</span> {item.operator}
                    </div>
                  </div>

                  {item.details && (
                    <p className="mt-2 text-xs text-slate-500 bg-white p-2 rounded border border-slate-100 font-mono">
                      {item.details}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FOOTER */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">
            LIMS Event Audit Hash Verified (ISO 15189 Compliant)
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 text-white hover:bg-slate-900 cursor-pointer"
          >
            Close Traceability View
          </button>
        </div>
      </div>
    </div>
  );
};
