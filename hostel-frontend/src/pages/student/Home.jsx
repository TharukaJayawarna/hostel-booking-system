import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80";

const Home = () => {
  const [hubs, setHubs] = useState([]);
  const navigate = useNavigate();

  const styles = {
  pageContainer: {
    width: '100%',
    minHeight: '100vh',
    padding: '50px 25px',
    textAlign: 'center',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#dbdce0ff',
    boxSizing: 'border-box'
  },
  
  headerSection: {
    marginBottom: '40px',
    maxWidth: '650px',
  },

  title: {
    fontSize: '34px',
    fontWeight: '800',
    color: '#222',
    marginBottom: '10px'
  },

  subtitle: {
    fontSize: '17px',
    color: '#666',
    lineHeight: '1.5'
  },

  gridContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '30px',
    width: '100%',
    maxWidth: '1100px',
    paddingBottom: '40px',
    boxSizing: 'border-box'
  },

  card: {
    backgroundColor: 'white',
    borderRadius: '18px',
    boxShadow: '0px 4px 18px rgba(0,0,0,0.07)',
    overflow: 'hidden',
    border: '1px solid rgba(0,0,0,0.04)',
    transition: '0.3s ease',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column'
  },

  image: {
    width: '100%',
    height: '210px',
    objectFit: 'cover'
  },

  cardContent: {
    padding: '22px',
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1
  },

  cardTitle: {
    fontSize: '20px',
    fontWeight: '700',
    marginBottom: '10px'
  },

  cardDesc: {
    fontSize: '14.5px',
    lineHeight: '1.6',
    color: '#555',
    marginBottom: '22px',
    flexGrow: 1
  },

  button: {
    padding: '12px',
    borderRadius: '40px',
    fontSize: '15px',
    fontWeight: '600',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    transition: '0.2s ease',
    width: '100%'
  }
};

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

  return (
    <div style={styles.pageContainer}>
      <div style={styles.headerSection}>
        <h1 style={styles.title}>Hub Selection</h1>
        <p style={styles.subtitle}>Choose your preferred accommodation hub to begin the booking process.</p>
      </div>
      <div style={styles.gridContainer}>
        {hubs.map((hub, index) => (
          <div 
            key={hub.id} 
            style={styles.card}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-8px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <img src={DEFAULT_IMAGE} alt="Hub" style={styles.image} />
            <div style={styles.cardContent}>
              <h3 style={styles.cardTitle}>{hub.hubNumber}</h3>
              <p style={styles.cardDesc}>
                {hub.hubNumber.includes('1') 
                  ? "Located near the Science and Engineering blocks. Offers both shared and single rooms." 
                  : "Situated by the Arts and Humanities faculty. Primarily suite-style living."}
              </p>
              <button 
                onClick={() => handleSelectHub(hub.id)}
                style={{
                  ...styles.button,
                  backgroundColor: index % 2 === 0 ? '#2b5c9e' : '#c59d3f' 
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                Select {hub.hubNumber}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;