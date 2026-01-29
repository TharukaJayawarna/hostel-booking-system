import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  X,
  Home,
  CalendarCheck,
  MessageCircleQuestion,
  Phone,
  Bell,
  LogOut,
} from "lucide-react";

const MobileMenu = ({
  isOpen,
  onClose,
  user,
  isStudent,
  notifications,
  onNotificationClick,
  onLogout,
}) => {
  const location = useLocation();
  const isActive = (path) => (location.pathname === path ? "active" : "");

  return (
    <>
      {isOpen && <div className="mobile-overlay" onClick={onClose}></div>}
      <div className={`mobile-drawer ${isOpen ? "open" : ""}`}>
        <div className="mobile-header">
          <span
            style={{ fontSize: "18px", fontWeight: "800", color: "#1e293b" }}
          >
            Menu
          </span>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#64748b",
            }}
          >
            <X size={24} />
          </button>
        </div>

        {user && (
          <div className="mobile-user-card">
            <div className="avatar-circle">{user.firstName.charAt(0)}</div>
            <div>
              <div
                style={{
                  fontWeight: "700",
                  fontSize: "14px",
                  color: "#1e293b",
                }}
              >
                {user.firstName}
              </div>
              <div style={{ fontSize: "11px", color: "#64748b" }}>
                {user.email}
              </div>
            </div>
          </div>
        )}

        <Link
          to="/"
          className={`mobile-link ${isActive("/")}`}
          onClick={onClose}
        >
          {" "}
          <Home size={20} /> Home{" "}
        </Link>
        {isStudent && (
          <Link
            to="/my-bookings"
            className={`mobile-link ${isActive("/my-bookings")}`}
            onClick={onClose}
          >
            {" "}
            <CalendarCheck size={20} /> My Bookings{" "}
          </Link>
        )}
        <Link
          to="/issue"
          className={`mobile-link ${isActive("/issue")}`}
          onClick={onClose}
        >
          {" "}
          <MessageCircleQuestion size={20} /> Report Issue{" "}
        </Link>
        <Link
          to="/contact"
          className={`mobile-link ${isActive("/contact")}`}
          onClick={onClose}
        >
          {" "}
          <Phone size={20} /> Contact Us{" "}
        </Link>

        {user ? (
          <div
            style={{
              marginTop: "auto",
              borderTop: "1px solid #f1f5f9",
              paddingTop: "20px",
            }}
          >
            <div
              style={{
                fontSize: "12px",
                fontWeight: "700",
                color: "#94a3b8",
                marginBottom: "10px",
                textTransform: "uppercase",
              }}
            >
              Recent Notifications
            </div>
            {notifications.slice(0, 3).map((n) => (
              <div
                key={n.id}
                onClick={() => {
                  onNotificationClick(n);
                  onClose();
                }}
                style={{
                  fontSize: "13px",
                  color: n.read ? "#64748b" : "#334155",
                  fontWeight: n.read ? "400" : "600",
                  marginBottom: "10px",
                  display: "flex",
                  gap: "8px",
                  cursor: "pointer",
                }}
              >
                <Bell
                  size={14}
                  style={{ minWidth: "14px", marginTop: "3px" }}
                />
                {n.title}
              </div>
            ))}
            {notifications.length === 0 && (
              <div style={{ fontSize: "12px", color: "#9ca3b8" }}>
                No notifications
              </div>
            )}

            <button
              onClick={onLogout}
              className="logout-btn"
              style={{
                marginTop: "15px",
                backgroundColor: "#fee2e2",
                color: "#ef4444",
              }}
            >
              <LogOut size={18} /> Logout
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="mobile-link"
            style={{
              justifyContent: "center",
              background: "#4f46e5",
              color: "white",
              marginTop: "auto",
            }}
            onClick={onClose}
          >
            Login
          </Link>
        )}
      </div>
    </>
  );
};

export default MobileMenu;
