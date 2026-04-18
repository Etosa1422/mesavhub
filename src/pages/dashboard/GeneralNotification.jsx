"use client";

import { useState, useEffect } from "react";
import { Bell, Search } from "lucide-react";
import toast from "react-hot-toast";
import { CSS_COLORS } from "../../components/constant/colors";
import { fetchUserData, fetchUserNotifications } from "../../services/userService";

const GeneralNotification = () => {
  const [notifications, setNotifications] = useState([]);
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const userRes = await fetchUserData();
        setUser(userRes.data);

        const notifRes = await fetchUserNotifications();

        console.log("🔔 Notification Response:", notifRes);

        // ✅ Handle all possible shapes of response
        let data = [];
        if (Array.isArray(notifRes)) {
          data = notifRes;
        } else if (Array.isArray(notifRes.notifications)) {
          data = notifRes.notifications;
        } else if (Array.isArray(notifRes.data)) {
          data = notifRes.data;
        }

        setNotifications(data);
      } catch (err) {
        console.error("❌ Failed to load notifications:", err);
        toast.error("Failed to load notifications");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // ✅ Filter notifications safely (avoid undefined errors)
  const filteredNotifications = notifications.filter((notif) => {
    const title = notif.title ? notif.title.toLowerCase() : "";
    const message = notif.message ? notif.message.toLowerCase() : "";
    return (
      title.includes(searchQuery.toLowerCase()) ||
      message.includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="w-full" style={{ backgroundColor: "transparent" }}>
      <div className="p-4 xl:p-6 space-y-6">
        {/* Header */}
        <div
          className="rounded-2xl p-6 shadow-sm border border-white/50 backdrop-blur-sm flex items-center justify-between"
          style={{ backgroundColor: CSS_COLORS.background.card }}
        >
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-1">Notifications</h1>
            <p className="text-gray-600 text-sm">
              Stay updated with your account and service activity.
            </p>
          </div>
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-md">
            <Bell className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex items-center bg-white border border-gray-200 rounded-full px-4 py-3 shadow-sm">
          <Search className="w-5 h-5 text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Search notifications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 outline-none text-gray-700 text-sm"
          />
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {loading ? (
            <p className="text-center text-gray-500 py-10">Loading notifications...</p>
          ) : filteredNotifications.length > 0 ? (
            filteredNotifications.map((notif) => (
              <div
                key={notif.id || Math.random()}
                className="rounded-2xl p-5 shadow-sm border border-white/50 backdrop-blur-sm transition-all hover:shadow-md"
                style={{ backgroundColor: CSS_COLORS.background.card }}
              >
                <div className="flex items-start justify-between mb-2">
                  <h2 className="font-semibold text-gray-800 text-base">
                    {notif.title || "Untitled Notification"}
                  </h2>
                  <span className="text-xs text-gray-500">
                    {notif.created_at
                      ? new Date(notif.created_at).toLocaleString()
                      : ""}
                  </span>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {notif.message || "No message content"}
                </p>
                {notif.link && (
                  <a
                    href={notif.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-teal-600 hover:underline mt-2 inline-block"
                  >
                    View Details →
                  </a>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">No notifications yet</p>
              <p className="text-sm text-gray-400 mt-1">
                You will see all your system and account updates here.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="text-center py-6 rounded-2xl text-white mt-10"
          style={{
            background: `linear-gradient(135deg, ${CSS_COLORS.primary}, ${CSS_COLORS.primaryDark})`,
          }}
        >
          © {new Date().getFullYear()} All Rights Reserved.
        </div>
      </div>
    </div>
  );
};

export default GeneralNotification;
