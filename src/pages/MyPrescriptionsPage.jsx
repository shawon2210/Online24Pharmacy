import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import SEOHead from "../components/common/SEOHead";
import {
  ExclamationTriangleIcon,
  DocumentIcon,
  ClockIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

const TABS = [
  { key: "all", label: "myPrescriptionsPage.all" },
  { key: "active", label: "myPrescriptionsPage.active" },
  { key: "expiring", label: "myPrescriptionsPage.expiring" },
  { key: "expired", label: "myPrescriptionsPage.expired" },
  { key: "pending", label: "myPrescriptionsPage.pending" },
];

const STATUS_META = {
  ACTIVE: {
    label: "myPrescriptionsPage.active",
    color: "bg-green-100 text-green-700 border-green-200",
  },
  EXPIRING: {
    label: "myPrescriptionsPage.expiring",
    color: "bg-orange-100 text-orange-700 border-orange-200",
  },
  EXPIRED: {
    label: "myPrescriptionsPage.expired",
    color: "bg-red-100 text-red-700 border-red-200",
  },
  PENDING: {
    label: "myPrescriptionsPage.pending",
    color: "bg-gray-100 text-gray-700 border-gray-200",
  },
  APPROVED: {
    label: "myPrescriptionsPage.active",
    color: "bg-green-100 text-green-700 border-green-200",
  },
};

// Mock data for instant loading
const mockPrescriptions = [
  {
    id: "rx-001",
    medicationName: "Paracetamol 500mg",
    doctorName: "Ahmed Hassan",
    prescriptionDate: "2024-01-15",
    expiresAt: "2024-07-15",
    referenceNumber: "RX-2024-001",
    status: "APPROVED",
    derivedStatus: "ACTIVE",
    isReorderable: true,
  },
  {
    id: "rx-002",
    medicationName: "Insulin Glargine",
    doctorName: "Fatima Khan",
    prescriptionDate: "2023-12-01",
    expiresAt: "2024-01-20",
    referenceNumber: "RX-2024-002",
    status: "APPROVED",
    derivedStatus: "EXPIRING",
    isReorderable: true,
  },
  {
    id: "rx-003",
    medicationName: "Metformin 850mg",
    doctorName: "Rahman Sheikh",
    prescriptionDate: "2023-06-01",
    expiresAt: "2023-12-01",
    referenceNumber: "RX-2023-003",
    status: "APPROVED",
    derivedStatus: "EXPIRED",
    isReorderable: false,
  },
];

export default function MyPrescriptionsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [tab, setTab] = useState("all");
  const [prescriptions] = useState(mockPrescriptions);

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

  const isExpired = (rx) => rx.derivedStatus === "EXPIRED";
  const isPending = (rx) => rx.status?.toUpperCase() === "PENDING";
  const isApproved = (rx) => rx.status?.toUpperCase() === "APPROVED";

  const handleUpload = () => navigate("/prescription");

  const handleReorder = async (_rx) => {
    toast.success(t("myPrescriptionsPage.medicinesAdded"));
    setTimeout(() => navigate("/cart"), 1000);
  };

  const handleReminder = async (_rx) => {
    toast.success(t("myPrescriptionsPage.reminderSet"));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
      <SEOHead title={t("myPrescriptionsPage.title")} />
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md shadow-md">
        <div className="container mx-auto px-4 py-4">
          {/* Professional Breadcrumbs */}
          <nav className="mb-3" aria-label={t("breadcrumb")}>
            <ol className="flex items-center gap-1 text-sm text-gray-500">
              <li>
                <a href="/" className="hover:text-emerald-600 font-medium">
                  {t("home")}
                </a>
              </li>
              <li className="px-1 text-gray-400">/</li>
              <li className="text-gray-900 font-bold" aria-current="page">
                {t("myPrescriptionsPage.title")}
              </li>
            </ol>
          </nav>
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent mb-1">
                {t("myPrescriptionsPage.title")}
              </h1>
              <p className="text-sm text-gray-600">
                {t("myPrescriptionsPage.subtitle")}
              </p>
            </div>
            <button
              onClick={handleUpload}
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              {t("myPrescriptionsPage.uploadNew")}
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filter Tabs */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
          <div className="flex flex-wrap gap-2">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  tab === t.key
                    ? "bg-emerald-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {t(t.label)}
              </button>
            ))}
          </div>
        </div>

        {/* Prescription Cards */}
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-12 text-center">
              <DocumentIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {t("myPrescriptionsPage.noPrescriptions")}
              </h3>
              <p className="text-gray-600 mb-6">
                {t("myPrescriptionsPage.uploadFirst")}
              </p>
              <button
                onClick={handleUpload}
                className="bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2 mx-auto"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                {t("myPrescriptionsPage.uploadPrescription")}
              </button>
            </div>
          ) : (
            filtered.map((rx) => {
              const meta =
                STATUS_META[rx.derivedStatus] ||
                STATUS_META[rx.status?.toUpperCase()] ||
                STATUS_META.ACTIVE;
              return (
                <div
                  key={rx.id}
                  className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all"
                >
                  {/* Status Banner */}
                  {rx.derivedStatus === "EXPIRING" && (
                    <div className="mb-4 bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <ExclamationTriangleIcon className="w-5 h-5 text-orange-600" />
                        <p className="text-sm font-medium text-orange-800">
                          {t("myPrescriptionsPage.expiringSoon")}
                        </p>
                      </div>
                    </div>
                  )}

                  {rx.derivedStatus === "EXPIRED" && (
                    <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
                        <p className="text-sm font-medium text-red-800">
                          {t("myPrescriptionsPage.expiredCompliance")}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                          <svg
                            className="w-6 h-6 text-emerald-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                            />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">
                            {rx.medicationName || t("prescription")}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {rx.doctorName && `Dr. ${rx.doctorName}`}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium border ${meta.color}`}
                      >
                        {t(meta.label)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                      <div className="flex items-center gap-2 text-gray-600">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V6a2 2 0 012-2h4a2 2 0 012 2v1m-6 0h6m-6 0l-.5 8.5A2 2 0 0013.5 21h-3A2 2 0 018.5 15.5L8 7z"
                          />
                        </svg>
                        <span>
                          {t("myPrescriptionsPage.issued")}{" "}
                          {rx.prescriptionDate}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <ClockIcon className="w-4 h-4" />
                        <span>
                          {t("myPrescriptionsPage.expires")} {rx.expiresAt}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                          />
                        </svg>
                        <span>{rx.referenceNumber}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="border-t border-gray-100 pt-4">
                    {isPending(rx) ? (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-yellow-800">
                          <ClockIcon className="w-5 h-5" />
                          <span className="font-medium">
                            {t("myPrescriptionsPage.waitingApproval")}
                          </span>
                        </div>
                      </div>
                    ) : isExpired(rx) ? (
                      <div className="space-y-3">
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <ExclamationTriangleIcon className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="font-semibold text-red-900 mb-1">
                                {t("myPrescriptionsPage.complianceRequired")}
                              </p>
                              <p className="text-sm text-red-700">
                                {t("myPrescriptionsPage.expiredUpload")}
                              </p>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={handleUpload}
                          className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            />
                          </svg>
                          {t("myPrescriptionsPage.uploadNewPrescription")}
                        </button>
                      </div>
                    ) : isApproved(rx) ? (
                      <div className="space-y-3">
                        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                          <div className="flex items-center gap-3">
                            <CheckCircleIcon className="w-5 h-5 text-emerald-600" />
                            <span className="text-sm font-medium text-emerald-800">
                              {t("myPrescriptionsPage.readyToReorder")}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                          <button
                            onClick={() => handleReorder(rx)}
                            className="flex-1 bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5-6m0 0L4 5M7 13h10M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z"
                              />
                            </svg>
                            {t("myPrescriptionsPage.addToCart")}
                          </button>
                          <button
                            onClick={() => handleReminder(rx)}
                            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 17h5l-5 5v-5zM4.828 4.828A4 4 0 015.5 4H9v1H5.5a3 3 0 00-2.121.879l-.707.707A1 1 0 002 7.414V16.5A1.5 1.5 0 003.5 18H12v1H3.5A2.5 2.5 0 011 16.5V7.414a2 2 0 01.586-1.414l1.242-1.242z"
                              />
                            </svg>
                            {t("myPrescriptionsPage.setReminder")}
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
