import React, { useState } from "react";
import { FlaskConical, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";

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
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6 selection:bg-indigo-500 selection:text-white">
      <div className="w-full max-w-md space-y-6">
        {/* BRAND LOGO */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600 text-white shadow-md mb-1">
            <FlaskConical className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            LABFLOW
          </h1>
          <p className="text-sm font-semibold text-indigo-600">
            Run your laboratory in flow.
          </p>
          <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
            Manage orders, samples, processing and results from one operational platform.
          </p>
        </div>

        {/* LOGIN FORM CARD */}
        <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-xl space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Work Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@laboratory.com"
                className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Password
                </label>
                <a href="#" onClick={(e) => { e.preventDefault(); alert("Password reset link sent to work email."); }} className="text-[11px] font-medium text-indigo-600 hover:underline">
                  Forgot password?
                </a>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
              />
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
              Don't have an enterprise workspace? <span className="text-indigo-600 underline">Request a Demo</span>
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
