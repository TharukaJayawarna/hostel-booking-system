import React, { useEffect, useState } from 'react';
import api from '../../api/axiosConfig';
import { toast } from 'react-toastify';

const ManageFloors = () => {
  const [floors, setFloors] = useState([]);
  const [hubs, setHubs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ hubNumber: '', floorNumber: '' });
  const [hoveredRow, setHoveredRow] = useState(null);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [f, h] = await Promise.all([api.get('/floors'), api.get('/hubs')]);
      if(f.data.status === 'SUCCESS') setFloors(f.data.data);
      if(h.data.status === 'SUCCESS') setHubs(h.data.data);
    } catch (error) {
      toast.error("Failed to load data");
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.hubId || !formData.floorNumber) {
        toast.warning("Please fill all fields");
        return;
    }
    try {
      await api.post(`/hubs/${formData.hubId}/floors`, { floorNumber: formData.floorNumber });
      toast.success("Floor Created Successfully!");
      setIsModalOpen(false);
      setFormData({ hubId: '', floorNumber: '' });
      fetchAll();
    } catch (e) { toast.error("Failed to create floor"); }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Are you sure you want to delete this Floor?")) return;
    try { await api.delete(`/floors/${id}`); toast.success("Floor Deleted"); fetchAll(); } 
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

    // Badges
    badge: (type) => ({
      display: 'inline-flex', alignItems: 'center', gap: '6px',
      padding: '4px 12px', borderRadius: '9999px', fontSize: '12px', fontWeight: '600',
      backgroundColor: type === 'hub' ? '#f3f4f6' : '#fff7ed',
      color: type === 'hub' ? '#374151' : '#c2410c',
      border: `1px solid ${type === 'hub' ? '#e5e7eb' : '#fed7aa'}`
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
      background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)',
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
          <h2 style={s.title}>Manage Floors</h2>
          <p style={s.subTitle}>Organize floors within your hubs.</p>
        </div>
        <button style={s.addBtn} onClick={() => setIsModalOpen(true)}>
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add New Floor
        </button>
      </div>

      {/* TABLE */}
      <div style={s.tableContainer}>
        <table style={s.table}>
          <thead style={s.thead}>
            <tr>
              <th style={s.th}>Floor Name</th>
              <th style={s.th}>Belongs To (Hub)</th>
              <th style={s.th}>Rooms Count</th>
              <th style={{...s.th, textAlign:'right'}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {floors.length === 0 ? (
               <tr><td colSpan="4" style={{textAlign:'center', padding:'40px', color:'#9ca3af'}}>No floors found.</td></tr>
            ) : (
                floors.map(f => (
                <tr 
                    key={f.id} 
                    style={s.tr(f.id)}
                    onMouseEnter={() => setHoveredRow(f.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                >
                    {/* Floor Name */}
                    <td style={s.td}>
                        <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                            <div style={{width:'36px', height:'36px', borderRadius:'8px', background:'#f0fdf4', color:'#16a34a', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px'}}>
                                📶 
                            </div>
                            <span style={{fontWeight:'700', color:'#111827'}}>{f.floorNumber}</span>
                        </div>
                    </td>

                    {/* Hub Badge */}
                    <td style={s.td}>
                        <span style={s.badge('hub')}>
                          🏢 {f.hubNumber || 'Unknown Hub'}
                        </span>
                    </td>

                    {/* Rooms Badge */}
                    <td style={s.td}>
                        <span style={s.badge('room')}>
                           🚪 {f.noOfRooms} Rooms
                        </span>
                    </td>

                    {/* Actions */}
                    <td style={s.td}>
                        <div style={{display:'flex', justifyContent:'flex-end'}}>
                            <button 
                                style={s.delBtn} 
                                onClick={() => handleDelete(f.id)}
                                title="Delete Floor"
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
                <h3 style={{margin: 0, fontSize: '18px', fontWeight: '700', color: '#111827'}}>Add New Floor</h3>
                <p style={{margin: '5px 0 0', fontSize: '13px', color: '#6b7280'}}>Assign a new floor to a hub.</p>
            </div>
            
            <form onSubmit={handleCreate}>
                <div style={s.modalBody}>
                    <label style={s.inputLabel}>Select Hub</label>
                    <select 
                        style={s.select} 
                        value={formData.hubId} 
                        onChange={e => setFormData({...formData, hubId: e.target.value})} 
                        required
                    >
                        <option value="">-- Choose a Hub --</option>
                        {hubs.map(h => (
                            <option key={h.id} value={h.id}>{h.hubNumber}</option>
                        ))}
                    </select>

                    <label style={s.inputLabel}>Floor Number</label>
                    <input 
                        style={s.input} 
                        value={formData.floorNumber} 
                        onChange={e => setFormData({...formData, floorNumber: e.target.value})} 
                        placeholder="e.g. 1st Floor, Floor 02" 
                        required 
                    />
                </div>

                <div style={s.modalFooter}>
                    <button type="button" onClick={() => setIsModalOpen(false)} style={{padding:'10px 18px', border:'1px solid #d1d5db', background:'white', borderRadius:'8px', cursor:'pointer', fontWeight:'600', color:'#374151'}}>Cancel</button>
                    <button type="submit" style={{padding:'10px 18px', border:'none', background:'#4f46e5', borderRadius:'8px', cursor:'pointer', fontWeight:'600', color:'white'}}>Create Floor</button>
                </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageFloors;