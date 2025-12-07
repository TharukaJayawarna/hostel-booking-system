import React, { useEffect, useState } from 'react';
import api from '../../api/axiosConfig';
import { toast } from 'react-toastify';

const ManageHubs = () => {
  const [hubs, setHubs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hubName, setHubName] = useState('');
  const [hoveredRow, setHoveredRow] = useState(null); 

  useEffect(() => { fetchHubs(); }, []);

  const fetchHubs = async () => {
    try {
      const res = await api.get('/hubs');
      if (res.data.status === 'SUCCESS') setHubs(res.data.data);
    } catch (e) { toast.error("Error loading hubs"); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if(!hubName.trim()) return toast.warning("Hub name is required");
    
    try {
      await api.post('/hubs', { hubNumber: hubName });
      toast.success("Hub Created Successfully!");
      setHubName('');
      setIsModalOpen(false);
      fetchHubs();
    } catch (e) { toast.error("Failed to create hub"); }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Are you sure you want to delete this Hub?")) return;
    try { await api.delete(`/hubs/${id}`); toast.success("Hub Deleted"); fetchHubs(); } catch (e) { toast.error("Failed to delete"); }
  };

  // --- STYLES ---
  const s = {
    container: { fontFamily: "'Inter', sans-serif", color: '#111827', paddingBottom: '40px' },
    
    // Header Section
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

    // Table Section
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

    // Badges for Floors/Rooms
    statBadge: (color) => ({
      display: 'inline-flex', alignItems: 'center', gap: '6px',
      padding: '4px 12px', borderRadius: '9999px', fontSize: '12px', fontWeight: '600',
      backgroundColor: color === 'blue' ? '#eff6ff' : '#f5f3ff',
      color: color === 'blue' ? '#2563eb' : '#7c3aed',
      border: `1px solid ${color === 'blue' ? '#bfdbfe' : '#ddd6fe'}`
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
      width: '400px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      overflow: 'hidden'
    },
    modalHeader: { padding: '20px 24px', borderBottom: '1px solid #f3f4f6', background: '#fff' },
    modalBody: { padding: '24px' },
    modalFooter: { padding: '16px 24px', background: '#f9fafb', borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'flex-end', gap: '12px' },
    
    inputLabel: { display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: '#374151' },
    input: { 
      width: '100%', padding: '10px 12px', borderRadius: '8px', 
      border: '1px solid #d1d5db', fontSize: '14px', outline: 'none',
      transition: 'border-color 0.15s', boxSizing: 'border-box'
    }
  };

  return (
    <div style={s.container}>
      {/* HEADER */}
      <div style={s.header}>
        <div style={s.titleGroup}>
          <h2 style={s.title}>Manage Hubs</h2>
          <p style={s.subTitle}>Create and manage accommodation hubs.</p>
        </div>
        <button style={s.addBtn} onClick={() => setIsModalOpen(true)}>
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add New Hub
        </button>
      </div>

      {/* TABLE */}
      <div style={s.tableContainer}>
        <table style={s.table}>
          <thead style={s.thead}>
            <tr>
              <th style={s.th}>Hub Name</th>
              <th style={s.th}>Details</th>
              <th style={s.th}>Total Capacity</th>
              <th style={{...s.th, textAlign: 'right'}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {hubs.length === 0 ? (
               <tr><td colSpan="4" style={{textAlign:'center', padding:'40px', color:'#9ca3af'}}>No hubs found. Add one to get started.</td></tr>
            ) : (
                hubs.map(hub => (
                <tr 
                    key={hub.id} 
                    style={s.tr(hub.id)}
                    onMouseEnter={() => setHoveredRow(hub.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                >
                    {/* Hub Name Column */}
                    <td style={s.td}>
                        <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                            <div style={{width:'40px', height:'40px', borderRadius:'10px', background:'#e0e7ff', color:'#4338ca', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px'}}>
                                🏢
                            </div>
                            <div>
                                <div style={{fontWeight: '700', color: '#111827'}}>{hub.hubNumber}</div>
                                <div style={{fontSize: '12px', color: '#6b7280'}}>ID: #{hub.id}</div>
                            </div>
                        </div>
                    </td>

                    {/* Floors / Rooms Column */}
                    <td style={s.td}>
                        <div style={{display: 'flex', gap: '8px'}}>
                            <span style={s.statBadge('blue')}>
                                📶 {hub.noOfFloors} Floors
                            </span>
                            <span style={s.statBadge('purple')}>
                                🚪 {hub.noOfRooms} Rooms
                            </span>
                        </div>
                    </td>

                    {/* Capacity Column (Placeholder logic - assuming 2 beds per room roughly or just hiding if not needed) */}
                    <td style={s.td}>
                         <span style={{color: '#6b7280', fontSize: '13px'}}>
                            ~ {hub.noOfRooms * 2} Beds (Est.)
                         </span>
                    </td>

                    {/* Actions Column */}
                    <td style={s.td}>
                        <div style={{display:'flex', justifyContent:'flex-end'}}>
                            <button 
                                style={s.delBtn} 
                                onClick={() => handleDelete(hub.id)}
                                title="Delete Hub"
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
            {/* Modal Header */}
            <div style={s.modalHeader}>
                <h3 style={{margin: 0, fontSize: '18px', fontWeight: '700', color: '#111827'}}>Add New Hub</h3>
                <p style={{margin: '5px 0 0', fontSize: '13px', color: '#6b7280'}}>Enter the details to create a new hub.</p>
            </div>
            
            <form onSubmit={handleCreate}>
                {/* Modal Body */}
                <div style={s.modalBody}>
                    <label style={s.inputLabel}>Hub Name / Number</label>
                    <input 
                        style={s.input} 
                        value={hubName} 
                        onChange={e => setHubName(e.target.value)} 
                        placeholder="e.g. HUB-A01" 
                        autoFocus
                        onFocus={(e) => e.target.style.borderColor = '#4f46e5'}
                        onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    />
                    <p style={{fontSize:'12px', color:'#9ca3af', marginTop:'8px'}}>
                        * Floors and rooms can be added inside the hub later.
                    </p>
                </div>

                {/* Modal Footer */}
                <div style={s.modalFooter}>
                    <button 
                        type="button" 
                        onClick={() => setIsModalOpen(false)} 
                        style={{padding:'10px 18px', border:'1px solid #d1d5db', background:'white', borderRadius:'8px', cursor:'pointer', fontWeight:'600', color:'#374151'}}
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit" 
                        style={{padding:'10px 18px', border:'none', background:'#4f46e5', borderRadius:'8px', cursor:'pointer', fontWeight:'600', color:'white'}}
                    >
                        Create Hub
                    </button>
                </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageHubs;