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
    color: "bg-green-100 text-green-700",
  },
  EXPIRING: {
    label: "myPrescriptionsPage.expiring",
    color: "bg-orange-100 text-orange-700",
  },
  EXPIRED: {
    label: "myPrescriptionsPage.expired",
    color: "bg-red-100 text-red-700",
  },
  PENDING: {
    label: "myPrescriptionsPage.pending",
    color: "bg-muted text-foreground",
  },
  APPROVED: {
    label: "myPrescriptionsPage.active",
    color: "bg-green-100 text-green-700",
  },
};

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

  const _isExpired = (rx) => rx.derivedStatus === "EXPIRED";
  const _isPending = (rx) => rx.status?.toUpperCase() === "PENDING";
  const _isApproved = (rx) => rx.status?.toUpperCase() === "APPROVED";

  const handleUpload = () => navigate("/prescription");

  const _handleReorder = async (_rx) => {
    toast.success(t("myPrescriptionsPage.medicinesAdded"));
    setTimeout(() => navigate("/cart"), 800);
  };

  const _handleReminder = async (_rx) => {
    toast.success(t("myPrescriptionsPage.reminderSet"));
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-muted/30 to-background">
      <SEOHead title={t("myPrescriptionsPage.title")} />

      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md shadow-md border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <nav className="mb-3" aria-label={t("breadcrumb")}>
            <ol className="flex items-center gap-1 text-sm text-muted-foreground">
              <li>
                <a href="/" className="hover:text-emerald-600 font-medium">
                  {t("home")}
                </a>
              </li>
              <li className="px-1 text-muted-foreground">/</li>
              <li className="text-foreground font-bold" aria-current="page">
                {t("myPrescriptionsPage.title")}
              </li>
            </ol>
          </nav>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
            <div>
              <h1 className="text-2xl md:text-3xl font-black bg-linear-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent mb-1">
                {t("myPrescriptionsPage.title")}
              </h1>
              <p className="text-sm text-muted-foreground">
                {t("myPrescriptionsPage.subtitle")}
              </p>
            </div>
            <button
              onClick={handleUpload}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center gap-2 w-full sm:w-auto justify-center"
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
        <div className="bg-background rounded-xl shadow-lg border border-border p-6 mb-6">
          <div className="flex flex-wrap gap-2 overflow-x-auto">
            {TABS.map((tabItem) => (
              <button
                key={tabItem.key}
                onClick={() => setTab(tabItem.key)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  tab === tabItem.key
                    ? "bg-emerald-600 text-background"
                    : "bg-muted text-foreground hover:bg-border"
                }`}
              >
                {t(tabItem.label)}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="bg-background rounded-xl shadow-lg border border-border p-12 text-center">
              <DocumentIcon className="w-16 h-16 text-muted mx-auto mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-2">
                {t("myPrescriptionsPage.noPrescriptions")}
              </h3>
              <p className="text-muted-foreground mb-6">
                {t("myPrescriptionsPage.uploadFirst")}
              </p>
              <button
                onClick={handleUpload}
                className="bg-emerald-600 text-background px-6 py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2 mx-auto"
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
                {t("myPrescriptionsPage.uploadNew")}
              </button>
            </div>
          ) : (
            filtered.map((rx) => (
              <div
                key={rx.id}
                className="bg-background rounded-xl shadow-sm border border-border p-4 md:p-6"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        <DocumentIcon className="w-6 h-6 text-foreground/70" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-lg md:text-xl font-semibold text-foreground">
                          {rx.medicationName}
                        </h4>
                        <p className="text-sm md:text-base text-muted-foreground">
                          {rx.doctorName}
                        </p>
                        <div className="mt-2 text-xs md:text-sm text-muted-foreground flex flex-wrap gap-2 md:gap-3">
                          <span>
                            {t("myPrescriptionsPage.ref")}: {rx.referenceNumber}
                          </span>
                          <span>
                            {t("myPrescriptionsPage.prescribedOn")}{" "}
                            {rx.prescriptionDate}
                          </span>
                          <span>
                            {t("myPrescriptionsPage.expiresOn")} {rx.expiresAt}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-start md:items-end gap-3 w-full md:w-auto">
                    <div className="self-stretch md:self-auto">
                      <div
                        className={`inline-flex items-center gap-2 px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-semibold ${
                          STATUS_META[rx.derivedStatus]?.color ||
                          "bg-muted text-foreground"
                        }`}
                      >
                        {rx.derivedStatus === "EXPIRED" ? (
                          <ExclamationTriangleIcon className="w-4 h-4 text-current" />
                        ) : rx.derivedStatus === "EXPIRING" ? (
                          <ClockIcon className="w-4 h-4 text-current" />
                        ) : (
                          <CheckCircleIcon className="w-4 h-4 text-current" />
                        )}
                        <span>
                          {t(
                            STATUS_META[rx.derivedStatus]?.label ||
                              "myPrescriptionsPage.status",
                          )}
                        </span>
                      </div>
                    </div>

                    {/* <div className="flex flex-col sm:flex-row gap-2 w-full">
                      {isApproved(rx) && rx.isReorderable && (
                        <button
                          onClick={() => handleReorder(rx)}
                          className="w-full sm:w-auto px-2 md:px-3 py-2 bg-emerald-600 text-background rounded-lg text-xs md:text-sm font-medium hover:bg-emerald-700 text-center"
                        >
                          {t("myPrescriptionsPage.reorder")}
                        </button>
                      )}

                      {!isExpired(rx) && (
                        <button
                          onClick={() => handleReminder(rx)}
                          className="w-full sm:w-auto px-2 md:px-3 py-2 bg-border text-foreground rounded-lg text-xs md:text-sm hover:bg-muted text-center"
                        >
                          {t("myPrescriptionsPage.remind")}
                        </button>
                      )}
                    </div> */}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
