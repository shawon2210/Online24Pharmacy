/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export default function ProductForm({ product, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    shortDescription: "",
    sku: "",
    categoryId: "",
    subcategoryId: "",
    brand: "",
    manufacturer: "",
    price: "",
    discountPrice: "",
    requiresPrescription: false,
    isOtc: true,
    strength: "",
    dosageForm: "",
    packSize: "",
    genericName: "",
    stockQuantity: 0,
    minStockLevel: 10,
    maxOrderQuantity: 10,
    isActive: true,
    images: [],
  });

  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);

  useEffect(() => {
    fetchCategories();
    fetchSubcategories();
  }, []);

  useEffect(() => {
    if (product) {
      setFormData({
        ...product,
        price: product.price.toString(),
        discountPrice: product.discountPrice?.toString() || "",
        images: product.images || [],
      });
      // Set existing images for preview
      if (product.images && product.images.length > 0) {
        setImagePreviewUrls(product.images);
      }
    }
  }, [product]);

  const fetchCategories = async () => {
    try {
      console.log(
        "🔍 Fetching categories from:",
        `${API_URL}/products/categories`
      );
      const response = await axios.get(`${API_URL}/products/categories`);
      console.log("✅ Categories response:", response.data);
      setCategories(response.data.categories || []);
      console.log(
        "📦 Categories state set to:",
        response.data.categories || []
      );
    } catch (error) {
      console.error("❌ Failed to fetch categories:", error);
      setCategories([]);
    }
  };

  const fetchSubcategories = async () => {
    try {
      console.log(
        "🔍 Fetching subcategories from:",
        `${API_URL}/products/subcategories`
      );
      const response = await axios.get(`${API_URL}/products/subcategories`);
      console.log("✅ Subcategories response:", response.data);
      setSubcategories(response.data.subcategories || []);
      console.log(
        "📦 Subcategories state set to:",
        response.data.subcategories || []
      );
    } catch (error) {
      console.error("❌ Failed to fetch subcategories:", error);
      setSubcategories([]);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Auto-generate slug from name
    if (name === "name") {
      setFormData((prev) => ({
        ...prev,
        slug: value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, ""),
      }));
    }

    // Reset subcategory when category changes
    if (name === "categoryId") {
      setFormData((prev) => ({
        ...prev,
        subcategoryId: "",
      }));
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Add new files
    const startIndex = imageFiles.length;
    setImageFiles((prev) => [...prev, ...files]);

    // Create preview URLs for new files
    const newPreviewUrls = files.map((file) => URL.createObjectURL(file));
    setImagePreviewUrls((prev) => [...prev, ...newPreviewUrls]);
  };

  const removeImage = (index) => {
    const existingImagesCount = formData.images.length;

    if (index < existingImagesCount) {
      // Removing an existing image URL
      setFormData((prev) => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index),
      }));
      setImagePreviewUrls((prev) => prev.filter((_, i) => i !== index));
    } else {
      // Removing a newly uploaded file
      const fileIndex = index - existingImagesCount;
      setImageFiles((prev) => prev.filter((_, i) => i !== fileIndex));
      setImagePreviewUrls((prev) => {
        const url = prev[index];
        if (url && url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
        return prev.filter((_, i) => i !== index);
      });
    }
  };

  const uploadImages = async () => {
    if (imageFiles.length === 0) return [];

    const token = localStorage.getItem("auth_token");

    if (!token) {
      throw new Error("No authentication token found. Please login again.");
    }

    console.log("Starting upload for", imageFiles.length, "files");
    const uploadedUrls = [];

    try {
      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        console.log(
          `Uploading file ${i + 1}/${imageFiles.length}:`,
          file.name,
          file.type,
          file.size
        );

        const formDataUpload = new FormData();
        formDataUpload.append("image", file);

        const response = await axios.post(
          `${API_URL}/admin/upload`,
          formDataUpload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );

        console.log(`Upload ${i + 1} response:`, response.data);
        uploadedUrls.push(response.data.url);
      }
      return uploadedUrls;
    } catch (error) {
      console.error("Failed to upload images:", error);
      console.error("Error response:", error.response);
      console.error("Error status:", error.response?.status);
      console.error("Error data:", error.response?.data);

      let errorMessage = "Failed to upload images";
      if (error.response?.status === 401) {
        errorMessage = "Authentication failed. Please login again.";
      } else if (error.response?.status === 400) {
        errorMessage = error.response.data?.error || "Invalid image file";
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }

      throw new Error(errorMessage);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setUploading(true);

      // Upload new images first (if any)
      let newImageUrls = [];
      if (imageFiles.length > 0) {
        console.log("Uploading", imageFiles.length, "images...");
        newImageUrls = await uploadImages();
        console.log("Upload successful, URLs:", newImageUrls);
      }

      const token = localStorage.getItem("auth_token");
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        discountPrice: formData.discountPrice
          ? parseFloat(formData.discountPrice)
          : null,
        stockQuantity: parseInt(formData.stockQuantity),
        minStockLevel: parseInt(formData.minStockLevel),
        maxOrderQuantity: parseInt(formData.maxOrderQuantity),
        images: [...formData.images, ...newImageUrls],
      };

      console.log("Saving product with payload:", payload);

      if (product) {
        await axios.put(`${API_URL}/admin/products/${product.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(`${API_URL}/admin/products`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to save product:", error);
      console.error("Error response:", error.response);
      alert(
        "Failed to save product: " +
          (error.response?.data?.error || error.message)
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-background rounded-lg max-w-3xl w-full my-8">
        <div className="px-6 py-4 border-b border-border flex justify-between items-center">
          <h2 className="text-xl font-bold">
            {product ? "Edit Product" : "Add New Product"}
          </h2>
          <button
            onClick={onClose}
            className="text-background0 hover:text-foreground"
          >
            ✕
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-4 max-h-[70vh] overflow-y-auto"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-foreground mb-1">
                Product Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-foreground mb-1">
                Slug *
              </label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                SKU *
              </label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Category *
              </label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Subcategory
              </label>
              <select
                name="subcategoryId"
                value={formData.subcategoryId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!formData.categoryId}
              >
                <option value="">Select Subcategory (Optional)</option>
                {subcategories
                  .filter((sub) => sub.categoryId === formData.categoryId)
                  .map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Price (৳) *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                step="0.01"
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Discount Price (৳)
              </label>
              <input
                type="number"
                name="discountPrice"
                value={formData.discountPrice}
                onChange={handleChange}
                step="0.01"
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Stock Quantity *
              </label>
              <input
                type="number"
                name="stockQuantity"
                value={formData.stockQuantity}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Brand
              </label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Manufacturer
              </label>
              <input
                type="text"
                name="manufacturer"
                value={formData.manufacturer}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Generic Name
              </label>
              <input
                type="text"
                name="genericName"
                value={formData.genericName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Strength
              </label>
              <input
                type="text"
                name="strength"
                value={formData.strength}
                onChange={handleChange}
                placeholder="e.g., 500mg"
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Dosage Form
              </label>
              <input
                type="text"
                name="dosageForm"
                value={formData.dosageForm}
                onChange={handleChange}
                placeholder="e.g., Tablet, Capsule"
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Pack Size
              </label>
              <input
                type="text"
                name="packSize"
                value={formData.packSize}
                onChange={handleChange}
                placeholder="e.g., 10 tablets"
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-foreground mb-1">
                Short Description
              </label>
              <input
                type="text"
                name="shortDescription"
                value={formData.shortDescription}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-foreground mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Image Upload Section */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-foreground mb-2">
                Product Images
              </label>

              {/* Image Preview Grid */}
              {imagePreviewUrls.length > 0 && (
                <div className="grid grid-cols-4 gap-4 mb-4">
                  {imagePreviewUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border-2 border-border"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-background rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
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
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                      {index === 0 && (
                        <span className="absolute bottom-1 left-1 bg-blue-500 text-background text-xs px-2 py-1 rounded">
                          Primary
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Upload Button */}
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-border border-dashed rounded-lg cursor-pointer bg-background hover:bg-muted">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg
                      className="w-8 h-8 mb-2 text-background0"
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
                    <p className="mb-2 text-sm text-background0">
                      <span className="font-semibold">Click to upload</span> or
                      drag and drop
                    </p>
                    <p className="text-xs text-background0">
                      PNG, JPG, JPEG (MAX. 5MB)
                    </p>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-xs text-background0 mt-2">
                First image will be the primary product image
              </p>
            </div>

            <div className="col-span-2 flex gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="requiresPrescription"
                  checked={formData.requiresPrescription}
                  onChange={handleChange}
                  className="mr-2"
                />
                <span className="text-sm text-foreground">
                  Requires Prescription
                </span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isOtc"
                  checked={formData.isOtc}
                  onChange={handleChange}
                  className="mr-2"
                />
                <span className="text-sm text-foreground">
                  OTC (Over The Counter)
                </span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="mr-2"
                />
                <span className="text-sm text-foreground">Active</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-border rounded-md text-foreground hover:bg-background"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="px-4 py-2 bg-blue-600 text-background rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading
                ? "Uploading..."
                : product
                ? "Update Product"
                : "Add Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
