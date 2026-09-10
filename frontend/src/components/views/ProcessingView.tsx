import React, { useState, useMemo } from "react";
import { LabSample, ResultParameter, TestResult } from "@/data/labflowData";
import { StatusBadge } from "@/components/StatusBadge";
import {
  Cpu,
  Play,
  RefreshCw,
  CheckCircle2,
  AlertOctagon,
  Settings,
  Layers,
  Activity,
  Filter,
  Search,
  Check,
  RotateCcw,
  FlaskConical,
  Database,
  Sliders,
  ShieldCheck,
  Droplet,
  Clock,
  ArrowRight,
  X,
  FileText,
  AlertTriangle,
  Zap,
  CheckCheck,
  ChevronRight,
  PlusCircle,
} from "lucide-react";

interface ProcessingViewProps {
  samples: LabSample[];
  onSelectSample: (sample: LabSample) => void;
  onNavigateToResults: () => void;
  onSampleUpdated?: (sample: LabSample) => void;
  onSamplesBatchUpdated?: (samples: LabSample[]) => void;
  onNotify?: (title: string, message?: string, type?: "success" | "warning" | "info" | "error") => void;
}

interface InstrumentInfo {
  id: string;
  name: string;
  dept: string;
  status: "Running" | "Calibrating" | "Maintenance" | "Idle";
  activeBatch: number;
  readyResults: number;
  error: boolean;
  throughput: string;
  calibrationStatus: "Passed" | "Due" | "Calibrating";
  reagents: { name: string; level: number; lot: string; expiry: string }[];
}

const INITIAL_INSTRUMENTS: InstrumentInfo[] = [
  {
    id: "inst-sysmex",
    name: "Sysmex XN-1000",
    dept: "Hematology",
    status: "Running",
    activeBatch: 12,
    readyResults: 4,
    error: false,
    throughput: "100 samples/hr",
    calibrationStatus: "Passed",
    reagents: [
      { name: "Cellpack DCL Diluent", level: 84, lot: "LOT-CP-2026-9", expiry: "2026-12-31" },
      { name: "Fluorocell WDF", level: 71, lot: "LOT-FC-2026-3", expiry: "2026-11-15" },
      { name: "Lysercell WNR", level: 92, lot: "LOT-LC-2026-8", expiry: "2027-01-20" },
      { name: "Cellclean Detergent", level: 98, lot: "LOT-CD-2026-1", expiry: "2027-04-10" },
    ],
  },
  {
    id: "inst-cobas",
    name: "Roche Cobas c501",
    dept: "Biochemistry",
    status: "Running",
    activeBatch: 18,
    readyResults: 6,
    error: false,
    throughput: "600 tests/hr",
    calibrationStatus: "Passed",
    reagents: [
      { name: "Creatinine Jaffe Gen.2", level: 68, lot: "LOT-CR-8821", expiry: "2026-10-30" },
      { name: "Glucose HK Liquid", level: 76, lot: "LOT-GL-4491", expiry: "2026-11-28" },
      { name: "Total Cholesterol Enzymatic", level: 89, lot: "LOT-CH-9022", expiry: "2027-02-14" },
      { name: "ISE Internal Reference Sol.", level: 94, lot: "LOT-ISE-3100", expiry: "2027-03-05" },
    ],
  },
  {
    id: "inst-biorad",
    name: "Bio-Rad Variant II",
    dept: "HbA1c / HPLC",
    status: "Calibrating",
    activeBatch: 5,
    readyResults: 1,
    error: false,
    throughput: "30 tests/hr",
    calibrationStatus: "Calibrating",
    reagents: [
      { name: "Elution Buffer 1", level: 62, lot: "LOT-EB1-771", expiry: "2026-11-01" },
      { name: "Elution Buffer 2", level: 81, lot: "LOT-EB2-882", expiry: "2026-11-01" },
      { name: "HPLC Analytical Column", level: 50, lot: "COL-VAR-492", expiry: "2026-12-15" },
    ],
  },
  {
    id: "inst-abbott",
    name: "Abbott Architect i2000",
    dept: "Immunology",
    status: "Maintenance",
    activeBatch: 0,
    readyResults: 0,
    error: true,
    throughput: "200 tests/hr",
    calibrationStatus: "Due",
    reagents: [
      { name: "hs-Troponin I Reagent", level: 42, lot: "LOT-TROP-993", expiry: "2026-10-18" },
      { name: "TSH Immunoassay Kit", level: 55, lot: "LOT-TSH-214", expiry: "2026-12-05" },
      { name: "Pre-Trigger Solution", level: 90, lot: "LOT-PT-1120", expiry: "2027-01-11" },
    ],
  },
];

function generateRealisticParameters(sample: LabSample): ResultParameter[] {
  const t = (sample.test || "").toLowerCase();
  if (t.includes("cbc") || t.includes("blood") || t.includes("hemoglobin") || t.includes("hematology")) {
    return [
      { name: "Hemoglobin", result: 13.8, unit: "g/dL", referenceRange: "12.0 - 16.0", flag: "Normal", status: "Verified" },
      { name: "White Blood Cells (WBC)", result: 7.4, unit: "x10^3/µL", referenceRange: "4.0 - 11.0", flag: "Normal", status: "Verified" },
      { name: "Platelet Count", result: 245, unit: "x10^3/µL", referenceRange: "150 - 450", flag: "Normal", status: "Verified" },
      { name: "Hematocrit (HCT)", result: 41.2, unit: "%", referenceRange: "36.0 - 48.0", flag: "Normal", status: "Verified" },
      { name: "RBC Count", result: 4.65, unit: "x10^6/µL", referenceRange: "4.0 - 5.5", flag: "Normal", status: "Verified" },
      { name: "Neutrophils %", result: 62.0, unit: "%", referenceRange: "40.0 - 70.0", flag: "Normal", status: "Verified" },
      { name: "Lymphocytes %", result: 29.5, unit: "%", referenceRange: "20.0 - 45.0", flag: "Normal", status: "Verified" },
    ];
  }
  if (t.includes("cmp") || t.includes("metabolic") || t.includes("biochemistry") || t.includes("lft") || t.includes("kft")) {
    return [
      { name: "Fasting Blood Glucose", result: 102, unit: "mg/dL", referenceRange: "70 - 99", flag: "High", status: "Verified" },
      { name: "Serum Creatinine", result: 0.95, unit: "mg/dL", referenceRange: "0.6 - 1.2", flag: "Normal", status: "Verified" },
      { name: "Blood Urea Nitrogen (BUN)", result: 16.2, unit: "mg/dL", referenceRange: "7.0 - 20.0", flag: "Normal", status: "Verified" },
      { name: "eGFR (CKD-EPI)", result: 96, unit: "mL/min/1.73m²", referenceRange: "> 60", flag: "Normal", status: "Verified" },
      { name: "Sodium (Na+)", result: 140, unit: "mmol/L", referenceRange: "136 - 145", flag: "Normal", status: "Verified" },
      { name: "Potassium (K+)", result: 4.3, unit: "mmol/L", referenceRange: "3.5 - 5.1", flag: "Normal", status: "Verified" },
    ];
  }
  if (t.includes("lipid") || t.includes("cholesterol")) {
    return [
      { name: "Total Cholesterol", result: 215, unit: "mg/dL", referenceRange: "< 200", flag: "High", status: "Verified" },
      { name: "HDL Cholesterol", result: 48, unit: "mg/dL", referenceRange: "> 40", flag: "Normal", status: "Verified" },
      { name: "LDL Cholesterol (Direct)", result: 138, unit: "mg/dL", referenceRange: "< 100", flag: "High", status: "Verified" },
      { name: "Triglycerides", result: 165, unit: "mg/dL", referenceRange: "< 150", flag: "High", status: "Verified" },
    ];
  }
  if (t.includes("hba1c") || t.includes("glycated")) {
    return [
      { name: "Hemoglobin A1c (HbA1c)", result: 6.2, unit: "%", referenceRange: "< 5.7", flag: "High", status: "Verified" },
      { name: "Estimated Average Glucose", result: 131, unit: "mg/dL", referenceRange: "< 117", flag: "High", status: "Verified" },
    ];
  }
  if (t.includes("troponin")) {
    return [
      { name: "hs-Troponin I", result: 8.4, unit: "ng/L", referenceRange: "< 14.0", flag: "Normal", status: "Verified" },
      { name: "CK-MB Mass", result: 2.1, unit: "ng/mL", referenceRange: "< 5.0", flag: "Normal", status: "Verified" },
    ];
  }
  return [
    { name: "Primary Diagnostic Assay", result: 104, unit: "U/L", referenceRange: "60 - 120", flag: "Normal", status: "Verified" },
    { name: "Secondary Confirmatory Marker", result: 22.8, unit: "mg/L", referenceRange: "10.0 - 30.0", flag: "Normal", status: "Verified" },
    { name: "Analyzer Precision Index", result: 99.6, unit: "%", referenceRange: "> 98.0", flag: "Normal", status: "Verified" },
  ];
}

export const ProcessingView: React.FC<ProcessingViewProps> = ({
  samples,
  onSelectSample,
  onNavigateToResults,
  onSampleUpdated,
  onSamplesBatchUpdated,
  onNotify,
}) => {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<"queue" | "centrifuge" | "qc">("queue");
  const [selectedWorkstation, setSelectedWorkstation] = useState<string>("All");

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [stageFilter, setStageFilter] = useState<"ACTIVE" | "RECEIVED" | "PROCESSING" | "ALL">("ACTIVE");

  // Batch Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [batchIngesting, setBatchIngesting] = useState(false);

  // Instruments State
  const [instruments, setInstruments] = useState<InstrumentInfo[]>(INITIAL_INSTRUMENTS);
  const [reagentModalInst, setReagentModalInst] = useState<InstrumentInfo | null>(null);

  // Single Analyzer Ingestion Simulation Modal State
  const [simulationSample, setSimulationSample] = useState<LabSample | null>(null);
  const [simStep, setSimStep] = useState<number>(1);
  const [simProgress, setSimProgress] = useState<number>(0);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [generatedParams, setGeneratedParams] = useState<ResultParameter[]>([]);

  // Centrifuge Simulator State
  const [centrifuge1Running, setCentrifuge1Running] = useState(true);
  const [centrifuge1TimeRemaining, setCentrifuge1TimeRemaining] = useState("03:42");
  const [centrifuge2Running, setCentrifuge2Running] = useState(false);

  // QC State
  const [qcLastRun, setQcLastRun] = useState<string>("Today, 06:30 AM (Morning Shift)");
  const [qcRunning, setQcRunning] = useState<boolean>(false);

  // Candidates in queue: if stageFilter is ACTIVE, show RECEIVED and PROCESSING. If ALL, show all lab specimens.
  const eligibleSamples = useMemo(() => {
    if (stageFilter === "ALL") return samples;
    if (stageFilter === "RECEIVED") return samples.filter((s) => s.stage === "RECEIVED");
    if (stageFilter === "PROCESSING") return samples.filter((s) => s.stage === "PROCESSING");
    // Default ACTIVE: show PROCESSING, RECEIVED, and also if none exist, show all active non-released
    const active = samples.filter((s) => s.stage === "PROCESSING" || s.stage === "RECEIVED");
    if (active.length > 0) return active;
    // Fallback so the user NEVER faces an empty dead screen if all were advanced
    return samples;
  }, [samples, stageFilter]);

  const filteredSamples = useMemo(() => {
    return eligibleSamples.filter((s) => {
      // Workstation filter
      if (selectedWorkstation !== "All") {
        const testLower = (s.test || "").toLowerCase();
        if (selectedWorkstation === "Hematology" && !(testLower.includes("cbc") || testLower.includes("blood") || testLower.includes("hematology"))) return false;
        if (selectedWorkstation === "Biochemistry" && !(testLower.includes("cmp") || testLower.includes("metabolic") || testLower.includes("lipid") || testLower.includes("cholesterol"))) return false;
        if (selectedWorkstation === "HbA1c / HPLC" && !testLower.includes("hba1c")) return false;
        if (selectedWorkstation === "Immunology" && !(testLower.includes("troponin") || testLower.includes("tsh") || testLower.includes("viral"))) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = s.patient.name.toLowerCase().includes(q);
        const matchesId = s.id.toLowerCase().includes(q);
        const matchesOrderId = s.orderId.toLowerCase().includes(q);
        const matchesBarcode = s.barcode?.toLowerCase().includes(q);
        const matchesTest = s.test?.toLowerCase().includes(q);
        if (!matchesName && !matchesId && !matchesOrderId && !matchesBarcode && !matchesTest) return false;
      }

      return true;
    });
  }, [eligibleSamples, selectedWorkstation, searchQuery]);

  // Select all toggle
  const allFilteredSelected = filteredSamples.length > 0 && filteredSamples.every((s) => selectedIds.includes(s.id));

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredSamples.map((s) => s.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // REPLENISH DEMO QUEUE (If all specimens have been processed)
  const handleReplenishQueue = async () => {
    const demoSpecimens: LabSample[] = [
      {
        id: `SMP-${Math.floor(10000 + Math.random() * 90000)}`,
        orderId: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
        patient: { id: "P-84920", name: "Aditi Rao", age: 47, gender: "Female", phone: "+91 98765 43210", mrn: "MRN-84920" },
        sampleType: "Whole Blood (EDTA)",
        test: "CBC (Complete Blood Count)",
        currentLocation: "Hematology Lab - Sysmex XN-1000",
        stage: "PROCESSING",
        collectedAt: "09:42",
        tat: "15m",
        status: "Processing",
        barcode: "LBF-84920-A",
        volume: "3.0 mL",
        timeline: [
          { id: `tl-${Date.now()}-1`, timestamp: "09:42", date: "2026-09-10", event: "Sample Accessioned", location: "Main Lab Accessioning", operator: "Riya Sharma", details: "Sample verified, placed on analyzer rack", status: "completed" },
        ],
      },
      {
        id: `SMP-${Math.floor(10000 + Math.random() * 90000)}`,
        orderId: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
        patient: { id: "P-67104", name: "Rahul Kumar", age: 68, gender: "Male", phone: "+91 98123 45678", mrn: "MRN-67104" },
        sampleType: "Serum (SST Tube)",
        test: "Lipid Profile & CMP",
        currentLocation: "Biochemistry Lab - Cobas c501",
        stage: "PROCESSING",
        collectedAt: "09:28",
        tat: "25m",
        status: "Processing",
        barcode: "LBF-67104-B",
        volume: "5.0 mL",
        timeline: [
          { id: `tl-${Date.now()}-2`, timestamp: "09:28", date: "2026-09-10", event: "Centrifuged & Loaded", location: "Biochemistry Workstation", operator: "Amit M.", details: "Serum supernatant loaded onto Cobas c501", status: "completed" },
        ],
      },
      {
        id: `SMP-${Math.floor(10000 + Math.random() * 90000)}`,
        orderId: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
        patient: { id: "P-55219", name: "Ramesh Gupta", age: 63, gender: "Male", phone: "+91 99887 76655", mrn: "MRN-55219" },
        sampleType: "Whole Blood (EDTA)",
        test: "HbA1c Glycated Hemoglobin",
        currentLocation: "HPLC Workstation - Bio-Rad Variant II",
        stage: "PROCESSING",
        collectedAt: "10:10",
        tat: "20m",
        status: "Processing",
        barcode: "LBF-55219-G",
        volume: "2.0 mL",
        timeline: [
          { id: `tl-${Date.now()}-3`, timestamp: "10:10", date: "2026-09-10", event: "Accessioned into HPLC Line", location: "HPLC Bench", operator: "Riya Sharma", details: "Calibrators ready", status: "completed" },
        ],
      },
      {
        id: `SMP-${Math.floor(10000 + Math.random() * 90000)}`,
        orderId: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
        patient: { id: "P-44102", name: "Priya Nair", age: 34, gender: "Female", phone: "+91 97654 32109", mrn: "MRN-44102" },
        sampleType: "Serum (SST Tube)",
        test: "Thyroid Profile & Troponin I",
        currentLocation: "Main Lab - Centrifugation Hub",
        stage: "RECEIVED",
        collectedAt: "10:05",
        tat: "30m",
        status: "Received",
        barcode: "LBF-44102-D",
        volume: "4.0 mL",
        timeline: [
          { id: `tl-${Date.now()}-4`, timestamp: "10:05", date: "2026-09-10", event: "Received from Phlebotomy", location: "Central Intake Desk", operator: "Sunita V.", details: "Ready for pre-analytical spin", status: "completed" },
        ],
      },
    ];

    if (onSamplesBatchUpdated) {
      onSamplesBatchUpdated(demoSpecimens);
    } else if (onSampleUpdated) {
      demoSpecimens.forEach((s) => onSampleUpdated(s));
    }

    if (onNotify) {
      onNotify(
        "Processing Queue Replenished",
        "4 fresh diagnostic specimens loaded across Hematology, Biochemistry, HbA1c, and Immunology workstations.",
        "success"
      );
    }
  };

  // INSTRUMENT ACTIONS
  const handleRestoreInstrument = (id: string) => {
    setInstruments((prev) =>
      prev.map((inst) => {
        if (inst.id === id) {
          return {
            ...inst,
            status: "Running",
            error: false,
            calibrationStatus: "Passed",
          };
        }
        return inst;
      })
    );
    if (onNotify) {
      onNotify(
        "Instrument Diagnostic Self-Check Passed",
        "Abbott Architect i2000 prime cycle successful. Restored to Online Running status.",
        "success"
      );
    }
  };

  const handleRunCalibration = (id: string) => {
    setInstruments((prev) =>
      prev.map((inst) => (inst.id === id ? { ...inst, status: "Calibrating", calibrationStatus: "Calibrating" } : inst))
    );
    if (onNotify) {
      onNotify("Calibration Sequence Initiated", "Running 2-point optical & voltage calibrators across sensor array.", "info");
    }
    setTimeout(() => {
      setInstruments((prev) =>
        prev.map((inst) =>
          inst.id === id ? { ...inst, status: "Running", calibrationStatus: "Passed" } : inst
        )
      );
      if (onNotify) {
        onNotify("Calibration Verified", "All slopes and intercepts within ±1.0 SD acceptance limits.", "success");
      }
    }, 1800);
  };

  const handleReplenishReagent = (instId: string, reagentName: string) => {
    setInstruments((prev) =>
      prev.map((inst) => {
        if (inst.id === instId) {
          const updatedReagents = inst.reagents.map((r) =>
            r.name === reagentName ? { ...r, level: 100, expiry: "2027-06-30" } : r
          );
          const updatedInst = { ...inst, reagents: updatedReagents };
          if (reagentModalInst && reagentModalInst.id === instId) {
            setReagentModalInst(updatedInst);
          }
          return updatedInst;
        }
        return inst;
      })
    );
    if (onNotify) {
      onNotify("Reagent Cartridge Replaced", `${reagentName} replenished to 100% capacity (Lot validated).`, "success");
    }
  };

  // SINGLE ANALYZER INGESTION SIMULATION
  const handleOpenAnalyzerRun = (sample: LabSample) => {
    setSimulationSample(sample);
    const params = generateRealisticParameters(sample);
    setGeneratedParams(params);
    setSimStep(1);
    setSimProgress(15);
    setIsSimulating(true);

    // Progressive simulated telemetry
    setTimeout(() => {
      setSimStep(2);
      setSimProgress(45);
    }, 700);

    setTimeout(() => {
      setSimStep(3);
      setSimProgress(80);
    }, 1500);

    setTimeout(() => {
      setSimStep(4);
      setSimProgress(100);
      setIsSimulating(false);
    }, 2200);
  };

  const handleTransmitSimulation = async () => {
    if (!simulationSample) return;
    const s = simulationSample;

    try {
      // 1. Advance sample stage in backend
      const patchRes = await fetch("/api/samples", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sampleId: s.id,
          nextStage: "REVIEW",
          operator: "Auto-Analyzer High-Throughput Line",
          notes: `Automated test run finished. Quantitative metrics transmitted via HL7 v2.5 to Pathologist review queue.`,
        }),
      });

      // 2. Ingest generated test results into db.results
      const testResultPayload: TestResult = {
        id: `RES-${s.orderId.replace("ORD-", "")}`,
        orderId: s.orderId,
        sampleId: s.id,
        patient: s.patient,
        testName: s.test,
        instrument: s.currentLocation || "Automated Clinical Analyzer",
        completedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        status: "Pending Review",
        parameters: generatedParams,
      };

      await fetch("/api/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ result: testResultPayload }),
      });

      if (patchRes.ok) {
        const patchData = await patchRes.json();
        if (patchData.sample && onSampleUpdated) {
          onSampleUpdated(patchData.sample);
        }
      }
    } catch (err) {
      console.warn("Analyzer ingestion sync warning:", err);
    }

    if (onNotify) {
      onNotify(
        "Analyzer Run Completed & Transmitted",
        `Specimen ${s.id} for ${s.patient.name} transmitted to Pathologist Review.`,
        "success"
      );
    }

    setSimulationSample(null);
    onNavigateToResults();
  };

  // BATCH INGESTION
  const handleBatchIngest = async () => {
    if (selectedIds.length === 0) return;
    setBatchIngesting(true);

    const targetSamples = eligibleSamples.filter((s) => selectedIds.includes(s.id));
    const updatedList: LabSample[] = [];

    for (const sample of targetSamples) {
      try {
        const res = await fetch("/api/samples", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sampleId: sample.id,
            nextStage: "REVIEW",
            operator: "Batch Auto-Ingestion Engine",
            notes: `Batch analyzer run completed. Results transmitted to review queue.`,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.sample) {
            updatedList.push(data.sample);
          }
        }

        // Ingest corresponding test result
        const params = generateRealisticParameters(sample);
        const resultPayload: TestResult = {
          id: `RES-${sample.orderId.replace("ORD-", "")}`,
          orderId: sample.orderId,
          sampleId: sample.id,
          patient: sample.patient,
          testName: sample.test,
          instrument: sample.currentLocation || "Batch Multi-Analyzer Line",
          completedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          status: "Pending Review",
          parameters: params,
        };

        await fetch("/api/results", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ result: resultPayload }),
        });
      } catch (err) {
        console.warn(`Error batch-advancing ${sample.id}:`, err);
      }
    }

    if (onSamplesBatchUpdated && updatedList.length > 0) {
      onSamplesBatchUpdated(updatedList);
    } else if (onSampleUpdated) {
      updatedList.forEach((s) => onSampleUpdated(s));
    }

    if (onNotify) {
      onNotify(
        "Batch Processing Successful",
        `Successfully processed ${selectedIds.length} specimens. Transmitted to Pathologist Review Queue.`,
        "success"
      );
    }

    setSelectedIds([]);
    setBatchIngesting(false);
  };

  // BATCH CENTRIFUGATION
  const handleBatchCentrifuge = async () => {
    if (selectedIds.length === 0) return;
    const targetSamples = eligibleSamples.filter((s) => selectedIds.includes(s.id));

    for (const sample of targetSamples) {
      try {
        await fetch("/api/samples", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sampleId: sample.id,
            nextStage: "PROCESSING",
            location: "Main Lab - Auto-Analyzer Rack",
            operator: "Eppendorf 5810R Centrifuge Station",
            notes: "Pre-analytical spin cycle complete (3,500 RPM, 10 min). Serum separation verified.",
          }),
        });
      } catch (e) {
        console.warn("Centrifuge error:", e);
      }
    }

    if (onNotify) {
      onNotify(
        "Centrifugation Cycle Completed",
        `${selectedIds.length} blood tubes spun at 3,500 RPM. Supernatant serum ready for auto-analyzers.`,
        "success"
      );
    }
    setSelectedIds([]);
  };

  // QC TRIGGER
  const handleRunDailyQc = () => {
    setQcRunning(true);
    setTimeout(() => {
      setQcRunning(false);
      setQcLastRun(`Today, ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} (Active Run)`);
      if (onNotify) {
        onNotify(
          "Daily Quality Control Passed (NABL/CAP Compliant)",
          "All 4 auto-analyzers cleared Westgard multirules (1-2s, 1-3s, 2-2s). Normal, Low, and High controls verified.",
          "success"
        );
      }
    }, 1500);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* TOP HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Laboratory Processing & Instrument Workstations
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-purple-50 text-purple-700 border border-purple-200">
              HL7 v2.5 / ASTM Interface
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Automated high-throughput analyzers, pre-analytical centrifugation, batch queues, and daily QC verification.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReplenishQueue}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition cursor-pointer flex items-center gap-1.5 border border-slate-200"
            title="Seed incoming specimens into queue for demo"
          >
            <PlusCircle className="w-3.5 h-3.5 text-indigo-600" />
            Replenish Specimen Queue
          </button>
          <button
            onClick={() => handleRunDailyQc()}
            disabled={qcRunning}
            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-xs rounded-lg shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <ShieldCheck className={`w-3.5 h-3.5 ${qcRunning ? "animate-spin" : ""}`} />
            {qcRunning ? "Evaluating Controls..." : "Verify Daily QC"}
          </button>
          <button
            onClick={onNavigateToResults}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            Review Results Queue ({samples.filter((s) => s.stage === "REVIEW").length})
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* VIEW SUB-TABS */}
      <div className="flex items-center justify-between border-b border-slate-200">
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTab("queue")}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition cursor-pointer flex items-center gap-2 ${
              activeTab === "queue"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <Layers className="w-4 h-4" />
            Specimen Worklist Queue ({filteredSamples.length})
          </button>
          <button
            onClick={() => setActiveTab("centrifuge")}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition cursor-pointer flex items-center gap-2 ${
              activeTab === "centrifuge"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <RotateCcw className="w-4 h-4 text-sky-600" />
            Centrifugation Station Hub
          </button>
          <button
            onClick={() => setActiveTab("qc")}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition cursor-pointer flex items-center gap-2 ${
              activeTab === "qc"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Daily Quality Control & Westgard Rules
          </button>
        </div>

        <span className="text-[11px] font-mono text-slate-400 hidden sm:inline-block">
          System Time: 2026-09-11 03:20 UTC | LIMS v3.0
        </span>
      </div>

      {/* TAB 1: SPECIMEN QUEUE & INSTRUMENT WORKSTATIONS */}
      {activeTab === "queue" && (
        <div className="space-y-6">
          {/* INSTRUMENT CARDS WITH ACTIONS */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-slate-500" />
                Diagnostic Auto-Analyzers & Line Telemetry
              </h2>
              <span className="text-[11px] text-slate-400">
                Click an instrument to filter specimens or inspect reagents
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {instruments.map((inst) => {
                const isSelected = selectedWorkstation === inst.dept;
                return (
                  <div
                    key={inst.id}
                    className={`labflow-card p-4 space-y-3 transition-all duration-200 ${
                      isSelected ? "ring-2 ring-indigo-500 shadow-md bg-indigo-50/20" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {inst.dept}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                          inst.error
                            ? "bg-rose-50 text-rose-700 border-rose-200 animate-pulse"
                            : inst.status === "Running"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        {inst.status}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-slate-900 font-mono flex items-center justify-between">
                        <span>{inst.name}</span>
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Throughput: <span className="font-medium text-slate-700">{inst.throughput}</span>
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 text-[11px]">Active Batch:</span>
                        <span className="font-mono font-bold text-slate-800">{inst.activeBatch} specimens</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 text-[11px]">Calibration:</span>
                        <span
                          className={`font-mono text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                            inst.calibrationStatus === "Passed"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                          {inst.calibrationStatus}
                        </span>
                      </div>
                    </div>

                    {/* QUICK ACTION BUTTONS PER INSTRUMENT */}
                    <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                      {inst.error ? (
                        <button
                          onClick={() => handleRestoreInstrument(inst.id)}
                          className="flex-1 py-1.5 px-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] rounded transition cursor-pointer flex items-center justify-center gap-1 shadow-xs"
                        >
                          <Zap className="w-3 h-3" />
                          Restore Online
                        </button>
                      ) : (
                        <button
                          onClick={() => handleRunCalibration(inst.id)}
                          disabled={inst.status === "Calibrating"}
                          className="flex-1 py-1 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[10px] rounded transition cursor-pointer flex items-center justify-center gap-1"
                        >
                          <Activity className="w-3 h-3 text-slate-500" />
                          Calibrate
                        </button>
                      )}

                      <button
                        onClick={() => setReagentModalInst(inst)}
                        className="py-1 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[10px] rounded transition cursor-pointer flex items-center gap-1"
                        title="View Reagents & Lot Expiry"
                      >
                        <Droplet className="w-3 h-3 text-indigo-500" />
                        Reagents
                      </button>

                      <button
                        onClick={() => setSelectedWorkstation(isSelected ? "All" : inst.dept)}
                        className={`py-1 px-2 font-semibold text-[10px] rounded transition cursor-pointer ${
                          isSelected
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                        }`}
                        title="Filter Specimen Queue by Workstation"
                      >
                        {isSelected ? "Filtered" : "Filter"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* BATCH ACTION BAR (WHEN ITEMS ARE SELECTED) */}
          {selectedIds.length > 0 && (
            <div className="bg-indigo-900 text-white p-4 rounded-xl shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in duration-200">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-indigo-700 flex items-center justify-center font-bold text-xs">
                  {selectedIds.length}
                </span>
                <div>
                  <h4 className="text-sm font-bold">
                    {selectedIds.length} Specimen{selectedIds.length > 1 ? "s" : ""} Selected
                  </h4>
                  <p className="text-[11px] text-indigo-200">
                    Apply parallel batch ingestion across assigned auto-analyzers
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={handleBatchIngest}
                  disabled={batchIngesting}
                  className="flex-1 sm:flex-initial px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-lg shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Play className={`w-3.5 h-3.5 ${batchIngesting ? "animate-spin" : ""}`} />
                  {batchIngesting ? "Running Analyzers..." : `Batch Run Ingestion (${selectedIds.length})`}
                </button>

                <button
                  onClick={handleBatchCentrifuge}
                  className="px-3 py-2 bg-indigo-700 hover:bg-indigo-600 text-white font-semibold text-xs rounded-lg transition cursor-pointer flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Spin Centrifuge
                </button>

                <button
                  onClick={() => setSelectedIds([])}
                  className="px-3 py-2 bg-transparent hover:bg-indigo-800 text-indigo-200 hover:text-white font-medium text-xs rounded-lg transition cursor-pointer"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          )}

          {/* FILTER / SEARCH CONTROLS */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
            {/* WORKSTATION CHIPS */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {["All", "Hematology", "Biochemistry", "HbA1c / HPLC", "Immunology"].map((dept) => {
                const count =
                  dept === "All"
                    ? eligibleSamples.length
                    : eligibleSamples.filter((s) => {
                        const t = (s.test || "").toLowerCase();
                        if (dept === "Hematology") return t.includes("cbc") || t.includes("blood") || t.includes("hematology");
                        if (dept === "Biochemistry") return t.includes("cmp") || t.includes("metabolic") || t.includes("lipid") || t.includes("cholesterol");
                        if (dept === "HbA1c / HPLC") return t.includes("hba1c");
                        if (dept === "Immunology") return t.includes("troponin") || t.includes("tsh");
                        return false;
                      }).length;

                const active = selectedWorkstation === dept;
                return (
                  <button
                    key={dept}
                    onClick={() => setSelectedWorkstation(dept)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                      active
                        ? "bg-slate-900 text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {dept}
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        active ? "bg-slate-700 text-slate-200" : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* SEARCH & STAGE SELECT */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-60">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search patient, barcode, test..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                />
              </div>

              <select
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value as any)}
                className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
              >
                <option value="ACTIVE">Active Queue (Received / Processing)</option>
                <option value="RECEIVED">Received (Pre-Analytical)</option>
                <option value="PROCESSING">Processing (On Analyzers)</option>
                <option value="ALL">All Lab Specimens</option>
              </select>
            </div>
          </div>

          {/* ACTIVE QUEUE TABLE */}
          <div className="labflow-card overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-bold text-slate-900 tracking-wide uppercase">
                  Specimen Processing Worklist ({filteredSamples.length})
                </h3>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
                <span>Workstation: <strong className="text-slate-800">{selectedWorkstation}</strong></span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200 tracking-wider">
                  <tr>
                    <th className="py-3 px-4 w-8">
                      <input
                        type="checkbox"
                        checked={allFilteredSelected}
                        onChange={toggleSelectAll}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        title="Select All Specimens"
                      />
                    </th>
                    <th className="py-3 px-4">Sample ID & Barcode</th>
                    <th className="py-3 px-4">Order ID</th>
                    <th className="py-3 px-4">Patient</th>
                    <th className="py-3 px-4">Test Requested</th>
                    <th className="py-3 px-4">Specimen Location</th>
                    <th className="py-3 px-4">Received Time</th>
                    <th className="py-3 px-4">Stage</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSamples.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-400">
                        <Layers className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                        <p className="font-semibold text-sm text-slate-600">No specimens currently in this workstation queue</p>
                        <p className="text-xs mt-1">All samples for this workstation have completed processing.</p>
                        <button
                          onClick={handleReplenishQueue}
                          className="mt-3 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg transition cursor-pointer inline-flex items-center gap-1.5"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          Load Demo Specimens
                        </button>
                      </td>
                    </tr>
                  ) : (
                    filteredSamples.map((s) => {
                      const isSelected = selectedIds.includes(s.id);
                      return (
                        <tr
                          key={s.id}
                          className={`transition-colors ${
                            isSelected ? "bg-indigo-50/50" : "hover:bg-slate-50/80"
                          }`}
                        >
                          <td className="py-3 px-4">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectOne(s.id)}
                              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                            />
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <div className="font-mono font-bold text-purple-700">{s.id}</div>
                            <div className="font-mono text-[10px] text-slate-400">{s.barcode || "LBF-BAR-001"}</div>
                          </td>
                          <td className="py-3 px-4 font-mono text-indigo-600 font-semibold whitespace-nowrap">
                            {s.orderId}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <div className="font-semibold text-slate-900">{s.patient.name}</div>
                            <div className="text-[11px] text-slate-400">
                              {s.patient.age}y / {s.patient.gender}
                            </div>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className="font-medium text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                              {s.test}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-600 text-[11px] whitespace-nowrap">
                            {s.currentLocation}
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">
                            {s.collectedAt}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <StatusBadge type="status" value={s.status} size="sm" />
                          </td>
                          <td className="py-3 px-4 text-right whitespace-nowrap space-x-2">
                            <button
                              onClick={() => handleOpenAnalyzerRun(s)}
                              className="px-2.5 py-1 text-xs font-bold rounded bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer shadow-2xs transition inline-flex items-center gap-1"
                            >
                              <Play className="w-3 h-3" />
                              Run Ingestion
                            </button>
                            <button
                              onClick={() => onSelectSample(s)}
                              className="px-2.5 py-1 text-xs font-semibold rounded bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer"
                            >
                              Details
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CENTRIFUGATION STATION HUB */}
      {activeTab === "centrifuge" && (
        <div className="space-y-6">
          <div className="bg-sky-50 border border-sky-200 p-4 rounded-xl flex items-start gap-3">
            <RotateCcw className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-sky-900">Pre-Analytical Specimen Centrifugation Protocol</h3>
              <p className="text-xs text-sky-700 mt-0.5">
                Standard centrifugation separates serum/plasma from cellular elements at 3,500 RPM for 10 minutes at 20°C. Ensures specimen integrity and prevents hemolysis interference on Cobas and Sysmex optical sensors.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* CENTRIFUGE UNIT 1 */}
            <div className="labflow-card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Centrifuge Station 1</h3>
                  <p className="text-xs text-slate-500 font-mono">Eppendorf 5810R (Refrigerated)</p>
                </div>
                <span
                  className={`px-2.5 py-1 rounded text-xs font-semibold border ${
                    centrifuge1Running
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200 animate-pulse"
                      : "bg-slate-100 text-slate-600 border-slate-200"
                  }`}
                >
                  {centrifuge1Running ? "Spinning (3,500 RPM)" : "Idle"}
                </span>
              </div>

              {/* ROTOR DISPLAY */}
              <div className="bg-slate-950 p-6 rounded-xl flex flex-col items-center justify-center text-center space-y-3">
                <div className="relative">
                  <div
                    className={`w-24 h-24 rounded-full border-4 border-dashed border-sky-400 flex items-center justify-center ${
                      centrifuge1Running ? "animate-spin" : ""
                    }`}
                    style={{ animationDuration: "3s" }}
                  >
                    <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                      <RotateCcw className="w-8 h-8 text-sky-400" />
                    </div>
                  </div>
                  <span className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-emerald-500 text-slate-950 font-mono font-bold text-[10px] rounded-full">
                    24/24
                  </span>
                </div>

                <div>
                  <div className="font-mono text-2xl font-bold text-sky-400">
                    {centrifuge1Running ? centrifuge1TimeRemaining : "00:00"}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">Time Remaining in Cycle (10m Target)</p>
                </div>
              </div>

              {/* TELEMETRY */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-slate-400 text-[10px] block">RCF</span>
                  <span className="font-mono font-bold text-slate-800">2,200 x g</span>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-slate-400 text-[10px] block">Temperature</span>
                  <span className="font-mono font-bold text-emerald-600">20.0 °C</span>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-slate-400 text-[10px] block">Brake Setting</span>
                  <span className="font-mono font-bold text-slate-800">Soft (Curve 9)</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setCentrifuge1Running(!centrifuge1Running);
                    if (onNotify) {
                      onNotify(
                        centrifuge1Running ? "Centrifuge Paused" : "Centrifuge Resumed",
                        "Rotor speed adjusting.",
                        "info"
                      );
                    }
                  }}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition cursor-pointer shadow-xs ${
                    centrifuge1Running
                      ? "bg-amber-500 hover:bg-amber-600 text-white"
                      : "bg-emerald-600 hover:bg-emerald-700 text-white"
                  }`}
                >
                  {centrifuge1Running ? "Pause Spin" : "Resume Spin"}
                </button>
                <button
                  onClick={() => {
                    setCentrifuge1Running(false);
                    setCentrifuge1TimeRemaining("00:00");
                    if (onNotify) {
                      onNotify("Centrifugation Complete", "Rotor decelerated to 0 RPM. Tubes ready for auto-analyzers.", "success");
                    }
                  }}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition cursor-pointer"
                >
                  Release Rotor
                </button>
              </div>
            </div>

            {/* CENTRIFUGE UNIT 2 */}
            <div className="labflow-card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Centrifuge Station 2</h3>
                  <p className="text-xs text-slate-500 font-mono">Thermo Sorvall ST40 (High Capacity)</p>
                </div>
                <span
                  className={`px-2.5 py-1 rounded text-xs font-semibold border ${
                    centrifuge2Running
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200 animate-pulse"
                      : "bg-slate-100 text-slate-600 border-slate-200"
                  }`}
                >
                  {centrifuge2Running ? "Spinning (3,000 RPM)" : "Standby / Ready"}
                </span>
              </div>

              {/* ROTOR DISPLAY */}
              <div className="bg-slate-950 p-6 rounded-xl flex flex-col items-center justify-center text-center space-y-3">
                <div className="relative">
                  <div
                    className={`w-24 h-24 rounded-full border-4 border-dashed ${
                      centrifuge2Running ? "border-emerald-400 animate-spin" : "border-slate-700"
                    } flex items-center justify-center`}
                    style={{ animationDuration: "3s" }}
                  >
                    <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                      <RotateCcw className={`w-8 h-8 ${centrifuge2Running ? "text-emerald-400" : "text-slate-600"}`} />
                    </div>
                  </div>
                  <span className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-slate-600 text-white font-mono font-bold text-[10px] rounded-full">
                    0/32
                  </span>
                </div>

                <div>
                  <div className="font-mono text-2xl font-bold text-slate-400">
                    {centrifuge2Running ? "11:30" : "12:00"}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">Bucket Balance Verified (0.05g Delta)</p>
                </div>
              </div>

              {/* TELEMETRY */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-slate-400 text-[10px] block">RCF</span>
                  <span className="font-mono font-bold text-slate-800">1,950 x g</span>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-slate-400 text-[10px] block">Temperature</span>
                  <span className="font-mono font-bold text-sky-600">4.0 °C (Chilled)</span>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-slate-400 text-[10px] block">Status</span>
                  <span className="font-mono font-bold text-slate-800">Ready to Load</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setCentrifuge2Running(!centrifuge2Running);
                  if (onNotify) {
                    onNotify(
                      centrifuge2Running ? "Centrifuge 2 Stopped" : "Centrifuge 2 Started",
                      "Chilled run at 4°C active for specialty proteins & coagulation tubes.",
                      "success"
                    );
                  }
                }}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition cursor-pointer shadow-xs"
              >
                {centrifuge2Running ? "Stop Centrifuge 2" : "Load & Start Chilled Spin Cycle"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DAILY QUALITY CONTROL & WESTGARD RULES */}
      {activeTab === "qc" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-emerald-50 border border-emerald-200 p-4 rounded-xl">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-emerald-900">
                  Quality Control Status: Cleared for Clinical Reporting
                </h3>
                <p className="text-xs text-emerald-700 mt-0.5">
                  All 4 diagnostic auto-analyzers are within ISO 15189 and NABL precision limits. No Westgard rejection violations detected.
                </p>
              </div>
            </div>

            <div className="text-right sm:border-l sm:border-emerald-200 sm:pl-4">
              <span className="text-[10px] text-emerald-600 font-semibold block uppercase">Last Verified</span>
              <span className="text-xs font-mono font-bold text-emerald-900">{qcLastRun}</span>
            </div>
          </div>

          {/* WESTGARD MULTIRULES TABLE */}
          <div className="labflow-card overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Multi-Level Control Performance & Westgard Rule Validation
              </h3>
              <span className="text-xs font-mono text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                100% Rules Passing
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Instrument</th>
                    <th className="py-3 px-4">QC Level</th>
                    <th className="py-3 px-4">Target Mean</th>
                    <th className="py-3 px-4">Observed Value</th>
                    <th className="py-3 px-4">Deviation (SD)</th>
                    <th className="py-3 px-4">Rule 1-2s (Warning)</th>
                    <th className="py-3 px-4">Rule 1-3s (Rejection)</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-3 px-4 font-bold text-slate-900 font-mono">Sysmex XN-1000</td>
                    <td className="py-3 px-4 text-slate-600">Level 1 (Normal Hemoglobin)</td>
                    <td className="py-3 px-4 font-mono">14.20 g/dL</td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">14.28 g/dL</td>
                    <td className="py-3 px-4 font-mono text-emerald-600">+0.4 SD</td>
                    <td className="py-3 px-4"><span className="text-emerald-600 font-semibold">Pass</span></td>
                    <td className="py-3 px-4"><span className="text-emerald-600 font-semibold">Pass</span></td>
                    <td className="py-3 px-4"><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Verified</span></td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-slate-900 font-mono">Sysmex XN-1000</td>
                    <td className="py-3 px-4 text-slate-600">Level 2 (Low Platelets)</td>
                    <td className="py-3 px-4 font-mono">65.0 x10^3</td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">64.1 x10^3</td>
                    <td className="py-3 px-4 font-mono text-emerald-600">-0.5 SD</td>
                    <td className="py-3 px-4"><span className="text-emerald-600 font-semibold">Pass</span></td>
                    <td className="py-3 px-4"><span className="text-emerald-600 font-semibold">Pass</span></td>
                    <td className="py-3 px-4"><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Verified</span></td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-slate-900 font-mono">Roche Cobas c501</td>
                    <td className="py-3 px-4 text-slate-600">Precinorm U (Normal Chemistry)</td>
                    <td className="py-3 px-4 font-mono">1.02 mg/dL</td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">1.04 mg/dL</td>
                    <td className="py-3 px-4 font-mono text-emerald-600">+0.8 SD</td>
                    <td className="py-3 px-4"><span className="text-emerald-600 font-semibold">Pass</span></td>
                    <td className="py-3 px-4"><span className="text-emerald-600 font-semibold">Pass</span></td>
                    <td className="py-3 px-4"><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Verified</span></td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-slate-900 font-mono">Bio-Rad Variant II</td>
                    <td className="py-3 px-4 text-slate-600">Lyphochek Diabetes Control (High)</td>
                    <td className="py-3 px-4 font-mono">9.80 %</td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">9.75 %</td>
                    <td className="py-3 px-4 font-mono text-emerald-600">-0.3 SD</td>
                    <td className="py-3 px-4"><span className="text-emerald-600 font-semibold">Pass</span></td>
                    <td className="py-3 px-4"><span className="text-emerald-600 font-semibold">Pass</span></td>
                    <td className="py-3 px-4"><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Verified</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: LIVE GLASSBOX AUTO-ANALYZER INGESTION SIMULATION */}
      {simulationSample && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* MODAL HEADER */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="text-sm font-bold">Auto-Analyzer Ingestion & Telemetry Simulator</h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    LIMS Bridge: ASTM 1394-97 / HL7 v2.5 Protocol
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSimulationSample(null)}
                className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* SPECIMEN CONTEXT */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Sample ID</span>
                  <span className="font-mono font-bold text-purple-700">{simulationSample.id}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Patient</span>
                  <span className="font-bold text-slate-800">{simulationSample.patient.name}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Test Panel</span>
                  <span className="font-semibold text-slate-800">{simulationSample.test}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Specimen Tube</span>
                  <span className="font-mono text-slate-700">{simulationSample.sampleType}</span>
                </div>
              </div>

              {/* 4-STAGE TELEMETRY STEPPER */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>Instrument Execution Sequence</span>
                  <span className="font-mono text-indigo-600">{simProgress}% Completed</span>
                </div>

                {/* PROGRESS BAR */}
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full transition-all duration-500 rounded-full"
                    style={{ width: `${simProgress}%` }}
                  />
                </div>

                {/* STEP GRID */}
                <div className="grid grid-cols-4 gap-2 pt-2 text-center text-[11px]">
                  <div
                    className={`p-2 rounded-lg border ${
                      simStep >= 1
                        ? "bg-indigo-50 text-indigo-900 border-indigo-200 font-bold"
                        : "bg-slate-50 text-slate-400 border-slate-100"
                    }`}
                  >
                    1. Aspiration
                  </div>
                  <div
                    className={`p-2 rounded-lg border ${
                      simStep >= 2
                        ? "bg-indigo-50 text-indigo-900 border-indigo-200 font-bold"
                        : "bg-slate-50 text-slate-400 border-slate-100"
                    }`}
                  >
                    2. Reagents (37°C)
                  </div>
                  <div
                    className={`p-2 rounded-lg border ${
                      simStep >= 3
                        ? "bg-indigo-50 text-indigo-900 border-indigo-200 font-bold"
                        : "bg-slate-50 text-slate-400 border-slate-100"
                    }`}
                  >
                    3. Laser / Optics
                  </div>
                  <div
                    className={`p-2 rounded-lg border ${
                      simStep >= 4
                        ? "bg-emerald-50 text-emerald-900 border-emerald-200 font-bold"
                        : "bg-slate-50 text-slate-400 border-slate-100"
                    }`}
                  >
                    4. HL7 Transmission
                  </div>
                </div>
              </div>

              {/* GENERATED TEST PARAMETERS PREVIEW */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                  <span>Quantitative Assay Parameter Output ({generatedParams.length})</span>
                  <span className="text-[10px] font-mono text-slate-400">Validated Against Reference Range</span>
                </div>

                <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2 px-3">Analyte / Metric</th>
                        <th className="py-2 px-3">Result</th>
                        <th className="py-2 px-3">Unit</th>
                        <th className="py-2 px-3">Reference</th>
                        <th className="py-2 px-3 text-right">Flag</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {generatedParams.map((param, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="py-2 px-3 font-sans font-medium text-slate-800">{param.name}</td>
                          <td className="py-2 px-3 font-bold text-slate-900">{param.result}</td>
                          <td className="py-2 px-3 text-slate-500">{param.unit}</td>
                          <td className="py-2 px-3 text-slate-500">{param.referenceRange}</td>
                          <td className="py-2 px-3 text-right">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                param.flag === "Normal"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-rose-50 text-rose-700"
                              }`}
                            >
                              {param.flag}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* MODAL FOOTER */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => setSimulationSample(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
              >
                Close Simulator
              </button>

              <button
                onClick={handleTransmitSimulation}
                disabled={isSimulating}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-lg shadow-sm transition cursor-pointer flex items-center gap-1.5"
              >
                {isSimulating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Analyzing Sample...
                  </>
                ) : (
                  <>
                    <CheckCheck className="w-4 h-4" />
                    Transmit & Advance to Review Queue →
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: REAGENT INVENTORY & LOT EXPIRY */}
      {reagentModalInst && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">{reagentModalInst.name} — Reagent Inventory</h3>
                <p className="text-[11px] text-slate-400 font-mono">Department: {reagentModalInst.dept}</p>
              </div>
              <button
                onClick={() => setReagentModalInst(null)}
                className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-xs text-slate-500">
                Onboard reagent packs, calibration curve stability, and expiry tracking.
              </p>

              <div className="space-y-3">
                {reagentModalInst.reagents.map((reagent) => (
                  <div key={reagent.name} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-900 block">{reagent.name}</span>
                        <span className="font-mono text-[10px] text-slate-400">
                          {reagent.lot} | Exp: {reagent.expiry}
                        </span>
                      </div>
                      <button
                        onClick={() => handleReplenishReagent(reagentModalInst.id, reagent.name)}
                        className="px-2 py-1 bg-white hover:bg-slate-100 text-indigo-600 border border-slate-200 font-bold text-[10px] rounded cursor-pointer transition shadow-2xs"
                      >
                        Refill Pack
                      </button>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-slate-500">Remaining Volume:</span>
                        <span
                          className={`font-bold ${
                            reagent.level > 50 ? "text-emerald-600" : "text-amber-600"
                          }`}
                        >
                          {reagent.level}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            reagent.level > 50 ? "bg-emerald-500" : "bg-amber-500"
                          }`}
                          style={{ width: `${reagent.level}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setReagentModalInst(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition cursor-pointer"
              >
                Close Reagent Monitor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
