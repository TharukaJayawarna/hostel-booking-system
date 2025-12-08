import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  MessageCircleQuestion, 
  Phone, 
  Menu, 
  X
} from 'lucide-react';

// Placeholder Logo URL (You can replace this with your actual logo path later)
// Example: import logo from '../assets/logo.png';
const HOSTEL_LOGO = "https://img.freepik.com/free-vector/editable-hotel-logo-vector-business-corporate-identity-hostel_53876-111553.jpg?semt=ais_se_enriched&w=740&q=80"; 

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Scroll Event Listener for Shadow effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  // --- STYLES ---
  const s = {
    navbar: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      zIndex: 1000,
      transition: 'all 0.3s ease-in-out',
      padding: '4px 0',
      backgroundColor: '#ffffffff', // Solid White Background added
      boxShadow: isScrolled ? '0 4px 20px rgba(0,0,0,0.08)' : '0 1px 3px rgba(0,0,0,0.05)', // Dynamic Shadow
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
    
    // Logo Styles
    logoGroup: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      textDecoration: 'none',
      cursor: 'pointer'
    },
    logoImage: {
      height: '50px', // Height for the logo
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

    // Desktop Nav
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

    // Mobile Menu Button
    menuBtn: {
      display: 'none', // Logic to show/hide is handled by JS below in rendering
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: '#334155'
    },

    // Mobile Menu Overlay
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

  // Helper component for Links
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
        <Icon size={18} strokeWidth={2.5} style={{opacity: isActive || hover ? 1 : 0.7}}/>
        {label}
        {isActive && <div style={s.activeDot}></div>}
      </Link>
    );
  };

  // Check window width for responsive design
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
          
          {/* Logo Section */}
          <Link to="/" style={s.logoGroup}>
            <img src={HOSTEL_LOGO} alt="Logo" style={s.logoImage} />
            <span style={s.logoText}>Hostel PMS</span>
          </Link>

          {/* Desktop Nav Links */}
          {!isMobile ? (
            <div style={s.navLinks}>
              <NavLink to="/" icon={Home} label="Home" />
              <NavLink to="/issue" icon={MessageCircleQuestion} label="Report Issue" />
              <NavLink to="/contact" icon={Phone} label="Contact" />
            </div>
          ) : (
            // Mobile Menu Button
            <button style={s.menuBtn} onClick={() => setIsMobileMenuOpen(true)} className="mobile-menu-btn">
              <Menu size={28} />
            </button>
          )}

        </div>
      </nav>

      {/* Style fix for mobile button visibility */}
      <style>{`
        @media (max-width: 768px) {
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>

      {/* Mobile Menu Sidebar */}
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