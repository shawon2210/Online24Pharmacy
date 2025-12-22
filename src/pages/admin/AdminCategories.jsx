import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

export default function AdminCategories() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const queryClient = useQueryClient();

  const { data: categoriesData, isLoading } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/admin/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch categories");
      const data = await response.json();
      return data.categories || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (category) => {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/admin/categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(category),
      });
      if (!response.ok) throw new Error("Failed to create category");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-categories"]);
      queryClient.invalidateQueries(["categories"]);
      toast.success("Category created successfully");
      setIsModalOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...category }) => {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/admin/categories/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(category),
      });
      if (!response.ok) throw new Error("Failed to update category");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-categories"]);
      queryClient.invalidateQueries(["categories"]);
      toast.success("Category updated successfully");
      setIsModalOpen(false);
      setEditingCategory(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/admin/categories/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to delete category");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-categories"]);
      queryClient.invalidateQueries(["categories"]);
      toast.success("Category deleted successfully");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const category = {
      name: formData.get("name"),
      slug: formData.get("slug"),
      icon: formData.get("icon"),
      image: formData.get("image"),
      color: formData.get("color"),
      description: formData.get("description"),
      subcategories: formData.get("subcategories").split(",").map(s => s.trim()),
      brands: formData.get("brands").split(",").map(s => s.trim()),
      productTypes: formData.get("productTypes").split(",").map(s => s.trim()),
      variants: formData.get("variants").split(",").map(s => s.trim()),
    };

    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, ...category });
    } else {
      createMutation.mutate(category);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Categories Management</h1>
        <button
          onClick={() => {
            setEditingCategory(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
        >
          <PlusIcon className="w-5 h-5" />
          Add Category
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoriesData?.map((category) => (
            <div key={category.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{category.icon}</span>
                  <div>
                    <h3 className="font-bold text-lg">{category.name}</h3>
                    <p className="text-sm text-gray-500">/{category.slug}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingCategory(category);
                      setIsModalOpen(true);
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm("Delete this category?")) {
                        deleteMutation.mutate(category.id);
                      }
                    }}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-3">{category.description}</p>
              <div className="space-y-2 text-xs">
                <div><strong>Brands:</strong> {category.brands?.join(", ")}</div>
                <div><strong>Types:</strong> {category.productTypes?.join(", ")}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-xl font-bold mb-4">
              {editingCategory ? "Edit Category" : "Add Category"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input name="name" defaultValue={editingCategory?.name} placeholder="Name" required className="border rounded px-3 py-2" />
                <input name="slug" defaultValue={editingCategory?.slug} placeholder="slug" required className="border rounded px-3 py-2" />
                <input name="icon" defaultValue={editingCategory?.icon} placeholder="Icon (emoji)" required className="border rounded px-3 py-2" />
                <input name="color" defaultValue={editingCategory?.color} placeholder="Color (e.g., from-blue-500 to-cyan-600)" required className="border rounded px-3 py-2" />
              </div>
              <input name="image" defaultValue={editingCategory?.image} placeholder="Image URL" required className="border rounded px-3 py-2 w-full" />
              <textarea name="description" defaultValue={editingCategory?.description} placeholder="Description" required className="border rounded px-3 py-2 w-full" rows="2" />
              <input name="subcategories" defaultValue={editingCategory?.subcategories?.join(", ")} placeholder="Subcategories (comma-separated)" required className="border rounded px-3 py-2 w-full" />
              <input name="brands" defaultValue={editingCategory?.brands?.join(", ")} placeholder="Brands (comma-separated)" required className="border rounded px-3 py-2 w-full" />
              <input name="productTypes" defaultValue={editingCategory?.productTypes?.join(", ")} placeholder="Product Types (comma-separated)" required className="border rounded px-3 py-2 w-full" />
              <input name="variants" defaultValue={editingCategory?.variants?.join(", ")} placeholder="Variants (comma-separated)" required className="border rounded px-3 py-2 w-full" />
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => { setIsModalOpen(false); setEditingCategory(null); }} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
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
