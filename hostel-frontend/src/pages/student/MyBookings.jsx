import React, { useEffect, useState } from 'react';
import api from '../../api/axiosConfig';
import { toast } from 'react-toastify';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Ban, 
  Edit3, 
  CheckCircle2, 
  XCircle, 
  BedDouble, 
  History, 
  CalendarDays,
  X
} from 'lucide-react';
import { format, differenceInDays, addDays, parseISO } from 'date-fns';
import { DateRange } from 'react-date-range';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [dateRange, setDateRange] = useState([{ startDate: new Date(), endDate: new Date(), key: 'selection' }]);
  const [requiredDuration, setRequiredDuration] = useState(0);

  useEffect(() => { fetchBookings(); }, []);

  const fetchBookings = async () => {
    try {
      const res = await api.get('/reservations/student/my-bookings');
      if (res.data.status === 'SUCCESS') {
        // Sort by ID descending (newest first)
        const sortedBookings = res.data.data.sort((a, b) => b.id - a.id);
        setBookings(sortedBookings);
      }
    } catch (e) { 
      toast.error("Failed to load bookings"); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleCancel = async (id) => {
    if(!window.confirm("Are you sure? Refunds are not available for cancellations.")) return;
    try {
      await api.patch(`/reservations/${id}/cancel`);
      toast.success("Booking Cancelled");
      fetchBookings();
    } catch (e) { toast.error("Cancellation Failed"); }
  };

  const openDateModal = (booking) => {
    const start = parseISO(booking.checkIn);
    const end = parseISO(booking.checkOut);
    const duration = differenceInDays(end, start);
    
    setRequiredDuration(duration);
    setSelectedBooking(booking);
    setDateRange([{ startDate: start, endDate: end, key: 'selection' }]);
    setIsModalOpen(true);
  };

  const handleDateChangeSubmit = async () => {
    const newStart = dateRange[0].startDate;
    const newEnd = dateRange[0].endDate;
    const newDuration = differenceInDays(newEnd, newStart);

    if (newDuration !== requiredDuration) {
      toast.error(`Invalid Duration! Please select exactly ${requiredDuration} days.`);
      return;
    }

    try {
      await api.patch(`/reservations/${selectedBooking.id}/change-dates`, {
        newCheckInDate: format(newStart, 'yyyy-MM-dd'),
        newCheckOutDate: format(newEnd, 'yyyy-MM-dd')
      });
      toast.success("Dates Updated Successfully!");
      setIsModalOpen(false);
      fetchBookings();
    } catch (e) {
      toast.error(e.response?.data?.message || "Update Failed");
    }
  };

  // --- STYLES ---
  const s = {
    pageContainer: {
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      fontFamily: "'Inter', sans-serif",
      padding: '60px 20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    },
    contentWrapper: {
      width: '100%',
      maxWidth: '900px'
    },
    
    // Header Section
    header: {
      marginBottom: '30px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'end'
    },
    titleGroup: { display: 'flex', flexDirection: 'column' },
    title: { fontSize: '32px', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.5px' },
    subTitle: { fontSize: '15px', color: '#64748b', marginTop: '5px' },
    
    // Stats Badge
    statsBadge: {
      backgroundColor: 'white', padding: '8px 16px', borderRadius: '50px',
      border: '1px solid #e2e8f0', color: '#475569', fontSize: '13px', fontWeight: '600',
      display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
    },

    // Card Styles
    card: {
      backgroundColor: 'white',
      borderRadius: '20px',
      padding: '24px',
      marginBottom: '20px',
      border: '1px solid #e2e8f0',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02)',
      transition: 'all 0.2s ease',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    },
    cardHeader: {
      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
      borderBottom: '1px solid #f1f5f9', paddingBottom: '15px'
    },
    resId: { fontSize: '13px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' },
    bedInfo: { fontSize: '18px', fontWeight: '800', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' },
    
    statusBadge: (status) => {
        const config = {
            APPROVED: { bg: '#dcfce7', text: '#166534', icon: CheckCircle2 },
            PENDING: { bg: '#fef9c3', text: '#854d0e', icon: Clock },
            REJECTED: { bg: '#fee2e2', text: '#991b1b', icon: XCircle },
            CANCELLED: { bg: '#f1f5f9', text: '#475569', icon: Ban },
            COMPLETED: { bg: '#e0e7ff', text: '#3730a3', icon: History }
        };
        const style = config[status] || config.PENDING;
        const Icon = style.icon;
        return {
            backgroundColor: style.bg, color: style.text,
            padding: '6px 12px', borderRadius: '30px',
            fontSize: '12px', fontWeight: '700',
            display: 'flex', alignItems: 'center', gap: '6px',
            textTransform: 'uppercase'
        };
    },

    cardBody: { display: 'flex', gap: '40px', flexWrap: 'wrap' },
    infoItem: { display: 'flex', flexDirection: 'column', gap: '4px' },
    infoLabel: { fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' },
    infoValue: { fontSize: '15px', fontWeight: '600', color: '#334155', display: 'flex', alignItems: 'center', gap: '8px' },

    cardFooter: {
      display: 'flex', justifyContent: 'flex-end', gap: '12px',
      paddingTop: '20px'
    },
    btn: (variant) => ({
      padding: '10px 20px', borderRadius: '12px',
      fontSize: '14px', fontWeight: '600', cursor: 'pointer',
      display: 'flex', alignItems: 'center', gap: '8px',
      border: variant === 'outline' ? '1px solid #e2e8f0' : 'none',
      backgroundColor: variant === 'outline' ? 'white' : '#fee2e2',
      color: variant === 'outline' ? '#334155' : '#ef4444',
      transition: 'all 0.2s'
    }),

    // Empty State
    emptyState: {
        textAlign: 'center', padding: '60px 20px',
        backgroundColor: 'white', borderRadius: '24px',
        border: '1px dashed #e2e8f0'
    },
    emptyIcon: { 
        width: '60px', height: '60px', backgroundColor: '#f1f5f9', 
        borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 20px', color: '#94a3b8'
    },

    // Modal
    overlay: {
        position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
        display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100
    },
    modal: {
        backgroundColor: 'white', borderRadius: '24px', padding: '0',
        width: '100%', maxWidth: '450px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
        overflow: 'hidden'
    },
    modalHeader: {
        padding: '20px 24px', borderBottom: '1px solid #f1f5f9',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
    },
    modalTitle: { fontSize: '18px', fontWeight: '700', color: '#0f172a' },
    modalBody: { padding: '24px' },
    modalFooter: {
        padding: '20px 24px', borderTop: '1px solid #f1f5f9', backgroundColor: '#f8fafc',
        display: 'flex', justifyContent: 'flex-end', gap: '12px'
    },
    saveBtn: {
        backgroundColor: '#4f46e5', color: 'white', border: 'none',
        padding: '10px 20px', borderRadius: '10px', fontWeight: '600', cursor: 'pointer'
    }
  };

  const StatusBadge = ({ status }) => {
    const style = s.statusBadge(status);
    const Icon = style.icon || CheckCircle2; // Fallback icon
    // We removed 'icon' from style object before spreading to avoid React warning on span if we were spreading everything
    // But here we construct style manually
    return (
        <span style={{
            backgroundColor: style.backgroundColor, 
            color: style.color,
            padding: style.padding, 
            borderRadius: style.borderRadius,
            fontSize: style.fontSize, 
            fontWeight: style.fontWeight,
            display: style.display, 
            alignItems: style.alignItems, 
            gap: style.gap,
            textTransform: style.textTransform
        }}>
            <Icon size={14} /> {status}
        </span>
    );
  };

  return (
    <div style={s.pageContainer}>
      <div style={s.contentWrapper}>
        
        {/* Header */}
        <div style={s.header}>
            <div style={s.titleGroup}>
                <h1 style={s.title}>My Reservations</h1>
                <p style={s.subTitle}>Manage your current and past accommodation bookings.</p>
            </div>
            <div style={s.statsBadge}>
                <CalendarDays size={16} color="#4f46e5"/>
                {bookings.length} Total Bookings
            </div>
        </div>

        {/* Content */}
        {loading ? (
            <div style={{textAlign:'center', padding:'40px', color:'#64748b'}}>Loading bookings...</div>
        ) : bookings.length === 0 ? (
            <div style={s.emptyState}>
                <div style={s.emptyIcon}><Calendar size={28}/></div>
                <h3 style={{fontSize:'18px', fontWeight:'700', color:'#1e293b', marginBottom:'5px'}}>No Bookings Found</h3>
                <p style={{color:'#64748b', fontSize:'14px'}}>You haven't made any reservations yet.</p>
            </div>
        ) : (
            bookings.map(booking => (
                <div key={booking.id} style={s.card}>
                    
                    {/* Card Header */}
                    <div style={s.cardHeader}>
                        <div>
                            <div style={s.resId}>REF: #{booking.reservationNumber}</div>
                            <div style={s.bedInfo}>
                                <BedDouble size={20} color="#4f46e5"/>
                                Bed {booking.bedNumber}
                            </div>
                        </div>
                        <StatusBadge status={booking.status} />
                    </div>

                    {/* Card Body */}
                    <div style={s.cardBody}>
                        <div style={s.infoItem}>
                            <span style={s.infoLabel}>Check-in Date</span>
                            <span style={s.infoValue}><Calendar size={16} color="#64748b"/> {booking.checkIn}</span>
                        </div>
                        <div style={s.infoItem}>
                            <span style={s.infoLabel}>Check-out Date</span>
                            <span style={s.infoValue}><Calendar size={16} color="#64748b"/> {booking.checkOut}</span>
                        </div>
                        <div style={s.infoItem}>
                            <span style={s.infoLabel}>Duration</span>
                            <span style={s.infoValue}><Clock size={16} color="#64748b"/> {differenceInDays(new Date(booking.checkOut), new Date(booking.checkIn))} Nights</span>
                        </div>
                    </div>

                    {/* Card Footer (Actions) */}
                    {booking.status === 'APPROVED' && (
                        <div style={s.cardFooter}>
                            <button 
                                onClick={() => openDateModal(booking)}
                                style={s.btn('outline')}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                            >
                                <Edit3 size={16}/> Change Dates
                            </button>
                            <button 
                                onClick={() => handleCancel(booking.id)}
                                style={s.btn('danger')}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fecaca'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}
                            >
                                <Ban size={16}/> Cancel Booking
                            </button>
                        </div>
                    )}
                </div>
            ))
        )}

      </div>

      {/* DATE CHANGE MODAL */}
      {isModalOpen && (
        <div style={s.overlay} onClick={() => setIsModalOpen(false)}>
            <div style={s.modal} onClick={e => e.stopPropagation()}>
                <div style={s.modalHeader}>
                    <div style={s.modalTitle}>Change Dates</div>
                    <button onClick={() => setIsModalOpen(false)} style={{background:'none', border:'none', cursor:'pointer', color:'#94a3b8'}}>
                        <X size={20}/>
                    </button>
                </div>
                
                <div style={s.modalBody}>
                    <div style={{marginBottom:'20px', padding:'12px', backgroundColor:'#eff6ff', borderRadius:'12px', border:'1px solid #bfdbfe', fontSize:'13px', color:'#1e40af'}}>
                        <strong>Note:</strong> You must select exactly <strong>{requiredDuration} days</strong> to match your original payment duration.
                    </div>
                    
                    <div style={{display:'flex', justifyContent:'center'}}>
                        <DateRange
                            editableDateInputs={true}
                            onChange={item => setDateRange([item.selection])}
                            moveRangeOnFirstSelection={false}
                            ranges={dateRange}
                            minDate={new Date()}
                            rangeColors={['#4f46e5']}
                            color="#4f46e5"
                        />
                    </div>
                </div>

                <div style={s.modalFooter}>
                    <button onClick={() => setIsModalOpen(false)} style={{...s.btn('outline'), border:'1px solid #cbd5e1'}}>Cancel</button>
                    <button onClick={handleDateChangeSubmit} style={s.saveBtn}>Update Reservation</button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default MyBookings;