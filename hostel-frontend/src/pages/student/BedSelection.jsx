import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { toast } from 'react-toastify';
import { 
  BedDouble, 
  CheckCircle2, 
  XCircle, 
  CalendarDays, 
  DoorOpen,
  ArrowLeft
} from 'lucide-react';

const BedSelection = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  // Extract reservedFor from location state
  const { checkIn, checkOut, reservedFor } = location.state || {}; 
  const [beds, setBeds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!checkIn || !checkOut) {
      toast.error("Please select dates first.");
      navigate('/'); 
      return;
    }
    fetchBeds();
  }, [roomId]);

  const fetchBeds = async () => {
    try {
      setLoading(true);
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
    if (bed.isBooked) return; // Cannot select booked beds

    // Pass all reservation details including reservedFor to the reservation page
    navigate('/reserve', { 
      state: { 
        bedId: bed.id, 
        bedNumber: bed.bedNumber,
        roomNumber: bed.roomNumber, 
        checkIn: checkIn,   
        checkOut: checkOut,
        reservedFor: reservedFor // <--- Added: Pass room gender restriction
      } 
    });
  };

  // --- STYLES ---
  const s = {
    pageContainer: {
      minHeight: '100vh',
      backgroundColor: '#f3f4f6',
      fontFamily: "'Inter', sans-serif",
      padding: '45px 20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    },
    innerContainer: { width: '100%', maxWidth: '1000px' },
    
    // Header
    headerSection: { 
      textAlign: 'center', 
      marginBottom: '50px',
      position: 'relative'
    },
    backBtn: {
      position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
      display: 'flex', alignItems: 'center', gap: '6px',
      color: '#64748b', fontSize: '14px', fontWeight: '600',
      background: 'transparent', border: 'none', cursor: 'pointer',
      padding: '8px 12px', borderRadius: '8px', transition: 'background 0.2s',
      ':hover': { background: '#f1f5f9' }
    },
    title: { fontSize: '32px', fontWeight: '800', color: '#1e293b', marginBottom: '8px' },
    subtitle: { 
      fontSize: '16px', color: '#64748b', 
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' 
    },
    dateBadge: {
      background: '#e0e7ff', color: '#4338ca', padding: '4px 12px',
      borderRadius: '20px', fontSize: '14px', fontWeight: '600'
    },

    // Grid
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
      gap: '25px',
      paddingBottom: '40px'
    },

    // Bed Card
    card: (isBooked) => ({
      backgroundColor: 'white',
      borderRadius: '20px',
      border: '1px solid #e2e8f0',
      padding: '25px',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      cursor: isBooked ? 'not-allowed' : 'pointer',
      transition: 'all 0.2s ease',
      opacity: isBooked ? 0.6 : 1,
      boxShadow: isBooked ? 'none' : '0 4px 6px -1px rgba(0,0,0,0.05)',
      position: 'relative',
      overflow: 'hidden'
    }),
    cardHover: {
      transform: 'translateY(-5px)',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      borderColor: '#4f46e5'
    },

    iconBox: (isBooked) => ({
      width: '60px', height: '60px', borderRadius: '50%',
      background: isBooked ? '#f1f5f9' : '#ecfdf5',
      color: isBooked ? '#94a3b8' : '#10b981',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      marginBottom: '15px',
      fontSize: '24px'
    }),

    bedTitle: { fontSize: '18px', fontWeight: '700', color: '#1e293b', marginBottom: '5px' },
    roomLabel: { fontSize: '12px', color: '#64748b', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px' },
    
    statusBadge: (isBooked) => ({
      marginTop: '15px',
      padding: '6px 14px', borderRadius: '20px',
      fontSize: '12px', fontWeight: '700', textTransform: 'uppercase',
      letterSpacing: '0.5px',
      backgroundColor: isBooked ? '#fef2f2' : '#f0fdf4',
      color: isBooked ? '#ef4444' : '#15803d',
      display: 'flex', alignItems: 'center', gap: '6px'
    }),

    // Empty/Loading
    centerMessage: { textAlign: 'center', color: '#94a3b8', marginTop: '60px' }
  };

  if (loading) return (
    <div style={{height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color:'#64748b', fontFamily:"'Inter', sans-serif"}}>
      <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:'15px'}}>
        <div style={{width:'40px', height:'40px', border:'3px solid #e2e8f0', borderTop:'3px solid #4f46e5', borderRadius:'50%', animation:'spin 1s linear infinite'}}></div>
        <span>Loading Beds...</span>
      </div>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={s.pageContainer}>
      <div style={s.innerContainer}>
        
        {/* Header */}
        <div style={s.headerSection}>
          <button 
            style={s.backBtn} 
            onClick={() => navigate(-1)}
            onMouseOver={(e) => e.currentTarget.style.background = '#f1f5f9'}
            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <ArrowLeft size={18}/> Back
          </button>
          
          <h1 style={s.title}>Choose Your Bed</h1>
          <div style={s.subtitle}>
            <CalendarDays size={16}/>
            Booking for <span style={s.dateBadge}>{checkIn}</span> to <span style={s.dateBadge}>{checkOut}</span>
          </div>
        </div>

        {/* Beds Grid */}
        <div style={s.grid}>
          {beds.length === 0 ? (
            <div style={{gridColumn: '1 / -1', ...s.centerMessage}}>
              <BedDouble size={48} style={{opacity: 0.3, marginBottom:'15px', margin: '0 auto'}}/>
              <h3>No beds found in this room.</h3>
              <p>Please try selecting a different room.</p>
            </div>
          ) : (
            beds.map(bed => (
              <div 
                key={bed.id} 
                style={s.card(bed.isBooked)}
                onClick={() => handleBedSelect(bed)}
                onMouseEnter={(e) => !bed.isBooked && Object.assign(e.currentTarget.style, s.cardHover)}
                onMouseLeave={(e) => !bed.isBooked && Object.assign(e.currentTarget.style, s.card(false))}
              >
                {/* Icon */}
                <div style={s.iconBox(bed.isBooked)}>
                  <BedDouble size={28} strokeWidth={1.5} />
                </div>

                {/* Info */}
                <div style={s.bedTitle}>{bed.bedNumber}</div>
                <div style={s.roomLabel}>
                    <DoorOpen size={12}/> {bed.roomNumber || "Room"}
                </div>

                {/* Status */}
                <div style={s.statusBadge(bed.isBooked)}>
                  {bed.isBooked ? <XCircle size={14}/> : <CheckCircle2 size={14}/>}
                  {bed.isBooked ? 'Occupied' : 'Available'}
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};

export default BedSelection;