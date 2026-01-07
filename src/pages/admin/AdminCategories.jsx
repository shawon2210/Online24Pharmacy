import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import { useAuth } from "../../contexts/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function AdminCategories() {
  const { accessToken } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const imageInputRef = useRef(null);
  const queryClient = useQueryClient();

  const {
    data: categoriesData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/admin/categories`, {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      });
      if (!response.ok) throw new Error("Failed to fetch categories");
      const data = await response.json();
      const categories = data.categories || [];
      // Extra safety: filter out any inactive items that might slip through
      return categories.filter((c) => c?.isActive !== false);
    },
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  const createMutation = useMutation({
    mutationFn: async (category) => {
      const response = await fetch(`${API_URL}/api/admin/categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(category),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Failed to create category");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category created successfully");
      setIsModalOpen(false);
    },
    onError: (error) => {
      console.error("Create error:", error);
      const message = error.message || "Failed to create category";
      // Handle unique constraint errors gracefully
      if (message.includes("Unique constraint")) {
        toast.error(
          "A category with this name already exists. Please use a different name."
        );
      } else {
        toast.error(message);
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...category }) => {
      const response = await fetch(`${API_URL}/api/admin/categories/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(category),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Failed to update category");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category updated successfully");
      setIsModalOpen(false);
      setEditingCategory(null);
    },
    onError: (error) => {
      console.error("Update error:", error);
      toast.error(error.message || "Failed to update category");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const response = await fetch(`${API_URL}/api/admin/categories/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete category");
      }
      return { success: true };
    },
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData(["admin-categories"], (old) =>
        old ? old.filter((cat) => cat.id !== deletedId) : []
      );
      // Invalidate to ensure server data is refreshed on next render/reload
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category deleted successfully");
    },
    onError: (error) => {
      console.error("Delete error:", error);
      toast.error(error.message || "Failed to delete category");
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const form = e.target;

      let imageUrl = form.querySelector('input[name="image"]').value;
      const imageFile = imageInputRef.current?.files?.[0];

      // Upload image if a new file was selected
      if (imageFile) {
        const formData = new FormData();
        formData.append("image", imageFile);
        const uploadResponse = await fetch(
          `${API_URL}/api/admin/categories/upload`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            body: formData,
          }
        );
        if (!uploadResponse.ok) throw new Error("Image upload failed");
        const uploadData = await uploadResponse.json();
        imageUrl = uploadData.imageUrl;
      }

      const category = {
        name: form.querySelector('input[name="name"]').value,
        slug: form.querySelector('input[name="slug"]').value,
        image: imageUrl,
        description: form.querySelector('textarea[name="description"]').value,
        subcategories: form
          .querySelector('input[name="subcategories"]')
          .value.split(",")
          .map((s) => s.trim())
          .filter((s) => s),
        brands: form
          .querySelector('input[name="brands"]')
          .value.split(",")
          .map((s) => s.trim())
          .filter((s) => s),
        productTypes: form
          .querySelector('input[name="productTypes"]')
          .value.split(",")
          .map((s) => s.trim())
          .filter((s) => s),
        variants: form
          .querySelector('input[name="variants"]')
          .value.split(",")
          .map((s) => s.trim())
          .filter((s) => s),
      };

      if (editingCategory) {
        updateMutation.mutate({ id: editingCategory.id, ...category });
      } else {
        createMutation.mutate(category);
      }
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("Error: " + error.message);
    }
  };

  return (
    <div className="p-2 sm:p-4 md:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
            Categories
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Manage your product categories
          </p>
        </div>
        <button
          onClick={() => {
            setEditingCategory(null);
            setPreviewImage(null);
            setIsModalOpen(true);
          }}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-background rounded-lg font-semibold transition shadow-lg text-sm sm:text-base"
        >
          <PlusIcon className="w-4 h-4 sm:w-5 sm:h-5" />
          Add Category
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {categoriesData?.map((category) => (
            <div
              key={category.id}
              className="bg-background rounded-lg sm:rounded-xl shadow-md hover:shadow-lg transition overflow-hidden border border-gray-200"
            >
              <div className="relative h-24 sm:h-32 bg-gradient-to-r from-emerald-500 to-blue-500 overflow-hidden">
                {category.imageUrl ? (
                  <img
                    src={`${API_URL}${category.imageUrl}`}
                    alt={category.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                ) : null}
              </div>
              <div className="p-4 sm:p-6">
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <div>
                    <h3 className="font-bold text-sm sm:text-lg">
                      {category.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      /{category.slug}
                    </p>
                  </div>
                  <div className="flex gap-1 sm:gap-2">
                    <button
                      onClick={() => {
                        setEditingCategory(category);
                        setPreviewImage(null);
                        setIsModalOpen(true);
                      }}
                      className="p-1.5 sm:p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    >
                      <PencilIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm("Delete this category?")) {
                          deleteMutation.mutate(category.id);
                        }
                      }}
                      className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      <TrashIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                  {category.description}
                </p>
                <div className="space-y-1 sm:space-y-2 text-xs border-t pt-3 sm:pt-4">
                  <div>
                    <strong>Brands:</strong>{" "}
                    {category.brands?.join(", ") || "N/A"}
                  </div>
                  <div>
                    <strong>Types:</strong>{" "}
                    {category.productTypes?.join(", ") || "N/A"}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-auto">
          <div className="bg-background rounded-xl sm:rounded-2xl w-[95vw] max-w-2xl my-2 sm:my-4 p-3 sm:p-4 md:p-5 shadow-2xl">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-emerald-500 to-blue-500 bg-clip-text text-transparent">
              {editingCategory ? "Edit Category" : "Add Category"}
            </h2>
            <form
              onSubmit={handleSubmit}
              className="space-y-2 sm:space-y-3 md:space-y-4 max-h-[80vh] overflow-y-auto"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-foreground">
                    Name
                  </label>
                  <input
                    name="name"
                    defaultValue={editingCategory?.name}
                    placeholder="Pain Relief"
                    required
                    className="w-full border-2 border-gray-200 rounded px-2 py-1.5 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200 transition text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-foreground">
                    Slug
                  </label>
                  <input
                    name="slug"
                    defaultValue={editingCategory?.slug}
                    placeholder="pain-relief"
                    required
                    className="w-full border-2 border-gray-200 rounded px-2 py-1.5 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200 transition text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-foreground">
                  Image
                </label>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-emerald-300 rounded p-2 sm:p-3 hover:bg-emerald-50 hover:border-emerald-500 transition cursor-pointer group"
                  >
                    <PhotoIcon className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 group-hover:scale-110 transition" />
                    <span className="text-xs font-semibold text-foreground">
                      Upload
                    </span>
                  </button>
                  <input
                    ref={imageInputRef}
                    type="file"
                    name="imageFile"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) =>
                          setPreviewImage(event.target?.result);
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  {previewImage && (
                    <div className="relative w-full h-24 rounded overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 shadow">
                      <img
                        src={previewImage}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewImage(null);
                          if (imageInputRef.current)
                            imageInputRef.current.value = "";
                        }}
                        className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white px-2 py-0.5 rounded text-xs font-semibold transition"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                  <input
                    name="image"
                    defaultValue={editingCategory?.image}
                    placeholder="Or paste URL"
                    className="w-full border-2 border-gray-200 rounded px-2 py-1.5 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200 transition text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-foreground">
                  Description
                </label>
                <textarea
                  name="description"
                  defaultValue={editingCategory?.description}
                  placeholder="Brief description..."
                  required
                  className="w-full border-2 border-gray-200 rounded px-2 py-1.5 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200 transition resize-none text-xs"
                  rows="2"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-foreground">
                    Subcategories
                  </label>
                  <input
                    name="subcategories"
                    defaultValue={
                      editingCategory?.subcategories
                        ? Array.isArray(editingCategory.subcategories)
                          ? editingCategory.subcategories
                              .map((s) =>
                                typeof s === "string" ? s : s?.name || ""
                              )
                              .join(", ")
                          : ""
                        : ""
                    }
                    placeholder="OTC, Prescription"
                    required
                    className="w-full border-2 border-gray-200 rounded px-2 py-1.5 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200 transition text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-foreground">
                    Brands
                  </label>
                  <input
                    name="brands"
                    defaultValue={editingCategory?.brands?.join(", ") || ""}
                    placeholder="Brand A, Brand B"
                    required
                    className="w-full border-2 border-gray-200 rounded px-2 py-1.5 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200 transition text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-foreground">
                    Product Types
                  </label>
                  <input
                    name="productTypes"
                    defaultValue={
                      editingCategory?.productTypes?.join(", ") || ""
                    }
                    placeholder="Tablet, Capsule"
                    required
                    className="w-full border-2 border-gray-200 rounded px-2 py-1.5 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200 transition text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-foreground">
                    Variants
                  </label>
                  <input
                    name="variants"
                    defaultValue={editingCategory?.variants?.join(", ") || ""}
                    placeholder="500mg, 1000mg"
                    required
                    className="w-full border-2 border-gray-200 rounded px-2 py-1.5 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200 transition text-xs"
                  />
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-2 justify-end pt-3 border-t-2 border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingCategory(null);
                    setPreviewImage(null);
                  }}
                  className="w-full sm:w-auto px-3 sm:px-4 py-1.5 sm:py-2 border-2 border-gray-300 text-foreground rounded hover:bg-gray-50 font-semibold transition text-xs sm:text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-background rounded font-semibold transition shadow-lg hover:shadow-xl text-xs sm:text-sm"
                >
                  {editingCategory ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
