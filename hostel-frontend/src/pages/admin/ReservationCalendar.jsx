import React, { useEffect, useState, useRef } from 'react';
import api from '../../api/axiosConfig';
import { toast } from 'react-toastify';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameDay, 
  addMonths, 
  subMonths,
  parseISO,
  differenceInCalendarDays 
} from 'date-fns';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  User, 
  Clock, 
  BedDouble,
  Info ,
  Search
} from 'lucide-react';

const ReservationCalendar = () => {
  const [beds, setBeds] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [hoveredRes, setHoveredRes] = useState(null);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

  const [searchTerm, setSearchTerm] = useState('');

  const filteredBeds = beds.filter(bed => 
    bed.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bed.bedNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Scroll Sync Refs
  const sidebarRef = useRef(null);
  const timelineRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bedsRes, resRes] = await Promise.all([
        api.get('/beds'),
        api.get('/reservations')
      ]);

      if (bedsRes.data.status === 'SUCCESS') {
        // Sort beds by Room Number then Bed Number
        const sortedBeds = bedsRes.data.data.sort((a, b) => 
          a.roomNumber.localeCompare(b.roomNumber) || a.bedNumber.localeCompare(b.bedNumber)
        );
        setBeds(sortedBeds);
      }
      if (resRes.data.status === 'SUCCESS') {
        setReservations(resRes.data.data);
      }
    } catch (error) {
      toast.error("Failed to load calendar data.");
    } finally {
      setLoading(false);
    }
  };

  // Date Navigation
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate)
  });

  // Mouse Event Handlers
  const handleMouseEnter = (e, res) => {
    setHoveredRes(res);
    updateCursorPos(e);
  };

  const handleMouseMove = (e) => {
    updateCursorPos(e);
  };

  const updateCursorPos = (e) => {
    // Tooltip offset
    const x = e.clientX + 20; 
    const y = e.clientY + 20;
    setCursorPos({ x, y });
  };

  const handleMouseLeave = () => {
    setHoveredRes(null);
  };

  // Sync scrolling between sidebar and timeline
  const handleScroll = (e) => {
    if (sidebarRef.current) {
      sidebarRef.current.scrollTop = e.target.scrollTop;
    }
  };

  const getReservationsForBed = (bedNumber) => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);

    return reservations.filter(res => {
      if (res.bedNumber !== bedNumber) return false;
      const resStart = parseISO(res.checkIn);
      const resEnd = parseISO(res.checkOut);
      // Check if reservation overlaps with current month
      return (resStart <= monthEnd && resEnd >= monthStart);
    });
  };

  // --- CONSTANTS & STYLES ---
  const CELL_WIDTH = 40;
  const ROW_HEIGHT = 70;
  const HEADER_HEIGHT = 60;

  const s = {
    pageContainer: {
      fontFamily: "'Inter', sans-serif",
      color: '#1f2937',
      height: 'calc(100vh - 10px)', // Fit to screen minus padding
      display: 'flex',
      flexDirection: 'column',
      background: '#f8fafc',
      overflow: 'hidden'
    },
    
    // --- Header Section ---
    headerBar: {
      padding: '20px 30px',
      background: 'white',
      borderBottom: '1px solid #e2e8f0',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)',
      zIndex: 20
    },
    headerLeft: { display: 'flex', alignItems: 'center', gap: '15px' },
    titleIcon: {
      background: '#e0e7ff', color: '#4338ca', padding: '10px',
      borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center'
    },
    monthTitle: { fontSize: '24px', fontWeight: '800', color: '#1e293b', margin: 0, lineHeight: 1 },
    subTitle: { fontSize: '14px', color: '#64748b', fontWeight: '500', marginTop: '4px' },

    controls: { display: 'flex', gap: '12px', alignItems: 'center', background: '#f1f5f9', padding: '4px', borderRadius: '12px' },
    navBtn: {
      padding: '8px 12px', borderRadius: '8px', border: 'none',
      background: 'transparent', cursor: 'pointer', color: '#475569',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'all 0.2s'
    },
    todayBtn: {
      padding: '8px 16px', borderRadius: '8px', border: 'none',
      background: 'white', color: '#0f172a', fontWeight: '700',
      fontSize: '13px', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
    },

    searchWrapper: {
        display: 'flex', alignItems: 'center', gap: '10px', 
        background: '#f1f5f9', padding: '8px 15px', borderRadius: '12px', 
        border: '1px solid #e2e8f0', width: '300px', marginRight: '20px'
    },
    searchInput: {
        border: 'none', background: 'transparent', outline: 'none', 
        width: '100%', fontSize: '14px', color: '#334155'
    },

    // --- Main Grid Layout ---
    contentArea: {
      display: 'flex',
      flex: 1,
      overflow: 'hidden',
      background: 'white',
      position: 'relative',
      paddingBottom: '10px'
    },

    // Sidebar (Left Column)
    sidebar: {
      width: '100px',
      flexShrink: 0,
      borderRight: '1px solid #e2e8f0',
      background: 'white',
      overflow: 'hidden', // Scroll is controlled by timeline scroll
      zIndex: 10
    },
    sidebarHeaderCell: {
      height: `${HEADER_HEIGHT}px`,
      borderBottom: '1px solid #e2e8f0',
      background: '#f8fafc',
      display: 'flex', alignItems: 'center', paddingLeft: '24px',
      fontSize: '7px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em'
    },
    sidebarRow: {
      height: `${ROW_HEIGHT}px`,
      borderBottom: '1px solid #f1f5f9',
      display: 'flex', flexDirection: 'column', justifyContent: 'center',
      paddingLeft: '27px', boxSizing: 'border-box'
    },
    roomText: { fontWeight: '700', fontSize: '15px', color: '#334155' },
    bedText: { fontSize: '13px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' },

    // Timeline (Right Scrollable Area)
    timelineContainer: {
      flex: 1,
      overflow: 'auto',
      position: 'relative'
    },
    timelineHeaderRow: {
      display: 'flex',
      height: `${HEADER_HEIGHT}px`,
      position: 'sticky', top: 0, zIndex: 15,
      background: '#f8fafc',
      boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
    },
    dayCell: (isToday) => ({
      minWidth: `${CELL_WIDTH}px`,
      maxWidth: `${CELL_WIDTH}px`,
      borderRight: '1px solid #f1f5f9',
      borderBottom: '1px solid #e2e8f0',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      background: isToday ? '#eff6ff' : 'transparent',
      color: isToday ? '#2563eb' : '#475569'
    }),
    dayName: { fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', opacity: 0.7 },
    dayNumber: { fontSize: '16px', fontWeight: '700' },

    // Grid Body
    gridBody: { position: 'relative' },
    gridRow: {
      height: `${ROW_HEIGHT}px`,
      borderBottom: '1px solid #f1f5f9',
      display: 'flex', position: 'relative',
      backgroundImage: 'linear-gradient(to right, #f8fafc 1px, transparent 1px)',
      backgroundSize: `${CELL_WIDTH}px 100%`
    },

    // Reservation Pill
    resPill: (start, duration, status) => {
      const isPending = status === 'PENDING';
      return {
        position: 'absolute',
        top: '12px', height: `${ROW_HEIGHT - 24}px`,
        left: `${start * CELL_WIDTH + 4}px`,
        width: `${duration * CELL_WIDTH - 8}px`,
        background: isPending 
            ? 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)' 
            : 'linear-gradient(135deg, #34d399 0%, #059669 100%)',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        color: 'white', fontSize: '12px', fontWeight: '600',
        display: 'flex', alignItems: 'center', padding: '0 12px',
        cursor: 'pointer', zIndex: 5, overflow: 'hidden', whiteSpace: 'nowrap',
        transition: 'transform 0.1s, box-shadow 0.1s',
      };
    },

    // Tooltip
    tooltip: {
      position: 'fixed', top: cursorPos.y, left: cursorPos.x,
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(8px)',
      padding: '16px', borderRadius: '16px',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e2e8f0', zIndex: 1000, minWidth: '280px', pointerEvents: 'none',
      animation: 'fadeIn 0.15s ease-out'
    },
    tooltipHeader: { fontSize: '14px', fontWeight: '700', color: '#0f172a', marginBottom: '12px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    tooltipRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px' },
    tooltipLabel: { color: '#64748b' },
    tooltipVal: { fontWeight: '600', color: '#334155' }
  };

  if (loading) return <div style={{height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color:'#64748b'}}>Loading Calendar...</div>;

  return (
    <div style={s.pageContainer}>
      
      {/* 1. HEADER */}
      <div style={s.headerBar}>
        <div style={s.headerLeft}>
          <div style={s.titleIcon}><CalendarIcon size={24}/></div>
          <div>
            <h2 style={s.monthTitle}>{format(currentDate, 'MMMM yyyy')}</h2>
            <div style={s.subTitle}>Booking Overview & Timeline</div>
          </div>
        </div>

        {/* --- NEW: SEARCH BAR --- */}
        <div style={{display:'flex', alignItems:'center'}}>
            <div style={s.searchWrapper}>
                <Search size={18} color="#94a3b8"/>
                <input 
                    style={s.searchInput} 
                    placeholder="Search Room or Bed..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div style={s.controls}>
              <button 
                style={s.navBtn} 
                onClick={prevMonth}
                onMouseOver={(e) => e.currentTarget.style.background = '#e2e8f0'}
                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <ChevronLeft size={20}/>
              </button>
              <button style={s.todayBtn} onClick={goToToday}>Today</button>
              <button 
                style={s.navBtn} 
                onClick={nextMonth}
                onMouseOver={(e) => e.currentTarget.style.background = '#e2e8f0'}
                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <ChevronRight size={20}/>
              </button>
            </div>
        </div>
      </div>

      {/* 2. CALENDAR GRID */}
      <div style={s.contentArea}>
        
        {/* Left Sidebar (Rooms) */}
        <div style={s.sidebar} ref={sidebarRef}>
          <div style={s.sidebarHeaderCell}>Accommodation Unit</div>
          {/* මෙතන beds වෙනුවට filteredBeds දාන්න */}
          {filteredBeds.map(bed => (
            <div key={bed.id} style={s.sidebarRow}>
              <div style={s.roomText}>{bed.roomNumber}</div>
              <div style={s.bedText}><BedDouble size={14}/> {bed.bedNumber}</div>
            </div>
          ))}
        </div>

        {/* Right Timeline */}
        <div style={s.timelineContainer} ref={timelineRef} onScroll={handleScroll}>
          <div style={{width: `${daysInMonth.length * CELL_WIDTH}px`}}>
            
            {/* Days Header */}
            <div style={s.timelineHeaderRow}>
              {daysInMonth.map(day => {
                const isToday = isSameDay(day, new Date());
                return (
                  <div key={day.toString()} style={s.dayCell(isToday)}>
                    <span style={s.dayName}>{format(day, 'EEE')}</span>
                    <span style={s.dayNumber}>{format(day, 'd')}</span>
                  </div>
                );
              })}
            </div>

            {/* Grid Body */}
            <div style={s.gridBody}>
              {filteredBeds.map(bed => {
                const bedRes = getReservationsForBed(bed.bedNumber);
                
                return (
                  <div key={bed.id} style={s.gridRow}>
                    {bedRes.map(res => {
                      const resStart = parseISO(res.checkIn);
                      const resEnd = parseISO(res.checkOut);
                      const monthStart = startOfMonth(currentDate);

                      // Calculate position relative to the current month view
                      let startIndex = Math.max(0, (resStart - monthStart) / (1000 * 60 * 60 * 24));
                      if (resStart < monthStart) startIndex = 0; 

                      const endOfView = endOfMonth(currentDate) < resEnd ? endOfMonth(currentDate) : resEnd;
                      const startOfView = resStart < monthStart ? monthStart : resStart;
                      
                      const duration = Math.ceil((endOfView - startOfView) / (1000 * 60 * 60 * 24)) + 1;

                      if (duration <= 0) return null;

                      return (
                        <div 
                          key={res.id}
                          style={{
                            ...s.resPill(startIndex, duration, res.status),
                            transform: hoveredRes?.id === res.id ? 'translateY(-2px)' : 'none',
                            boxShadow: hoveredRes?.id === res.id ? '0 4px 12px rgba(0,0,0,0.15)' : '0 2px 4px rgba(0,0,0,0.1)'
                          }}
                          onMouseEnter={(e) => handleMouseEnter(e, res)}
                          onMouseMove={handleMouseMove}
                          onMouseLeave={handleMouseLeave}
                        >
                          <User size={14} style={{marginRight:'6px', opacity:0.8}}/>
                          {res.studentName}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      </div>

      {/* 3. TOOLTIP */}
      {hoveredRes && (
        <div style={s.tooltip}>
          <div style={s.tooltipHeader}>
            <span>Reservation Details</span>
            <span style={{
                fontSize:'10px', padding:'2px 8px', borderRadius:'10px', 
                background: hoveredRes.status === 'PENDING' ? '#fffbeb' : '#ecfdf5',
                color: hoveredRes.status === 'PENDING' ? '#b45309' : '#047857',
                border: `1px solid ${hoveredRes.status === 'PENDING' ? '#fcd34d' : '#6ee7b7'}`
            }}>
                {hoveredRes.status}
            </span>
          </div>
          
          <div style={s.tooltipRow}><span style={s.tooltipLabel}>Name</span> <span style={s.tooltipVal}>{hoveredRes.studentName}</span></div>
          <div style={s.tooltipRow}><span style={s.tooltipLabel}>Reg No</span> <span style={s.tooltipVal}>{hoveredRes.studentRegNo || "-"}</span></div>
          
          <div style={{margin:'10px 0', borderTop:'1px dashed #e2e8f0'}}></div>
          
          <div style={s.tooltipRow}>
            <span style={s.tooltipLabel}>Check-in</span> 
            <span style={s.tooltipVal}>{hoveredRes.checkIn}</span>
          </div>
          <div style={s.tooltipRow}>
            <span style={s.tooltipLabel}>Check-out</span> 
            <span style={s.tooltipVal}>{hoveredRes.checkOut}</span>
          </div>
          
          <div style={{marginTop:'8px', paddingTop:'8px', borderTop:'1px solid #f1f5f9', display:'flex', gap:'6px', alignItems:'center', color:'#4f46e5', fontSize:'12px', fontWeight:'700'}}>
            <Clock size={14}/>
            {differenceInCalendarDays(parseISO(hoveredRes.checkOut), parseISO(hoveredRes.checkIn))} Nights Stay
          </div>
        </div>
      )}

    </div>
  );
};

export default ReservationCalendar;