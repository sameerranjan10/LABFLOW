"use client";

import React, { useState } from "react";
import { FlaskConical, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";

interface LoginPageProps {
  onLoginSuccess: () => void;
  onGoToSignUp?: () => void;
  onGoToLanding?: () => void;
  onRequestDemo?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onGoToSignUp,
  onGoToLanding,
  onRequestDemo,
}) => {
  const [email, setEmail] = useState("admin@apexdiagnostics.com");
  const [password, setPassword] = useState("••••••••••••");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage("Please enter both email address and password.");
      return;
    }

    onLoginSuccess();
  };

  const handleGoogleSignIn = () => {
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
          {errorMessage && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
              {errorMessage}
            </div>
          )}

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
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    alert("Password reset link sent to work email.");
                  }}
                  className="text-[11px] font-medium text-indigo-600 hover:underline"
                >
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

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              Sign In to LabFlow
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* DIVIDER */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full"></div>
            <span className="bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider absolute">
              OR
            </span>
          </div>

          {/* DEMO / WORKSPACE REQUEST */}
          <button
            onClick={() => {
              if (onRequestDemo) onRequestDemo();
              else alert("Demo request submitted! Our enterprise team will contact you.");
            }}
            className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold text-xs rounded-lg shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            Don't have an enterprise workspace? <span className="text-indigo-600 underline">Request a Demo</span>
          </button>

          {/* SWITCH TO SIGN UP */}
          <div className="pt-2 text-center text-xs text-slate-500">
            Don't have an account?{" "}
            <button
              onClick={onGoToSignUp || onLoginSuccess}
              className="text-indigo-600 hover:text-indigo-800 font-bold hover:underline cursor-pointer"
            >
              Sign up
            </button>
          </div>
        </div>

        {/* FOOTER */}
        <footer className="text-center text-xs text-slate-400">
          © 2026 LabFlow Inc. ISO 15189 & 21 CFR Part 11 Compliant Laboratory Platform.
        </footer>
      </div>
    </div>
  );
};
