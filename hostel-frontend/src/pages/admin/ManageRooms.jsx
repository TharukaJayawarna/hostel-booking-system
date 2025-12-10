import React, { useEffect, useState } from 'react';
import api from '../../api/axiosConfig';
import { toast } from 'react-toastify';
import { DoorOpen, Trash2, Plus, Search, Users, Lock, Unlock, CalendarClock, Building, X, Pencil, MessageSquare, AlertCircle } from 'lucide-react';

const ManageRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [floors, setFloors] = useState([]);
  const [hubs, setHubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFloor, setFilterFloor] = useState('ALL');
  const [filterHub, setFilterHub] = useState('ALL');
  const [filterGender, setFilterGender] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false); 
  const [editingRoomId, setEditingRoomId] = useState(null);
  const [hoveredComment, setHoveredComment] = useState(null);

  const [formData, setFormData] = useState({
    floorId: '', roomNumber: '', monthlyPrice: '',weeklyPrice: '',dailyPrice: '', isPrivate: false, 
    reservationPeriod: 'DEFAULT', reservedFor: 'BOYS', roomType: 'SHARING_2', comment: ''
  });

  // Check Role
  const user = JSON.parse(localStorage.getItem('user'));
  const isWarden = user?.role === 'WARDEN';

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [r, f, h] = await Promise.all([api.get('/rooms'), api.get('/floors'), api.get('/hubs')]);
      if(r.data.status === 'SUCCESS') setRooms(r.data.data);
      if(f.data.status === 'SUCCESS') setFloors(f.data.data);
      if(h.data.status === 'SUCCESS') setHubs(h.data.data); 
    } catch (e) { toast.error("Failed to load data"); } 
    finally { setLoading(false); }
  };

  const resetForm = () => {
    setFormData({ floorId: '', roomNumber: '', price: '', isPrivate: false, reservationPeriod: 'MONTHLY', reservedFor: 'BOYS', roomType: 'SHARING_2', comment: '' });
    setIsEditMode(false);
    setEditingRoomId(null);
  };

  const handleEdit = (room) => {
    const floorObj = floors.find(f => f.floorNumber === room.floorNumber);
    setFormData({
        floorId: floorObj ? floorObj.id : '', roomNumber: room.roomNumber, price: room.price,
        isPrivate: room.isPrivate, reservationPeriod: room.reservationPeriod, reservedFor: room.reservedFor,
        roomType: room.roomType, comment: room.comment || '' 
    });
    setEditingRoomId(room.id);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(!formData.roomNumber || !formData.price) { toast.warning("Please fill all required fields"); return; }
    try {
      if (isEditMode) {
        await api.put(`/rooms/${editingRoomId}`, formData);
        toast.success("Room Updated Successfully!");
      } else {
        if(!formData.floorId) { toast.warning("Please select a floor"); return; }
        await api.post(`/floors/${formData.floorId}/rooms`, formData);
        toast.success("Room Added Successfully!");
      }
      setIsModalOpen(false);
      resetForm();
      fetchAll();
    } catch (e) { toast.error(isEditMode ? "Failed to update room" : "Failed to add room"); }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Are you sure you want to delete this Room?")) return;
    try { await api.delete(`/rooms/${id}`); toast.success("Room Deleted"); fetchAll(); } 
    catch (e) { toast.error("Failed to delete"); }
  };

  const handleMouseEnter = (e, text) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setHoveredComment({ text: text, x: rect.left, y: rect.bottom + 5 });
  };

  const filteredRooms = rooms.filter(room => {
    const rNum = room.roomNumber ? room.roomNumber.toString() : "";
    const matchesSearch = rNum.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFloor = filterFloor === 'ALL' || room.floorNumber === filterFloor;
    const matchesGender = filterGender === 'ALL' || room.reservedFor === filterGender;
    const matchesHub = filterHub === 'ALL' || room.hubNumber === filterHub;
    return matchesSearch && matchesFloor && matchesGender;
  });

  const stats = {
    total: rooms.length,
    private: rooms.filter(r => r.isPrivate).length,
    shared: rooms.filter(r => !r.isPrivate).length
  };

  const s = {
    container: { fontFamily: "'Inter', sans-serif", color: '#1f2937', paddingBottom: '40px', position: 'relative' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' },
    title: { fontSize: '26px', fontWeight: '800', color: '#111827', display: 'flex', alignItems: 'center', gap: '10px' },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' },
    statCard: { background: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '15px' },
    statIconBox: (bg, col) => ({ width: '50px', height: '50px', borderRadius: '12px', background: bg, color: col, display: 'flex', alignItems: 'center', justifyContent: 'center' }),
    statValue: { fontSize: '24px', fontWeight: '800', color: '#111827', lineHeight: '1' },
    statLabel: { fontSize: '13px', color: '#6b7280', fontWeight: '600', marginTop: '4px' },
    toolbar: { background: 'white', padding: '15px 20px', borderRadius: '16px', border: '1px solid #e5e7eb', marginBottom: '20px', display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' },
    searchBox: { display: 'flex', alignItems: 'center', gap: '10px', background: '#f9fafb', padding: '8px 15px', borderRadius: '10px', border: '1px solid #e5e7eb', flex: 1 },
    searchInput: { border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '14px' },
    filterSelect: { padding: '8px 12px', borderRadius: '10px', border: '1px solid #e5e7eb', background: 'white', fontSize: '14px', color: '#374151', cursor: 'pointer', outline: 'none' },
    addBtn: { background: '#4f46e5', color: 'white', padding: '10px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 10px rgba(79, 70, 229, 0.2)', transition: '0.2s' },
    tableContainer: { background: 'white', borderRadius: '16px', border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' },
    table: { width: '100%', borderCollapse: 'collapse' },
    thead: { background: '#f8fafc', borderBottom: '1px solid #e5e7eb' },
    th: { padding: '15px 20px', fontSize: '12px', fontWeight: '700', color: '#64748b', textAlign: 'left', textTransform: 'uppercase' },
    tr: { borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' },
    td: { padding: '15px 20px', fontSize: '14px', color: '#334155', verticalAlign: 'middle' },
    typeBadge: (type) => ({ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', background: '#f0f9ff', color: '#0369a1', border: '1px solid #bae6fd' }),
    accessBadge: (gender, isPrivate) => {
        const isBoy = gender === 'BOYS';
        const bg = isBoy ? (isPrivate ? '#1e3a8a' : '#eff6ff') : (isPrivate ? '#831843' : '#fdf2f8');
        const text = isBoy ? (isPrivate ? 'white' : '#1d4ed8') : (isPrivate ? 'white' : '#db2777');
        const border = isBoy ? '#bfdbfe' : '#fbcfe8';
        return { display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', backgroundColor: bg, color: text, border: isPrivate ? 'none' : `1px solid ${border}`, textTransform: 'uppercase', letterSpacing: '0.5px' };
    },
    tooltip: { position: 'fixed', top: hoveredComment ? hoveredComment.y : 0, left: hoveredComment ? hoveredComment.x : 0, backgroundColor: '#1f2937', color: '#ffffff', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', maxWidth: '300px', zIndex: 1000, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', pointerEvents: 'none', lineHeight: '1.4' },
    overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 },
    modal: { background: 'white', borderRadius: '24px', width: '600px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', overflow: 'hidden', border: '1px solid #f1f5f9', animation: 'fadeIn 0.2s ease-out' },
    modalHeader: { padding: '24px 32px', background: 'white', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    modalTitle: { fontSize: '20px', fontWeight: '800', color: '#0f172a' },
    modalSub: { fontSize: '14px', color: '#64748b', marginTop: '2px' },
    modalBody: { padding: '32px', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '24px', maxHeight:'70vh', overflowY:'auto' },
    sectionLabel: { fontSize: '12px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' },
    inputGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
    label: { fontSize: '13px', fontWeight: '600', color: '#475569' },
    input: { width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '14px', color: '#1e293b', background: 'white', outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box' },
    select: { width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '14px', color: '#1e293b', background: 'white', outline: 'none', cursor: 'pointer' },
    toggleCard: (isActive) => ({ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: isActive ? '#f0f9ff' : 'white', borderRadius: '16px', border: isActive ? '1px solid #bae6fd' : '1px solid #e2e8f0', cursor: 'pointer', transition: 'all 0.2s' }),
    toggleContainer: (isActive) => ({ width: '48px', height: '26px', background: isActive ? '#0284c7' : '#cbd5e1', borderRadius: '99px', position: 'relative', transition: '0.3s' }),
    toggleCircle: (isActive) => ({ width: '20px', height: '20px', background: 'white', borderRadius: '50%', position: 'absolute', top: '3px', left: isActive ? '25px' : '3px', transition: '0.3s cubic-bezier(0.4, 0.0, 0.2, 1)', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }),
    modalFooter: { padding: '24px 32px', background: 'white', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '12px' },
    cancelBtn: { padding: '12px 24px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', color: '#64748b', fontWeight: '600', cursor: 'pointer' },
    saveBtn: { padding: '12px 24px', borderRadius: '12px', border: 'none', background: '#4f46e5', color: 'white', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)' }
  };

  return (
    <div style={s.container}>
      
      {hoveredComment && <div style={s.tooltip}>{hoveredComment.text}</div>}

      <div style={s.header}>
        <div style={s.title}>
          <div style={{background:'#e0e7ff', padding:'10px', borderRadius:'12px', color:'#4338ca'}}><DoorOpen size={28}/></div>
          <div>Manage Rooms <div style={{fontSize:'14px', color:'#6b7280', fontWeight:'500'}}>Space & Pricing</div></div>
        </div>
        {/* Warden ට Add Button නැත */}
        {!isWarden && (
            <button style={s.addBtn} onClick={() => { resetForm(); setIsModalOpen(true); }}>
            <Plus size={18} /> Add Room
            </button>
        )}
      </div>

      <div style={s.statsGrid}>
        <div style={s.statCard}>
          <div style={s.statIconBox('#eff6ff', '#2563eb')}><Building size={24}/></div>
          <div><div style={s.statValue}>{stats.total}</div><div style={s.statLabel}>Total Rooms</div></div>
        </div>
        <div style={s.statCard}>
          <div style={s.statIconBox('#f0fdf4', '#16a34a')}><Unlock size={24}/></div>
          <div><div style={s.statValue}>{stats.shared}</div><div style={s.statLabel}>Shared Rooms</div></div>
        </div>
        <div style={s.statCard}>
          <div style={s.statIconBox('#fef2f2', '#dc2626')}><Lock size={24}/></div>
          <div><div style={s.statValue}>{stats.private}</div><div style={s.statLabel}>Private Rooms</div></div>
        </div>
      </div>

      <div style={s.toolbar}>
        <div style={s.searchBox}>
          <Search size={18} color="#9ca3af"/>
          <input style={s.searchInput} placeholder="Search by Room Number..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
        </div>
        <div style={{display:'flex', gap:'10px'}}>
          <select style={s.filterSelect} value={filterHub} onChange={e => setFilterHub(e.target.value)}>
            <option value="ALL">All Hubs</option>
            {hubs.map(h => <option key={h.id} value={h.hubNumber}>{h.hubNumber}</option>)}
          </select>
          <select style={s.filterSelect} value={filterFloor} onChange={e => setFilterFloor(e.target.value)}>
            <option value="ALL">All Floors</option>
            {floors.filter(f => filterHub === 'ALL' || f.hubNumber === filterHub).map(f => <option key={f.id} value={f.floorNumber}>{f.floorNumber}</option>)}
          </select>
          <select style={s.filterSelect} value={filterGender} onChange={e => setFilterGender(e.target.value)}>
            <option value="ALL">All Genders</option>
            <option value="BOYS">Boys</option>
            <option value="GIRLS">Girls</option>
          </select>
        </div>
      </div>

      <div style={s.tableContainer}>
        <table style={s.table}>
          <thead style={s.thead}>
            <tr>
              <th style={s.th}>Room</th>
              <th style={s.th}>Location</th>
              <th style={s.th}>Type / Capacity</th>
              <th style={s.th}>Access & Gender</th>
              <th style={s.th}>Monthly Price</th>
              <th style={s.th}>Period</th>
              <th style={{...s.th, textAlign:'right'}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan="7" style={{padding:'40px', textAlign:'center', color:'#94a3b8'}}>Loading...</td></tr> 
            : filteredRooms.length === 0 ? <tr><td colSpan="7" style={{padding:'40px', textAlign:'center', color:'#94a3b8'}}>No rooms found.</td></tr>
            : filteredRooms.map(r => (
              <tr key={r.id} style={s.tr} onMouseOver={e => e.currentTarget.style.background='#f8fafc'} onMouseOut={e => e.currentTarget.style.background='white'}>
                <td style={s.td}>
                  <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                    <div style={{padding:'8px', background:'#fff7ed', borderRadius:'10px', color:'#ea580c'}}><DoorOpen size={20}/></div>
                    <div>
                        <span style={{fontWeight:'700', color:'#1e293b', fontSize:'15px'}}>{r.roomNumber}</span>
                        {r.comment && (
                            <div 
                                onMouseEnter={(e) => handleMouseEnter(e, r.comment)} 
                                onMouseLeave={() => setHoveredComment(null)} 
                                style={{marginTop: '6px', fontSize: '11px', color: '#b45309', backgroundColor: '#fffbeb', padding: '4px 8px', borderRadius: '6px', border: '1px solid #fcd34d', display: 'flex', alignItems: 'center', gap: '6px', maxWidth: '100px', cursor: 'pointer'}}
                            >
                                <MessageSquare size={12} style={{flexShrink:0}}/>
                                <span style={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block'}}>{r.comment}</span>
                            </div>
                        )}
                    </div>
                  </div>
                </td>
                <td style={s.td}><div style={{fontSize:'13px', fontWeight:'600'}}>{r.floorNumber}</div><div style={{fontSize:'11px', color:'#64748b'}}>{r.hubNumber || 'Hub Info'}</div></td>
                <td style={s.td}><span style={s.typeBadge(r.roomType || 'SHARING_2')}><Users size={14}/>{r.roomType ? r.roomType.replace('SHARING_', '') : '2'} Person</span></td>
                <td style={s.td}><span style={s.accessBadge(r.reservedFor, r.isPrivate)}>{r.isPrivate ? <Lock size={12}/> : <Unlock size={12}/>}{r.reservedFor === 'BOYS' ? 'Male' : 'Female'}<span style={{opacity:0.6, margin:'0 4px'}}>|</span>{r.isPrivate ? 'Private' : 'Shared'}</span></td>
                <td style={s.td}><div style={{display:'flex', alignItems:'center', gap:'4px', fontFamily:'monospace', fontWeight:'700', color:'#0f172a', fontSize:'15px'}}>LKR {parseFloat(r.price).toLocaleString('en-US', {minimumFractionDigits: 2})}</div></td>
                <td style={s.td}><div style={{display:'flex', alignItems:'center', gap:'6px', color:'#475569', fontSize:'13px'}}><CalendarClock size={14}/>{r.reservationPeriod ? r.reservationPeriod.replace('_', ' ') : 'MONTHLY'}</div></td>
                
                <td style={s.td}>
                  {/* Warden ට Edit සහ Delete බොත්තම් නැත */}
                  {!isWarden && (
                      <div style={{display:'flex', justifyContent:'flex-end', gap:'8px'}}>
                        <button onClick={() => handleEdit(r)} style={{padding:'8px', borderRadius:'8px', border:'1px solid #e2e8f0', background:'white', color:'#2563eb', cursor:'pointer'}} title="Edit Room"><Pencil size={16}/></button>
                        <button onClick={() => handleDelete(r.id)} style={{padding:'8px', borderRadius:'8px', border:'1px solid #fee2e2', background:'white', color:'#ef4444', cursor:'pointer'}} title="Delete Room"><Trash2 size={16}/></button>
                      </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div style={s.overlay} onClick={() => setIsModalOpen(false)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <div style={s.modalHeader}>
                <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
                    <div style={{background:'#f0f9ff', padding:'10px', borderRadius:'12px', border:'1px solid #e0f2fe'}}><Plus size={24} color="#0284c7"/></div>
                    <div><div style={s.modalTitle}>{isEditMode ? "Edit Room Details" : "Create New Room"}</div><div style={s.modalSub}>{isEditMode ? "Update existing room information" : "Add a new accommodation unit"}</div></div>
                </div>
                <button onClick={() => setIsModalOpen(false)} style={{background:'none', border:'none', cursor:'pointer', color:'#94a3b8'}}><X size={24}/></button>
            </div>
            <form onSubmit={handleSubmit}>
                <div style={s.modalBody}>
                    <div>
                        <div style={s.sectionLabel}>1. Location Details</div>
                        <div style={s.inputGrid}>
                            <div style={s.inputGroup}>
                                <label style={s.label}>Floor Location</label>
                                <select style={{...s.select, opacity: isEditMode ? 0.6 : 1, cursor: isEditMode ? 'not-allowed' : 'pointer'}} value={formData.floorId} onChange={e => setFormData({...formData, floorId: e.target.value})} required={!isEditMode} disabled={isEditMode}>
                                    <option value="">-- Select Floor --</option>
                                    {floors.map(f => <option key={f.id} value={f.id}>{f.hubNumber ? `${f.hubNumber} - ` : ''}{f.floorNumber}</option>)}
                                </select>
                            </div>
                            <div style={s.inputGroup}>
                                <label style={s.label}>Room Number</label>
                                <input style={{...s.input, opacity: isEditMode ? 0.6 : 1, cursor: isEditMode ? 'not-allowed' : 'text'}} placeholder="Ex: R-101" value={formData.roomNumber} onChange={e => setFormData({...formData, roomNumber: e.target.value})} required disabled={isEditMode} />
                            </div>
                        </div>
                        {isEditMode && <div style={{fontSize:'11px', color:'#ef4444', marginTop:'8px', display:'flex', alignItems:'center', gap:'4px'}}><AlertCircle size={12}/> Room Number and Location cannot be changed after creation.</div>}
                    </div>
                    <div>
                        <div style={s.sectionLabel}>2. Configuration & Capacity</div>
                        <div style={s.inputGrid}>
                            <div style={s.inputGroup}>
                                <label style={s.label}>Capacity (Type)</label>
                                <select style={s.select} value={formData.roomType} onChange={e => setFormData({...formData, roomType: e.target.value})}>
                                    <option value="SHARING_2">2 Person Sharing</option>
                                    <option value="SHARING_4">4 Person Sharing</option>
                                    <option value="SHARING_6">6 Person Sharing</option>
                                </select>
                            </div>
                            <div style={s.inputGroup}>
                                <label style={s.label}>Reserved For</label>
                                <select style={s.select} value={formData.reservedFor} onChange={e => setFormData({...formData, reservedFor: e.target.value})}>
                                    <option value="BOYS">👨 Boys</option>
                                    <option value="GIRLS">👩 Girls</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div>
                        <div>
      <div style={s.sectionLabel}>3. Pricing & Access</div>
      
      {/* Period Selection */}
      <div style={{marginBottom:'15px'}}>
          <label style={s.label}>Pricing Model</label>
          <select style={s.select} value={formData.reservationPeriod} onChange={e => setFormData({...formData, reservationPeriod: e.target.value})}>
              <option value="DEFAULT">Default (Any Duration)</option>
              <option value="MONTHLY">Monthly Only (30/60/90 Days)</option>
          </select>
      </div>

      <div style={s.inputGrid}>
          {/* Monthly Price is always required */}
          <div style={s.inputGroup}>
              <label style={s.label}>Monthly Price (LKR)</label>
              <input type="number" style={s.input} placeholder="0.00" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required />
          </div>

          {/* Show Weekly/Daily only if DEFAULT */}
          {formData.reservationPeriod === 'DEFAULT' && (
            <>
              <div style={s.inputGroup}>
                  <label style={s.label}>Weekly Price (LKR)</label>
                  <input type="number" style={s.input} placeholder="0.00" value={formData.weeklyPrice} onChange={e => setFormData({...formData, weeklyPrice: e.target.value})} required />
              </div>
              <div style={s.inputGroup}>
                  <label style={s.label}>Daily Price (LKR)</label>
                  <input type="number" style={s.input} placeholder="0.00" value={formData.dailyPrice} onChange={e => setFormData({...formData, dailyPrice: e.target.value})} required />
              </div>
            </>
          )}
      </div>
  </div>
                        <div style={{marginTop:'20px'}}>
                            <div style={s.toggleCard(formData.isPrivate)} onClick={() => setFormData({...formData, isPrivate: !formData.isPrivate})}>
                                <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                                    <div style={{padding:'8px', borderRadius:'10px', background: formData.isPrivate ? '#e0f2fe' : '#f1f5f9', color: formData.isPrivate ? '#0284c7' : '#64748b'}}>{formData.isPrivate ? <Lock size={20}/> : <Unlock size={20}/>}</div>
                                    <div><div style={{fontSize:'14px', fontWeight:'700', color:'#1e293b'}}>{formData.isPrivate ? "Private Room" : "Shared Room"}</div><div style={{fontSize:'12px', color:'#64748b'}}>{formData.isPrivate ? "Entire room booking (Higher Cost)" : "Individual bed booking"}</div></div>
                                </div>
                                <div style={s.toggleContainer(formData.isPrivate)}><div style={s.toggleCircle(formData.isPrivate)}></div></div>
                            </div>
                        </div>
                    </div>
                    {isEditMode && (
                        <div style={{marginTop: '10px', borderTop:'1px dashed #e2e8f0', paddingTop:'20px'}}>
                            <div style={s.sectionLabel}>4. Admin Notes</div>
                            <div style={s.inputGroup}>
                                <label style={s.label}>Room Comment / Status</label>
                                <textarea style={{...s.input, minHeight:'80px', resize:'vertical', fontFamily:'inherit', lineHeight:'1.5'}} placeholder="Add a special note about this room (e.g. 'Under Maintenance', 'Reserved for Staff', 'AC Issue'). This will appear in the room list." value={formData.comment} onChange={e => setFormData({...formData, comment: e.target.value})} />
                            </div>
                        </div>
                    )}
                </div>
                <div style={s.modalFooter}>
                    <button type="button" onClick={() => setIsModalOpen(false)} style={s.cancelBtn}>Cancel</button>
                    <button type="submit" style={s.saveBtn}>{isEditMode ? "Update Changes" : "Save Room"}</button>
                </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageRooms;