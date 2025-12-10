import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { toast } from 'react-toastify';
import { 
  Home, 
  MessageCircleQuestion, 
  Phone, 
  Menu, 
  X,
  CalendarCheck,
  Bell,       
  User,       
  LogOut,     
  ChevronDown,
  Clock,
  CheckCircle2, // New Icon
  AlertCircle,  // New Icon
  Info,
  Trash2      // New Icon
} from 'lucide-react';

const HOSTEL_LOGO = "https://img.freepik.com/free-vector/editable-hotel-logo-vector-business-corporate-identity-hostel_53876-111553.jpg?semt=ais_se_enriched&w=740&q=80"; 

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  // --- Notification States ---
  const [notifications, setNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);
  
  const location = useLocation();
  const navigate = useNavigate();
  const profileMenuRef = useRef(null);

  // User Data
  const user = JSON.parse(localStorage.getItem('user'));
  const isStudent = user?.role === 'STUDENT';
  const username = user?.username;

  // --- Mobile View Logic ---
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- Helper: HTML වලින් Text පමණක් ගැනීම (Preview සඳහා) ---
  const stripHtml = (html) => {
    if (!html) return "";
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  // --- Helper: Notification Style තෝරා ගැනීම ---
  const getNotifStyle = (title) => {
    const t = title.toLowerCase();
    if (t.includes('success') || t.includes('confirmed') || t.includes('approved')) {
        return { icon: CheckCircle2, color: '#10b981', bg: '#ecfdf5' }; // Green
    } else if (t.includes('failed') || t.includes('rejected') || t.includes('alert') || t.includes('issue')) {
        return { icon: AlertCircle, color: '#ef4444', bg: '#fef2f2' }; // Red
    } else if (t.includes('pending') || t.includes('payment')) {
        return { icon: Clock, color: '#f59e0b', bg: '#fffbeb' }; // Amber
    }
    return { icon: Info, color: '#4f46e5', bg: '#eef2ff' }; // Blue (Default)
  };

  // 1. Notifications Fetch කිරීම
  const fetchNotifications = async () => {
    if (user && isStudent) {
        try {
            const res = await api.get('/notifications/my');
            if (res.data.status === 'SUCCESS') {
                setNotifications(res.data.data);
            }
        } catch (error) {
            console.error("Failed to load notifications");
        }
    }
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    if (isStudent) {
        fetchNotifications();
    }

    const interval = setInterval(() => {
        if (isStudent) fetchNotifications();
    }, 60000);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
      clearInterval(interval);
    };
  }, [username]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setShowProfileMenu(false);
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleNotificationClick = async (notif) => {
    setSelectedNotification(notif);
    setShowProfileMenu(false);

    if (!notif.read) {
        try {
            await api.patch(`/notifications/${notif.id}/read`);
            setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
        } catch (e) {
            console.error("Error marking notification as read", e);
        }
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleClearNotifications = async () => {
    if (notifications.length === 0) return;

    if(!window.confirm("Are you sure you want to clear all notifications?")) return;

    try {
        await api.delete('/notifications/clear');
        setNotifications([]); // Local state එක හිස් කරන්න
        toast.success("Notifications cleared.");
    } catch (e) {
        console.error("Failed to clear notifications", e);
        toast.error("Failed to clear notifications.");
    }
  };

  // --- STYLES ---
  const s = {
    navbar: {
      position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 1000,
      transition: 'all 0.3s ease-in-out', padding: '8px 0',
      backgroundColor: '#ffffff',
      boxShadow: isScrolled ? '0 4px 20px rgba(0,0,0,0.08)' : '0 1px 3px rgba(0,0,0,0.05)',
      borderBottom: '1px solid #f1f5f9'
    },
    container: {
      maxWidth: '1200px', margin: '0 auto', padding: '0 24px',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center'
    },
    logoGroup: { display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', cursor: 'pointer' },
    logoImage: { height: '45px', width: 'auto', objectFit: 'contain' },
    logoText: { fontSize: '20px', fontWeight: '800', color: '#1e293b', fontFamily: "'Inter', sans-serif'"},
    
    navLinks: { display: 'flex', gap: '30px', alignItems: 'center' },
    linkItem: (isActive) => ({
      textDecoration: 'none', fontSize: '14px', fontWeight: '600',
      color: isActive ? '#4f46e5' : '#64748b',
      display: 'flex', alignItems: 'center', gap: '6px',
      transition: 'color 0.2s ease', padding: '8px 0', position: 'relative'
    }),
    activeDot: {
      position: 'absolute', bottom: '-4px', left: '50%', transform: 'translateX(-50%)',
      width: '4px', height: '4px', borderRadius: '50%', background: '#4f46e5'
    },
    accountBtn: {
      display: 'flex', alignItems: 'center', gap: '10px',
      padding: '6px 12px', borderRadius: '25px',
      backgroundColor: showProfileMenu ? '#f1f5f9' : 'white',
      border: '1px solid #e2e8f0', cursor: 'pointer',
      transition: 'all 0.2s', position: 'relative'
    },
    avatarCircle: {
      width: '32px', height: '32px', borderRadius: '50%',
      backgroundColor: '#4f46e5', color: 'white',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '14px', fontWeight: '700'
    },
    userName: { fontSize: '13px', fontWeight: '600', color: '#334155', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
    badge: {
        position: 'absolute', top: '-2px', right: '-2px',
        backgroundColor: '#ef4444', color: 'white',
        fontSize: '10px', fontWeight: '700',
        width: '18px', height: '18px', borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: '2px solid white'
    },
    clearBtn: {
        fontSize: '11px', fontWeight: '600', color: '#64748b', 
        background: 'transparent', border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: '4px',
        padding: '4px 8px', borderRadius: '4px',
        transition: 'all 0.2s',
        ':hover': { color: '#ef4444', backgroundColor: '#fef2f2' } // Hover එකේදි රතු පාට
    },
    
    // --- UPDATED DROPDOWN STYLES ---
    dropdown: {
      position: 'absolute', top: '60px', right: '0',
      width: '360px', // Wider for better details
      backgroundColor: 'white',
      borderRadius: '16px', boxShadow: '0 20px 40px -5px rgba(0,0,0,0.15)',
      border: '1px solid #e2e8f0', overflow: 'hidden',
      transformOrigin: 'top right', animation: 'fadeIn 0.2s ease-out'
    },
    dropdownHeader: { padding: '20px', borderBottom: '1px solid #f1f5f9', backgroundColor: '#ffffff' },
    ddUser: { fontSize: '16px', fontWeight: '800', color: '#1e293b' },
    ddEmail: { fontSize: '13px', color: '#64748b', marginTop: '2px' },
    
    notificationSection: { padding: '0', backgroundColor: '#f8fafc' },
    notifHeader: { 
        padding: '15px 20px', fontSize: '12px', fontWeight: '700', 
        color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderBottom: '1px solid #e2e8f0', backgroundColor: '#fff'
    },
    notifList: { maxHeight: '320px', overflowY: 'auto' },
    
    // Detailed Notification Item
    notifItem: (read) => ({
        padding: '16px', borderBottom: '1px solid #f1f5f9',
        backgroundColor: read ? 'white' : '#f0f9ff',
        display: 'flex', gap: '15px', alignItems: 'start', cursor: 'pointer',
        transition: 'all 0.2s ease', position: 'relative'
    }),
    notifIconBox: (style) => ({
        minWidth: '40px', height: '40px', borderRadius: '12px',
        backgroundColor: style.bg, color: style.color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginTop: '2px', border: `1px solid ${style.bg}` // subtle border
    }),
    notifContent: { flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' },
    notifTitleRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'start' },
    notifTitle: (read) => ({ fontSize: '14px', fontWeight: read ? '600' : '700', color: '#1e293b', lineHeight: '1.3' }),
    notifDot: { width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444', flexShrink: 0, marginTop: '6px' },
    notifPreview: { fontSize: '12px', color: '#64748b', lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' },
    notifTimeMeta: { fontSize: '11px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px', fontWeight: '500' },

    dropdownFooter: { padding: '15px', borderTop: '1px solid #e2e8f0', backgroundColor:'white' },
    logoutBtn: {
        width: '100%', padding: '12px', borderRadius: '12px',
        border: '1px solid #fee2e2', backgroundColor: '#fff1f2', color: '#e11d48',
        fontSize: '14px', fontWeight: '600', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
        transition: 'all 0.2s'
    },

    modalOverlay: {
        position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', 
        display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000,
        backdropFilter: 'blur(4px)'
    },
    modalContent: {
        backgroundColor: 'white', padding: '30px', borderRadius: '20px',
        maxWidth: '550px', width: '90%', maxHeight: '80vh', overflowY: 'auto',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', position: 'relative'
    },
    modalCloseBtn: {
        position: 'absolute', top: '20px', right: '20px', 
        background: '#f1f5f9', border: 'none', borderRadius: '50%', 
        width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#64748b', transition: 'background 0.2s'
    },
    modalTitle: { fontSize: '20px', fontWeight: '800', marginBottom: '8px', color: '#1e293b', paddingRight: '30px' },
    modalMeta: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#64748b', marginBottom: '20px' },
    modalBody: { fontSize: '15px', color: '#334155', lineHeight: '1.7' },

    menuBtn: { display: 'none', background: 'none', border: 'none', cursor: 'pointer', color: '#334155' },
    mobileMenu: {
      position: 'fixed', top: '0', right: isMobileMenuOpen ? '0' : '-100%',
      width: '280px', height: '100vh', backgroundColor: 'white',
      boxShadow: '-5px 0 25px rgba(0,0,0,0.1)', transition: 'right 0.3s ease-in-out',
      zIndex: 1001, padding: '25px', display: 'flex', flexDirection: 'column', gap: '20px'
    },
    mobileOverlay: {
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)',
      zIndex: 1000, display: isMobileMenuOpen ? 'block' : 'none', backdropFilter: 'blur(3px)'
    },
    mobileLink: (isActive) => ({
      textDecoration: 'none', fontSize: '15px', fontWeight: '600',
      color: isActive ? '#4f46e5' : '#334155', display: 'flex', alignItems: 'center', gap: '12px',
      padding: '12px', borderRadius: '12px', backgroundColor: isActive ? '#eef2ff' : 'transparent'
    })

    
  };

  const NavLink = ({ to, icon: Icon, label }) => {
    const isActive = location.pathname === to;
    return (
      <Link to={to} style={s.linkItem(isActive)}>
        {Icon && <Icon size={18} strokeWidth={2.5} style={{opacity: isActive ? 1 : 0.7}}/>}
        {label}
        {isActive && <div style={s.activeDot}></div>}
      </Link>
    );
  };

  return (
    <>
      <nav style={s.navbar}>
        <div style={s.container}>
          <Link to="/" style={s.logoGroup}>
            <img src={HOSTEL_LOGO} alt="Logo" style={s.logoImage} />
            <span style={s.logoText}>Hostel PMS</span>
          </Link>

          {!isMobile ? (
            <div style={s.navLinks}>
              <NavLink to="/" icon={Home} label="Home" />
              {isStudent && <NavLink to="/my-bookings" icon={CalendarCheck} label="My Bookings" />}
              <NavLink to="/issue" icon={MessageCircleQuestion} label="Report Issue" />
              <NavLink to="/contact" icon={Phone} label="Contact" />

              {user ? (
                <div style={{position: 'relative'}} ref={profileMenuRef}>
                    <button style={s.accountBtn} onClick={() => setShowProfileMenu(!showProfileMenu)}>
                        <div style={{position:'relative'}}>
                            <div style={s.avatarCircle}>{user.firstName.charAt(0)}</div>
                            {unreadCount > 0 && <div style={s.badge}>{unreadCount}</div>}
                        </div>
                        <div style={{textAlign:'left'}}>
                            <div style={s.userName}>{user.firstName}</div>
                        </div>
                        <ChevronDown size={14} color="#94a3b8"/>
                    </button>

                    {showProfileMenu && (
                        <div style={s.dropdown}>
                            <div style={s.dropdownHeader}>
                                <div style={s.ddUser}>{user.firstName} {user.lastName}</div>
                                <div style={s.ddEmail}>{user.email}</div>
                            </div>
                            
                            <div style={s.notificationSection}>
                                <div style={s.notifHeader}>
                                    <span>Notifications</span>
                                    {unreadCount > 0 && <span style={{color:'#ef4444', fontWeight:'700'}}>{unreadCount} New</span>}
                                </div>
                                {/* --- CLEAR ALL BUTTON --- */}
                                    {notifications.length > 0 && (
                                        <button 
                                            style={s.clearBtn} 
                                            onClick={handleClearNotifications}
                                            title="Clear all notifications"
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.color = '#ef4444';
                                                e.currentTarget.style.backgroundColor = '#fef2f2';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.color = '#64748b';
                                                e.currentTarget.style.backgroundColor = 'transparent';
                                            }}
                                        >
                                            <Trash2 size={12}/> Clear All
                                        </button>
                                    )}
                                <div style={s.notifList}>
                                    {notifications.length === 0 ? (
                                        <div style={{padding:'40px 20px', textAlign:'center', color:'#9ca3af'}}>
                                            <Bell size={24} style={{opacity:0.3, marginBottom:'10px'}}/>
                                            <div style={{fontSize:'13px'}}>No notifications</div>
                                        </div>
                                    ) : (
                                        notifications.map(notif => {
                                            const style = getNotifStyle(notif.title);
                                            const Icon = style.icon;
                                            return (
                                                <div 
                                                    key={notif.id} 
                                                    style={s.notifItem(notif.read)}
                                                    onClick={() => handleNotificationClick(notif)}
                                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = notif.read ? 'white' : '#f0f9ff'}
                                                >
                                                    <div style={s.notifIconBox(style)}>
                                                        <Icon size={18} strokeWidth={2.5} />
                                                    </div>
                                                    <div style={s.notifContent}>
                                                        <div style={s.notifTitleRow}>
                                                            <span style={s.notifTitle(notif.read)}>{notif.title}</span>
                                                            {!notif.read && <div style={s.notifDot}></div>}
                                                        </div>
                                                        <div style={s.notifPreview}>
                                                            {stripHtml(notif.message)}
                                                        </div>
                                                        <div style={s.notifTimeMeta}>
                                                            <Clock size={10} /> 
                                                            {new Date(notif.createdAt).toLocaleDateString()} • {new Date(notif.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>

                            <div style={s.dropdownFooter}>
                                <button style={s.logoutBtn} onClick={handleLogout} onMouseOver={e=>e.currentTarget.style.backgroundColor='#fee2e2'} onMouseOut={e=>e.currentTarget.style.backgroundColor='#fff1f2'}>
                                    <LogOut size={16}/> Logout
                                </button>
                            </div>
                        </div>
                    )}
                </div>
              ) : (
                <Link to="/login" style={{...s.linkItem(false), padding:'8px 16px', background:'#4f46e5', color:'white', borderRadius:'8px'}}>Login</Link>
              )}
            </div>
          ) : (
            <button style={s.menuBtn} onClick={() => setIsMobileMenuOpen(true)} className="mobile-menu-btn">
              <Menu size={28} />
            </button>
          )}
        </div>
      </nav>

      {/* --- FULL NOTIFICATION MODAL --- */}
      {selectedNotification && (
        <div style={s.modalOverlay} onClick={() => setSelectedNotification(null)}>
            <div style={s.modalContent} onClick={e => e.stopPropagation()}>
                <button style={s.modalCloseBtn} onClick={() => setSelectedNotification(null)} onMouseOver={e=>e.currentTarget.style.background='#e2e8f0'} onMouseOut={e=>e.currentTarget.style.background='#f1f5f9'}>
                    <X size={18}/>
                </button>
                
                <h3 style={s.modalTitle}>{selectedNotification.title}</h3>
                <div style={s.modalMeta}>
                    <Clock size={14}/> {new Date(selectedNotification.createdAt).toLocaleString()}
                </div>

                <div 
                    style={s.modalBody}
                    dangerouslySetInnerHTML={{ __html: selectedNotification.message }}
                />
                
                <div style={{marginTop:'30px', textAlign:'right', borderTop:'1px solid #f1f5f9', paddingTop:'20px'}}>
                    <button 
                        onClick={() => setSelectedNotification(null)}
                        style={{padding:'10px 24px', background:'#4f46e5', color:'white', border:'none', borderRadius:'10px', fontSize:'14px', fontWeight:'600', cursor:'pointer'}}
                    >
                        Close Message
                    </button>
                </div>
            </div>
        </div>
      )}

      <style>{`@media (max-width: 900px) { .mobile-menu-btn { display: block !important; } }`}</style>

      {/* MOBILE MENU */}
      <div style={s.mobileOverlay} onClick={() => setIsMobileMenuOpen(false)}></div>
      <div style={s.mobileMenu}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px'}}>
            <span style={{fontSize:'18px', fontWeight:'800', color:'#1e293b'}}>Menu</span>
            <button onClick={() => setIsMobileMenuOpen(false)} style={{background:'none', border:'none', cursor:'pointer', color:'#64748b'}}><X size={24}/></button>
        </div>

        {user && (
            <div style={{padding:'15px', background:'#f8fafc', borderRadius:'12px', display:'flex', alignItems:'center', gap:'12px', marginBottom:'10px'}}>
                <div style={s.avatarCircle}>{user.firstName.charAt(0)}</div>
                <div>
                    <div style={{fontWeight:'700', fontSize:'14px', color:'#1e293b'}}>{user.firstName}</div>
                    <div style={{fontSize:'11px', color:'#64748b'}}>{user.email}</div>
                </div>
            </div>
        )}

        <Link to="/" style={s.mobileLink(location.pathname === '/')}> <Home size={20}/> Home </Link>
        {isStudent && <Link to="/my-bookings" style={s.mobileLink(location.pathname === '/my-bookings')}> <CalendarCheck size={20}/> My Bookings </Link>}
        <Link to="/issue" style={s.mobileLink(location.pathname === '/issue')}> <MessageCircleQuestion size={20}/> Report Issue </Link>
        <Link to="/contact" style={s.mobileLink(location.pathname === '/contact')}> <Phone size={20}/> Contact Us </Link>

        {user && (
            <div style={{marginTop:'auto', borderTop:'1px solid #f1f5f9', paddingTop:'20px'}}>
                <div style={{fontSize:'12px', fontWeight:'700', color:'#94a3b8', marginBottom:'10px', textTransform:'uppercase'}}>Recent Notifications</div>
                {notifications.slice(0, 3).map(n => (
                    <div 
                        key={n.id} 
                        onClick={() => {
                            handleNotificationClick(n);
                            setIsMobileMenuOpen(false);
                        }}
                        style={{fontSize:'13px', color: n.read ? '#64748b' : '#334155', fontWeight: n.read ? '400' : '600', marginBottom:'10px', display:'flex', gap:'8px'}}
                    >
                        <Bell size={14} style={{minWidth:'14px', marginTop:'3px'}}/> 
                        {n.title}
                    </div>
                ))}
                {notifications.length === 0 && <div style={{fontSize:'12px', color:'#9ca3b8'}}>No notifications</div>}
                
                <button onClick={handleLogout} style={{...s.logoutBtn, marginTop:'15px', backgroundColor:'#fee2e2', color:'#ef4444'}}>
                    <LogOut size={18}/> Logout
                </button>
            </div>
        )}
        
        {!user && (
             <Link to="/login" style={{...s.mobileLink(false), justifyContent:'center', background:'#4f46e5', color:'white', marginTop:'auto'}}>Login</Link>
        )}
      </div>
    </>
  );
};

export default Navbar;