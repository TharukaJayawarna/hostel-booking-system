import React, { useEffect, useState, useRef } from 'react';
import api from '../../api/axiosConfig';
import { toast } from 'react-toastify';
import { CalendarDays, Search, Filter, MoreVertical, Eye, RefreshCcw, BedDouble, Ban, User, CreditCard, Phone, Mail, MapPin, CalendarCheck, Building2, Layers, DoorOpen, X, Trash2, Plus, Receipt, Clock, CheckCircle2, XCircle } from 'lucide-react';

const ManageReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [showTrash, setShowTrash] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const dropdownRef = useRef(null);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [matchingBeds, setMatchingBeds] = useState([]);
  const [selectedResId, setSelectedResId] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [hubs, setHubs] = useState([]);
  const [floors, setFloors] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [beds, setBeds] = useState([]);

  const [manualForm, setManualForm] = useState({
    studentName: '', registrationNumber: '', email: '', contactNumber: '', address: '',
    gender: 'MALE', amount: '', paymentReference: '',
    fromDate: '', toDate: '',
    hubId: '', floorId: '', roomId: '', bedId: ''
  });

  // Check Role
  const user = JSON.parse(localStorage.getItem('user'));
  const isWarden = user?.role === 'WARDEN';

  useEffect(() => { fetchReservations(); }, [showTrash]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdownId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => { document.removeEventListener("mousedown", handleClickOutside); };
  }, []);

  useEffect(() => {
    if (isManualModalOpen) {
        api.get('/hubs').then(res => setHubs(res.data.data)).catch(console.error);
    }
  }, [isManualModalOpen]);

  useEffect(() => {
    if (manualForm.hubId) {
        api.get(`/hubs/${manualForm.hubId}/floors`).then(res => setFloors(res.data.data));
    }
    setManualForm(prev => ({...prev, floorId:'', roomId:'', bedId:''}));
  }, [manualForm.hubId]);

  useEffect(() => {
    if (manualForm.floorId) {
        api.get(`/floors/${manualForm.floorId}/rooms`).then(res => setRooms(res.data.data));
    }
    setManualForm(prev => ({...prev, roomId:'', bedId:''}));
  }, [manualForm.floorId]);

  useEffect(() => {
    if (manualForm.roomId) {
        api.get(`/rooms/${manualForm.roomId}/beds`).then(res => {
            // Only available beds
            setBeds(res.data.data.filter(b => !b.isBooked && !b.underMaintenance));
        });
    }
    setManualForm(prev => ({...prev, bedId:''}));
  }, [manualForm.roomId]);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const endpoint = showTrash ? '/reservations/trash' : '/reservations';
      const res = await api.get(endpoint);
      if(res.data.status === 'SUCCESS') setReservations(res.data.data);
    } catch(e) { toast.error("Failed to load reservations"); } 
    finally { setLoading(false); }
  };

  const toggleDropdown = (id, e) => {
    e.stopPropagation(); 
    setActiveDropdownId(activeDropdownId === id ? null : id);
  };

  const filteredReservations = reservations.filter((res) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = (
      (res.studentName && res.studentName.toLowerCase().includes(term)) ||
      (res.studentRegNo && res.studentRegNo.toLowerCase().includes(term)) ||
      (res.reservationNumber && res.reservationNumber.toLowerCase().includes(term))
    );
    
    // Status Filter Check
    const matchesStatus = filterStatus === 'ALL' || res.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: reservations.length,
    approved: reservations.filter(r => r.status === 'APPROVED').length,
    pending: reservations.filter(r => r.status === 'PENDING').length,
    rejected: reservations.filter(r => r.status === 'REJECTED' || r.status === 'CANCELLED').length
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!manualForm.bedId) return toast.warning("Please select a bed.");
    
    try {
        await api.post('/reservations/admin/create', manualForm);
        toast.success("Manual Reservation Created!");
        setIsManualModalOpen(false);
        fetchReservations();
        setManualForm({
            studentName: '', registrationNumber: '', email: '', contactNumber: '', address: '',
            gender: 'MALE', amount: '', paymentReference: '', fromDate: '', toDate: '',
            hubId: '', floorId: '', roomId: '', bedId: ''
        });
    } catch (e) {
        toast.error(e.response?.data?.message || "Creation Failed");
    }
  };

  const handleCancel = async (id) => {
    if(!window.confirm("Are you sure you want to CANCEL this reservation?")) return;
    try { 
        await api.patch(`/reservations/${id}/cancel`); 
        toast.success("Reservation Cancelled"); 
        fetchReservations(); 
        setActiveDropdownId(null); 
    } catch(e) { toast.error("Cancellation Failed"); }
  };

  const handleReactivate = async (id) => {
    if(!window.confirm("Are you sure you want to reactivate this reservation?")) return;
    try { await api.post(`/reservations/${id}/reactivate`); toast.success("Reactivated Successfully!"); fetchReservations(); setActiveDropdownId(null); } 
    catch(e) { toast.error(e.response?.data?.message || "Failed to reactivate"); }
  };

  const handleRefund = async (id) => {
    if(!window.confirm("Are you sure you want to cancel/refund this reservation?")) return;
    try { await api.patch(`/reservations/${id}/cancel`); toast.success("Cancelled/Refunded Successfully"); fetchReservations(); setActiveDropdownId(null); } 
    catch(e) { toast.error("Failed to cancel"); }
  };

  const openMoveModal = async (id) => {
    setSelectedResId(id);
    setActiveDropdownId(null);
    try {
      const res = await api.get(`/reservations/${id}/matching-beds`);
      if(res.data.status === 'SUCCESS') {
        setMatchingBeds(res.data.data);
        setIsMoveModalOpen(true);
      }
    } catch(e) { toast.error("No matching beds found"); }
  };

  const confirmMove = async (newBedId) => {
    try {
      await api.post(`/reservations/${selectedResId}/assign/${newBedId}`);
      toast.success("Bed moved successfully!");
      setIsMoveModalOpen(false);
      fetchReservations();
    } catch(e) { toast.error("Failed to move bed"); }
  };

  const openViewModal = async (id) => {
    setIsViewModalOpen(true);
    setIsLoadingDetails(true);
    setSelectedReservation(null);
    setActiveDropdownId(null);
    try {
      const response = await api.get(`/reservations/${id}`);
      if (response.data.status === 'SUCCESS') {
        setSelectedReservation(response.data.data);
      }
    } catch (error) { toast.error("Failed to load details"); setIsViewModalOpen(false); } 
    finally { setIsLoadingDetails(false); }
  };

  const s = {
    container: { fontFamily: "'Inter', sans-serif", color: '#1f2937', paddingBottom: '40px' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' },
    titleGroup: { display: 'flex', flexDirection: 'column' },
    title: { fontSize: '28px', fontWeight: '800', color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' },
    subTitle: { fontSize: '14px', color: '#6b7280', marginTop: '5px' },
    toolbar: { background: 'white', padding: '15px 20px', borderRadius: '16px', border: '1px solid #e5e7eb', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' },
    searchBox: { display: 'flex', alignItems: 'center', gap: '10px', background: '#f9fafb', padding: '10px 15px', borderRadius: '10px', border: '1px solid #e5e7eb', width: '350px' },
    searchInput: { border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '14px', color: '#374151' },
    createBtn: { background: '#4f46e5', color: 'white', padding: '10px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', boxShadow:'0 4px 10px rgba(79, 70, 229, 0.2)' },
    toggleBtn: (active) => ({ padding: '10px 20px', borderRadius: '10px', border: active ? '1px solid #dc2626' : '1px solid #e5e7eb', backgroundColor: active ? '#fef2f2' : 'white', color: active ? '#dc2626' : '#374151', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }),
    tableContainer: { background: 'white', borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)', overflow: 'visible' },
    table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
    thead: { backgroundColor: '#f8fafc', borderBottom: '1px solid #e5e7eb' },
    th: { padding: '16px 24px', fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em' },
    tr: { borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.2s', position: 'relative' },
    td: { padding: '16px 24px', fontSize: '14px', color: '#334155', verticalAlign: 'middle' },
    badge: (status) => {
      const config = { COMPLETED: { bg: '#ecfdf5', col: '#059669', border: '#a7f3d0' }, APPROVED: { bg: '#dcfce7', col: '#15803d', border: '#bbf7d0' }, PENDING: { bg: '#fffbeb', col: '#d97706', border: '#fcd34d' }, REJECTED: { bg: '#fef2f2', col: '#dc2626', border: '#fecaca' }, REFUNDED: { bg: '#eff6ff', col: '#2563eb', border: '#bfdbfe' }, CANCELLED: { bg: '#f3f4f6', col: '#4b5563', border: '#e5e7eb' } };
      const style = config[status] || config.PENDING;
      return { display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', backgroundColor: style.bg, color: style.col, border: `1px solid ${style.border}`, textTransform: 'uppercase' };
    },
    paymentBadge: (status) => {
        const config = { APPROVED: { col: '#166534', bg: '#dcfce7' }, PENDING: { col: '#b45309', bg: '#fef9c3' }, REJECTED: { col: '#991b1b', bg: '#fee2e2' } };
        const style = config[status] || { col: '#475569', bg: '#f1f5f9' };
        return { color: style.col, backgroundColor: style.bg, padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', textTransform:'uppercase' };
    },
    statCard: { 
        background: 'white', 
        padding: '20px', 
        borderRadius: '16px', 
        border: '1px solid #e5e7eb', 
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '15px' 
    },

    // statIconBox එක Function එකක් ලෙස (මෙය අනිවාර්යයි)
    statIconBox: (bg, col) => ({ 
        width: '50px', 
        height: '50px', 
        borderRadius: '12px', 
        background: bg, 
        color: col, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
    }),
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)', // කාඩ් 4ක් පේළියට
        gap: '20px',
        marginBottom: '30px'
    },
    statValue: {
        fontSize: '28px',
        fontWeight: '800',
        color: '#111827',
        lineHeight: '1.2'
    },
    statLabel: {
        fontSize: '13px',
        fontWeight: '600',
        color: '#6b7280',
        marginTop: '2px'
    },

    // --- NEW FILTER STYLES ---
    filterWrapper: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        background: '#f9fafb', // Search box එකේ පාටමයි
        padding: '10px 15px',
        borderRadius: '10px',
        border: '1px solid #e5e7eb'
    },
    select: {
        border: 'none',
        background: 'transparent',
        outline: 'none',
        fontSize: '14px',
        fontWeight: '500',
        color: '#374151',
        cursor: 'pointer',
        minWidth: '120px' // Dropdown එක පොඩි නොවී තියෙන්න
    },
    dateBadge: { fontSize: '11px', fontWeight: '600', color: '#64748b', background: '#f1f5f9', padding: '4px 8px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '6px' },
    actionBtn: { background: 'white', border: '1px solid #e2e8f0', color: '#374151', padding: '8px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' },
    dropdownMenu: { position: 'absolute', right: '50px', top: '40px', backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', zIndex: 50, width: '180px', overflow: 'hidden', padding: '6px' },
    dropdownItem: (color = '#374151') => ({ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px 12px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: color, borderRadius: '8px', transition: 'background 0.1s' }),
    overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
    modal: { background: 'white', padding: '0', borderRadius: '24px', width: '550px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden', animation: 'fadeIn 0.2s ease-out' },
    modalHeader: { padding: '24px 32px', borderBottom: '1px solid #f1f5f9', background: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    modalTitle: { fontSize: '20px', fontWeight: '800', color: '#0f172a' },
    modalBody: { padding: '32px', background: '#f8fafc', maxHeight: '60vh', overflowY: 'auto' },
    detailRow: { display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #e2e8f0' },
    detailLabel: { color: '#64748b', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase' },
    detailValue: { color: '#1e293b', fontSize: '14px', fontWeight: '600', textAlign: 'right' },
    sectionTitle: { fontSize: '14px', fontWeight: '700', color: '#4f46e5', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' },
    closeBtn: { width: '100%', padding: '12px', background: 'white', border: '1px solid #e2e8f0', color: '#64748b', fontWeight: '600', borderRadius: '12px', cursor: 'pointer', marginTop: '20px' },
    modalOverlay: { position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display:'flex', justifyContent:'center', alignItems:'center', zIndex:100 },
    modalContent: { background:'white', borderRadius:'20px', width:'700px', maxHeight:'90vh', overflowY:'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' },
    formSection: { marginBottom:'20px' },
    formSectionTitle: { fontSize:'14px', fontWeight:'700', color:'#4f46e5', borderBottom:'1px dashed #e2e8f0', paddingBottom:'8px', marginBottom:'15px', textTransform:'uppercase', letterSpacing:'0.5px' },
    formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom:'15px' },
    formGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
    formLabel: { fontSize: '12px', fontWeight: '700', color: '#475569' },
    formInput: { width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none', boxSizing:'border-box', transition:'border-color 0.2s' },
    formSelect: { width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '14px', background:'white', cursor:'pointer', outline:'none', boxSizing:'border-box' }

  };

  return (
    <div style={s.container} onClick={() => setActiveDropdownId(null)}>
      <div style={s.header}>
        <div style={s.titleGroup}>
          <div style={s.title}><div style={{background:'#e0e7ff', padding:'10px', borderRadius:'12px', color:'#4338ca'}}><CalendarDays size={28}/></div>{showTrash ? "Trash / History" : "Reservations"}</div>
          <p style={s.subTitle}>Manage student bookings, payments, and cancellations.</p>
        </div>
        {!isWarden && (
            <button style={s.createBtn} onClick={() => setIsManualModalOpen(true)}>
                <Plus size={18}/> New Reservation
            </button>
        )}
      </div>

      {/* --- STATS GRID --- */}
      <div style={s.statsGrid}>
        <div style={s.statCard}>
          <div style={s.statIconBox('#eff6ff', '#2563eb')}><CalendarDays size={24}/></div>
          <div><div style={s.statValue}>{stats.total}</div><div style={s.statLabel}>Total Reservations</div></div>
        </div>
        <div style={s.statCard}>
          <div style={s.statIconBox('#dcfce7', '#15803d')}><CheckCircle2 size={24}/></div>
          <div><div style={s.statValue}>{stats.approved}</div><div style={s.statLabel}>Approved</div></div>
        </div>
        <div style={s.statCard}>
          <div style={s.statIconBox('#fffbeb', '#d97706')}><Clock size={24}/></div>
          <div><div style={s.statValue}>{stats.pending}</div><div style={s.statLabel}>Pending</div></div>
        </div>
        <div style={s.statCard}>
          <div style={s.statIconBox('#fef2f2', '#dc2626')}><XCircle size={24}/></div>
          <div><div style={s.statValue}>{stats.rejected}</div><div style={s.statLabel}>Rejected / Cancelled</div></div>
        </div>
      </div>
      
      <div style={s.toolbar}>
        <div style={s.searchBox}><Search size={18} color="#9ca3af"/><input style={s.searchInput} placeholder="Search by Name, Reg No, or Ref ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/></div>
        {/* Status Filter */}
        <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
            <Filter size={18} color="#6b7280"/>
            <select style={s.select} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="ALL">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="COMPLETED">Completed</option>
                <option value="REJECTED">Rejected</option>
                <option value="CANCELLED">Cancelled</option>
                {showTrash && <option value="TRASH">Trash</option>}
            </select>
        </div>
        <button style={s.toggleBtn(showTrash)} onClick={() => setShowTrash(!showTrash)}>{showTrash ? <Filter size={16}/> : <Trash2 size={16}/>}{showTrash ? "View Active Reservations" : "View Trash / History"}</button>
      </div>

      <div style={s.tableContainer}>
        <table style={s.table}>
          <thead style={s.thead}>
            <tr>
              <th style={s.th}>Reservation Info</th>
              <th style={s.th}>Student Details</th>
              <th style={s.th}>Payment Date & Time</th>
              <th style={s.th}>Dates</th>
              <th style={s.th}>Status</th>
              <th style={{...s.th, width:'100px', textAlign:'right'}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan="6" style={{textAlign:'center', padding:'40px', color:'#9ca3af'}}>Loading reservations...</td></tr> 
            : filteredReservations.length === 0 ? <tr><td colSpan="6" style={{textAlign:'center', padding:'40px', color:'#9ca3af'}}>No reservations found.</td></tr>
            : filteredReservations.map(res => (
                <tr key={res.id} style={s.tr}>
                    <td style={s.td}><div style={{fontWeight:'700', color:'#111827', fontFamily:'monospace', fontSize:'15px'}}>{res.reservationNumber}</div><div style={{display:'flex', alignItems:'center', gap:'5px', marginTop:'4px', color:'#64748b', fontSize:'12px'}}><BedDouble size={12}/> Bed {res.bedNumber}</div></td>
                    <td style={s.td}><div style={{fontWeight:'600', color:'#1e293b'}}>{res.studentName}</div><div style={{fontSize:'12px', color:'#94a3b8'}}>{res.studentRegNo}</div></td>
                    <td style={s.td}>
                        {res.paymentDate ? (
                            <div style={{display:'flex', flexDirection:'column', gap:'2px'}}>
                                <span style={{fontSize:'13px', fontWeight:'600', color:'#374151'}}>{res.paymentDate}</span>
                                <span style={{fontSize:'11px', color:'#64748b', display:'flex', alignItems:'center', gap:'4px'}}>
                                    <Clock size={10}/> {res.paymentTime}
                                </span>
                            </div>
                        ) : (
                            <span style={{fontSize:'12px', color:'#9ca3b8', fontStyle:'italic'}}>Not Paid</span>
                        )}
                    </td>
                    <td style={s.td}><div style={{display:'flex', flexDirection:'column', gap:'6px'}}><span style={s.dateBadge}><CalendarCheck size={12}/> In: {res.checkIn}</span><span style={s.dateBadge}><CalendarCheck size={12}/> Out: {res.checkOut}</span></div></td>
                    <td style={s.td}><span style={s.badge(res.status)}>{res.status}</span></td>
                    <td style={s.td}>
                      <div style={{display:'flex', justifyContent:'flex-end', gap:'8px', position:'relative'}}>
                          
                          <button style={s.actionBtn} onClick={() => openViewModal(res.id)} title="View Details" onMouseOver={(e) => e.currentTarget.style.borderColor = '#4f46e5'} onMouseOut={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}><Eye size={16}/></button>

                          {!isWarden && (
                            <>
                                {res.status === 'REJECTED' && (
                                    <div ref={activeDropdownId === res.id ? dropdownRef : null}>
                                        <button style={s.actionBtn} onClick={(e) => toggleDropdown(res.id, e)}><MoreVertical size={16}/></button>
                                        {activeDropdownId === res.id && (
                                        <div style={s.dropdownMenu}>
                                            <button style={s.dropdownItem('#059669')} onClick={() => handleReactivate(res.id)} onMouseOver={(e) => e.currentTarget.style.background = '#f0fdf4'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}><RefreshCcw size={14}/> Reactivate</button>
                                            <button style={s.dropdownItem('#d97706')} onClick={() => openMoveModal(res.id)} onMouseOver={(e) => e.currentTarget.style.background = '#fffbeb'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}><BedDouble size={14}/> Move Bed</button>
                                            <button style={s.dropdownItem('#dc2626')} onClick={() => handleRefund(res.id)} onMouseOver={(e) => e.currentTarget.style.background = '#fef2f2'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}><Ban size={14}/> Refund</button>
                                        </div>
                                        )}
                                    </div>
                                )}
                                {(res.status === 'COMPLETED' || res.status === 'APPROVED') && (
                                    <button style={{...s.actionBtn, color: '#dc2626'}} onClick={() => handleCancel(res.id)} title="Cancel Reservation" onMouseOver={(e) => e.currentTarget.style.background = '#fef2f2'} onMouseOut={(e) => e.currentTarget.style.background = 'white'}><Ban size={16}/></button>
                                )}
                            </>
                          )}
                      </div>
                    </td>
                </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isManualModalOpen && (
        <div style={s.modalOverlay}>
            <div style={s.modalContent}>
                <div style={{padding:'20px 30px', borderBottom:'1px solid #e2e8f0', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                    <h2 style={{fontSize:'22px', fontWeight:'800', color:'#1e293b', margin:0}}>Create Reservation</h2>
                    <button onClick={() => setIsManualModalOpen(false)} style={{background:'none', border:'none', cursor:'pointer', color:'#94a3b8'}}><X size={24}/></button>
                </div>
                
                <form onSubmit={handleManualSubmit} style={{padding:'30px'}}>
                    
                    {/* Section 1: Bed Selection */}
                    <div style={s.formSection}>
                        <div style={s.formSectionTitle}><MapPin size={16} style={{marginRight:'8px', verticalAlign:'text-bottom'}}/> 1. Select Accommodation</div>
                        <div style={s.formRow}>
                            <div style={s.formGroup}>
                                <label style={s.formLabel}>Hub</label>
                                <select style={s.formSelect} value={manualForm.hubId} onChange={e => setManualForm({...manualForm, hubId: e.target.value, floorId:'', roomId:'', bedId:''})}>
                                    <option value="">-- Select Hub --</option>
                                    {hubs.map(h => <option key={h.id} value={h.id}>{h.hubNumber}</option>)}
                                </select>
                            </div>
                            <div style={s.formGroup}>
                                <label style={s.formLabel}>Floor</label>
                                <select style={s.formSelect} value={manualForm.floorId} onChange={e => setManualForm({...manualForm, floorId: e.target.value, roomId:'', bedId:''})} disabled={!manualForm.hubId}>
                                    <option value="">-- Select Floor --</option>
                                    {floors.map(f => <option key={f.id} value={f.id}>{f.floorNumber}</option>)}
                                </select>
                            </div>
                        </div>
                        <div style={s.formRow}>
                            <div style={s.formGroup}>
                                <label style={s.formLabel}>Room</label>
                                <select style={s.formSelect} value={manualForm.roomId} onChange={e => setManualForm({...manualForm, roomId: e.target.value, bedId:''})} disabled={!manualForm.floorId}>
                                    <option value="">-- Select Room --</option>
                                    {rooms.map(r => <option key={r.id} value={r.id}>{r.roomNumber} ({r.reservedFor})</option>)}
                                </select>
                            </div>
                            <div style={s.formGroup}>
                                <label style={s.formLabel}>Available Bed</label>
                                <select style={{...s.formSelect, borderColor: manualForm.bedId ? '#22c55e' : '#e2e8f0', background: manualForm.bedId ? '#f0fdf4' : 'white'}} value={manualForm.bedId} onChange={e => setManualForm({...manualForm, bedId: e.target.value})} disabled={!manualForm.roomId}>
                                    <option value="">-- Select Bed --</option>
                                    {beds.map(b => <option key={b.id} value={b.id}>{b.bedNumber}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Student Details */}
                    <div style={s.formSection}>
                        <div style={s.formSectionTitle}><User size={16} style={{marginRight:'8px', verticalAlign:'text-bottom'}}/> 2. Student Details</div>
                        <div style={s.formRow}>
                            <div style={s.formGroup}><label style={s.formLabel}>Full Name</label><input style={s.formInput} value={manualForm.studentName} onChange={e => setManualForm({...manualForm, studentName: e.target.value})} required/></div>
                            <div style={s.formGroup}><label style={s.formLabel}>Reg No / Username</label><input style={s.formInput} value={manualForm.registrationNumber} onChange={e => setManualForm({...manualForm, registrationNumber: e.target.value})} required/></div>
                        </div>
                        <div style={s.formRow}>
                            <div style={s.formGroup}><label style={s.formLabel}>Email</label><input type="email" style={s.formInput} value={manualForm.email} onChange={e => setManualForm({...manualForm, email: e.target.value})} required/></div>
                            <div style={s.formGroup}><label style={s.formLabel}>Contact No</label><input style={s.formInput} value={manualForm.contactNumber} onChange={e => setManualForm({...manualForm, contactNumber: e.target.value})} required/></div>
                        </div>
                        <div style={s.formRow}>
                             <div style={s.formGroup}><label style={s.formLabel}>Gender</label>
                                <select style={s.formSelect} value={manualForm.gender} onChange={e => setManualForm({...manualForm, gender: e.target.value})}>
                                    <option value="MALE">Male</option>
                                    <option value="FEMALE">Female</option>
                                </select>
                             </div>
                             <div style={s.formGroup}><label style={s.formLabel}>Address</label><input style={s.formInput} value={manualForm.address} onChange={e => setManualForm({...manualForm, address: e.target.value})}/></div>
                        </div>
                    </div>

                    {/* Section 3: Payment */}
                    <div style={s.formSection}>
                        <div style={s.formSectionTitle}><CreditCard size={16} style={{marginRight:'8px', verticalAlign:'text-bottom'}}/> 3. Payment & Dates</div>
                        <div style={s.formRow}>
                             <div style={s.formGroup}><label style={s.formLabel}>Payment Reference / Slip ID</label><input style={s.formInput} value={manualForm.paymentReference} onChange={e => setManualForm({...manualForm, paymentReference: e.target.value})} required placeholder="e.g. SLIP-8821"/></div>
                             <div style={s.formGroup}><label style={s.formLabel}>Amount Paid (LKR)</label><input type="number" style={s.formInput} value={manualForm.amount} onChange={e => setManualForm({...manualForm, amount: e.target.value})} required/></div>
                        </div>
                        <div style={s.formRow}>
                             <div style={s.formGroup}><label style={s.formLabel}>Check-in Date</label><input type="date" style={s.formInput} value={manualForm.fromDate} onChange={e => setManualForm({...manualForm, fromDate: e.target.value})} required/></div>
                             <div style={s.formGroup}><label style={s.formLabel}>Check-out Date</label><input type="date" style={s.formInput} value={manualForm.toDate} onChange={e => setManualForm({...manualForm, toDate: e.target.value})} required/></div>
                        </div>
                    </div>

                    <div style={{marginTop:'30px', display:'flex', justifyContent:'flex-end', gap:'12px', paddingTop:'20px', borderTop:'1px solid #f1f5f9'}}>
                        <button type="button" onClick={() => setIsManualModalOpen(false)} style={{padding:'12px 24px', background:'white', border:'1px solid #e2e8f0', borderRadius:'10px', fontWeight:'600', cursor:'pointer', color:'#64748b'}}>Cancel</button>
                        <button type="submit" style={{padding:'12px 24px', background:'#4f46e5', color:'white', border:'none', borderRadius:'10px', fontWeight:'700', cursor:'pointer', boxShadow:'0 4px 12px rgba(79, 70, 229, 0.3)'}}>Confirm Booking</button>
                    </div>

                </form>
            </div>
        </div>
      )}

      {isViewModalOpen && (
        <div style={s.overlay} onClick={() => setIsViewModalOpen(false)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            {isLoadingDetails ? <div style={{padding:'40px', textAlign:'center', color:'#64748b'}}>Loading Details...</div> 
            : selectedReservation ? (
                <>
                    <div style={s.modalHeader}>
                      <div><h3 style={s.modalTitle}>Reservation Details</h3><div style={{marginTop:'5px'}}><span style={s.badge(selectedReservation.status)}>{selectedReservation.status}</span></div></div>
                      <button onClick={() => setIsViewModalOpen(false)} style={{background:'none', border:'none', cursor:'pointer', color:'#9ca3af'}}><X size={24}/></button>
                    </div>
                    <div style={s.modalBody}>
                        <div style={s.sectionTitle}><User size={16}/> Student Information</div>
                        <div style={s.detailRow}><span style={s.detailLabel}>Full Name</span><span style={s.detailValue}>{selectedReservation.studentName}</span></div>
                        <div style={s.detailRow}><span style={s.detailLabel}>Registration No</span><span style={s.detailValue}>{selectedReservation.studentRegistrationNumber}</span></div> 
                        <div style={s.detailRow}><span style={s.detailLabel}>Gender</span><span style={s.detailValue}>{selectedReservation.gender}</span></div>
                        <div style={s.detailRow}><span style={s.detailLabel}>Email</span><span style={s.detailValue}>{selectedReservation.studentEmail}</span></div>
                        <div style={s.detailRow}><span style={s.detailLabel}>Phone</span><span style={s.detailValue}>{selectedReservation.studentContact}</span></div>

                        <div style={{...s.sectionTitle, marginTop:'25px'}}><Building2 size={16}/> Accommodation</div>
                        <div style={s.detailRow}><span style={s.detailLabel}>Reservation ID</span><span style={{...s.detailValue, fontFamily:'monospace'}}>{selectedReservation.reservationNumber}</span></div>
                        <div style={s.detailRow}><span style={s.detailLabel}>Room Number</span><span style={s.detailValue}>{selectedReservation.roomNumber}</span></div>
                        <div style={s.detailRow}><span style={s.detailLabel}>Bed Number</span><span style={s.detailValue}>{selectedReservation.bedNumber}</span></div>
                        <div style={s.detailRow}><span style={s.detailLabel}>Check-in</span><span style={s.detailValue}>{selectedReservation.checkIn}</span></div>
                        <div style={s.detailRow}><span style={s.detailLabel}>Check-out</span><span style={s.detailValue}>{selectedReservation.checkOut}</span></div>

                        <div style={{...s.sectionTitle, marginTop:'25px'}}><Receipt size={16}/> Payment Information</div>
                        <div style={s.detailRow}><span style={s.detailLabel}>Payment ID</span><span style={{...s.detailValue, fontFamily:'monospace'}}>{selectedReservation.paymentId || 'N/A'}</span></div>
                        <div style={s.detailRow}><span style={s.detailLabel}>Date & Time</span><span style={s.detailValue}>{selectedReservation.paymentDate} {selectedReservation.paymentTime}</span></div>
                        <div style={s.detailRow}><span style={s.detailLabel}>Status</span><span style={s.detailValue}><span style={s.paymentBadge(selectedReservation.paymentStatus)}>{selectedReservation.paymentStatus}</span></span></div>
                        <div style={s.detailRow}><span style={s.detailLabel}>Amount Paid</span><span style={{...s.detailValue, color:'#15803d'}}>LKR {selectedReservation.amountPaid ? selectedReservation.amountPaid.toLocaleString('en-US', {minimumFractionDigits: 2}) : '0.00'}</span></div>

                        <button style={s.closeBtn} onClick={() => setIsViewModalOpen(false)}>Close Details</button>
                    </div>
                </>
            ) : <div style={{padding:'20px', textAlign:'center', color:'red'}}>Failed to load data.</div>}
          </div>
        </div>
      )}

      {isMoveModalOpen && (
        <div style={s.overlay} onClick={() => setIsMoveModalOpen(false)}>
            <div style={{...s.modal, width:'480px'}} onClick={e => e.stopPropagation()}>
                <div style={s.modalHeader}><div><h3 style={s.modalTitle}>Select New Bed</h3><p style={{margin:'2px 0 0', fontSize:'13px', color:'#64748b'}}>Re-assign this reservation to an available bed.</p></div><button onClick={() => setIsMoveModalOpen(false)} style={{background:'none', border:'none', cursor:'pointer', color:'#9ca3af'}}><X size={24}/></button></div>
                <div style={{padding:'0', maxHeight:'350px', overflowY:'auto', background:'#f8fafc'}}>
                    {matchingBeds.length === 0 ? <div style={{textAlign:'center', padding:'40px', color:'#64748b'}}><BedDouble size={32} style={{marginBottom:'10px', opacity:0.5}}/><p>No matching available beds found.</p></div> 
                    : matchingBeds.map((b) => (
                        <div key={b.id} onClick={() => confirmMove(b.id)} style={{padding:'16px 24px', cursor:'pointer', borderBottom:'1px solid #f1f5f9', background:'white', display:'flex', alignItems:'center', gap:'15px', transition:'background 0.2s'}} onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={(e) => e.currentTarget.style.background = 'white'}>
                            <div style={{minWidth:'40px', height:'40px', borderRadius:'10px', background:'#e0e7ff', color:'#4338ca', display:'flex', alignItems:'center', justifyContent:'center'}}><BedDouble size={20}/></div>
                            <div style={{flex:1}}><div style={{fontWeight:'700', color:'#1e293b', fontSize:'15px'}}>Bed {b.bedNumber}</div><div style={{display:'flex', gap:'8px', marginTop:'4px'}}><span style={{fontSize:'11px', fontWeight:'600', padding:'2px 8px', borderRadius:'4px', background:'#f3f4f6', color:'#4b5563', display:'flex', alignItems:'center', gap:'4px'}}><Building2 size={10}/> {b.hubNumber || '-'}</span><span style={{fontSize:'11px', fontWeight:'600', padding:'2px 8px', borderRadius:'4px', background:'#f3f4f6', color:'#4b5563', display:'flex', alignItems:'center', gap:'4px'}}><Layers size={10}/> {b.floorNumber || '-'}</span><span style={{fontSize:'11px', fontWeight:'600', padding:'2px 8px', borderRadius:'4px', background:'#fff7ed', color:'#c2410c', border:'1px solid #fed7aa', display:'flex', alignItems:'center', gap:'4px'}}><DoorOpen size={10}/> {b.roomNumber || '-'}</span></div></div>
                        </div>
                    ))}
                </div>
                <div style={s.modalFooter}><button style={s.closeBtn} onClick={() => setIsMoveModalOpen(false)}>Cancel</button></div>
            </div>
        </div>
      )}
    </div>
  );
};

export default ManageReservations;