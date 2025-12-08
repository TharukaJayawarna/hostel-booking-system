import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { MapPin, ArrowRight, Building2, Info } from 'lucide-react';

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80";

const Home = () => {
  const [hubs, setHubs] = useState([]);
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    fetchHubs();
  }, []);

  const fetchHubs = async () => {
    try {
      const response = await api.get('/hubs');
      if (response.data.status === "SUCCESS") {
        setHubs(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching hubs:", error);
    }
  };

  const handleSelectHub = (hubId) => {
    navigate(`/hubs/${hubId}/floors`);
  };

  // --- STYLES ---
  const s = {
    pageContainer: {
      width: '100%',
      minHeight: '100vh',
      padding: '60px 20px',
      fontFamily: "'Inter', sans-serif",
      backgroundColor: '#f3f4f6', // Modern Light Background
      color: '#1e293b',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      boxSizing: 'border-box'
    },
    
    // Hero Section
    hero: {
      textAlign: 'center',
      marginBottom: '60px',
      maxWidth: '700px',
      padding: '0 20px'
    },
    badge: {
      display: 'inline-flex', alignItems: 'center', gap: '6px',
      padding: '6px 10px', borderRadius: '99px',
      backgroundColor: '#e0e7ff', color: '#4338ca',
      fontSize: '13px', fontWeight: '600', marginBottom: '20px',
      textTransform: 'uppercase', letterSpacing: '0.5px'
    },
    title: {
      fontSize: '42px', fontWeight: '900', color: '#0f172a',
      marginBottom: '16px', lineHeight: '1.2', letterSpacing: '-1px'
    },
    subtitle: {
      fontSize: '18px', color: '#64748b', lineHeight: '1.6',
      fontWeight: '400'
    },

    // Grid
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
      gap: '30px',
      width: '100%',
      maxWidth: '1200px',
      paddingBottom: '40px'
    },

    // Card
    card: (isHovered) => ({
      backgroundColor: 'white',
      borderRadius: '24px',
      overflow: 'hidden',
      border: '1px solid #e2e8f0',
      boxShadow: isHovered 
        ? '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' 
        : '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      display: 'flex',
      flexDirection: 'column',
      transform: isHovered ? 'translateY(-8px)' : 'translateY(0)',
      position: 'relative'
    }),

    imageContainer: {
      width: '100%',
      height: '220px',
      position: 'relative',
      overflow: 'hidden'
    },
    image: (isHovered) => ({
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      transition: 'transform 0.5s ease',
      transform: isHovered ? 'scale(1.05)' : 'scale(1)'
    }),
    imageOverlay: {
      position: 'absolute', inset: 0,
      background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 100%)'
    },
    // locationBadge: {
    //   position: 'absolute', bottom: '15px', left: '15px',
    //   background: 'rgba(255, 255, 255, 0.95)',
    //   padding: '6px 12px', borderRadius: '8px',
    //   fontSize: '12px', fontWeight: '600', color: '#0f172a',
    //   display: 'flex', alignItems: 'center', gap: '6px',
    //   boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    // },

    content: {
      padding: '25px',
      display: 'flex',
      flexDirection: 'column',
      flexGrow: 1
    },
    
    hubName: {
      fontSize: '22px', fontWeight: '800', color: '#1e293b',
      marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px'
    },
    
    descBox: {
      flexGrow: 1,
      marginBottom: '25px'
    },
    descText: {
      fontSize: '14px', color: '#64748b', lineHeight: '1.6',
      display: 'flex', gap: '10px', alignItems: 'start'
    },

    statsRow: {
      display: 'flex', gap: '15px', marginBottom: '20px'
    },
    statTag: {
      fontSize: '12px', fontWeight: '600', color: '#475569',
      background: '#f1f5f9', padding: '6px 10px', borderRadius: '6px',
      border: '1px solid #e2e8f0'
    },

    button: (isHovered) => ({
      width: '100%',
      padding: '14px',
      borderRadius: '12px',
      fontSize: '15px', fontWeight: '700',
      color: 'white',
      border: 'none',
      cursor: 'pointer',
      background: isHovered ? '#4338ca' : '#4f46e5', // Indigo
      transition: 'background 0.2s',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
      boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.2)'
    })
  };

  return (
    <div style={s.pageContainer}>
      
      {/* Hero Header */}
      <div style={s.hero}>
        <div style={s.badge}>
          <Building2 size={14}/> Student Accommodation
        </div>
        <h1 style={s.title}>Find Your Perfect Space</h1>
        <p style={s.subtitle}>
          Select a hub below to view available floors and rooms. 
          We provide safe, comfortable, and modern living spaces for your university life.
        </p>
      </div>

      {/* Grid */}
      <div style={s.grid}>
        {hubs.map((hub, index) => {
          const isHovered = hoveredCard === hub.id;
          
          return (
            <div 
              key={hub.id} 
              style={s.card(isHovered)}
              onMouseEnter={() => setHoveredCard(hub.id)}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => handleSelectHub(hub.id)}
            >
              {/* Image Area */}
              <div style={s.imageContainer}>
                {/* Methana wenas karanna:
                   hub.image thiyenawa nam eka ganna, nathnam DEFAULT_IMAGE ganna 
                */}
                <img 
                  src={hub.image ? hub.image : DEFAULT_IMAGE} 
                  alt="Hub" 
                  style={s.image(isHovered)} 
                  onError={(e) => { e.target.src = DEFAULT_IMAGE; }} // Image load bari unoth default ekata yanna
                />
              </div>  

              {/* Content Area */}
              <div style={s.content}>
                <h3 style={s.hubName}>{hub.hubNumber}</h3>
                
                <div style={s.statsRow}>
                    <span style={s.statTag}>{hub.noOfFloors || 0} Floors</span>
                    <span style={s.statTag}>{hub.noOfRooms || 0} Rooms</span>
                </div>

                <div style={s.descBox}>
                  <p style={s.descText}>
                    <Info size={16} color="#94a3b8" style={{minWidth:'16px', marginTop:'3px'}}/>
                    {hub.description} 
                  </p>
                </div>

                <button style={s.button(isHovered)}>
                  View Availability <ArrowRight size={18}/>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Home;