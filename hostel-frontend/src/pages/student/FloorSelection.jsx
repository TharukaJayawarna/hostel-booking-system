import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { toast } from 'react-toastify';
import { 
  Search, 
  ChevronDown, 
  ChevronUp, 
  DoorOpen, 
  Users, 
  BedDouble, 
  CheckCircle2, 
  MapPin, 
  ArrowRight,
  CalendarDays,
  User,
  UserCheck,
  Clock // Duration icon
} from 'lucide-react';

// Date Range Picker Libraries
import { DateRange } from 'react-date-range';
import { format, addDays, differenceInCalendarDays } from 'date-fns';
import 'react-date-range/dist/styles.css'; 
import 'react-date-range/dist/theme/default.css'; 

const FloorSelection = () => {
  const { hubId } = useParams();
  const navigate = useNavigate();

  // State for Date Range
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: addDays(new Date(), 1), 
      key: 'selection'
    }
  ]);
  
  const [openDate, setOpenDate] = useState(false); 
  const calendarRef = useRef(null); 

  // Other States
  const [availableData, setAvailableData] = useState({}); 
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [expandedFloor, setExpandedFloor] = useState(null);

  // --- DURATION CALCULATION ---
  const durationInDays = differenceInCalendarDays(dateRange[0].endDate, dateRange[0].startDate);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleClickOutside = (event) => {
    if (calendarRef.current && !calendarRef.current.contains(event.target)) {
      setOpenDate(false);
    }
  };

  // --- NEW: QUICK SELECT HANDLER ---
  const handleQuickDuration = (days) => {
    const newEndDate = addDays(dateRange[0].startDate, days);
    setDateRange([{
      startDate: dateRange[0].startDate,
      endDate: newEndDate,
      key: 'selection'
    }]);
  };

  // --- SEARCH LOGIC ---
  const handleSearch = async () => {
    // 1. Max 3 Months validation
    if (durationInDays > 90) {
      toast.error("Maximum booking duration is 3 months (90 days). Please select a shorter period.");
      return;
    }

    if (durationInDays <= 0) {
      toast.error("Invalid date range. Check-out must be after Check-in.");
      return;
    }

    // 2. Determine Room Type Logic
    let targetPeriod = 'DAILY'; 

    if (durationInDays % 30 === 0) {
        targetPeriod = 'MONTHLY'; // 30, 60, 90 days
    } else if (durationInDays % 7 === 0) {
        targetPeriod = 'WEEKLY';
    } else {
        targetPeriod = 'DAILY';
    }

    const checkIn = format(dateRange[0].startDate, 'yyyy-MM-dd');
    const checkOut = format(dateRange[0].endDate, 'yyyy-MM-dd');

    setLoading(true);
    setSearched(true);
    setAvailableData({});

    try {
      const response = await api.get(`/rooms/available`, {
        params: { hubId, checkIn, checkOut }
      });

      if (response.data.status === 'SUCCESS') {
        let rooms = response.data.data;

        // Filter based on period logic (updated in backend to send correct types)
        rooms = rooms.filter(room => {
            // If strictly monthly duration (30/60/90), allowing MONTHLY type rooms
            if (targetPeriod === 'MONTHLY') return true; 
            // Otherwise show DEFAULT rooms
            return room.reservationPeriod === 'DEFAULT';
        });
        
        // Group rooms by Floor AND then by Gender
        const grouped = rooms.reduce((acc, room) => {
          const floor = room.floorNumber || "General Floor";
          const gender = room.reservedFor; 

          if (!acc[floor]) {
            acc[floor] = { BOYS: [], GIRLS: [], totalCount: 0 };
          }

          if (gender === 'BOYS') acc[floor].BOYS.push(room);
          else if (gender === 'GIRLS') acc[floor].GIRLS.push(room);
          
          acc[floor].totalCount += 1;
          return acc;
        }, {});

        setAvailableData(grouped);
        
        const floorKeys = Object.keys(grouped);
        if (floorKeys.length > 0) setExpandedFloor(floorKeys[0]);

        if (rooms.length === 0) {
            toast.info(`No rooms available for ${durationInDays} days duration.`);
        }
      }
    } catch (error) {
      toast.error("Unable to find rooms. Please try different dates.");
    } finally {
      setLoading(false);
    }
  };

  const handleRoomSelect = (room) => {
    navigate(`/rooms/${room.id}/beds`, { 
      state: { 
        checkIn: format(dateRange[0].startDate, 'yyyy-MM-dd'), 
        checkOut: format(dateRange[0].endDate, 'yyyy-MM-dd'),
        reservedFor: room.reservedFor 
      } 
    });
  };

  // --- STYLES ---
  const s = {
    pageContainer: { minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: "'Inter', sans-serif", padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' },
    innerContainer: { width: '100%', maxWidth: '1000px' },
    headerSection: { textAlign: 'center', marginBottom: '30px' },
    title: { fontSize: '32px', fontWeight: '800', color: '#1e293b', marginBottom: '8px' },
    subtitle: { fontSize: '16px', color: '#64748b' },

    // Search Bar
    searchCard: {
      backgroundColor: 'white', padding: '10px 10px 10px 20px', borderRadius: '50px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center',
      border: '1px solid #e2e8f0', marginBottom: '40px', position: 'relative', zIndex: 50
    },
    dateDisplay: { flex: 1, cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingRight: '20px' },
    label: { fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#64748b', marginBottom: '2px' },
    dateValue: { fontSize: '15px', fontWeight: '600', color: '#334155', display: 'flex', alignItems: 'center', gap: '8px' },
    
    // Duration Badge in Search Bar
    durationBadge: {
        fontSize: '12px', fontWeight: '700', color: '#4f46e5', backgroundColor: '#eef2ff',
        padding: '4px 10px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '4px',
        marginLeft: '15px', whiteSpace: 'nowrap'
    },

    searchBtn: {
      backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '40px',
      padding: '14px 32px', fontSize: '15px', fontWeight: '700', cursor: 'pointer',
      display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s',
      boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)'
    },

    // Popup Styles
    calendarPopup: {
      position: 'absolute', top: '75px', left: '0', backgroundColor: 'white',
      borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
      border: '1px solid #e2e8f0', overflow: 'hidden', zIndex: 100, animation: 'fadeIn 0.2s ease-out'
    },
    quickSelectContainer: {
        padding: '15px', borderBottom: '1px solid #f1f5f9', backgroundColor: '#fafafa',
        display: 'flex', flexDirection: 'column', gap: '10px'
    },
    quickTitle: { fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' },
    quickBtnGroup: { display: 'flex', gap: '8px' },
    quickBtn: (isActive) => ({
        padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer',
        border: isActive ? '1px solid #4f46e5' : '1px solid #e2e8f0',
        backgroundColor: isActive ? '#4f46e5' : 'white',
        color: isActive ? 'white' : '#475569',
        transition: 'all 0.2s'
    }),
    durationDisplay: {
        textAlign: 'center', padding: '10px', fontSize: '14px', fontWeight: '700', 
        color: durationInDays > 90 ? '#ef4444' : '#4f46e5', 
        backgroundColor: durationInDays > 90 ? '#fef2f2' : '#eef2ff',
        borderTop: '1px solid #f1f5f9'
    },

    // Floor Group
    floorGroup: { marginBottom: '20px', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e2e8f0', backgroundColor: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' },
    floorHeader: (isOpen) => ({ padding: '20px 24px', backgroundColor: isOpen ? '#f8fafc' : 'white', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'background-color 0.2s' }),
    floorTitle: { fontSize: '16px', fontWeight: '700', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' },
    floorBadge: { fontSize: '12px', fontWeight: '600', backgroundColor: '#e0e7ff', color: '#4338ca', padding: '4px 10px', borderRadius: '20px' },
    
    genderSectionContainer: { padding: '24px', borderTop: '1px solid #f1f5f9' },
    genderHeader: (gender) => ({
        display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px',
        fontSize: '14px', fontWeight: '700', 
        color: gender === 'BOYS' ? '#2563eb' : '#db2777',
        backgroundColor: gender === 'BOYS' ? '#eff6ff' : '#fdf2f8',
        padding: '10px 15px', borderRadius: '10px', width: 'fit-content'
    }),
    roomsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' },
    roomCard: (gender) => ({ 
        border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', 
        cursor: 'pointer', transition: 'all 0.2s ease', position: 'relative', 
        backgroundColor: 'white', borderLeft: `4px solid ${gender === 'BOYS' ? '#3b82f6' : '#ec4899'}`
    }),
    roomCardHover: { transform: 'translateY(-4px)', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' },
    roomNumber: { fontSize: '18px', fontWeight: '800', color: '#1e293b', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' },
    roomMeta: { display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '12px', fontSize: '13px', color: '#64748b' },
    metaItem: { display: 'flex', alignItems: 'center', gap: '8px' },
    priceTag: { marginTop: '15px', paddingTop: '15px', borderTop: '1px dashed #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    priceLabel: { fontSize: '12px', color: '#94a3b8' },
    priceValue: { fontSize: '16px', fontWeight: '700', color: '#0f172a' },
    selectRoomBtn: { fontSize: '12px', fontWeight: '600', color: '#4f46e5', display: 'flex', alignItems: 'center', gap: '4px' }
  };

  const RoomList = ({ rooms, gender }) => (
    <div style={{marginBottom: '30px'}}>
      <div style={s.genderHeader(gender)}>
        {gender === 'BOYS' ? <User size={18}/> : <UserCheck size={18}/>}
        {gender === 'BOYS' ? "Boys' Wing" : "Girls' Wing"}
      </div>
      <div style={s.roomsGrid}>
        {rooms.map(room => (
            <div 
                key={room.id} 
                style={s.roomCard(room.reservedFor)}
                onClick={() => handleRoomSelect(room)}
                onMouseEnter={(e) => Object.assign(e.currentTarget.style, s.roomCardHover)}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
            >
                <div style={s.roomNumber}>
                    <DoorOpen size={20} color="#334155"/> {room.roomNumber}
                </div>
                <div style={s.roomMeta}>
                    <div style={s.metaItem}>
                        {room.isPrivate ? <CheckCircle2 size={14} color="#16a34a"/> : <Users size={14} color="#64748b"/>}
                        {room.isPrivate ? "Private Room" : "Shared Room"}
                    </div>
                    <div style={s.metaItem}>
                        <BedDouble size={14} color="#64748b"/>
                        {room.isPrivate ? "Full Room Booking" : "Single Bed Booking"}
                    </div>
                </div>
                <div style={s.priceTag}>
                    <div>
                        <span style={s.priceLabel}>Price ({room.reservationPeriod})</span>
                        <div style={s.priceValue}>
                            LKR {room.reservationPeriod === 'MONTHLY' ? room.price : (room.dailyPrice || room.price)}
                        </div>
                    </div>
                    <div style={s.selectRoomBtn}>Select <ArrowRight size={14}/></div>
                </div>
            </div>
        ))}
      </div>
    </div>
  );

  return (
    <div style={s.pageContainer}>
      <div style={s.innerContainer}>
        
        <div style={s.headerSection}>
          <h1 style={s.title}>Find Availability</h1>
          <p style={s.subtitle}>Select your preferred dates to see available rooms.</p>
        </div>

        {/* Search Box */}
        <div style={s.searchCard} ref={calendarRef}>
          <div style={s.dateDisplay} onClick={() => setOpenDate(!openDate)}>
            <span style={s.label}>Check-in — Check-out</span>
            <div style={s.dateValue}>
              <CalendarDays size={18} color="#4f46e5"/>
              {`${format(dateRange[0].startDate, "MMM dd")} ➜ ${format(dateRange[0].endDate, "MMM dd, yyyy")}`}
              
              {/* Duration Badge inside search bar */}
              <div style={s.durationBadge}>
                <Clock size={12}/> {durationInDays} Days
              </div>
            </div>
          </div>

          {openDate && (
            <div style={s.calendarPopup}>
              
              {/* --- 1. QUICK SELECT BUTTONS --- */}
              <div style={s.quickSelectContainer}>
                <div style={s.quickTitle}>Quick Select (Monthly)</div>
                <div style={s.quickBtnGroup}>
                    <button style={s.quickBtn(durationInDays === 30)} onClick={() => handleQuickDuration(30)}>30 Days</button>
                    <button style={s.quickBtn(durationInDays === 60)} onClick={() => handleQuickDuration(60)}>60 Days</button>
                    <button style={s.quickBtn(durationInDays === 90)} onClick={() => handleQuickDuration(90)}>90 Days</button>
                </div>
              </div>

              <DateRange
                editableDateInputs={true}
                onChange={item => setDateRange([item.selection])}
                moveRangeOnFirstSelection={false}
                ranges={dateRange}
                minDate={new Date()}
                rangeColors={['#4f46e5']}
                color="#4f46e5"
              />

              {/* --- 2. DURATION COUNT DISPLAY --- */}
              <div style={s.durationDisplay}>
                {durationInDays} Nights Selected
              </div>

              <div style={{padding:'10px', textAlign:'right', borderTop:'1px solid #f1f5f9'}}>
                  <button onClick={() => setOpenDate(false)} style={{padding:'8px 16px', borderRadius:'8px', background:'#f1f5f9', color:'#475569', border:'none', fontSize:'13px', fontWeight:'600', cursor:'pointer'}}>
                    Done
                  </button>
              </div>
            </div>
          )}

          <button 
            style={s.searchBtn} 
            onClick={handleSearch}
            disabled={loading}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            {loading ? "..." : <><Search size={18}/> Check Availability</>}
          </button>
        </div>

        {/* Results */}
        {searched && (
          <div style={{animation: 'fadeIn 0.5s'}}>
            {Object.keys(availableData).length === 0 ? (
              <div style={{textAlign: 'center', padding: '60px 0', color: '#94a3b8'}}>
                <div style={{background:'#f1f5f9', width:'60px', height:'60px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px'}}>
                    <CalendarDays size={30} color="#cbd5e1"/>
                </div>
                <h3 style={{fontSize:'18px', fontWeight:'700', color:'#475569', marginBottom:'5px'}}>No Rooms Available</h3>
                <p style={{fontSize:'14px'}}>Try changing your dates or explore other hubs.</p>
              </div>
            ) : (
              Object.entries(availableData).map(([floorName, groups]) => (
                <div key={floorName} style={s.floorGroup}>
                  <div 
                    style={s.floorHeader(expandedFloor === floorName)} 
                    onClick={() => setExpandedFloor(expandedFloor === floorName ? null : floorName)}
                  >
                    <div style={s.floorTitle}>
                        <div style={{background:'#e0e7ff', padding:'8px', borderRadius:'8px'}}><MapPin size={18} color="#4338ca"/></div>
                        {floorName}
                        <span style={s.floorBadge}>{groups.totalCount} Rooms</span>
                    </div>
                    {expandedFloor === floorName ? <ChevronUp size={20} color="#64748b"/> : <ChevronDown size={20} color="#64748b"/>}
                  </div>

                  {expandedFloor === floorName && (
                    <div style={s.genderSectionContainer}>
                        {groups.BOYS.length > 0 && <RoomList rooms={groups.BOYS} gender="BOYS" />}
                        {groups.GIRLS.length > 0 && <RoomList rooms={groups.GIRLS} gender="GIRLS" />}
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