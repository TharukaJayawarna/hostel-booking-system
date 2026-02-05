import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  Clock,
  Info,
  Trash2,
  LogOut,
  Settings, 
} from "lucide-react";
import ConfirmModal from "../ConfirmModal";
import "../styles/Navbar.css";

const NotificationDropdown = ({
  user,
  notifications,
  unreadCount,
  onNotificationClick,
  onClearAll,
  onLogout,
}) => {
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const navigate = useNavigate(); // 3. Initialize Hook

  // --- NEW: Handle Settings Navigation ---
  const handleSettingsClick = () => {
    if (user.role === "STUDENT") {
      navigate("/security");
    } else {
      navigate("/admin/settings");
    }
  };
  
  const handleItemClick = (notif) => {
    // Dropdown eke logic eka wenuwata Parent (Navbar) eken ena function eka call karanna
    if (onNotificationClick) {
      onNotificationClick(notif);
    }
  };

  const getNotifStyle = (title) => {
    const t = title.toLowerCase();
    if (
      t.includes("success") ||
      t.includes("confirmed") ||
      t.includes("approved")
    ) {
      return { icon: CheckCircle2, color: "#10b981", bg: "#ecfdf5" };
    } else if (
      t.includes("failed") ||
      t.includes("rejected") ||
      t.includes("alert") ||
      t.includes("issue")
    ) {
      return { icon: AlertCircle, color: "#ef4444", bg: "#fef2f2" };
    } else if (t.includes("pending") || t.includes("payment")) {
      return { icon: Clock, color: "#f59e0b", bg: "#fffbeb" };
    }
    return { icon: Info, color: "#4f46e5", bg: "#eef2ff" };
  };

  const stripHtml = (html) => {
    if (!html) return "";
    try {
      const parsed = JSON.parse(html);
      if (parsed.introMessage) {
        return parsed.introMessage.substring(0, 100);
      }
      if (parsed.message) {
        return stripHtmlFromString(parsed.message).substring(0, 100);
      }
      const firstText = Object.values(parsed).find(v => typeof v === 'string');
      if (firstText) {
        return stripHtmlFromString(firstText).substring(0, 100);
      }
      return "Click to view details";
    } catch {
      return stripHtmlFromString(html).substring(0, 100);
    }
  };

  const stripHtmlFromString = (str) => {
    if (!str) return "";
    const tmp = document.createElement("DIV");
    tmp.innerHTML = str;
    const styles = tmp.getElementsByTagName("style");
    while (styles.length > 0) {
      styles[0].parentNode.removeChild(styles[0]);
    }
    const scripts = tmp.getElementsByTagName("script");
    while (scripts.length > 0) {
      scripts[0].parentNode.removeChild(scripts[0]);
    }
    let text = tmp.textContent || tmp.innerText || "";
    return text.replace(/\s+/g, " ").trim();
  };

  const handleClearRequest = () => {
    setIsClearModalOpen(true);
  };

  const handleConfirmClear = () => {
    onClearAll();
    setIsClearModalOpen(false);
  };

  return (
    <>
      <div className="dropdown-menu">
        {/* UPDATED HEADER WITH SETTINGS BUTTON */}
        <div className="dropdown-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="dd-user">
              {user.firstName} {user.lastName}
            </div>
            <div className="dd-email">{user.email}</div>
          </div>
          
          <button 
            onClick={handleSettingsClick}
            className="dd-settings-btn"
            title="Account Settings"
            style={{
                background: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                padding: '6px',
                color: '#64748b',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
                e.currentTarget.style.color = '#2563eb';
                e.currentTarget.style.background = '#eff6ff';
                e.currentTarget.style.borderColor = '#bfdbfe';
            }}
            onMouseOut={(e) => {
                e.currentTarget.style.color = '#64748b';
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.borderColor = '#e2e8f0';
            }}
          >
            <Settings size={18} />
          </button>
        </div>

        <div className="notif-section">
          <div className="notif-header">
            <span>Notifications</span>
            {unreadCount > 0 && (
              <span style={{ color: "#ef4444", fontWeight: "700" }}>
                {unreadCount} New
              </span>
            )}

            {notifications.length > 0 && (
              <button
                className="clear-btn"
                onClick={handleClearRequest}
                title="Clear all notifications"
              >
                <Trash2 size={12} /> Clear All
              </button>
            )}
          </div>

          <div className="notif-list">
            {notifications.length === 0 ? (
              <div className="notif-empty">
                <Bell
                  size={24}
                  style={{ opacity: 0.3, marginBottom: "10px" }}
                />
                <div style={{ fontSize: "13px" }}>No notifications</div>
              </div>
            ) : (
              notifications.map((notif) => {
                const style = getNotifStyle(notif.title);
                const Icon = style.icon;
                return (
                  <div
                    key={notif.id}
                    className={`notif-item ${notif.read ? "read" : "unread"}`}
                    onClick={() => handleItemClick(notif)}
                  >
                    <div
                      className="notif-icon-box"
                      style={{
                        backgroundColor: style.bg,
                        color: style.color,
                        borderColor: style.bg,
                      }}
                    >
                      <Icon size={18} strokeWidth={2.5} />
                    </div>
                    <div className="notif-content">
                      <div className="notif-title-row">
                        <span
                          className={`notif-title ${!notif.read ? "bold" : ""}`}
                        >
                          {notif.title}
                        </span>
                        {!notif.read && <div className="notif-dot"></div>}
                      </div>
                      <div className="notif-preview">
                        {stripHtml(notif.message)}
                      </div>
                      <div className="notif-time">
                        <Clock size={10} />
                        {new Date(notif.createdAt).toLocaleDateString()} •{" "}
                        {new Date(notif.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="dropdown-footer">
          <button className="dropdown-logout-btn" onClick={onLogout}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        onConfirm={handleConfirmClear}
        title="Clear Notifications?"
        message="Are you sure you want to delete all notifications? This action cannot be undone."
        confirmText="Yes, Clear All"
        cancelText="Cancel"
        isDanger={true}
      />
    </>
  );
};

export default NotificationDropdown;