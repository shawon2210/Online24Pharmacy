import { useState, useRef } from "react";
import toast from "react-hot-toast";
import SEOHead from "../components/common/SEOHead";
import { useAuth } from "../hooks/useAuth";
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
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-md shadow-md border-b border-border">
          <div className="container mx-auto px-4 py-4">
            <nav className="mb-3" aria-label={t("breadcrumb")}>
              <ol className="flex flex-wrap items-center gap-1 text-xs sm:text-sm text-foreground">
                <li>
                  <a
                    href="/"
                    className="hover:text-primary font-medium transition-colors"
                  >
                    {t("home")}
                  </a>
                </li>
                <li className="px-1 text-muted-foreground">/</li>
                <li className="text-foreground font-bold wrap-break-word max-w-200px sm:max-w-none">
                  {t("prescriptions")}
                </li>
              </ol>
            </nav>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-primary">
              {t("uploadPrescription")}
            </h1>
          </div>
        </div>

        <div className="container mx-auto px-4 py-20">
          <div className="text-center max-w-md mx-auto">
            <div className="text-4xl sm:text-6xl mb-4 sm:mb-6">🔒</div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3">
              {t("signInRequired")}
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 leading-relaxed">
              {t("signInRequiredDesc")}
            </p>
            <a
              href="/login"
              className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors text-sm sm:text-base"
            >
              {t("signIn")}
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <SEOHead title={t("successTitle")} />

        <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-md shadow-md border-b border-border">
          <div className="container mx-auto px-4 py-4">
            <nav className="mb-3" aria-label="Breadcrumb">
              <ol className="flex flex-wrap items-center gap-1 text-xs sm:text-sm text-foreground">
                <li>
                  <a
                    href="/"
                    className="hover:text-primary font-medium transition-colors"
                  >
                    {t("home")}
                  </a>
                </li>
                <li className="px-1 text-muted-foreground">/</li>
                <li>
                  <a
                    href="/prescriptions"
                    className="hover:text-primary font-medium transition-colors"
                  >
                    {t("prescriptions")}
                  </a>
                </li>
                <li className="px-1 text-muted-foreground">/</li>
                <li className="text-foreground font-bold wrap-break-word max-w-200px sm:max-w-none">
                  {t("successTitle")}
                </li>
              </ol>
            </nav>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-primary">
              {t("uploadSuccessful")}
            </h1>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-background rounded-xl shadow-lg border border-border dark:border-slate-700 p-4 sm:p-6 lg:p-8 text-center">
              <CheckCircleIcon className="w-12 h-12 sm:w-16 sm:h-16 text-green-500 mx-auto mb-4 sm:mb-6" />
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground mb-4">
                {t("prescriptionUploadedSuccessfully")}
              </h2>

              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 sm:p-6 mb-6">
                <p className="text-green-800 dark:text-green-300 mb-2 font-medium text-xs sm:text-sm">
                  {t("referenceNumberLabel")}
                </p>
                <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-green-900 dark:text-green-300 tracking-wider font-mono break-all">
                  {referenceNumber || t("loadingText")}
                </p>
                <p className="text-xs text-green-700 dark:text-green-400 mt-2">
                  💾 {t("saveReferenceNumber")}
                </p>
              </div>

              <div className="bg-background rounded-lg p-4 sm:p-6 mb-6 lg:mb-8 text-left border border-border dark:border-slate-700">
                <h3 className="font-bold text-foreground mb-4 text-base sm:text-lg flex items-center gap-2">
                  📍 {t("nextStepsLabel")}
                </h3>
                <div className="space-y-3 text-xs sm:text-sm text-foreground">
                  <div className="flex gap-3">
                    <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      1
                    </span>
                    <span className="leading-relaxed">{t("nextStep1")}</span>
                  </div>
                  <div className="flex gap-3">
                    <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      2
                    </span>
                    <span className="leading-relaxed">{t("nextStep2")}</span>
                  </div>
                  <div className="flex gap-3">
                    <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      3
                    </span>
                    <span className="leading-relaxed">{t("nextStep3")}</span>
                  </div>
                  <div className="flex gap-3">
                    <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      4
                    </span>
                    <span className="leading-relaxed">{t("nextStep4")}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setReferenceNumber("");
                  }}
                  className="flex-1 bg-secondary hover:bg-secondary/80 text-secondary-foreground px-4 sm:px-6 py-3 rounded-lg font-medium transition-colors text-sm sm:text-base"
                >
                  📤 {t("uploadAnotherBtn")}
                </button>
                <a
                  href="http://localhost:5173/my-prescriptions"
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground px-4 sm:px-6 py-3 rounded-lg font-medium transition-colors text-center text-sm sm:text-base"
                >
                  📋 {t("viewMyPrescriptions")}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={t("seoTitle")}
        description={t("seoDescription")}
        url="/prescriptions"
      />

      <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-md shadow-md border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <nav className="mb-3" aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-1 text-xs sm:text-sm text-foreground">
              <li>
                <a
                  href="/"
                  className="hover:text-primary font-medium transition-colors"
                >
                  {t("home")}
                </a>
              </li>
              <li className="px-1 text-muted-foreground">/</li>
              <li className="text-foreground font-bold wrap-break-word max-w-200px sm:max-w-none">
                {t("uploadPrescription")}
              </li>
            </ol>
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-primary mb-2 wrap-break-word">
                {t("uploadPrescription")}
              </h1>
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed">
                {t("uploadDescription")}
              </p>
            </div>
            <a
              href="/my-prescriptions"
              className="bg-muted-foreground text-background px-4 py-2 rounded-lg font-medium hover:bg-foreground transition-colors text-sm sm:text-base whitespace-nowrap shrink-0"
            >
              📋 {t("myPrescriptions")}
            </a>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <div ref={uploadFormRef} className="max-w-7xl mx-auto">
          <div className="bg-background rounded-xl sm:rounded-2xl shadow-xl border border-border dark:border-slate-700 overflow-hidden">
            <div className="bg-muted/40 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-border dark:border-slate-700">
              <div className="text-center">
                <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  {t("formIntro")}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-6 lg:p-8 xl:p-12">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8 xl:gap-12">
                <div className="space-y-8">
                  <div className="bg-background rounded-xl p-4 sm:p-6 border border-border dark:border-slate-700">
                    <div className="flex items-center gap-3 mb-4 sm:mb-6">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-lg flex items-center justify-center">
                        <span className="text-white text-base sm:text-lg">
                          👤
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg md:text-xl font-bold text-foreground">
                        {t("patientInfo")}
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div className="space-y-2">
                        <label className="block text-xs sm:text-sm md:text-base font-semibold text-foreground">
                          {t("patientName")}{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="patientName"
                          required
                          value={formData.patientName}
                          onChange={handleInputChange}
                          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-background dark:bg-slate-700 text-foreground border border-border dark:border-slate-600 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all placeholder-gray-400 dark:placeholder-gray-500"
                          placeholder={t("patientNamePlaceholder")}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-xs sm:text-sm md:text-base font-semibold text-foreground">
                          {t("patientAge")}{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          name="patientAge"
                          required
                          min="1"
                          max="120"
                          value={formData.patientAge}
                          onChange={handleInputChange}
                          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-background dark:bg-slate-700 text-foreground border border-border dark:border-slate-600 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all placeholder-gray-400 dark:placeholder-gray-500"
                          placeholder={t("agePlaceholder")}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-xs sm:text-sm md:text-base font-semibold text-foreground">
                          {t("patientPhone")}{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          name="patientPhone"
                          required
                          value={formData.patientPhone}
                          onChange={handleInputChange}
                          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-background dark:bg-slate-700 text-foreground border border-border dark:border-slate-600 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all placeholder-gray-400 dark:placeholder-gray-500"
                          placeholder={t("phonePlaceholder")}
                        />
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <label className="block text-xs sm:text-sm md:text-base font-semibold text-foreground">
                          {t("patientAddress")}{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          name="patientAddress"
                          required
                          value={formData.patientAddress}
                          onChange={handleInputChange}
                          rows="3"
                          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-background dark:bg-slate-700 text-foreground border border-border dark:border-slate-600 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all placeholder-gray-400 dark:placeholder-gray-500 resize-none"
                          placeholder={t("addressPlaceholder")}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-muted dark:bg-blue-900/20 rounded-xl p-4 sm:p-6 border border-border dark:border-blue-800">
                    <div className="flex items-center gap-3 mb-4 sm:mb-6">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 dark:bg-muted0 rounded-lg flex items-center justify-center">
                        <span className="text-white text-base sm:text-lg">
                          👨⚕️
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg md:text-xl font-bold text-foreground">
                        {t("doctorInfo")}
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div className="space-y-2">
                        <label className="block text-xs sm:text-sm md:text-base font-semibold text-foreground">
                          {t("doctorName")}{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="doctorName"
                          required
                          value={formData.doctorName}
                          onChange={handleInputChange}
                          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-background text-foreground border border-border dark:border-slate-700 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder-gray-400 dark:placeholder-gray-500"
                          placeholder={t("doctorNamePlaceholder")}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-xs sm:text-sm md:text-base font-semibold text-foreground">
                          {t("hospitalClinic")}
                        </label>
                        <input
                          type="text"
                          name="hospitalClinic"
                          value={formData.hospitalClinic}
                          onChange={handleInputChange}
                          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-background text-foreground border border-border dark:border-slate-700 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder-gray-400 dark:placeholder-gray-500"
                          placeholder={t("hospitalPlaceholder")}
                        />
                      </div>
                      <div className="sm:col-span-2 space-y-2">
                        <label className="block text-xs sm:text-sm md:text-base font-semibold text-foreground">
                          {t("prescriptionDate")}{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          name="prescriptionDate"
                          required
                          value={formData.prescriptionDate}
                          onChange={handleInputChange}
                          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-background text-foreground border border-border dark:border-slate-700 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="bg-muted dark:bg-purple-900/20 rounded-xl p-4 sm:p-6 h-fit border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center gap-3 mb-4 sm:mb-6">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-600 dark:bg-muted0 rounded-lg flex items-center justify-center">
                        <span className="text-white text-base sm:text-lg">
                          📎
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg md:text-xl font-bold text-foreground">
                        {t("prescriptionFiles")}
                      </h3>
                    </div>
                    <div
                      className={`border-2 border-dashed rounded-lg sm:rounded-xl p-4 sm:p-6 lg:p-8 text-center transition-all ${
                        dragActive
                          ? "border-primary bg-primary/5 dark:bg-primary/10"
                          : "border-border dark:border-slate-700 hover:border-primary bg-background"
                      }`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      <div className="flex flex-col items-center">
                        <CloudArrowUpIcon className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-muted-foreground mb-3 sm:mb-4" />
                        <p className="text-sm sm:text-base lg:text-lg font-semibold text-foreground mb-2">
                          {t("dragAndDrop")}
                        </p>
                        <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6">
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
                          className="inline-flex items-center gap-2 bg-primary text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold hover:bg-primary/90 transition-colors cursor-pointer shadow-md hover:shadow-lg text-sm sm:text-base touch-manipulation"
                        >
                          <span>📁</span>
                          <span className="whitespace-normal">
                            {t("chooseFiles")}
                          </span>
                        </label>
                        <div className="mt-4 flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground justify-center">
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
                      <div className="mt-4 sm:mt-6">
                        <div className="flex items-center gap-2 mb-3 sm:mb-4">
                          <span className="text-green-600 font-semibold text-sm sm:text-base">
                            ✓
                          </span>
                          <h4 className="font-semibold text-foreground text-sm sm:text-base">
                            {t("uploadedFiles")} ({files.length})
                          </h4>
                        </div>
                        <div className="space-y-3">
                          {files.map((file, index) => (
                            <div
                              key={index}
                              className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-background rounded-lg p-3 sm:p-4 border border-border dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow gap-3"
                            >
                              <div className="flex items-center min-w-0 flex-1">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-muted dark:bg-slate-700 rounded-lg flex items-center justify-center mr-3 shrink-0">
                                  <DocumentIcon className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium text-foreground truncate">
                                    {file.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {(file.size / 1024 / 1024).toFixed(1)} MB
                                  </p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeFile(index)}
                                className="self-start sm:self-center text-red-600 dark:text-red-400 hover:text-foreground dark:hover:text-red-300 font-medium text-xs sm:text-sm px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors whitespace-nowrap touch-manipulation"
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

              <div className="mt-6 sm:mt-8 bg-muted/40 rounded-lg sm:rounded-xl p-4 sm:p-6">
                <button
                  type="submit"
                  disabled={isSubmitting || files.length === 0}
                  className={`w-full py-3 sm:py-4 px-4 sm:px-6 rounded-lg sm:rounded-xl font-bold text-base sm:text-lg transition-all shadow-lg touch-manipulation ${
                    isSubmitting || files.length === 0
                      ? "bg-border dark:bg-slate-700 text-foreground/50 cursor-not-allowed shadow-none"
                      : "bg-primary hover:bg-primary/90 text-white hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
                  }`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-3">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-background border-t-transparent rounded-full animate-spin" />
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
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {t("bySubmitting")}
                    <a
                      href="/terms"
                      className="text-primary hover:underline mx-1 touch-manipulation"
                    >
                      {t("termsOfService")}
                    </a>{" "}
                    {t("and")}{" "}
                    <a
                      href="/privacy"
                      className="text-primary hover:underline ml-1 touch-manipulation"
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
