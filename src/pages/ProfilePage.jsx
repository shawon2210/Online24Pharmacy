import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";
import SEOHead from "../components/common/SEOHead";
import {
  UserCircleIcon,
  CameraIcon,
  CheckCircleIcon,
  XCircleIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarIcon,
  MapPinIcon,
  PencilIcon,
} from "@heroicons/react/24/outline";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const dhakaAreas = [
  "Dhanmondi", "Gulshan", "Banani", "Uttara", "Mirpur", "Mohammadpur",
  "Bashundhara", "Badda", "Rampura", "Motijheel", "Tejgaon", "Farmgate",
];

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);

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

  useEffect(() => {
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
      const savedPicture = localStorage.getItem(`profilePicture_${user.id}`);
      if (savedPicture) {
        setProfilePicturePreview(savedPicture);
        updateUser({ profilePicture: savedPicture });
      }
    }
  }, [user]);

  const handleProfilePictureChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: "error", text: "Image size must be less than 5MB" });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setProfilePicturePreview(base64String);
        localStorage.setItem(`profilePicture_${user.id}`, base64String);
        updateUser({ profilePicture: base64String });
        setMessage({ type: "success", text: "Profile picture updated!" });
      };
      reader.readAsDataURL(file);
    }
  };

  const validatePhone = (phone) => /^\+8801[3-9]\d{8}$/.test(phone);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.phoneNumber && !validatePhone(formData.phoneNumber)) {
      setMessage({ type: "error", text: "Invalid phone number format" });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.patch(`${API_URL}/api/users/me`, formData, {
        withCredentials: true,
      });
      if (response.data?.user && updateUser) {
        updateUser(response.data.user);
      }
      setMessage({ type: "success", text: "Profile updated successfully!" });
      setIsEditing(false);
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.error || "Update failed" });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <>
        <SEOHead title="Profile - Online24 Pharmacy" />
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
          <div className="text-center">
            <UserCircleIcon className="w-20 h-20 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-6">Please log in to view your profile.</p>
            <a href="/login" className="inline-block bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors">
              Sign In
            </a>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEOHead title="My Profile - Online24 Pharmacy" />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 sm:py-6 lg:py-8">
        <div className="w-full h-full px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-4 sm:mb-6 lg:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">My Profile</h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">Manage your account information</p>
          </div>

          {/* Alert Message */}
          {message.text && (
            <div className={`mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg flex items-center gap-2 sm:gap-3 text-sm sm:text-base ${message.type === "success" ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-200" : "bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200"}`}>
              {message.type === "success" ? <CheckCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" /> : <XCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />}
              <p className="font-medium">{message.text}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Left Sidebar - Profile Card */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 sm:p-6 lg:sticky lg:top-6">
                <div className="text-center">
                  <div className="relative inline-block mb-3 sm:mb-4">
                    {profilePicturePreview || user.profilePicture ? (
                      <img src={profilePicturePreview || user.profilePicture} alt="Profile" className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-emerald-100 dark:border-emerald-900" />
                    ) : (
                      <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center border-4 border-emerald-100 dark:border-emerald-900">
                        <span className="text-3xl sm:text-4xl font-bold text-white">{user.firstName?.charAt(0)}{user.lastName?.charAt(0)}</span>
                      </div>
                    )}
                    <label className="absolute bottom-0 right-0 w-8 h-8 sm:w-10 sm:h-10 bg-emerald-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-emerald-700 transition-colors shadow-lg">
                      <CameraIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      <input type="file" accept="image/*" onChange={handleProfilePictureChange} className="hidden" />
                    </label>
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">{user.firstName} {user.lastName}</h2>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">{user.email}</p>
                  <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Member since</p>
                    <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">{new Date(user.createdAt || Date.now()).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content - Form */}
            <div className="lg:col-span-3">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                {/* Header */}
                <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Personal Information</h3>
                  <button
                    onClick={() => {
                      setIsEditing(!isEditing);
                      setMessage({ type: "", text: "" });
                    }}
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 text-sm rounded-lg font-medium transition-colors ${isEditing ? "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600" : "bg-emerald-600 text-white hover:bg-emerald-700"}`}
                  >
                    {isEditing ? "Cancel" : "Edit"}
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <UserCircleIcon className="w-4 h-4 inline mr-1" />
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        disabled={!isEditing}
                        required
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-50 dark:disabled:bg-gray-800 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <PhoneIcon className="w-4 h-4 inline mr-1" />
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                        disabled={!isEditing}
                        placeholder="+8801XXXXXXXXX"
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-50 dark:disabled:bg-gray-800 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <CalendarIcon className="w-4 h-4 inline mr-1" />
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                        disabled={!isEditing}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-50 dark:disabled:bg-gray-800 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Gender</label>
                      <select
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        disabled={!isEditing}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-50 dark:disabled:bg-gray-800 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  {/* Address Section */}
                  <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <MapPinIcon className="w-5 h-5 text-emerald-600" />
                      Shipping Address
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Street Address</label>
                        <input
                          type="text"
                          value={formData.street}
                          onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                          disabled={!isEditing}
                          placeholder="House/Flat, Road, Block"
                          className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-50 dark:disabled:bg-gray-800 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Area</label>
                        <select
                          value={formData.area}
                          onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                          disabled={!isEditing}
                          className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-50 dark:disabled:bg-gray-800 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                        >
                          <option value="">Select Area</option>
                          {dhakaAreas.map((area) => (
                            <option key={area} value={area}>{area}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Postal Code</label>
                        <input
                          type="text"
                          value={formData.postalCode}
                          onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                          disabled={!isEditing}
                          placeholder="1200"
                          className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-50 dark:disabled:bg-gray-800 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Save Button */}
                  {isEditing && (
                    <div className="pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700">
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full px-6 py-2.5 sm:py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                      >
                        {loading ? (
                          <>
                            <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Saving...
                          </>
                        ) : (
                          "Save Changes"
                        )}
                      </button>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
