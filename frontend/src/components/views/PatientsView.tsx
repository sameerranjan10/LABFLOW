"use client";

import React, { useState, useEffect } from "react";
import { PatientRecord } from "@/lib/db";
import { LabOrder } from "@/data/labflowData";
import { StatusBadge } from "@/components/StatusBadge";
import { User, Search, Plus, Phone, Mail, FileText, Calendar, Clock, X, CheckCircle2, AlertCircle, Eye } from "lucide-react";

interface PatientsViewProps {
  onSelectOrder?: (order: LabOrder) => void;
}

export const PatientsView: React.FC<PatientsViewProps> = ({ onSelectOrder }) => {
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Modal states
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<PatientRecord | null>(null);
  const [patientOrders, setPatientOrders] = useState<LabOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Register Form State
  const [name, setName] = useState("");
  const [age, setAge] = useState<number | "">(35);
  const [gender, setGender] = useState("Male");
  const [phone, setPhone] = useState("+91 ");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  const loadPatients = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = `/api/patients?query=${encodeURIComponent(search)}&page=${page}&limit=10`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setPatients(data.patients || []);
        setTotal(data.total || 0);
      } else {
        setError("Unable to load patient records. Please try again.");
      }
    } catch (err) {
      setError("Unable to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, [search, page]);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const res = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          age: Number(age) || 35,
          gender,
          phone,
          email,
          address,
        }),
      });

      if (res.ok) {
        setIsRegisterOpen(false);
        setName("");
        setAge(35);
        setPhone("+91 ");
        setEmail("");
        setAddress("");
        loadPatients();
      } else {
        alert("Failed to register patient");
      }
    } catch (err) {
      alert("Network error while registering patient");
    }
  };

  const handleViewPatientDetails = async (p: PatientRecord) => {
    setSelectedPatient(p);
    setLoadingOrders(true);
    try {
      const res = await fetch(`/api/patients/${p.id}/orders`);
      if (res.ok) {
        const data = await res.json();
        setPatientOrders(data.orders || []);
      }
    } catch (err) {
      console.warn("Failed to fetch patient orders:", err);
    } finally {
      setLoadingOrders(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Master Patient Index (MPI) & Directory
            </h1>
            <span className="bg-sky-50 text-sky-700 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded border border-sky-200">
              {total} PATIENTS REGISTERED
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Central database registry of patient demographics, MRNs, medical history, and diagnostic orders.
          </p>
        </div>

        <button
          onClick={() => setIsRegisterOpen(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          + Register New Patient
        </button>
      </div>

      {/* SEARCH BAR */}
      <div className="labflow-card p-4">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search by patient name, MRN, phone number..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* PATIENT LIST TABLE */}
      <div className="labflow-card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500 font-medium">
            Loading patients from database...
          </div>
        ) : error ? (
          <div className="p-8 text-center text-xs text-rose-600 font-medium flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        ) : patients.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 font-medium">
            No patients found matching your search query.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200 tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Patient Name</th>
                  <th className="py-3.5 px-4">MRN / ID</th>
                  <th className="py-3.5 px-4">Age / Gender</th>
                  <th className="py-3.5 px-4">Contact Phone</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Total Orders</th>
                  <th className="py-3.5 px-4">Latest Activity</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {patients.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => handleViewPatientDetails(p)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                  >
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-bold text-slate-900 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-sky-100 text-sky-700 text-[10px] font-bold flex items-center justify-center">
                          {p.name.slice(0, 2).toUpperCase()}
                        </div>
                        {p.name}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-600 whitespace-nowrap">
                      {p.mrn}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                      {p.age}y • {p.gender}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-700 whitespace-nowrap">
                      {p.phone}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                      {p.email || "—"}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800 whitespace-nowrap">
                      {p.orderCount || 0} orders
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 text-[11px] whitespace-nowrap max-w-xs truncate">
                      {p.latestActivity || "Registered"}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewPatientDetails(p);
                        }}
                        className="px-3 py-1.5 text-xs font-bold rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 transition-colors cursor-pointer flex items-center gap-1.5 ml-auto"
                      >
                        <Eye className="w-3.5 h-3.5 text-sky-600" />
                        View History
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* PATIENT DETAILS MODAL */}
      {selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-sky-600 text-white font-bold text-sm flex items-center justify-center shadow-xs">
                  {selectedPatient.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{selectedPatient.name}</h3>
                  <p className="text-xs text-slate-500 font-mono">
                    {selectedPatient.mrn} • {selectedPatient.age}y • {selectedPatient.gender}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPatient(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div>
                  <span className="text-slate-400 block font-medium">Contact Phone:</span>
                  <span className="font-semibold text-slate-800 font-mono">{selectedPatient.phone}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Email Address:</span>
                  <span className="font-semibold text-slate-800">{selectedPatient.email || "—"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Location / Address:</span>
                  <span className="font-semibold text-slate-800">{selectedPatient.address || "Main Reference Hub"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Registration Date:</span>
                  <span className="font-semibold text-slate-800 font-mono">{selectedPatient.createdAt || "2026-09-10"}</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Diagnostic Order History ({patientOrders.length})
                </h4>

                {loadingOrders ? (
                  <div className="p-4 text-center text-slate-500">Loading order history...</div>
                ) : patientOrders.length === 0 ? (
                  <div className="p-4 text-center text-slate-500 bg-slate-50 rounded-lg border border-slate-200">
                    No clinical test orders found for this patient.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {patientOrders.map((ord) => (
                      <div
                        key={ord.id}
                        onClick={() => {
                          if (onSelectOrder) onSelectOrder(ord);
                          setSelectedPatient(null);
                        }}
                        className="p-3 bg-white border border-slate-200 rounded-lg hover:border-sky-400 cursor-pointer flex items-center justify-between transition-all shadow-2xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sky-700 font-mono">{ord.id}</span>
                            <StatusBadge type="priority" value={ord.priority} size="sm" />
                            <StatusBadge type="stage" value={ord.currentStage} size="sm" />
                          </div>
                          <p className="text-slate-700 font-medium mt-1">{ord.tests.join(", ")}</p>
                        </div>
                        <div className="text-right font-mono text-[11px] text-slate-500">
                          <div>{ord.createdDate}</div>
                          <div>{ord.createdAt}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REGISTER PATIENT MODAL */}
      {isRegisterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Register New Patient</h3>
              <button onClick={() => setIsRegisterOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleRegisterSubmit} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Patient Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ananya Sen"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Age (Years) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    max={120}
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Gender *</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="patient@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Residential Address</label>
                <input
                  type="text"
                  placeholder="Street Address, City"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRegisterOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold cursor-pointer"
                >
                  Register Patient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
