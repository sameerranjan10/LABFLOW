import React from "react";
import { FlaskConical, ArrowRight, ShieldCheck, CheckCircle2, Cpu, Barcode, FileSpreadsheet, Clock, ChevronRight } from "lucide-react";

interface LandingPageProps {
  onExplorePlatform: () => void;
  onRequestDemo: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onExplorePlatform,
  onRequestDemo,
}) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-500 selection:text-white">
      {/* NAVBAR */}
      <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
            <FlaskConical className="w-5 h-5" />
          </div>
          <div>
            <span className="text-base font-extrabold tracking-tight text-slate-900 block leading-none">
              LABFLOW
            </span>
            <span className="text-[10px] text-slate-500 block leading-none mt-0.5">
              Laboratory Operations Platform
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onExplorePlatform}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-indigo-600 cursor-pointer"
          >
            Sign In
          </button>
          <button
            onClick={onRequestDemo}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs cursor-pointer flex items-center gap-1"
          >
            Request a Demo
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="py-20 px-6 max-w-6xl mx-auto text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-indigo-600" />
          NABL & CAP Interoperable B2B Laboratory LIMS Platform
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight max-w-3xl mx-auto leading-tight">
          Run your laboratory in flow.
        </h1>

        <p className="text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          From sample collection to final report release, LABFLOW gives your diagnostic team one connected operational workflow platform.
        </p>

        <div className="flex justify-center gap-4 pt-2">
          <button
            onClick={onRequestDemo}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            Request a Demo
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onExplorePlatform}
            className="px-6 py-3 bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs rounded-lg border border-slate-300 shadow-xs transition-all cursor-pointer"
          >
            Explore Platform Dashboard
          </button>
        </div>

        {/* HERO VISUAL PREVIEW (REALISTIC DASHBOARD MOCKUP) */}
        <div className="pt-8">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xl max-w-4xl mx-auto text-left space-y-4 font-sans">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                <span className="text-xs font-mono text-slate-400 ml-2">app.labflow.io/dashboard</span>
              </div>
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                Live Operations Monitor
              </span>
            </div>

            {/* MINI MOCKUP PIPELINE */}
            <div className="grid grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Orders Today</span>
                <span className="text-lg font-bold block text-slate-900 mt-1">128</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-bold">In Processing</span>
                <span className="text-lg font-bold block text-purple-700 mt-1">42</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Avg TAT</span>
                <span className="text-lg font-bold block text-blue-700 mt-1">2h 18m</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Critical Alerts</span>
                <span className="text-lg font-bold block text-red-600 mt-1">3</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURE HIGHLIGHTS */}
      <section className="py-16 bg-white border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Barcode className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Chain of Custody & Traceability</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Scan, barcode, and track specimen movement step-by-step from collection desk to analyzer.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Auto-analyzer Interface</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Bi-directional HL7 / LIMS integration with Sysmex, Roche, Abbott, and Bio-Rad instrument lines.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Pathologist Verification</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Review panic values, flag deviations against biological reference intervals, and sign off digital reports.
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 border-t border-slate-200 bg-slate-50 text-center text-xs text-slate-500">
        © 2026 LABFLOW Inc. All rights reserved. B2B Laboratory Workflow Management Platform.
      </footer>
    </div>
  );
};
