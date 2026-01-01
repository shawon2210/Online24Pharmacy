import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Plus, Edit, Trash2 } from "lucide-react";

// Mock components - in a real app, these would be in src/components/common
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800"
          >
            &times;
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

const Button = ({ children, onClick, className = "", ...props }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-md font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition ${className}`}
    {...props}
  >
    {children}
  </button>
);

// Zod schema for validation
const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  price: z.number().positive("Price must be a positive number"),
  stockQuantity: z.number().int().min(0, "Stock must be non-negative"),
  subcategoryId: z.string().min(1, "Subcategory is required"),
  // Add other fields as necessary
  brand: z.string().optional(),
  description: z.string().optional(),
  requiresPrescription: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// API functions
const fetchProducts = async () => {
  const { data } = await axios.get(`${API_URL}/api/admin/products`);
  return data;
};

const createProduct = (newProduct) =>
  axios.post(`${API_URL}/api/admin/products`, newProduct);
const updateProduct = ({ id, ...updatedProduct }) =>
  axios.put(`${API_URL}/api/admin/products/${id}`, updatedProduct);
const deleteProduct = (id) =>
  axios.delete(`${API_URL}/api/admin/products/${id}`);

const fetchCategories = async () => {
  const { data } = await axios.get(`${API_URL}/api/admin/categories/all`);
  return data;
};

const ProductForm = ({ product, onSuccess, onCancel }) => {
  const [selectedCategory, setSelectedCategory] = useState("");

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
      subcategoryId: "",
      brand: "",
      description: "",
      requiresPrescription: false,
      isActive: true,
    },
  });

  // Effect to set initial category selection when editing a product
  useEffect(() => {
    if (product && categoriesData) {
      const parentCategory = categoriesData.find((cat) =>
        cat.subcategories.some((sub) => sub.id === product.subcategoryId)
      );
      if (parentCategory) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSelectedCategory(parentCategory.id);
        setValue("subcategoryId", product.subcategoryId);
      }
    }
  }, [product, categoriesData, setValue]);

  const onSubmit = (data) => {
    onSuccess(data);
  };

  const subcategories =
    categoriesData?.find((c) => c.id === selectedCategory)?.subcategories || [];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Product Name
        </label>
        <input
          {...register("name")}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
        {errors.name && (
          <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Price
          </label>
          <input
            type="number"
            step="0.01"
            {...register("price", { valueAsNumber: true })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
          {errors.price && (
            <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Stock Quantity
          </label>
          <input
            type="number"
            {...register("stockQuantity", { valueAsNumber: true })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
          {errors.stockQuantity && (
            <p className="text-red-500 text-xs mt-1">
              {errors.stockQuantity.message}
            </p>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Category
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            disabled={isLoadingCategories}
          >
            <option value="">
              {isLoadingCategories ? "Loading..." : "Select Category"}
            </option>
            {categoriesData?.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Subcategory
          </label>
          <select
            {...register("subcategoryId")}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            disabled={!selectedCategory}
          >
            <option value="">Select Subcategory</option>
            {subcategories.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>
          {errors.subcategoryId && (
            <p className="text-red-500 text-xs mt-1">
              {errors.subcategoryId.message}
            </p>
          )}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Brand</label>
        <input
          {...register("brand")}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          {...register("description")}
          rows="3"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        ></textarea>
      </div>
      <div className="flex items-center">
        <input
          type="checkbox"
          {...register("requiresPrescription")}
          className="h-4 w-4 rounded border-gray-300 text-emerald-600"
        />
        <label className="ml-2 block text-sm text-gray-900">
          Requires Prescription
        </label>
      </div>
      <div className="flex justify-end space-x-3">
        <Button
          type="button"
          onClick={onCancel}
          className="bg-gray-300 text-gray-800 hover:bg-gray-400"
        >
          Cancel
        </Button>
        <Button type="submit">Save Product</Button>
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

  if (isLoading) return <div>Loading products...</div>;
  if (error) return <div>Error fetching products: {error.message}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Products</h1>
        <Button onClick={handleAddProduct}>
          <Plus className="inline-block mr-2" size={20} />
          Add Product
        </Button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data?.data.map((product) => (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {product.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.subcategory?.category?.name} &gt;{" "}
                    {product.subcategory?.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ৳{product.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.stockQuantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        product.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {product.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEditProduct(product)}
                      className="text-emerald-600 hover:text-emerald-900 mr-4"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? "Edit Product" : "Add New Product"}
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
