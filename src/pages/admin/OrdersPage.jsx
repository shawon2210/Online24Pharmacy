import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Eye, ChevronDown, Search } from "lucide-react";
import { useDebounce } from "../../hooks/useDebounce"; // Assuming this hook exists

// Reusable components from previous steps...
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
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
const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
];
const statusTransitions = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
  REFUNDED: [],
};

// API Functions
const fetchOrders = ({ queryKey }) => {
  const [_key, { page, limit, status, search }] = queryKey;
  const params = new URLSearchParams({ page, limit, status, search });
  return axios
    .get(`${API_URL}/api/admin/orders?${params.toString()}`)
    .then((res) => res.data);
};
const fetchOrderDetails = (orderId) =>
  axios.get(`${API_URL}/api/admin/orders/${orderId}`).then((res) => res.data);
const updateOrderStatus = ({ id, status }) =>
  axios.put(`${API_URL}/api/admin/orders/${id}/status`, { status });

const OrderStatusBadge = ({ status }) => {
  const statusClasses = {
    PENDING: "bg-yellow-100 text-yellow-800",
    CONFIRMED: "bg-blue-100 text-blue-800",
    PROCESSING: "bg-indigo-100 text-indigo-800",
    SHIPPED: "bg-purple-100 text-purple-800",
    DELIVERED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
    REFUNDED: "bg-gray-100 text-gray-800",
  };
  return (
    <span
      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
        statusClasses[status] || "bg-gray-100"
      }`}
    >
      {status}
    </span>
  );
};

const OrderDetailModal = ({ orderId, onClose }) => {
  const queryClient = useQueryClient();
  const {
    data: order,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["adminOrderDetail", orderId],
    queryFn: () => fetchOrderDetails(orderId),
    enabled: !!orderId,
  });

  const { mutate: updateStatusMutation, isPending } = useMutation({
    mutationFn: updateOrderStatus,
    onSuccess: () => {
      toast.success("Status updated!");
      queryClient.invalidateQueries(["adminOrders"]);
      queryClient.invalidateQueries(["adminOrderDetail", orderId]);
    },
    onError: (err) =>
      toast.error(err.response?.data?.error || "Update failed."),
  });

  if (isLoading)
    return (
      <Modal isOpen={true} onClose={onClose} title="Loading...">
        <div className="text-center p-8">Loading order details...</div>
      </Modal>
    );
  if (error)
    return (
      <Modal isOpen={true} onClose={onClose} title="Error">
        <div className="text-center p-8 text-red-500">
          Error: {error.message}
        </div>
      </Modal>
    );
  if (!order) return null;

  const allowedTransitions = statusTransitions[order.status] || [];

  return (
    <Modal
      isOpen={!!orderId}
      onClose={onClose}
      title={`Order #${order.orderNumber}`}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div>
            <h3 className="font-bold text-lg">Items</h3>
            <ul className="divide-y divide-gray-200 mt-2">
              {order.orderItems.map((item) => (
                <li key={item.id} className="py-2 flex justify-between">
                  <span>
                    {item.product.name} x <strong>{item.quantity}</strong>
                  </span>
                  <span>৳{parseFloat(item.totalPrice).toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="border-t pt-4">
            <p className="text-right">
              <strong>Subtotal:</strong> ৳
              {parseFloat(order.totalAmount - order.shippingCost).toFixed(2)}
            </p>
            <p className="text-right">
              <strong>Shipping:</strong> ৳
              {parseFloat(order.shippingCost).toFixed(2)}
            </p>
            <p className="text-right text-xl font-bold">
              <strong>Total:</strong> ৳
              {parseFloat(order.totalAmount).toFixed(2)}
            </p>
          </div>
        </div>
        <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
          <div>
            <h3 className="font-bold text-lg">Customer Details</h3>
            <p>
              {order.user.firstName} {order.user.lastName}
            </p>
            <p>{order.user.email}</p>
            <p>{order.user.phone}</p>
          </div>
          <div>
            <h3 className="font-bold text-lg">Shipping Address</h3>
            <p>{JSON.parse(order.shippingAddress).addressLine1}</p>
            <p>
              {JSON.parse(order.shippingAddress).city},{" "}
              {JSON.parse(order.shippingAddress).area}
            </p>
          </div>
          <div>
            <h3 className="font-bold text-lg">
              Status: <OrderStatusBadge status={order.status} />
            </h3>
            <select
              className="mt-2 w-full rounded-md border-gray-300"
              onChange={(e) =>
                updateStatusMutation({ id: order.id, status: e.target.value })
              }
              value={order.status}
              disabled={isPending || allowedTransitions.length === 0}
            >
              <option value={order.status} disabled>
                {order.status}
              </option>
              {allowedTransitions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </Modal>
  );
};

const AdminOrdersPage = () => {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 15,
    status: "",
    search: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFilters((prev) => ({ ...prev, page: 1, search: debouncedSearch }));
  }, [debouncedSearch]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["adminOrders", filters],
    queryFn: fetchOrders,
    keepPreviousData: true,
  });

  const handleFilterChange = (e) => {
    setFilters((prev) => ({ ...prev, page: 1, status: e.target.value }));
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold">Manage Orders</h1>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search by Order #, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-md"
            />
          </div>
          <select
            onChange={handleFilterChange}
            value={filters.status}
            className="border rounded-md py-2"
          >
            <option value="">All Statuses</option>
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Order #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="text-center py-4">
                    Loading orders...
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-red-500">
                    Failed to load orders.
                  </td>
                </tr>
              ) : (
                data?.data.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.orderNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ৳{parseFloat(order.totalAmount).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => setSelectedOrderId(order.id)}
                        className="text-emerald-600 hover:text-emerald-900"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 flex justify-between items-center">
          <span className="text-sm text-gray-700">
            Page {data?.pagination.currentPage} of {data?.pagination.totalPages}
          </span>
          <div className="space-x-2">
            <Button
              onClick={() => handlePageChange(filters.page - 1)}
              disabled={filters.page <= 1}
            >
              Previous
            </Button>
            <Button
              onClick={() => handlePageChange(filters.page + 1)}
              disabled={filters.page >= data?.pagination.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {selectedOrderId && (
        <OrderDetailModal
          orderId={selectedOrderId}
          onClose={() => setSelectedOrderId(null)}
        />
      )}
    </div>
  );
};

export default AdminOrdersPage;
