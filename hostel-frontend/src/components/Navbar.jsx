import React from 'react';
import { Link } from 'react-router-dom'; 

const Navbar = () => {
  const styles = {
    navbar: {
      backgroundColor: '#2b5c9e',
      background: 'linear-gradient(135deg, #2b5c9e 0%, #1e4a7a 100%)',
      padding: '15px 0',
      color: 'white',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      width: '100%',
      boxSizing: 'border-box',
      borderBottom: '2px solid rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)'
    },
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0 20px',
      flexWrap: 'wrap'
    },
    logoLink: {
      textDecoration: 'none',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      transition: 'transform 0.3s ease, filter 0.3s ease',
      cursor: 'pointer'
    },
    logoText: {
      fontSize: '24px',
      fontWeight: '800',
      letterSpacing: '0.5px',
      textShadow: '2px 2px 4px rgba(0, 0, 0, 0.2)',
      background: 'linear-gradient(180deg, #ffffff 0%, #e0e8f0 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text'
    },
    logoIcon: {
      fontSize: '24px',
      filter: 'drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.2))',
      animation: 'pulse 2s ease-in-out infinite'
    },
    navLinks: {
      display: 'flex',
      gap: '25px',
      alignItems: 'center'
    },
    link: {
      color: 'rgba(255, 255, 255, 0.9)',
      textDecoration: 'none',
      fontSize: '16px',
      fontWeight: '500',
      transition: 'all 0.3s ease',
      padding: '8px 16px',
      borderRadius: '6px',
      position: 'relative',
      overflow: 'hidden',
      cursor: 'pointer'
    }
  };

  const [hoveredLink, setHoveredLink] = React.useState(null);
  const [logoHovered, setLogoHovered] = React.useState(false);

  const getLinkStyle = (linkName) => ({
    ...styles.link,
    backgroundColor: hoveredLink === linkName ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
    transform: hoveredLink === linkName ? 'translateY(-2px)' : 'translateY(0)',
    boxShadow: hoveredLink === linkName ? '0 4px 8px rgba(0, 0, 0, 0.2)' : 'none',
    color: hoveredLink === linkName ? '#ffffff' : 'rgba(255, 255, 255, 0.9)'
  });

  const getLogoStyle = () => ({
    ...styles.logoLink,
    transform: logoHovered ? 'scale(1.05)' : 'scale(1)',
    filter: logoHovered ? 'brightness(1.1)' : 'brightness(1)'
  });

  return (
    <nav style={styles.navbar}>
      <div style={styles.container}>
        <Link 
          to="/" 
          style={getLogoStyle()}
          onMouseEnter={() => setLogoHovered(true)}
          onMouseLeave={() => setLogoHovered(false)}
        >
          <span style={styles.logoIcon}>🏠</span>
          <span style={styles.logoText}>Hostel Booking System</span>
        </Link>
        <div style={styles.navLinks}>
          <Link 
            to="/" 
            style={getLinkStyle('home')}
            onMouseEnter={() => setHoveredLink('home')}
            onMouseLeave={() => setHoveredLink(null)}
          >
            Home
          </Link>

          <Link 
            to="/issue" 
            style={getLinkStyle('issue')}
            onMouseEnter={() => setHoveredLink('issue')}
            onMouseLeave={() => setHoveredLink(null)}
          >
            Report Issue
          </Link>

          <Link 
            to="/contact" 
            style={getLinkStyle('contact')}
            onMouseEnter={() => setHoveredLink('contact')}
            onMouseLeave={() => setHoveredLink(null)}
          >
            Contact Us
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;