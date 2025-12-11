import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  Building2, 
  Layers, 
  DoorOpen, 
  Bed, 
  Home,
  LogOut,
  Settings, // අලුතින් Settings icon එක import කළා
  Users 
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = (e) => {
    e.stopPropagation();
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  // --- STYLES ---
  const s = {
    sidebar: {
      width: '280px',
      height: '100vh',
      backgroundColor: '#111827', 
      color: '#9ca3af',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      left: 0,
      top: 0,
      zIndex: 50,
      borderRight: '1px solid #1f2937',
      boxShadow: '4px 0 24px rgba(0,0,0,0.2)',
      transition: 'all 0.3s ease'
    },
    
    logoContainer: {
      padding: '20px 25px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      borderBottom: '1px solid #1f2937',
    },
    logoIconBox: {
      width: '40px', height: '40px',
      background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
      borderRadius: '10px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'white',
      boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)'
    },
    logoText: {
      fontSize: '18px', fontWeight: '800', color: '#f9fafb',
      letterSpacing: '0.5px', lineHeight: '1.2'
    },
    logoSub: { fontSize: '11px', color: '#6b7280', fontWeight: '500' },

    navScroll: {
      flex: 1,
      overflowY: 'auto',
      padding: '0 15px' // මේ Padding එක නිසා තමයි හැම link එකම කෙලින් තියෙන්නේ
    },
    sectionLabel: { 
      fontSize: '11px', textTransform: 'uppercase', color: '#4b5563', 
      fontWeight: '700', letterSpacing: '1px', marginTop: '25px', 
      marginBottom: '10px', paddingLeft: '12px' 
    },
    
    link: (active) => ({
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 16px', marginBottom: '4px', borderRadius: '12px',
      textDecoration: 'none', fontSize: '14px', fontWeight: '500',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: 'pointer',
      backgroundColor: active ? '#4f46e5' : 'transparent',
      color: active ? '#ffffff' : '#9ca3af',
      boxShadow: active ? '0 4px 12px rgba(79, 70, 229, 0.25)' : 'none',
      border: active ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent'
    }),
    
    iconGroup: { display: 'flex', alignItems: 'center', gap: '12px' },
    activeIndicator: { width: '6px', height: '6px', borderRadius: '50%', background: 'white' },

    footer: {
      padding: '20px', borderTop: '1px solid #1f2937', marginTop: 'auto'
    },
    userCard: {
      display: 'flex', alignItems: 'center', gap: '12px',
      padding: '12px', borderRadius: '12px',
      background: '#1f2937', color: 'white',
      cursor: 'default', transition: 'background 0.2s'
    },
    userAvatar: {
      width: '36px', height: '36px', borderRadius: '50%',
      background: '#374151', color: '#9ca3af',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '14px', fontWeight: '700'
    },
    userInfo: { display: 'flex', flexDirection: 'column' },
    userName: { fontSize: '13px', fontWeight: '600', color: '#f3f4f6' },
    userRole: { fontSize: '11px', color: '#9ca3af' },
    
    logoutBtn: {
        marginLeft:'auto', color:'#ef4444', cursor: 'pointer',
        padding: '5px', borderRadius: '50%', transition: 'background 0.2s'
    }
  };

  const NavItem = ({ to, icon: Icon, label }) => {
    const isActive = location.pathname.includes(to);
    const [hover, setHover] = useState(false);

    return (
      <Link 
        to={to} 
        style={{
            ...s.link(isActive),
            ...(hover && !isActive ? { backgroundColor: 'rgba(255,255,255,0.03)', color: '#e5e7eb' } : {})
        }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <div style={s.iconGroup}>
          <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
          {label}
        </div>
        {isActive && <div style={s.activeIndicator}></div>}
      </Link>
    );
  };

  return (
    <div style={s.sidebar}>
      
      {/* 1. LOGO */}
      <div style={s.logoContainer}>
        <div style={s.logoIconBox}>
          <Home size={22} fill="white" />
        </div>
        <div>
          <div style={s.logoText}>Hostel PMS</div>
          <div style={s.logoSub}>Dashboard</div>
        </div>
      </div>

      {/* 2. NAVIGATION LINKS */}
      <div style={s.navScroll}>
        <div style={s.sectionLabel}>Overview</div>
        <NavItem to="/admin/dashboard" icon={LayoutDashboard} label="Dashboard" />
        <NavItem to="/admin/reservations" icon={Calendar} label="Reservations" />
        <NavItem to="/admin/calendar" icon={Calendar} label="Booking Calendar" />

        <div style={s.sectionLabel}>Property Management</div>
        <NavItem to="/admin/hubs" icon={Building2} label="Hubs" />
        <NavItem to="/admin/floors" icon={Layers} label="Floors" />
        <NavItem to="/admin/rooms" icon={DoorOpen} label="Rooms" />
        <NavItem to="/admin/beds" icon={Bed} label="Beds" />

        {/* --- 3. ADMIN ONLY SECTION (Correctly Aligned) --- */}
        {user && user.role === 'ADMIN' && (
          <>
            <div style={s.sectionLabel}>Administration</div>
            <NavItem to="/admin/users" icon={Users} label="Manage Users" />
            <NavItem to="/admin/settings" icon={Settings} label="System Settings" />
          </>
        )}
      </div>

      {/* 4. FOOTER */}
      <div style={s.footer}>
        <div 
            style={s.userCard}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#374151'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1f2937'}
        >
            <div style={s.userAvatar}>
                {user && user.firstName ? user.firstName.charAt(0) : 'U'}
            </div>
            <div style={s.userInfo}>
                <span style={s.userName}>{user && user.firstName ? user.firstName : 'User'}</span>
                <span style={s.userRole}>{user ? user.role : 'Guest'}</span>
            </div>
            
            <div 
                style={s.logoutBtn} 
                onClick={handleLogout}
                title="Logout"
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
                <LogOut size={18}/>
            </div>
        </div>
      </div>

    </div>
  );
};

export default Sidebar;