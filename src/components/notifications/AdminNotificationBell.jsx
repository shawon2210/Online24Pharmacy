// ============================================
// AdminNotificationBell.jsx
// Admin notification bell with badge for admin panel
// Shows admin-specific notifications like new orders, prescriptions, etc.
// ============================================

import { useState, useEffect, useCallback } from "react";
import { Bell, X } from "lucide-react";
import { AdminNotificationPanel } from "./AdminNotificationPanel";

export function AdminNotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);

  // ============================================
  // FETCH ADMIN NOTIFICATIONS
  // ============================================

  const fetchAdminNotifications = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch("/api/notifications/admin/unread", {
        credentials: "include",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error("Failed to fetch admin notifications");

      const data = await response.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.notifications?.length || 0);
    } catch (error) {
      console.error("Error fetching admin notifications:", error);
    }
  };

  useEffect(() => {
    fetchAdminNotifications();

    // Poll every 30 seconds for admin notifications
    const interval = setInterval(fetchAdminNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleNotificationRead = useCallback(async () => {
    // Refresh notifications after marking as read
    fetchAdminNotifications();
  }, []);

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="relative">
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-muted border border-border text-foreground hover:bg-accent hover:scale-105 active:scale-95 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 shadow-sm"
        aria-label="Admin Notifications"
        title="View admin notifications"
      >
        <Bell className="w-5 h-5 sm:w-6 sm:h-6" />

        {/* Badge with Unread Count */}
        {unreadCount > 0 && (
          <span
            className={`absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-background transform translate-x-1/2 -translate-y-1/2 rounded-full ${
              unreadCount > 9 ? "w-6 h-6" : "px-1 py-0"
            } bg-red-500 animate-pulse`}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Admin Notification Panel Dropdown */}
      <div className="relative">
        {isOpen && (
          <div className="fixed inset-x-4 top-16 z-50 sm:absolute sm:inset-x-auto sm:right-0 sm:top-auto sm:mt-2 sm:w-96">
            <AdminNotificationPanel
              notifications={notifications}
              onClose={() => setIsOpen(false)}
              onNotificationRead={handleNotificationRead}
            />
          </div>
        )}
      </div>

      {/* Close Panel when clicking outside - only on desktop */}
      {isOpen && (
        <div
          className="hidden sm:block fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

export default AdminNotificationBell;
