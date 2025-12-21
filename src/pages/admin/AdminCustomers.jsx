import { useState, useEffect } from "react";
import SEOHead from "../../components/common/SEOHead";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const res = await axios.get(`${API_URL}/api/admin/customers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCustomers(res.data.customers || []);
    } catch {
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (id, isActive) => {
    if (!confirm(`${isActive ? "Enable" : "Disable"} this customer?`)) return;
    try {
      const token = localStorage.getItem("auth_token");
      await axios.put(
        `${API_URL}/api/admin/customers/${id}/status`,
        { isActive },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchCustomers();
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
      await axios.delete(`${API_URL}/api/admin/sessions/${sessionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      viewSessions(selectedUser);
    } catch {
      alert("Failed to revoke session");
    }
  };

  if (loading)
    return <div className="text-center py-8">Loading customers...</div>;

  return (
    <>
      <SEOHead title="Admin - Customers" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Customers</h1>
            <p className="text-sm text-gray-500">
              Manage customer accounts and sessions
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {customers.map((c) => (
                  <tr key={c.id}>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {c.firstName} {c.lastName}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {c.email}
                    </td>
                    <td className="px-6 py-4 text-sm space-x-2">
                      {c.isActive ? (
                        <button
                          onClick={() => toggleUserStatus(c.id, false)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Disable
                        </button>
                      ) : (
                        <button
                          onClick={() => toggleUserStatus(c.id, true)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Enable
                        </button>
                      )}
                      <button
                        onClick={() => viewSessions(c.id)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Sessions
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {selectedUser && (
            <div className="mt-8 bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-bold mb-4">User Sessions</h2>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                      IP Address
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                      Device
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                      Status
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                      Created
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
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
                className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
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
