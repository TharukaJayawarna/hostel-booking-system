import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import notificationService from "../services/notification.service"; // Service Import
import "./styles/Notification.css";

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  // --- Toast State ---
  const [notifications, setNotifications] = useState([]); // For Toasts

  // --- Inbox State (NEW) ---
  const [inboxNotifications, setInboxNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // 1. Load Notifications from Backend
  const fetchInbox = useCallback(async () => {
    try {
      const res = await notificationService.getMyNotifications();
      if (res.data.status === "SUCCESS") {
        const data = res.data.data;
        setInboxNotifications(data);
      }
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    }
  }, []);

  // 2. Mark as Read
  const markAsRead = useCallback(async (id) => {
    // Optimistic Update (Frontend eka ikmanata update wenna)
    setInboxNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );

    // Call Backend
    try {
      await notificationService.markAsRead(id);
    } catch (e) {
      console.error("Failed to mark as read", e);
    }
  }, []);

  // 3. Add Incoming Notification (WebSocket)
  const addIncomingNotification = useCallback((newNotif) => {
    setInboxNotifications((prev) => {
      // Duplicate check
      if (prev.some((n) => n.id === newNotif.id)) return prev;
      return [newNotif, ...prev];
    });
  }, []);

  // 4. Clear All
  const clearInbox = useCallback(async () => {
    setInboxNotifications([]);
    setUnreadCount(0);
    try {
      await notificationService.clearAllNotifications();
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Auto calculate unread count
  useEffect(() => {
    setUnreadCount(inboxNotifications.filter((n) => !n.read).length);
  }, [inboxNotifications]);


  // --- Toast Logic (Existing) ---
  const addNotification = useCallback((message, type = "info") => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeNotification(id);
    }, 5000);
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  }, []);

  // Combined Value Object
  // Parana 'notify' object ekatama aluth functions tika attach karanawa
  // Meka nisa parana code (notify.success) kadenne na.
  const contextValue = {
    // Toast methods
    success: (msg) => addNotification(msg, "success"),
    error: (msg) => addNotification(msg, "error"),
    warning: (msg) => addNotification(msg, "warning"),
    info: (msg) => addNotification(msg, "info"),
    
    // Inbox Data & Methods
    inboxNotifications,
    unreadCount,
    fetchInbox,
    markAsRead,
    addIncomingNotification,
    clearInbox
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      <div className="notification-container">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className={`notification-toast toast-${notif.type}`}
          >
            <div className="icon-area">
              {notif.type === "success" && <CheckCircle size={20} />}
              {notif.type === "error" && <AlertCircle size={20} />}
              {notif.type === "warning" && <AlertTriangle size={20} />}
              {notif.type === "info" && <Info size={20} />}
            </div>
            <div className="toast-message">{notif.message}</div>
            <button
              onClick={() => removeNotification(notif.id)}
              className="close-btn"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};