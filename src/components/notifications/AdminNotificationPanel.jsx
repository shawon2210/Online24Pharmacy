// ============================================
// AdminNotificationPanel.jsx
// Admin notification panel with admin-specific notifications
// Handles admin notifications like new orders, prescriptions, etc.
// ============================================

import { State } from "react";
import {
  Check,
  CheckCheck,
  Trash2,
  Link as LinkIcon,
  AlertCircle,
  Package,
  FileText,
  Users,
  DollarSign,
  Bell,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export function AdminNotificationPanel({
  notifications,
  onClose,
  onNotificationRead,
}) {
  const navigate = useNavigate();

  // ============================================
  // GET NOTIFICATION ICON
  // ============================================

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

  // ============================================
  // GET NOTIFICATION ACTION URL
  // ============================================

  const getActionUrl = (notification) => {
    const metadata = notification.metadata
      ? JSON.parse(notification.metadata)
      : {};

    switch (notification.type) {
      case "NEW_ORDER_PLACED":
        return `/admin/orders/${metadata.orderId}`;
      case "NEW_PRESCRIPTION_UPLOADED":
        return `/admin/prescriptions/${metadata.prescriptionId}`;
      case "PAYMENT_PENDING":
        return `/admin/orders/${metadata.orderId}`;
      case "NEW_REVIEW_SUBMITTED":
        return `/admin/reviews/${metadata.reviewId}`;
      case "LOW_STOCK_ALERT":
        return `/admin/inventory`;
      default:
        return null;
    }
  };

  // ============================================
  // MARK AS READ
  // ============================================

  const handleMarkAsRead = async (notificationId, e) => {
    e.stopPropagation();

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

      // Notify parent to refresh
      if (onNotificationRead) {
        onNotificationRead();
      }
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

      if (onNotificationRead) {
        onNotificationRead();
      }
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  // ============================================
  // HANDLE NOTIFICATION CLICK
  // ============================================

  const handleNotificationClick = (notification) => {
    const actionUrl = getActionUrl(notification);
    if (actionUrl) {
      navigate(actionUrl);
      onClose();
    }
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="bg-background border border-border rounded-xl shadow-xl overflow-hidden w-full max-w-sm mx-auto sm:max-w-md">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border bg-muted/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                Admin Notifications
              </h3>
              <p className="text-sm text-muted-foreground">
                {notifications.length} unread
              </p>
            </div>
          </div>
          {notifications.length > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Mark all read
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No new notifications</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className="px-6 py-4 hover:bg-muted/50 cursor-pointer transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground line-clamp-2">
                          {notification.title}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={(e) => handleMarkAsRead(notification.id, e)}
                        className="shrink-0 ml-2 p-1 text-muted-foreground hover:text-foreground transition-colors"
                        title="Mark as read"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="px-6 py-3 border-t border-border bg-muted/30">
          <button
            onClick={() => navigate("/admin/notifications")}
            className="w-full text-center text-sm text-emerald-600 hover:text-emerald-700 font-medium"
          >
            View all notifications
          </button>
        </div>
      )}
    </div>
  );
}

export default AdminNotificationPanel;
