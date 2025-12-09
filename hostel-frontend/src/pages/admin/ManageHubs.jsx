import React, { useEffect, useState } from 'react';
import api from '../../api/axiosConfig';
import { toast } from 'react-toastify';
import { 
  Building2, 
  Layers, 
  DoorOpen, 
  Plus, 
  Trash2, 
  X, 
  Search, 
  LayoutGrid 
} from 'lucide-react';

const ManageHubs = () => {
  const [hubs, setHubs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hubName, setHubName] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [description, setDescription] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Check Role
  const user = JSON.parse(localStorage.getItem('user'));
  const isWarden = user?.role === 'WARDEN';

  useEffect(() => { fetchHubs(); }, []);

  const fetchHubs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/hubs');
      if (res.data.status === 'SUCCESS') setHubs(res.data.data);
    } catch (e) { 
      toast.error("Error loading hubs"); 
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if(!hubName.trim()) return toast.warning("Hub name is required");
    
    try {
      const formData = new FormData();
      formData.append('hubNumber', hubName);
      formData.append('description', description);
      if (imageFile) {
        formData.append('image', imageFile);
      }

      await api.post('/hubs', formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      toast.success("Hub Created Successfully!");
      setHubName('');
      setDescription('');
      setImageFile(null); 
      setIsModalOpen(false);
      fetchHubs();
    } catch (e) { 
      console.error(e);
      toast.error("Failed to create hub"); 
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Are you sure you want to delete this Hub?")) return;
    try { await api.delete(`/hubs/${id}`); toast.success("Hub Deleted"); fetchHubs(); } 
    catch (e) { toast.error("Failed to delete"); }
  };

  const filteredHubs = hubs.filter(hub => 
    hub.hubNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    totalHubs: hubs.length,
    totalFloors: hubs.reduce((acc, hub) => acc + (hub.noOfFloors || 0), 0),
    totalRooms: hubs.reduce((acc, hub) => acc + (hub.noOfRooms || 0), 0)
  };

  const s = {
    container: { fontFamily: "'Inter', sans-serif", color: '#1f2937', paddingBottom: '40px' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
    titleGroup: { display: 'flex', flexDirection: 'column' },
    title: { fontSize: '28px', fontWeight: '800', color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' },
    subTitle: { fontSize: '14px', color: '#6b7280', marginTop: '5px' },
    addBtn: { background: '#4f46e5', color: 'white', padding: '12px 24px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 10px rgba(79, 70, 229, 0.2)', transition: 'transform 0.2s', fontSize: '14px' },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' },
    statCard: { background: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '15px' },
    statIconBox: (bg, col) => ({ width: '50px', height: '50px', borderRadius: '12px', background: bg, color: col, display: 'flex', alignItems: 'center', justifyContent: 'center' }),
    statValue: { fontSize: '24px', fontWeight: '800', color: '#111827', lineHeight: '1' },
    statLabel: { fontSize: '13px', color: '#6b7280', fontWeight: '600', marginTop: '4px' },
    toolbar: { background: 'white', padding: '15px 20px', borderRadius: '16px', border: '1px solid #e5e7eb', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' },
    searchBox: { display: 'flex', alignItems: 'center', gap: '10px', background: '#f9fafb', padding: '10px 15px', borderRadius: '10px', border: '1px solid #e5e7eb', width: '300px' },
    searchInput: { border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '14px', color: '#374151' },
    tableContainer: { background: 'white', borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)', overflow: 'hidden' },
    table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
    thead: { backgroundColor: '#f8fafc', borderBottom: '1px solid #e5e7eb' },
    th: { padding: '16px 24px', fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em' },
    tr: { borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.2s' },
    td: { padding: '16px 24px', fontSize: '14px', color: '#334155', verticalAlign: 'middle' },
    badge: (type) => ({ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '9999px', fontSize: '12px', fontWeight: '600', backgroundColor: type === 'floors' ? '#eff6ff' : '#f0fdf4', color: type === 'floors' ? '#2563eb' : '#16a34a', border: `1px solid ${type === 'floors' ? '#bfdbfe' : '#bbf7d0'}` }),
    actionBtn: { background: 'white', border: '1px solid #e2e8f0', color: '#ef4444', padding: '8px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' },
    overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
    modal: { background: 'white', padding: '0', borderRadius: '24px', width: '450px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden', animation: 'fadeIn 0.2s ease-out' },
    modalHeader: { padding: '24px 32px', borderBottom: '1px solid #f1f5f9', background: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    modalTitle: { fontSize: '20px', fontWeight: '800', color: '#0f172a' },
    modalBody: { padding: '32px', background: '#f8fafc' },
    modalFooter: { padding: '20px 32px', background: 'white', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '12px' },
    inputLabel: { display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: '#475569' },
    input: { width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s, box-shadow 0.2s', backgroundColor: 'white', color: '#1e293b' },
    cancelBtn: { padding: '10px 20px', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', color: '#64748b', fontWeight: '600', cursor: 'pointer' },
    saveBtn: { padding: '10px 20px', borderRadius: '10px', border: 'none', background: '#4f46e5', color: 'white', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)' }
  };

  return (
    <div style={s.container}>
      <div style={s.header}>
        <div style={s.titleGroup}>
          <div style={s.title}>
            <div style={{background:'#e0e7ff', padding:'10px', borderRadius:'12px', color:'#4338ca'}}>
              <Building2 size={28}/>
            </div>
            Manage Hubs
          </div>
          <p style={s.subTitle}>Create and manage student accommodation hubs.</p>
        </div>
        
        {/* ADD BUTTON - Hidden for Warden */}
        {!isWarden && (
            <button 
                style={s.addBtn} 
                onClick={() => setIsModalOpen(true)}
                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
            <Plus size={18} /> Add New Hub
            </button>
        )}
      </div>

      <div style={s.statsGrid}>
        <div style={s.statCard}>
          <div style={s.statIconBox('#eff6ff', '#2563eb')}><Building2 size={24}/></div>
          <div><div style={s.statValue}>{stats.totalHubs}</div><div style={s.statLabel}>Total Hubs</div></div>
        </div>
        <div style={s.statCard}>
          <div style={s.statIconBox('#f0fdf4', '#16a34a')}><Layers size={24}/></div>
          <div><div style={s.statValue}>{stats.totalFloors}</div><div style={s.statLabel}>Total Floors</div></div>
        </div>
        <div style={s.statCard}>
          <div style={s.statIconBox('#fef2f2', '#dc2626')}><LayoutGrid size={24}/></div>
          <div><div style={s.statValue}>{stats.totalRooms}</div><div style={s.statLabel}>Total Rooms</div></div>
        </div>
      </div>

      <div style={s.toolbar}>
        <div style={s.searchBox}>
          <Search size={18} color="#9ca3af"/>
          <input style={s.searchInput} placeholder="Search hubs by name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
        </div>
      </div>

      <div style={s.tableContainer}>
        <table style={s.table}>
          <thead style={s.thead}>
            <tr>
              <th style={s.th}>Hub Name</th>
              <th style={s.th}>Floor Capacity</th>
              <th style={s.th}>Room Capacity</th>
              <th style={{...s.th, textAlign: 'right'}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
               <tr><td colSpan="4" style={{textAlign:'center', padding:'40px', color:'#9ca3af'}}>Loading data...</td></tr>
            ) : filteredHubs.length === 0 ? (
               <tr><td colSpan="4" style={{textAlign:'center', padding:'40px', color:'#9ca3af'}}>No hubs found.</td></tr>
            ) : (
                filteredHubs.map(hub => (
                <tr key={hub.id} style={s.tr} onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'} onMouseOut={(e) => e.currentTarget.style.background = 'white'}>
                    <td style={s.td}>
                        <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                            <div style={{width:'40px', height:'40px', borderRadius:'10px', background:'#f1f5f9', color:'#475569', display:'flex', alignItems:'center', justifyContent:'center'}}>
                                <Building2 size={20}/>
                            </div>
                            <div>
                                <div style={{fontWeight: '700', color: '#111827'}}>{hub.hubNumber}</div>
                                <div style={{fontSize: '12px', color: '#94a3b8'}}>ID: #{hub.id}</div>
                            </div>
                        </div>
                    </td>
                    <td style={s.td}><span style={s.badge('floors')}><Layers size={14}/> {hub.noOfFloors} Floors</span></td>
                    <td style={s.td}><span style={s.badge('rooms')}><DoorOpen size={14}/> {hub.noOfRooms} Rooms</span></td>
                    
                    <td style={s.td}>
                        {/* DELETE BUTTON - Hidden for Warden */}
                        {!isWarden && (
                            <div style={{display:'flex', justifyContent:'flex-end'}}>
                                <button 
                                    style={s.actionBtn} 
                                    onClick={() => handleDelete(hub.id)}
                                    title="Delete Hub"
                                    onMouseEnter={(e) => e.currentTarget.style.background = '#fee2e2'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                                >
                                    <Trash2 size={16}/>
                                </button>
                            </div>
                        )}
                    </td>
                </tr>
                ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div style={s.overlay} onClick={() => setIsModalOpen(false)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <div style={s.modalHeader}>
                <div><h3 style={s.modalTitle}>Add New Hub</h3><p style={{margin: '2px 0 0', fontSize: '13px', color: '#64748b'}}>Create a new building.</p></div>
                <button onClick={() => setIsModalOpen(false)} style={{background:'none', border:'none', cursor:'pointer', color:'#94a3b8'}}><X size={24}/></button>
            </div>
            <form onSubmit={handleCreate}>
                <div style={s.modalBody}>
                    <label style={s.inputLabel}>Hub Name / Number</label>
                    <input style={s.input} value={hubName} onChange={e => setHubName(e.target.value)} placeholder="e.g. HUB-A01" autoFocus/>
                    <div style={{marginBottom: '15px', marginTop: '15px'}}>
                        <label style={s.inputLabel}>Description</label>
                        <textarea style={{...s.input, minHeight: '80px', fontFamily: 'inherit'}} value={description} onChange={e => setDescription(e.target.value)} placeholder="Brief description..."/>
                    </div>
                    <div style={{marginTop: '15px'}}>
                        <label style={s.inputLabel}>Hub Image</label>
                        <input type="file" accept="image/*" style={{...s.input, padding: '10px'}} onChange={e => setImageFile(e.target.files[0])} />
                    </div>
                </div>
                <div style={s.modalFooter}>
                    <button type="button" onClick={() => setIsModalOpen(false)} style={s.cancelBtn}>Cancel</button>
                    <button type="submit" style={s.saveBtn}>Create Hub</button>
                </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageHubs;