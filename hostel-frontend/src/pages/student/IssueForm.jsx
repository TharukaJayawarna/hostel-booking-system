import React, { useState, useEffect } from 'react'; // 1. useEffect import kala
import api from '../../api/axiosConfig';
import { useNotification } from '../../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Phone, 
  CreditCard, 
  Calendar, 
  FileText, 
  Send, 
  ArrowLeft, 
  AlertCircle, 
  Building2, 
  Hash,
  Loader2
} from 'lucide-react';

const IssueForm = () => {
  const notify = useNotification();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    studentName: '',
    studentId: '',
    studentEmail: '',
    studentPhone: '',
    duration: '1 Month', // Default value set kala
    checkinDate: '',
    checkoutDate: '',
    bank: '',
    paymentDoneDate: '',
    cardLastFour: '',
    comment: ''
  });

  // --- 2. NEW: USER DATA AUTO FILL LOGIC ---
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            setFormData(prev => ({
                ...prev,
                studentName: (user.firstName || '') + ' ' + (user.lastName || ''),
                studentEmail: user.email || '',
                studentPhone: user.phone || ''
            }));
        } catch (e) {
            console.error("Error parsing user data", e);
        }
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/issues', formData);
      notify.success("Issue reported successfully! Admin will contact you.");
      navigate('/');
    } catch (error) {
      notify.error("Failed to submit issue. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const s = {
    pageContainer: {
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      fontFamily: "'Inter', sans-serif",
      padding: '60px 20px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start'
    },
    innerWrapper: { maxWidth: '850px', width: '100%' },
    header: { marginBottom: '5px', textAlign: 'center', position: 'relative' },
    backBtn: {
      position: 'absolute', left: 0, top: '10px',
      display: 'inline-flex', alignItems: 'center', gap: '6px',
      background: 'white', border: '1px solid #e2e8f0',
      color: '#64748b', fontSize: '13px', fontWeight: '600',
      cursor: 'pointer', padding: '8px 16px', borderRadius: '20px',
      transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
    },
    titleBox: { display: 'inline-block' },
    title: { fontSize: '32px', fontWeight: '800', color: '#1e293b', marginBottom: '8px', letterSpacing: '-0.5px' },
    subTitle: { fontSize: '15px', color: '#64748b' },
    card: {
      backgroundColor: 'white', borderRadius: '24px', padding: '40px 50px',
      boxShadow: '0 10px 30px -5px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0'
    },
    sectionTitle: {
      fontSize: '16px', fontWeight: '700', color: '#0f172a',
      marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px',
      paddingBottom: '10px', borderBottom: '1px solid #f1f5f9'
    },
    sectionIcon: { color: '#4f46e5' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '30px' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
    label: { fontSize: '12px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' },
    inputWrapper: { position: 'relative', display: 'flex', alignItems: 'center' },
    inputIcon: { position: 'absolute', left: '16px', color: '#94a3b8', pointerEvents: 'none' },
    input: {
      width: '100%', padding: '12px 16px 12px 45px', borderRadius: '12px',
      border: '1px solid #e2e8f0', fontSize: '14px', color: '#1e293b',
      outline: 'none', transition: 'all 0.2s', backgroundColor: '#f8fafc', // Changed slightly for read-only feel if needed
      boxSizing: 'border-box'
    },
    select: {
      width: '100%', padding: '12px 16px 12px 16px', borderRadius: '12px',
      border: '1px solid #e2e8f0', fontSize: '14px', color: '#1e293b',
      outline: 'none', backgroundColor: '#f8fafc', cursor: 'pointer',
      boxSizing: 'border-box'
    },
    textarea: {
      width: '100%', padding: '16px', borderRadius: '12px',
      border: '1px solid #e2e8f0', fontSize: '14px', color: '#1e293b',
      outline: 'none', backgroundColor: '#f8fafc', minHeight: '120px',
      resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box'
    },
    btnContainer: { display: 'flex', justifyContent: 'flex-end', gap: '15px', marginTop: '10px' },
    submitBtn: {
      padding: '14px 32px', background: '#4f46e5', color: 'white',
      border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '700',
      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
      boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)', transition: 'transform 0.2s'
    },
    cancelBtn: {
      padding: '14px 24px', background: 'white', color: '#64748b',
      border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '15px',
      fontWeight: '600', cursor: 'pointer'
    }
  };

  return (
    <div style={s.pageContainer}>
      <div style={s.innerWrapper}>
        <div style={s.header}>
          <button style={s.backBtn} onClick={() => navigate('/')} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f1f5f9'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'white'}><ArrowLeft size={16}/> Back Home</button>
          <div style={s.titleBox}>
            <h1 style={s.title}>Report an Issue</h1>
            <p style={s.subTitle}>Facing a problem? Let us know and we'll fix it.</p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} style={s.card}>
          {/* 1. Student Info */}
          <div style={s.sectionTitle}><User size={20} style={s.sectionIcon}/> Student Information</div>
          <div style={s.grid}>
            <div style={s.inputGroup}>
              <label style={s.label}>Full Name</label>
              <div style={s.inputWrapper}>
                <User size={18} style={s.inputIcon}/>
                {/* 3. Added value={formData.xxx} to all inputs */}
                <input name="studentName" required value={formData.studentName} onChange={handleChange} style={s.input} placeholder="Kamal Perera" />
              </div>
            </div>
            <div style={s.inputGroup}>
              <label style={s.label}>Student ID / Reg No</label>
              <div style={s.inputWrapper}>
                <Hash size={18} style={s.inputIcon}/>
                <input name="studentId" required value={formData.studentId} onChange={handleChange} style={s.input} placeholder="IT20001234" />
              </div>
            </div>
            <div style={s.inputGroup}>
              <label style={s.label}>Email Address</label>
              <div style={s.inputWrapper}>
                <Mail size={18} style={s.inputIcon}/>
                <input type="email" name="studentEmail" required value={formData.studentEmail} onChange={handleChange} style={s.input} placeholder="student@university.edu" />
              </div>
            </div>
            <div style={s.inputGroup}>
              <label style={s.label}>Phone Number</label>
              <div style={s.inputWrapper}>
                <Phone size={18} style={s.inputIcon}/>
                <input name="studentPhone" required value={formData.studentPhone} onChange={handleChange} style={s.input} placeholder="077xxxxxxx" />
              </div>
            </div>
          </div>

          {/* 2. Reservation Context */}
          <div style={s.sectionTitle}><Calendar size={20} style={s.sectionIcon}/> Booking & Payment Details</div>
          <div style={s.grid}>
            <div style={s.inputGroup}>
              <label style={s.label}>Check-in Date</label>
              <div style={s.inputWrapper}>
                <Calendar size={18} style={s.inputIcon}/>
                <input type="date" name="checkinDate" value={formData.checkinDate} style={s.input} onChange={handleChange} />
              </div>
            </div>
            <div style={s.inputGroup}>
              <label style={s.label}>Check-out Date</label>
              <div style={s.inputWrapper}>
                <Calendar size={18} style={s.inputIcon}/>
                <input type="date" name="checkoutDate" value={formData.checkoutDate} style={s.input} onChange={handleChange} />
              </div>
            </div>
            
            <div style={s.inputGroup}>
              <label style={s.label}>Duration</label>
              <select name="duration" value={formData.duration} style={s.select} onChange={handleChange}>
                <option value="1 Month">1 Month</option>
                <option value="2 Months">2 Months</option>
                <option value="3 Months">3 Months</option>
                <option value="Less than 1 Month">Less than 1 Month</option>
                <option value="Less than 2 Months">Less than 2 Months</option>
                <option value="Less than 3 Month">Less than 3 Months</option>
              </select>
            </div>

            <div style={s.inputGroup}>
              <label style={s.label}>Bank / Payment Method</label>
              <div style={s.inputWrapper}>
                <Building2 size={18} style={s.inputIcon}/>
                <input name="bank" value={formData.bank} style={s.input} onChange={handleChange} placeholder="e.g. PayHere, BOC" />
              </div>
            </div>

            <div style={s.inputGroup}>
              <label style={s.label}>Payment Date</label>
              <div style={s.inputWrapper}>
                <Calendar size={18} style={s.inputIcon}/>
                <input type="date" name="paymentDoneDate" value={formData.paymentDoneDate} style={s.input} onChange={handleChange} />
              </div>
            </div>

            <div style={s.inputGroup}>
              <label style={s.label}>Last 4 Digits (Reference)</label>
              <div style={s.inputWrapper}>
                <CreditCard size={18} style={s.inputIcon}/>
                <input name="cardLastFour" value={formData.cardLastFour} style={{...s.input, fontFamily: 'monospace', letterSpacing: '1px'}} onChange={handleChange} placeholder="XXXX" maxLength={4} />
              </div>
            </div>
          </div>

          {/* 3. Issue Description */}
          <div style={s.sectionTitle}><AlertCircle size={20} style={{...s.sectionIcon, color:'#ef4444'}}/> Describe Your Issue</div>
          <div style={{marginBottom:'30px'}}>
            <div style={s.inputGroup}>
              <label style={s.label}>Detailed Description</label>
              <textarea required name="comment" value={formData.comment} style={s.textarea} onChange={handleChange} placeholder="Please explain the issue clearly..." />
            </div>
          </div>

          <div style={s.btnContainer}>
            <button type="button" style={s.cancelBtn} onClick={() => navigate('/')}>Cancel</button>
            <button type="submit" style={{...s.submitBtn, opacity: loading ? 0.7 : 1}} disabled={loading}>
              {loading ? <Loader2 size={18} className="animate-spin"/> : <Send size={18}/>}
              {loading ? "Sending..." : "Submit Ticket"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default IssueForm;