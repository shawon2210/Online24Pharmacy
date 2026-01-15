import { useState, useEffect } from "react";
import SEOHead from "../../components/common/SEOHead";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function AdminPrescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchPrescriptions(search, statusFilter, currentPage);
  }, []);

  const fetchPrescriptions = async (
    searchTerm = "",
    status = "PENDING",
    page = 1
  ) => {
    try {
      const token = localStorage.getItem("auth_token");
      const params = new URLSearchParams();
      params.append("page", page);
      params.append("limit", "50"); // Show more prescriptions per page
      if (status && status !== "ALL") params.append("status", status);
      if (searchTerm) params.append("search", searchTerm);
      const res = await axios.get(
        `${API_URL}/api/admin/prescriptions?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setPrescriptions(res.data.data || []);
      setPagination(res.data.pagination);
      setCurrentPage(page);
    } catch (error) {
      console.error("Error fetching prescriptions:", error);
      setPrescriptions([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status, adminNotes = "") => {
    if (!id || typeof id !== "string")
      throw new Error("Invalid prescription ID");
    try {
      const token = localStorage.getItem("auth_token");
      const endpoint = status === "APPROVED" ? "approve" : "reject";
      const url = `${API_URL}/api/admin/prescriptions/${encodeURIComponent(
        id
      )}/${endpoint}`;

      const payload =
        status === "REJECTED"
          ? { notes: adminNotes || "Rejected by admin" }
          : {};

      await axios.post(url, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert(`Prescription ${status.toLowerCase()} successfully`);
      fetchPrescriptions(search, statusFilter, currentPage);
    } catch (error) {
      console.error("Failed to update prescription:", error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        alert("Session expired. Please login again.");
      } else {
        alert("Failed to update prescription status");
      }
    }
  };

  if (loading) {
    return (
      <>
        <SEOHead title="Admin - Prescriptions" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
          <div className="bg-background shadow rounded-lg p-6">
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-muted-foreground">
                Loading prescriptions...
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (prescriptions.length === 0) {
    return (
      <>
        <SEOHead title="Admin - Prescriptions" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
          <div className="bg-background shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-foreground">
                Prescriptions
              </h1>
              <p className="text-sm text-muted-foreground">
                Manage prescription reviews and approvals
              </p>
            </div>
            <div className="text-center py-8">
              <p className="text-muted-foreground">No prescriptions found.</p>
              <button
                onClick={() => fetchPrescriptions(search, statusFilter, 1)}
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
      <SEOHead title="Admin - Prescriptions" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        <div className="bg-background shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-foreground">
              Prescriptions
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage prescription reviews and approvals
            </p>
          </div>

          {/* Filters and Search */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by reference, patient name, or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" &&
                  (() => {
                    setCurrentPage(1);
                    fetchPrescriptions(search, statusFilter, 1);
                  })()
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                  fetchPrescriptions(search, e.target.value, 1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
            <button
              onClick={() => {
                setCurrentPage(1);
                fetchPrescriptions(search, statusFilter, 1);
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
                    Reference
                  </th>
                  <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                    Patient
                  </th>
                  <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                    Customer
                  </th>
                  <th className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                    Status
                  </th>
                  <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                    Date
                  </th>
                  <th className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-background divide-y divide-gray-200">
                {prescriptions.map((rx) => (
                  <tr key={rx.id}>
                    <td className="px-2 sm:px-6 py-4 text-sm text-foreground">
                      <div>
                        <div className="font-medium">{rx.referenceNumber}</div>
                        <div className="sm:hidden text-xs text-muted-foreground mt-1">
                          {rx.patientName ||
                            (rx.user
                              ? `${rx.user.firstName} ${rx.user.lastName}`
                              : "N/A")}
                        </div>
                      </div>
                    </td>
                    <td className="hidden sm:table-cell px-6 py-4 text-sm text-foreground">
                      {rx.patientName ||
                        (rx.user
                          ? `${rx.user.firstName} ${rx.user.lastName}`
                          : "N/A")}
                    </td>
                    <td className="hidden md:table-cell px-6 py-4 text-sm text-foreground">
                      {rx.user ? (
                        <div>
                          <div>
                            {rx.user.firstName} {rx.user.lastName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {rx.user.email}
                          </div>
                        </div>
                      ) : (
                        "N/A"
                      )}
                    </td>
                    <td className="px-2 sm:px-6 py-4 text-sm">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          rx.status === "APPROVED"
                            ? "bg-green-100 text-green-800"
                            : rx.status === "REJECTED"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {rx.status}
                      </span>
                    </td>
                    <td className="hidden lg:table-cell px-6 py-4 text-sm text-foreground">
                      {new Date(rx.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-2 sm:px-6 py-4 text-sm space-x-1 sm:space-x-2">
                      {rx.status !== "APPROVED" && (
                        <button
                          onClick={() => updateStatus(rx.id, "APPROVED")}
                          className="text-green-600 hover:text-green-900 text-xs sm:text-sm"
                        >
                          Approve
                        </button>
                      )}
                      {rx.status !== "REJECTED" && (
                        <button
                          onClick={() => {
                            const notes = prompt("Rejection notes:");
                            if (notes) updateStatus(rx.id, "REJECTED", notes);
                          }}
                          className="text-red-600 hover:text-red-900 text-xs sm:text-sm"
                        >
                          Reject
                        </button>
                      )}
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
                Showing {prescriptions.length} of {pagination.totalItems}{" "}
                prescriptions
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() =>
                    fetchPrescriptions(search, statusFilter, currentPage - 1)
                  }
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>

                <span className="text-sm text-muted-foreground px-2">
                  Page {currentPage} of {pagination.totalPages}
                </span>

                <button
                  onClick={() =>
                    fetchPrescriptions(search, statusFilter, currentPage + 1)
                  }
                  disabled={currentPage === pagination.totalPages}
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
