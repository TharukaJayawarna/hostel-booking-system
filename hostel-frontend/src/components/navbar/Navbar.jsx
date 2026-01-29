import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Home,
  MessageCircleQuestion,
  Phone,
  Menu,
  CalendarCheck,
  ChevronDown,
} from "lucide-react";

import NotificationDropdown from "./NotificationDropdown";
import NotificationModal from "./NotificationModal";
import MobileMenu from "./MobileMenu";
import "../styles/Navbar.css";

import notificationService from "../../services/notification.service";
import authService from "../../services/auth.service";

const HOSTEL_LOGO =
  "https://img.freepik.com/free-vector/editable-hotel-logo-vector-business-corporate-identity-hostel_53876-111553.jpg?semt=ais_se_enriched&w=740&q=80";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);

  const location = useLocation();
  const profileMenuRef = useRef(null);

  const user = authService.getCurrentUser();
  const isStudent = user?.role === "STUDENT";

  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchNotifications = async () => {
    if (user && isStudent) {
      try {
        const res = await notificationService.getMyNotifications();
        if (res.data.status === "SUCCESS") setNotifications(res.data.data);
      } catch (error) {
        console.error("Failed to load notifications");
      }
    }
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);

    const handleClickOutside = (event) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    if (isStudent) fetchNotifications();
    const interval = setInterval(() => {
      if (isStudent) fetchNotifications();
    }, 60000);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
      clearInterval(interval);
    };
  }, [user?.username]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setShowProfileMenu(false);
  }, [location]);

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  const handleNotificationClick = async (notif) => {
    setSelectedNotification(notif);
    setShowProfileMenu(false);
    if (!notif.read) {
      try {
        await notificationService.markAsRead(notif.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n)),
        );
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleClearNotifications = async () => {
    if (notifications.length === 0) return;
    if (!window.confirm("Are you sure you want to clear all notifications?"))
      return;
    try {
      await notificationService.clearAllNotifications();
      setNotifications([]);
      toast.success("Notifications cleared.");
    } catch (e) {
      toast.error("Failed to clear notifications.");
    }
  };

  const NavLink = ({ to, icon: Icon, label }) => {
    const isActive = location.pathname === to;
    return (
      <Link to={to} className={`nav-item ${isActive ? "active" : ""}`}>
        {Icon && (
          <Icon
            size={18}
            strokeWidth={2.5}
            style={{ opacity: isActive ? 1 : 0.7 }}
          />
        )}
        {label}
        {isActive && <div className="active-dot"></div>}
      </Link>
    );
  };

  return (
    <>
      <nav className={`navbar ${isScrolled ? "scrolled" : ""}`}>
        <div className="nav-container">
          <Link to="/" className="logo-group">
            <img src={HOSTEL_LOGO} alt="Logo" className="logo-image" />
            <span className="logo-text">Hostel Booking System</span>
          </Link>

          {!isMobile ? (
            <div className="nav-links">
              <NavLink to="/" icon={Home} label="Home" />
              {isStudent && (
                <NavLink
                  to="/my-bookings"
                  icon={CalendarCheck}
                  label="My Bookings"
                />
              )}
              <NavLink
                to="/issue"
                icon={MessageCircleQuestion}
                label="Report Issue"
              />
              <NavLink to="/contact" icon={Phone} label="Contact" />

              {user ? (
                <div style={{ position: "relative" }} ref={profileMenuRef}>
                  <button
                    className={`account-btn ${showProfileMenu ? "active" : ""}`}
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                  >
                    <div style={{ position: "relative" }}>
                      <div className="avatar-circle">
                        {user.firstName.charAt(0)}
                      </div>
                      {notifications.filter((n) => !n.read).length > 0 && (
                        <div className="notif-badge">
                          {notifications.filter((n) => !n.read).length}
                        </div>
                      )}
                    </div>
                    <div className="n-user-name">{user.firstName}</div>
                    <ChevronDown size={14} color="#94a3b8" />
                  </button>

                  {showProfileMenu && (
                    <NotificationDropdown
                      user={user}
                      notifications={notifications}
                      unreadCount={notifications.filter((n) => !n.read).length}
                      onNotificationClick={handleNotificationClick}
                      onClearAll={handleClearNotifications}
                      onLogout={handleLogout}
                    />
                  )}
                </div>
              ) : (
                <Link to="/login" className="login-btn">
                  Login
                </Link>
              )}
            </div>
          ) : (
            <button
              className="mobile-menu-btn"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={28} />
            </button>
          )}
        </div>
      </nav>

      <NotificationModal
        notification={selectedNotification}
        onClose={() => setSelectedNotification(null)}
      />

      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        user={user}
        isStudent={isStudent}
        notifications={notifications}
        onNotificationClick={handleNotificationClick}
        onLogout={handleLogout}
      />
    </>
  );
};

export default Navbar;
