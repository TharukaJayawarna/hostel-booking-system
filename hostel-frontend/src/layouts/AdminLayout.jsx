import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const AdminLayout = () => {
  // --- STYLES ---
  const s = {
    layoutContainer: {
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#dbdce0ff', // Modern Light Gray Background
      fontFamily: "'Inter', sans-serif",
    },
    
    // Main Content Wrapper
    main: {
      marginLeft: '270px', // Sidebar එකේ පළලට සමාන විය යුතුයි
      width: 'calc(100% - 250px)',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      transition: 'all 0.3s ease',
    },

    // Inner Content Area
    content: {
      flex: 1,
      padding: '40px', // හොඳ පරතරයක් ලබා දීම
      width: '100%',
      maxWidth: '1600px', // Ultra-wide screens වලදී content එක ඕනාවට වඩා ඇදීම වැළැක්වීමට
      margin: '0 auto', // මැදට ගැනීම
      boxSizing: 'border-box',
    },

    // Optional: Top Decoration (If you want a slight gradient at the top)
    topDecor: {
      height: '200px',
      background: 'linear-gradient(180deg, transparent 0%, rgba(243, 244, 246, 0) 100%)',
      position: 'absolute',
      top: 0,
      left: '280px',
      right: 0,
      zIndex: 0,
      pointerEvents: 'none'
    }
  };

  return (
    <div style={s.layoutContainer}>
      
      {/* 1. Fixed Sidebar */}
      <Sidebar />

      {/* 2. Main Content Area */}
      <main style={s.main}>
        {/* Background Decoration (Optional) */}
        <div style={s.topDecor}></div>

        {/* Page Content (Outlet) */}
        <div style={s.content} className="admin-content">
          <Outlet />
        </div>
      </main>

    </div>
  );
};

export default AdminLayout;