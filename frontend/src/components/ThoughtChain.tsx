"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertTriangle, Clock, ShieldCheck, Cpu, ArrowRight } from "lucide-react";
import type { ThoughtStep } from "@/data/mockData";

interface ThoughtChainProps {
  steps: ThoughtStep[];
  currentStepIndex: number;
  isRunning: boolean;
}

export function ThoughtChain({ steps, currentStepIndex, isRunning }: ThoughtChainProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
        <div className="flex items-center gap-2">
          <Cpu className="h-4 w-4 text-sky-400" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
            Live Agentic Thought-Chain (Glassbox Pipeline)
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {isRunning ? (
            <span className="flex items-center gap-1.5 text-[11px] font-mono text-sky-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
              </span>
              Streaming Step {Math.min(currentStepIndex + 1, steps.length)}/{steps.length}...
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400">
              <ShieldCheck className="h-3.5 w-3.5" />
              Pipeline Verified
            </span>
          )}
        </div>
      </div>

      {/* Steps List */}
      <div className="space-y-2">
        <AnimatePresence>
          {steps.map((step, idx) => {
            const isDone = idx < currentStepIndex || (!isRunning && currentStepIndex >= steps.length);
            const isCurrent = isRunning && idx === currentStepIndex;
            const isPending = idx > currentStepIndex && isRunning;

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, delay: idx * 0.05 }}
                className={`flex flex-col gap-1 rounded-lg border p-2.5 transition-colors ${
                  isCurrent
                    ? "border-sky-500/50 bg-sky-950/20 shadow-sm"
                    : isDone
                    ? step.status === "warning"
                      ? "border-rose-900/40 bg-rose-950/20"
                      : "border-slate-800/80 bg-slate-950/40"
                    : "border-slate-900 bg-slate-950/20 opacity-40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {/* Status Icon */}
                    {isCurrent ? (
                      <span className="relative flex h-4 w-4 items-center justify-center">
                        <Clock className="h-3.5 w-3.5 text-sky-400 animate-spin" />
                      </span>
                    ) : isDone ? (
                      step.status === "warning" ? (
                        <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      )
                    ) : (
                      <div className="h-3.5 w-3.5 rounded-full border border-slate-700 bg-slate-800/40" />
                    )}

                    {/* Step Label */}
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-slate-400">
                        [{step.id}]
                      </span>
                      <span
                        className={`text-xs font-medium ${
                          isCurrent
                            ? "text-sky-200"
                            : isDone
                            ? step.status === "warning"
                              ? "text-rose-200"
                              : "text-slate-200"
                            : "text-slate-500"
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                  </div>

                  {/* Latency & Value Badge */}
                  <div className="flex items-center gap-2">
                    {step.value && (
                      <span
                        className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                          step.status === "warning"
                            ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                            : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        }`}
                      >
                        {step.value}
                      </span>
                    )}
                    {isDone && (
                      <span className="font-mono text-[10px] text-slate-500">
                        {step.latencyMs}ms
                      </span>
                    )}
                  </div>
                </div>

                {/* Sub-detail description */}
                {isDone && step.detail && (
                  <div className="pl-6 pt-0.5 text-[11px] text-slate-400 flex items-start gap-1">
                    <ArrowRight className="h-3 w-3 text-slate-600 mt-0.5 shrink-0" />
                    <span>{step.detail}</span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
