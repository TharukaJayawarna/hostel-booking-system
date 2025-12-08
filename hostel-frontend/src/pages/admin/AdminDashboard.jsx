import React, { useEffect, useState } from 'react';
import api from '../../api/axiosConfig';
import { toast } from 'react-toastify';
import { 
  Building2, 
  Layers, // Floors සඳහා අයිකනය
  DoorOpen, 
  BedDouble, 
  CalendarDays, 
  TrendingUp, 
  Users, 
  DollarSign, 
  PieChart,
  Activity
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalHubs: 0,
    totalFloors: 0, // අලුතින් එකතු කරන ලදී
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
      // Floors දත්ත ලබා ගැනීමට API call එක එකතු කරන ලදී
      const [hubsRes, floorsRes, roomsRes, bedsRes, resRes] = await Promise.all([
        api.get('/hubs'),
        api.get('/floors'),
        api.get('/rooms'),
        api.get('/beds'),
        api.get('/reservations')
      ]);

      const hubs = hubsRes.data.data || [];
      const floors = floorsRes.data.data || [];
      const rooms = roomsRes.data.data || [];
      const beds = bedsRes.data.data || [];
      const reservations = resRes.data.data || [];

      // ගණනය කිරීම් (Calculations)
      const bookedCount = beds.filter(bed => bed.isBooked).length;
      const totalBedCount = beds.length;
      const availableCount = totalBedCount - bookedCount;
      
      // Occupancy Rate
      const occupancy = totalBedCount > 0 ? ((bookedCount / totalBedCount) * 100).toFixed(1) : 0;

      // Estimated Revenue
      const revenue = bookedCount * 15000; 

      setStats({
        totalHubs: hubs.length,
        totalFloors: floors.length, // Floors ගණන සකසන ලදී
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

  // --- STYLES ---
  const s = {
    container: { fontFamily: "'Inter', sans-serif", color: '#1f2937', paddingBottom: '40px' },
    
    // Header
    header: { marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'end' },
    title: { fontSize: '28px', fontWeight: '800', color: '#111827', margin: 0, letterSpacing: '-0.5px' },
    subTitle: { fontSize: '14px', color: '#6b7280', marginTop: '6px' },
    dateBadge: { background: 'white', padding: '8px 16px', borderRadius: '99px', fontSize: '13px', fontWeight: '600', color: '#4b5563', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '8px' },

    // Primary Grid (Key Metrics)
    mainGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '30px' },
    
    mainCard: (color) => ({
      background: 'white', padding: '24px', borderRadius: '16px',
      border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
      position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '10px'
    }),
    
    iconCircle: (bg, text) => ({
      width: '48px', height: '48px', borderRadius: '12px', background: bg, color: text,
      display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '5px'
    }),
    
    cardLabel: { fontSize: '14px', fontWeight: '600', color: '#6b7280' },
    cardValue: { fontSize: '32px', fontWeight: '800', color: '#111827', lineHeight: '1.2' },
    cardTrend: (positive) => ({ fontSize: '12px', fontWeight: '600', color: positive ? '#10b981' : '#f59e0b', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '5px' }),

    // Secondary Section (Inventory)
    sectionTitle: { fontSize: '18px', fontWeight: '700', color: '#374151', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' },
    inventoryGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' },
    
    invCard: {
        background: 'white', padding: '20px', borderRadius: '14px',
        border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '15px',
        transition: 'transform 0.2s', cursor: 'default'
    },
    invIcon: { width: '40px', height: '40px', borderRadius: '10px', background: '#f3f4f6', color: '#4b5563', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    invInfo: { display: 'flex', flexDirection: 'column' },
    invVal: { fontSize: '20px', fontWeight: '800', color: '#111827' },
    invLabel: { fontSize: '13px', color: '#6b7280', fontWeight: '500' }
  };

  if (loading) return <div style={{padding:'40px', textAlign:'center', color:'#9ca3af'}}>Loading Dashboard...</div>;

  return (
    <div style={s.container}>
      
      {/* 1. Header */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Dashboard Overview</h1>
          <p style={s.subTitle}>Welcome back! Here's what's happening at the hostel today.</p>
        </div>
        <div style={s.dateBadge}>
            <CalendarDays size={16}/> {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* 2. Main Metrics Grid */}
      <div style={s.mainGrid}>
        
        {/* Revenue */}
        <div style={s.mainCard()}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'start'}}>
                <div style={s.iconCircle('#eff6ff', '#2563eb')}>
                    <DollarSign size={24}/>
                </div>
                <div style={{opacity:0.1, transform:'scale(1.5)', color:'#2563eb'}}><DollarSign size={40}/></div>
            </div>
            <div>
                <div style={s.cardLabel}>Est. Monthly Revenue</div>
                <div style={s.cardValue}>LKR {(stats.estimatedRevenue / 1000).toFixed(1)}k</div>
                <div style={s.cardTrend(true)}>
                    <TrendingUp size={14}/> +12% from last month
                </div>
            </div>
        </div>

        {/* Occupancy */}
        <div style={s.mainCard()}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'start'}}>
                <div style={s.iconCircle('#f0fdf4', '#16a34a')}>
                    <PieChart size={24}/>
                </div>
                <div style={{opacity:0.1, transform:'scale(1.5)', color:'#16a34a'}}><PieChart size={40}/></div>
            </div>
            <div>
                <div style={s.cardLabel}>Occupancy Rate</div>
                <div style={s.cardValue}>{stats.occupancyRate}%</div>
                <div style={s.cardTrend(stats.occupancyRate > 50)}>
                    <Activity size={14}/> {stats.bookedBeds} beds occupied
                </div>
            </div>
        </div>

        {/* Active Reservations */}
        <div style={s.mainCard()}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'start'}}>
                <div style={s.iconCircle('#f5f3ff', '#7c3aed')}>
                    <CalendarDays size={24}/>
                </div>
                <div style={{opacity:0.1, transform:'scale(1.5)', color:'#7c3aed'}}><CalendarDays size={40}/></div>
            </div>
            <div>
                <div style={s.cardLabel}>Active Reservations</div>
                <div style={s.cardValue}>{stats.activeReservations}</div>
                <div style={{fontSize:'12px', color:'#6b7280', marginTop:'5px'}}>
                    Current active student bookings
                </div>
            </div>
        </div>

        {/* Available Beds */}
        <div style={s.mainCard()}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'start'}}>
                <div style={s.iconCircle('#fff7ed', '#ea580c')}>
                    <BedDouble size={24}/>
                </div>
                <div style={{opacity:0.1, transform:'scale(1.5)', color:'#ea580c'}}><BedDouble size={40}/></div>
            </div>
            <div>
                <div style={s.cardLabel}>Available Beds</div>
                <div style={s.cardValue}>{stats.availableBeds}</div>
                <div style={{fontSize:'12px', color:'#6b7280', marginTop:'5px'}}>
                    Ready for new allocation
                </div>
            </div>
        </div>

      </div>

      {/* 3. Inventory Section */}
      <div>
        <div style={s.sectionTitle}>
            <Building2 size={20} color="#4f46e5"/> Property Inventory
        </div>
        
        <div style={s.inventoryGrid}>
            
            <div style={s.invCard} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                <div style={{...s.invIcon, background:'#e0e7ff', color:'#4338ca'}}>
                    <Building2 size={20}/>
                </div>
                <div style={s.invInfo}>
                    <div style={s.invLabel}>Total Hubs</div>
                    <div style={s.invVal}>{stats.totalHubs}</div>
                </div>
            </div>

            {/* Total Floors Card - New */}
            <div style={s.invCard} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                <div style={{...s.invIcon, background:'#f0f9ff', color:'#0284c7'}}>
                    <Layers size={20}/>
                </div>
                <div style={s.invInfo}>
                    <div style={s.invLabel}>Total Floors</div>
                    <div style={s.invVal}>{stats.totalFloors}</div>
                </div>
            </div>

            <div style={s.invCard} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                <div style={{...s.invIcon, background:'#ecfdf5', color:'#047857'}}>
                    <DoorOpen size={20}/>
                </div>
                <div style={s.invInfo}>
                    <div style={s.invLabel}>Total Rooms</div>
                    <div style={s.invVal}>{stats.totalRooms}</div>
                </div>
            </div>

            <div style={s.invCard} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                <div style={{...s.invIcon, background:'#fffbeb', color:'#b45309'}}>
                    <BedDouble size={20}/>
                </div>
                <div style={s.invInfo}>
                    <div style={s.invLabel}>Total Beds</div>
                    <div style={s.invVal}>{stats.totalBeds}</div>
                </div>
            </div>

            <div style={s.invCard} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                <div style={{...s.invIcon, background:'#fef2f2', color:'#be123c'}}>
                    <Users size={20}/>
                </div>
                <div style={s.invInfo}>
                    <div style={s.invLabel}>Capacity</div>
                    <div style={s.invVal}>{stats.totalBeds > 0 ? `${stats.totalBeds} Students` : '0'}</div>
                </div>
            </div>

        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;