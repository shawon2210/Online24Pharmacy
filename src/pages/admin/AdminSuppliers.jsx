import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PlusIcon, BuildingOfficeIcon } from "@heroicons/react/24/outline";
import { fetchSuppliers, addSupplier, updateSupplier } from "../../utils/api";
import SEOHead from "../../components/common/SEOHead";
import { useTranslation } from "react-i18next";

export default function AdminSuppliers() {
  const { t } = useTranslation();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const queryClient = useQueryClient();

  const { data: suppliers } = useQuery({
    queryKey: ["suppliers"],
    queryFn: fetchSuppliers,
  });

  const addMutation = useMutation({
    mutationFn: addSupplier,
    onSuccess: () => {
      queryClient.invalidateQueries(["suppliers"]);
      setShowAddForm(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateSupplier,
    onSuccess: () => {
      queryClient.invalidateQueries(["suppliers"]);
      setEditingSupplier(null);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    if (editingSupplier) {
      updateMutation.mutate({ ...data, id: editingSupplier.id });
    } else {
      addMutation.mutate(data);
    }
  };

  return (
    <>
      <SEOHead
        title="Supplier Management"
        description="Admin — manage suppliers for Online24 Pharmacy."
        url="/admin/suppliers"
      />
      <div className="min-h-screen bg-background py-6 md:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-foreground">
              {t("adminSuppliers.title")}
            </h1>
            <button
              onClick={() => setShowAddForm(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <PlusIcon className="w-5 h-5" />
              <span>{t("adminSuppliers.addSupplier")}</span>
            </button>
          </div>

          {/* Suppliers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {suppliers?.map((supplier) => (
              <div
                key={supplier.id}
                className="bg-background rounded-lg shadow-md p-6"
              >
                <div className="flex items-center mb-4">
                  <BuildingOfficeIcon className="w-8 h-8 text-blue-600 mr-3" />
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {supplier.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {supplier.contactPerson}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">
                      {t("adminSuppliers.email")}:
                    </span>{" "}
                    {supplier.email}
                  </div>
                  <div>
                    <span className="font-medium">
                      {t("adminSuppliers.phone")}:
                    </span>{" "}
                    {supplier.phone}
                  </div>
                  <div>
                    <span className="font-medium">
                      {t("adminSuppliers.address")}:
                    </span>{" "}
                    {supplier.address}
                  </div>
                </div>

                <div className="mt-4 flex justify-between items-center">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      supplier.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {supplier.isActive
                      ? t("adminSuppliers.active")
                      : t("adminSuppliers.inactive")}
                  </span>
                  <button
                    onClick={() => setEditingSupplier(supplier)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    {t("adminSuppliers.edit")}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add/Edit Form Modal */}
          {(showAddForm || editingSupplier) && (
            <div className="fixed inset-0 bg-muted-foreground bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-background rounded-lg p-6 max-w-md w-full mx-4">
                <h3 className="text-lg font-semibold mb-4">
                  {editingSupplier
                    ? t("adminSuppliers.edit")
                    : t("adminSuppliers.addSupplier")}
                </h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      {t("adminSuppliers.supplierName")}
                    </label>
                    <input
                      name="name"
                      defaultValue={editingSupplier?.name}
                      className="input-field"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      {t("adminSuppliers.contactPerson")}
                    </label>
                    <input
                      name="contactPerson"
                      defaultValue={editingSupplier?.contactPerson}
                      className="input-field"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      {t("adminSuppliers.email")}
                    </label>
                    <input
                      name="email"
                      type="email"
                      defaultValue={editingSupplier?.email}
                      className="input-field"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      {t("adminSuppliers.phone")}
                    </label>
                    <input
                      name="phone"
                      defaultValue={editingSupplier?.phone}
                      className="input-field"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      {t("adminSuppliers.address")}
                    </label>
                    <textarea
                      name="address"
                      defaultValue={editingSupplier?.address}
                      className="input-field"
                      rows="3"
                      required
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      name="isActive"
                      type="checkbox"
                      defaultChecked={editingSupplier?.isActive ?? true}
                      className="mr-2"
                    />
                    <label className="text-sm font-medium text-foreground">
                      {t("adminSuppliers.status")}
                    </label>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="submit"
                      disabled={
                        addMutation.isPending || updateMutation.isPending
                      }
                      className="flex-1 btn-primary"
                    >
                      {editingSupplier
                        ? t("adminSuppliers.edit")
                        : t("adminSuppliers.addSupplier")}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddForm(false);
                        setEditingSupplier(null);
                      }}
                      className="flex-1 btn-secondary"
                    >
                      {t("adminSuppliers.delete")}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
