// ============================================
// NotificationBell.jsx
// Header notification bell icon with badge
// Real-time unread count updates
// ============================================

import { useState, useEffect, useCallback } from "react";
import { Bell, X } from "lucide-react";
import { NotificationPanel } from "./NotificationPanel";

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // ============================================
  // FETCH UNREAD COUNT
  // ============================================

  const fetchUnreadCount = async () => {
    try {
      const csrfToken = document
        .querySelector('meta[name="csrf-token"]')
        ?.getAttribute("content");
      const headers = {};
      if (csrfToken) {
        headers["X-CSRF-Token"] = csrfToken;
      }

      const response = await fetch("/api/notifications/unread-count", {
        credentials: "include",
        headers,
      });
      if (!response.ok) throw new Error("Failed to fetch unread count");

      const data = await response.json();
      setUnreadCount(data.count || 0);
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  // ============================================
  // SETUP WEBSOCKET LISTENER
  // ============================================

  useEffect(() => {
    // Initial fetch
    fetchUnreadCount();

    // Setup WebSocket listener (if available)
    const setupWebSocketListener = () => {
      // Assuming you have a global socket instance
      if (window.socket && typeof window.socket.on === "function") {
        const csrfToken = document
          .querySelector('meta[name="csrf-token"]')
          ?.getAttribute("content");
        if (csrfToken) {
          window.socket.emit("authenticate", { token: csrfToken });
        }

        window.socket.on("unread-count-updated", (data) => {
          setUnreadCount(data.unreadCount);
        });

        window.socket.on("notification", async (_notification) => {
          // Update unread count when new notification arrives with CSRF protection
          const csrfToken = document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute("content");
          await fetch("/api/notifications/unread-count", {
            credentials: "include",
            headers: csrfToken ? { "X-CSRF-Token": csrfToken } : {},
          })
            .then((response) => response.json())
            .then((data) => setUnreadCount(data.count || 0))
            .catch((error) =>
              console.error("Error fetching unread count:", error)
            );
        });

        return () => {
          window.socket.off("unread-count-updated");
          window.socket.off("notification");
        };
      }

      // Fallback: Poll every 30 seconds if WebSocket not available
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    };

    const cleanup = setupWebSocketListener();

    return cleanup;
  }, []);

  const handleNotificationRead = useCallback(async () => {
    // Mark notifications as read with CSRF protection
    const csrfToken = document
      .querySelector('meta[name="csrf-token"]')
      ?.getAttribute("content");
    await fetch("/api/notifications/mark-read", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
      },
      body: JSON.stringify({}),
    });
    fetchUnreadCount();
  }, []);

  // ============================================
  // HANDLE PANEL CLOSE
  // ============================================

  const handleClose = () => {
    setIsOpen(false);
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="relative">
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-foreground hover:text-emerald-600 transition-colors rounded-full hover:bg-muted"
        aria-label="Notifications"
        title="View notifications"
      >
        <Bell className="w-6 h-6" />

        {/* Badge with Unread Count */}
        {unreadCount > 0 && (
          <span
            className={`absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-background transform translate-x-1/2 -translate-y-1/2 rounded-full ${
              unreadCount > 9 ? "w-6 h-6" : "px-1 py-0"
            } ${isOpen ? "bg-emerald-600" : "bg-red-500 animate-pulse"}`}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 max-w-full z-50">
          <NotificationPanel
            onClose={handleClose}
            onNotificationRead={handleNotificationRead}
          />
        </div>
      )}

      {/* Close Panel when clicking outside */}
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
}

export default NotificationBell;
