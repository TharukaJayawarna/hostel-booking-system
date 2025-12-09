import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  MessageCircleQuestion, 
  Phone, 
  Menu, 
  X,
  CalendarCheck // 1. මෙන්න මේක import කරන්න ඕන
} from 'lucide-react';

const HOSTEL_LOGO = "https://img.freepik.com/free-vector/editable-hotel-logo-vector-business-corporate-identity-hostel_53876-111553.jpg?semt=ais_se_enriched&w=740&q=80"; 

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // User කෙනෙක් Log වෙලා ඉන්නවද කියලා බලන්න (Optional: My Bookings පෙන්වන්නෙ Student ට විතරක් නම්)
  const user = JSON.parse(localStorage.getItem('user'));
  const isStudent = user?.role === 'STUDENT';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const s = {
    navbar: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      zIndex: 1000,
      transition: 'all 0.3s ease-in-out',
      padding: '4px 0',
      backgroundColor: '#ffffffff',
      boxShadow: isScrolled ? '0 4px 20px rgba(0,0,0,0.08)' : '0 1px 3px rgba(0,0,0,0.05)',
      borderBottom: '1px solid #f1f5f9'
    },
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    logoGroup: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      textDecoration: 'none',
      cursor: 'pointer'
    },
    logoImage: {
      height: '50px',
      width: 'auto',
      objectFit: 'contain'
    },
    logoText: {
      fontSize: '22px',
      fontWeight: '800',
      color: '#1e293b', 
      letterSpacing: '-0.5px',
      fontFamily: "'Inter', sans-serif"
    },
    navLinks: {
      display: 'flex',
      gap: '35px',
      alignItems: 'center'
    },
    linkItem: (isActive) => ({
      textDecoration: 'none',
      fontSize: '15px',
      fontWeight: '600',
      color: isActive ? '#4f46e5' : '#64748b',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'color 0.2s ease',
      padding: '8px 0',
      position: 'relative'
    }),
    activeDot: {
      position: 'absolute', bottom: '-4px', left: '50%', transform: 'translateX(-50%)',
      width: '5px', height: '5px', borderRadius: '50%', background: '#4f46e5'
    },
    menuBtn: {
      display: 'none',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: '#334155'
    },
    mobileMenu: {
      position: 'fixed',
      top: '0',
      right: isMobileMenuOpen ? '0' : '-100%',
      width: '280px',
      height: '100vh',
      backgroundColor: 'white',
      boxShadow: '-5px 0 25px rgba(0,0,0,0.1)',
      transition: 'right 0.3s ease-in-out',
      zIndex: 1001,
      padding: '25px',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    },
    mobileOverlay: {
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)',
      zIndex: 1000, display: isMobileMenuOpen ? 'block' : 'none',
      backdropFilter: 'blur(3px)'
    },
    mobileLink: (isActive) => ({
      textDecoration: 'none',
      fontSize: '16px',
      fontWeight: '600',
      color: isActive ? '#4f46e5' : '#334155',
      display: 'flex', alignItems: 'center', gap: '12px',
      padding: '12px', borderRadius: '12px',
      backgroundColor: isActive ? '#eef2ff' : 'transparent'
    })
  };

  const NavLink = ({ to, icon: Icon, label }) => {
    const isActive = location.pathname === to;
    const [hover, setHover] = useState(false);

    return (
      <Link 
        to={to} 
        style={s.linkItem(isActive)}
        onMouseEnter={(e) => { e.currentTarget.style.color = '#4f46e5'; setHover(true); }}
        onMouseLeave={(e) => { e.currentTarget.style.color = isActive ? '#4f46e5' : '#64748b'; setHover(false); }}
      >
        {/* Icon එක තිබේ නම් පමණක් render කරන්න */}
        {Icon && <Icon size={18} strokeWidth={2.5} style={{opacity: isActive || hover ? 1 : 0.7}}/>}
        {label}
        {isActive && <div style={s.activeDot}></div>}
      </Link>
    );
  };

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
              
              {/* STUDENT නම් පමණක් My Bookings පෙන්වන්න */}
              {isStudent && (
                 <NavLink to="/my-bookings" icon={CalendarCheck} label="My Bookings" />
              )}
              
              <NavLink to="/issue" icon={MessageCircleQuestion} label="Report Issue" />
              <NavLink to="/contact" icon={Phone} label="Contact" />
            </div>
          ) : (
            <button style={s.menuBtn} onClick={() => setIsMobileMenuOpen(true)} className="mobile-menu-btn">
              <Menu size={28} />
            </button>
          )}

        </div>
      </nav>

      <style>{`
        @media (max-width: 768px) {
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>

      <div style={s.mobileOverlay} onClick={() => setIsMobileMenuOpen(false)}></div>
      <div style={s.mobileMenu}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'30px'}}>
            <span style={{fontSize:'18px', fontWeight:'800', color:'#1e293b'}}>Menu</span>
            <button onClick={() => setIsMobileMenuOpen(false)} style={{background:'none', border:'none', cursor:'pointer', color:'#64748b'}}>
                <X size={24}/>
            </button>
        </div>

        <Link to="/" style={s.mobileLink(location.pathname === '/')}>
            <Home size={20}/> Home
        </Link>
        
        {isStudent && (
            <Link to="/my-bookings" style={s.mobileLink(location.pathname === '/my-bookings')}>
                <CalendarCheck size={20}/> My Bookings
            </Link>
        )}

        <Link to="/issue" style={s.mobileLink(location.pathname === '/issue')}>
            <MessageCircleQuestion size={20}/> Report Issue
        </Link>
        <Link to="/contact" style={s.mobileLink(location.pathname === '/contact')}>
            <Phone size={20}/> Contact Us
        </Link>
      </div>
    </>
  );
};

export default Navbar;