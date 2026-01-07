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
      const csrfToken = document
        .querySelector('meta[name="csrf-token"]')
        ?.getAttribute("content");
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };
      if (csrfToken) {
        headers["X-CSRF-Token"] = csrfToken;
      }
      const res = await fetch(`${API_URL}/api/reviews/${id}/status`, {
        method: "PATCH",
        headers,
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
      "fixed top-6 right-6 bg-primary text-white px-5 py-3 rounded-lg shadow-xl text-sm font-semibold animate-fade-in";
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3000);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-black mb-6 text-primary">
        Review Moderation
      </h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="p-4 bg-background rounded-xl border-2 border-border shadow-sm">
          <div className="text-xs text-muted-foreground mb-1">
            Total Reviews
          </div>
          <div className="text-2xl font-black text-foreground">
            {stats.total}
          </div>
        </div>
        <div className="p-4 bg-muted/40 dark:bg-card/40 rounded-xl border border-border dark:border-gray-700 shadow-sm">
          <div className="text-xs text-primary mb-1">Approved</div>
          <div className="text-2xl font-black text-primary">
            {stats.approved}
          </div>
        </div>
        <div className="p-4 bg-muted/40 dark:bg-card/40 rounded-xl border border-border dark:border-gray-700 shadow-sm">
          <div className="text-xs text-amber-700 mb-1">Pending</div>
          <div className="text-2xl font-black text-foreground">
            {stats.pending}
          </div>
        </div>
        <div className="p-4 bg-muted/40 dark:bg-card/40 rounded-xl border border-border dark:border-gray-700 shadow-sm">
          <div className="text-xs text-red-700 mb-1">Rejected</div>
          <div className="text-2xl font-black text-foreground">
            {stats.rejected}
          </div>
        </div>
        <div className="p-4 bg-muted/40 dark:bg-card/40 rounded-xl border border-border dark:border-gray-700 shadow-sm">
          <div className="text-xs text-muted-foreground mb-1">Avg Rating</div>
          <div className="text-2xl font-black text-foreground">
            {stats.avgRating.toFixed(1)}★
          </div>
        </div>
      </div>

      {loading && (
        <div className="text-muted-foreground text-sm">
          Loading pending reviews...
        </div>
      )}
      {error && <div className="text-red-600 text-sm mb-4">{error}</div>}

      {!loading && pending.length === 0 && (
        <div className="p-5 bg-background border-2 border-border rounded-xl text-sm text-muted-foreground">
          No pending reviews.
        </div>
      )}

      <div className="space-y-4">
        {pending.map((r) => (
          <div
            key={r.id}
            className="p-4 bg-background rounded-xl border-2 border-border shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold text-foreground">
                {r.product?.name || "Product"} • {r.rating}★
              </div>
              <span className="text-xs text-background0">
                {new Date(r.createdAt).toLocaleDateString()}
              </span>
            </div>
            {r.comment && (
              <p className="text-sm text-foreground leading-relaxed mb-3">
                {r.comment}
              </p>
            )}
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
              <span>
                User: {r.user?.firstName} {r.user?.lastName}
              </span>
              {r.isVerified && (
                <span className="px-2 py-0.5 bg-primary text-background rounded-full font-bold">
                  Verified Purchase
                </span>
              )}
            </div>
            <div className="flex gap-3">
              <button
                disabled={actioning === r.id}
                onClick={() => updateStatus(r.id, "approved")}
                className="px-4 py-2 rounded-lg text-sm font-bold bg-primary text-background shadow hover:shadow-lg disabled:opacity-50"
              >
                Approve
              </button>
              <button
                disabled={actioning === r.id}
                onClick={() => updateStatus(r.id, "rejected")}
                className="px-4 py-2 rounded-lg text-sm font-bold bg-red-600 text-background shadow hover:shadow-lg disabled:opacity-50"
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
            className="px-4 py-2 rounded-lg text-sm font-bold bg-border text-foreground disabled:opacity-50 hover:bg-border"
          >
            Previous
          </button>
          <span className="text-sm text-foreground font-medium">
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="px-4 py-2 rounded-lg text-sm font-bold bg-border text-foreground disabled:opacity-50 hover:bg-border"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
