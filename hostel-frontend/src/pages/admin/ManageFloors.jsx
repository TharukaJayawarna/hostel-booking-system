import React, { useEffect, useState } from 'react';
import api from '../../api/axiosConfig';
import { toast } from 'react-toastify';
import { Layers, Building2, DoorOpen, Plus, Trash2, X, Search, LayoutGrid, Filter } from 'lucide-react';

const ManageFloors = () => {
  const [floors, setFloors] = useState([]);
  const [hubs, setHubs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ hubId: '', floorNumber: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterHub, setFilterHub] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Check Role
  const user = JSON.parse(localStorage.getItem('user'));
  const isWarden = user?.role === 'WARDEN';

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [f, h] = await Promise.all([api.get('/floors'), api.get('/hubs')]);
      if(f.data.status === 'SUCCESS') setFloors(f.data.data);
      if(h.data.status === 'SUCCESS') setHubs(h.data.data);
    } catch (error) { toast.error("Failed to load data"); } 
    finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.hubId || !formData.floorNumber) return toast.warning("Please fill all fields");
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

  const filteredFloors = floors.filter(floor => {
    const matchesSearch = floor.floorNumber.toLowerCase().includes(searchTerm.toLowerCase()) || (floor.hubNumber && floor.hubNumber.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesHub = filterHub === 'ALL' || floor.hubNumber === filterHub;
    return matchesSearch && matchesHub;
  });

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
    toolbar: { background: 'white', padding: '15px 20px', borderRadius: '16px', border: '1px solid #e5e7eb', marginBottom: '20px', display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' },
    searchBox: { display: 'flex', alignItems: 'center', gap: '10px', background: '#f9fafb', padding: '10px 15px', borderRadius: '10px', border: '1px solid #e5e7eb', flex: 1, minWidth: '250px' },
    searchInput: { border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '14px', color: '#374151' },
    filterSelect: { padding: '10px 15px', borderRadius: '10px', border: '1px solid #e5e7eb', background: 'white', fontSize: '14px', color: '#374151', cursor: 'pointer', outline: 'none', minWidth: '180px' },
    tableContainer: { background: 'white', borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)', overflow: 'hidden' },
    table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
    thead: { backgroundColor: '#f8fafc', borderBottom: '1px solid #e5e7eb' },
    th: { padding: '16px 24px', fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em' },
    tr: { borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.2s' },
    td: { padding: '16px 24px', fontSize: '14px', color: '#334155', verticalAlign: 'middle' },
    badge: (type) => ({ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '9999px', fontSize: '12px', fontWeight: '600', backgroundColor: type === 'hub' ? '#eff6ff' : '#f0fdf4', color: type === 'hub' ? '#2563eb' : '#16a34a', border: `1px solid ${type === 'hub' ? '#bfdbfe' : '#bbf7d0'}` }),
    actionBtn: { background: 'white', border: '1px solid #e2e8f0', color: '#ef4444', padding: '8px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' },
    overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
    modal: { background: 'white', padding: '0', borderRadius: '24px', width: '450px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden', animation: 'fadeIn 0.2s ease-out' },
    modalHeader: { padding: '24px 32px', borderBottom: '1px solid #f1f5f9', background: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    modalTitle: { fontSize: '20px', fontWeight: '800', color: '#0f172a' },
    modalBody: { padding: '32px', background: '#f8fafc' },
    modalFooter: { padding: '20px 32px', background: 'white', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '12px' },
    inputLabel: { display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: '#475569' },
    input: { width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none', boxSizing: 'border-box', backgroundColor: 'white', color: '#1e293b' },
    select: { width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none', boxSizing: 'border-box', backgroundColor: 'white', cursor: 'pointer' },
    cancelBtn: { padding: '10px 20px', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', color: '#64748b', fontWeight: '600', cursor: 'pointer' },
    saveBtn: { padding: '10px 20px', borderRadius: '10px', border: 'none', background: '#4f46e5', color: 'white', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)' }
  };

  return (
    <div style={s.container}>
      <div style={s.header}>
        <div style={s.titleGroup}>
          <div style={s.title}>
            <div style={{background:'#e0e7ff', padding:'10px', borderRadius:'12px', color:'#4338ca'}}><Layers size={28}/></div>
            Manage Floors
          </div>
          <p style={s.subTitle}>Organize and manage floors.</p>
        </div>
        {!isWarden && (
            <button style={s.addBtn} onClick={() => setIsModalOpen(true)}>
                <Plus size={18} /> Add New Floor
            </button>
        )}
      </div>

      <div style={s.statsGrid}>
        <div style={s.statCard}>
          <div style={s.statIconBox('#eff6ff', '#2563eb')}><Layers size={24}/></div>
          <div><div style={s.statValue}>{floors.length}</div><div style={s.statLabel}>Total Floors</div></div>
        </div>
        <div style={s.statCard}>
          <div style={s.statIconBox('#f0fdf4', '#16a34a')}><Building2 size={24}/></div>
          <div><div style={s.statValue}>{hubs.length}</div><div style={s.statLabel}>Active Hubs</div></div>
        </div>
        <div style={s.statCard}>
          <div style={s.statIconBox('#fef2f2', '#dc2626')}><LayoutGrid size={24}/></div>
          <div>
            <div style={s.statValue}>{floors.reduce((sum, f) => sum + (f.noOfRooms || 0), 0)}</div>
            <div style={s.statLabel}>Total Rooms</div>
          </div>
        </div>
      </div>

      <div style={s.toolbar}>
        <div style={s.searchBox}>
          <Search size={18} color="#9ca3af"/>
          <input style={s.searchInput} placeholder="Search floors..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
            <Filter size={18} color="#6b7280"/>
            <select style={s.filterSelect} value={filterHub} onChange={(e) => setFilterHub(e.target.value)}>
                <option value="ALL">All Hubs</option>
                {hubs.map(h => <option key={h.id} value={h.hubNumber}>{h.hubNumber}</option>)}
            </select>
        </div>
      </div>

      <div style={s.tableContainer}>
        <table style={s.table}>
          <thead style={s.thead}>
            <tr>
              <th style={s.th}>Floor Details</th>
              <th style={s.th}>Parent Hub</th>
              <th style={s.th}>Capacity</th>
              <th style={{...s.th, textAlign:'right'}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
                <tr><td colSpan="4" style={{textAlign:'center', padding:'40px', color:'#9ca3af'}}>Loading data...</td></tr>
            ) : filteredFloors.length === 0 ? (
               <tr><td colSpan="4" style={{textAlign:'center', padding:'40px', color:'#9ca3af'}}>No floors found.</td></tr>
            ) : (
                filteredFloors.map(f => (
                <tr key={f.id} style={s.tr} onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'} onMouseOut={(e) => e.currentTarget.style.background = 'white'}>
                    <td style={s.td}>
                        <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                            <div style={{width:'40px', height:'40px', borderRadius:'10px', background:'#f1f5f9', color:'#475569', display:'flex', alignItems:'center', justifyContent:'center'}}><Layers size={20}/></div>
                            <div><div style={{fontWeight:'700', color:'#1e293b'}}>{f.floorNumber}</div><div style={{fontSize:'12px', color:'#94a3b8'}}>ID: #{f.id}</div></div>
                        </div>
                    </td>
                    <td style={s.td}><span style={s.badge('hub')}><Building2 size={12}/> {f.hubNumber || 'Unassigned'}</span></td>
                    <td style={s.td}><span style={s.badge('room')}><DoorOpen size={12}/> {f.noOfRooms} Rooms</span></td>
                    <td style={s.td}>
                        {!isWarden && (
                            <div style={{display:'flex', justifyContent:'flex-end'}}>
                                <button style={s.actionBtn} onClick={() => handleDelete(f.id)}><Trash2 size={16}/></button>
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
                <div><h3 style={s.modalTitle}>Add New Floor</h3><p style={{margin: '2px 0 0', fontSize: '13px', color: '#64748b'}}>Select a hub and assign a floor number.</p></div>
                <button onClick={() => setIsModalOpen(false)} style={{background:'none', border:'none', cursor:'pointer', color:'#94a3b8'}}><X size={24}/></button>
            </div>
            <form onSubmit={handleCreate}>
                <div style={s.modalBody}>
                    <div style={s.inputGroup}>
                        <label style={s.inputLabel}>Select Hub</label>
                        <select style={s.select} value={formData.hubId} onChange={e => setFormData({...formData, hubId: e.target.value})} required>
                            <option value="">-- Choose a Hub --</option>
                            {hubs.map(h => <option key={h.id} value={h.id}>{h.hubNumber}</option>)}
                        </select>
                    </div>
                    <div style={s.inputGroup}>
                        <label style={s.inputLabel}>Floor Name / Number</label>
                        <input style={s.input} value={formData.floorNumber} onChange={e => setFormData({...formData, floorNumber: e.target.value})} placeholder="e.g. 1st Floor" required />
                    </div>
                </div>
                <div style={s.modalFooter}>
                    <button type="button" onClick={() => setIsModalOpen(false)} style={s.cancelBtn}>Cancel</button>
                    <button type="submit" style={s.saveBtn}>Create Floor</button>
                </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageFloors;