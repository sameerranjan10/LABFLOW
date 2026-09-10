import React, { useState } from "react";
import {
  FlaskConical,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  Activity,
  TestTube2,
  FileCheck2,
} from "lucide-react";

interface LoginPageProps {
  onLoginSuccess: () => void;
  onGoToSignUp?: () => void;
  onGoToLanding?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onGoToSignUp,
  onGoToLanding,
}) => {
  const [email, setEmail] = useState("admin@apexdiagnostics.com");
  const [password, setPassword] = useState("••••••••••••");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
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
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-sky-500 selection:text-white font-sans">
      {/* HEADER NAVBAR */}
      <header className="h-16 border-b border-slate-200 bg-white/90 backdrop-blur-md px-6 lg:px-12 flex items-center justify-between sticky top-0 z-30">
        <button
          onClick={onGoToLanding}
          className="flex items-center gap-2.5 group cursor-pointer focus:outline-none"
        >
          <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-sky-400 shadow-xs group-hover:bg-slate-800 transition-colors">
            <FlaskConical className="w-5 h-5 text-sky-400" />
          </div>
          <div className="text-left">
            <span className="text-base font-extrabold tracking-tight text-slate-900 block leading-none">
              LABFLOW
            </span>
            <span className="text-[10px] font-semibold text-sky-700 block leading-none mt-1">
              Smart Laboratory Platform
            </span>
          </div>
        </button>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 hidden sm:inline">New to LabFlow?</span>
          <button
            onClick={onGoToSignUp}
            className="px-4 py-2 text-xs font-bold text-sky-700 hover:text-sky-800 bg-sky-50 hover:bg-sky-100/80 rounded-lg transition-colors cursor-pointer border border-sky-200/80"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* SPLIT-SCREEN MAIN CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-8 p-4 lg:p-8 items-center">
        {/* LEFT COLUMN: BRANDING & PREVIEW */}
        <div className="lg:col-span-6 space-y-6 lg:py-8 pr-0 lg:pr-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-sky-600" />
            NABL & CAP Interoperable Platform
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Welcome back to LabFlow.
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed max-w-lg">
              Manage your laboratory workflow, track samples in real time, and access clinical diagnostic results from one secure platform.
            </p>
          </div>

          {/* VISUAL PREVIEW CARD */}
          <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-xs font-bold text-slate-200">Apex Diagnostics Main Lab</span>
              </div>
              <span className="text-[11px] font-mono text-sky-400 bg-sky-950 px-2 py-0.5 rounded border border-sky-800">
                Live Status: Operational
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-1">
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
                <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mb-1">
                  <Activity className="w-3.5 h-3.5 text-sky-400" />
                  <span>Pending</span>
                </div>
                <span className="text-lg font-bold text-white block">14</span>
              </div>

              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
                <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mb-1">
                  <TestTube2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Processing</span>
                </div>
                <span className="text-lg font-bold text-white block">42</span>
              </div>

              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
                <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mb-1">
                  <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Completed</span>
                </div>
                <span className="text-lg font-bold text-white block">128</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> ISO 15189 Compliant
              </span>
              <span className="font-mono text-[11px] text-slate-400">HIPAA Certified</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: SIGN-IN CARD */}
        <div className="lg:col-span-6 mt-6 lg:mt-0">
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xl max-w-md mx-auto space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Sign in to your account
              </h2>
              <p className="text-xs text-slate-500">
                Enter your credentials to access the laboratory dashboard.
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* EMAIL */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@laboratory.com"
                    className="w-full pl-9 pr-3.5 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50/50"
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Password
                  </label>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      alert("Password reset link has been dispatched to your work email.");
                    }}
                    className="text-[11px] font-medium text-sky-700 hover:underline"
                  >
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-9 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* REMEMBER ME */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
                  />
                  Remember me for 30 days
                </label>
              </div>

              {/* SUBMIT BUTTON */}
              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                Sign In
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

            {/* GOOGLE SSO */}
            <button
              onClick={handleGoogleSignIn}
              className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold text-xs rounded-lg shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.29v3.14C3.26 21.3 7.31 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.59H1.29B12.01 4.29 9 12 9s3.01 3 7.71 5.41l3.98-3.14z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.59l3.99 3.14c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              Continue with Google
            </button>

            {/* SWITCH TO SIGN UP */}
            <div className="pt-2 text-center text-xs text-slate-500">
              Don't have an account?{" "}
              <button
                onClick={onGoToSignUp}
                className="text-sky-700 hover:text-sky-800 font-bold hover:underline cursor-pointer"
              >
                Sign up
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="py-4 px-6 border-t border-slate-200 text-center text-xs text-slate-500 bg-white">
        © 2026 LabFlow Inc. All rights reserved. Professional Healthcare SaaS Platform.
      </footer>
    </div>
  );
};
