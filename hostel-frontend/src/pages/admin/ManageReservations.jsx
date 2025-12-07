import React, { useEffect, useState, useRef } from 'react';
import api from '../../api/axiosConfig';
import { toast } from 'react-toastify';

const ManageReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [showTrash, setShowTrash] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Dropdown State
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const dropdownRef = useRef(null);

  // Move Bed Modal State
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [matchingBeds, setMatchingBeds] = useState([]);
  const [selectedResId, setSelectedResId] = useState(null);

  // View Details Modal State
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  useEffect(() => { fetchReservations(); }, [showTrash]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdownId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchReservations = async () => {
    try {
      const endpoint = showTrash ? '/reservations/trash' : '/reservations';
      const res = await api.get(endpoint);
      if(res.data.status === 'SUCCESS') setReservations(res.data.data);
    } catch(e) {}
  };

  const toggleDropdown = (id, e) => {
    e.stopPropagation(); 
    setActiveDropdownId(activeDropdownId === id ? null : id);
  };

  const filteredReservations = reservations.filter((res) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (res.studentName && res.studentName.toLowerCase().includes(term)) ||
      (res.studentRegNo && res.studentRegNo.toLowerCase().includes(term)) ||
      (res.reservationNumber && res.reservationNumber.toLowerCase().includes(term))
    );
  });

  // --- Actions ---
  const handleReactivate = async (id) => {
    if(!window.confirm("Reactivate?")) return;
    try { await api.post(`/reservations/${id}/reactivate`); toast.success("Reactivated!"); fetchReservations(); setActiveDropdownId(null); } 
    catch(e) { toast.error(e.response?.data?.message || "Failed"); }
  };

  const handleRefund = async (id) => {
    if(!window.confirm("Mark Refunded?")) return;
    try { await api.patch(`/reservations/${id}/cancel`); toast.success("Cancelled/Refunded"); fetchReservations(); setActiveDropdownId(null); } 
    catch(e) { toast.error("Failed"); }
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
      toast.success("Moved!");
      setIsMoveModalOpen(false);
      fetchReservations();
    } catch(e) { toast.error("Failed"); }
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
    } catch (error) {
      toast.error("Failed to load details");
      setIsViewModalOpen(false);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const s = {
    container: { fontFamily: "'Inter', sans-serif", color: '#111827' },
    pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
    title: { fontSize: '28px', fontWeight: '800' },
  
    searchInput: {
      padding: '10px 15px', borderRadius: '8px', border: '1px solid #e5e7eb',
      width: '300px', fontSize: '14px', outline: 'none', boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
    },
    headerActions: { display: 'flex', gap: '15px', alignItems: 'center' },

    dateBox: { display: 'flex', flexDirection: 'column', gap: '6px' },
    dateRow: { display: 'flex', alignItems: 'center', gap: '10px' },
    dateBadge: (type) => ({
      fontSize: '10px', fontWeight: '800', padding: '3px 8px', borderRadius: '6px', 
      minWidth: '35px', textAlign: 'center', letterSpacing: '0.5px',
      backgroundColor: type === 'IN' ? '#ecfdf5' : '#fff1f2',
      color: type === 'IN' ? '#047857' : '#be123c',
      border: `1px solid ${type === 'IN' ? '#a7f3d0' : '#fecdd3'}`
    }),
    dateText: { fontSize: '13px', fontWeight: '600', color: '#374151', fontVariantNumeric: 'tabular-nums' },

    toggleBtn: { 
      padding: '10px 20px', borderRadius: '8px', border: '1px solid #3c3e40ff', 
      backgroundColor: 'white', color: '#374151', fontWeight: '600', cursor: 'pointer', 
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
    },
    tableWrapper: {
      background: 'white', borderRadius: '16px', border: '1px solid #e5e7eb',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', overflow: 'visible' // Dropdown eka penna visible thibiya yuthui
    },
    table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
    thead: { backgroundColor: '#c3c2c4ff', borderBottom: '1px solid #e5e7eb' },
    th: { padding: '16px 20px', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', color: '#6b7280', letterSpacing: '0.05em' },
    tr: { borderBottom: '1px solid #f3f4f6', transition: 'background-color 0.2s' },
    td: { fontWeight: '600', padding: '16px 20px', fontSize: '14px', color: '#181e27ff', verticalAlign: 'middle' },
    
    badge: (status) => {
      const colors = {
        COMPLETED: {text: '#09ac81ff', bg: '#ecfdf5'},
        PENDING: {text: '#f58743ff', bg: '#fff7ed'},
        REJECTED: {text: '#e43636ff', bg: '#fef2f2'},
        REFUNDED: {text: '#4470b7ff', bg: '#eff6ff'},
        CANCELLED: {text: '#11151bff', bg: '#f3f4f6'}
      };
      const style = colors[status] || colors.PENDING;
      return {
        backgroundColor: style.bg, color: style.text, padding: '4px 10px',
        borderRadius: '9999px', fontSize: '11px', fontWeight: '700', display: 'inline-block'
      };
    },
    btnGroup: { display: 'flex', gap: '6px', alignItems: 'center' },
    btn: (color, bg = 'transparent', border = 'none') => ({
      padding: '6px 12px', borderRadius: '6px', border: border, fontSize: '11px',
      fontWeight: '600', cursor: 'pointer', color: color, backgroundColor: bg
    }),
    
    // Icon Button (Three dots)
    iconBtn: {
      background: 'transparent', border: '1px solid #e5e7eb', cursor: 'pointer', 
      padding: '5px 8px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#374151', transition: 'background 0.2s'
    },
    
    // --- DROPDOWN STYLES ---
    dropdownContainer: { position: 'relative' },
    dropdownMenu: {
      position: 'absolute', right: 0, top: '100%', marginTop: '5px',
      backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 50, width: '160px', overflow: 'hidden'
    },
    dropdownItem: (color = '#374151') => ({
      display: 'block', width: '100%', padding: '10px 15px', textAlign: 'left',
      border: 'none', background: 'white', cursor: 'pointer', fontSize: '13px',
      fontWeight: '500', color: color, transition: 'background 0.1s'
    }),

    overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(2px)' },
    modal: { background: 'white', padding: '30px', borderRadius: '16px', width: '500px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' },
    detailRow: { display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f3f4f6' },
    detailLabel: { color: '#6b7280', fontSize: '14px', fontWeight: '500' },
    detailValue: { color: '#111827', fontSize: '14px', fontWeight: '600', textAlign: 'right' },
    loading: { textAlign: 'center', padding: '40px', color: '#666' }
  };

  return (
    <div style={s.container} onClick={() => setActiveDropdownId(null)}>
      <div style={s.pageHeader}>
        <h2 style={s.title}>{showTrash ? "Trash / History" : "Reservations"}</h2>
        <div style={s.headerActions}>
            <div style={s.headerActions}>
            {/* SEARCH INPUT */}
            <input 
                type="text" 
                placeholder="Search by Name, ID, or Ref No..." 
                style={s.searchInput}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button style={s.toggleBtn} onClick={() => setShowTrash(!showTrash)}>{showTrash ? "View Active" : "View Trash"}</button>
        </div>
      </div>
      </div>

      <div style={s.tableWrapper}>
        <table style={s.table}>
          <thead style={s.thead}>
            <tr>
              <th style={s.th}>Ref No</th>
              <th style={s.th}>Student</th>
              <th style={s.th}>Bed</th>
              <th style={s.th}>CheckIn / CheckOut Dates</th>
              <th style={s.th}>Status</th>
              <th style={{...s.th, width:'140px'}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredReservations.length === 0 ? (
               <tr><td colSpan="6" style={{textAlign:'center', padding:'20px', color:'#888'}}>No reservations found.</td></tr>
            ) : (
                filteredReservations.map(res => (
                <tr key={res.id} style={s.tr}>
                    <td style={{...s.td, fontFamily:'monospace', fontWeight:'bold'}}>{res.reservationNumber}</td>
                    <td style={s.td}>{res.studentName}<br/><span style={{fontSize:'12px', color:'#888'}}>{res.studentRegNo}</span></td>
                    <td style={s.td}>{res.bedNumber}</td>
                    <td style={s.td}>
                      <div style={s.dateBox}>
                        <div style={s.dateRow}><span style={s.dateBadge('IN')}>IN</span><span style={s.dateText}>{res.checkIn}</span></div>
                        <div style={s.dateRow}><span style={s.dateBadge('OUT')}>OUT</span><span style={s.dateText}>{res.checkOut}</span></div>
                      </div>
                    </td>
                    <td style={s.td}><span style={s.badge(res.status)}>{res.status}</span></td>
                    
                    {/* --- ACTIONS COLUMN MODIFIED --- */}
                    <td style={s.td}>
                      <div style={s.btnGroup}>
                          
                          {/* 1. VIEW BUTTON (Common for all) */}
                          <button style={s.btn('#ffffffff', '#3657c2ff')} onClick={() => openViewModal(res.id)}>View</button>

                          {/* 2. REJECTED: Show Dropdown (Three Dots) */}
                          {res.status === 'REJECTED' && (
                            <div style={s.dropdownContainer} ref={activeDropdownId === res.id ? dropdownRef : null}>
                                <button style={s.iconBtn} onClick={(e) => toggleDropdown(res.id, e)}>
                                  {/* Three Dots SVG */}
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle>
                                  </svg>
                                </button>
                                {activeDropdownId === res.id && (
                                  <div style={s.dropdownMenu}>
                                    <button style={s.dropdownItem('#059669')} onClick={() => handleReactivate(res.id)}>Reactivate</button>
                                    <button style={s.dropdownItem('#d97706')} onClick={() => openMoveModal(res.id)}>Move Bed</button>
                                    <button style={s.dropdownItem('#dc2626')} onClick={() => handleRefund(res.id)}>Refund</button>
                                  </div>
                                )}
                            </div>
                          )}

                          {/* 3. COMPLETED/OTHERS: Show Direct Cancel Button (Old Style) */}
                          {res.status === 'COMPLETED' && (
                             <button style={s.btn('#ffffffff', '#3d3d3eff')} onClick={() => handleRefund(res.id)}>Cancel</button>
                          )}
                      </div>
                    </td>

                </tr>
                ))
            )}
          </tbody>
        </table>
      </div>

       {isViewModalOpen && (
        <div style={s.overlay} onClick={() => setIsViewModalOpen(false)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            
            {isLoadingDetails ? (
                <div style={s.loading}>Loading Details...</div>
            ) : selectedReservation ? (
                <>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
                      <h3 style={{margin:0, fontSize:'20px', fontWeight:'800'}}>Reservation Details</h3>
                      <span style={s.badge(selectedReservation.status)}>{selectedReservation.status}</span>
                    </div>

                    <div style={{marginBottom:'20px'}}>
                      <h4 style={{fontSize:'14px', color:'#2b5c9e', borderBottom:'1px solid #eee', paddingBottom:'5px', marginBottom:'10px'}}>👤 Student Information</h4>
                      <div style={s.detailRow}><span style={s.detailLabel}>Name</span><span style={s.detailValue}>{selectedReservation.studentName}</span></div>
                      <div style={s.detailRow}><span style={s.detailLabel}>Registration No</span><span style={s.detailValue}>{selectedReservation.studentRegNo || selectedReservation.reservationNumber}</span></div> 
                      <div style={s.detailRow}><span style={s.detailLabel}>Gender</span><span style={s.detailValue}>{selectedReservation.gender}</span></div>
                      <div style={s.detailRow}><span style={s.detailLabel}>Email</span><span style={s.detailValue}>{selectedReservation.studentEmail}</span></div>
                      <div style={s.detailRow}><span style={s.detailLabel}>Phone</span><span style={s.detailValue}>{selectedReservation.studentContact}</span></div>
                    </div>

                    <div style={{marginBottom:'20px'}}>
                      <h4 style={{fontSize:'14px', color:'#2b5c9e', borderBottom:'1px solid #eee', paddingBottom:'5px', marginBottom:'10px'}}>🏠 Accommodation</h4>
                      <div style={s.detailRow}><span style={s.detailLabel}>Reservation ID</span><span style={{...s.detailValue, fontFamily:'monospace'}}>{selectedReservation.reservationNumber}</span></div>
                      <div style={s.detailRow}><span style={s.detailLabel}>Room Number</span><span style={s.detailValue}>{selectedReservation.roomNumber}</span></div>
                      <div style={s.detailRow}><span style={s.detailLabel}>Bed Number</span><span style={s.detailValue}>{selectedReservation.bedNumber}</span></div>
                      <div style={s.detailRow}><span style={s.detailLabel}>Check-in</span><span style={s.detailValue}>{selectedReservation.checkIn}</span></div>
                      <div style={s.detailRow}><span style={s.detailLabel}>Check-out</span><span style={s.detailValue}>{selectedReservation.checkOut}</span></div>
                    </div>

                    <div style={{background:'#f9fafb', padding:'15px', borderRadius:'10px'}}>
                      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                        <span style={{color:'#374151', fontWeight:'600'}}>Total Amount Paid</span>
                        <span style={{fontSize:'18px', fontWeight:'800', color:'#2b5c9e'}}>
                           LKR {selectedReservation.amountPaid ? selectedReservation.amountPaid.toLocaleString('en-US', {minimumFractionDigits: 2}) : '0.00'}
                        </span>
                      </div>
                    </div>
                </>
            ) : (
                <div style={{textAlign:'center', color:'red'}}>Failed to load data.</div>
            )}

            <button onClick={() => setIsViewModalOpen(false)} style={{width:'100%', padding:'12px', marginTop:'20px', background:'#111827', color:'white', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:'600'}}>Close</button>
          </div>
        </div>
      )}


      {isMoveModalOpen && (
  <div style={{...s.overlay, backdropFilter: 'blur(4px)', backgroundColor: 'rgba(0,0,0,0.5)'}}>
    <div style={{
        ...s.modal, 
        width: '450px', // තොරතුරු වැඩි නිසා width එක පොඩ්ඩක් වැඩි කළා
        padding: '0', 
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' 
    }}>
      
      {/* 1. HEADER SECTION */}
      <div style={{padding: '20px 25px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <div>
           <h3 style={{margin: 0, fontSize: '18px', fontWeight: '700', color: '#111827'}}>Select New Bed</h3>
           <p style={{margin: '5px 0 0', fontSize: '13px', color: '#6b7280'}}>Select a bed from the available list.</p>
        </div>
        <button onClick={() => setIsMoveModalOpen(false)} style={{background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: '20px'}}>✕</button>
      </div>

      {/* 2. BED LIST SECTION */}
      <div style={{padding: '20px 25px', background: '#f9fafb'}}>
         {matchingBeds.length === 0 ? (
            <div style={{textAlign: 'center', padding: '30px 0', color: '#6b7280'}}>
               <span style={{fontSize: '24px', display: 'block', marginBottom: '10px'}}>🛏️</span>
               No matching beds found.
            </div>
         ) : (
            <div style={{
                maxHeight: '350px', 
                overflowY: 'auto', 
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '12px'
            }}>
              {matchingBeds.map((b, index) => (
                  <div 
                    key={b.id} 
                    onClick={() => confirmMove(b.id)} 
                    style={{
                        padding: '16px', 
                        borderBottom: index !== matchingBeds.length - 1 ? '1px solid #f3f4f6' : 'none', 
                        cursor: 'pointer',
                        transition: 'background 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '15px'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                  >
                    {/* Icon Box */}
                    <div style={{
                        minWidth: '40px', height: '40px', borderRadius: '10px', 
                        background: '#e0e7ff', color: '#4338ca', display: 'flex', 
                        alignItems: 'center', justifyContent: 'center', fontSize: '20px'
                    }}>
                       🛏️
                    </div>

                    {/* Details Section */}
                    <div style={{flex: 1}}>
                        {/* Bed Number */}
                        <div style={{fontWeight: '700', color: '#111827', fontSize: '15px', marginBottom: '6px'}}>
                            Bed {b.bedNumber}
                        </div>
                        
                        {/* Tags Row: Hub | Floor | Room */}
                        <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
                            {/* Hub Badge */}
                            <span style={{
                                fontSize: '11px', fontWeight: '600', padding: '2px 8px', borderRadius: '4px',
                                background: '#f3f4f6', color: '#4b5563', border: '1px solid #e5e7eb'
                            }}>
                                🏢 {b.hubNumber || 'Hub -'}
                            </span>

                            {/* Floor Badge */}
                            <span style={{
                                fontSize: '11px', fontWeight: '600', padding: '2px 8px', borderRadius: '4px',
                                background: '#f3f4f6', color: '#4b5563', border: '1px solid #e5e7eb'
                            }}>
                                📶 Floor {b.floorNumber || '-'}
                            </span>

                            {/* Room Badge */}
                            <span style={{
                                fontSize: '11px', fontWeight: '600', padding: '2px 8px', borderRadius: '4px',
                                background: '#fff7ed', color: '#c2410c', border: '1px solid #fed7aa' // Room එක Highlight කලා
                            }}>
                                🚪 Room {b.roomNumber || '-'}
                            </span>
                        </div>
                    </div>

                    {/* Arrow Icon to indicate clickable */}
                    <div style={{color: '#d1d5db'}}>
                        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </div>

                  </div>
              ))}
            </div>
         )}
      </div>

      {/* 3. FOOTER SECTION */}
      <div style={{padding: '15px 25px', background: 'white', borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'flex-end'}}>
        <button 
            onClick={() => setIsMoveModalOpen(false)} 
            style={{
                padding: '10px 20px', 
                background: '#fff', 
                border: '1px solid #d1d5db', 
                borderRadius: '8px', 
                color: '#374151', 
                fontWeight: '600', 
                cursor: 'pointer',
                fontSize: '14px'
            }}
        >
            Cancel
        </button>
      </div>

    </div>
  </div>
)}
    </div>
  );
};

export default ManageReservations;