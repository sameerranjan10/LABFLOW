"use client";

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
  Loader2,
  Award,
} from "lucide-react";
import { LabUser, PRESET_LAB_USERS, LabRole } from "@/lib/roles";

interface SignupPageProps {
  onSignUpSuccess: (user?: LabUser) => void;
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
  const [selectedRole, setSelectedRole] = useState<string>("LAB_TECHNICIAN");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
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

    setIsLoading(true);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
      const response = await fetch(`${backendUrl}/api/v1/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fullName,
          email,
          phone: phone || "+1-555-0100",
          password,
          role: selectedRole,
        }),
      });

      if (response.ok) {
        const json = await response.json();
        if (json.success && json.data) {
          const user = json.data;

          const loginRes = await fetch(`${backendUrl}/api/v1/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });

          if (loginRes.ok) {
            const loginJson = await loginRes.json();
            if (loginJson.data?.access_token) {
              localStorage.setItem("labflow_access_token", loginJson.data.access_token);
              localStorage.setItem("labflow_user", JSON.stringify(user));
            }
          }

          const mappedRole: LabRole =
            selectedRole === "ADMIN"
              ? "administrator"
              : selectedRole === "PATHOLOGIST"
              ? "pathologist"
              : selectedRole === "LAB_MANAGER"
              ? "administrator"
              : selectedRole === "RECEPTIONIST"
              ? "collection_staff"
              : "lab_technician";

          const registeredUser: LabUser = {
            id: user.id || `usr-${Date.now()}`,
            name: fullName,
            email: email,
            role: mappedRole,
            title: `${selectedRole} Staff Member`,
            badge: selectedRole,
            department: organization || "Clinical Laboratory",
            location: "Main Reference Lab",
            avatarInitials: fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2),
          };

          setIsLoading(false);
          onSignUpSuccess(registeredUser);
          return;
        }
      } else {
        const errJson = await response.json().catch(() => null);
        const msg = errJson?.error?.message || "Registration failed. Email may already exist.";
        setErrorMessage(msg);
        setIsLoading(false);
        return;
      }
    } catch (err) {
      console.warn("Backend API offline. Completing local registration session.");
    }

    setIsLoading(false);

    const mappedRole: LabRole =
      selectedRole === "ADMIN"
        ? "administrator"
        : selectedRole === "PATHOLOGIST"
        ? "pathologist"
        : selectedRole === "RECEPTIONIST"
        ? "collection_staff"
        : "lab_technician";

    const fallbackUser: LabUser = {
      id: `usr-new-${Date.now()}`,
      name: fullName,
      email: email,
      role: mappedRole,
      title: `${selectedRole} Staff Member`,
      badge: selectedRole,
      department: organization || "Clinical Laboratory",
      location: "Main Reference Lab",
      avatarInitials: fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2),
    };

    onSignUpSuccess(fallbackUser);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] relative flex flex-col justify-between selection:bg-sky-500 selection:text-white font-sans overflow-hidden">
      {/* FADED LIGHT LAB BACKGROUND IMAGE LAYER */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-40"
        style={{ backgroundImage: "url('/images/signup_lab_bg.jpg')" }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#F8FAFC]/90 via-[#F8FAFC]/80 to-sky-50/60 backdrop-blur-[1px]" />

      {/* CONTENT WRAPPER */}
      <div className="relative z-10 flex flex-col min-h-screen justify-between">
        {/* HEADER NAVBAR */}
        <header className="h-16 border-b border-slate-200/80 bg-white/90 backdrop-blur-md px-6 lg:px-12 flex items-center justify-between sticky top-0 z-30">
          <button
            onClick={onGoToLanding}
            className="flex items-center gap-2.5 group cursor-pointer focus:outline-none"
          >
            <div className="w-9 h-9 rounded-xl bg-sky-600 flex items-center justify-center text-white shadow-xs group-hover:bg-sky-700 transition-colors">
              <FlaskConical className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <span className="text-base font-extrabold tracking-tight text-slate-900 block leading-none">
                LABFLOW
              </span>
              <span className="text-[10px] font-semibold text-sky-600 block leading-none mt-1">
                Smart Laboratory Platform
              </span>
            </div>
          </button>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 hidden sm:inline">Already registered?</span>
            <button
              onClick={onGoToLogin}
              className="px-4 py-2 text-xs font-bold text-sky-700 hover:text-sky-800 bg-sky-50 hover:bg-sky-100/80 rounded-xl transition-colors cursor-pointer border border-sky-200/80"
            >
              Sign In
            </button>
          </div>
        </header>

        {/* SPLIT-SCREEN MAIN CONTAINER */}
        <main className="flex-1 max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-8 p-4 lg:p-8 items-center">
          {/* LEFT COLUMN: BRANDING & VISUAL */}
          <div className="lg:col-span-5 space-y-6 lg:py-8 pr-0 lg:pr-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-100/80 border border-sky-200 text-sky-800 text-xs font-bold backdrop-blur-sm">
              <ShieldCheck className="w-4 h-4 text-sky-600" />
              Enterprise Healthcare Platform
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Start your journey with <span className="text-sky-600">LabFlow.</span>
              </h1>
              <p className="text-sm text-slate-600 leading-relaxed max-w-md">
                Simplify laboratory management and bring every step of your workflow together in one intelligent, real-time operating system.
              </p>
            </div>
          </div>

          {/* RIGHT COLUMN: SIGNUP FORM */}
          <div className="lg:col-span-7 max-w-lg mx-auto w-full">
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xl space-y-5">
              <div className="space-y-1">
                <h2 className="text-xl font-extrabold text-slate-900">Create Your Staff Account</h2>
                <p className="text-xs text-slate-500">Register to access your assigned laboratory workspace</p>
              </div>

              {errorMessage && (
                <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200 font-medium leading-relaxed flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* FULL NAME & EMAIL */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Dr. Alex Morgan"
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50/50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Work Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="alex@laboratory.com"
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50/50"
                      />
                    </div>
                  </div>
                </div>

                {/* ORGANIZATION & ROLE */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Laboratory / Hospital Name
                    </label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={organization}
                        onChange={(e) => setOrganization(e.target.value)}
                        placeholder="Apex Diagnostics HQ"
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50/50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Staff Role Persona *
                    </label>
                    <div className="relative">
                      <Award className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50/50 font-medium"
                      >
                        <option value="LAB_TECHNICIAN">Lab Technician</option>
                        <option value="PATHOLOGIST">Pathologist</option>
                        <option value="RECEPTIONIST">Receptionist / Intake</option>
                        <option value="LAB_MANAGER">Lab Manager</option>
                        <option value="ADMIN">Administrator</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* PHONE */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Contact Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 019-2834"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50/50"
                    />
                  </div>
                </div>

                {/* PASSWORD & CONFIRM */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Create Password *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50/50"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50/50"
                      />
                    </div>
                  </div>
                </div>

                {/* PASSWORD STRENGTH BAR */}
                {password && (
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-500">Password Strength:</span>
                      <span className={`font-bold ${strength.text}`}>{strength.label}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex gap-1">
                      <div className={`h-full flex-1 ${strength.score >= 1 ? strength.color : "bg-slate-200"}`}></div>
                      <div className={`h-full flex-1 ${strength.score >= 2 ? strength.color : "bg-slate-200"}`}></div>
                      <div className={`h-full flex-1 ${strength.score >= 3 ? strength.color : "bg-slate-200"}`}></div>
                    </div>
                  </div>
                )}

                {/* TERMS CHECKBOX */}
                <div className="pt-1">
                  <label className="flex items-start gap-2.5 text-xs text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="rounded border-slate-300 text-sky-600 focus:ring-sky-500 h-4 w-4 mt-0.5"
                    />
                    <span>
                      I agree to the <a href="#" onClick={(e) => e.preventDefault()} className="text-sky-600 underline">Terms of Service</a> and <a href="#" onClick={(e) => e.preventDefault()} className="text-sky-600 underline">Privacy Policy</a>.
                    </span>
                  </label>
                </div>

                {/* SUBMIT BUTTON */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-md shadow-sky-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 mt-3 hover:-translate-y-0.5"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Registering Account...
                    </>
                  ) : (
                    <>
                      Create Workspace Account
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </main>

        {/* FOOTER */}
        <footer className="py-4 border-t border-slate-200 text-center text-xs text-slate-500 bg-white/80 backdrop-blur-md">
          © 2026 LabFlow Inc. All rights reserved. Professional Healthcare SaaS Platform.
        </footer>
      </div>
    </div>
  );
};
