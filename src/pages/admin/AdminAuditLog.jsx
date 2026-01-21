import { useState, useEffect } from "react";
import SEOHead from "../../components/common/SEOHead";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function AdminAuditLog() {
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchAuditLogs(search, actionFilter, currentPage);
  }, [search, actionFilter, currentPage]);

  const fetchAuditLogs = async (searchTerm = "", action = "", page = 1) => {
    try {
      const token = localStorage.getItem("auth_token");
      const params = new URLSearchParams();
      params.append("page", page);
      params.append("limit", "50"); // Show more logs per page
      if (action) params.append("action", action);
      if (searchTerm) params.append("search", searchTerm);
      const res = await axios.get(`${API_URL}/api/admin/audit-logs?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAuditLogs(res.data.data || []);
      setPagination(res.data.pagination);
      setCurrentPage(page);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      setAuditLogs([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <SEOHead title="Admin - Audit Log" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
          <div className="bg-background shadow rounded-lg p-6">
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-muted-foreground">
                Loading audit logs...
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (auditLogs.length === 0) {
    return (
      <>
        <SEOHead title="Admin - Audit Log" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
          <div className="bg-background shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-foreground">Audit Log</h1>
              <p className="text-sm text-muted-foreground">
                View admin actions and system events
              </p>
            </div>
            <div className="text-center py-8">
              <p className="text-muted-foreground">No audit logs found.</p>
              <button
                onClick={() => fetchAuditLogs(search, actionFilter, 1)}
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
      <SEOHead title="Admin - Audit Log" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        <div className="bg-background shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-foreground">Audit Log</h1>
            <p className="text-sm text-muted-foreground">
              View admin actions and system events
            </p>
          </div>

          {/* Filters and Search */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by action, target, admin email, or IP..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" &&
                  (() => {
                    setCurrentPage(1);
                    fetchAuditLogs(search, actionFilter, 1);
                  })()
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="sm:w-48">
              <input
                type="text"
                placeholder="Filter by action..."
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" &&
                  (() => {
                    setCurrentPage(1);
                    fetchAuditLogs(search, actionFilter, 1);
                  })()
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={() => {
                setCurrentPage(1);
                fetchAuditLogs(search, actionFilter, 1);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Search
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-background">
                <tr>
                  <th className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                    Action
                  </th>
                  <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                    Target
                  </th>
                  <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                    Admin
                  </th>
                  <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                    IP Address
                  </th>
                  <th className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                    Timestamp
                  </th>
                </tr>
              </thead>
              <tbody className="bg-background divide-y divide-gray-200">
                {auditLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="px-2 sm:px-6 py-4 text-sm text-foreground">
                      <div>
                        <div className="font-medium">{log.action}</div>
                        <div className="sm:hidden text-xs text-muted-foreground mt-1">
                          {log.targetType} - {log.targetId?.substring(0, 8)}
                        </div>
                      </div>
                    </td>
                    <td className="hidden sm:table-cell px-6 py-4 text-sm text-foreground">
                      {log.targetType} -{" "}
                      {log.targetId?.substring(0, 8) || "N/A"}
                    </td>
                    <td className="hidden md:table-cell px-6 py-4 text-sm text-foreground">
                      {log.admin
                        ? `${log.admin.firstName} ${log.admin.lastName} (${log.admin.email})`
                        : "Unknown"}
                    </td>
                    <td className="hidden lg:table-cell px-6 py-4 text-sm text-foreground">
                      {log.ipAddress || "N/A"}
                    </td>
                    <td className="px-2 sm:px-6 py-4 text-sm text-foreground">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {pagination && pagination.pages > 1 && (
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-muted-foreground text-center sm:text-left">
                Showing {auditLogs.length} of {pagination.total} audit logs
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() =>
                    fetchAuditLogs(search, actionFilter, currentPage - 1)
                  }
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>

                <span className="text-sm text-muted-foreground px-2">
                  Page {currentPage} of {pagination.pages}
                </span>

                <button
                  onClick={() =>
                    fetchAuditLogs(search, actionFilter, currentPage + 1)
                  }
                  disabled={currentPage === pagination.pages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
