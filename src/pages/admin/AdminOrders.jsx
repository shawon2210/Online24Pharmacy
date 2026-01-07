import { useState, useEffect } from "react";
import SEOHead from "../../components/common/SEOHead";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        alert("Please login as admin");
        return;
      }
      const response = await axios.get(`${API_URL}/api/admin/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        alert("Session expired or unauthorized. Please login again.");
      }
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    if (!orderId || typeof orderId !== 'string') throw new Error('Invalid order ID');
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        alert("Please login as admin");
        return;
      }
      await axios.put(
        `${API_URL}/api/admin/orders/${encodeURIComponent(orderId)}/status`,
        { status },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      await axios
        .post(
          `${API_URL}/api/admin/audit-log`,
          {
            action: "UPDATE_ORDER_STATUS",
            targetType: "ORDER",
            targetId: orderId,
            metadata: JSON.stringify({ status }),
          },
          { headers: { Authorization: `Bearer ${token}` } }
        )
        .catch(() => {});
      fetchOrders();
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        alert("Session expired. Please login again.");
      } else {
        alert("Failed to update order status");
      }
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading orders...</div>;
  }

  return (
    <>
      <SEOHead title="Admin - Orders" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        <div className="bg-background shadow rounded-lg">
          <div className="px-6 py-4 border-b border-border">
            <h1 className="text-2xl font-bold text-foreground">Orders</h1>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-background">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-background0 uppercase tracking-wider">
                    Order Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-background0 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-background0 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-background0 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-background0 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-background divide-y divide-gray-200">
                {!orders || orders.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-8 text-center text-background0"
                    >
                      No orders found. Orders from customers will appear here.
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-foreground">
                            #{order.orderNumber || order.id}
                          </div>
                          <div className="text-sm text-background0">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-foreground">
                          {order.user?.firstName || "Unknown"}{" "}
                          {order.user?.lastName || "User"}
                        </div>
                        <div className="text-sm text-background0">
                          {order.user?.email || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                        ৳{Number(order.totalAmount || 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            order.status === "delivered"
                              ? "bg-green-100 text-green-800"
                              : order.status === "confirmed"
                              ? "bg-blue-100 text-blue-800"
                              : order.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <select
                          value={order.status}
                          onChange={(e) =>
                            updateOrderStatus(order.id, e.target.value)
                          }
                          className="border border-border rounded px-2 py-1"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
