import React, { useEffect, useState } from 'react';
import api from '../../api/axiosConfig';
import { toast } from 'react-toastify';
import { 
  BedDouble, 
  Wrench, 
  Trash2, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle 
} from 'lucide-react';

const ManageBeds = () => {
  const [beds, setBeds] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRoom, setFilterRoom] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ roomId: '', bedNumber: '' });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [b, r] = await Promise.all([api.get('/beds'), api.get('/rooms')]);
      if(b.data.status === 'SUCCESS') setBeds(b.data.data);
      if(r.data.status === 'SUCCESS') setRooms(r.data.data);
    } catch (e) { 
      toast.error("Failed to load data"); 
    } finally {
      setLoading(false);
    }
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

  const toggleMaintenance = async (bed) => {
    // 1. කලින් තිබුණු අගය (Previous Status)
    const previousStatus = bed.underMaintenance;
    // 2. අලුත් අගය (New Status)
    const newStatus = !previousStatus;

    try {
        // Optimistic Update: API එකට කලින් UI එක වෙනස් කරනවා (User ට වේගවත් බවක් දැනෙන්න)
        const updatedBeds = beds.map(b => 
            b.id === bed.id ? { ...b, underMaintenance: newStatus } : b
        );
        setBeds(updatedBeds);

        // API Call එක යවනවා
        await api.patch(`/beds/${bed.id}/maintenance?status=${newStatus}`);
        toast.success(`Maintenance Mode: ${newStatus ? 'ON' : 'OFF'}`);
        
        // සාමාන්‍යයෙන් fetchAll() අවශ්‍ය නෑ optimistic update එක නිසා. 
        // නමුත් ෂුවර් කරගන්න ඕන නම් විතරක් තියන්න.
        // fetchAll(); 

    } catch (e) {
        // Error එකක් ආවොත් පරණ තත්ත්වයටම පත් කරනවා (Rollback)
        const revertedBeds = beds.map(b => 
            b.id === bed.id ? { ...b, underMaintenance: previousStatus } : b
        );
        setBeds(revertedBeds);
        toast.error("Failed to update status");
    }
  };

  // --- FILTER LOGIC (FIXED) ---
  const filteredBeds = beds.filter(bed => {
    // Fix: bedNumber null නම් හිස් string එකක් ගන්න
    const bedNo = bed.bedNumber ? bed.bedNumber.toString() : "";
    const matchesSearch = bedNo.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRoom = filterRoom === 'ALL' || bed.roomNumber === filterRoom;
    
    let matchesStatus = true;
    if (filterStatus === 'BOOKED') matchesStatus = bed.isBooked;
    if (filterStatus === 'AVAILABLE') matchesStatus = !bed.isBooked && !bed.underMaintenance;
    if (filterStatus === 'MAINTENANCE') matchesStatus = bed.underMaintenance;

    return matchesSearch && matchesRoom && matchesStatus;
  });

  // --- STATS CALCULATION ---
  const stats = {
    total: beds.length,
    available: beds.filter(b => !b.isBooked && !b.underMaintenance).length,
    booked: beds.filter(b => b.isBooked).length,
    maintenance: beds.filter(b => b.underMaintenance).length
  };

  // --- STYLES ---
  const s = {
    container: { fontFamily: "'Inter', sans-serif", color: '#1f2937', paddingBottom: '40px' },
    
    // Header
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' },
    title: { fontSize: '26px', fontWeight: '800', color: '#111827', display: 'flex', alignItems: 'center', gap: '10px' },
    
    // Stats Cards
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' },
    statCard: () => ({
      background: 'white', padding: '20px', borderRadius: '16px',
      border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
      display: 'flex', alignItems: 'center', gap: '15px', position: 'relative', overflow: 'hidden'
    }),
    statIconBox: (bg, col) => ({
      width: '50px', height: '50px', borderRadius: '12px', background: bg, color: col,
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }),
    statValue: { fontSize: '24px', fontWeight: '800', color: '#111827', lineHeight: '1' },
    statLabel: { fontSize: '13px', color: '#6b7280', fontWeight: '600', marginTop: '4px' },

    // Toolbar (Search & Filter)
    toolbar: { 
      background: 'white', padding: '15px 20px', borderRadius: '16px', 
      border: '1px solid #e5e7eb', marginBottom: '20px',
      display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center',
      boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
    },
    searchBox: {
      display: 'flex', alignItems: 'center', gap: '10px', background: '#f9fafb',
      padding: '8px 15px', borderRadius: '10px', border: '1px solid #e5e7eb', flex: 1
    },
    input: { border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '14px' },
    select: {
      padding: '8px 12px', borderRadius: '10px', border: '1px solid #e5e7eb',
      background: 'white', fontSize: '14px', color: '#374151', cursor: 'pointer', outline: 'none'
    },
    addBtn: { 
      background: '#4f46e5', color: 'white', padding: '10px 20px', 
      borderRadius: '10px', border: 'none', cursor: 'pointer', 
      fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px',
      boxShadow: '0 4px 10px rgba(79, 70, 229, 0.2)', transition: '0.2s'
    },

    // Table
    tableContainer: { 
      background: 'white', borderRadius: '16px', border: '1px solid #e5e7eb', 
      overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' 
    },
    table: { width: '100%', borderCollapse: 'collapse' },
    thead: { background: '#f8fafc', borderBottom: '1px solid #e5e7eb' },
    th: { padding: '15px 20px', fontSize: '12px', fontWeight: '700', color: '#64748b', textAlign: 'left', textTransform: 'uppercase' },
    tr: { borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' },
    td: { padding: '15px 20px', fontSize: '14px', color: '#334155' },

    // Toggle Switch
    toggleContainer: (isActive) => ({
      width: '44px', height: '24px', 
      background: isActive ? '#f59e0b' : '#e2e8f0', 
      borderRadius: '99px', position: 'relative', cursor: 'pointer',
      transition: 'background 0.3s ease', display: 'flex', alignItems: 'center',
      border: isActive ? '1px solid #d97706' : '1px solid #cbd5e1'
    }),
    toggleCircle: (isActive) => ({
      width: '18px', height: '18px', background: 'white', borderRadius: '50%',
      position: 'absolute', left: isActive ? '22px' : '3px',
      transition: 'left 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
      boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
    }),

    // Status Badges
    badge: (type) => {
      let bg='#f1f5f9', col='#475569', border='#e2e8f0', icon=<CheckCircle2 size={12}/>;
      if(type === 'BOOKED') { bg='#fee2e2'; col='#ef4444'; border='#fecaca'; icon=<XCircle size={12}/>; }
      if(type === 'MAINTENANCE') { bg='#fef3c7'; col='#d97706'; border='#fde68a'; icon=<Wrench size={12}/>; }
      if(type === 'AVAILABLE') { bg='#dcfce7'; col='#16a34a'; border='#bbf7d0'; icon=<CheckCircle2 size={12}/>; }
      return {
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700',
        background: bg, color: col, border: `1px solid ${border}`
      };
    },

    // Modal
    overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 },
    modal: { background: 'white', padding: '30px', borderRadius: '20px', width: '400px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }
  };

  return (
    <div style={s.container}>
      
      {/* 1. Header */}
      <div style={s.header}>
        <div style={s.title}>
          <div style={{background:'#e0e7ff', padding:'8px', borderRadius:'10px', color:'#4338ca'}}><BedDouble size={28}/></div>
          <div>Manage Beds <div style={{fontSize:'14px', color:'#6b7280', fontWeight:'500'}}>Inventory & Maintenance</div></div>
        </div>
        {/* Manual Add Button (Optional if using auto-generation) */}
        <button style={s.addBtn} onClick={() => setIsModalOpen(true)}>
          <Plus size={18} /> Add Bed
        </button>
      </div>

      {/* 2. Stats Cards */}
      <div style={s.statsGrid}>
        <div style={s.statCard()}>
          <div style={s.statIconBox('#eff6ff', '#2563eb')}><BedDouble size={24}/></div>
          <div><div style={s.statValue}>{stats.total}</div><div style={s.statLabel}>Total Beds</div></div>
        </div>
        <div style={s.statCard()}>
          <div style={s.statIconBox('#f0fdf4', '#16a34a')}><CheckCircle2 size={24}/></div>
          <div><div style={s.statValue}>{stats.available}</div><div style={s.statLabel}>Available</div></div>
        </div>
        <div style={s.statCard()}>
          <div style={s.statIconBox('#fef2f2', '#dc2626')}><XCircle size={24}/></div>
          <div><div style={s.statValue}>{stats.booked}</div><div style={s.statLabel}>Occupied</div></div>
        </div>
        <div style={s.statCard()}>
          <div style={s.statIconBox('#fffbeb', '#d97706')}><Wrench size={24}/></div>
          <div><div style={s.statValue}>{stats.maintenance}</div><div style={s.statLabel}>Maintenance</div></div>
        </div>
      </div>

      {/* 3. Toolbar */}
      <div style={s.toolbar}>
        <div style={s.searchBox}>
          <Search size={18} color="#9ca3af"/>
          <input 
            style={s.input} 
            placeholder="Search by Bed Number..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
          <Filter size={18} color="#6b7280"/>
          <select style={s.select} value={filterRoom} onChange={e => setFilterRoom(e.target.value)}>
            <option value="ALL">All Rooms</option>
            {[...new Set(beds.map(b => b.roomNumber))].map(r => (
                <option key={r} value={r}>{r}</option>
            ))}
          </select>

          <select style={s.select} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="ALL">All Status</option>
            <option value="AVAILABLE">Available</option>
            <option value="BOOKED">Booked</option>
            <option value="MAINTENANCE">Maintenance</option>
          </select>
        </div>
      </div>

      {/* 4. Table */}
      <div style={s.tableContainer}>
        <table style={s.table}>
          <thead style={s.thead}>
            <tr>
              <th style={s.th}>Bed Info</th>
              <th style={s.th}>Room</th>
              <th style={s.th}>Current Status</th>
              <th style={s.th}>Maintenance Mode</th>
              <th style={{...s.th, textAlign:'right'}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? 
              <tr><td colSpan="5" style={{padding:'40px', textAlign:'center', color:'#94a3b8'}}>Loading...</td></tr> 
            : filteredBeds.length === 0 ?
              <tr><td colSpan="5" style={{padding:'40px', textAlign:'center', color:'#94a3b8'}}>No beds found matching filters.</td></tr>
            : filteredBeds.map(bed => {
                // Determine display status
                let statusType = 'AVAILABLE';
                let statusText = 'Available';
                if (bed.underMaintenance) { statusType = 'MAINTENANCE'; statusText = 'Maintenance'; }
                else if (bed.isBooked) { statusType = 'BOOKED'; statusText = 'Booked'; }

                return (
                  <tr key={bed.id} style={s.tr} onMouseOver={e => e.currentTarget.style.background='#f8fafc'} onMouseOut={e => e.currentTarget.style.background='white'}>
                    
                    <td style={s.td}>
                      <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                        <div style={{padding:'8px', background:'#f1f5f9', borderRadius:'8px', color:'#475569'}}><BedDouble size={18}/></div>
                        <span style={{fontWeight:'700', color:'#1e293b'}}>{bed.bedNumber}</span>
                      </div>
                    </td>

                    <td style={s.td}><span style={{fontWeight:'600', color:'#475569'}}>{bed.roomNumber}</span></td>

                    <td style={s.td}>
                      <span style={s.badge(statusType)}>
                        {statusType === 'MAINTENANCE' && <Wrench size={12}/>}
                        {statusType === 'BOOKED' && <XCircle size={12}/>}
                        {statusType === 'AVAILABLE' && <CheckCircle2 size={12}/>}
                        {statusText}
                      </span>
                    </td>

                    {/* Maintenance Toggle Column */}
                    <td style={s.td}>
                      <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                        <div 
                            style={s.toggleContainer(bed.underMaintenance)} 
                            onClick={() => toggleMaintenance(bed)}
                            title="Toggle Maintenance Mode"
                        >
                            <div style={s.toggleCircle(bed.underMaintenance)}></div>
                        </div>
                        <span style={{fontSize:'12px', fontWeight:'600', color: bed.underMaintenance ? '#d97706' : '#94a3b8'}}>
                            {bed.underMaintenance ? 'Active' : 'Off'}
                        </span>
                      </div>
                    </td>

                    <td style={s.td}>
                      <div style={{display:'flex', justifyContent:'flex-end'}}>
                        <button 
                            onClick={() => handleDelete(bed.id)}
                            style={{padding:'8px', borderRadius:'8px', border:'1px solid #fee2e2', background:'white', color:'#ef4444', cursor:'pointer'}}
                            title="Delete Bed"
                        >
                            <Trash2 size={16}/>
                        </button>
                      </div>
                    </td>

                  </tr>
                );
            })}
          </tbody>
        </table>
      </div>

      {/* Add Bed Modal */}
      {isModalOpen && (
        <div style={s.overlay} onClick={() => setIsModalOpen(false)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <h3 style={{fontSize:'20px', fontWeight:'700', marginBottom:'5px', color:'#111827'}}>Add New Bed</h3>
            <p style={{fontSize:'13px', color:'#6b7280', marginBottom:'20px'}}>Manually add a bed to a room.</p>
            
            <form onSubmit={handleCreate}>
                <div style={{marginBottom:'15px'}}>
                    <label style={{display:'block', fontSize:'13px', fontWeight:'600', color:'#374151', marginBottom:'5px'}}>Select Room</label>
                    <select 
                        style={{...s.select, width:'100%'}} 
                        value={formData.roomId} 
                        onChange={e => setFormData({...formData, roomId: e.target.value})}
                        required
                    >
                        <option value="">-- Select --</option>
                        {rooms.map(r => <option key={r.id} value={r.id}>{r.roomNumber}</option>)}
                    </select>
                </div>
                <div style={{marginBottom:'25px'}}>
                    <label style={{display:'block', fontSize:'13px', fontWeight:'600', color:'#374151', marginBottom:'5px'}}>Bed Number</label>
                    <input 
                        style={{...s.input, border:'1px solid #e5e7eb', padding:'10px', borderRadius:'10px', background:'white'}} 
                        placeholder="e.g. B-101-1" 
                        value={formData.bedNumber}
                        onChange={e => setFormData({...formData, bedNumber: e.target.value})}
                        required
                    />
                </div>
                <div style={{display:'flex', justifyContent:'flex-end', gap:'10px'}}>
                    <button type="button" onClick={() => setIsModalOpen(false)} style={{padding:'10px 20px', borderRadius:'10px', border:'1px solid #e5e7eb', background:'white', fontWeight:'600', color:'#374151', cursor:'pointer'}}>Cancel</button>
                    <button type="submit" style={s.addBtn}>Save Bed</button>
                </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ManageBeds;