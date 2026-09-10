import React, { useState } from "react";
import { OrderPriority, LabOrder } from "@/data/labflowData";
import { X, CheckCircle, Plus, AlertCircle } from "lucide-react";

interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitOrder: (newOrder: Partial<LabOrder>) => void;
}

export const CreateOrderModal: React.FC<CreateOrderModalProps> = ({
  isOpen,
  onClose,
  onSubmitOrder,
}) => {
  const [patientName, setPatientName] = useState("");
  const [mrn, setMrn] = useState("");
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState<number | "">(45);
  const [gender, setGender] = useState("Female");
  
  const [selectedTests, setSelectedTests] = useState<string[]>(["CBC (Complete Blood Count)"]);
  const [sampleType, setSampleType] = useState("Whole Blood (EDTA)");
  const [priority, setPriority] = useState<OrderPriority>("Normal");
  
  const [location, setLocation] = useState("Main Laboratory - Accessioning");
  const [collector, setCollector] = useState("Sunita Verma");
  const [scheduledTime, setScheduledTime] = useState("Immediate");
  const [doctorName, setDoctorName] = useState("Dr. V. Sharma");

  const [createdResult, setCreatedResult] = useState<{ orderId: string; sampleId: string } | null>(null);

  if (!isOpen) return null;

  const handleTestToggle = (testName: string) => {
    if (selectedTests.includes(testName)) {
      if (selectedTests.length > 1) {
        setSelectedTests(selectedTests.filter((t) => t !== testName));
      }
    } else {
      setSelectedTests([...selectedTests, testName]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim()) return;

    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const generatedOrderId = `ORD-${randomDigits}`;
    const generatedSampleId = `SMP-${randomDigits + 10000}`;

    const newOrder: Partial<LabOrder> = {
      id: generatedOrderId,
      sampleId: generatedSampleId,
      patient: {
        id: `P-${mrn || randomDigits}`,
        name: patientName,
        age: Number(age) || 40,
        gender: gender,
        phone: phone || "+91 98000 11111",
        mrn: mrn || `MRN-${randomDigits}`,
      },
      tests: selectedTests,
      priority: priority,
      currentStage: "ORDERED",
      createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      createdDate: new Date().toISOString().split("T")[0],
      tat: "30m",
      status: "In Progress",
      location: location,
      doctorName: doctorName,
    };

    onSubmitOrder(newOrder);
    setCreatedResult({ orderId: generatedOrderId, sampleId: generatedSampleId });
  };

  const handleResetAndClose = () => {
    setCreatedResult(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Create New Laboratory Order
            </h2>
            <p className="text-xs text-slate-500">
              Register patient request and generate sample tracking barcode
            </p>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {createdResult ? (
          /* SUCCESS BANNER */
          <div className="p-8 text-center space-y-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mb-2">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Order Created Successfully
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Sample container barcode has been generated and queued for accessioning.
            </p>

            <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto my-6 bg-slate-50 p-4 rounded-lg border border-slate-200 font-mono text-left">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-sans">
                  Order ID
                </span>
                <span className="text-base font-bold text-indigo-600">
                  {createdResult.orderId}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-sans">
                  Sample ID
                </span>
                <span className="text-base font-bold text-purple-600">
                  {createdResult.sampleId}
                </span>
              </div>
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setCreatedResult(null)}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                + Create Another Order
              </button>
              <button
                onClick={handleResetAndClose}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer shadow-xs"
              >
                Done / View Orders
              </button>
            </div>
          </div>
        ) : (
          /* FORM */
          <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
            {/* SECTION 1: PATIENT INFORMATION */}
            <div>
              <div className="flex items-center gap-2 mb-3 border-b border-slate-100 pb-2">
                <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                <h3 className="text-xs font-bold text-slate-800 tracking-wider uppercase">
                  1. Patient Information
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Patient Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aditi Rao"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    MRN / Patient ID
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. MRN-84920"
                    value={mrn}
                    onChange={(e) => setMrn(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Gender
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Ordering Doctor
                  </label>
                  <input
                    type="text"
                    value={doctorName}
                    onChange={(e) => setDoctorName(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: TEST INFORMATION */}
            <div>
              <div className="flex items-center gap-2 mb-3 border-b border-slate-100 pb-2">
                <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                <h3 className="text-xs font-bold text-slate-800 tracking-wider uppercase">
                  2. Test Information & Specimen
                </h3>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Select Test Panel(s)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {[
                      "CBC (Complete Blood Count)",
                      "Lipid Profile",
                      "HbA1c (Glycated Hb)",
                      "Liver Function Test (LFT)",
                      "Kidney Function Test (KFT)",
                      "Thyroid Profile (T3/T4/TSH)",
                      "Random Blood Glucose",
                      "Urine Routine & Microscopy",
                    ].map((test) => {
                      const selected = selectedTests.includes(test);
                      return (
                        <button
                          key={test}
                          type="button"
                          onClick={() => handleTestToggle(test)}
                          className={`p-2 text-left rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                            selected
                              ? "bg-indigo-50 border-indigo-500 text-indigo-900 font-semibold"
                              : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                          }`}
                        >
                          {test}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Specimen Type
                    </label>
                    <select
                      value={sampleType}
                      onChange={(e) => setSampleType(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="Whole Blood (EDTA)">Whole Blood (EDTA Tube)</option>
                      <option value="Serum (SST Gel)">Serum (SST Yellow Cap Tube)</option>
                      <option value="Sodium Fluoride Plasma">Plasma (Fluoride Tube - Gray Cap)</option>
                      <option value="Sterile Urine Specimen">Sterile Urine Cup</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Order Priority
                    </label>
                    <div className="flex gap-2">
                      {(["Normal", "Urgent", "STAT"] as OrderPriority[]).map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setPriority(p)}
                          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold border text-center transition-all cursor-pointer ${
                            priority === p
                              ? p === "STAT"
                                ? "bg-red-600 text-white border-red-600 shadow-xs"
                                : p === "Urgent"
                                ? "bg-amber-500 text-white border-amber-500 shadow-xs"
                                : "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                              : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 3: COLLECTION DETAILS */}
            <div>
              <div className="flex items-center gap-2 mb-3 border-b border-slate-100 pb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                <h3 className="text-xs font-bold text-slate-800 tracking-wider uppercase">
                  3. Collection & Logistics Details
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Collection Location
                  </label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="Main Laboratory - Accessioning">Main Lab Accessioning</option>
                    <option value="Collection Center A">Collection Center A</option>
                    <option value="Collection Center B">Collection Center B</option>
                    <option value="Emergency Room Phlebotomy">ER Phlebotomy Desk</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phlebotomist / Collector
                  </label>
                  <input
                    type="text"
                    value={collector}
                    onChange={(e) => setCollector(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Collection Time
                  </label>
                  <input
                    type="text"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300"
                  />
                </div>
              </div>
            </div>

            {/* FOOTER ACTIONS */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
                Barcode label will print automatically upon submission.
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  Create Order & Print Barcode
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
