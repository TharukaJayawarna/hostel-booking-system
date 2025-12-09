import React, { useEffect, useState } from 'react';
import api from '../../api/axiosConfig';
import { toast } from 'react-toastify';
import { Users, Trash2, Plus, Shield } from 'lucide-react';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', username: '', password: '', 
    email: '', phone: '', role: 'WARDEN' // Default role
  });

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      if (res.data.status === 'SUCCESS') setUsers(res.data.data);
    } catch (e) { console.error(e); } 
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/users/create', formData);
      toast.success("User Created Successfully!");
      setFormData({ ...formData, username: '', password: '', email: '' }); 
      fetchUsers();
    } catch (e) { toast.error(e.response?.data?.message || "Creation Failed"); }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Are you sure?")) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success("User Deleted");
      fetchUsers();
    } catch (e) { toast.error("Delete Failed"); }
  };

  const s = {
    container: { padding: '20px', fontFamily: "'Inter', sans-serif'"},
    formCard: { background: 'white', padding: '25px', borderRadius: '16px', marginBottom: '30px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' },
    input: { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', marginTop: '5px' },
    btn: { background: '#4f46e5', color: 'white', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold' },
    table: { width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '12px', overflow: 'hidden' },
    th: { padding: '15px', background: '#f8fafc', textAlign: 'left', fontWeight: '700', color: '#64748b' },
    td: { padding: '15px', borderBottom: '1px solid #f1f5f9', color: '#334155' },
    badge: (role) => ({
      padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '700',
      background: role === 'ADMIN' ? '#fee2e2' : '#e0e7ff',
      color: role === 'ADMIN' ? '#dc2626' : '#4338ca'
    })
  };

  return (
    <div style={s.container}>
      <h1 style={{fontSize:'28px', fontWeight:'800', marginBottom:'20px'}}>Manage Users</h1>

      {/* CREATE FORM */}
      <div style={s.formCard}>
        <h3 style={{marginBottom:'15px', display:'flex', gap:'10px'}}><Plus size={20}/> Create Admin / Warden</h3>
        <form onSubmit={handleCreate} style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px'}}>
            <div><label>First Name</label><input style={s.input} value={formData.firstName} onChange={e=>setFormData({...formData, firstName:e.target.value})} required/></div>
            <div><label>Last Name</label><input style={s.input} value={formData.lastName} onChange={e=>setFormData({...formData, lastName:e.target.value})} required/></div>
            <div><label>Username</label><input style={s.input} value={formData.username} onChange={e=>setFormData({...formData, username:e.target.value})} required/></div>
            <div><label>Password</label><input type="password" style={s.input} value={formData.password} onChange={e=>setFormData({...formData, password:e.target.value})} required/></div>
            <div><label>Email</label><input type="email" style={s.input} value={formData.email} onChange={e=>setFormData({...formData, email:e.target.value})} required/></div>
            
            <div>
                <label>Role</label>
                <select style={{...s.input, background:'white'}} value={formData.role} onChange={e=>setFormData({...formData, role:e.target.value})}>
                    <option value="WARDEN">Warden (View Only)</option>
                    <option value="ADMIN">Admin (Full Access)</option>
                </select>
            </div>

            <div style={{gridColumn:'1/-1', marginTop:'10px'}}>
                <button type="submit" style={s.btn}>Create User</button>
            </div>
        </form>
      </div>

      {/* TABLE */}
      <table style={s.table}>
        <thead><tr><th style={s.th}>User</th><th style={s.th}>Role</th><th style={s.th}>Email</th><th style={s.th}>Actions</th></tr></thead>
        <tbody>
            {users.map(u => (
                <tr key={u.id}>
                    <td style={s.td}><b>{u.firstName} {u.lastName}</b><br/><span style={{fontSize:'12px', color:'#94a3b8'}}>@{u.username}</span></td>
                    <td style={s.td}><span style={s.badge(u.role)}>{u.role}</span></td>
                    <td style={s.td}>{u.email}</td>
                    <td style={s.td}>
                        {u.username !== 'admin' && ( // Default admin ව delete කරන්න බෑ
                            <button onClick={() => handleDelete(u.id)} style={{border:'none', background:'transparent', color:'#ef4444', cursor:'pointer'}}><Trash2 size={18}/></button>
                        )}
                    </td>
                </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManageUsers;