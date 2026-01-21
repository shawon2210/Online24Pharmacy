// ============================================
// AdminNotifications.jsx
// Admin notifications page showing all admin notifications
// ============================================
import { useCallback } from "react";
import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { Navigate } from "react-router-dom";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Package,
  FileText,
  Users,
  DollarSign,
  AlertCircle,
} from "lucide-react";

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalNotifications, setTotalNotifications] = useState(0);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const { user } = useAuth();
  const notificationsPerPage = 20;

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const offset = (currentPage - 1) * notificationsPerPage;
      const token = localStorage.getItem('auth_token');
      const response = await fetch(
        `/api/notifications/admin?limit=${notificationsPerPage}&offset=${offset}&unreadOnly=${unreadOnly}`,
        {
          credentials: "include",
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        },
      );

      if (!response.ok) throw new Error("Failed to fetch notifications");

      const data = await response.json();
      setNotifications(data.notifications || []);
      setTotalNotifications(data.total || 0);
      setError(null);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [currentPage, notificationsPerPage, unreadOnly]);

  useEffect(() => {
    if (user?.role === "ADMIN") {
      fetchNotifications();
    }
  }, [user, currentPage, unreadOnly, fetchNotifications]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(
        `/api/notifications/${encodeURIComponent(notificationId)}/read`,
        {
          method: "POST",
          credentials: "include",
          headers: { 
            "Content-Type": "application/json",
            'Authorization': `Bearer ${token}`
          },
        },
      );

      if (!response.ok) throw new Error("Failed to mark as read");

      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId ? { ...notif, isRead: true } : notif,
        ),
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch("/api/notifications/mark-all-read", {
        method: "POST",
        credentials: "include",
        headers: { 
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) throw new Error("Failed to mark all as read");

      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, isRead: true })),
      );
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "NEW_ORDER_PLACED":
        return <Package className="w-5 h-5 text-blue-500" />;
      case "NEW_PRESCRIPTION_UPLOADED":
        return <FileText className="w-5 h-5 text-orange-500" />;
      case "PAYMENT_PENDING":
        return <DollarSign className="w-5 h-5 text-yellow-500" />;
      case "NEW_REVIEW_SUBMITTED":
        return <Users className="w-5 h-5 text-purple-500" />;
      case "LOW_STOCK_ALERT":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  if (!user || user.role !== "ADMIN") {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Admin Notifications
            </h1>
            <p className="text-muted-foreground">
              {totalNotifications} total notifications
            </p>
          </div>
          {notifications.length > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Mark All Read
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="mb-6 flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={unreadOnly}
              onChange={(e) => setUnreadOnly(e.target.checked)}
              className="rounded border-border"
            />
            <span className="text-sm text-foreground">Show unread only</span>
          </label>
        </div>

        {/* Pagination Info */}
        {totalNotifications > notificationsPerPage && (
          <div className="mb-4 text-sm text-muted-foreground">
            Showing {(currentPage - 1) * notificationsPerPage + 1} to{" "}
            {Math.min(currentPage * notificationsPerPage, totalNotifications)}{" "}
            of {totalNotifications} notifications
          </div>
        )}

        {/* Notifications List */}
        <div className="space-y-4">
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                No notifications
              </h3>
              <p className="text-muted-foreground">You're all caught up!</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 border rounded-lg ${
                  notification.isRead
                    ? "bg-background border-border"
                    : "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-foreground">
                          {notification.title}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="shrink-0 ml-2 p-1 text-muted-foreground hover:text-foreground transition-colors"
                          title="Mark as read"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalNotifications > notificationsPerPage && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-border rounded-lg hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <span className="px-3 py-2 text-sm text-muted-foreground">
              Page {currentPage} of{" "}
              {Math.ceil(totalNotifications / notificationsPerPage)}
            </span>

            <button
              onClick={() => setCurrentPage((prev) => prev + 1)}
              disabled={
                currentPage >=
                Math.ceil(totalNotifications / notificationsPerPage)
              }
              className="px-3 py-2 border border-border rounded-lg hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
