import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import notificationService from "../../services/notification.service";
import { 
  Bell, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Info, 
  Trash2, 
  MailOpen,
  Calendar
} from "lucide-react";
import "./styles/NotificationsPage.css";

const NotificationsPage = () => {
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch latest 20 for this page
      const res = await notificationService.getMyNotifications(20);
      if (res.data.status === "SUCCESS") {
        const data = res.data.data;
        setNotifications(data);

        // If redirected from dropdown, select that notification
        const passedId = location.state?.selectedId;
        if (passedId) {
          const target = data.find(n => n.id === passedId);
          if (target) handleSelect(target);
        } else if (data.length > 0) {
          // Default select first one
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
    
    // Mark as read if needed
    if (!notif.read) {
      try {
        await notificationService.markAsRead(notif.id);
        setNotifications(prev => prev.map(n => n.id === notif.id ? {...n, read: true} : n));
      } catch (e) { console.error(e); }
    }
  };

  const getIcon = (type) => {
    if (type?.includes("SUCCESS")) return <CheckCircle2 color="#10b981" />;
    if (type?.includes("FAIL") || type?.includes("ALERT")) return <AlertCircle color="#ef4444" />;
    return <Info color="#3b82f6" />;
  };

  return (
    <div className="notif-page-container">
      <div className="notif-sidebar">
        <div className="notif-header">
          <h2>Notifications</h2>
          <span className="badge">{notifications.length}</span>
        </div>
        
        <div className="notif-list-scroll">
          {notifications.map(notif => (
            <div 
              key={notif.id} 
              className={`notif-card ${selectedNotification?.id === notif.id ? "active" : ""} ${!notif.read ? "unread" : ""}`}
              onClick={() => handleSelect(notif)}
            >
              <div className="notif-card-icon">{getIcon(notif.title)}</div>
              <div className="notif-card-content">
                <div className="notif-card-title">{notif.title}</div>
                <div className="notif-card-time">{new Date(notif.createdAt).toLocaleDateString()}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="notif-content-area">
        {selectedNotification ? (
          <div className="notif-detail-view">
             <div className="notif-detail-header">
                <div className="nd-icon-large">{getIcon(selectedNotification.title)}</div>
                <div>
                   <h1>{selectedNotification.title}</h1>
                   <div className="nd-meta">
                      <Clock size={14}/> {new Date(selectedNotification.createdAt).toLocaleString()}
                   </div>
                </div>
             </div>
             
             <div className="notif-detail-body">
                {/* Render HTML content safely */}
                <div dangerouslySetInnerHTML={{ __html: selectedNotification.message }} />
             </div>
          </div>
        ) : (
          <div className="notif-empty-state">
             <MailOpen size={48} color="#cbd5e1" />
             <p>Select a notification to read</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;