// ============================================
// NotificationPanel.jsx
// Dropdown notification panel with list and actions
// Handles marking as read, deleting, and navigation
// ============================================

import { useState, useEffect } from "react";
import {
  Check,
  CheckCheck,
  Trash2,
  Link as LinkIcon,
  AlertCircle,
  Package,
  FileText,
  Zap,
  Bell,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export function NotificationPanel({ onClose, onNotificationRead }) {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  // ============================================
  // FETCH NOTIFICATIONS
  // ============================================

  const fetchNotifications = async (pageNum = 0) => {
    try {
      setIsLoading(true);
      const limit = 20;
      const offset = Math.max(0, pageNum) * limit;
      const response = await fetch(
        `/api/notifications?limit=${limit}&offset=${offset}`,
        { credentials: "include" }
      );

      if (!response.ok) throw new Error("Failed to fetch notifications");

      const data = await response.json();
      setNotifications(data.notifications || []);
      setHasMore(data.hasMore || false);
      setPage(pageNum);
      setError(null);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // ============================================
  // MARK AS READ
  // ============================================

  const handleMarkAsRead = async (notificationId, e) => {
    e.stopPropagation();

    if (!notificationId || typeof notificationId !== "string") return;

    try {
      const response = await fetch(
        `/api/notifications/${encodeURIComponent(notificationId)}/read`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) throw new Error("Failed to mark as read");

      // Update local state
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId ? { ...notif, isRead: true } : notif
        )
      );

      // Notify parent to update unread count
      if (onNotificationRead) {
        onNotificationRead();
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const response = await fetch("/api/notifications/mark-all-read", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error("Failed to mark all as read");

      // Update local state
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, isRead: true }))
      );

      // Notify parent to update unread count
      if (onNotificationRead) {
        onNotificationRead();
      }
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  // ============================================
  // DELETE NOTIFICATION
  // ============================================

  const handleDelete = async (notificationId, e) => {
    e.stopPropagation();

    if (!notificationId || typeof notificationId !== "string") return;

    try {
      const response = await fetch(
        `/api/notifications/${encodeURIComponent(notificationId)}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok) throw new Error("Failed to delete notification");

      // Update local state
      setNotifications((prev) =>
        prev.filter((notif) => notif.id !== notificationId)
      );

      // Notify parent to update unread count
      if (onNotificationRead) {
        onNotificationRead();
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  // ============================================
  // HANDLE NOTIFICATION CLICK
  // ============================================

  const handleNotificationClick = (notification) => {
    const metadata = notification.metadata || {};
    const actionUrl = metadata.actionUrl;

    // Mark as read if not already
    if (!notification.isRead) {
      handleMarkAsRead(notification.id, {
        stopPropagation: () => {},
      });
    }

    // Validate and navigate to action URL (only relative paths)
    if (
      actionUrl &&
      typeof actionUrl === "string" &&
      actionUrl.startsWith("/")
    ) {
      navigate(actionUrl);
      onClose();
    }
  };

  // ============================================
  // GET NOTIFICATION ICON
  // ============================================

  const getNotificationIcon = (type) => {
    if (!type) return null;

    const iconProps = "w-4 h-4";

    if (type.includes("ORDER")) return <Package className={iconProps} />;
    if (type.includes("PRESCRIPTION"))
      return <FileText className={iconProps} />;
    if (type.includes("STOCK") || type.includes("LOW"))
      return <AlertCircle className={iconProps} />;
    if (type.includes("REVIEW")) return <Zap className={iconProps} />;

    return null;
  };

  // ============================================
  // GET NOTIFICATION COLOR
  // ============================================

  const getNotificationColor = (type) => {
    if (!type) return "bg-background";

    if (
      type.includes("ERROR") ||
      type.includes("REJECTED") ||
      type.includes("FAILED")
    )
      return "bg-red-50 border-l-4 border-red-500";
    if (
      type.includes("SUCCESS") ||
      type.includes("APPROVED") ||
      type.includes("CONFIRMED")
    )
      return "bg-green-50 border-l-4 border-green-500";
    if (
      type.includes("WARNING") ||
      type.includes("LOW") ||
      type.includes("EXPIRING")
    )
      return "bg-yellow-50 border-l-4 border-yellow-500";
    if (type.includes("ORDER") || type.includes("SHIPPED"))
      return "bg-blue-50 border-l-4 border-blue-500";

    return "bg-background";
  };

  // ============================================
  // RENDER EMPTY STATE
  // ============================================

  if (!isLoading && notifications.length === 0) {
    return (
      <div className="bg-background rounded-lg shadow-lg overflow-hidden w-full">
        <div className="p-6 text-center">
          <Bell className="w-12 h-12 mx-auto mb-4 text-muted" />
          <p className="text-background0 text-sm">No notifications yet</p>
          <p className="text-muted-foreground text-xs mt-2">
            We'll notify you when something important happens
          </p>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="bg-background rounded-lg shadow-lg overflow-hidden w-full max-h-96 flex flex-col">
      {/* Header */}
      <div className="bg-primary px-4 py-3 flex justify-between items-center text-white">
        <h3 className="font-semibold text-sm">Notifications</h3>
        {notifications.some((n) => !n.isRead) && (
          <button
            onClick={handleMarkAllAsRead}
            className="text-white text-xs hover:bg-primary/80 px-2 py-1 rounded transition-colors flex items-center gap-1"
            title="Mark all as read"
          >
            <CheckCheck className="w-3 h-3" />
            Mark all read
          </button>
        )}
      </div>

      {/* Loading State */}
      {isLoading && notifications.length === 0 && (
        <div className="p-4 text-center text-muted-foreground">
          <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full mx-auto" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-50 text-red-700 text-sm">
          Failed to load notifications: {error}
        </div>
      )}

      {/* Notifications List */}
      <div className="overflow-y-auto flex-1">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            onClick={() => handleNotificationClick(notification)}
            className={`px-4 py-3 border-b cursor-pointer transition-colors hover:bg-background ${
              notification.isRead ? "bg-background" : "bg-background"
            } ${getNotificationColor(notification.type)}`}
          >
            <div className="flex justify-between items-start gap-3">
              {/* Icon */}
              <div className="shrink-0 mt-0.5 text-primary">
                {getNotificationIcon(notification.type)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2">
                  <p
                    className={`text-sm font-semibold ${
                      notification.isRead
                        ? "text-muted-foreground"
                        : "text-foreground"
                    }`}
                  >
                    {notification.title}
                  </p>
                  {!notification.isRead && (
                    <span className="shrink-0 w-2 h-2 bg-primary rounded-full mt-2" />
                  )}
                </div>

                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {notification.message}
                </p>

                <time className="text-xs text-muted-foreground mt-2 block">
                  {new Date(notification.createdAt).toLocaleDateString(
                    "en-US",
                    {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}
                </time>
              </div>

              {/* Actions */}
              <div className="shrink-0 flex gap-1">
                {!notification.isRead && (
                  <button
                    onClick={(e) => handleMarkAsRead(notification.id, e)}
                    className="p-1 text-muted-foreground hover:text-primary transition-colors"
                    title="Mark as read"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={(e) => handleDelete(notification.id, e)}
                  className="p-1 text-muted-foreground hover:text-red-600 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More / Footer */}
      {hasMore && (
        <div className="border-t px-4 py-2 text-center">
          <button
            onClick={() => fetchNotifications(page + 1)}
            className="text-primary text-sm font-semibold hover:text-primary/80 transition-colors"
          >
            Load more
          </button>
        </div>
      )}

      {/* Footer */}
      <div className="bg-background px-4 py-2 text-center border-t">
        <a
          href="/notifications"
          className="text-primary text-xs font-semibold hover:text-primary/80 transition-colors"
        >
          View all notifications →
        </a>
      </div>
    </div>
  );
}

export default NotificationPanel;
