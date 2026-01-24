// ============================================
// NotificationBell.jsx
// Header notification bell icon with badge
// Real-time unread count updates
// ============================================

import { useState, useEffect, useCallback } from "react";
import { Bell, X } from "lucide-react";
import { NotificationPanel } from "./NotificationPanel";
import { useAuth } from "../../hooks/useAuth";

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { isAuthenticated } = useAuth();

  // ============================================
  // FETCH UNREAD COUNT
  // ============================================

  const fetchUnreadCount = async () => {
    if (!isAuthenticated) return;

    try {
      const csrfToken = document
        .querySelector('meta[name="csrf-token"]')
        ?.getAttribute("content");
      const accessToken = localStorage.getItem("auth_token");
      const headers = {};
      if (csrfToken) {
        headers["X-CSRF-Token"] = csrfToken;
      }
      if (accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`;
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
    if (!isAuthenticated) return;

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
          const accessToken = localStorage.getItem("auth_token");
          const headers = {};
          if (csrfToken) headers["X-CSRF-Token"] = csrfToken;
          if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

          await fetch("/api/notifications/unread-count", {
            credentials: "include",
            headers,
          })
            .then((response) => response.json())
            .then((data) => setUnreadCount(data.count || 0))
            .catch((error) =>
              console.error("Error fetching unread count:", error),
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
  }, [isAuthenticated]);

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
        className="group relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl hover:bg-gradient-to-br hover:from-amber-50 hover:to-amber-100 dark:hover:from-amber-900/20 dark:hover:to-amber-800/20 hover:shadow-lg hover:shadow-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400 active:scale-95 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:ring-offset-2"
        aria-label="Notifications"
        title="View notifications"
      >
        <Bell
          className={`w-5 h-5 sm:w-5.5 sm:h-5.5 group-hover:scale-110 transition-all duration-300 ${unreadCount > 0 ? "text-amber-500" : ""}`}
        />

        {/* Badge with Unread Count */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-gradient-to-br from-red-500 to-red-600 text-white text-xs font-bold rounded-full min-w-[22px] h-[22px] sm:min-w-[24px] sm:h-[24px] flex items-center justify-center px-1 shadow-lg shadow-red-500/25 animate-pulse ring-2 ring-white dark:ring-gray-900">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}

        {/* Subtle glow effect for unread notifications */}
        {unreadCount > 0 && (
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-amber-400/0 to-amber-500/0 group-hover:from-amber-400/10 group-hover:to-amber-500/10 transition-all duration-300" />
        )}
      </button>

      {/* Notification Panel Dropdown */}
      <div className="relative">
        {isOpen && (
          <div className="fixed inset-x-4 top-16 z-50 sm:absolute sm:inset-x-auto sm:right-0 sm:top-auto sm:mt-2 sm:w-96">
            <NotificationPanel
              onClose={handleClose}
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

export default NotificationBell;
