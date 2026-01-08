import { useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function CategoryForm({ onSuccess }) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type on frontend
      if (!file.type.startsWith("image/")) {
        setError(
          `Please select an image file. You selected: ${
            file.type || "unknown type"
          }`
        );
        e.target.value = ""; // Reset input
        return;
      }

      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError(
          `File is too large. Maximum size is 10MB. Your file: ${(
            file.size /
            1024 /
            1024
          ).toFixed(2)}MB`
        );
        e.target.value = ""; // Reset input
        return;
      }

      setError(""); // Clear any previous errors
      setImageFile(file);

      // Show preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadImage = async () => {
    if (!imageFile) {
      setError("Please select an image first");
      return;
    }

    setUploadingImage(true);
    setError("");

    try {
      const token = localStorage.getItem("auth_token");
      const formData = new FormData();
      formData.append("image", imageFile);

      console.log(
        "Uploading image to:",
        `${API_URL}/api/admin/categories/upload`
      );
      console.log("Token:", token ? "Present" : "Missing");
      console.log("File:", imageFile.name, imageFile.size, imageFile.type);

      const response = await axios.post(
        `${API_URL}/api/admin/categories/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Upload response:", response.data);
      setImageUrl(response.data.imageUrl);
      setImageFile(null);
      setImagePreview("");
    } catch (err) {
      console.error("Upload error:", err);
      console.error("Error response:", err?.response?.data);
      setError(
        err?.response?.data?.error ||
          err?.message ||
          "Image upload failed. Please check your connection and try again."
      );
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("auth_token");
      await axios.post(
        `${API_URL}/api/admin/categories`,
        {
          name,
          description,
          image: imageUrl,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setName("");
      setDescription("");
      setImageUrl("");
      setImageFile(null);
      setImagePreview("");
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create category");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <label className="block mb-1">
          {t("adminCategories.name", "Name")}
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="input input-bordered w-full"
        />
      </div>

      <div>
        <label className="block mb-1">
          {t("adminCategories.description", "Description")}
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="textarea textarea-bordered w-full"
        />
      </div>

      <div>
        <label className="block mb-1">
          {t("adminCategories.image", "Category Image")}
        </label>
        <p className="text-xs text-gray-500 mb-2">
          Supported: JPG, PNG, GIF, WebP, SVG, BMP (Max: 10MB)
        </p>
        <div className="flex gap-2">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="input input-bordered w-full flex-1"
          />
          <button
            type="button"
            onClick={handleUploadImage}
            disabled={!imageFile || uploadingImage}
            className="btn btn-secondary whitespace-nowrap"
          >
            {uploadingImage ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>

      {imagePreview && (
        <div className="flex flex-col gap-2">
          <label className="block text-sm">Preview:</label>
          <img
            src={imagePreview}
            alt="Preview"
            className="w-24 h-24 object-cover rounded"
          />
        </div>
      )}

      {imageUrl && (
        <div className="flex items-center gap-2 p-2 bg-green-100 rounded">
          <span className="text-green-800">✓ Image uploaded successfully</span>
          <img
            src={`${API_URL}${imageUrl}`}
            alt="Uploaded"
            className="w-16 h-16 object-cover rounded"
          />
        </div>
      )}

      {!!error && <div className="text-red-500">{error}</div>}

      <button
        type="submit"
        className="btn btn-primary"
        disabled={loading || !imageUrl}
      >
        {loading
          ? t("adminCategories.creating", "Creating...")
          : t("adminCategories.createCategory", "Create Category")}
      </button>
    </form>
  );
}
