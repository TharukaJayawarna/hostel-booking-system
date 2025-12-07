import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { toast } from 'react-toastify';

const BedSelection = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // FloorSelection එකෙන් එවපු Dates මෙතනින් ගන්නවා
  const { checkIn, checkOut } = location.state || {}; 

  const [beds, setBeds] = useState([]);
  const [loading, setLoading] = useState(true);

  // Styles Object (Inline CSS)
  const styles = {
    pageContainer: {
      width: '100vw',
      minHeight: '100vh',
      margin: '0',
      padding: '40px 20px',
      textAlign: 'center',
      fontFamily: "'Segoe UI', sans-serif",
      boxSizing: 'border-box',
      backgroundColor: '#dbdce0ff' 
    },
    innerContainer: {
      maxWidth: '1400px',
      margin: '0 auto',
      width: '100%'
    },
    title: {
      fontSize: '28px',
      color: '#2b5c9e',
      marginBottom: '10px',
      fontWeight: '800'
    },
    subtitle: {
      fontSize: '16px',
      color: '#666',
      marginBottom: '40px'
    },
    grid: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '20px',
      justifyContent: 'center'
    },
    bedCard: {
      width: '160px',
      padding: '25px',
      borderRadius: '15px',
      cursor: 'pointer',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
      transition: 'transform 0.2s, box-shadow 0.2s',
      border: '2px solid transparent',
      backgroundColor: 'white'
    },
    // Available Bed Style
    available: {
      borderColor: '#28a745',
      color: '#155724',
      backgroundColor: '#f0fff4'
    },
    // Booked Bed Style
    booked: {
      borderColor: '#dee2e6',
      color: '#adb5bd',
      backgroundColor: '#f8f9fa',
      cursor: 'not-allowed',
      opacity: 0.8
    },
    icon: {
      fontSize: '36px',
      marginBottom: '12px'
    },
    bedName: {
      fontSize: '18px',
      fontWeight: 'bold',
      marginBottom: '5px'
    },
    status: {
      fontSize: '12px',
      fontWeight: '600',
      textTransform: 'uppercase'
    }
  };

  useEffect(() => {
    // Dates නැත්නම් ආපහු මුලට යවන්න (Safety Check)
    if (!checkIn || !checkOut) {
      toast.error("Please select dates first.");
      navigate('/'); 
      return;
    }
    fetchBeds();
  }, [roomId]);

  const fetchBeds = async () => {
    try {
      const response = await api.get(`/rooms/${roomId}/beds`);
      if (response.data.status === 'SUCCESS') {
        setBeds(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching beds:", error);
      toast.error("Failed to load beds.");
    } finally {
      setLoading(false);
    }
  };

  const handleBedSelect = (bed) => {
    if (bed.isBooked) return; // Booked නම් Click කරන්න බෑ

    // Reservation පිටුවට අවශ්‍ය සියලුම දත්ත යවනවා
    navigate('/reserve', { 
      state: { 
        bedId: bed.id, 
        bedNumber: bed.bedNumber,
        roomNumber: bed.roomNumber, // Backend එකේ DTO එකේ මේක තියෙන්න ඕන
        checkIn: checkIn,   // FloorSelection එකෙන් ආපු දින
        checkOut: checkOut  // FloorSelection එකෙන් ආපු දින
      } 
    });
  };

  if (loading) return <div style={{textAlign: 'center', marginTop: '50px'}}>Loading Beds...</div>;

  return (
    <div style={styles.pageContainer}>
      <div style={styles.innerContainer}>
        <h2 style={styles.title}>Select Your Bed</h2>
        <p style={styles.subtitle}>
          Dates: <strong>{checkIn}</strong> to <strong>{checkOut}</strong>
        </p>

        <div style={styles.grid}>
          {beds.length === 0 ? <p>No beds found in this room.</p> : beds.map(bed => (
            <div 
              key={bed.id} 
              style={{
                ...styles.bedCard, 
                ...(bed.isBooked ? styles.booked : styles.available)
              }}
              onClick={() => handleBedSelect(bed)}
              onMouseOver={(e) => !bed.isBooked && (e.currentTarget.style.transform = 'translateY(-5px)')}
              onMouseOut={(e) => !bed.isBooked && (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <span style={styles.icon}>
                {bed.isBooked ? '🛏️' : '🛌'}
              </span>
              <span style={styles.bedName}>{bed.bedNumber}</span>
              <span style={styles.status}>
                {bed.isBooked ? 'Booked' : 'Available'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BedSelection;