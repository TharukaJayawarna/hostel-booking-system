import React, { useEffect, useState } from 'react';
import api from '../../api/axiosConfig';
import { toast } from 'react-toastify';

const ManageBeds = () => {
  const [beds, setBeds] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [formData, setFormData] = useState({ roomId: '', bedNumber: '' });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [b, r] = await Promise.all([api.get('/beds'), api.get('/rooms')]);
      if(b.data.status === 'SUCCESS') setBeds(b.data.data);
      if(r.data.status === 'SUCCESS') setRooms(r.data.data);
    } catch (e) { toast.error("Failed to load data"); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if(!formData.roomId || !formData.bedNumber) {
        toast.warning("Please fill all fields");
        return;
    }
    try {
      await api.post(`/rooms/${formData.roomId}/beds`, { bedNumber: formData.bedNumber });
      toast.success("Bed Added Successfully!");
      setIsModalOpen(false);
      setFormData({ roomId: '', bedNumber: '' });
      fetchAll();
    } catch (e) { toast.error("Failed to create bed"); }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Are you sure you want to delete this Bed?")) return;
    try { await api.delete(`/beds/${id}`); toast.success("Bed Deleted"); fetchAll(); } 
    catch (e) { toast.error("Failed to delete"); }
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

    // Status Badge
    statusBadge: (isBooked) => ({
      display: 'inline-flex', alignItems: 'center', gap: '6px',
      padding: '4px 12px', borderRadius: '9999px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase',
      backgroundColor: isBooked ? '#fef2f2' : '#f0fdf4',
      color: isBooked ? '#dc2626' : '#16a34a',
      border: `1px solid ${isBooked ? '#fecaca' : '#bbf7d0'}`
    }),

    // Delete Button
    delBtn: { 
      background: '#fff', border: '1px solid #fee2e2', 
      color: '#ef4444', padding: '8px', borderRadius: '8px', 
      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'all 0.2s'
    },

    // Modal
    overlay: { 
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
      background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 
    },
    modal: { 
      background: 'white', padding: '0', borderRadius: '16px', 
      width: '420px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      overflow: 'hidden'
    },
    modalHeader: { padding: '20px 24px', borderBottom: '1px solid #f3f4f6', background: '#fff' },
    modalBody: { padding: '24px' },
    modalFooter: { padding: '16px 24px', background: '#f9fafb', borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'flex-end', gap: '12px' },
    
    inputLabel: { display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: '#374151' },
    input: { 
      width: '100%', padding: '10px 12px', borderRadius: '8px', 
      border: '1px solid #d1d5db', fontSize: '14px', outline: 'none',
      marginBottom: '16px', boxSizing: 'border-box'
    },
    select: {
      width: '100%', padding: '10px 12px', borderRadius: '8px', 
      border: '1px solid #d1d5db', fontSize: '14px', outline: 'none',
      marginBottom: '16px', boxSizing: 'border-box', backgroundColor: 'white',
      cursor: 'pointer'
    }
  };

  return (
    <div style={s.container}>
      {/* HEADER */}
      <div style={s.header}>
        <div style={s.titleGroup}>
          <h2 style={s.title}>Manage Beds</h2>
          <p style={s.subTitle}>Add or remove beds from rooms.</p>
        </div>
        <button style={s.addBtn} onClick={() => setIsModalOpen(true)}>
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add New Bed
        </button>
      </div>

      {/* TABLE */}
      <div style={s.tableContainer}>
        <table style={s.table}>
          <thead style={s.thead}>
            <tr>
              <th style={s.th}>Bed Number</th>
              <th style={s.th}>Assigned Room</th>
              <th style={s.th}>Availability</th>
              <th style={{...s.th, textAlign:'right'}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {beds.length === 0 ? (
               <tr><td colSpan="4" style={{textAlign:'center', padding:'40px', color:'#9ca3af'}}>No beds found.</td></tr>
            ) : (
                beds.map(b => (
                <tr 
                    key={b.id} 
                    style={s.tr(b.id)}
                    onMouseEnter={() => setHoveredRow(b.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                >
                    {/* Bed Info */}
                    <td style={s.td}>
                        <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                            <div style={{width:'36px', height:'36px', borderRadius:'8px', background:'#e0f2fe', color:'#0284c7', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px'}}>
                                🛏️
                            </div>
                            <span style={{fontWeight:'700', color:'#111827', fontSize:'15px'}}>{b.bedNumber}</span>
                        </div>
                    </td>

                    {/* Room Info */}
                    <td style={s.td}>
                        <div style={{display:'flex', alignItems:'center', gap:'6px', color:'#4b5563', fontWeight:'500'}}>
                            <span>🚪</span>
                            {b.roomNumber || 'Unknown Room'}
                        </div>
                    </td>

                    {/* Status Badge */}
                    <td style={s.td}>
                        <span style={s.statusBadge(b.isBooked)}>
                            {b.isBooked ? (
                                <>🔴 Booked</>
                            ) : (
                                <>🟢 Available</>
                            )}
                        </span>
                    </td>

                    {/* Actions */}
                    <td style={s.td}>
                        <div style={{display:'flex', justifyContent:'flex-end'}}>
                            <button 
                                style={s.delBtn} 
                                onClick={() => handleDelete(b.id)}
                                title="Delete Bed"
                                onMouseEnter={(e) => e.currentTarget.style.background = '#fef2f2'}
                                onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
                            >
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
                <h3 style={{margin: 0, fontSize: '18px', fontWeight: '700', color: '#111827'}}>Add New Bed</h3>
                <p style={{margin: '5px 0 0', fontSize: '13px', color: '#6b7280'}}>Assign a new bed to a room.</p>
            </div>
            
            <form onSubmit={handleCreate}>
                <div style={s.modalBody}>
                    <label style={s.inputLabel}>Select Room</label>
                    <select 
                        style={s.select} 
                        value={formData.roomId} 
                        onChange={e => setFormData({...formData, roomId: e.target.value})} 
                        required
                    >
                        <option value="">-- Choose a Room --</option>
                        {rooms.map(r => (
                            <option key={r.id} value={r.id}>
                                {r.roomNumber} {r.floorNumber ? `(Floor ${r.floorNumber})` : ''}
                            </option>
                        ))}
                    </select>

                    <label style={s.inputLabel}>Bed Number / ID</label>
                    <input 
                        style={s.input} 
                        value={formData.bedNumber} 
                        onChange={e => setFormData({...formData, bedNumber: e.target.value})} 
                        placeholder="e.g. Bed-01, B-101-A" 
                        required 
                    />
                </div>

                <div style={s.modalFooter}>
                    <button type="button" onClick={() => setIsModalOpen(false)} style={{padding:'10px 18px', border:'1px solid #d1d5db', background:'white', borderRadius:'8px', cursor:'pointer', fontWeight:'600', color:'#374151'}}>Cancel</button>
                    <button type="submit" style={{padding:'10px 18px', border:'none', background:'#4f46e5', borderRadius:'8px', cursor:'pointer', fontWeight:'600', color:'white'}}>Save Bed</button>
                </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageBeds;