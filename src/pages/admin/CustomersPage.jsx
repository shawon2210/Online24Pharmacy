import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Eye, Search } from "lucide-react";
import { useDebounce } from "../../hooks/useDebounce";

// Reusable components
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

// API Functions
const fetchCustomers = ({ queryKey }) => {
  const [_key, { page, limit, search }] = queryKey;
  const params = new URLSearchParams({ page, limit, search });
  return axios
    .get(`${API_URL}/api/admin/customers?${params.toString()}`)
    .then((res) => res.data);
};
const fetchCustomerDetails = (customerId) =>
  axios
    .get(`${API_URL}/api/admin/customers/${customerId}`)
    .then((res) => res.data);

const CustomerDetailModal = ({ customerId, onClose }) => {
  const {
    data: customer,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["adminCustomerDetail", customerId],
    queryFn: () => fetchCustomerDetails(customerId),
    enabled: !!customerId,
  });

  if (isLoading)
    return (
      <Modal isOpen={true} onClose={onClose} title="Loading...">
        <div className="text-center p-8">Loading customer details...</div>
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
  if (!customer) return null;

  return (
    <Modal
      isOpen={!!customerId}
      onClose={onClose}
      title={`Customer: ${customer.firstName} ${customer.lastName}`}
    >
      <div className="space-y-6">
        <div>
          <h3 className="font-bold text-lg mb-2">Profile</h3>
          <p>
            <strong>Email:</strong> {customer.email}
          </p>
          <p>
            <strong>Phone:</strong> {customer.phone}
          </p>
          <p>
            <strong>Member Since:</strong>{" "}
            {new Date(customer.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div>
          <h3 className="font-bold text-lg mb-2">Recent Orders (Last 10)</h3>
          <ul className="divide-y divide-gray-200">
            {customer.orders.map((order) => (
              <li key={order.id} className="py-1">
                {order.orderNumber} - ৳
                {parseFloat(order.totalAmount).toFixed(2)} ({order.status})
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-lg mb-2">
            Recent Prescriptions (Last 10)
          </h3>
          <ul className="divide-y divide-gray-200">
            {customer.prescriptions.map((p) => (
              <li key={p.id} className="py-1">
                {p.referenceNumber} ({p.status})
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Modal>
  );
};

const AdminCustomersPage = () => {
  const [filters, setFilters] = useState({ page: 1, limit: 15, search: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFilters((prev) => ({ ...prev, page: 1, search: debouncedSearch }));
  }, [debouncedSearch]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["adminCustomers", filters],
    queryFn: fetchCustomers,
    keepPreviousData: true,
  });

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold">View Customers</h1>
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search by name, email, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border rounded-md w-full md:w-auto"
          />
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Member Since
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Orders
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="text-center py-4">
                    Loading customers...
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-red-500">
                    Failed to load customers.
                  </td>
                </tr>
              ) : (
                data?.data.map((customer) => (
                  <tr key={customer.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {customer.firstName} {customer.lastName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {customer.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(customer.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {customer._count.orders}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => setSelectedCustomerId(customer.id)}
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
              disabled={!data || filters.page <= 1}
            >
              Previous
            </Button>
            <Button
              onClick={() => handlePageChange(filters.page + 1)}
              disabled={!data || filters.page >= data.pagination.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {selectedCustomerId && (
        <CustomerDetailModal
          customerId={selectedCustomerId}
          onClose={() => setSelectedCustomerId(null)}
        />
      )}
    </div>
  );
};

export default AdminCustomersPage;
