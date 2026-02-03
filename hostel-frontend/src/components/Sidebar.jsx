import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom"; // 1. IMPORT useNavigate
import {
  LayoutDashboard,
  Calendar,
  Building2,
  Layers,
  DoorOpen,
  Bed,
  Home,
  LogOut,
  Settings,
  Users,
  ShieldCheck,
} from "lucide-react";
import authService from "../services/auth.service";
import "./styles/Sidebar.css";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate(); // 2. DEFINE navigate
  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  const handleLogout = (e) => {
    e.stopPropagation();
    authService.logout();
  };

  const NavItem = ({ to, icon: Icon, label }) => {
    const isActive = location.pathname.includes(to);

    return (
      <Link to={to} className={`nav-link ${isActive ? "active" : ""}`}>
        <div className="nav-icon-group">
          <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
          {label}
        </div>
        {isActive && <div className="active-indicator"></div>}
      </Link>
    );
  };

  return (
    <div className="sidebar">
      {/* 1. LOGO */}
      <div className="sidebar-logo-container">
        <div className="logo-icon-box">
          <Home size={22} fill="white" />
        </div>
        <div>
          <div className="logo-text">Hostel PMS</div>
          <div className="logo-sub">Dashboard</div>
        </div>
      </div>

      {/* 2. NAVIGATION LINKS */}
      <div className="nav-scroll">
        <div className="section-label">Overview</div>
        <NavItem
          to="/admin/dashboard"
          icon={LayoutDashboard}
          label="Dashboard"
        />
        <NavItem
          to="/admin/reservations"
          icon={Calendar}
          label="Reservations"
        />
        <NavItem
          to="/admin/calendar"
          icon={Calendar}
          label="Booking Calendar"
        />

        <div className="section-label">Property Management</div>
        <NavItem to="/admin/hubs" icon={Building2} label="Hubs" />
        <NavItem to="/admin/floors" icon={Layers} label="Floors" />
        <NavItem to="/admin/rooms" icon={DoorOpen} label="Rooms" />
        <NavItem to="/admin/beds" icon={Bed} label="Beds" />

        {/* 3. ADMIN ONLY SECTION  */}
        {user && user.role === "ADMIN" && (
          <>
            <div className="section-label">Administration</div>
            <NavItem to="/admin/users" icon={Users} label="Manage Users" />
            <NavItem 
          to="/admin/settings" 
          icon={ShieldCheck} 
          label="System Settings" 
        />
          </>
          
        )}
      </div>

      {/* 5. FOOTER (Clickable User Card) */}
      <div className="sidebar-footer">
        <div 
          className="user-card" 
          onClick={() => navigate("/admin/security")} 
          style={{ cursor: "pointer" }}
          title="Go to Settings"
        >
          <div className="user-avatar">
            {user && user.firstName ? user.firstName.charAt(0) : "U"}
          </div>
          <div className="user-info">
            <span className="user-name">
              {user && user.firstName ? user.firstName : "User"}
            </span>
            <span className="user-role">{user ? user.role : "Guest"}</span>
          </div>

          <div className="logout-btn" onClick={handleLogout} title="Logout">
            <LogOut size={18} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;