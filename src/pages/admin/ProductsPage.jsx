import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Plus, Edit, Trash2 } from "lucide-react";

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center overflow-auto">
      <div className="bg-background rounded-xl sm:rounded-2xl w-[95vw] max-w-2xl my-2 sm:my-4 p-3 sm:p-4 md:p-5 shadow-2xl">
        <div className="flex justify-between items-center mb-3 sm:mb-4">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold bg-linear-to-r from-emerald-500 to-blue-500 bg-clip-text text-transparent">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-foreground hover:text-muted-foreground text-xl"
          >
            ×
          </button>
        </div>
        <div className="max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  price: z.number().positive("Price must be positive"),
  stockQuantity: z.number().int().min(0, "Stock must be non-negative"),
  maxOrderQuantity: z
    .number()
    .int()
    .min(1, "Max order must be positive")
    .optional(),
  subcategoryId: z.string().min(1, "Subcategory is required"),
  brand: z.string().optional(),
  description: z.string().optional(),
  requiresPrescription: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const axiosInstance = axios.create({ baseURL: API_URL });
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const fetchProducts = async () => {
  const token = localStorage.getItem("auth_token");
  if (!token) {
    throw new Error("No authentication token found");
  }
  const { data } = await axiosInstance.get(`/api/admin/products`);
  return data;
};

const createProduct = (newProduct) =>
  axiosInstance.post(`/api/admin/products`, newProduct);
const updateProduct = ({ id, ...updatedProduct }) =>
  axiosInstance.put(`/api/admin/products/${id}`, updatedProduct);
const deleteProduct = (id) => axiosInstance.delete(`/api/admin/products/${id}`);
const fetchCategories = async () => {
  const { data } = await axiosInstance.get(`/api/admin/categories/all`);
  return data;
};

const ProductForm = ({ product, onSuccess, onCancel }) => {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploading, setUploading] = useState(false);

  const { data: categoriesData, isLoading: isLoadingCategories } = useQuery({
    queryKey: ["allCategories"],
    queryFn: fetchCategories,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: product || {
      name: "",
      price: 0,
      stockQuantity: 0,
      maxOrderQuantity: 10,
      subcategoryId: "",
      brand: "",
      description: "",
      requiresPrescription: false,
      isActive: true,
    },
  });

  useEffect(() => {
    if (product && categoriesData) {
      const parentCategory = categoriesData.find((cat) =>
        cat.subcategories.some((sub) => sub.id === product.subcategoryId)
      );
      if (parentCategory) {
        setSelectedCategory(parentCategory.id);
        setValue("subcategoryId", product.subcategoryId);
      }
      // Load existing images
      if (product.images) {
        const images =
          typeof product.images === "string"
            ? product.images.startsWith("[")
              ? JSON.parse(product.images)
              : [product.images]
            : product.images;
        setUploadedImages(images);
      }
    }
  }, [product, categoriesData, setValue]);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    setUploading(true);
    try {
      const { data } = await axiosInstance.post(
        "/api/products/upload",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setUploadedImages([data.imageUrl]);
      toast.success("Image uploaded successfully!");
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = (data) => {
    onSuccess({
      ...data,
      categoryId: selectedCategory,
      images: uploadedImages,
    });
  };

  const subcategories =
    categoriesData?.find((c) => c.id === selectedCategory)?.subcategories || [];

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-2 sm:space-y-3 md:space-y-4"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
        <div>
          <label className="block text-xs font-semibold mb-1 text-foreground">
            Name
          </label>
          <input
            {...register("name")}
            placeholder="Product name"
            className="w-full border-2 border-gray-200 rounded px-2 py-1.5 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200 transition text-xs"
          />
          {errors.name && (
            <p className="text-red-500 text-xs mt-0.5">{errors.name.message}</p>
          )}
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1 text-foreground">
            Brand
          </label>
          <input
            {...register("brand")}
            placeholder="Brand name"
            className="w-full border-2 border-gray-200 rounded px-2 py-1.5 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200 transition text-xs"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
        <div>
          <label className="block text-xs font-semibold mb-1 text-foreground">
            Price
          </label>
          <input
            type="number"
            step="0.01"
            {...register("price", { valueAsNumber: true })}
            placeholder="0.00"
            className="w-full border-2 border-gray-200 rounded px-2 py-1.5 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200 transition text-xs"
          />
          {errors.price && (
            <p className="text-red-500 text-xs mt-0.5">
              {errors.price.message}
            </p>
          )}
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1 text-foreground">
            Stock
          </label>
          <input
            type="number"
            {...register("stockQuantity", { valueAsNumber: true })}
            placeholder="0"
            className="w-full border-2 border-gray-200 rounded px-2 py-1.5 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200 transition text-xs"
          />
          {errors.stockQuantity && (
            <p className="text-red-500 text-xs mt-0.5">
              {errors.stockQuantity.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
        <div>
          <label className="block text-xs font-semibold mb-1 text-foreground">
            Max Order
          </label>
          <input
            type="number"
            {...register("maxOrderQuantity", { valueAsNumber: true })}
            placeholder="10"
            className="w-full border-2 border-gray-200 rounded px-2 py-1.5 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200 transition text-xs"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1 text-foreground">
            Category
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            disabled={isLoadingCategories}
            className="w-full border-2 border-gray-200 rounded px-2 py-1.5 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200 transition text-xs"
          >
            <option value="">
              {isLoadingCategories ? "Loading..." : "Select"}
            </option>
            {categoriesData?.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold mb-1 text-foreground">
          Subcategory
        </label>
        <select
          {...register("subcategoryId")}
          disabled={!selectedCategory}
          className="w-full border-2 border-gray-200 rounded px-2 py-1.5 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200 transition text-xs"
        >
          <option value="">Select Subcategory</option>
          {subcategories.map((sub) => (
            <option key={sub.id} value={sub.id}>
              {sub.name}
            </option>
          ))}
        </select>
        {errors.subcategoryId && (
          <p className="text-red-500 text-xs mt-0.5">
            {errors.subcategoryId.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-xs font-semibold mb-1 text-foreground">
          Description
        </label>
        <textarea
          {...register("description")}
          placeholder="Brief description..."
          className="w-full border-2 border-gray-200 rounded px-2 py-1.5 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200 transition resize-none text-xs"
          rows="2"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold mb-1 text-foreground">
          Product Image
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          disabled={uploading}
          className="w-full border-2 border-gray-200 rounded px-2 py-1.5 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200 transition text-xs"
        />
        {uploading && (
          <p className="text-xs text-blue-600 mt-1">Uploading...</p>
        )}
        {uploadedImages.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {uploadedImages.map((img, idx) => (
              <div key={idx} className="relative group">
                <img
                  src={`${API_URL}${img}`}
                  alt={`Product ${idx + 1}`}
                  className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded border-2 border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          {...register("requiresPrescription")}
          className="h-3 w-3 rounded border-gray-200 text-emerald-600"
        />
        <label className="text-xs font-semibold text-foreground">
          Requires Prescription
        </label>
      </div>

      <div className="flex flex-col-reverse sm:flex-row gap-2 justify-end pt-3 border-t-2 border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="w-full sm:w-auto px-3 sm:px-4 py-1.5 sm:py-2 border-2 border-gray-300 text-foreground rounded hover:bg-gray-50 font-semibold transition text-xs sm:text-sm"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="w-full sm:w-auto px-3 sm:px-4 py-1.5 sm:py-2 bg-linear-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-background rounded font-semibold transition shadow-lg hover:shadow-xl text-xs sm:text-sm"
        >
          {product ? "Update" : "Create"}
        </button>
      </div>
    </form>
  );
};

const AdminProductsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["adminProducts"],
    queryFn: fetchProducts,
  });

  const { mutate: createProductMutation } = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      toast.success("Product created successfully!");
      queryClient.invalidateQueries(["adminProducts"]);
      setIsModalOpen(false);
    },
    onError: (err) =>
      toast.error(err.response?.data?.error || "Failed to create product."),
  });

  const { mutate: updateProductMutation } = useMutation({
    mutationFn: updateProduct,
    onSuccess: () => {
      toast.success("Product updated successfully!");
      queryClient.invalidateQueries(["adminProducts"]);
      setIsModalOpen(false);
      setEditingProduct(null);
    },
    onError: (err) =>
      toast.error(err.response?.data?.error || "Failed to update product."),
  });

  const { mutate: deleteProductMutation } = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      toast.success("Product deactivated successfully!");
      queryClient.invalidateQueries(["adminProducts"]);
    },
    onError: (err) =>
      toast.error(err.response?.data?.error || "Failed to deactivate product."),
  });

  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDeleteProduct = (id) => {
    if (window.confirm("Are you sure you want to deactivate this product?")) {
      deleteProductMutation(id);
    }
  };

  const handleFormSubmit = (formData) => {
    if (editingProduct) {
      updateProductMutation({ id: editingProduct.id, ...formData });
    } else {
      createProductMutation(formData);
    }
  };

  if (isLoading) return <div className="p-4">Loading products...</div>;
  if (error) {
    console.error("Products fetch error:", error);
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded text-red-800">
        Error fetching products:{" "}
        {error.response?.status === 403
          ? "Admin access required"
          : error.message}
      </div>
    );
  }

  return (
    <div className="p-2 sm:p-4 md:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-linear-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
            Products
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Manage your products
          </p>
        </div>
        <button
          onClick={handleAddProduct}
          className="w-full sm:w-auto flex items-center justifycenter gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-linear-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-background rounded-lg font-semibold transition shadow-lg text-sm sm:text-base"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          Add Product
        </button>
      </div>

      <div className="bg-background shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-background">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-background0 uppercase tracking-wider">
                  Image
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-background0 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-background0 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-background0 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-background0 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-background0 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-background0 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-background divide-y divide-gray-200">
              {data?.data.map((product) => {
                const images =
                  typeof product.images === "string"
                    ? product.images.startsWith("[")
                      ? JSON.parse(product.images)
                      : [product.images]
                    : Array.isArray(product.images)
                    ? product.images
                    : [];
                const firstImage = images[0];

                return (
                  <tr key={product.id}>
                    <td className="px-4 sm:px-6 py-3 whitespace-nowrap">
                      {firstImage ? (
                        <img
                          src={`${API_URL}${firstImage}`}
                          alt={product.name}
                          className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded border"
                        />
                      ) : (
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
                          No img
                        </div>
                      )}
                    </td>
                    <td className="px-4 sm:px-6 py-3 whitespace-nowrap text-xs sm:text-sm font-medium text-foreground">
                      {product.name}
                    </td>
                    <td className="px-4 sm:px-6 py-3 whitespace-nowrap text-xs sm:text-sm text-background0">
                      {product.subcategory?.category?.name} {" > "}{" "}
                      {product.subcategory?.name}
                    </td>
                    <td className="px-4 sm:px-6 py-3 whitespace-nowrap text-xs sm:text-sm text-background0">
                      ৳{product.price.toFixed(2)}
                    </td>
                    <td className="px-4 sm:px-6 py-3 whitespace-nowrap text-xs sm:text-sm text-background0">
                      {product.stockQuantity}
                    </td>
                    <td className="px-4 sm:px-6 py-3 whitespace-nowrap text-xs">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          product.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {product.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-3 whitespace-nowrap text-right text-xs sm:text-sm font-medium">
                      <button
                        onClick={() => handleEditProduct(product)}
                        className="text-emerald-600 hover:text-emerald-900 mr-2 sm:mr-4"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? "Edit Product" : "Add Product"}
      >
        <ProductForm
          product={editingProduct}
          onSuccess={handleFormSubmit}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default AdminProductsPage;
