import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { toast } from 'react-toastify';
import { User, Mail, Phone, Lock, Type, ArrowRight, Loader2, CheckCircle, Wifi, ShieldCheck, Coffee } from 'lucide-react';

const Signup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    contactNumber: '',
    username: '',
    password: '',
    role: 'STUDENT'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/auth/register', formData);
      toast.success("Registration Successful! Please login.");
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  // --- STYLES ---
  const s = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      backgroundColor: 'white',
      fontFamily: "'Inter', sans-serif",
    },
    // --- LEFT SIDE (Updated) ---
    imageSection: {
      flex: '1',
      position: 'relative',
      backgroundColor: '#0f172a', // Darker slate
      // Modern clean interior image
      backgroundImage: 'url("https://images.unsplash.com/photo-1555854877-bab0e564b8d5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80")', 
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '60px',
      color: 'white',
    },
    overlay: {
      position: 'absolute',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'linear-gradient(to right, rgba(15, 23, 42, 0.9) 0%, rgba(15, 23, 42, 0.7) 100%)', // Dark overlay
      zIndex: 1
    },
    imageContent: {
      position: 'relative',
      zIndex: 2,
    },
    
    // New Feature List Styles
    featureList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '30px',
      marginTop: 'auto'
    },
    featureItem: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '15px'
    },
    featureIconBox: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      padding: '12px',
      borderRadius: '12px',
      color: '#818cf8', // Indigo light
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    },
    featureText: {
      display: 'flex', flexDirection: 'column', gap: '4px'
    },
    featureTitle: { fontSize: '16px', fontWeight: '700', color: 'white' },
    featureDesc: { fontSize: '13px', color: '#94a3b8', lineHeight: '1.4' },

    // --- RIGHT SIDE (Form) ---
    formSection: {
      flex: '1.2',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px',
      backgroundColor: 'white',
      overflowY: 'auto'
    },
    formWrapper: { width: '100%', maxWidth: '520px' },
    header: { marginBottom: '30px' },
    title: { fontSize: '32px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' },
    subTitle: { fontSize: '15px', color: '#64748b' },
    gridRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
    inputGroup: { marginBottom: '18px' },
    label: { display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#334155' },
    inputContainer: (isFocused) => ({
      display: 'flex',
      alignItems: 'center',
      border: `1.5px solid ${isFocused ? '#4f46e5' : '#e2e8f0'}`,
      borderRadius: '10px',
      backgroundColor: isFocused ? 'white' : '#f8fafc',
      transition: 'all 0.2s ease',
      boxShadow: isFocused ? '0 0 0 4px rgba(79, 70, 229, 0.1)' : 'none'
    }),
    iconBox: { padding: '0 14px', color: '#64748b', display: 'flex', alignItems: 'center' },
    input: { width: '100%', padding: '12px 14px 12px 0', border: 'none', background: 'transparent', outline: 'none', fontSize: '14px', color: '#1e293b', fontWeight: '500' },
    button: {
      width: '100%', padding: '14px', backgroundColor: '#4f46e5', color: 'white',
      border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '700',
      cursor: 'pointer', marginTop: '15px', display: 'flex', alignItems: 'center',
      justifyContent: 'center', gap: '8px', transition: 'background-color 0.2s',
      boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.2)'
    },
    footer: { marginTop: '25px', textAlign: 'center', fontSize: '14px', color: '#64748b' },
    link: { color: '#4f46e5', fontWeight: '700', textDecoration: 'none', marginLeft: '5px' }
  };

  return (
    <div style={s.container}>
      
      {/* LEFT SIDE - Features Section */}
      <div style={s.imageSection} className="hidden-on-mobile">
        <div style={s.overlay}></div>
        
        {/* Brand Top Left */}
        <div style={s.imageContent}>
          <div style={{fontSize: '24px', fontWeight: 'bold', display:'flex', alignItems:'center', gap:'10px'}}>
             <div style={{width:'32px', height:'32px', background:'#4f46e5', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', color:'white'}}>H</div>
             Hostel PMS
          </div>
        </div>
        
        {/* Features List Bottom Left */}
        <div style={{...s.imageContent, marginTop:'auto'}}>
          <h2 style={{fontSize:'28px', fontWeight:'800', marginBottom:'30px', lineHeight:'1.2'}}>
            More than just a place<br/>to sleep.
          </h2>
          
          <div style={s.featureList}>
            {/* Feature 1 */}
            <div style={s.featureItem}>
              <div style={s.featureIconBox}><Wifi size={20}/></div>
              <div style={s.featureText}>
                <span style={s.featureTitle}>High-Speed WiFi</span>
                <span style={s.featureDesc}>Stay connected with fiber internet access in all rooms and study areas.</span>
              </div>
            </div>

            {/* Feature 2 */}
            <div style={s.featureItem}>
              <div style={s.featureIconBox}><ShieldCheck size={20}/></div>
              <div style={s.featureText}>
                <span style={s.featureTitle}>24/7 Security</span>
                <span style={s.featureDesc}>Your safety is our priority with round-the-clock surveillance and support.</span>
              </div>
            </div>

            {/* Feature 3 */}
            <div style={s.featureItem}>
              <div style={s.featureIconBox}><Coffee size={20}/></div>
              <div style={s.featureText}>
                <span style={s.featureTitle}>Modern Common Areas</span>
                <span style={s.featureDesc}>Spacious lounges and study rooms designed for student life.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - Signup Form */}
      <div style={s.formSection}>
        <div style={s.formWrapper}>
          
          <div style={s.header}>
            <h2 style={s.title}>Create an account</h2>
            <p style={s.subTitle}>Join the community today! Enter your details below.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={s.gridRow}>
                <div style={s.inputGroup}>
                    <label style={s.label}>First Name</label>
                    <div style={s.inputContainer(focusedInput === 'firstName')}>
                        <div style={s.iconBox}><Type size={18}/></div>
                        <input name="firstName" style={s.input} placeholder="John" onChange={handleChange} onFocus={() => setFocusedInput('firstName')} onBlur={() => setFocusedInput(null)} required />
                    </div>
                </div>
                <div style={s.inputGroup}>
                    <label style={s.label}>Last Name</label>
                    <div style={s.inputContainer(focusedInput === 'lastName')}>
                        <div style={s.iconBox}><Type size={18}/></div>
                        <input name="lastName" style={s.input} placeholder="Doe" onChange={handleChange} onFocus={() => setFocusedInput('lastName')} onBlur={() => setFocusedInput(null)} required />
                    </div>
                </div>
            </div>

            <div style={s.inputGroup}>
              <label style={s.label}>Email Address</label>
              <div style={s.inputContainer(focusedInput === 'email')}>
                <div style={s.iconBox}><Mail size={18} /></div>
                <input type="email" name="email" style={s.input} placeholder="john.doe@university.edu" onChange={handleChange} onFocus={() => setFocusedInput('email')} onBlur={() => setFocusedInput(null)} required />
              </div>
            </div>

            <div style={s.gridRow}>
                <div style={s.inputGroup}>
                    <label style={s.label}>Phone Number</label>
                    <div style={s.inputContainer(focusedInput === 'contactNumber')}>
                        <div style={s.iconBox}><Phone size={18}/></div>
                        <input name="contactNumber" style={s.input} placeholder="0771234567" onChange={handleChange} onFocus={() => setFocusedInput('phone')} onBlur={() => setFocusedInput(null)} required />
                    </div>
                </div>
                <div style={s.inputGroup}>
                    <label style={s.label}>Username</label>
                    <div style={s.inputContainer(focusedInput === 'username')}>
                        <div style={s.iconBox}><User size={18}/></div>
                        <input name="username" style={s.input} placeholder="johndoe" onChange={handleChange} onFocus={() => setFocusedInput('username')} onBlur={() => setFocusedInput(null)} required />
                    </div>
                </div>
            </div>

            <div style={s.inputGroup}>
              <label style={s.label}>Password</label>
              <div style={s.inputContainer(focusedInput === 'password')}>
                <div style={s.iconBox}><Lock size={18} /></div>
                <input type="password" name="password" style={s.input} placeholder="••••••••" onChange={handleChange} onFocus={() => setFocusedInput('password')} onBlur={() => setFocusedInput(null)} required />
              </div>
              <p style={{fontSize:'11px', color:'#94a3b8', marginTop:'5px'}}>Must be at least 8 characters long.</p>
            </div>

            <button type="submit" style={{...s.button, opacity: loading ? 0.7 : 1}} disabled={loading} onMouseOver={(e) => !loading && (e.currentTarget.style.backgroundColor = '#4338ca')} onMouseOut={(e) => !loading && (e.currentTarget.style.backgroundColor = '#4f46e5')}>
              {loading ? <Loader2 className="animate-spin" size={20}/> : <>Create Account <ArrowRight size={18}/></>}
            </button>

            <div style={s.footer}>
              Already have an account? <Link to="/login" style={s.link}>Log in</Link>
            </div>
          </form>
        </div>
      </div>

      <style>{`@media (max-width: 900px) { .hidden-on-mobile { display: none !important; } }`}</style>
    </div>
  );
};

export default Signup;