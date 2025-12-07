import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Calendar, Building2, Layers, DoorOpen, Bed } from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  
  const styles = {
    sidebar: {
      width: '260px',
      height: '100vh',
      backgroundColor: '#151529',
      color: '#8a92a6',
      display: 'flex',
      flexDirection: 'column',
      padding: '20px',
      position: 'fixed',
      left: 0,
      top: 0,
      zIndex: 50
    },
    logo: {
      fontSize: '24px', 
      fontWeight: '800', 
      color: '#fff', 
      marginBottom: '40px',
      display: 'flex', 
      alignItems: 'center', 
      gap: '10px', 
      paddingLeft: '10px'
    },
    logoIcon: { 
      background: '#6c5dd3', 
      width: '35px', 
      height: '35px', 
      borderRadius: '8px', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center' 
    },
    sectionLabel: { 
      fontSize: '11px', 
      textTransform: 'uppercase', 
      color: '#5b5f75', 
      fontWeight: '700', 
      marginTop: '20px', 
      marginBottom: '10px', 
      paddingLeft: '15px' 
    },
    link: {
      textDecoration: 'none', 
      padding: '12px 15px', 
      marginBottom: '5px', 
      borderRadius: '12px',
      fontSize: '14px', 
      fontWeight: '500', 
      color: '#8a92a6', 
      display: 'flex', 
      alignItems: 'center', 
      gap: '12px',
      transition: 'all 0.2s',
      cursor: 'pointer'
    },
    activeLink: { 
      backgroundColor: '#6c5dd3', 
      color: 'white', 
      fontWeight: '600', 
      boxShadow: '0 5px 15px rgba(108, 93, 211, 0.4)' 
    },
    iconWrapper: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  };

  const NavItem = ({ to, icon: Icon, label }) => {
    const isActive = location.pathname.includes(to);
    const [isHovered, setIsHovered] = React.useState(false);
    
    const linkStyle = {
      ...styles.link,
      ...(isActive ? styles.activeLink : {}),
      ...(isHovered && !isActive ? { backgroundColor: 'rgba(255,255,255,0.05)', color: '#fff' } : {})
    };

    return (
      <Link 
        to={to} 
        style={linkStyle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <span style={styles.iconWrapper}>
          <Icon size={18} />
        </span>
        {label}
      </Link>
    );
  };

  return (
    <div style={styles.sidebar}>
      <div style={styles.logo}>
        <div style={styles.logoIcon}>🏠</div> Hostel Management System
      </div>

      <div style={styles.sectionLabel}>Main Menu</div>
      <NavItem to="/admin/dashboard" icon={LayoutDashboard} label="Dashboard" />
      <NavItem to="/admin/reservations" icon={Calendar} label="Reservations" />

      <div style={styles.sectionLabel}>Property Management</div>
      <NavItem to="/admin/hubs" icon={Building2} label="Hubs" />
      <NavItem to="/admin/floors" icon={Layers} label="Floors" />
      <NavItem to="/admin/rooms" icon={DoorOpen} label="Rooms" />
      <NavItem to="/admin/beds" icon={Bed} label="Beds" />
    </div>
  );
};

export default Sidebar;