import React, { useState } from "react";
import { FlaskConical, ArrowRight, ShieldCheck } from "lucide-react";

interface LoginPageProps {
  onLoginSuccess: () => void;
  onRequestDemo: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onRequestDemo,
}) => {
  const [email, setEmail] = useState("admin@apexdiagnostics.com");
  const [password, setPassword] = useState("••••••••••••");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLoginSuccess();
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* BRAND HEADER */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-indigo-600 text-white items-center justify-center shadow-lg shadow-indigo-500/30">
            <FlaskConical className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            LABFLOW ENTERPRISE
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Clinical Diagnostic Laboratory Operations Platform
          </p>
        </div>

        {/* LOGIN FORM CARD */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Institutional Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  Password
                </label>
                <a href="#" className="text-[11px] text-indigo-600 hover:underline">
                  Forgot password?
                </a>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-600">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded text-indigo-600" />
                <span>Keep me signed in</span>
              </label>
              <span className="text-[11px] font-mono text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                SSO Enabled
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              Sign In to Lab Operations
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 text-center">
            <button
              onClick={onRequestDemo}
              className="text-xs text-slate-600 hover:text-indigo-600 font-semibold transition-colors cursor-pointer"
            >
              Don&apos;t have an enterprise workspace? <span className="text-indigo-600 underline">Request a Demo</span>
            </button>
          </div>
        </div>

        {/* COMPLIANCE FOOTER */}
        <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400 font-medium">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> NABL & CAP Interoperable
          </span>
          <span>•</span>
          <span>ISO 15189 Certified</span>
        </div>
      </div>
    </div>
  );
};
