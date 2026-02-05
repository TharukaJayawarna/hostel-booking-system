import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import SockJS from "sockjs-client";
import Stomp from "stompjs";
import {
  Home,
  MessageCircleQuestion,
  Phone,
  Menu,
  CalendarCheck,
  ChevronDown,
} from "lucide-react";

import NotificationDropdown from "./NotificationDropdown";
import MobileMenu from "./MobileMenu";
import "../styles/Navbar.css";

import authService from "../../services/auth.service";
import { useNotification } from "../../context/NotificationContext"; // Import Context

const HOSTEL_LOGO =
  "src/assets/logo.png";
const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // USE CONTEXT HERE
  const { 
    inboxNotifications, 
    unreadCount, 
    fetchInbox, 
    addIncomingNotification, 
    markAsRead, 
    clearInbox 
  } = useNotification();

  const location = useLocation();
  const navigate = useNavigate();
  const profileMenuRef = useRef(null);

  const user = authService.getCurrentUser();
  const isStudent = user?.role === "STUDENT";
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 900);
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll);
    
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Fetch on load
  useEffect(() => {
    if (user && isStudent) {
      fetchInbox(); // Call context function
    }
  }, [user?.username, fetchInbox]);

  // WebSocket
  useEffect(() => {
    if (!user) return;
    const SOCKET_URL = import.meta.env.VITE_API_URL + "/ws";
    const socket = new SockJS(SOCKET_URL);
    const stompClient = Stomp.over(socket);
    stompClient.debug = () => {}; 

    stompClient.connect({}, () => {
      stompClient.subscribe(`/topic/notifications/${user.username}`, (message) => {
        try {
          const newNotification = JSON.parse(message.body);
          
          // Use Context method to add
          addIncomingNotification(newNotification);
          
          toast.info(`New Notification: ${newNotification.title}`);
        } catch (e) {
          console.error("Error parsing notification", e);
        }
      });
    }, (error) => {
      console.error("WebSocket connection error:", error);
    });

    return () => {
      if (stompClient && stompClient.connected) {
        stompClient.disconnect();
      }
    };
  }, [user?.username, addIncomingNotification]);

  // Click Outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setShowProfileMenu(false);
  }, [location]);

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  const handleNotificationClick = (notif) => {
    setShowProfileMenu(false);
    
    // Mark as read via context immediately
    markAsRead(notif.id);

    navigate("/notifications", { 
      state: { selectedId: notif.id } 
    });
  };

  const handleClearNotifications = async () => {
    if (inboxNotifications.length === 0) return;
    if (!window.confirm("Are you sure you want to clear all notifications?")) return;
    
    clearInbox(); // Context function
    toast.success("Notifications cleared.");
  };

  const NavLink = ({ to, icon: Icon, label }) => {
    const isActive = location.pathname === to;
    return (
      <Link to={to} className={`nav-item ${isActive ? "active" : ""}`}>
        {Icon && (
          <Icon size={18} strokeWidth={2.5} style={{ opacity: isActive ? 1 : 0.7 }} />
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
            <span className="n-logo-text">Hostel Booking System</span>
          </Link>

          {!isMobile ? (
            <div className="nav-links">
              <NavLink to="/" icon={Home} label="Home" />
              {isStudent && (
                <NavLink to="/my-bookings" icon={CalendarCheck} label="My Bookings" />
              )}
              <NavLink to="/issue" icon={MessageCircleQuestion} label="Report Issue" />
              <NavLink to="/contact" icon={Phone} label="Contact" />

              {user ? (
                <div style={{ position: "relative" }} ref={profileMenuRef}>
                  <button
                    className={`account-btn ${showProfileMenu ? "active" : ""}`}
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                  >
                    <div style={{ position: "relative" }}>
                      <div className="avatar-circle">{user.firstName?.charAt(0)}</div>
                      {unreadCount > 0 && (
                        <div className="notif-badge">{unreadCount}</div>
                      )}
                    </div>
                    <div className="n-user-name">{user.firstName}</div>
                    <ChevronDown size={14} color="#94a3b8" />
                  </button>

                  {showProfileMenu && (
                    <NotificationDropdown
                      user={user}
                      notifications={inboxNotifications} // Pass context data
                      unreadCount={unreadCount}
                      onNotificationClick={handleNotificationClick}
                      onClearAll={handleClearNotifications}
                      onLogout={handleLogout}
                    />
                  )}
                </div>
              ) : (
                <Link to="/login" className="login-btn">Login</Link>
              )}
            </div>
          ) : (
            <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu size={28} />
            </button>
          )}
        </div>
      </nav>

      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        user={user}
        isStudent={isStudent}
        notifications={inboxNotifications}
        onNotificationClick={handleNotificationClick}
        onLogout={handleLogout}
      />
    </>
  );
};

export default Navbar;