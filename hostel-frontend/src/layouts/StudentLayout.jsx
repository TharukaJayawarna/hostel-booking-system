import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const StudentLayout = () => {
  // --- STYLES ---
  const s = {
    layoutContainer: {
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      fontFamily: "'Inter', sans-serif",
      backgroundColor: '#f8fafc', // Modern Light Background
      color: '#1f2937'
    },
    
    mainContent: {
      flex: 1, // ඉතිරි ඉඩ සියල්ල ලබා ගනී
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative'
    },

    // Optional: ඉහළ කොටසේ සියුම් Gradient එකක් (Decoration)
    topGradient: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '300px',
      background: 'linear-gradient(180deg, #e0e7ff 0%, rgba(248, 250, 252, 0) 100%)', // Indigo Tint Fade
      zIndex: 0,
      pointerEvents: 'none'
    },

    contentWrapper: {
        zIndex: 1, // Gradient එකට උඩින් Content පෙන්වීමට
        width: '100%',
        flex: 1,
        display: 'flex',
        flexDirection: 'column'
    }
  };

  return (
    <div style={s.layoutContainer}>
      
      {/* 1. Navigation Bar */}
      <Navbar />

      {/* 2. Main Content Area */}
      <main style={s.mainContent}>
        {/* Background Decoration */}
        <div style={s.topGradient}></div>

        {/* Page Content (Outlet) */}
        <div style={s.contentWrapper}>
            <Outlet />
        </div>
      </main>

      {/* 3. Footer */}
      <Footer />

    </div>
  );
};

export default StudentLayout;