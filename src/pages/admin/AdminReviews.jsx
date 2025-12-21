import { useEffect, useState } from "react";
import { useAuthStore } from "../../stores/authStore";
import { useTranslation } from "react-i18next";

export default function AdminReviews() {
  const { t } = useTranslation();
  const token = useAuthStore((s) => s.token);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState(null); // review id being processed
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    rejected: 0,
    pending: 0,
    avgRating: 0,
  });
  const perPage = 10;

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [pendingRes, statsRes] = await Promise.all([
          fetch(
            `${API_URL}/api/reviews/pending?page=${page}&limit=${perPage}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          ),
          fetch(`${API_URL}/api/reviews/stats`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!pendingRes.ok) throw new Error("Failed");
        const pendingData = await pendingRes.json();
        setPending(pendingData.reviews || []);
        setTotalPages(
          Math.ceil(
            (pendingData.total || pendingData.reviews?.length || 0) / perPage
          )
        );

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }
      } catch {
        setError(t("adminReviews.loading"));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [page, perPage, token, API_URL, t]);

  const updateStatus = async (id, status) => {
    setActioning(id);
    try {
      const res = await fetch(`${API_URL}/api/reviews/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed");
      setPending(pending.filter((r) => r.id !== id));
      toast(status === "approved" ? "Review approved" : "Review rejected");
    } catch {
      toast("Action failed");
    } finally {
      setActioning(null);
    }
  };

  const toast = (msg) => {
    const t = document.createElement("div");
    t.className =
      "fixed top-6 right-6 bg-emerald-600 text-white px-5 py-3 rounded-lg shadow-xl text-sm font-semibold animate-fade-in";
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3000);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-black mb-6 bg-gradient-to-r from-emerald-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent">
        Review Moderation
      </h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="p-4 bg-white rounded-xl border-2 border-gray-200 shadow-sm">
          <div className="text-xs text-gray-600 mb-1">Total Reviews</div>
          <div className="text-2xl font-black text-gray-900">{stats.total}</div>
        </div>
        <div className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl border-2 border-emerald-200 shadow-sm">
          <div className="text-xs text-emerald-700 mb-1">Approved</div>
          <div className="text-2xl font-black text-emerald-900">
            {stats.approved}
          </div>
        </div>
        <div className="p-4 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl border-2 border-amber-200 shadow-sm">
          <div className="text-xs text-amber-700 mb-1">Pending</div>
          <div className="text-2xl font-black text-amber-900">
            {stats.pending}
          </div>
        </div>
        <div className="p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-xl border-2 border-red-200 shadow-sm">
          <div className="text-xs text-red-700 mb-1">Rejected</div>
          <div className="text-2xl font-black text-red-900">
            {stats.rejected}
          </div>
        </div>
        <div className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl border-2 border-yellow-200 shadow-sm">
          <div className="text-xs text-yellow-700 mb-1">Avg Rating</div>
          <div className="text-2xl font-black text-yellow-900">
            {stats.avgRating.toFixed(1)}★
          </div>
        </div>
      </div>

      {loading && (
        <div className="text-gray-600 text-sm">Loading pending reviews...</div>
      )}
      {error && <div className="text-red-600 text-sm mb-4">{error}</div>}

      {!loading && pending.length === 0 && (
        <div className="p-5 bg-white border-2 border-gray-200 rounded-xl text-sm text-gray-600">
          No pending reviews.
        </div>
      )}

      <div className="space-y-4">
        {pending.map((r) => (
          <div
            key={r.id}
            className="p-4 bg-white rounded-xl border-2 border-gray-200 shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold text-gray-800">
                {r.product?.name || "Product"} • {r.rating}★
              </div>
              <span className="text-xs text-gray-500">
                {new Date(r.createdAt).toLocaleDateString()}
              </span>
            </div>
            {r.comment && (
              <p className="text-sm text-gray-700 leading-relaxed mb-3">
                {r.comment}
              </p>
            )}
            <div className="flex items-center gap-2 text-xs text-gray-600 mb-3">
              <span>
                User: {r.user?.firstName} {r.user?.lastName}
              </span>
              {r.isVerified && (
                <span className="px-2 py-0.5 bg-emerald-600 text-white rounded-full font-bold">
                  Verified Purchase
                </span>
              )}
            </div>
            <div className="flex gap-3">
              <button
                disabled={actioning === r.id}
                onClick={() => updateStatus(r.id, "approved")}
                className="px-4 py-2 rounded-lg text-sm font-bold bg-emerald-600 text-white shadow hover:shadow-lg disabled:opacity-50"
              >
                Approve
              </button>
              <button
                disabled={actioning === r.id}
                onClick={() => updateStatus(r.id, "rejected")}
                className="px-4 py-2 rounded-lg text-sm font-bold bg-red-600 text-white shadow hover:shadow-lg disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-4 py-2 rounded-lg text-sm font-bold bg-gray-200 text-gray-700 disabled:opacity-50 hover:bg-gray-300"
          >
            Previous
          </button>
          <span className="text-sm text-gray-700 font-medium">
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="px-4 py-2 rounded-lg text-sm font-bold bg-gray-200 text-gray-700 disabled:opacity-50 hover:bg-gray-300"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
