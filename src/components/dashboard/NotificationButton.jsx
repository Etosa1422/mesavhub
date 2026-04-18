"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, ChevronRight, Trash2, CheckCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  fetchUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  clearAllNotifications,
} from "../../services/userService";
import { CSS_COLORS } from "../../components/constant/colors";

const NotificationButton = () => {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // ✅ Fetch notifications
  const loadNotifications = async () => {
    try {
      const res = await fetchUserNotifications();

      let data = [];
      if (Array.isArray(res)) data = res;
      else if (Array.isArray(res.notifications)) data = res.notifications;
      else if (Array.isArray(res.data)) data = res.data;

      setNotifications(data);
    } catch (err) {
      console.error("Failed to load notifications:", err);
      toast.error("Failed to load notifications");
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  // ✅ Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  // ✅ Handle "Clear All"
  const handleClearAll = async () => {
    try {
      await clearAllNotifications();
      setNotifications([]);
      toast.success("All notifications cleared");
    } catch (error) {
      console.error("Failed to clear notifications:", error);
      toast.error("Unable to clear notifications");
    }
  };

  // ✅ Handle "Mark All as Read"
  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, is_read: true }))
      );
      toast.success("All notifications marked as read");
    } catch (error) {
      console.error("Failed to mark all as read:", error);
      toast.error("Unable to mark all as read");
    }
  };

  // ✅ Handle single "Mark as Read"
  const handleMarkAsRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === id ? { ...notif, is_read: true } : notif
        )
      );
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  // ✅ Handle single "Delete"
  const handleDeleteNotification = async (id) => {
    try {
      await deleteNotification(id);
      setNotifications((prev) => prev.filter((notif) => notif.id !== id));
      toast.success("Notification deleted");
    } catch (error) {
      console.error("Failed to delete notification:", error);
      toast.error("Unable to delete notification");
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* 🔔 Notification Button */}
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-full hover:bg-gray-100 transition-colors relative"
      >
        <Bell className="w-5 h-5 text-gray-600" />
        {/* Badge for unread count */}
        {unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold text-white shadow"
            style={{ backgroundColor: CSS_COLORS.primary }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* 🔽 Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 rounded-2xl shadow-xl border border-gray-200 bg-white/90 backdrop-blur-md overflow-hidden z-50"
            style={{ backdropFilter: "blur(8px)" }}
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-semibold text-gray-800 text-sm">Notifications</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-gray-500 hover:text-green-600 transition flex items-center gap-1"
                  title="Mark all as read"
                >
                  <CheckCheck size={13} />
                  Mark All
                </button>
                <button
                  onClick={handleClearAll}
                  className="text-xs text-gray-500 hover:text-red-600 transition flex items-center gap-1"
                  title="Clear all"
                >
                  <Trash2 size={13} />
                  Clear
                </button>
              </div>
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.slice(0, 5).map((notif) => (
                  <div
                    key={notif.id || `${notif.title}-${notif.created_at}`}
                    className={`p-4 border-b border-gray-100 transition ${
                      !notif.is_read ? "bg-gray-50/70 hover:bg-gray-100" : "hover:bg-gray-50"
                    }`}
                    onClick={() => handleMarkAsRead(notif.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-medium text-gray-800">
                          {notif.title || "Untitled Notification"}
                        </h4>
                        <p className="text-xs text-gray-600 mt-1">
                          {notif.message || "No message content"}
                        </p>
                        <span className="text-[11px] text-gray-400 mt-1 block">
                          {notif.created_at
                            ? new Date(notif.created_at).toLocaleString()
                            : ""}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNotification(notif.id);
                        }}
                        className="text-gray-400 hover:text-red-500 transition"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-gray-500 text-sm">
                  No notifications yet.
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 flex justify-between items-center border-t border-gray-100 bg-gray-50 text-xs text-gray-600">
              <span>© {new Date().getFullYear()} All Rights Reserved</span>
              <button
                onClick={() => {
                  setOpen(false);
                  navigate("/dashboard/notifications");
                }}
                className="text-teal-600 hover:text-teal-700 flex items-center gap-1 transition"
              >
                View All <ChevronRight size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationButton;
