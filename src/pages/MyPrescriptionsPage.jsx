import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import {
  ArrowRightIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

const TABS = [
  { key: "all", label: "All" },
  { key: "active", label: "Active Prescriptions" },
  { key: "expiring", label: "Expiring Soon" },
  { key: "expired", label: "Expired" },
  { key: "pending", label: "Pending Review" },
];

const STATUS_META = {
  ACTIVE: {
    label: "Active",
    color: "bg-emerald-100 text-emerald-800",
    icon: "✅",
  },
  EXPIRING: {
    label: "Expiring Soon",
    color: "bg-amber-100 text-amber-800",
    icon: "⚠️",
  },
  EXPIRED: {
    label: "Expired",
    color: "bg-rose-100 text-rose-800",
    icon: "❌",
  },
  PENDING: {
    label: "Pending Review",
    color: "bg-slate-100 text-slate-700",
    icon: "⏳",
  },
  APPROVED: {
    label: "Approved",
    color: "bg-emerald-100 text-emerald-800",
    icon: "👍",
  },
};

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const deriveStatus = (rx) => {
  const base = (rx.derivedStatus || rx.status || "PENDING").toUpperCase();
  const now = new Date();
  const issuedAt = rx.prescriptionDate ? new Date(rx.prescriptionDate) : null;
  const expiresAt = rx.expiresAt
    ? new Date(rx.expiresAt)
    : issuedAt
    ? new Date(issuedAt.getTime() + 180 * 24 * 60 * 60 * 1000)
    : null;

  let derived = base;
  if (expiresAt) {
    const diffDays =
      (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays < 0) {
      derived = "EXPIRED";
    } else if (diffDays <= 14) {
      derived = "EXPIRING";
    } else if (base === "PENDING" || base === "APPROVED") {
      derived = "ACTIVE";
    }
  }

  return {
    ...rx,
    expiresAt: expiresAt ? expiresAt.toISOString().slice(0, 10) : rx.expiresAt,
    derivedStatus: derived,
    isReorderable:
      rx.isReorderable ?? (derived !== "EXPIRED" && base !== "REJECTED"),
  };
};

export default function MyPrescriptionsPage() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const [tab, setTab] = useState("all");

  const token =
    typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

  const {
    data: prescriptions = [],
    isLoading,
    isError,
    refetch: _refetch,
  } = useQuery({
    queryKey: ["my-prescriptions"],
    enabled: !!token,
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/prescriptions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load prescriptions");
      const json = await res.json();
      return (json.prescriptions || []).map(deriveStatus);
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async (rx) => {
      const res = await fetch(`${API_URL}/api/prescriptions/${rx.id}/reorder`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}));
        throw new Error(errorBody.error || "Reorder failed");
      }
      return res.json();
    },
    onSuccess: (data) => {
      toast.success(data.message || "Medicines added to cart! Check out now.");
      setTimeout(() => navigate("/cart"), 1500);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to add medicines to cart");
    },
  });

  const reminderMutation = useMutation({
    mutationFn: async (rx) => {
      const res = await fetch(
        `${API_URL}/api/prescriptions/${rx.id}/reminder`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ notifyBeforeDays: 3 }),
        }
      );
      if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}));
        throw new Error(errorBody.error || "Reminder failed");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Reminder set. We will notify you 3 days before expiry.");
    },
    onError: (err) => {
      toast.error(err.message || "Could not set reminder");
    },
  });

  const filtered = useMemo(() => {
    if (tab === "all") return prescriptions;
    if (tab === "active")
      return prescriptions.filter((p) => p.derivedStatus === "ACTIVE");
    if (tab === "expiring")
      return prescriptions.filter((p) => p.derivedStatus === "EXPIRING");
    if (tab === "expired")
      return prescriptions.filter((p) => p.derivedStatus === "EXPIRED");
    if (tab === "pending")
      return prescriptions.filter((p) => p.status?.toUpperCase() === "PENDING");
    return prescriptions;
  }, [prescriptions, tab]);

  const isExpired = (rx) => {
    const status = rx.status?.toUpperCase();
    if (status === "REJECTED" || rx.derivedStatus === "EXPIRED") return true;
    return false;
  };

  const isPending = (rx) => rx.status?.toUpperCase() === "PENDING";
  const isApproved = (rx) => rx.status?.toUpperCase() === "APPROVED";

  const handleUpload = () =>
    navigate("/prescription", { state: { from: "/my-prescriptions" } });

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-emerald-600">
              DGDA Verified Pharmacy
            </p>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
              Smart Prescription Reorder
            </h1>
            <p className="text-slate-600 mt-1">
              Track expiry, reorder fast, or upload a new Rx when required.
            </p>
          </div>
          <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-2 rounded-xl text-sm font-semibold">
            <span>✅</span>
            <span>DGDA Compliance</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <button
              onClick={() => i18n.changeLanguage("en")}
              className="px-3 py-1 rounded-xl border border-gray-200 bg-white text-slate-700 hover:bg-slate-50"
            >
              English
            </button>
            <button
              onClick={() => i18n.changeLanguage("bn")}
              className="px-3 py-1 rounded-xl border border-gray-200 bg-white text-slate-700 hover:bg-slate-50"
            >
              বাংলা
            </button>
          </div>
        </header>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 bg-white border border-gray-200 rounded-2xl p-2 shadow-sm">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                tab === t.key
                  ? "bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Loading / error states */}
        {isLoading && (
          <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm text-slate-600">
            Loading your prescriptions...
          </div>
        )}
        {isError && (
          <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 shadow-sm text-rose-700">
            Could not load prescriptions. Please retry.
          </div>
        )}

        {/* Prescription cards */}
        {!isLoading && !isError && (
          <div className="grid gap-4">
            {filtered.length === 0 && (
              <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-sm">
                <p className="text-slate-700 font-semibold">
                  No prescriptions yet.
                </p>
                <p className="text-sm text-slate-600 mt-1">
                  Upload a new prescription to start quick reorders.
                </p>
                <div className="mt-3">
                  <button
                    onClick={handleUpload}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-all duration-200"
                  >
                    Upload Prescription
                  </button>
                </div>
              </div>
            )}

            {filtered.map((rx) => {
              const meta =
                STATUS_META[rx.derivedStatus] ||
                STATUS_META[rx.status?.toUpperCase()] ||
                STATUS_META.ACTIVE;
              return (
                <div
                  key={rx.id}
                  className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col gap-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-lg sm:text-xl font-bold text-slate-900">
                          {rx.medicationName ||
                            rx.patientName ||
                            "Prescription"}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${meta.color}`}
                        >
                          <span>{meta.icon}</span>
                          <span>{meta.label}</span>
                        </span>
                      </div>
                      {rx.doctorName && (
                        <p className="text-sm text-slate-600">
                          Doctor: {rx.doctorName}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-3 text-sm text-slate-600">
                        {rx.prescriptionDate && (
                          <span className="flex items-center gap-1">
                            📅 Issue: {String(rx.prescriptionDate).slice(0, 10)}
                          </span>
                        )}
                        {rx.expiresAt && (
                          <span className="flex items-center gap-1">
                            ⏳ Expiry: {String(rx.expiresAt).slice(0, 10)}
                          </span>
                        )}
                        {rx.referenceNumber && (
                          <span className="flex items-center gap-1">
                            # {rx.referenceNumber}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 items-center flex-wrap">
                      {isPending(rx) ? (
                        <div className="text-sm text-amber-600 font-semibold">
                          ⏳ Waiting for admin approval
                        </div>
                      ) : isExpired(rx) ? (
                        <button
                          onClick={handleUpload}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-all duration-200"
                        >
                          📤 Upload New Prescription
                        </button>
                      ) : isApproved(rx) ? (
                        <>
                          <button
                            onClick={() => reorderMutation.mutate(rx)}
                            disabled={reorderMutation.isPending}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200"
                          >
                            {reorderMutation.isPending
                              ? "Adding to cart..."
                              : "🛒 Add to Cart"}
                          </button>
                          <button
                            onClick={() => reminderMutation.mutate(rx)}
                            disabled={reminderMutation.isPending}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200"
                          >
                            {reminderMutation.isPending
                              ? "Saving..."
                              : "🔔 Set Reminder"}
                          </button>
                        </>
                      ) : null}
                    </div>
                  </div>

                  {isApproved(rx) && (
                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-sm text-emerald-800 flex items-center gap-2">
                      <span>💡</span>
                      <span>
                        Click "Add to Cart" to add medicines from this
                        prescription to your cart.
                      </span>
                    </div>
                  )}

                  {isExpired(rx) && (
                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-sm text-amber-800 flex items-center gap-2">
                      <ExclamationTriangleIcon className="w-5 h-5" />
                      <span>
                        This prescription has expired. According to DGDA rules,
                        you must upload a new prescription to continue.
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Reminder preview */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
          <p className="text-sm font-semibold text-slate-500 mb-2">
            Reminder Notification Preview
          </p>
          <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-800 space-y-1">
            <div className="font-semibold">💊 Prescription Expiry Reminder</div>
            <div>Your prescription for Gluconorm will expire in 3 days.</div>
            <div>
              Reorder now:{" "}
              <span className="underline text-emerald-700">Secure Link</span>
            </div>
            <div className="text-emerald-700 font-semibold">
              – Your Trusted Pharmacy
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
