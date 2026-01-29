import React, { createContext, useContext, useState, useCallback } from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import "./styles/Notification.css";

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

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

  const notify = {
    success: (msg) => addNotification(msg, "success"),
    error: (msg) => addNotification(msg, "error"),
    warning: (msg) => addNotification(msg, "warning"),
    info: (msg) => addNotification(msg, "info"),
  };

  return (
    <NotificationContext.Provider value={notify}>
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
