import React, { useEffect, useState } from 'react';
import api from '../../api/axiosConfig';
import { toast } from 'react-toastify';
import { 
  Layers, 
  Building2, 
  DoorOpen, 
  Plus, 
  Trash2, 
  X, 
  Search,
  LayoutGrid,
  Filter
} from 'lucide-react';

const ManageFloors = () => {
  const [floors, setFloors] = useState([]);
  const [hubs, setHubs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ hubId: '', floorNumber: '' });
  
  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterHub, setFilterHub] = useState('ALL'); // Hub Filter එක
  
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [f, h] = await Promise.all([api.get('/floors'), api.get('/hubs')]);
      if(f.data.status === 'SUCCESS') setFloors(f.data.data);
      if(h.data.status === 'SUCCESS') setHubs(h.data.data);
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
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

  // --- FILTERING LOGIC ---
  const filteredFloors = floors.filter(floor => {
    const matchesSearch = floor.floorNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (floor.hubNumber && floor.hubNumber.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Hub එක අනුව Filter කිරීම
    const matchesHub = filterHub === 'ALL' || floor.hubNumber === filterHub;

    return matchesSearch && matchesHub;
  });

  // --- STYLES ---
  const s = {
    container: { fontFamily: "'Inter', sans-serif", color: '#1f2937', paddingBottom: '40px' },

    // Header (Title + Add Button Top Right)
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
    titleGroup: { display: 'flex', flexDirection: 'column' },
    title: { fontSize: '28px', fontWeight: '800', color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' },
    subTitle: { fontSize: '14px', color: '#6b7280', marginTop: '5px' },
    
    // Add Button Style
    addBtn: { 
      background: '#4f46e5', color: 'white', padding: '12px 24px', 
      borderRadius: '12px', border: 'none', cursor: 'pointer', 
      fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px',
      boxShadow: '0 4px 10px rgba(79, 70, 229, 0.2)', transition: 'transform 0.2s',
      fontSize: '14px'
    },

    // Stats Cards
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' },
    statCard: {
      background: 'white', padding: '20px', borderRadius: '16px',
      border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
      display: 'flex', alignItems: 'center', gap: '15px'
    },
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
      display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap',
      boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
    },
    searchBox: {
      display: 'flex', alignItems: 'center', gap: '10px', background: '#f9fafb',
      padding: '10px 15px', borderRadius: '10px', border: '1px solid #e5e7eb', flex: 1, minWidth: '250px'
    },
    searchInput: { border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '14px', color: '#374151' },
    
    // Filter Dropdown
    filterContainer: { display: 'flex', alignItems: 'center', gap: '10px' },
    filterSelect: {
      padding: '10px 15px', borderRadius: '10px', border: '1px solid #e5e7eb',
      background: 'white', fontSize: '14px', color: '#374151', cursor: 'pointer', outline: 'none',
      minWidth: '180px'
    },

    // Table
    tableContainer: { 
      background: 'white', borderRadius: '16px', 
      border: '1px solid #e5e7eb',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)', overflow: 'hidden' 
    },
    table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
    thead: { backgroundColor: '#f8fafc', borderBottom: '1px solid #e5e7eb' },
    th: { padding: '16px 24px', fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em' },
    tr: { borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.2s' },
    td: { padding: '16px 24px', fontSize: '14px', color: '#334155', verticalAlign: 'middle' },

    // Badges
    badge: (type) => ({
      display: 'inline-flex', alignItems: 'center', gap: '6px',
      padding: '6px 12px', borderRadius: '9999px', fontSize: '12px', fontWeight: '600',
      backgroundColor: type === 'hub' ? '#eff6ff' : '#f0fdf4',
      color: type === 'hub' ? '#2563eb' : '#16a34a',
      border: `1px solid ${type === 'hub' ? '#bfdbfe' : '#bbf7d0'}`
    }),

    // Action Buttons
    actionBtn: { 
      background: 'white', border: '1px solid #e2e8f0', 
      color: '#ef4444', padding: '8px', borderRadius: '8px', 
      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'all 0.2s',
      boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
    },

    // Modal
    overlay: { 
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
      background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 
    },
    modal: { 
      background: 'white', padding: '0', borderRadius: '24px', 
      width: '450px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      overflow: 'hidden', animation: 'fadeIn 0.2s ease-out'
    },
    modalHeader: { 
      padding: '24px 32px', borderBottom: '1px solid #f1f5f9', background: 'white',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center'
    },
    modalTitle: { fontSize: '20px', fontWeight: '800', color: '#0f172a' },
    modalBody: { padding: '32px', background: '#f8fafc' },
    modalFooter: { 
      padding: '20px 32px', background: 'white', borderTop: '1px solid #f1f5f9', 
      display: 'flex', justifyContent: 'flex-end', gap: '12px' 
    },
    
    inputGroup: { marginBottom: '20px' },
    inputLabel: { display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: '#475569' },
    input: { 
      width: '100%', padding: '12px 16px', borderRadius: '12px', 
      border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none',
      boxSizing: 'border-box', transition: 'border-color 0.2s, box-shadow 0.2s',
      backgroundColor: 'white', color: '#1e293b'
    },
    select: {
      width: '100%', padding: '12px 16px', borderRadius: '12px', 
      border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none',
      boxSizing: 'border-box', backgroundColor: 'white', cursor: 'pointer',
      appearance: 'none', backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%236b7280%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")',
      backgroundRepeat: 'no-repeat', backgroundPosition: 'right 16px center', backgroundSize: '12px'
    },
    
    cancelBtn: {
      padding: '10px 20px', borderRadius: '10px', border: '1px solid #e2e8f0',
      background: 'white', color: '#64748b', fontWeight: '600', cursor: 'pointer'
    },
    saveBtn: {
      padding: '10px 20px', borderRadius: '10px', border: 'none',
      background: '#4f46e5', color: 'white', fontWeight: '600', cursor: 'pointer',
      boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)'
    }
  };

  return (
    <div style={s.container}>
      
      {/* 1. Header (Add Button moved here - Top Right) */}
      <div style={s.header}>
        <div style={s.titleGroup}>
          <div style={s.title}>
            <div style={{background:'#e0e7ff', padding:'10px', borderRadius:'12px', color:'#4338ca'}}>
              <Layers size={28}/>
            </div>
            Manage Floors
          </div>
          <p style={s.subTitle}>Organize and manage floors within your accommodation hubs.</p>
        </div>
        
        {/* ADD NEW FLOOR BUTTON (Top Right) */}
        <button 
            style={s.addBtn} 
            onClick={() => setIsModalOpen(true)}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <Plus size={18} /> Add New Floor
        </button>
      </div>

      {/* 2. Stats Grid */}
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
            <div style={s.statValue}>
                {floors.reduce((sum, f) => sum + (f.noOfRooms || 0), 0)}
            </div>
            <div style={s.statLabel}>Total Rooms</div>
          </div>
        </div>
      </div>

      {/* 3. Toolbar (Search & Filter) */}
      <div style={s.toolbar}>
        {/* Search Box */}
        <div style={s.searchBox}>
          <Search size={18} color="#9ca3af"/>
          <input 
            style={s.searchInput} 
            placeholder="Search floors..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Hub Filter */}
        <div style={s.filterContainer}>
            <Filter size={18} color="#6b7280"/>
            <select 
                style={s.filterSelect} 
                value={filterHub} 
                onChange={(e) => setFilterHub(e.target.value)}
            >
                <option value="ALL">All Hubs</option>
                {hubs.map(h => (
                    <option key={h.id} value={h.hubNumber}>{h.hubNumber}</option>
                ))}
            </select>
        </div>
      </div>

      {/* 4. Table */}
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
               <tr><td colSpan="4" style={{textAlign:'center', padding:'40px', color:'#9ca3af'}}>No floors found matching your search.</td></tr>
            ) : (
                filteredFloors.map(f => (
                <tr 
                    key={f.id} 
                    style={s.tr}
                    onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'white'}
                >
                    {/* Floor Name */}
                    <td style={s.td}>
                        <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                            <div style={{width:'40px', height:'40px', borderRadius:'10px', background:'#f1f5f9', color:'#475569', display:'flex', alignItems:'center', justifyContent:'center'}}>
                                <Layers size={20}/>
                            </div>
                            <div>
                                <div style={{fontWeight:'700', color:'#1e293b'}}>{f.floorNumber}</div>
                                <div style={{fontSize:'12px', color:'#94a3b8'}}>ID: #{f.id}</div>
                            </div>
                        </div>
                    </td>

                    {/* Hub Badge */}
                    <td style={s.td}>
                        <span style={s.badge('hub')}>
                          <Building2 size={12}/> {f.hubNumber || 'Unassigned'}
                        </span>
                    </td>

                    {/* Rooms Badge */}
                    <td style={s.td}>
                        <span style={s.badge('room')}>
                           <DoorOpen size={12}/> {f.noOfRooms} Rooms
                        </span>
                    </td>

                    {/* Actions */}
                    <td style={s.td}>
                        <div style={{display:'flex', justifyContent:'flex-end'}}>
                            <button 
                                style={s.actionBtn} 
                                onClick={() => handleDelete(f.id)}
                                title="Delete Floor"
                                onMouseEnter={(e) => e.currentTarget.style.background = '#fee2e2'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                            >
                                <Trash2 size={16}/>
                            </button>
                        </div>
                    </td>
                </tr>
                ))
            )}
          </tbody>
        </table>
      </div>

      {/* 5. MODAL */}
      {isModalOpen && (
        <div style={s.overlay} onClick={() => setIsModalOpen(false)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div style={s.modalHeader}>
                <div>
                    <h3 style={s.modalTitle}>Add New Floor</h3>
                    <p style={{margin: '2px 0 0', fontSize: '13px', color: '#64748b'}}>Select a hub and assign a floor number.</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} style={{background:'none', border:'none', cursor:'pointer', color:'#94a3b8'}}>
                    <X size={24}/>
                </button>
            </div>
            
            <form onSubmit={handleCreate}>
                <div style={s.modalBody}>
                    <div style={s.inputGroup}>
                        <label style={s.inputLabel}>Select Hub</label>
                        <select 
                            style={s.select} 
                            value={formData.hubId} 
                            onChange={e => setFormData({...formData, hubId: e.target.value})} 
                            required
                            onFocus={(e) => e.target.style.borderColor = '#4f46e5'}
                            onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                        >
                            <option value="">-- Choose a Hub --</option>
                            {hubs.map(h => (
                                <option key={h.id} value={h.id}>{h.hubNumber}</option>
                            ))}
                        </select>
                    </div>

                    <div style={s.inputGroup}>
                        <label style={s.inputLabel}>Floor Name / Number</label>
                        <input 
                            style={s.input} 
                            value={formData.floorNumber} 
                            onChange={e => setFormData({...formData, floorNumber: e.target.value})} 
                            placeholder="e.g. 1st Floor, Floor 02" 
                            required 
                            onFocus={(e) => e.target.style.borderColor = '#4f46e5'}
                            onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                        />
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