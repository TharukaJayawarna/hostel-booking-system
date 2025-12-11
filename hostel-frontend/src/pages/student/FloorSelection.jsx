import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { useNotification } from '../../context/NotificationContext';
import { 
  Search, 
  DoorOpen, 
  Users, 
  BedDouble, 
  CheckCircle2, 
  MapPin, 
  ArrowRight,
  CalendarDays,
  User,
  UserCheck,
  Clock,
  ArrowLeft,
  Layers
} from 'lucide-react';

import { DateRange } from 'react-date-range';
import { format, addDays, differenceInCalendarDays } from 'date-fns';
import 'react-date-range/dist/styles.css'; 
import 'react-date-range/dist/theme/default.css'; 

const FloorSelection = () => {
  const notify = useNotification();
  const { hubId } = useParams();
  const navigate = useNavigate();

  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: addDays(new Date(), 1), 
      key: 'selection'
    }
  ]);
  
  const [openDate, setOpenDate] = useState(false); 
  const calendarRef = useRef(null); 

  const [availableData, setAvailableData] = useState({}); 
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  
  const [selectedCategory, setSelectedCategory] = useState(null);

  const durationInDays = differenceInCalendarDays(dateRange[0].endDate, dateRange[0].startDate);
  const [maxBookingDays, setMaxBookingDays] = useState(90);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchSettings = async () => {
        try {
            const res = await api.get('/settings/max-days');
            if (res.data.status === 'SUCCESS') {
                setMaxBookingDays(res.data.data);
            }
        } catch (e) {
            console.error("Failed to fetch settings");
        }
    };
    fetchSettings();
  }, []);

  const handleClickOutside = (event) => {
    if (calendarRef.current && !calendarRef.current.contains(event.target)) {
      setOpenDate(false);
    }
  };

  const handleQuickDuration = (days) => {
    const newEndDate = addDays(dateRange[0].startDate, days);
    setDateRange([{
      startDate: dateRange[0].startDate,
      endDate: newEndDate,
      key: 'selection'
    }]);
  };

  const handleSearch = async () => {
    if (durationInDays > maxBookingDays) {
      notify.error(`Maximum booking duration is ${Math.floor(maxBookingDays/30)} months (${maxBookingDays} days).`);
      return;
    }
    if (durationInDays <= 0) {
      notify.error("Invalid date range.");
      return;
    }

    let targetPeriod = 'DAILY'; 
    if (durationInDays % 30 === 0) targetPeriod = 'MONTHLY'; 
    else if (durationInDays % 7 === 0) targetPeriod = 'WEEKLY';

    const checkIn = format(dateRange[0].startDate, 'yyyy-MM-dd');
    const checkOut = format(dateRange[0].endDate, 'yyyy-MM-dd');

    setLoading(true);
    setSearched(true);
    setAvailableData({});
    setSelectedCategory(null);

    try {
      const response = await api.get(`/rooms/available`, {
        params: { hubId, checkIn, checkOut }
      });

      if (response.data.status === 'SUCCESS') {
        let rooms = response.data.data;

        // Filter: Hide private rooms & check duration
        rooms = rooms.filter(room => {
            if (room.isPrivate) return false; // Private rooms hide කරන්න
            if (targetPeriod === 'MONTHLY') return true; 
            return room.reservationPeriod === 'DEFAULT';
        });
        
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

        if (rooms.length === 0) {
            notify.info(`No shared rooms available for ${durationInDays} days.`);
        }
      }
    } catch (error) {
      notify.error("Unable to find rooms. Please try different dates.");
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

    searchCard: {
      backgroundColor: 'white', padding: '10px 10px 10px 20px', borderRadius: '50px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center',
      border: '1px solid #e2e8f0', marginBottom: '40px', position: 'relative', zIndex: 50
    },
    dateDisplay: { flex: 1, cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingRight: '20px' },
    label: { fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#64748b', marginBottom: '2px' },
    dateValue: { fontSize: '15px', fontWeight: '600', color: '#334155', display: 'flex', alignItems: 'center', gap: '8px' },
    durationBadge: { fontSize: '12px', fontWeight: '700', color: '#4f46e5', backgroundColor: '#eef2ff', padding: '4px 10px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '15px', whiteSpace: 'nowrap' },
    searchBtn: { backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '40px', padding: '14px 32px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)' },

    calendarPopup: { position: 'absolute', top: '75px', left: '0', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', border: '1px solid #e2e8f0', overflow: 'hidden', zIndex: 100, animation: 'fadeIn 0.2s ease-out' },
    quickSelectContainer: { padding: '15px', borderBottom: '1px solid #f1f5f9', backgroundColor: '#fafafa', display: 'flex', flexDirection: 'column', gap: '10px' },
    quickTitle: { fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' },
    quickBtnGroup: { display: 'flex', gap: '8px' },
    quickBtn: (isActive) => ({ padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', border: isActive ? '1px solid #4f46e5' : '1px solid #e2e8f0', backgroundColor: isActive ? '#4f46e5' : 'white', color: isActive ? 'white' : '#475569', transition: 'all 0.2s' }),
    durationDisplay: { textAlign: 'center', padding: '10px', fontSize: '14px', fontWeight: '700', color: durationInDays > 90 ? '#ef4444' : '#4f46e5', backgroundColor: durationInDays > 90 ? '#fef2f2' : '#eef2ff', borderTop: '1px solid #f1f5f9' },

    // --- NEW FLOOR ROW STYLES ---
    floorRow: { 
        marginBottom: '30px', 
        width: '100%',
        animation: 'fadeIn 0.3s ease-out'
    },
    floorLabel: { 
        fontSize: '14px', fontWeight: '700', color: '#64748b', 
        marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '0.5px',
        display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '5px'
    },
    genderGrid: { 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', // Cards දෙකක් දෙපැත්තට
        gap: '20px' 
    },

    categoryCard: (gender) => ({
        backgroundColor: 'white', borderRadius: '16px', padding: '25px', cursor: 'pointer',
        border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
        display: 'flex', flexDirection: 'column', gap: '15px', transition: 'all 0.2s',
        borderLeft: `5px solid ${gender === 'BOYS' ? '#3b82f6' : '#ec4899'}`
    }),
    catHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    catTitle: { fontSize: '18px', fontWeight: '800', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' },
    catBadge: (gender) => ({
        backgroundColor: gender === 'BOYS' ? '#eff6ff' : '#fdf2f8',
        color: gender === 'BOYS' ? '#2563eb' : '#db2777',
        padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase'
    }),
    catStats: { fontSize: '14px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' },

    // --- ROOM LIST STYLES ---
    roomsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', animation: 'fadeIn 0.3s ease-out' },
    roomCard: { border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', cursor: 'pointer', transition: 'all 0.2s ease', backgroundColor: 'white' },
    roomNumber: { fontSize: '18px', fontWeight: '800', color: '#1e293b', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' },
    roomMeta: { display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '12px', fontSize: '13px', color: '#64748b' },
    metaItem: { display: 'flex', alignItems: 'center', gap: '8px' },
    priceTag: { marginTop: '15px', paddingTop: '15px', borderTop: '1px dashed #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    priceLabel: { fontSize: '12px', color: '#94a3b8' },
    priceValue: { fontSize: '16px', fontWeight: '700', color: '#0f172a' },
    selectRoomBtn: { fontSize: '12px', fontWeight: '600', color: '#4f46e5', display: 'flex', alignItems: 'center', gap: '4px' },
    
    backLink: {
        display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '20px',
        color: '#64748b', fontWeight: '600', fontSize: '14px', cursor: 'pointer',
        background: 'white', padding: '8px 16px', borderRadius: '10px', border: '1px solid #e2e8f0'
    }
  };

  return (
    <div style={s.pageContainer}>
      <div style={s.innerContainer}>
        
        <div style={s.headerSection}>
          <h1 style={s.title}>Check Availability</h1>
          <p style={s.subtitle}>Select your dates to find available accommodation.</p>
        </div>

        {/* Search Box */}
        <div style={s.searchCard} ref={calendarRef}>
          <div style={s.dateDisplay} onClick={() => setOpenDate(!openDate)}>
            <span style={s.label}>Check-in — Check-out</span>
            <div style={s.dateValue}>
              <CalendarDays size={18} color="#4f46e5"/>
              {`${format(dateRange[0].startDate, "MMM dd")} ➜ ${format(dateRange[0].endDate, "MMM dd, yyyy")}`}
              <div style={s.durationBadge}><Clock size={12}/> {durationInDays} Days</div>
            </div>
          </div>

          {openDate && (
            <div style={s.calendarPopup}>
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
              <div style={s.durationDisplay}>{durationInDays} Nights Selected</div>
              <div style={{padding:'10px', textAlign:'right', borderTop:'1px solid #f1f5f9'}}>
                  <button onClick={() => setOpenDate(false)} style={{padding:'8px 16px', borderRadius:'8px', background:'#f1f5f9', color:'#475569', border:'none', fontSize:'13px', fontWeight:'600', cursor:'pointer'}}>Done</button>
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

        {/* --- RESULTS SECTION --- */}
        {searched && (
          <div style={{width:'100%'}}>
            {Object.keys(availableData).length === 0 ? (
              <div style={{textAlign: 'center', padding: '60px 0', color: '#94a3b8'}}>
                <div style={{background:'#f1f5f9', width:'60px', height:'60px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px'}}>
                    <CalendarDays size={30} color="#cbd5e1"/>
                </div>
                <h3 style={{fontSize:'18px', fontWeight:'700', color:'#475569', marginBottom:'5px'}}>No Shared Rooms Available</h3>
                <p style={{fontSize:'14px'}}>Try changing your dates or explore other hubs.</p>
              </div>
            ) : (
              <>
                {/* STEP 1: Select Category (Grouped by Floor) */}
                {!selectedCategory && (
                    <div style={{width:'100%'}}>
                        {Object.entries(availableData)
                         // Sort floors naturally (1st, 2nd, 3rd...)
                         .sort((a,b) => a[0].localeCompare(b[0], undefined, {numeric: true}))
                         .map(([floorName, groups]) => {
                             // Only render row if there are rooms
                             if (groups.BOYS.length === 0 && groups.GIRLS.length === 0) return null;
                             
                             return (
                                <div key={floorName} style={s.floorRow}>
                                    <div style={s.floorLabel}><Layers size={18}/> {floorName}</div>
                                    <div style={s.genderGrid}>
                                        
                                        {/* Boys Option */}
                                        {groups.BOYS.length > 0 && (
                                            <div 
                                                style={s.categoryCard('BOYS')} 
                                                onClick={() => setSelectedCategory({ floor: floorName, gender: 'BOYS' })}
                                                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                                                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                            >
                                                <div style={s.catHeader}>
                                                    <div style={s.catTitle}><User size={20}/> Boys Wing</div>
                                                    <span style={s.catBadge('BOYS')}>Available</span>
                                                </div>
                                                <div style={s.catStats}>
                                                    <DoorOpen size={16}/> {groups.BOYS.length} Rooms ({floorName})
                                                </div>
                                                <div style={{fontSize:'13px', color:'#94a3b8', marginTop:'5px'}}>Tap to view rooms</div>
                                            </div>
                                        )}

                                        {/* Girls Option */}
                                        {groups.GIRLS.length > 0 && (
                                            <div 
                                                style={s.categoryCard('GIRLS')} 
                                                onClick={() => setSelectedCategory({ floor: floorName, gender: 'GIRLS' })}
                                                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                                                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                            >
                                                <div style={s.catHeader}>
                                                    <div style={s.catTitle}><UserCheck size={20}/> Girls Wing</div>
                                                    <span style={s.catBadge('GIRLS')}>Available</span>
                                                </div>
                                                <div style={s.catStats}>
                                                    <DoorOpen size={16}/> {groups.GIRLS.length} Rooms ({floorName})
                                                </div>
                                                <div style={{fontSize:'13px', color:'#94a3b8', marginTop:'5px'}}>Tap to view rooms</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                             );
                        })}
                    </div>
                )}

                {/* STEP 2: Show Rooms for Selected Category */}
                {selectedCategory && (
                    <div style={{width:'100%'}}>
                        <button style={s.backLink} onClick={() => setSelectedCategory(null)}>
                            <ArrowLeft size={16}/> Back to Floors
                        </button>
                        
                        <div style={{marginBottom:'20px', fontSize:'18px', fontWeight:'800', color:'#1e293b'}}>
                            Available Rooms: {selectedCategory.floor} ({selectedCategory.gender === 'BOYS' ? "Boys" : "Girls"})
                        </div>

                        <div style={s.roomsGrid}>
                            {availableData[selectedCategory.floor][selectedCategory.gender].map(room => (
                                <div 
                                    key={room.id} 
                                    style={s.roomCard}
                                    onClick={() => handleRoomSelect(room)}
                                    onMouseEnter={(e) => { e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow='0 10px 25px -5px rgba(0,0,0,0.1)'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='none'; }}
                                >
                                    <div style={s.roomNumber}>
                                        <DoorOpen size={20} color="#334155"/> {room.roomNumber}
                                    </div>
                                    <div style={s.roomMeta}>
                                        <div style={s.metaItem}>
                                            <Users size={14} color="#64748b"/> Shared Room
                                        </div>
                                        <div style={s.metaItem}>
                                            <BedDouble size={14} color="#64748b"/>
                                            Single Bed Booking
                                        </div>
                                    </div>
                                    <div style={s.priceTag}>
                                        <div>
                                            <span style={s.priceLabel}>Price ({room.reservationPeriod})</span>
                                            <div style={s.priceValue}>
                                                LKR {room.reservationPeriod === 'MONTHLY' ? room.monthlyPrice : (room.dailyPrice || room.monthlyPrice)}
                                            </div>
                                        </div>
                                        <div style={s.selectRoomBtn}>Select <ArrowRight size={14}/></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
              </>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default FloorSelection;