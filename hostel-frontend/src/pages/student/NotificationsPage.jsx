import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import notificationService from "../../services/notification.service";
import { 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  MailOpen,
  Clock
} from "lucide-react";

// Templates import
import {
  ReservationSuccessTemplate,
  ReservationFailedTemplate,
  LatePaymentTemplate,
  ReservationCancelledTemplate,
  SimpleTemplate
} from "../../components/navbar/NotificationTemplates";

import "./styles/NotificationsPage.css";

const NotificationsPage = () => {
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [loading, setLoading] = useState(true);

  const passedId = location.state?.selectedId;

  useEffect(() => {
    fetchData();
  }, [passedId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await notificationService.getMyNotifications(50);
      if (res.data.status === "SUCCESS") {
        const data = res.data.data;
        setNotifications(data);

        if (passedId) {
          const target = data.find((n) => n.id === passedId);
          if (target) handleSelect(target);
          else if (data.length > 0) handleSelect(data[0]);
        } else if (data.length > 0) {
          handleSelect(data[0]);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async (notif) => {
    setSelectedNotification(notif);
    if (!notif.read) {
      try {
        await notificationService.markAsRead(notif.id);
        const updatedList = notifications.map((n) =>
          n.id === notif.id ? { ...n, read: true } : n
        );
        setNotifications(updatedList);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const getIcon = (title) => {
    const t = title?.toLowerCase() || "";
    if (t.includes("success") || t.includes("confirmed") || t.includes("approved")) return <CheckCircle2 className="icon-success" />;
    if (t.includes("fail") || t.includes("cancel") || t.includes("reject")) return <AlertCircle className="icon-error" />;
    return <Info className="icon-info" />;
  };

  const getPreviewText = (msg) => {
    try {
        const parsed = JSON.parse(msg);
        return parsed.introMessage || parsed.message || "Notification details...";
    } catch (e) {
        const tmp = document.createElement("DIV");
        tmp.innerHTML = msg;
        return tmp.textContent || tmp.innerText || "";
    }
  };

  const renderNotificationContent = (notification) => {
    if (!notification) return null;

    try {
      const data = JSON.parse(notification.message);

      switch (data.notificationType) {
        case "RESERVATION_CONFIRMED":
        case "RESERVATION_SUCCESS":
        case "DATES UPDATED":
        case "BOOKING REACTIVATED":
        case "NEW BED ASSIGNED":
          return <ReservationSuccessTemplate data={data} />;

        case "RESERVATION_FAILED":
          return <ReservationFailedTemplate data={data} />;
        
        case "RESERVATION_CANCELLED":
          return <ReservationCancelledTemplate data={data} />;

        case "LATE_PAYMENT":
          return <LatePaymentTemplate data={data} />;

        default:
          return <SimpleTemplate message={data.introMessage || notification.message} />;
      }
    } catch (e) {
      return (
        <div 
          className="email-content-wrapper"
          dangerouslySetInnerHTML={{ __html: notification.message }} 
        />
      );
    }
  };

  return (
    <div className="notif-page-wrapper">
      <div className="notif-container card-shadow">
        
        {/* Sidebar */}
        <div className="notif-sidebar">
          <div className="notif-sidebar-header">
            <h2>Inbox</h2>
            <div className="sidebar-stats">
              <span className="stat-item">
                <strong>{notifications.filter(n => !n.read).length}</strong> Unread
              </span>
              <span className="stat-dot">•</span>
              <span className="stat-item">
                <strong>{notifications.length}</strong> Total
              </span>
            </div>
          </div>

          <div className="notif-list-scroll custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="no-results">No notifications found</div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`notif-item ${selectedNotification?.id === notif.id ? "active" : ""} ${!notif.read ? "unread" : ""}`}
                  onClick={() => handleSelect(notif)}
                >
                  <div className="notif-item-left">
                     <div className="notif-item-icon">{getIcon(notif.title)}</div>
                  </div>
                  <div className="notif-item-content">
                    <div className="notif-item-header">
                      <span className="notif-item-title">{notif.title}</span>
                      <span className="notif-item-time">
                        {new Date(notif.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <p className="notif-item-preview">
                      {getPreviewText(notif.message)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="notif-content-area">
          {selectedNotification ? (
            <div className="notif-detail-view fade-in">
              <div className="notif-detail-header">
                <div className="detail-title-row">
                  <div className="detail-title-text">
                    <h1>{selectedNotification.title}</h1>
                    <div className="detail-meta">
                      <Clock size={14} />
                      <span>{new Date(selectedNotification.createdAt).toLocaleString()}</span>
                      <span className="meta-separator">•</span>
                      <span>System Notification</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="notif-detail-body custom-scrollbar">
                {renderNotificationContent(selectedNotification)}
              </div>
            </div>
          ) : (
            <div className="notif-empty-state">
              <div className="empty-icon-bg">
                <MailOpen size={64} strokeWidth={1} />
              </div>
              <h3>Select a notification</h3>
              <p>Choose a message from the list to view details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;