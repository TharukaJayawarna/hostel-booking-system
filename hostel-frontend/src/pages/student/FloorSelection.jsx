import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { toast } from 'react-toastify';
import { DateRange } from "react-date-range";
import { addDays } from "date-fns";



const FloorSelection = () => {
  const { hubId } = useParams();
  const navigate = useNavigate();

  // States
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [availableRooms, setAvailableRooms] = useState({}); // Grouped by Floor
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false); // Search කළාද බලන්න
  const [expandedFloor, setExpandedFloor] = useState(null);

  // Styles
  const styles = {
    container: { 
      width: '100vw', 
      minHeight: '100vh',
      margin: '0', 
      padding: '30px 20px', 
      fontFamily: 'sans-serif',
      boxSizing: 'border-box',
      backgroundColor: '#dbdce0ff' 
    },
    innerContainer: {
      maxWidth: '1400px',
      margin: '0 auto',
      width: '100%'
    },
    headerBox: { textAlign: 'center', marginBottom: '40px' },
    searchBox: { 
      background: '#fff', padding: '30px', borderRadius: '15px', 
      boxShadow: '0 8px 20px rgba(0,0,0,0.08)', display: 'flex', 
      flexWrap: 'wrap', gap: '20px', justifyContent: 'center', alignItems: 'end' 
    },
    inputGroup: { display: 'flex', flexDirection: 'column', textAlign: 'left', minWidth: '200px' },
    label: { marginBottom: '8px', fontSize: '14px', color: '#555', fontWeight: '600' },
    input: { padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '15px' },
    searchBtn: { 
      padding: '12px 30px', borderRadius: '8px', border: 'none', 
      background: '#2b5c9e', color: 'white', fontSize: '16px', fontWeight: 'bold', 
      cursor: 'pointer', transition: '0.3s'
    },
    // Accordion Styles
    floorCard: { 
      background: 'white', marginBottom: '15px', borderRadius: '10px', 
      border: '1px solid #eee', overflow: 'hidden' 
    },
    floorHeader: { 
      padding: '18px 25px', background: '#f8f9fa', cursor: 'pointer', 
      display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', color: '#333' 
    },
    roomsContainer: { 
      padding: '20px', 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', 
      gap: '20px' 
    },
    // Room Card
    roomCard: { 
      padding: '15px', border: '2px solid #eee', borderRadius: '12px', 
      cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left', position: 'relative' 
    },
    badge: { 
      position: 'absolute', top: '10px', right: '10px', fontSize: '11px', 
      padding: '4px 8px', borderRadius: '20px', color: 'white', fontWeight: 'bold'
    }
  };

  // --- Functions ---
  const handleSearch = async () => {
    if (!checkIn || !checkOut) {
      toast.error("Please select both Check-in and Check-out dates.");
      return;
    }

    setLoading(true);
    setSearched(true);
    setAvailableRooms({}); // Clear previous results

    try {
      const response = await api.get(`/rooms/available`, {
        params: { hubId, checkIn, checkOut }
      });

      if (response.data.status === 'SUCCESS') {
        const rooms = response.data.data;
        // Group rooms by Floor Number
        const grouped = rooms.reduce((acc, room) => {
          const floor = room.floorNumber || "Unknown Floor";
          if (!acc[floor]) acc[floor] = [];
          acc[floor].push(room);
          return acc;
        }, {});
        setAvailableRooms(grouped);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch available rooms.");
    } finally {
      setLoading(false);
    }
  };

  const handleRoomSelect = (roomId) => {
    // Dates ටිකත් ඊළඟ පිටුවට අරන් යනවා
    navigate(`/rooms/${roomId}/beds`, { state: { checkIn, checkOut } });
  };

  return (
    <div style={styles.container}>
      <div style={styles.innerContainer}>
        {/* 1. Date Selection Section */}
        <div style={styles.headerBox}>
          <h2 style={{color: '#222', marginBottom: '10px'}}>Select Your Dates</h2>
          <p style={{color: '#666'}}>Find the perfect room for your stay duration.</p>
        </div>

        <div style={styles.searchBox}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Check-in Date</label>
            <input 
              type="date" 
              style={styles.input} 
              value={checkIn} 
              onChange={(e) => setCheckIn(e.target.value)} 
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Check-out Date</label>
            <input 
              type="date" 
              style={styles.input} 
              value={checkOut} 
              onChange={(e) => setCheckOut(e.target.value)} 
            />
          </div>

          <button 
            style={styles.searchBtn} 
            onClick={handleSearch}
            disabled={loading}
          >
            {loading ? "Searching..." : "Check Availability"}
          </button>
        </div>

        <hr style={{border: '0', borderTop: '1px solid #eee', margin: '40px 0'}} />

        {/* 2. Available Rooms List (Grouped by Floor) */}
        {searched && (
          <div>
            {Object.keys(availableRooms).length === 0 ? (
              <div style={{textAlign: 'center', color: '#888'}}>
                <h3>No rooms available for selected dates.</h3>
                <p>Try changing the dates or selecting a different Hub.</p>
              </div>
            ) : (
              Object.entries(availableRooms).map(([floorName, rooms]) => (
                <div key={floorName} style={styles.floorCard}>
                  {/* Accordion Header */}
                  <div 
                    style={styles.floorHeader} 
                    onClick={() => setExpandedFloor(expandedFloor === floorName ? null : floorName)}
                  >
                    <span>{floorName} ({rooms.length} Available Rooms)</span>
                    <span>{expandedFloor === floorName ? '▲' : '▼'}</span>
                  </div>

                  {/* Rooms Grid */}
                  {expandedFloor === floorName && (
                    <div style={styles.roomsContainer}>
                      {rooms.map(room => (
                        <div 
                          key={room.id} 
                          style={{
                            ...styles.roomCard, 
                            borderColor: room.reservedFor === 'BOYS' ? '#2b5c9e' : '#e83e8c'
                          }}
                          onClick={() => handleRoomSelect(room.id)}
                          onMouseOver={(e) => e.currentTarget.style.borderColor = '#aaa'}
                          onMouseOut={(e) => e.currentTarget.style.borderColor = room.reservedFor === 'BOYS' ? '#2b5c9e' : '#e83e8c'}
                        >
                          <span style={{
                            ...styles.badge, 
                            background: room.reservedFor === 'BOYS' ? '#2b5c9e' : '#e83e8c'
                          }}>
                            {room.reservedFor}
                          </span>
                          <h3 style={{margin: '15px 0 5px', fontSize: '18px'}}>{room.roomNumber}</h3>
                          <div style={{color: '#666', fontSize: '13px'}}>
                            <p style={{margin: '2px 0'}}>{room.isPrivate ? "🔒 Private Room" : "👥 Shared Room"}</p>
                            <p style={{margin: '2px 0'}}>Price: LKR {room.price}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FloorSelection;