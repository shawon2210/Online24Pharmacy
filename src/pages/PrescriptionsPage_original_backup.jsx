/**
 * ============================================
 * PRESCRIPTIONS PAGE
 * ============================================
 *
 * DGDA-compliant prescription upload and management system
 * Features:
 * - Multi-file upload with drag-and-drop
 * - Prescription validation and verification workflow
 * - Smart reorder system with expiry tracking
 * - Prescription history with filtering
 * - Compliance warnings for expired prescriptions
 */

import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import SEOHead from "../components/common/SEOHead";
import { useAuth } from "../contexts/AuthContext";
import {
  CloudArrowUpIcon,
  DocumentIcon,
  CheckCircleIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import HeroButton from "../components/common/HeroButton";
import { prescriptionApi, productApi } from "../utils/apiClient";
import { validateFile, validatePrescriptionForm } from "../utils/validation";
import { PRESCRIPTION } from "../utils/constants";

/**
 * Hero section component for prescription page
 * Displays promotional content with video background
 *
 * @param {Function} onUploadClick - Callback to scroll to upload form
 * @param {Function} onViewPrescriptions - Callback to show prescription history
 * @param {Function} t - Translation function from i18next
 */
function PrescriptionHero({ onUploadClick, t }) {
  return (
    <div className="w-full flex justify-center py-4 sm:py-6 px-3 sm:px-6 lg:px-8">
      <div className="relative max-w-6xl w-full rounded-2xl shadow-xl overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(/prescription.jpg)' }}
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/90 via-teal-900/85 to-cyan-900/90" />

        {/* Content */}
        <div className="relative p-6 sm:p-8 md:p-10 lg:p-12 flex flex-col md:flex-row items-center gap-6 md:gap-8">
          {/* Left: Text Content */}
          <div className="flex-1 text-white">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full border border-white/30 mb-4">
              <span className="text-xl">💊</span>
              <span className="text-sm font-bold">{t("prescriptionsPage.badge")}</span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black mb-3 drop-shadow-lg">
              {t("prescriptionsPage.title")}
            </h2>
            
            <p className="text-sm sm:text-base mb-6 text-white/90 leading-relaxed">
              {t("prescriptionsPage.description")}
            </p>
            
            {/* Benefits */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-black">✓</span>
                </div>
                <span className="font-semibold">{t("prescriptionsPage.benefit1")}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-black">✓</span>
                </div>
                <span className="font-semibold">{t("prescriptionsPage.benefit2")}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-black">✓</span>
                </div>
                <span className="font-semibold">{t("prescriptionsPage.benefit3")}</span>
              </div>
            </div>
          </div>
          
          {/* Right: CTA Buttons */}
          <div className="flex flex-col gap-3 w-full md:w-auto md:min-w-[240px]">
            <HeroButton
              onClick={onUploadClick}
              variant="solid"
              className="w-full justify-center"
            >
              <span className="font-bold">{t("prescriptionsPage.uploadButton")}</span>
              <ArrowRightIcon className="w-5 h-5" />
            </HeroButton>
            
            <HeroButton
              href="/my-prescriptions"
              variant="outline"
              className="w-full justify-center"
            >
              <span className="font-bold">📄 My Prescriptions</span>
            </HeroButton>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Main prescriptions page component
 * Handles prescription upload, history, and reorder functionality
 * Implements DGDA compliance checks and expiry tracking
 */
export default function PrescriptionsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [headerOffset, setHeaderOffset] = useState(0);
  const [myPrescriptions, setMyPrescriptions] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const uploadFormRef = useRef(null);
  const [formData, setFormData] = useState({
    patientName: "",
    patientAge: "",
    patientPhone: "",
    patientAddress: "",
    doctorName: "",
    hospitalClinic: "",
    prescriptionDate: "",
  });
  const [files, setFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState("");
  const [showReorderModal, setShowReorderModal] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [filterTab, setFilterTab] = useState("all");

  /**
   * ============================================
   * LIFECYCLE & DATA FETCHING
   * ============================================
   */

  // Compute header height dynamically for proper spacing
  useLayoutEffect(() => {
    const el = document.querySelector("header");
    if (!el) return;
    const compute = () => {
      const h = Math.ceil(el.getBoundingClientRect().height);
      setHeaderOffset(h);
    };
    compute();
    window.addEventListener("resize", compute, { passive: true });
    return () => window.removeEventListener("resize", compute);
  }, []);

  useEffect(() => {
    if (user) fetchMyPrescriptions();
  }, [user]);

  /**
   * Fetch user's prescription history
   * Called on component mount and after new prescription upload
   */
  const fetchMyPrescriptions = async () => {
    try {
      const data = await prescriptionApi.getAll();
      setMyPrescriptions(data.prescriptions || []);
    } catch (error) {
      console.error("Failed to fetch prescriptions:", error);
      toast.error("Failed to load prescriptions");
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  /**
   * ============================================
   * FILE UPLOAD HANDLERS
   * ============================================
   */

  /**
   * Handle drag events for file upload
   * Provides visual feedback during drag operations
   */
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    handleFiles(selectedFiles);
  };

  /**
   * Validate and add files to upload queue
   * Filters out invalid files (wrong type, too large)
   *
   * @param {File[]} newFiles - Array of files to validate
   */
  const handleFiles = (newFiles) => {
    const validFiles = newFiles.filter((file) => {
      const validation = validateFile(file);
      if (!validation.valid) {
        toast.error(`${file.name}: ${validation.error}`);
        return false;
      }
      return true;
    });

    setFiles((prev) => [...prev, ...validFiles]);
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  /**
   * ============================================
   * FORM SUBMISSION
   * ============================================
   */

  /**
   * Handle prescription form submission
   * Uploads files, creates prescription record, and shows success screen
   *
   * @param {Event} e - Form submit event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form data before submission
    const validation = validatePrescriptionForm(formData);
    if (!validation.valid) {
      Object.values(validation.errors).forEach((error) => toast.error(error));
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload files
      const uploadedFiles = [];
      for (const file of files) {
        const uploadData = await prescriptionApi.upload(file);
        uploadedFiles.push(uploadData.fileUrl);
      }

      // Get products for medicine items
      const productsData = await productApi.getAll();
      const products = productsData.products || [];

      // Create medicine items
      const medicineItems = products.slice(0, 3).map((p) => ({
        productId: p.id,
        name: p.name,
        quantity: 1,
      }));

      // Submit prescription
      const data = await prescriptionApi.create({
        ...formData,
        prescriptionImage: uploadedFiles[0] || null,
        items: JSON.stringify(medicineItems),
      });

      setReferenceNumber(data.referenceNumber || data.id || "N/A");
      setSubmitted(true);
      setFormData({
        patientName: "",
        patientAge: "",
        patientPhone: "",
        patientAddress: "",
        doctorName: "",
        hospitalClinic: "",
        prescriptionDate: "",
      });
      setFiles([]);
      toast.success("Prescription uploaded successfully!");
      await fetchMyPrescriptions();
    } catch (error) {
      toast.error(error.message || "Failed to submit prescription");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">
          {t("prescriptionsPage.notLoggedIn")}
        </p>
        <a href="/login" className="btn-primary">
          {t("prescriptionsPage.signIn")}
        </a>
      </div>
    );
  }

  if (submitted) {
    return (
      <>
        <SEOHead title={t("prescriptionsPage.successTitle")} />
        <div
          className="w-full px-4 sm:px-6 lg:px-8 text-center py-6 md:py-10 min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/20"
          style={{ paddingTop: `${headerOffset}px` }}
        >
          <div className="max-w-2xl mx-auto">
            {/* Success Icon */}
            <CheckCircleIcon className="w-16 sm:w-20 h-16 sm:h-20 text-green-500 mx-auto mb-6 sm:mb-8 drop-shadow-lg" />

            {/* Main Title */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
              {t("prescriptionsPage.successScreenTitle")}
            </h1>

            {/* Reference Number Section */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl p-6 sm:p-8 lg:p-10 mb-6 sm:mb-8 shadow-md">
              <p className="text-green-700 mb-3 font-semibold text-sm sm:text-base">
                {t("prescriptionsPage.referenceNumberLabel")}
              </p>
              <p className="text-3xl sm:text-4xl font-bold text-green-900 tracking-wider font-mono break-all">
                {referenceNumber || "LOADING..."}
              </p>
              <p className="text-xs sm:text-sm text-green-600 mt-3">
                💾 Save this number for your records
              </p>
            </div>

            {/* Next Steps Section */}
            <div className="text-left bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-6 sm:p-8 lg:p-10 mb-8 sm:mb-10 shadow-md">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4 text-lg sm:text-xl flex items-center gap-2">
                📍 {t("prescriptionsPage.nextStepsLabel")}
              </h3>
              <ul className="space-y-3 text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold">
                    1
                  </span>
                  <span>{t("prescriptionsPage.nextStep1")}</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold">
                    2
                  </span>
                  <span>{t("prescriptionsPage.nextStep2")}</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold">
                    3
                  </span>
                  <span>{t("prescriptionsPage.nextStep3")}</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold">
                    4
                  </span>
                  <span>{t("prescriptionsPage.nextStep4")}</span>
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <button
                onClick={() => {
                  setSubmitted(false);
                  setShowHistory(false);
                  setReferenceNumber("");
                }}
                className="flex-1 sm:flex-auto bg-gray-600 hover:bg-gray-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold transition-all duration-300 active:scale-95 shadow-md hover:shadow-lg text-sm sm:text-base"
              >
                📤 {t("prescriptionsPage.uploadAnotherBtn")}
              </button>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setShowHistory(true);
                }}
                className="flex-1 sm:flex-auto bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold transition-all duration-300 active:scale-95 shadow-md hover:shadow-lg text-sm sm:text-base flex items-center justify-center gap-2"
              >
                <span>📋</span>
                {t("prescriptionsPage.viewPrescriptionsBtn")}
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  /**
   * ============================================
   * PRESCRIPTION MANAGEMENT
   * ============================================
   */

  /**
   * Check if prescription is still valid
   * DGDA compliance: prescriptions expire after 6 months
   *
   * @param {string} rxDate - Prescription date
   * @returns {boolean} True if prescription is still valid
   */
  const isRxValid = (rxDate) => {
    const validityMonths = PRESCRIPTION.VALIDITY_MONTHS;
    const expiryDate = new Date(rxDate);
    expiryDate.setMonth(expiryDate.getMonth() + validityMonths);
    return new Date() < expiryDate;
  };

  /**
   * Handle prescription reorder
   * Validates prescription expiry before allowing reorder
   * Adds medicines to cart and redirects to checkout
   *
   * @param {Object} rx - Prescription object
   */
  const handleReorder = async (rx) => {
    // DGDA compliance check: prevent reorder of expired prescriptions
    if (!isRxValid(rx.prescriptionDate)) {
      toast.error(t("prescriptionsPage.alertExpiredPrescription"));
      return;
    }
    try {
      const data = await prescriptionApi.reorder(rx.id);
      toast.success(data.message || t("prescriptionsPage.reorderSuccess"));
      window.location.href = "/cart";
    } catch (error) {
      console.error("Reorder error:", error);
      toast.error(error.message || t("prescriptionsPage.reorderFailed"));
    }
  };

  const handleReminder = async (rx) => {
    try {
      await prescriptionApi.setReminder(rx.id);
      toast.success(t("prescriptionsPage.reminderSet"));
    } catch (error) {
      toast.error(t("prescriptionsPage.failedReminder"));
    }
  };

  const scrollToUpload = () => {
    uploadFormRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const openReorderModal = (rx) => {
    setSelectedPrescription(rx);
    setShowReorderModal(true);
  };

  const closeReorderModal = () => {
    setShowReorderModal(false);
    setSelectedPrescription(null);
  };

  /**
   * Calculate prescription expiry status
   * Returns status, days remaining, and color code
   *
   * @param {string} prescriptionDate - Prescription issue date
   * @returns {Object} Expiry status information
   * @returns {string} returns.status - 'active', 'expiring', or 'expired'
   * @returns {number} returns.daysLeft - Days until expiry
   * @returns {string} returns.color - Color code for UI
   */
  const getExpiryStatus = (prescriptionDate) => {
    const rxDate = new Date(prescriptionDate);
    const today = new Date();
    const expiryDate = new Date(rxDate);
    expiryDate.setMonth(expiryDate.getMonth() + PRESCRIPTION.VALIDITY_MONTHS);
    const daysLeft = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));

    if (daysLeft < 0) return { status: "expired", daysLeft: 0, color: "red" };
    if (daysLeft <= PRESCRIPTION.EXPIRY_WARNING_DAYS)
      return { status: "expiring", daysLeft, color: "orange" };
    return { status: "active", daysLeft, color: "green" };
  };

  /**
   * ============================================
   * DEMO DATA
   * ============================================
   */

  // Demo prescriptions for testing UI when no real data exists
  const demoPrescriptions = [
    {
      id: "demo-1",
      referenceNumber: "RX-2024-001",
      patientName: "John Doe",
      doctorName: "Dr. Ahmed Hassan",
      prescriptionDate: new Date(
        Date.now() - 15 * 24 * 60 * 60 * 1000
      ).toISOString(), // 15 days ago
      status: "approved",
      adminNotes: "Regular diabetes management medication",
    },
    {
      id: "demo-2",
      referenceNumber: "RX-2024-002",
      patientName: "Jane Smith",
      doctorName: "Dr. Fatima Khan",
      prescriptionDate: new Date(
        Date.now() - 160 * 24 * 60 * 60 * 1000
      ).toISOString(), // 160 days ago - expired
      status: "approved",
      adminNotes: "Cholesterol management",
    },
    {
      id: "demo-3",
      referenceNumber: "RX-2024-003",
      patientName: "Ahmed Ali",
      doctorName: "Dr. Ibrahim Sheikh",
      prescriptionDate: new Date(
        Date.now() - 170 * 24 * 60 * 60 * 1000
      ).toISOString(), // 170 days ago - expiring
      status: "approved",
      adminNotes: "Blood pressure regulation",
    },
  ];

  const displayPrescriptions =
    myPrescriptions.length > 0 ? myPrescriptions : demoPrescriptions;
  const displayFilteredPrescriptions = displayPrescriptions.filter((rx) => {
    if (filterTab === "all") return true;
    const { status } = getExpiryStatus(rx.prescriptionDate || rx.createdAt);
    if (filterTab === "active") return status === "active";
    if (filterTab === "expiring") return status === "expiring";
    if (filterTab === "expired") return status === "expired";
    return true;
  });

  if (showHistory) {
    return (
      <>
        <SEOHead title="My Prescriptions - Smart Reorder System" />
        <div
          className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/20"
          style={{ paddingTop: `${headerOffset}px` }}
        >
          <div className="max-w-6xl mx-auto">
            {/* Header Section */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6 lg:p-8 mb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">📋</span>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                      My Prescriptions
                    </h1>
                  </div>
                  <p className="text-gray-600 text-sm sm:text-base">
                    DGDA Compliant • Secure • Smart Reorder System
                  </p>
                </div>
                <button
                  onClick={() => setShowHistory(false)}
                  className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-green-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold hover:from-emerald-700 hover:to-green-700 transition-all duration-300 active:scale-95 shadow-md hover:shadow-md"
                >
                  📤 Upload New Rx
                </button>
              </div>

              {/* Filter Tabs */}
              <div className="flex flex-wrap gap-2 sm:gap-3 border-t pt-4">
                <button
                  onClick={() => setFilterTab("all")}
                  className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg font-semibold transition-all duration-300 ${
                    filterTab === "all"
                      ? "bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-lg"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterTab("active")}
                  className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg font-semibold transition-all duration-300 ${
                    filterTab === "active"
                      ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  ✓ Active
                </button>
                <button
                  onClick={() => setFilterTab("expiring")}
                  className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg font-semibold transition-all duration-300 ${
                    filterTab === "expiring"
                      ? "bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-lg"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  ⚠️ Expiring Soon
                </button>
                <button
                  onClick={() => setFilterTab("expired")}
                  className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg font-semibold transition-all duration-300 ${
                    filterTab === "expired"
                      ? "bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  ✕ Expired
                </button>
              </div>
            </div>
            {displayFilteredPrescriptions.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 sm:p-12 text-center">
                <DocumentIcon className="w-16 sm:w-20 h-16 sm:h-20 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-base sm:text-lg font-medium">
                  No prescriptions found in this category
                </p>
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-5">
                {displayFilteredPrescriptions.map((rx) => {
                  const isApproved = rx.status === "approved";
                  const expiryInfo = getExpiryStatus(
                    rx.prescriptionDate || rx.createdAt
                  );

                  return (
                    <div
                      key={rx.id}
                      className={`bg-white border-2 rounded-2xl p-4 sm:p-6 hover:shadow-xl transition-all duration-300 ${
                        expiryInfo.status === "expired"
                          ? "border-red-200 bg-red-50/30"
                          : expiryInfo.status === "expiring"
                          ? "border-orange-200 bg-orange-50/30"
                          : "border-emerald-200 hover:border-emerald-400"
                      }`}
                    >
                      {/* Expiry Warning Banner */}
                      {expiryInfo.status === "expiring" && (
                        <div className="mb-4 bg-orange-100 border-l-4 border-orange-500 p-3 rounded-r-lg">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">⚠️</span>
                            <p className="text-sm font-semibold text-orange-800">
                              Expiring in {expiryInfo.daysLeft} days - Reorder
                              now to avoid delays!
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Expired Warning Banner */}
                      {expiryInfo.status === "expired" && (
                        <div className="mb-4 bg-red-100 border-l-4 border-red-500 p-3 rounded-r-lg">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">🚫</span>
                            <p className="text-sm font-semibold text-red-800">
                              DGDA Compliance: This prescription has expired.
                              Upload new prescription required.
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">💊</span>
                              <p className="font-bold text-lg sm:text-xl text-gray-900">
                                {rx.referenceNumber}
                              </p>
                            </div>

                            {/* DGDA Verified Badge */}
                            {isApproved && (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                <svg
                                  className="w-3 h-3"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                                </svg>
                                DGDA Verified
                              </span>
                            )}

                            {/* Status Badge */}
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                                expiryInfo.status === "expired"
                                  ? "bg-red-100 text-red-800 border border-red-200"
                                  : expiryInfo.status === "expiring"
                                  ? "bg-orange-100 text-orange-800 border border-orange-200"
                                  : isApproved
                                  ? "bg-green-100 text-green-800 border border-green-200"
                                  : rx.status === "rejected"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {expiryInfo.status === "expired"
                                ? "✕ EXPIRED"
                                : expiryInfo.status === "expiring"
                                ? "⚠️ EXPIRING SOON"
                                : isApproved
                                ? "✓ ACTIVE"
                                : rx.status.toUpperCase()}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm sm:text-base">
                            <div className="flex items-start gap-2">
                              <span className="text-gray-400 mt-0.5">👤</span>
                              <div>
                                <p className="text-xs text-gray-500 font-medium mb-0.5">
                                  Patient
                                </p>
                                <p className="font-semibold text-gray-900">
                                  {rx.patientName}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-start gap-2">
                              <span className="text-gray-400 mt-0.5">👨‍⚕️</span>
                              <div>
                                <p className="text-xs text-gray-500 font-medium mb-0.5">
                                  Doctor
                                </p>
                                <p className="font-semibold text-gray-900">
                                  {rx.doctorName}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-start gap-2">
                              <span className="text-gray-400 mt-0.5">📅</span>
                              <div>
                                <p className="text-xs text-gray-500 font-medium mb-0.5">
                                  Issue Date
                                </p>
                                <p className="font-semibold text-gray-900">
                                  {new Date(
                                    rx.prescriptionDate || rx.createdAt
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-start gap-2">
                              <span className="text-gray-400 mt-0.5">🕐</span>
                              <div>
                                <p className="text-xs text-gray-500 font-medium mb-0.5">
                                  {expiryInfo.status === "expired"
                                    ? "Expired"
                                    : "Expires In"}
                                </p>
                                <p
                                  className={`font-bold ${
                                    expiryInfo.status === "expired"
                                      ? "text-red-600"
                                      : expiryInfo.status === "expiring"
                                      ? "text-orange-600"
                                      : "text-green-600"
                                  }`}
                                >
                                  {expiryInfo.status === "expired"
                                    ? "Requires New Rx"
                                    : `${expiryInfo.daysLeft} days`}
                                </p>
                              </div>
                            </div>
                          </div>
                          {rx.adminNotes && (
                            <p className="mt-3 text-sm text-emerald-700 bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                              📝 {rx.adminNotes}
                            </p>
                          )}
                        </div>
                      </div>
                      {/* Action Buttons Section */}
                      <div className="mt-5 pt-5 border-t-2 border-gray-100">
                        {isApproved && expiryInfo.status !== "expired" && (
                          <div className="flex flex-col sm:flex-row gap-3">
                            {/* Primary CTA - Reorder Now */}
                            <button
                              onClick={() => openReorderModal(rx)}
                              className="flex-1 group relative overflow-hidden bg-gradient-to-r from-emerald-600 to-green-600 text-white px-5 py-3.5 rounded-xl font-bold hover:from-emerald-700 hover:to-green-700 transition-all shadow-lg hover:shadow-xl active:scale-95 text-sm sm:text-base"
                            >
                              <span className="relative z-10 flex items-center justify-center gap-2">
                                🛒 Reorder Now
                              </span>
                              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                            </button>

                            {/* Secondary CTA - Set Reminder */}
                            {expiryInfo.daysLeft > 7 && (
                              <button
                                onClick={() => handleReminder(rx)}
                                className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-5 py-3.5 rounded-xl font-bold hover:from-blue-700 hover:to-cyan-700 transition-all shadow-md hover:shadow-lg active:scale-95 text-sm sm:text-base"
                              >
                                🔔 Remind Me
                              </button>
                            )}
                          </div>
                        )}

                        {/* Expired Flow - Compliance First */}
                        {isApproved && expiryInfo.status === "expired" && (
                          <div className="space-y-3">
                            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                              <div className="flex items-start gap-3 mb-3">
                                <span className="text-2xl">🚫</span>
                                <div>
                                  <p className="font-bold text-red-900 mb-1">
                                    DGDA Compliance Required
                                  </p>
                                  <p className="text-sm text-red-700">
                                    This prescription has expired. Bangladesh
                                    DGDA regulations require a new prescription
                                    for reorder. No reorder is allowed with
                                    expired prescriptions.
                                  </p>
                                </div>
                              </div>
                            </div>

                            <button
                              onClick={() => setShowHistory(false)}
                              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-3.5 rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl active:scale-95"
                            >
                              📤 Upload New Prescription
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Smart Reorder Modal */}
            {showReorderModal && selectedPrescription && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm overflow-y-auto p-4 sm:p-6 md:p-8 animate-fade-in pt-16 sm:pt-20 md:pt-24">
                <div className="w-full max-w-sm sm:max-w-2xl bg-white rounded-2xl sm:rounded-2xl shadow-2xl mx-auto flex flex-col max-h-[70vh] sm:max-h-[70vh] md:max-h-[75vh]">
                  {/* Modal Header - Sticky */}
                  <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-green-600 text-white p-4 sm:p-5 md:p-6 rounded-t-2xl flex-shrink-0 z-10 shadow-sm">
                    <div className="flex items-center justify-between gap-3 sm:gap-4">
                      <div className="flex items-center gap-2.5 sm:gap-3 flex-1 min-w-0">
                        <span className="text-2xl sm:text-3xl flex-shrink-0">
                          🛒
                        </span>
                        <div className="min-w-0">
                          <h2 className="text-lg sm:text-xl md:text-2xl font-bold truncate">
                            Reorder Prescription
                          </h2>
                          <p className="text-xs sm:text-sm text-emerald-100 mt-1">
                            Smart Cart Pre-Fill System
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={closeReorderModal}
                        className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all active:scale-95 flex-shrink-0"
                      >
                        <span className="text-xl sm:text-2xl">✕</span>
                      </button>
                    </div>
                  </div>

                  {/* Modal Content - Scrollable */}
                  <div className="overflow-y-auto flex-1 p-4 sm:p-5 md:p-6 space-y-3 sm:space-y-4 md:space-y-5">
                    {/* Prescription Details Card */}
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg sm:rounded-xl md:rounded-2xl p-4 sm:p-5 md:p-6 border-2 border-blue-200">
                      <div className="flex items-center gap-2 sm:gap-2.5 mb-3 sm:mb-4">
                        <span className="text-xl sm:text-2xl md:text-3xl">
                          💊
                        </span>
                        <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900">
                          Prescription Details
                        </h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-5 text-xs sm:text-sm">
                        <div className="min-w-0">
                          <p className="text-gray-600 mb-1 sm:mb-1.5 font-medium text-xs sm:text-sm">
                            Reference
                          </p>
                          <p className="font-bold text-gray-900 truncate text-sm sm:text-base">
                            {selectedPrescription.referenceNumber}
                          </p>
                        </div>
                        <div className="min-w-0">
                          <p className="text-gray-600 mb-1 sm:mb-1.5 font-medium text-xs sm:text-sm">
                            Patient
                          </p>
                          <p className="font-bold text-gray-900 truncate text-sm sm:text-base">
                            {selectedPrescription.patientName}
                          </p>
                        </div>
                        <div className="min-w-0">
                          <p className="text-gray-600 mb-1 sm:mb-1.5 font-medium text-xs sm:text-sm">
                            Doctor
                          </p>
                          <p className="font-bold text-gray-900 truncate text-sm sm:text-base">
                            {selectedPrescription.doctorName}
                          </p>
                        </div>
                        <div className="min-w-0">
                          <p className="text-gray-600 mb-1 sm:mb-1.5 font-medium text-xs sm:text-sm">
                            Valid Until
                          </p>
                          <p className="font-bold text-green-600 text-sm sm:text-base">
                            {(() => {
                              const rxDate = new Date(
                                selectedPrescription.prescriptionDate
                              );
                              const expiry = new Date(rxDate);
                              expiry.setMonth(expiry.getMonth() + 6);
                              return expiry.toLocaleDateString();
                            })()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Medicine Checklist */}
                    <div className="bg-white rounded-lg sm:rounded-xl md:rounded-2xl border-2 border-gray-200 p-4 sm:p-5 md:p-6">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 mb-3 sm:mb-4">
                        <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2 flex-shrink-0">
                          <span>📋</span> Medicines
                        </h3>
                        <span className="text-xs sm:text-sm text-gray-600 bg-gray-100 px-3 sm:px-4 md:px-5 py-1 sm:py-1.5 rounded-full whitespace-nowrap">
                          Pre-filled
                        </span>
                      </div>

                      <div className="space-y-2.5 sm:space-y-3 md:space-y-4">
                        <label className="flex items-start gap-3 sm:gap-3.5 md:gap-4 p-3 sm:p-4 md:p-5 bg-gray-50 rounded-lg sm:rounded-xl border-2 border-gray-200 hover:border-emerald-400 cursor-pointer transition-all">
                          <input
                            type="checkbox"
                            defaultChecked
                            className="w-5 h-5 mt-0.5 accent-emerald-600 flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-gray-900 text-sm sm:text-base md:text-base truncate">
                              Gluconorm 500mg
                            </p>
                            <p className="text-xs sm:text-sm text-gray-600">
                              Strip of 10 tablets • ৳120.00
                            </p>
                          </div>
                        </label>

                        <label className="flex items-start gap-3 sm:gap-3.5 md:gap-4 p-3 sm:p-4 md:p-5 bg-gray-50 rounded-lg sm:rounded-xl border-2 border-gray-200 hover:border-emerald-400 cursor-pointer transition-all">
                          <input
                            type="checkbox"
                            defaultChecked
                            className="w-5 h-5 mt-0.5 accent-emerald-600 flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-gray-900 text-sm sm:text-base md:text-base truncate">
                              Metformin 850mg
                            </p>
                            <p className="text-xs sm:text-sm text-gray-600">
                              Strip of 15 tablets • ৳180.00
                            </p>
                          </div>
                        </label>

                        <label className="flex items-start gap-3 sm:gap-3.5 md:gap-4 p-3 sm:p-4 md:p-5 bg-gray-50 rounded-lg sm:rounded-xl border-2 border-gray-200 hover:border-emerald-400 cursor-pointer transition-all">
                          <input
                            type="checkbox"
                            defaultChecked
                            className="w-5 h-5 mt-0.5 accent-emerald-600 flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-gray-900 text-sm sm:text-base md:text-base truncate">
                              Atorvastatin 20mg
                            </p>
                            <p className="text-xs sm:text-sm text-gray-600">
                              Strip of 10 tablets • ৳250.00
                            </p>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Confirmation Text */}
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg sm:rounded-xl md:rounded-2xl p-4 sm:p-5 md:p-6 border-2 border-gray-200 dark:border-gray-700">
                      <div className="flex gap-3 sm:gap-4">
                        <span className="text-2xl sm:text-3xl flex-shrink-0">
                          ℹ️
                        </span>
                        <div className="text-sm sm:text-base text-blue-900 min-w-0">
                          <p className="font-bold mb-1.5 sm:mb-2">
                            Smart Cart Pre-Fill
                          </p>
                          <p className="mb-2 text-xs sm:text-sm leading-relaxed">
                            Selected medicines will be added to your cart.
                            Adjust quantities before checkout.
                          </p>
                          <p className="text-xs sm:text-sm text-emerald-700 bg-emerald-100 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded inline-block whitespace-nowrap">
                            ✓ DGDA Verified • ✓ Secure
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Upload Option */}
                    <button
                      onClick={() => {
                        closeReorderModal();
                        setShowHistory(false);
                      }}
                      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 md:py-3.5 rounded-lg sm:rounded-xl font-semibold transition-all text-sm sm:text-base md:text-base active:scale-95"
                    >
                      📤 Upload New Prescription
                    </button>
                  </div>

                  {/* Modal Footer - Sticky */}
                  <div className="sticky bottom-0 bg-gradient-to-t from-gray-50 to-white border-t border-gray-200 p-4 sm:p-5 md:p-6 flex-shrink-0 z-10 flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-5">
                    <button
                      onClick={closeReorderModal}
                      className="w-full sm:flex-1 px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 md:py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-lg sm:rounded-xl transition-all active:scale-95 text-sm sm:text-base md:text-base"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        handleReorder(selectedPrescription);
                        closeReorderModal();
                      }}
                      className="w-full sm:flex-1 px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 md:py-3.5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold rounded-lg sm:rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 sm:gap-2.5 text-sm sm:text-base md:text-base"
                    >
                      <span>🛒</span>
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEOHead
        title="Upload Prescription"
        description="Upload your prescription for medicine verification and ordering"
        url="/prescription"
      />
      
      {/* Hero Section */}
      <PrescriptionHero
        onUploadClick={scrollToUpload}
        t={t}
      />
      
      <div
        className="w-full px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 pb-12 sm:pb-16 lg:pb-20"
        style={{
          marginTop: `-${headerOffset}px`,
          paddingTop: `calc(${headerOffset}px + 1.5rem)`,
          minHeight: "100vh",
        }}
        ref={uploadFormRef}
      >
        <div className="max-w-5xl mx-auto">
          {/* Form Header */}
          <div className="mb-6 sm:mb-8 lg:mb-10">
            <div className="inline-block mb-3 sm:mb-4">
              <span className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-emerald-100 to-cyan-100 border-2 border-emerald-200 text-emerald-700 rounded-full text-xs sm:text-sm font-bold shadow-lg hover:shadow-xl transition-shadow duration-300">
                <span className="text-lg sm:text-xl">📋</span>
                <span>{t("prescriptionsPage.formBadge")}</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 mb-2 sm:mb-3 tracking-tight leading-tight">
              <span className="bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                {t("prescriptionsPage.formTitle")}
              </span>
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-3xl">
              {t("prescriptionsPage.formDescription")}
            </p>
          </div>

          {/* Main Form Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6 md:p-8 lg:p-10 mb-8 sm:mb-10 lg:mb-12 hover:shadow-xl transition-shadow duration-300">
            <form onSubmit={handleSubmit} className="space-y-8 sm:space-y-10">
              {/* Patient Information */}
              <div>
                <div className="flex items-center gap-2 mb-4 sm:mb-6 pb-3 border-b-2 border-emerald-500">
                  <span className="text-2xl">👤</span>
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                    {t("prescriptionsPage.patientInfo")}
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 sm:mb-2.5">
                      {t("prescriptionsPage.patientName")}
                    </label>
                    <input
                      type="text"
                      name="patientName"
                      required
                      value={formData.patientName}
                      onChange={handleInputChange}
                      className="w-full px-4 sm:px-5 py-3 sm:py-3.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm sm:text-base hover:border-emerald-300"
                      placeholder={t(
                        "prescriptionsPage.patientNamePlaceholder"
                      )}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 sm:mb-2.5">
                      {t("prescriptionsPage.patientAge")}
                    </label>
                    <input
                      type="number"
                      name="patientAge"
                      required
                      value={formData.patientAge}
                      onChange={handleInputChange}
                      className="w-full px-4 sm:px-5 py-3 sm:py-3.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm sm:text-base hover:border-emerald-300"
                      placeholder={t("prescriptionsPage.agePlaceholder")}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 sm:mb-2.5">
                      {t("prescriptionsPage.patientPhone")}
                    </label>
                    <input
                      type="tel"
                      name="patientPhone"
                      required
                      value={formData.patientPhone}
                      onChange={handleInputChange}
                      className="w-full px-4 sm:px-5 py-3 sm:py-3.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm sm:text-base hover:border-emerald-300"
                      placeholder={t("prescriptionsPage.phonePlaceholder")}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 sm:mb-2.5">
                      {t("prescriptionsPage.patientAddress")}
                    </label>
                    <input
                      type="text"
                      name="patientAddress"
                      required
                      value={formData.patientAddress}
                      onChange={handleInputChange}
                      className="w-full px-4 sm:px-5 py-3 sm:py-3.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm sm:text-base hover:border-emerald-300"
                      placeholder={t("prescriptionsPage.addressPlaceholder")}
                    />
                  </div>
                </div>
              </div>

              {/* Doctor Information */}
              <div>
                <div className="flex items-center gap-2 mb-4 sm:mb-6 pb-3 border-b-2 border-blue-500">
                  <span className="text-2xl">👨‍⚕️</span>
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                    {t("prescriptionsPage.doctorInfo")}
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 sm:mb-2.5">
                      {t("prescriptionsPage.doctorName")}
                    </label>
                    <input
                      type="text"
                      name="doctorName"
                      required
                      value={formData.doctorName}
                      onChange={handleInputChange}
                      className="w-full px-4 sm:px-5 py-3 sm:py-3.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm sm:text-base hover:border-blue-300"
                      placeholder={t("prescriptionsPage.doctorNamePlaceholder")}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 sm:mb-2.5">
                      {t("prescriptionsPage.hospitalClinic")}
                    </label>
                    <input
                      type="text"
                      name="hospitalClinic"
                      value={formData.hospitalClinic}
                      onChange={handleInputChange}
                      className="w-full px-4 sm:px-5 py-3 sm:py-3.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm sm:text-base hover:border-blue-300"
                      placeholder={t("prescriptionsPage.hospitalPlaceholder")}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2 sm:mb-2.5">
                      {t("prescriptionsPage.prescriptionDate")}
                    </label>
                    <input
                      type="date"
                      name="prescriptionDate"
                      required
                      value={formData.prescriptionDate}
                      onChange={handleInputChange}
                      className="w-full px-4 sm:px-5 py-3 sm:py-3.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm sm:text-base hover:border-blue-300"
                    />
                  </div>
                </div>
              </div>

              {/* File Upload */}
              <div>
                <div className="flex items-center gap-2 mb-4 sm:mb-6 pb-3 border-b-2 border-purple-500">
                  <span className="text-2xl">📎</span>
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                    {t("prescriptionsPage.prescriptionFiles")}
                  </h3>
                </div>
                <div
                  className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 lg:p-10 text-center transition-all ${
                    dragActive
                      ? "border-emerald-400 bg-emerald-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <CloudArrowUpIcon className="w-12 sm:w-16 h-12 sm:h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-base sm:text-lg font-bold text-gray-900 mb-2">
                    {t("prescriptionsPage.dragFiles")}
                  </p>
                  <p className="text-gray-600 text-sm sm:text-base mb-4">
                    {t("prescriptionsPage.or")}
                  </p>
                  <input
                    type="file"
                    multiple
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="inline-block bg-gradient-to-r from-emerald-600 to-green-600 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl font-bold hover:from-emerald-700 hover:to-green-700 transition-all cursor-pointer active:scale-95 text-sm sm:text-base shadow-md hover:shadow-lg"
                  >
                    {t("prescriptionsPage.chooseFiles")}
                  </label>
                  <p className="text-xs sm:text-sm text-gray-500 mt-4">
                    {t("prescriptionsPage.fileInfo")}
                  </p>
                </div>

                {/* File Preview */}
                {files.length > 0 && (
                  <div className="mt-6 sm:mt-8">
                    <h4 className="font-bold text-gray-900 mb-4 text-sm sm:text-base flex items-center gap-2">
                      <span>
                        ✓ {t("prescriptionsPage.uploadedFiles")} ({files.length}
                        )
                      </span>
                    </h4>
                    <div className="space-y-3">
                      {files.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-3 sm:p-4 border border-gray-200 hover:border-emerald-300 transition-all"
                        >
                          <div className="flex items-center min-w-0 flex-1">
                            <DocumentIcon className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <span className="text-sm sm:text-base text-gray-900 font-medium block truncate">
                                {file.name}
                              </span>
                              <span className="text-xs text-gray-500">
                                {(file.size / 1024 / 1024).toFixed(1)} MB
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="text-red-600 hover:text-red-700 font-semibold ml-2 flex-shrink-0 text-xs sm:text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-6 sm:pt-8 border-t-2 border-gray-200">
                <button
                  type="submit"
                  disabled={isSubmitting || files.length === 0}
                  className={`w-full py-3 sm:py-4 px-6 rounded-xl font-bold text-base sm:text-lg transition-all ${
                    isSubmitting || files.length === 0
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-emerald-600 to-green-600 text-white hover:from-emerald-700 hover:to-green-700 shadow-lg hover:shadow-xl active:scale-95"
                  }`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {t("prescriptionsPage.uploadingPrescriptionText")}
                    </span>
                  ) : (
                    t("prescriptionsPage.submit")
                  )}
                </button>

                <p className="text-xs sm:text-sm text-gray-500 text-center mt-4 sm:mt-6">
                  {t("prescriptionsPage.submissionAgreement")}
                </p>
              </div>
            </form>
          </div>


        </div>
      </div>
    </>
  );
}
