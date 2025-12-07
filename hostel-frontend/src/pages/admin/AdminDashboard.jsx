import React, { useEffect, useState } from 'react';
import api from '../../api/axiosConfig';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalHubs: 0,
    totalRooms: 0,
    totalBeds: 0,
    availableBeds: 0,
    bookedBeds: 0,
    activeReservations: 0,
    occupancyRate: 0,
    estimatedRevenue: 0
  });
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [hubsRes, roomsRes, bedsRes, resRes] = await Promise.all([
        api.get('/hubs'),
        api.get('/rooms'),
        api.get('/beds'),
        api.get('/reservations')
      ]);

      const hubs = hubsRes.data.data || [];
      const rooms = roomsRes.data.data || [];
      const beds = bedsRes.data.data || [];
      const reservations = resRes.data.data || [];

      // ගණනය කිරීම් (Calculations)
      const bookedCount = beds.filter(bed => bed.isBooked).length;
      const totalBedCount = beds.length;
      const availableCount = totalBedCount - bookedCount;
      
      // Occupancy Rate (පිරී ඇති ප්‍රතිශතය)
      const occupancy = totalBedCount > 0 ? ((bookedCount / totalBedCount) * 100).toFixed(1) : 0;

      // Estimated Revenue (දළ ආදායම) - Booked Beds * Room Price
      // සටහන: මෙය නිවැරදිවම ගැනීමට නම් Bed එක අයිති Room එකේ Price එක බලන්න වෙනවා.
      // දැනට සරලව Active Reservations වල එකතුව ගමු.
      // (API එකෙන් එන Reservation List එකේ Payment Amount එකක් තිබේ නම් එය එකතු කළ හැක)
      let revenue = 0;
      // හෝ සරලව: 15,000 * Booked Beds (සාමාන්‍ය අගයක් ලෙස)
      revenue = bookedCount * 15000; 

      setStats({
        totalHubs: hubs.length,
        totalRooms: rooms.length,
        totalBeds: totalBedCount,
        availableBeds: availableCount,
        bookedBeds: bookedCount,
        activeReservations: reservations.length,
        occupancyRate: occupancy,
        estimatedRevenue: revenue
      });

    } catch (error) {
      console.error("Error loading dashboard:", error);
      toast.error("Failed to load statistics.");
    } finally {
      setLoading(false);
    }
  };

  // --- Styles (Aesthetic Design) ---
  const styles = {
    container: { fontFamily: "'Inter', sans-serif", color: '#111827', paddingBottom: '40px' , backgroundColor: '#dbdce0ff' },
    
    // Header Section
    header: { marginBottom: '35px' },
    title: { fontSize: '28px', fontWeight: '800', letterSpacing: '-0.5px', color: '#151529' },
    subtitle: { color: '#8a92a6', fontSize: '15px', marginTop: '5px' },

    // Cards Grid
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '25px', marginBottom: '40px' },
    
    // Modern Gradient Cards
    card: {
      borderRadius: '20px', padding: '25px', color: 'white', position: 'relative', overflow: 'hidden',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '140px',
      transition: 'transform 0.3s ease', cursor: 'default'
    },
    
    // Card Variants (Gradients)
    purpleCard: { background: 'linear-gradient(135deg, #8E2DE2, #4A00E0)' }, // Reservations
    blueCard: { background: 'linear-gradient(135deg, #3a7bd5, #3a6073)' },   // Occupancy
    orangeCard: { background: 'linear-gradient(135deg, #FF416C, #FF4B2B)' }, // Revenue
    greenCard: { background: 'linear-gradient(135deg, #11998e, #38ef7d)' },  // Available Beds

    // Card Content
    cardIconOverlay: {
      position: 'absolute', right: '-10px', top: '-10px', fontSize: '100px', opacity: '0.1', transform: 'rotate(15deg)'
    },
    cardValue: { fontSize: '38px', fontWeight: '800', marginBottom: '5px', zIndex: 2 },
    cardLabel: { fontSize: '15px', fontWeight: '600', opacity: '0.9', zIndex: 2, textTransform: 'uppercase', letterSpacing: '1px' },
    cardSubtext: { fontSize: '13px', opacity: '0.8', marginTop: '10px', zIndex: 2 },

    // Quick Stats Row (White Cards)
    statsRow: { display: 'flex', gap: '20px', flexWrap: 'wrap' },
    miniCard: {
      flex: 1, minWidth: '200px', background: 'white', padding: '20px', borderRadius: '16px',
      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #f3f4f6',
      display: 'flex', alignItems: 'center', gap: '15px'
    },
    miniIcon: (bg, color) => ({
      width: '45px', height: '45px', borderRadius: '12px', background: bg, color: color,
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px'
    }),
    miniLabel: { fontSize: '13px', color: '#6b7280', fontWeight: '600' },
    miniValue: { fontSize: '20px', fontWeight: '800', color: '#111827' }
  };

  if (loading) return <div style={{padding:'40px', textAlign:'center', color:'#888'}}>Loading Dashboard...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Dashboard Overview</h1>
        <p style={styles.subtitle}>Welcome back! Here's what's happening in your hostel today.</p>
      </div>

      {/* --- Main Statistics Cards --- */}
      <div style={styles.grid}>
        
        {/* Active Reservations */}
        <div style={{...styles.card, ...styles.purpleCard}} onMouseOver={e => e.currentTarget.style.transform='translateY(-5px)'} onMouseOut={e => e.currentTarget.style.transform='translateY(0)'}>
          <div style={styles.cardIconOverlay}>📅</div>
          <div>
            <div style={styles.cardValue}>{stats.activeReservations}</div>
            <div style={styles.cardLabel}>Active Bookings</div>
          </div>
          <div style={styles.cardSubtext}>+2 new today</div>
        </div>

        {/* Occupancy Rate */}
        <div style={{...styles.card, ...styles.blueCard}} onMouseOver={e => e.currentTarget.style.transform='translateY(-5px)'} onMouseOut={e => e.currentTarget.style.transform='translateY(0)'}>
          <div style={styles.cardIconOverlay}>📊</div>
          <div>
            <div style={styles.cardValue}>{stats.occupancyRate}%</div>
            <div style={styles.cardLabel}>Occupancy Rate</div>
          </div>
          <div style={styles.cardSubtext}>{stats.bookedBeds} beds occupied</div>
        </div>

        {/* Available Beds */}
        <div style={{...styles.card, ...styles.greenCard}} onMouseOver={e => e.currentTarget.style.transform='translateY(-5px)'} onMouseOut={e => e.currentTarget.style.transform='translateY(0)'}>
          <div style={styles.cardIconOverlay}>🛏️</div>
          <div>
            <div style={styles.cardValue}>{stats.availableBeds}</div>
            <div style={styles.cardLabel}>Available Beds</div>
          </div>
          <div style={styles.cardSubtext}>Ready for booking</div>
        </div>

        {/* Estimated Revenue */}
        <div style={{...styles.card, ...styles.orangeCard}} onMouseOver={e => e.currentTarget.style.transform='translateY(-5px)'} onMouseOut={e => e.currentTarget.style.transform='translateY(0)'}>
          <div style={styles.cardIconOverlay}>💰</div>
          <div>
            <div style={styles.cardValue}>{(stats.estimatedRevenue / 1000).toFixed(1)}k</div>
            <div style={styles.cardLabel}>Est. Revenue (LKR)</div>
          </div>
          <div style={styles.cardSubtext}>Based on current occupancy</div>
        </div>

      </div>

      {/* --- Secondary Stats (Inventory) --- */}
      <h3 style={{fontSize:'18px', fontWeight:'700', marginBottom:'20px', color:'#374151'}}>Property Inventory</h3>
      
      <div style={styles.statsRow}>
        <div style={styles.miniCard}>
          <div style={styles.miniIcon('#eef2ff', '#4f46e5')}>🏢</div>
          <div>
            <div style={styles.miniLabel}>Total Hubs</div>
            <div style={styles.miniValue}>{stats.totalHubs}</div>
          </div>
        </div>

        <div style={styles.miniCard}>
          <div style={styles.miniIcon('#ecfdf5', '#10b981')}>🚪</div>
          <div>
            <div style={styles.miniLabel}>Total Rooms</div>
            <div style={styles.miniValue}>{stats.totalRooms}</div>
          </div>
        </div>

        <div style={styles.miniCard}>
          <div style={styles.miniIcon('#fffbeb', '#f59e0b')}>🛏️</div>
          <div>
            <div style={styles.miniLabel}>Total Beds</div>
            <div style={styles.miniValue}>{stats.totalBeds}</div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;