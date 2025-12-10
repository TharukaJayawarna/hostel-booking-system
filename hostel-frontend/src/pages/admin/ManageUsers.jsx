import React, { useEffect, useState } from 'react';
import api from '../../api/axiosConfig';
import { toast } from 'react-toastify';
import { 
  Users, 
  Trash2, 
  Plus, 
  Shield, 
  ShieldCheck, 
  Search, 
  Filter, 
  X, 
  UserCheck, 
  Mail, 
  Phone 
} from 'lucide-react';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('ALL');
  
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', username: '', password: '', 
    email: '', contactNumber: '', role: 'WARDEN'
  });

  // Admin Check (Optional: Frontend Level Hiding)
  const currentUser = JSON.parse(localStorage.getItem('user'));
  // const isSuperAdmin = currentUser?.role === 'ADMIN'; 

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users');
      if (res.data.status === 'SUCCESS') setUsers(res.data.data);
    } catch (e) { 
      console.error(e);
      // toast.error("Failed to load users"); 
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if(!formData.username || !formData.password || !formData.email) {
        return toast.warning("Please fill all required fields");
    }

    try {
      await api.post('/users/create', formData);
      toast.success("User Created Successfully!");
      setFormData({ firstName: '', lastName: '', username: '', password: '', email: '', contactNumber: '', role: 'WARDEN' }); 
      setIsModalOpen(false);
      fetchUsers();
    } catch (e) { 
      toast.error(e.response?.data?.message || "Creation Failed"); 
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Are you sure you want to remove this user? This action cannot be undone.")) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success("User Removed Successfully");
      fetchUsers();
    } catch (e) { toast.error("Delete Failed"); }
  };

  // --- Filtering & Stats ---
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
        (user.firstName && user.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = filterRole === 'ALL' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'ADMIN').length,
    wardens: users.filter(u => u.role === 'WARDEN').length,
    students: users.filter(u => u.role === 'STUDENT').length
  };

  // --- STYLES (High Quality Design) ---
  const s = {
    container: { fontFamily: "'Inter', sans-serif", color: '#1f2937', paddingBottom: '40px' },
    
    // Header
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
    titleGroup: { display: 'flex', flexDirection: 'column' },
    title: { fontSize: '28px', fontWeight: '800', color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' },
    subTitle: { fontSize: '14px', color: '#6b7280', marginTop: '5px' },
    addBtn: { background: '#4f46e5', color: 'white', padding: '12px 24px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 10px rgba(79, 70, 229, 0.2)', transition: '0.2s' },

    // Stats
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' },
    statCard: { background: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '15px' },
    statIconBox: (bg, col) => ({ width: '50px', height: '50px', borderRadius: '12px', background: bg, color: col, display: 'flex', alignItems: 'center', justifyContent: 'center' }),
    statValue: { fontSize: '24px', fontWeight: '800', color: '#111827', lineHeight: '1' },
    statLabel: { fontSize: '13px', color: '#6b7280', fontWeight: '600', marginTop: '4px' },

    // Toolbar
    toolbar: { background: 'white', padding: '15px 20px', borderRadius: '16px', border: '1px solid #e5e7eb', marginBottom: '20px', display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' },
    searchBox: { display: 'flex', alignItems: 'center', gap: '10px', background: '#f9fafb', padding: '10px 15px', borderRadius: '10px', border: '1px solid #e5e7eb', flex: 1, minWidth: '250px' },
    searchInput: { border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '14px', color: '#374151' },
    filterSelect: { padding: '10px 15px', borderRadius: '10px', border: '1px solid #e5e7eb', background: 'white', fontSize: '14px', color: '#374151', cursor: 'pointer', outline: 'none', minWidth: '150px' },

    // Table
    tableContainer: { background: 'white', borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)', overflow: 'hidden' },
    table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
    thead: { backgroundColor: '#f8fafc', borderBottom: '1px solid #e5e7eb' },
    th: { padding: '16px 24px', fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em' },
    tr: { borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.2s' },
    td: { padding: '16px 24px', fontSize: '14px', color: '#334155', verticalAlign: 'middle' },
    
    // Badges & Buttons
    badge: (role) => {
        const styles = {
            ADMIN: { bg: '#fee2e2', text: '#dc2626', icon: Shield },
            WARDEN: { bg: '#e0e7ff', text: '#4338ca', icon: ShieldCheck },
            STUDENT: { bg: '#f0fdf4', text: '#16a34a', icon: UserCheck },
            DEFAULT: { bg: '#f3f4f6', text: '#4b5563', icon: Users }
        };
        const s = styles[role] || styles.DEFAULT;
        const Icon = s.icon;
        return (
            <span style={{display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', backgroundColor: s.bg, color: s.text, textTransform:'uppercase'}}>
                <Icon size={12}/> {role}
            </span>
        );
    },
    actionBtn: { background: 'white', border: '1px solid #fee2e2', color: '#ef4444', padding: '8px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' },

    // Modal
    overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 },
    modal: { background: 'white', borderRadius: '24px', width: '600px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden', animation: 'fadeIn 0.2s ease-out' },
    modalHeader: { padding: '24px 32px', borderBottom: '1px solid #f1f5f9', background: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    modalBody: { padding: '32px', background: '#f8fafc' },
    modalFooter: { padding: '24px 32px', background: 'white', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '12px' },
    inputGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '15px' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '15px' },
    label: { fontSize: '13px', fontWeight: '600', color: '#475569' },
    input: { width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '14px', background: 'white', outline: 'none', boxSizing: 'border-box' },
    select: { width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '14px', background: 'white', cursor: 'pointer', outline:'none' },
    cancelBtn: { padding: '12px 24px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', color: '#64748b', fontWeight: '600', cursor: 'pointer' },
    saveBtn: { padding: '12px 24px', borderRadius: '12px', border: 'none', background: '#4f46e5', color: 'white', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)' }
  };

  return (
    <div style={s.container}>
      {/* HEADER */}
      <div style={s.header}>
        <div style={s.titleGroup}>
          <div style={s.title}>
            <div style={{background:'#e0e7ff', padding:'10px', borderRadius:'12px', color:'#4338ca'}}><Users size={28}/></div>
            Manage Users
          </div>
          <p style={s.subTitle}>Control system access and manage staff accounts.</p>
        </div>
        <button style={s.addBtn} onClick={() => setIsModalOpen(true)}>
            <Plus size={18} /> Create New User
        </button>
      </div>

      {/* STATS */}
      <div style={s.statsGrid}>
        <div style={s.statCard}>
          <div style={s.statIconBox('#eff6ff', '#2563eb')}><Users size={24}/></div>
          <div><div style={s.statValue}>{stats.total}</div><div style={s.statLabel}>Total Users</div></div>
        </div>
        <div style={s.statCard}>
          <div style={s.statIconBox('#fef2f2', '#dc2626')}><Shield size={24}/></div>
          <div><div style={s.statValue}>{stats.admins}</div><div style={s.statLabel}>Administrators</div></div>
        </div>
        <div style={s.statCard}>
          <div style={s.statIconBox('#f0fdf4', '#16a34a')}><ShieldCheck size={24}/></div>
          <div><div style={s.statValue}>{stats.wardens}</div><div style={s.statLabel}>Wardens</div></div>
        </div>
        <div style={s.statCard}>
          <div style={s.statIconBox('#f3f4f6', '#4b5563')}><UserCheck size={24}/></div>
          <div><div style={s.statValue}>{stats.students}</div><div style={s.statLabel}>Students</div></div>
        </div>
      </div>

      {/* TOOLBAR */}
      <div style={s.toolbar}>
        <div style={s.searchBox}>
          <Search size={18} color="#9ca3af"/>
          <input style={s.searchInput} placeholder="Search by name or username..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
        </div>
        <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
            <Filter size={18} color="#6b7280"/>
            <select style={s.filterSelect} value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
                <option value="ALL">All Roles</option>
                <option value="ADMIN">Admins</option>
                <option value="WARDEN">Wardens</option>
                <option value="STUDENT">Students</option>
            </select>
        </div>
      </div>

      {/* TABLE */}
      <div style={s.tableContainer}>
        <table style={s.table}>
          <thead style={s.thead}>
            <tr>
              <th style={s.th}>User Profile</th>
              <th style={s.th}>Access Role</th>
              <th style={s.th}>Contact Info</th>
              <th style={{...s.th, textAlign:'right'}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan="4" style={{textAlign:'center', padding:'40px', color:'#9ca3af'}}>Loading users...</td></tr> 
            : filteredUsers.length === 0 ? <tr><td colSpan="4" style={{textAlign:'center', padding:'40px', color:'#9ca3af'}}>No users found.</td></tr>
            : filteredUsers.map(u => (
                <tr key={u.id} style={s.tr} onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'} onMouseOut={(e) => e.currentTarget.style.background = 'white'}>
                    <td style={s.td}>
                        <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                            <div style={{width:'40px', height:'40px', borderRadius:'50%', background:'#f1f5f9', color:'#64748b', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'700', border:'1px solid #e2e8f0'}}>
                                {u.firstName ? u.firstName.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div>
                                <div style={{fontWeight:'700', color:'#111827'}}>{u.firstName} {u.lastName}</div>
                                <div style={{fontSize:'12px', color:'#94a3b8'}}>@{u.username}</div>
                            </div>
                        </div>
                    </td>
                    <td style={s.td}>{s.badge(u.role)}</td>
                    <td style={s.td}>
                        <div style={{display:'flex', flexDirection:'column', gap:'4px', fontSize:'13px'}}>
                            <div style={{display:'flex', alignItems:'center', gap:'6px'}}><Mail size={12} color="#9ca3b8"/> {u.email}</div>
                            <div style={{display:'flex', alignItems:'center', gap:'6px'}}><Phone size={12} color="#9ca3b8"/> {u.contactNumber || 'N/A'}</div>
                        </div>
                    </td>
                    <td style={s.td}>
                        <div style={{display:'flex', justifyContent:'flex-end'}}>
                            {u.username !== 'admin' && u.role !== 'STUDENT' && (
                                <button style={s.actionBtn} onClick={() => handleDelete(u.id)} title="Delete User">
                                    <Trash2 size={16}/>
                                </button>
                            )}
                        </div>
                    </td>
                </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* CREATE USER MODAL */}
      {isModalOpen && (
        <div style={s.overlay} onClick={() => setIsModalOpen(false)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <div style={s.modalHeader}>
                <div><h3 style={{...s.title, fontSize:'20px'}}>Create New User</h3><p style={{margin:'2px 0 0', fontSize:'13px', color:'#64748b'}}>Add a new administrator or warden to the system.</p></div>
                <button onClick={() => setIsModalOpen(false)} style={{background:'none', border:'none', cursor:'pointer', color:'#94a3b8'}}><X size={24}/></button>
            </div>
            <form onSubmit={handleCreate}>
                <div style={s.modalBody}>
                    <div style={s.inputGrid}>
                        <div><label style={s.label}>First Name</label><input style={s.input} value={formData.firstName} onChange={e=>setFormData({...formData, firstName:e.target.value})} required/></div>
                        <div><label style={s.label}>Last Name</label><input style={s.input} value={formData.lastName} onChange={e=>setFormData({...formData, lastName:e.target.value})} required/></div>
                    </div>
                    
                    <div style={s.inputGrid}>
                        <div><label style={s.label}>Username</label><input style={s.input} value={formData.username} onChange={e=>setFormData({...formData, username:e.target.value})} required/></div>
                        <div><label style={s.label}>Password</label><input type="password" style={s.input} value={formData.password} onChange={e=>setFormData({...formData, password:e.target.value})} required/></div>
                    </div>

                    <div style={s.inputGroup}>
                        <label style={s.label}>Email Address</label>
                        <input type="email" style={s.input} value={formData.email} onChange={e=>setFormData({...formData, email:e.target.value})} required/>
                    </div>

                    <div style={s.inputGrid}>
                        <div><label style={s.label}>Phone Number</label><input style={s.input} value={formData.contactNumber} onChange={e=>setFormData({...formData, contactNumber:e.target.value})} placeholder="Optional"/></div>
                        <div>
                            <label style={s.label}>Assign Role</label>
                            <select style={s.select} value={formData.role} onChange={e=>setFormData({...formData, role:e.target.value})}>
                                <option value="WARDEN">Warden (View Only)</option>
                                <option value="ADMIN">Admin (Full Access)</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div style={s.modalFooter}>
                    <button type="button" onClick={() => setIsModalOpen(false)} style={s.cancelBtn}>Cancel</button>
                    <button type="submit" style={s.saveBtn}>Create User</button>
                </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ManageUsers;