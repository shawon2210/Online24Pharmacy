import { useState, useEffect } from "react";
import SEOHead from "../../components/common/SEOHead";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async (searchTerm = "", page = 1) => {
    try {
      const token = localStorage.getItem("auth_token");
      const params = new URLSearchParams();
      params.append("page", page);
      params.append("limit", "50"); // Show more customers per page
      if (searchTerm) params.append("search", searchTerm);
      const res = await axios.get(`${API_URL}/api/admin/customers?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCustomers(res.data.data || []);
      setPagination(res.data.pagination);
      setCurrentPage(page);
    } catch (error) {
      console.error("Error fetching customers:", error);
      setCustomers([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (id, isActive) => {
    if (!id || typeof id !== "string") throw new Error("Invalid customer ID");
    if (!confirm(`${isActive ? "Enable" : "Disable"} this customer?`)) return;
    try {
      const token = localStorage.getItem("auth_token");
      await axios.put(
        `${API_URL}/api/admin/customers/${encodeURIComponent(id)}/status`,
        { isActive },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchCustomers(search, currentPage);
    } catch {
      alert("Failed to update customer status");
    }
  };

  const viewSessions = async (userId) => {
    try {
      const token = localStorage.getItem("auth_token");
      const res = await axios.get(
        `${API_URL}/api/admin/customers/${userId}/sessions`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSessions(res.data.sessions || []);
      setSelectedUser(userId);
    } catch {
      alert("Failed to fetch sessions");
    }
  };

  const revokeSession = async (sessionId) => {
    if (!confirm("Revoke this session?")) return;
    try {
      const token = localStorage.getItem("auth_token");
      const csrfToken = document
        .querySelector('meta[name="csrf-token"]')
        ?.getAttribute("content");
      const headers = { Authorization: `Bearer ${token}` };
      if (csrfToken) {
        headers["X-CSRF-Token"] = csrfToken;
      }
      await axios.delete(`${API_URL}/api/admin/sessions/${sessionId}`, {
        headers,
      });
      viewSessions(selectedUser);
    } catch {
      alert("Failed to revoke session");
    }
  };

  if (loading) {
    return (
      <>
        <SEOHead title="Admin - Customers" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
          <div className="bg-background shadow rounded-lg p-6">
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading customers...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (customers.length === 0) {
    return (
      <>
        <SEOHead title="Admin - Customers" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
          <div className="bg-background shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-foreground">Customers</h1>
              <p className="text-sm text-muted-foreground">
                Manage customer accounts and sessions
              </p>
            </div>
            <div className="text-center py-8">
              <p className="text-muted-foreground">No customers found.</p>
              <button
                onClick={() => fetchCustomers()}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEOHead title="Admin - Customers" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        <div className="bg-background shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-foreground">Customers</h1>
            <p className="text-sm text-muted-foreground">
              Manage customer accounts and sessions
            </p>
          </div>

          <div className="mb-4">
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={(e) =>
                e.key === "Enter" &&
                (() => {
                  setCurrentPage(1);
                  fetchCustomers(search, 1);
                })()
              }
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => {
                setCurrentPage(1);
                fetchCustomers(search, 1);
              }}
              className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Search
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-background">
                <tr>
                  <th className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                    Name
                  </th>
                  <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                    Email
                  </th>
                  <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                    Phone
                  </th>
                  <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                    Orders
                  </th>
                  <th className="hidden xl:table-cell px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                    Last Login
                  </th>
                  <th className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                    Status
                  </th>
                  <th className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-background divide-y divide-gray-200">
                {customers.map((c) => (
                  <tr key={c.id}>
                    <td className="px-2 sm:px-6 py-4 text-sm text-foreground">
                      <div>
                        <div className="font-medium">
                          {c.firstName} {c.lastName}
                        </div>
                        <div className="sm:hidden text-xs text-muted-foreground mt-1">
                          {c.email}
                        </div>
                        <div className="md:hidden text-xs text-muted-foreground sm:mt-1">
                          {c.phone || "N/A"}
                        </div>
                      </div>
                    </td>
                    <td className="hidden sm:table-cell px-6 py-4 text-sm text-foreground">
                      {c.email}
                    </td>
                    <td className="hidden md:table-cell px-6 py-4 text-sm text-foreground">
                      {c.phone || "N/A"}
                    </td>
                    <td className="hidden lg:table-cell px-6 py-4 text-sm text-foreground">
                      {c._count.orders}
                    </td>
                    <td className="hidden xl:table-cell px-6 py-4 text-sm text-foreground">
                      {c.lastLoginAt
                        ? new Date(c.lastLoginAt).toLocaleDateString()
                        : "Never"}
                    </td>
                    <td className="px-2 sm:px-6 py-4 text-sm">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          c.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {c.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-2 sm:px-6 py-4 text-sm space-x-1 sm:space-x-2">
                      {c.isActive ? (
                        <button
                          onClick={() => toggleUserStatus(c.id, false)}
                          className="text-red-600 hover:text-red-900 text-xs sm:text-sm"
                        >
                          Disable
                        </button>
                      ) : (
                        <button
                          onClick={() => toggleUserStatus(c.id, true)}
                          className="text-green-600 hover:text-green-900 text-xs sm:text-sm"
                        >
                          Enable
                        </button>
                      )}
                      <button
                        onClick={() => viewSessions(c.id)}
                        className="text-blue-600 hover:text-blue-900 text-xs sm:text-sm"
                      >
                        Sessions
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {pagination && pagination.totalPages > 1 && (
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-muted-foreground text-center sm:text-left">
                Showing {customers.length} of {pagination.totalItems} customers
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => fetchCustomers(search, currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>

                <span className="text-sm text-muted-foreground px-2">
                  Page {currentPage} of {pagination.totalPages}
                </span>

                <button
                  onClick={() => fetchCustomers(search, currentPage + 1)}
                  disabled={currentPage === pagination.totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {selectedUser && (
            <div className="mt-8 bg-background p-6 rounded-lg">
              <h2 className="text-xl font-bold text-foreground mb-4">
                User Sessions
              </h2>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">
                      IP Address
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">
                      Device
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">
                      Created
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-background divide-y divide-gray-200">
                  {sessions.map((s) => (
                    <tr key={s.id}>
                      <td className="px-4 py-2 text-sm">
                        {s.ipAddress || "N/A"}
                      </td>
                      <td className="px-4 py-2 text-sm">
                        {s.userAgent?.substring(0, 30) || "N/A"}
                      </td>
                      <td className="px-4 py-2 text-sm">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            s.isRevoked
                              ? "bg-red-100 text-red-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {s.isRevoked ? "Revoked" : "Active"}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-sm">
                        {new Date(s.createdAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-2 text-sm">
                        {!s.isRevoked && (
                          <button
                            onClick={() => revokeSession(s.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Revoke
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button
                onClick={() => setSelectedUser(null)}
                className="mt-4 px-4 py-2 bg-border rounded hover:bg-border"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
