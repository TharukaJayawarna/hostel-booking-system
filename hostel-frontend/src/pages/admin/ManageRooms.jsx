import React, { useEffect, useState } from 'react';
import api from '../../api/axiosConfig';
import { toast } from 'react-toastify';

const ManageRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [floors, setFloors] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hoveredRow, setHoveredRow] = useState(null);
  
  const [formData, setFormData] = useState({
    floorId: '', roomNumber: '', price: '', isPrivate: false, reservationPeriod: 'ONE_MONTH', reservedFor: 'BOYS'
  });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [r, f] = await Promise.all([api.get('/rooms'), api.get('/floors')]);
      if(r.data.status === 'SUCCESS') setRooms(r.data.data);
      if(f.data.status === 'SUCCESS') setFloors(f.data.data);
    } catch (e) { toast.error("Failed to load data"); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if(!formData.floorId || !formData.roomNumber || !formData.price) {
        toast.warning("Please fill all required fields");
        return;
    }
    try {
      await api.post(`/floors/${formData.floorId}/rooms`, formData);
      toast.success("Room Added Successfully!");
      setIsModalOpen(false);
      resetForm();
      fetchAll();
    } catch (e) { toast.error("Failed to add room"); }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Are you sure you want to delete this Room?")) return;
    try { await api.delete(`/rooms/${id}`); toast.success("Room Deleted"); fetchAll(); } 
    catch (e) { toast.error("Failed to delete"); }
  };

  const resetForm = () => {
    setFormData({ floorId: '', roomNumber: '', price: '', isPrivate: false, reservationPeriod: 'ONE_MONTH', reservedFor: 'BOYS' });
  };

  // --- STYLES ---
  const s = {
    container: { fontFamily: "'Inter', sans-serif", color: '#111827', paddingBottom: '40px' },

    // Header
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
    titleGroup: { display: 'flex', flexDirection: 'column' },
    title: { fontSize: '28px', fontWeight: '800', color: '#111827', margin: 0 },
    subTitle: { fontSize: '14px', color: '#6b7280', marginTop: '5px' },

    addBtn: { 
      background: '#4f46e5', color: 'white', padding: '10px 20px', 
      borderRadius: '8px', border: 'none', cursor: 'pointer', 
      fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px',
      boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.2)'
    },

    // Table
    tableContainer: { 
      background: 'white', borderRadius: '16px', 
      border: '1px solid #e5e7eb',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', overflow: 'hidden' 
    },
    table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
    thead: { backgroundColor: '#b3b6b9ff', borderBottom: '1px solid #e5e7eb' },
    th: { padding: '16px 24px', fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em' },
    tr: (id) => ({ 
      borderBottom: '1px solid #f3f4f6', 
      transition: 'background-color 0.2s',
      backgroundColor: hoveredRow === id ? '#f9fafb' : 'white'
    }),
    td: { padding: '16px 24px', fontSize: '14px', color: '#374151', verticalAlign: 'middle' },

    // Badges
    badge: (type) => {
      let bg = '#f3f4f6', col = '#374151', border = '#e5e7eb';
      if (type === 'BOYS') { bg = '#eff6ff'; col = '#1d4ed8'; border = '#bfdbfe'; }
      else if (type === 'GIRLS') { bg = '#fdf2f8'; col = '#db2777'; border = '#fbcfe8'; }
      else if (type === 'PVT') { bg = '#f5f3ff'; col = '#7c3aed'; border = '#ddd6fe'; } // Private
      else if (type === 'SHR') { bg = '#ecfdf5'; col = '#059669'; border = '#a7f3d0'; } // Shared
      
      return {
        display: 'inline-flex', alignItems: 'center', gap: '4px',
        padding: '2px 10px', borderRadius: '9999px', fontSize: '11px', fontWeight: '700',
        backgroundColor: bg, color: col, border: `1px solid ${border}`, textTransform: 'uppercase'
      };
    },

    priceTag: { fontFamily: 'monospace', fontWeight: '700', fontSize: '14px', color: '#111827' },

    delBtn: { 
      background: '#fff', border: '1px solid #fee2e2', color: '#ef4444', 
      padding: '8px', borderRadius: '8px', cursor: 'pointer', 
      display: 'flex', alignItems: 'center', justifyContent: 'center' 
    },

    // Modal
    overlay: { 
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
      background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 
    },
    modal: { 
      background: 'white', borderRadius: '16px', width: '600px', // Wider modal for grid
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden'
    },
    modalHeader: { padding: '20px 24px', borderBottom: '1px solid #f3f4f6', background: '#fff' },
    modalBody: { padding: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
    modalFooter: { padding: '20px 24px', background: '#f9fafb', borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'flex-end', gap: '12px' },
    
    label: { display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#374151' },
    input: { 
      width: '100%', padding: '10px 12px', borderRadius: '8px', 
      border: '1px solid #d1d5db', fontSize: '14px', outline: 'none',
      boxSizing: 'border-box', transition: 'border-color 0.2s'
    },
    select: {
      width: '100%', padding: '10px 12px', borderRadius: '8px', 
      border: '1px solid #d1d5db', fontSize: '14px', outline: 'none',
      backgroundColor: 'white', cursor: 'pointer'
    },
    
    // Checkbox container styled as a row
    checkboxContainer: {
        gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '10px',
        padding: '10px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb'
    }
  };

  return (
    <div style={s.container}>
      {/* HEADER */}
      <div style={s.header}>
        <div style={s.titleGroup}>
          <h2 style={s.title}>Manage Rooms</h2>
          <p style={s.subTitle}>Create and manage accommodation rooms.</p>
        </div>
        <button style={s.addBtn} onClick={() => setIsModalOpen(true)}>
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add New Room
        </button>
      </div>

      {/* TABLE */}
      <div style={s.tableContainer}>
        <table style={s.table}>
          <thead style={s.thead}>
            <tr>
              <th style={s.th}>Room Details</th>
              <th style={s.th}>Location</th>
              <th style={s.th}>Price (Monthly)</th>
              <th style={s.th}>Type & Gender</th>
              <th style={s.th}>Duration</th>
              <th style={{...s.th, textAlign:'right'}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rooms.length === 0 ? (
                <tr><td colSpan="6" style={{textAlign:'center', padding:'40px', color:'#9ca3af'}}>No rooms available.</td></tr>
            ) : (
                rooms.map(r => (
                <tr 
                    key={r.id} 
                    style={s.tr(r.id)}
                    onMouseEnter={() => setHoveredRow(r.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                >
                    {/* Room Number */}
                    <td style={s.td}>
                        <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                            <div style={{width:'40px', height:'40px', borderRadius:'10px', background:'#fff7ed', color:'#ea580c', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px'}}>
                                🚪
                            </div>
                            <span style={{fontWeight:'700', color:'#111827', fontSize:'15px'}}>{r.roomNumber}</span>
                        </div>
                    </td>
                    
                    {/* Location */}
                    <td style={s.td}>
                        <div style={{fontWeight:'600', fontSize:'13px'}}>{r.floorNumber}</div>
                        <div style={{fontSize:'12px', color:'#6b7280'}}>
                             {/* Trying to find Hub name if available in floors list, or just generic text */}
                             {floors.find(f => f.floorNumber === r.floorNumber)?.hubNumber || 'Hub Info'}
                        </div>
                    </td>

                    {/* Price */}
                    <td style={s.td}>
                        <span style={s.priceTag}>
                           LKR {parseFloat(r.price).toLocaleString('en-US', {minimumFractionDigits: 2})}
                        </span>
                    </td>

                    {/* Type & Gender */}
                    <td style={s.td}>
                        <div style={{display:'flex', flexDirection:'column', gap:'5px', alignItems:'flex-start'}}>
                            <span style={s.badge(r.isPrivate ? 'PVT' : 'SHR')}>
                                {r.isPrivate ? "🔒 Private" : "👥 Shared"}
                            </span>
                            <span style={s.badge(r.reservedFor)}>
                                {r.reservedFor === 'BOYS' ? "👨 Boys" : "👩 Girls"}
                            </span>
                        </div>
                    </td>

                    {/* Period */}
                    <td style={s.td}>
                        <span style={{fontSize:'13px', color:'#4b5563', fontWeight:'500'}}>
                            {r.reservationPeriod.replace('_', ' ')}
                        </span>
                    </td>

                    {/* Actions */}
                    <td style={s.td}>
                        <div style={{display:'flex', justifyContent:'flex-end'}}>
                            <button style={s.delBtn} onClick={() => handleDelete(r.id)} title="Delete Room">
                                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>
                    </td>
                </tr>
                ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div style={s.overlay} onClick={() => setIsModalOpen(false)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <div style={s.modalHeader}>
                <h3 style={{margin: 0, fontSize: '18px', fontWeight: '700', color: '#111827'}}>Add New Room</h3>
                <p style={{margin: '5px 0 0', fontSize: '13px', color: '#6b7280'}}>Enter details to create a new room.</p>
            </div>

            <form onSubmit={handleCreate}>
                <div style={s.modalBody}>
                    {/* Floor Selection (Full Width) */}
                    <div style={{gridColumn: '1 / -1'}}>
                        <label style={s.label}>Select Floor</label>
                        <select style={s.select} value={formData.floorId} onChange={e => setFormData({...formData, floorId: e.target.value})} required>
                            <option value="">-- Choose a Floor --</option>
                            {floors.map(f => (
                                <option key={f.id} value={f.id}>
                                    {f.hubNumber ? `${f.hubNumber} - ` : ''}{f.floorNumber}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Room Number */}
                    <div>
                        <label style={s.label}>Room Number</label>
                        <input style={s.input} placeholder="Ex: R-101" value={formData.roomNumber} onChange={e => setFormData({...formData, roomNumber: e.target.value})} required />
                    </div>

                    {/* Price */}
                    <div>
                        <label style={s.label}>Price (LKR)</label>
                        <input type="number" style={s.input} placeholder="0.00" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required />
                    </div>

                    {/* Gender */}
                    <div>
                        <label style={s.label}>Gender Allocation</label>
                        <select style={s.select} value={formData.reservedFor} onChange={e => setFormData({...formData, reservedFor: e.target.value})}>
                            <option value="BOYS">👨 Boys</option>
                            <option value="GIRLS">👩 Girls</option>
                        </select>
                    </div>

                    {/* Duration */}
                    <div>
                        <label style={s.label}>Reservation Period</label>
                        <select style={s.select} value={formData.reservationPeriod} onChange={e => setFormData({...formData, reservationPeriod: e.target.value})}>
                            <option value="ONE_MONTH">1 Month</option>
                            <option value="TWO_MONTHS">2 Months</option>
                            <option value="UNDER_ONE_MONTH">Less than 1 Month</option>
                            <option value="UNDER_TWO_MONTHS">Less than 2 Months</option>
                        </select>
                    </div>

                    {/* Private Checkbox (Full Width) */}
                    <div style={s.checkboxContainer}>
                        <input 
                            type="checkbox" 
                            id="isPrivate" 
                            checked={formData.isPrivate} 
                            onChange={e => setFormData({...formData, isPrivate: e.target.checked})} 
                            style={{width:'18px', height:'18px', cursor:'pointer'}}
                        /> 
                        <label htmlFor="isPrivate" style={{fontSize:'14px', fontWeight:'600', color:'#374151', cursor:'pointer'}}>
                            Mark as Private Room 🔒
                        </label>
                    </div>
                </div>

                <div style={s.modalFooter}>
                    <button type="button" onClick={() => setIsModalOpen(false)} style={{padding:'10px 18px', border:'1px solid #d1d5db', background:'white', borderRadius:'8px', cursor:'pointer', fontWeight:'600', color:'#374151'}}>Cancel</button>
                    <button type="submit" style={{padding:'10px 18px', border:'none', background:'#4f46e5', borderRadius:'8px', cursor:'pointer', fontWeight:'600', color:'white'}}>Save Room</button>
                </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageRooms;