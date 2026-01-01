import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Plus, GripVertical, Edit, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";

// Reusable components
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 text-2xl"
          >
            &times;
          </button>
        </div>
        <div className="p-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

const Button = ({ children, onClick, className = "", ...props }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-md font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition disabled:bg-gray-400 ${className}`}
    {...props}
  >
    {children}
  </button>
);

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// API Functions
const fetchCategories = () =>
  axios.get(`${API_URL}/api/admin/categories`).then((res) => res.data);
const reorderCategories = (categories) =>
  axios.put(`${API_URL}/api/admin/categories/reorder`, { categories });
const createCategory = (data) =>
  axios.post(`${API_URL}/api/admin/categories`, data);
const updateCategory = ({ id, ...data }) =>
  axios.put(`${API_URL}/api/admin/categories/${id}`, data);
const deleteCategory = (id) =>
  axios.delete(`${API_URL}/api/admin/categories/${id}`);
const createSubcategory = (data) =>
  axios.post(`${API_URL}/api/admin/categories/subcategory`, data);
const updateSubcategory = ({ id, ...data }) =>
  axios.put(`${API_URL}/api/admin/categories/subcategory/${id}`, data);
const deleteSubcategory = (id) =>
  axios.delete(`${API_URL}/api/admin/categories/subcategory/${id}`);

// Form Component
const CategoryForm = ({ item, type, onCancel, onSuccess }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: item?.name || "",
      slug: item?.slug || "",
      isActive: item?.isActive !== false,
      categoryId: type === "subcategory" ? item?.categoryId : undefined,
    },
  });

  const queryClient = useQueryClient();
  const { mutate: createCatMutate, isPending: isCreatingCat } = useMutation({
    mutationFn: createCategory,
  });
  const { mutate: updateCatMutate, isPending: isUpdatingCat } = useMutation({
    mutationFn: updateCategory,
  });
  const { mutate: createSubcatMutate, isPending: isCreatingSub } = useMutation({
    mutationFn: createSubcategory,
  });
  const { mutate: updateSubcatMutate, isPending: isUpdatingSub } = useMutation({
    mutationFn: updateSubcategory,
  });

  const isPending =
    isCreatingCat || isUpdatingCat || isCreatingSub || isUpdatingSub;

  const onSubmit = (data) => {
    const mutationFn = item
      ? type === "category"
        ? updateCatMutate
        : updateSubcatMutate
      : type === "category"
      ? createCatMutate
      : createSubcatMutate;

    const payload = item ? { id: item.id, ...data } : data;

    mutationFn(payload, {
      onSuccess: () => {
        toast.success(`Successfully ${item ? "updated" : "created"}!`);
        queryClient.invalidateQueries(["adminCategories"]);
        onSuccess();
      },
      onError: (err) =>
        toast.error(err.response?.data?.error || "An error occurred."),
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <input type="hidden" {...register("categoryId")} />
      <div>
        <label className="block text-sm font-medium text-gray-700">Name</label>
        <input
          {...register("name", { required: "Name is required" })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
        {errors.name && (
          <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Slug (e.g., surgical-gloves)
        </label>
        <input
          {...register("slug")}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
      </div>
      <div className="flex items-center">
        <input
          type="checkbox"
          {...register("isActive")}
          className="h-4 w-4 rounded border-gray-300 text-emerald-600"
        />
        <label className="ml-2 block text-sm text-gray-900">Active</label>
      </div>
      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          onClick={onCancel}
          className="bg-gray-300 text-gray-800 hover:bg-gray-400"
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save"}
        </Button>
      </div>
    </form>
  );
};

// Sortable Item Component
const SortableItem = ({ id, item, type, onEdit, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : "auto",
  };

  const itemClasses =
    type === "category"
      ? "bg-white p-4 rounded-lg shadow"
      : "bg-gray-50 p-3 rounded-md border";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between ${itemClasses}`}
    >
      <div className="flex items-center">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab p-2 text-gray-500 touch-none"
        >
          <GripVertical size={20} />
        </button>
        <span className="font-medium">{item.name}</span>
        {!item.isActive && (
          <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
            Inactive
          </span>
        )}
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onEdit(item, type)}
          className="text-blue-600 hover:text-blue-800"
        >
          <Edit size={18} />
        </button>
        <button
          onClick={() => onDelete(item, type)}
          className="text-red-600 hover:text-red-800"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};

// Main Page Component
const AdminCategoriesPage = () => {
  const queryClient = useQueryClient();
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null); // { item, type }

  const { data: initialData, isLoading } = useQuery({
    queryKey: ["adminCategories"],
    queryFn: fetchCategories,
  });

  useEffect(() => {
    if (initialData) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCategories(initialData);
    }
  }, [initialData]);

  const { mutate: reorderMutation } = useMutation({
    mutationFn: reorderCategories,
    onSuccess: () => toast.success("Order updated!"),
    onError: () => toast.error("Failed to update order."),
  });
  const { mutate: deleteCatMutation } = useMutation({
    mutationFn: deleteCategory,
  });
  const { mutate: deleteSubcatMutation } = useMutation({
    mutationFn: deleteSubcategory,
  });

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDelete = (item, type) => {
    if (window.confirm(`Are you sure you want to deactivate "${item.name}"?`)) {
      const mutationFn =
        type === "category" ? deleteCatMutation : deleteSubcatMutation;
      mutationFn(item.id, {
        onSuccess: () => {
          toast.success("Deactivated successfully.");
          queryClient.invalidateQueries(["adminCategories"]);
        },
        onError: () => toast.error("Failed to deactivate."),
      });
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setCategories((prev) => {
      let newCategories = JSON.parse(JSON.stringify(prev));

      const activeIsCategory = prev.some((c) => c.id === active.id);
      const overIsCategory = prev.some((c) => c.id === over.id);

      if (activeIsCategory && overIsCategory) {
        // Reordering categories
        const oldIndex = newCategories.findIndex((c) => c.id === active.id);
        const newIndex = newCategories.findIndex((c) => c.id === over.id);
        newCategories = arrayMove(newCategories, oldIndex, newIndex);
      } else if (!activeIsCategory && !overIsCategory) {
        // Reordering subcategories within or between categories
        const activeCat = newCategories.find((c) =>
          c.subcategories.some((s) => s.id === active.id)
        );
        const overCat = newCategories.find((c) =>
          c.subcategories.some((s) => s.id === over.id)
        );

        const activeCatIndex = newCategories.findIndex(
          (c) => c.id === activeCat.id
        );
        const overCatIndex = newCategories.findIndex(
          (c) => c.id === overCat.id
        );

        const activeSubIndex = activeCat.subcategories.findIndex(
          (s) => s.id === active.id
        );
        const overSubIndex = overCat.subcategories.findIndex(
          (s) => s.id === over.id
        );

        const [movedItem] = newCategories[activeCatIndex].subcategories.splice(
          activeSubIndex,
          1
        );
        newCategories[overCatIndex].subcategories.splice(
          overSubIndex,
          0,
          movedItem
        );
      }

      reorderMutation(newCategories);
      return newCategories;
    });
  };

  const handleOpenModal = (item = null, type = "category") => {
    setEditingItem({ item, type });
    setIsModalOpen(true);
  };

  if (isLoading) return <div>Loading categories...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Categories</h1>
        <Button onClick={() => handleOpenModal(null, "category")}>
          <Plus className="inline-block mr-2" size={20} /> Add Category
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="space-y-4">
          <SortableContext
            items={categories.map((c) => c.id)}
            strategy={verticalListSortingStrategy}
          >
            {categories.map((category) => (
              <div key={category.id} className="bg-white p-4 rounded-lg shadow">
                <SortableItem
                  id={category.id}
                  item={category}
                  type="category"
                  onEdit={handleOpenModal}
                  onDelete={handleDelete}
                />
                <div className="pl-12 pt-3 space-y-2">
                  <SortableContext
                    items={category.subcategories.map((s) => s.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {category.subcategories.map((subcategory) => (
                      <SortableItem
                        key={subcategory.id}
                        id={subcategory.id}
                        item={subcategory}
                        type="subcategory"
                        onEdit={handleOpenModal}
                        onDelete={handleDelete}
                      />
                    ))}
                  </SortableContext>
                  <Button
                    onClick={() =>
                      handleOpenModal(
                        { categoryId: category.id },
                        "subcategory"
                      )
                    }
                    className="text-sm !py-1 !px-2 bg-emerald-100 !text-emerald-800 hover:bg-emerald-200"
                  >
                    <Plus size={16} className="inline-block mr-1" /> Add
                    Subcategory
                  </Button>
                </div>
              </div>
            ))}
          </SortableContext>
        </div>
      </DndContext>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`${editingItem?.item ? "Edit" : "Add"} ${
          editingItem?.type === "category" ? "Category" : "Subcategory"
        }`}
      >
        <CategoryForm
          item={editingItem?.item}
          type={editingItem?.type}
          onCancel={() => setIsModalOpen(false)}
          onSuccess={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default AdminCategoriesPage;
