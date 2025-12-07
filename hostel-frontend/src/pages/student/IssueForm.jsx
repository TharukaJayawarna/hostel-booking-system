import React, { useState } from 'react';
import api from '../../api/axiosConfig';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const IssueForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    studentName: '',
    studentId: '',
    studentEmail: '',
    studentPhone: '',
    duration: 'ONE_MONTH',
    checkinDate: '',
    checkoutDate: '',
    bank: '',
    paymentDoneDate: '',
    paymentReferenceLast4: '',
    comment: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/issues', formData);
      toast.success("Issue reported successfully! Admin will contact you.");
      navigate('/');
    } catch (error) {
      toast.error("Failed to submit issue. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // --- Improved Styles (Aesthetic & Balanced) ---
  const s = {
    pageContainer: {
      width: '100%',
      minHeight: '100vh',
      padding: '50px 20px',
      backgroundColor: '#dbdce0ff', // Global Background Color
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start', // Starts from top with padding
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      boxSizing: 'border-box'
    },
    card: {
      backgroundColor: '#ffffff',
      padding: '45px',
      borderRadius: '20px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
      border: '1px solid #e5e7eb',
      maxWidth: '750px',
      width: '100%'
    },
    header: {
      textAlign: 'center',
      marginBottom: '40px'
    },
    title: {
      fontSize: '32px',
      fontWeight: '800',
      color: '#1f2937',
      marginBottom: '10px',
      letterSpacing: '-0.5px'
    },
    subtitle: {
      color: '#6b7280',
      fontSize: '16px',
      lineHeight: '1.5'
    },
    sectionTitle: {
      fontSize: '14px',
      fontWeight: '700',
      color: '#2b5c9e',
      textTransform: 'uppercase',
      letterSpacing: '1px',
      borderBottom: '2px solid #f3f4f6',
      paddingBottom: '10px',
      marginBottom: '20px',
      marginTop: '10px'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', // Responsive Grid
      gap: '25px'
    },
    fullWidth: {
      gridColumn: '1 / -1'
    },
    inputGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    },
    label: {
      fontSize: '13px',
      fontWeight: '600',
      color: '#4b5563'
    },
    input: {
      width: '100%',
      padding: '12px 16px',
      borderRadius: '10px',
      border: '1px solid #e5e7eb',
      fontSize: '15px',
      backgroundColor: '#dbdce0ff',
      color: '#1f2937',
      outline: 'none',
      boxSizing: 'border-box',
      transition: 'border-color 0.2s'
    },
    textarea: {
      width: '100%',
      padding: '12px 16px',
      borderRadius: '10px',
      border: '1px solid #e5e7eb',
      fontSize: '15px',
      backgroundColor: '#dbdce0ff',
      color: '#1f2937',
      outline: 'none',
      minHeight: '120px',
      resize: 'vertical',
      boxSizing: 'border-box',
      fontFamily: 'inherit'
    },
    select: {
      width: '100%',
      padding: '12px 16px',
      borderRadius: '10px',
      border: '1px solid #e5e7eb',
      fontSize: '15px',
      backgroundColor: '#dbdce0ff',
      color: '#1f2937',
      outline: 'none',
      boxSizing: 'border-box',
      cursor: 'pointer'
    },
    btnContainer: {
      gridColumn: '1 / -1',
      marginTop: '20px',
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '15px'
    },
    btn: {
      padding: '14px 35px',
      backgroundColor: '#2b5c9e',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'transform 0.2s, background-color 0.2s',
      boxShadow: '0 4px 12px rgba(43, 92, 158, 0.2)'
    },
    cancelBtn: {
      padding: '14px 25px',
      backgroundColor: 'transparent',
      color: '#6b7280',
      border: 'none',
      fontSize: '15px',
      fontWeight: '600',
      cursor: 'pointer'
    }
  };

  return (
    <div style={s.pageContainer}>
      <div style={s.card}>
        <div style={s.header}>
          <h1 style={s.title}>Report an Issue</h1>
          <p style={s.subtitle}>Have you encountered a problem with booking or payment?<br/>Please fill out the details below, and our support team will assist you.</p>
        </div>
        
        <form onSubmit={handleSubmit} style={s.grid}>
          
          {/* Personal Details Section */}
          <div style={s.fullWidth}>
            <h4 style={s.sectionTitle}>👤 Student Information</h4>
          </div>
          
          <div style={s.inputGroup}>
            <label style={s.label}>Full Name</label>
            <input required name="studentName" style={s.input} onChange={handleChange} placeholder="Ex: Kamal Perera" />
          </div>
          <div style={s.inputGroup}>
            <label style={s.label}>Student ID</label>
            <input required name="studentId" style={s.input} onChange={handleChange} placeholder="Ex: IT20001234" />
          </div>
          <div style={s.inputGroup}>
            <label style={s.label}>Email Address</label>
            <input required type="email" name="studentEmail" style={s.input} onChange={handleChange} placeholder="student@university.edu" />
          </div>
          <div style={s.inputGroup}>
            <label style={s.label}>Phone Number</label>
            <input required name="studentPhone" style={s.input} onChange={handleChange} placeholder="07XXXXXXXX" />
          </div>

          {/* Booking Details Section */}
          <div style={s.fullWidth}>
            <h4 style={s.sectionTitle}>📅 Booking & Payment Context</h4>
          </div>

          <div style={s.inputGroup}>
            <label style={s.label}>Check-in Date</label>
            <input type="date" name="checkinDate" style={s.input} onChange={handleChange} />
          </div>
          <div style={s.inputGroup}>
            <label style={s.label}>Check-out Date</label>
            <input type="date" name="checkoutDate" style={s.input} onChange={handleChange} />
          </div>
          
          <div style={s.inputGroup}>
            <label style={s.label}>Duration</label>
            <select name="duration" style={s.select} onChange={handleChange}>
              <option value="ONE_MONTH">1 Month</option>
              <option value="TWO_MONTHS">2 Months</option>
              <option value="UNDER_ONE_MONTH">Less than 1 Month</option>
              <option value="UNDER_TWO_MONTHS">Less than 2 Months</option>
            </select>
          </div>

          <div style={s.inputGroup}>
            <label style={s.label}>Payment Method / Bank</label>
            <input name="bank" style={s.input} onChange={handleChange} placeholder="Ex: PayHere, BOC, Peoples Bank" />
          </div>

          <div style={s.inputGroup}>
            <label style={s.label}>Payment Date</label>
            <input type="date" name="paymentDoneDate" style={s.input} onChange={handleChange} />
          </div>

          <div style={s.inputGroup}>
            <label style={s.label}>Last 4 Digits of Payment Reference</label>
            <input 
                name="paymentReferenceLast4" 
                style={{...s.input, fontFamily: 'monospace', letterSpacing: '2px'}} 
                onChange={handleChange} 
                placeholder="XXXX" 
                maxLength={4}
            />
          </div>
          
          

          {/* Issue Description */}
          <div style={s.fullWidth}>
            <h4 style={s.sectionTitle}>📝 Issue Description</h4>
            <div style={s.inputGroup}>
              <textarea 
                required 
                name="comment" 
                style={s.textarea} 
                onChange={handleChange} 
                placeholder="Please describe your issue in detail here. Include error messages if any." 
              />
            </div>
          </div>

          {/* Buttons */}
          <div style={s.btnContainer}>
            <button type="button" style={s.cancelBtn} onClick={() => navigate('/')}>Cancel</button>
            <button 
              type="submit" 
              style={s.btn} 
              disabled={loading}
              onMouseOver={(e) => !loading && (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseOut={(e) => !loading && (e.currentTarget.style.transform = 'translateY(0)')}
            >
              {loading ? "Submitting..." : "Submit Ticket"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default IssueForm;