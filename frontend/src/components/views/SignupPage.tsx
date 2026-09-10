import React, { useState } from "react";
import {
  FlaskConical,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Mail,
  User,
  Phone,
  Building2,
  Eye,
  EyeOff,
  AlertCircle,
} from "lucide-react";

interface SignupPageProps {
  onSignUpSuccess: () => void;
  onGoToLogin: () => void;
  onGoToLanding: () => void;
}

export const SignupPage: React.FC<SignupPageProps> = ({
  onSignUpSuccess,
  onGoToLogin,
  onGoToLanding,
}) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [organization, setOrganization] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: "None", color: "bg-slate-200" };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 1, label: "Weak", color: "bg-rose-500", text: "text-rose-600" };
    if (score === 2 || score === 3) return { score: 2, label: "Medium", color: "bg-amber-500", text: "text-amber-600" };
    return { score: 3, label: "Strong", color: "bg-emerald-500", text: "text-emerald-600" };
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim() || !email.trim() || !organization.trim() || !password || !confirmPassword) {
      setErrorMessage("Please fill out all required fields.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    if (!agreeTerms) {
      setErrorMessage("You must accept the Terms & Conditions to create an account.");
      return;
    }

    onSignUpSuccess();
  };

  const handleGoogleSignUp = () => {
    onSignUpSuccess();
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
          <span className="text-xs text-slate-500 hidden sm:inline">Already registered?</span>
          <button
            onClick={onGoToLogin}
            className="px-4 py-2 text-xs font-bold text-sky-700 hover:text-sky-800 bg-sky-50 hover:bg-sky-100/80 rounded-lg transition-colors cursor-pointer border border-sky-200/80"
          >
            Sign In
          </button>
        </div>
      </header>

      {/* SPLIT-SCREEN MAIN CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-8 p-4 lg:p-8 items-center">
        {/* LEFT COLUMN: BRANDING & VISUAL */}
        <div className="lg:col-span-5 space-y-6 lg:py-8 pr-0 lg:pr-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-sky-600" />
            Enterprise Healthcare Platform
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Start your journey with LabFlow.
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed max-w-md">
              Simplify laboratory management and bring every step of your workflow together in one intelligent, real-time operating system.
            </p>
          </div>

          {/* VISUAL ILLUSTRATION CARD */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-semibold text-sky-400 tracking-wide uppercase">
                What you get with LabFlow
              </span>
              <span className="text-[10px] font-mono bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded border border-sky-500/30">
                Turnkey Setup
              </span>
            </div>

            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Instant Specimen Traceability</strong> — End-to-end chain of custody tracking from collection to results.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>FHIR R4 Interoperability</strong> — Standardized JSON export ready for core hospital EHR ingestion.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Automated Result Verification</strong> — Real-time warning flags and panic value notifications.</span>
              </li>
            </ul>

            <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800">
              <span>Setup time: &lt; 2 minutes</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                99.9% Uptime Guarantee
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: REGISTRATION CARD */}
        <div className="lg:col-span-7 mt-6 lg:mt-0">
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xl max-w-xl mx-auto space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Create your LabFlow account
              </h2>
              <p className="text-xs text-slate-500">
                Enter your details below to activate your laboratory workspace.
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* FULL NAME */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Dr. Sarah Jenkins"
                      className="w-full pl-9 pr-3.5 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50/50"
                    />
                  </div>
                </div>

                {/* EMAIL */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="s.jenkins@apexlabs.com"
                      className="w-full pl-9 pr-3.5 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50/50"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* PHONE */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 234-5678"
                      className="w-full pl-9 pr-3.5 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50/50"
                    />
                  </div>
                </div>

                {/* ORGANIZATION */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Organization / Lab Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      placeholder="Apex Diagnostics Main"
                      className="w-full pl-9 pr-3.5 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50/50"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* PASSWORD */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
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

                {/* CONFIRM PASSWORD */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Confirm Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className="w-full pl-9 pr-3.5 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50/50"
                    />
                  </div>
                </div>
              </div>

              {/* PASSWORD STRENGTH INDICATOR */}
              {password && (
                <div className="space-y-1 pt-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Password strength:</span>
                    <span className={`font-semibold ${strength.text}`}>{strength.label}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex gap-1">
                    <div className={`h-full flex-1 transition-all ${strength.score >= 1 ? strength.color : "bg-slate-200"}`}></div>
                    <div className={`h-full flex-1 transition-all ${strength.score >= 2 ? strength.color : "bg-slate-200"}`}></div>
                    <div className={`h-full flex-1 transition-all ${strength.score >= 3 ? strength.color : "bg-slate-200"}`}></div>
                  </div>
                </div>
              )}

              {/* TERMS CHECKBOX */}
              <div className="flex items-start gap-2 pt-1">
                <input
                  type="checkbox"
                  id="agreeTerms"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
                />
                <label htmlFor="agreeTerms" className="text-xs text-slate-600 leading-tight cursor-pointer">
                  I agree to the{" "}
                  <a href="#" onClick={(e) => { e.preventDefault(); alert("LabFlow Terms of Service."); }} className="text-sky-700 underline font-medium">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="#" onClick={(e) => { e.preventDefault(); alert("LabFlow Privacy Policy."); }} className="text-sky-700 underline font-medium">
                    Privacy Policy
                  </a>
                  .
                </label>
              </div>

              {/* SUBMIT BUTTON */}
              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                Create Account
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
              onClick={handleGoogleSignUp}
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

            {/* SWITCH TO SIGN IN */}
            <div className="pt-2 text-center text-xs text-slate-500">
              Already have an account?{" "}
              <button
                onClick={onGoToLogin}
                className="text-sky-700 hover:text-sky-800 font-bold hover:underline cursor-pointer"
              >
                Sign in
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
