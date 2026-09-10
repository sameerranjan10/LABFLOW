"use client";

import React, { useState, useRef, useEffect } from "react";
import { User, Stethoscope, HeartHandshake, ShieldCheck, ChevronDown, Check } from "lucide-react";
import { PRESET_USERS, type UserRole, type ClinicalUser } from "@/lib/auth";

interface AuthRoleSelectorProps {
  currentUser: ClinicalUser;
  onSelectUser: (user: ClinicalUser) => void;
}

export function AuthRoleSelector({ currentUser, onSelectUser }: AuthRoleSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case "attending_physician":
        return <Stethoscope className="h-3.5 w-3.5 text-sky-400" />;
      case "nurse_coordinator":
        return <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />;
      case "patient":
        return <HeartHandshake className="h-3.5 w-3.5 text-amber-400" />;
    }
  };

  const getRoleBadgeStyle = (role: UserRole) => {
    switch (role) {
      case "attending_physician":
        return "bg-sky-500/20 text-sky-300 border-sky-500/40";
      case "nurse_coordinator":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
      case "patient":
        return "bg-amber-500/20 text-amber-300 border-amber-500/40";
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/90 hover:bg-slate-800 px-3 py-1.5 text-xs transition cursor-pointer"
      >
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-[11px] font-bold text-slate-200 border border-slate-700">
          {currentUser.avatarInitials}
        </div>
        <div className="text-left hidden sm:block">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-100">{currentUser.name}</span>
            <span
              className={`text-[9px] font-mono px-1.5 py-0.2 rounded border ${getRoleBadgeStyle(
                currentUser.role
              )}`}
            >
              {currentUser.badge}
            </span>
          </div>
        </div>
        <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-xl border border-slate-700 bg-slate-900 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-2 py-1.5 border-b border-slate-800 text-[11px] font-mono text-slate-400">
            SWITCH CLINICAL PERSONA (DEMO RBAC)
          </div>

          <div className="space-y-1 pt-1.5">
            {(Object.keys(PRESET_USERS) as UserRole[]).map((roleKey) => {
              const u = PRESET_USERS[roleKey];
              const isSelected = u.id === currentUser.id;
              return (
                <button
                  key={u.id}
                  onClick={() => {
                    onSelectUser(u);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-start justify-between rounded-lg p-2 text-left text-xs transition cursor-pointer ${
                    isSelected ? "bg-slate-800/90 border border-slate-700" : "hover:bg-slate-800/50"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <div className="mt-0.5">{getRoleIcon(u.role)}</div>
                    <div>
                      <div className="font-semibold text-slate-200">{u.name}</div>
                      <div className="text-[10px] text-slate-400">{u.title}</div>
                      <div className="text-[10px] font-mono text-slate-500">{u.department}</div>
                    </div>
                  </div>
                  {isSelected && <Check className="h-4 w-4 text-emerald-400 mt-1 shrink-0" />}
                </button>
              );
            })}
          </div>

          <div className="mt-2 border-t border-slate-800 px-2 pt-1.5 text-[10px] text-slate-500">
            Adheres to DISHA / ABDM Role Permissions
          </div>
        </div>
      )}
    </div>
  );
}
