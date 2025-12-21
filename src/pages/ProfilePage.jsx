import { useState, useEffect, useLayoutEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";
import SEOHead from "../components/common/SEOHead";
import {
  UserCircleIcon,
  UserIcon,
  MapPinIcon,
  EnvelopeIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const dhakaAreas = [
  "Dhanmondi",
  "Gulshan",
  "Banani",
  "Uttara",
  "Mirpur",
  "Mohammadpur",
  "Bashundhara",
  "Badda",
  "Rampura",
  "Motijheel",
  "Tejgaon",
  "Farmgate",
];

export default function ProfilePage() {
  const { t } = useTranslation();
  const [headerOffset, setHeaderOffset] = useState(0);
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingProfile, setFetchingProfile] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Compute header height dynamically
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

  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    dateOfBirth: "",
    gender: "",
    street: "",
    area: "",
    city: "Dhaka",
    postalCode: "",
  });

  // Fetch full profile data from backend
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setFetchingProfile(false);
        return;
      }
      try {
        const response = await axios.get(`${API_URL}/api/users/me`, {
          withCredentials: true,
        });
        const profileData = response.data?.user;
        if (profileData) {
          const defaultAddress = profileData.addresses?.[0];
          setFormData({
            fullName: `${profileData.firstName || ""} ${
              profileData.lastName || ""
            }`.trim(),
            phoneNumber: profileData.phone || "",
            dateOfBirth: profileData.dateOfBirth
              ? new Date(profileData.dateOfBirth).toISOString().split("T")[0]
              : "",
            gender: profileData.gender || "",
            street: defaultAddress?.addressLine1 || "",
            area: defaultAddress?.area || "",
            city: defaultAddress?.city || "Dhaka",
            postalCode: defaultAddress?.postalCode || "",
          });
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        // Fall back to local user data
        if (user) {
          setFormData({
            fullName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
            phoneNumber: user.phone || "",
            dateOfBirth: user.dateOfBirth || "",
            gender: user.gender || "",
            street: "",
            area: "",
            city: "Dhaka",
            postalCode: "",
          });
        }
      } finally {
        setFetchingProfile(false);
      }
    };
    fetchProfile();
  }, [user]);

  const validatePhone = (phone) => {
    const regex = /^\+8801[3-9]\d{8}$/;
    return regex.test(phone);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Only validate phone if it's provided
    if (
      formData.phoneNumber &&
      formData.phoneNumber.trim() !== "" &&
      !validatePhone(formData.phoneNumber)
    ) {
      setMessage({
        type: "error",
        text: t("profilePage.phoneValidationError"),
      });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.patch(`${API_URL}/api/users/me`, formData, {
        withCredentials: true,
      });
      // Update the local user state with the new data
      if (response.data?.user && updateUser) {
        updateUser(response.data.user);
      }
      setMessage({ type: "success", text: t("profilePage.successMessage") });
      setIsEditing(false);
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.error || t("profilePage.errorMessage"),
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <>
        <SEOHead title="Profile - Online24 Pharmacy" />
        <div
          className="w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20"
          style={{ paddingTop: `${headerOffset}px` }}
        >
          <div className="max-w-md mx-auto text-center">
            <UserCircleIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600 mb-6">
              Please log in to view your profile.
            </p>
            <a
              href="/login"
              className="inline-block bg-gradient-to-r from-emerald-600 to-green-600 text-white px-6 py-3 rounded-xl font-bold hover:from-emerald-700 hover:to-green-700"
            >
              Sign In
            </a>
          </div>
        </div>
      </>
    );
  }

  if (fetchingProfile) {
    return (
      <>
        <SEOHead title={t("profilePage.seoTitle")} />
        <div
          className="w-full px-4 sm:px-6 lg:px-8 flex items-center justify-center py-20"
          style={{ paddingTop: `${headerOffset}px`, minHeight: "100vh" }}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600 font-medium">
              {t("profilePage.loading")}
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEOHead title={t("profilePage.seoTitle")} />
      <div
        className="w-full bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 pb-12 sm:pb-16 lg:pb-20"
        style={{
          marginTop: `-${headerOffset}px`,
          paddingTop: `calc(${headerOffset}px + 1.5rem)`,
          minHeight: "100vh",
        }}
      >
        <div className="w-full mx-auto px-4 sm:px-6 md:max-w-4xl lg:max-w-6xl xl:max-w-7xl">
          {/* Page Header */}
          <div className="mb-0">
            <div className="inline-block mb-3 sm:mb-4">
              <span className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-emerald-100 to-cyan-100 border-2 border-emerald-200 text-emerald-700 rounded-full text-xs sm:text-sm font-bold shadow-lg hover:shadow-xl transition-shadow duration-300">
                <span className="text-lg sm:text-xl">👤</span>
                <span>{t("profilePage.myProfile")}</span>
              </span>
            </div>
            <h1 className="font-black text-gray-900 mb-2 sm:mb-3 tracking-tight leading-tight">
              <span className="bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                {t("profilePage.accountSettings")}
              </span>
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-3xl">
              {t("profilePage.manageProfileDesc")}
            </p>
          </div>
        </div>
        <div className="w-full mx-auto px-4 sm:px-6 md:max-w-4xl lg:max-w-6xl xl:max-w-7xl">
          {/* User Card */}
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl shadow-lg p-6 sm:p-8 lg:p-10 mb-8 sm:mb-10 lg:mb-12 text-white">
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="w-16 sm:w-20 h-16 sm:h-20 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0">
                <UserCircleIcon className="w-10 sm:w-12 h-10 sm:h-12 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-1 sm:mb-2">
                  {user.firstName} {user.lastName}
                </h2>
                <p className="text-emerald-100 text-xs sm:text-sm flex items-center gap-2 mb-2">
                  <EnvelopeIcon className="w-4 h-4" />
                  <span className="truncate">{user.email}</span>
                </p>
                <p className="text-emerald-100 text-xs sm:text-sm">
                  {t("profilePage.memberSince")}{" "}
                  {new Date(user.createdAt || Date.now()).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="w-full mx-auto px-4 sm:px-6 md:max-w-4xl lg:max-w-6xl xl:max-w-7xl">
          {/* Message Alert */}
          {message.text && (
            <div
              className={`mb-6 sm:mb-8 p-4 sm:p-6 rounded-2xl border-2 flex items-start gap-3 ${
                message.type === "success"
                  ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                  : "bg-red-50 border-red-300 text-red-800"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
              ) : (
                <span className="text-lg flex-shrink-0">⚠️</span>
              )}
              <p className="text-sm sm:text-base font-semibold">
                {message.text}
              </p>
            </div>
          )}
        </div>
        <div className="w-full mx-auto px-4 sm:px-6 md:max-w-4xl lg:max-w-6xl xl:max-w-7xl">
          {/* Profile Form */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sm:p-8 lg:p-10 space-y-8 sm:space-y-10">
            {/* Section Header */}
            <div className="flex items-center justify-between pb-4 sm:pb-6 border-b-2 border-emerald-500">
              <div className="flex items-center gap-3">
                <div className="p-2 sm:p-3 bg-emerald-100 rounded-lg">
                  <UserIcon className="w-5 sm:w-6 h-5 sm:h-6 text-emerald-600" />
                </div>
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                  {t("profilePage.profileInformation")}
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsEditing(!isEditing);
                  setMessage({ type: "", text: "" });
                }}
                className={`px-4 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base font-bold rounded-xl transition-all ${
                  isEditing
                    ? "bg-red-100 text-red-700 hover:bg-red-200"
                    : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                }`}
              >
                {isEditing
                  ? t("profilePage.cancel")
                  : t("profilePage.editProfile")}
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
              {/* Personal Information */}
              <div>
                <h4 className="text-sm sm:text-base font-bold text-gray-700 mb-4 sm:mb-6 flex items-center gap-2">
                  <span className="text-lg">📋</span>
                  {t("profilePage.personalInfo")}
                </h4>
                <div className="space-y-4 sm:space-y-5">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2 sm:mb-2.5">
                      {t("profilePage.fullName")} *
                    </label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) =>
                        setFormData({ ...formData, fullName: e.target.value })
                      }
                      disabled={!isEditing}
                      required
                      className="w-full px-4 sm:px-5 py-3 sm:py-3.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-50 transition-all text-sm sm:text-base hover:border-emerald-300"
                    />
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2 sm:mb-2.5">
                      {t("profilePage.phoneNumberLabel")}
                    </label>
                    <input
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          phoneNumber: e.target.value,
                        })
                      }
                      disabled={!isEditing}
                      placeholder="+8801XXXXXXXXX"
                      required
                      className="w-full px-4 sm:px-5 py-3 sm:py-3.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-50 transition-all text-sm sm:text-base hover:border-emerald-300"
                    />
                    {isEditing && formData.phoneNumber && (
                      <p
                        className={`text-xs mt-2 font-semibold ${
                          validatePhone(formData.phoneNumber)
                            ? "text-emerald-600"
                            : "text-red-600"
                        }`}
                      >
                        {validatePhone(formData.phoneNumber)
                          ? t("profilePage.validPhone")
                          : t("profilePage.invalidPhone")}
                      </p>
                    )}
                  </div>

                  {/* Date of Birth & Gender */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2 sm:mb-2.5">
                        {t("profilePage.dateOfBirth")}
                      </label>
                      <input
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            dateOfBirth: e.target.value,
                          })
                        }
                        disabled={!isEditing}
                        className="w-full px-4 sm:px-5 py-3 sm:py-3.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-50 transition-all text-sm sm:text-base hover:border-emerald-300"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2 sm:mb-2.5">
                        {t("profilePage.gender")}
                      </label>
                      <select
                        value={formData.gender}
                        onChange={(e) =>
                          setFormData({ ...formData, gender: e.target.value })
                        }
                        disabled={!isEditing}
                        className="w-full px-4 sm:px-5 py-3 sm:py-3.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-50 transition-all text-sm sm:text-base hover:border-emerald-300 appearance-none cursor-pointer bg-white"
                      >
                        <option value="">
                          {t("profilePage.selectGender")}
                        </option>
                        <option value="Male">{t("profilePage.male")}</option>
                        <option value="Female">
                          {t("profilePage.female")}
                        </option>
                        <option value="Other">{t("profilePage.other")}</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Address Section */}
              <div className="pt-6 sm:pt-8 border-t-2 border-gray-200">
                <h4 className="text-sm sm:text-base font-bold text-gray-700 mb-4 sm:mb-6 flex items-center gap-2">
                  <MapPinIcon className="w-5 h-5 text-emerald-600" />
                  {t("profilePage.defaultShippingAddress")}
                </h4>

                <div className="space-y-4 sm:space-y-5">
                  {/* Street Address */}
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2 sm:mb-2.5">
                      {t("profilePage.street")}
                    </label>
                    <input
                      type="text"
                      value={formData.street}
                      onChange={(e) =>
                        setFormData({ ...formData, street: e.target.value })
                      }
                      disabled={!isEditing}
                      placeholder={t("profilePage.streetPlaceholder")}
                      className="w-full px-4 sm:px-5 py-3 sm:py-3.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-50 transition-all text-sm sm:text-base hover:border-emerald-300"
                    />
                  </div>

                  {/* Area, City, Postal Code */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2 sm:mb-2.5">
                        {t("profilePage.area")}
                      </label>
                      <select
                        value={formData.area}
                        onChange={(e) =>
                          setFormData({ ...formData, area: e.target.value })
                        }
                        disabled={!isEditing}
                        className="w-full px-4 sm:px-5 py-3 sm:py-3.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-50 transition-all text-sm sm:text-base hover:border-emerald-300 appearance-none cursor-pointer bg-white"
                      >
                        <option value="">{t("profilePage.selectArea")}</option>
                        {dhakaAreas.map((area) => (
                          <option key={area} value={area}>
                            {area}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2 sm:mb-2.5">
                        {t("profilePage.postalCode")}
                      </label>
                      <input
                        type="text"
                        value={formData.postalCode}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            postalCode: e.target.value,
                          })
                        }
                        disabled={!isEditing}
                        placeholder={t("profilePage.postalCodePlaceholder")}
                        className="w-full px-4 sm:px-5 py-3 sm:py-3.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-50 transition-all text-sm sm:text-base hover:border-emerald-300"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              {isEditing && (
                <div className="pt-6 sm:pt-8 border-t-2 border-gray-200 flex gap-4 sm:gap-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`flex-1 py-3 sm:py-4 px-4 sm:px-6 rounded-xl font-bold text-base sm:text-lg transition-all shadow-md hover:shadow-lg ${
                      loading
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-gradient-to-r from-emerald-600 to-green-600 text-white hover:from-emerald-700 hover:to-green-700 active:scale-95"
                    }`}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        {t("profilePage.saving")}
                      </span>
                    ) : (
                      t("profilePage.save")
                    )}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
