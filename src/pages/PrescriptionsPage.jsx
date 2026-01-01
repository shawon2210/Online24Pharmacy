import { useState, useRef } from "react";
import toast from "react-hot-toast";
import SEOHead from "../components/common/SEOHead";
import { useAuth } from "../contexts/AuthContext";
import useTranslation from "../hooks/useTranslation";
import {
  CloudArrowUpIcon,
  DocumentIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

export default function PrescriptionsPage() {
  const { user } = useAuth();
  const { t } = useTranslation("prescriptionsPage");
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

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

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

  const handleFiles = (newFiles) => {
    const validFiles = newFiles.filter((file) => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name}: File too large (max 5MB)`);
        return false;
      }
      if (!["image/jpeg", "image/png", "application/pdf"].includes(file.type)) {
        toast.error(`${file.name}: Invalid file type`);
        return false;
      }
      return true;
    });
    setFiles((prev) => [...prev, ...validFiles]);
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.patientName ||
      !formData.patientAge ||
      !formData.patientPhone ||
      !formData.patientAddress ||
      !formData.doctorName ||
      !formData.prescriptionDate
    ) {
      toast.error(t("errors.fillRequiredFields"));
      return;
    }
    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setReferenceNumber(`RX-${Date.now()}`);
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
      toast.success(t("success.uploaded"));
    } catch (_error) {
      toast.error(t("errors.submitFailed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
        <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md shadow-md">
          <div className="container mx-auto px-4 py-4">
            <nav className="mb-3" aria-label={t("breadcrumb")}>
              <ol className="flex items-center gap-1 text-sm text-gray-500">
                <li>
                  <a href="/" className="hover:text-emerald-600 font-medium">
                    {t("home")}
                  </a>
                </li>
                <li className="px-1 text-gray-400">/</li>
                <li className="text-gray-900 font-bold">
                  {t("prescriptionsPage.prescriptions")}
                </li>
              </ol>
            </nav>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
              {t("prescriptionsPage.uploadPrescription")}
            </h1>
          </div>
        </div>

        <div className="container mx-auto px-4 py-20">
          <div className="text-center max-w-md mx-auto">
            <div className="text-6xl mb-6">🔒</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              {t("prescriptionsPage.signInRequired")}
            </h2>
            <p className="text-gray-600 mb-8">
              {t("prescriptionsPage.signInRequiredDesc")}
            </p>
            <a
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
            >
              {t("prescriptionsPage.signIn")}
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
        <SEOHead title={t("prescriptionsPage.successTitle")} />

        <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md shadow-md">
          <div className="container mx-auto px-4 py-4">
            <nav className="mb-3" aria-label="Breadcrumb">
              <ol className="flex items-center gap-1 text-sm text-gray-500">
                <li>
                  <a href="/" className="hover:text-emerald-600 font-medium">
                    {t("home")}
                  </a>
                </li>
                <li className="px-1 text-gray-400">/</li>
                <li>
                  <a
                    href="/prescriptions"
                    className="hover:text-emerald-600 font-medium"
                  >
                    {t("prescriptionsPage.prescriptions")}
                  </a>
                </li>
                <li className="px-1 text-gray-400">/</li>
                <li className="text-gray-900 font-bold">
                  {t("prescriptionsPage.success")}
                </li>
              </ol>
            </nav>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
              {t("prescriptionsPage.uploadSuccessful")}
            </h1>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
              <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {t("prescriptionsPage.prescriptionUploadedSuccessfully")}
              </h2>

              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                <p className="text-green-700 mb-2 font-medium text-sm">
                  {t("prescriptionsPage.referenceNumberLabel")}
                </p>
                <p className="text-3xl sm:text-4xl font-bold text-green-900 tracking-wider font-mono break-all">
                  {referenceNumber || t("prescriptionsPage.loadingText")}
                </p>
                <p className="text-xs text-green-600 mt-2">
                  💾 {t("prescriptionsPage.saveReferenceNumber")}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4 text-lg flex items-center gap-2">
                  📍 {t("prescriptionsPage.nextStepsLabel")}
                </h3>
                <div className="space-y-3 text-sm text-gray-700">
                  <div className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                      1
                    </span>
                    <span>{t("prescriptionsPage.nextStep1")}</span>
                  </div>
                  <div className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                      2
                    </span>
                    <span>{t("prescriptionsPage.nextStep2")}</span>
                  </div>
                  <div className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                      3
                    </span>
                    <span>{t("prescriptionsPage.nextStep3")}</span>
                  </div>
                  <div className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                      4
                    </span>
                    <span>{t("prescriptionsPage.nextStep4")}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setReferenceNumber("");
                  }}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  📤 {t("prescriptionsPage.uploadAnotherBtn")}
                </button>
                <a
                  href="http://localhost:5173/my-prescriptions"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition-colors text-center"
                >
                  📋 {t("prescriptionsPage.viewMyPrescriptions")}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
      <SEOHead
        title={t("prescriptionsPage.seoTitle")}
        description={t("prescriptionsPage.seoDescription")}
        url="/prescriptions"
      />

      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md shadow-md">
        <div className="container mx-auto px-4 py-4">
          <nav className="mb-3" aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-1 text-xs sm:text-sm md:text-base text-gray-500">
              <li>
                <a href="/" className="hover:text-emerald-600 font-medium">
                  {t("home")}
                </a>
              </li>
              <li className="px-1 text-gray-400">/</li>
              <li className="text-gray-900 font-bold break-words max-w-xs sm:max-w-sm md:max-w-md">
                {t("uploadPrescription")}
              </li>
            </ol>
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h1 className="text-lg sm:text-2xl md:text-3xl font-black bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent mb-1 break-words max-w-xs sm:max-w-sm md:max-w-md">
                {t("uploadPrescription")}
              </h1>
              <p className="text-sm sm:text-base md:text-lg text-gray-600">
                {t("uploadDescription")}
              </p>
            </div>
            <a
              href="/my-prescriptions"
              className="bg-gray-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors text-sm sm:text-base md:text-lg"
            >
              📋 {t("myPrescriptions")}
            </a>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div
          ref={uploadFormRef}
          className="max-w-full sm:max-w-4xl lg:max-w-7xl mx-auto mt-6"
        >
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-50 to-cyan-50 px-6 lg:px-8 py-6 border-b border-gray-200">
              <div className="text-center">
                <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                  {t("formIntro")}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 lg:p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-8">
                  <div className="bg-gray-50 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                        <span className="text-white text-lg">👤</span>
                      </div>
                      <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900">
                        {t("patientInfo")}
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-xs sm:text-sm md:text-base font-semibold text-gray-700">
                          {t("patientName")}
                        </label>
                        <input
                          type="text"
                          name="patientName"
                          required
                          value={formData.patientName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all placeholder-gray-400"
                          placeholder={t("patientNamePlaceholder")}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-xs sm:text-sm md:text-base font-semibold text-gray-700">
                          {t("patientAge")}
                        </label>
                        <input
                          type="number"
                          name="patientAge"
                          required
                          min="1"
                          max="120"
                          value={formData.patientAge}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all placeholder-gray-400"
                          placeholder={t("agePlaceholder")}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-xs sm:text-sm md:text-base font-semibold text-gray-700">
                          {t("patientPhone")}
                        </label>
                        <input
                          type="tel"
                          name="patientPhone"
                          required
                          value={formData.patientPhone}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all placeholder-gray-400"
                          placeholder={t("phonePlaceholder")}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-xs sm:text-sm md:text-base font-semibold text-gray-700">
                          {t("patientAddress")}
                        </label>
                        <input
                          type="text"
                          name="patientAddress"
                          required
                          value={formData.patientAddress}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all placeholder-gray-400"
                          placeholder={t("addressPlaceholder")}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <span className="text-white text-lg">👨⚕️</span>
                      </div>
                      <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900">
                        {t("doctorInfo")}
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-xs sm:text-sm md:text-base font-semibold text-gray-700">
                          {t("doctorName")}
                        </label>
                        <input
                          type="text"
                          name="doctorName"
                          required
                          value={formData.doctorName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder-gray-400"
                          placeholder={t("doctorNamePlaceholder")}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-xs sm:text-sm md:text-base font-semibold text-gray-700">
                          {t("hospitalClinic")}
                        </label>
                        <input
                          type="text"
                          name="hospitalClinic"
                          value={formData.hospitalClinic}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder-gray-400"
                          placeholder={t("hospitalPlaceholder")}
                        />
                      </div>
                      <div className="sm:col-span-2 space-y-2">
                        <label className="block text-xs sm:text-sm md:text-base font-semibold text-gray-700">
                          {t("prescriptionDate")}
                        </label>
                        <input
                          type="date"
                          name="prescriptionDate"
                          required
                          value={formData.prescriptionDate}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="bg-purple-50 rounded-xl p-6 h-fit">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                        <span className="text-white text-lg">📎</span>
                      </div>
                      <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900">
                        {t("prescriptionFiles")}
                      </h3>
                    </div>
                    <div
                      className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                        dragActive
                          ? "border-emerald-400 bg-emerald-50"
                          : "border-gray-300 hover:border-emerald-400 bg-white"
                      }`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      <div className="flex flex-col items-center">
                        <CloudArrowUpIcon className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mb-4" />
                        <p className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                          {t("dragAndDrop")}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600 mb-6">
                          {t("orClickToBrowse")}
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
                          className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors cursor-pointer shadow-md hover:shadow-lg"
                        >
                          <span>📁</span>
                          <span className="whitespace-normal text-sm sm:text-base">
                            {t("chooseFiles")}
                          </span>
                        </label>
                        <div className="mt-4 flex flex-wrap gap-4 text-xs sm:text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            {t("fileTypes")}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                            {t("maxSizeEach")}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                            {t("multipleFilesAllowed")}
                          </span>
                        </div>
                      </div>
                    </div>

                    {files.length > 0 && (
                      <div className="mt-6">
                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-green-600 font-semibold">
                            ✓
                          </span>
                          <h4 className="font-semibold text-gray-900 text-sm sm:text-base">
                            {t("uploadedFiles")} ({files.length})
                          </h4>
                        </div>
                        <div className="space-y-3">
                          {files.map((file, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between bg-white rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                            >
                              <div className="flex items-center min-w-0 flex-1">
                                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                                  <DocumentIcon className="w-5 h-5 text-gray-500" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {file.name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {(file.size / 1024 / 1024).toFixed(1)} MB
                                  </p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeFile(index)}
                                className="ml-3 text-red-600 hover:text-red-700 font-medium text-sm px-2 py-1 rounded hover:bg-red-50 transition-colors"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-8 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6">
                <button
                  type="submit"
                  disabled={isSubmitting || files.length === 0}
                  className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all shadow-lg ${
                    isSubmitting || files.length === 0
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none"
                      : "bg-gradient-to-r from-emerald-600 to-green-600 text-white hover:from-emerald-700 hover:to-green-700 hover:shadow-xl transform hover:scale-[1.02]"
                  }`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-3">
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm sm:text-base">
                        {t("uploading")}
                      </span>
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-3">
                      <span>🚀</span>
                      <span className="text-sm sm:text-base">
                        {t("submitPrescription")}
                      </span>
                    </span>
                  )}
                </button>

                <div className="mt-4 text-center">
                  <p className="text-xs sm:text-sm text-gray-500">
                    {t("bySubmitting")}
                    <a
                      href="/terms"
                      className="text-emerald-600 hover:underline"
                    >
                      {t("termsOfService")}
                    </a>{" "}
                    {t("and")}{" "}
                    <a
                      href="/privacy"
                      className="text-emerald-600 hover:underline"
                    >
                      {t("privacyPolicy")}
                    </a>
                  </p>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
