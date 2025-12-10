import React, { useEffect, useState } from 'react';
import api from '../../api/axiosConfig';
import { toast } from 'react-toastify';
import { 
  Calendar, Clock, MapPin, Ban, Edit3, CheckCircle2, XCircle, 
  BedDouble, History, CalendarDays, X, Ticket, User, CreditCard, Phone, Mail, ShieldCheck
} from 'lucide-react';
import { format, differenceInDays, parseISO } from 'date-fns';
import { DateRange } from 'react-date-range';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Date Change Modal State
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [selectedBookingForDate, setSelectedBookingForDate] = useState(null);
  const [dateRange, setDateRange] = useState([{ startDate: new Date(), endDate: new Date(), key: 'selection' }]);
  const [requiredDuration, setRequiredDuration] = useState(0);

  // Gate Pass Modal State
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);
  const [passDetails, setPassDetails] = useState(null);
  const [passLoading, setPassLoading] = useState(false);

  useEffect(() => { fetchBookings(); }, []);

  const fetchBookings = async () => {
    try {
      const res = await api.get('/reservations/student/my-bookings');
      if (res.data.status === 'SUCCESS') {
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

  // --- View Gate Pass Logic ---
  const handleViewPass = async (id) => {
    setPassLoading(true);
    setIsPassModalOpen(true);
    setPassDetails(null);
    try {
        const res = await api.get(`/reservations/${id}`);
        if (res.data.status === 'SUCCESS') {
            setPassDetails(res.data.data);
        }
    } catch (e) {
        toast.error("Failed to load pass details");
        setIsPassModalOpen(false);
    } finally {
        setPassLoading(false);
    }
  };

  // --- Date Change Logic ---
  const openDateModal = (booking) => {
    const start = parseISO(booking.checkIn);
    const end = parseISO(booking.checkOut);
    const duration = differenceInDays(end, start);
    setRequiredDuration(duration);
    setSelectedBookingForDate(booking);
    setDateRange([{ startDate: start, endDate: end, key: 'selection' }]);
    setIsDateModalOpen(true);
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
      await api.patch(`/reservations/${selectedBookingForDate.id}/change-dates`, {
        newCheckInDate: format(newStart, 'yyyy-MM-dd'),
        newCheckOutDate: format(newEnd, 'yyyy-MM-dd')
      });
      toast.success("Dates Updated Successfully!");
      setIsDateModalOpen(false);
      fetchBookings();
    } catch (e) {
      toast.error(e.response?.data?.message || "Update Failed");
    }
  };

  // --- STYLES ---
  const s = {
    // ... (Old styles remain same) ...
    pageContainer: { minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: "'Inter', sans-serif", padding: '60px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' },
    contentWrapper: { width: '100%', maxWidth: '900px' },
    header: { marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'end' },
    title: { fontSize: '32px', fontWeight: '800', color: '#0f172a', margin: 0 },
    subTitle: { fontSize: '15px', color: '#64748b', marginTop: '5px' },
    card: { backgroundColor: 'white', borderRadius: '20px', padding: '24px', marginBottom: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', gap: '20px' },
    cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #f1f5f9', paddingBottom: '15px' },
    resId: { fontSize: '13px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' },
    bedInfo: { fontSize: '18px', fontWeight: '800', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' },
    statusBadge: (status) => {
        const config = { APPROVED: { bg: '#dcfce7', text: '#166534', icon: CheckCircle2 }, PENDING: { bg: '#fef9c3', text: '#854d0e', icon: Clock }, REJECTED: { bg: '#fee2e2', text: '#991b1b', icon: XCircle }, CANCELLED: { bg: '#f1f5f9', text: '#475569', icon: Ban }, COMPLETED: { bg: '#e0e7ff', text: '#3730a3', icon: History } };
        const style = config[status] || config.PENDING;
        const Icon = style.icon;
        return <span style={{ backgroundColor: style.bg, color: style.text, padding: '6px 12px', borderRadius: '30px', fontSize: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'uppercase' }}><Icon size={14} /> {status}</span>;
    },
    cardBody: { display: 'flex', gap: '40px', flexWrap: 'wrap' },
    infoItem: { display: 'flex', flexDirection: 'column', gap: '4px' },
    infoLabel: { fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' },
    infoValue: { fontSize: '15px', fontWeight: '600', color: '#334155', display: 'flex', alignItems: 'center', gap: '8px' },
    cardFooter: { display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '20px' },
    btn: (variant) => ({
      padding: '10px 20px', borderRadius: '12px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
      border: variant === 'outline' ? '1px solid #e2e8f0' : 'none',
      backgroundColor: variant === 'pass' ? '#4f46e5' : (variant === 'outline' ? 'white' : '#fee2e2'),
      color: variant === 'pass' ? 'white' : (variant === 'outline' ? '#334155' : '#ef4444'),
      transition: 'all 0.2s'
    }),
    
    // --- PASS MODAL STYLES ---
    modalOverlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 },
    passCard: { backgroundColor: 'white', width: '100%', maxWidth: '400px', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', animation: 'slideUp 0.3s ease-out', marginTop: '60px', height: 'auto', maxHeight: '90vh'},
    passHeader: { background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)', padding: '25px', color: 'white', textAlign: 'center', position: 'relative' },
    passTitle: { fontSize: '18px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '5px' },
    passSub: { fontSize: '12px', opacity: 0.8 },
    passClose: { position: 'absolute', top: '15px', right: '15px', background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: '30px', height: '30px', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    passBody: { padding: '25px' },
    
    section: { marginBottom: '20px' },
    secTitle: { fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' },
    
    row: { display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' },
    label: { color: '#64748b' },
    val: { fontWeight: '600', color: '#1e293b', textAlign: 'right' },
    
    statusRow: { display: 'flex', justifyContent: 'center', margin: '20px 0', padding: '10px', background: '#ecfdf5', borderRadius: '12px', color: '#166534', fontWeight: '700', fontSize: '14px', alignItems: 'center', gap: '8px', border: '1px solid #bbf7d0' },
    
    qrPlaceholder: { height: '80px', background: '#f8fafc', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '20px', border: '2px dashed #e2e8f0', color: '#94a3b8', fontSize: '12px', flexDirection: 'column', gap: '5px' }
  };

  return (
    <div style={s.pageContainer}>
      <div style={s.contentWrapper}>
        <div style={s.header}>
            <div style={s.titleGroup}>
                <h1 style={s.title}>My Reservations</h1>
                <p style={s.subTitle}>Manage your current and past accommodation bookings.</p>
            </div>
        </div>

        {loading ? <div style={{textAlign:'center'}}>Loading...</div> : 
         bookings.map(booking => (
            <div key={booking.id} style={s.card}>
                <div style={s.cardHeader}>
                    <div>
                        <div style={s.resId}>REF: #{booking.reservationNumber}</div>
                        <div style={s.bedInfo}><BedDouble size={20} color="#4f46e5"/> Bed {booking.bedNumber}</div>
                    </div>
                    {s.statusBadge(booking.status)}
                </div>
                <div style={s.cardBody}>
                    <div style={s.infoItem}><span style={s.infoLabel}>Check-in</span><span style={s.infoValue}><Calendar size={16}/> {booking.checkIn}</span></div>
                    <div style={s.infoItem}><span style={s.infoLabel}>Check-out</span><span style={s.infoValue}><Calendar size={16}/> {booking.checkOut}</span></div>
                    <div style={s.infoItem}><span style={s.infoLabel}>Duration</span><span style={s.infoValue}><Clock size={16}/> {differenceInDays(new Date(booking.checkOut), new Date(booking.checkIn))} Nights</span></div>
                </div>
                {booking.status === 'APPROVED' && (
                    <div style={s.cardFooter}>
                        <button onClick={() => handleViewPass(booking.id)} style={s.btn('pass')}><Ticket size={16}/> View Gate Pass</button>
                        <button onClick={() => openDateModal(booking)} style={s.btn('outline')}><Edit3 size={16}/> Change Dates</button>
                        <button onClick={() => handleCancel(booking.id)} style={s.btn('danger')}><Ban size={16}/> Cancel</button>
                    </div>
                )}
            </div>
        ))}
      </div>

      {/* --- GATE PASS MODAL --- */}
      {isPassModalOpen && (
        <div style={s.modalOverlay} onClick={() => setIsPassModalOpen(false)}>
            <div style={s.passCard} onClick={e => e.stopPropagation()}>
                <div style={s.passHeader}>
                    <button style={s.passClose} onClick={() => setIsPassModalOpen(false)}><X size={18}/></button>
                    <div style={s.passTitle}>Hostel Entry Pass</div>
                    <div style={s.passSub}>Authorization Ticket</div>
                </div>
                
                <div style={s.passBody}>
                    {passLoading ? <div style={{textAlign:'center', padding:'20px'}}>Loading details...</div> : passDetails ? (
                        <>
                            {/* Status */}
                            <div style={s.statusRow}>
                                <ShieldCheck size={18}/> Access Granted
                            </div>

                            {/* Student Info */}
                            <div style={s.section}>
                                <div style={s.secTitle}><User size={14}/> Student Details</div>
                                <div style={s.row}><span style={s.label}>Name</span><span style={s.val}>{passDetails.studentName}</span></div>
                                <div style={s.row}><span style={s.label}>Reg No</span><span style={s.val}>{passDetails.studentRegistrationNumber}</span></div>
                                <div style={s.row}><span style={s.label}>Email</span><span style={s.val}>{passDetails.studentEmail}</span></div>
                                <div style={s.row}><span style={s.label}>Phone</span><span style={s.val}>{passDetails.studentContact || 'N/A'}</span></div>
                            </div>

                            {/* Booking Info */}
                            <div style={s.section}>
                                <div style={s.secTitle}><MapPin size={14}/> Accommodation</div>
                                <div style={s.row}><span style={s.label}>Room No</span><span style={s.val}>{passDetails.roomNumber}</span></div>
                                <div style={s.row}><span style={s.label}>Bed No</span><span style={s.val}>{passDetails.bedNumber}</span></div>
                                <div style={s.row}><span style={s.label}>Valid From</span><span style={s.val}>{passDetails.checkIn}</span></div>
                                <div style={s.row}><span style={s.label}>Valid Until</span><span style={s.val}>{passDetails.checkOut}</span></div>
                            </div>

                            {/* Payment Info */}
                            <div style={{...s.section, borderTop:'1px dashed #e2e8f0', paddingTop:'15px'}}>
                                <div style={s.secTitle}><CreditCard size={14}/> Payment</div>
                                <div style={s.row}><span style={s.label}>Ref ID</span><span style={{...s.val, fontFamily:'monospace'}}>{passDetails.paymentId || passDetails.reservationNumber}</span></div>
                                <div style={s.row}><span style={s.label}>Amount Paid</span><span style={{...s.val, color:'#16a34a'}}>LKR {passDetails.amountPaid ? passDetails.amountPaid.toLocaleString() : '0.00'}</span></div>
                                <div style={s.row}><span style={s.label}>Payment Date</span><span style={s.val}>{passDetails.paymentDate || 'N/A'}</span></div>
                                <div style={s.row}><span style={s.label}>Payment Time</span><span style={s.val}>{passDetails.paymentTime || 'N/A'}</span></div>
                            </div>

                            {/* Fake QR for visual appeal */}
                            <div style={s.qrPlaceholder}>
                                <div style={{display:'flex', gap:'4px'}}>
                                    {[...Array(15)].map((_,i) => <div key={i} style={{width:'4px', height:'30px', background: i%2===0?'black':'transparent'}}></div>)}
                                </div>
                                <span></span>
                            </div>
                        </>
                    ) : <div style={{textAlign:'center', color:'red'}}>Failed to load pass.</div>}
                </div>
            </div>
        </div>
      )}

      {/* --- DATE CHANGE MODAL (Existing Code) --- */}
      {isDateModalOpen && (
        <div style={s.modalOverlay} onClick={() => setIsDateModalOpen(false)}>
            {/* ... (Date Modal Content - same as before) ... */}
             <div style={{backgroundColor: 'white', borderRadius: '24px', padding: '0', width: '100%', maxWidth: '450px'}} onClick={e => e.stopPropagation()}>
                <div style={{padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <div style={{fontSize: '18px', fontWeight: '700'}}>Change Dates</div>
                    <button onClick={() => setIsDateModalOpen(false)} style={{background:'none', border:'none', cursor:'pointer'}}><X size={20}/></button>
                </div>
                <div style={{padding: '24px'}}>
                    <div style={{marginBottom:'20px', padding:'12px', backgroundColor:'#eff6ff', borderRadius:'12px', fontSize:'13px', color:'#1e40af'}}>
                        Note: You must select exactly <strong>{requiredDuration} days</strong>.
                    </div>
                    <div style={{display:'flex', justifyContent:'center'}}>
                        <DateRange editableDateInputs={true} onChange={item => setDateRange([item.selection])} moveRangeOnFirstSelection={false} ranges={dateRange} minDate={new Date()} rangeColors={['#4f46e5']} color="#4f46e5"/>
                    </div>
                </div>
                <div style={{padding: '20px 24px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '12px'}}>
                    <button onClick={() => setIsDateModalOpen(false)} style={s.btn('outline')}>Cancel</button>
                    <button onClick={handleDateChangeSubmit} style={{...s.btn('pass'), backgroundColor:'#4f46e5'}}>Update</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;