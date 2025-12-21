import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ExclamationTriangleIcon, PlusIcon } from "@heroicons/react/24/outline";
import { fetchInventory, updateInventory } from "../../utils/api";
import SEOHead from "../../components/common/SEOHead";
import { useTranslation } from "react-i18next";

export default function AdminInventory() {
  const { t } = useTranslation();
  const [_showAddForm, setShowAddForm] = useState(false);
  const queryClient = useQueryClient();

  const { data: inventory } = useQuery({
    queryKey: ["inventory"],
    queryFn: fetchInventory,
  });

  const _updateMutation = useMutation({
    mutationFn: updateInventory,
    onSuccess: () => {
      queryClient.invalidateQueries(["inventory"]);
    },
  });

  const lowStockItems =
    inventory?.filter((item) => item.quantity <= item.minStockLevel) || [];

  return (
    <>
      <SEOHead
        title="Inventory Management"
        description="Admin inventory — track stock levels and batches in Online24 Pharmacy."
        url="/admin/inventory"
      />
      <div className="min-h-screen bg-gray-50 py-6 md:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              {t("adminInventory.title")}
            </h1>
            <button
              onClick={() => setShowAddForm(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <PlusIcon className="w-5 h-5" />
              <span>{t("adminInventory.updateStock")}</span>
            </button>
          </div>

          {/* Low Stock Alert */}
          {lowStockItems.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mr-2" />
                <h3 className="font-medium text-yellow-800">
                  {lowStockItems.length} items are running low on stock
                </h3>
              </div>
              <div className="mt-2 text-sm text-yellow-700">
                {lowStockItems.map((item) => item.product.name).join(", ")}
              </div>
            </div>
          )}

          {/* Inventory Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Batch
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Expiry
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {inventory?.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {item.product.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {item.product.sku}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.batchNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(item.expiryDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          item.quantity <= item.minStockLevel
                            ? "bg-red-100 text-red-800"
                            : item.quantity <= item.minStockLevel * 2
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {item.quantity <= item.minStockLevel
                          ? "Low Stock"
                          : item.quantity <= item.minStockLevel * 2
                          ? "Medium"
                          : "Good"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
