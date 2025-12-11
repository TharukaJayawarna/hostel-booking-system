import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { useNotification } from '../../context/NotificationContext';
import { LogIn, User, Lock, ArrowRight, Loader2 } from 'lucide-react';

const Login = () => {
  const notify = useNotification();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  // Input Focus States for Styling
  const [focusedInput, setFocusedInput] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/auth/login', formData);
      
      if (response.data.status === 'SUCCESS') {
        const user = response.data.data;
        localStorage.setItem('user', JSON.stringify(user));
        notify.success(`Welcome back, ${user.firstName}!`);
        
        if (user.role === 'ADMIN') {
          navigate('/admin/dashboard');
        } else if (user.role === 'WARDEN') {
          navigate('/admin/dashboard');
        }else{
            navigate('/');
        }
      }
    } catch (error) {
      notify.error(error.response?.data?.message || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  // --- MODERN STYLES ---
  const s = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      backgroundColor: 'white',
      fontFamily: "'Inter', sans-serif",
    },
    // Left Side (Image Area)
    imageSection: {
      flex: '1.2',
      position: 'relative',
      backgroundColor: '#1e293b',
      backgroundImage: 'url("https://images.unsplash.com/photo-1555854877-bab0e564b8d5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80")', // High quality hostel/building image
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-end',
      padding: '60px',
      color: 'white',
      // Mobile waladi image eka hide karanna puluwan (CSS media queries nathi nisa inline logic danna wenawa, eth meka desktop focus design ekak)
    },
    overlay: {
      position: 'absolute',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.3) 100%)',
      zIndex: 1
    },
    imageContent: {
      position: 'relative',
      zIndex: 2,
      maxWidth: '500px'
    },
    brandTitle: { fontSize: '36px', fontWeight: '800', marginBottom: '15px', lineHeight: '1.2' },
    brandDesc: { fontSize: '16px', color: '#cbd5e1', lineHeight: '1.6' },

    // Right Side (Form Area)
    formSection: {
      flex: '1',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px',
      backgroundColor: 'white'
    },
    formWrapper: {
      width: '100%',
      maxWidth: '420px',
    },
    
    // Header
    header: { marginBottom: '40px' },
    title: { fontSize: '30px', fontWeight: '800', color: '#0f172a', marginBottom: '10px' },
    subTitle: { fontSize: '15px', color: '#64748b' },

    // Inputs
    inputGroup: { marginBottom: '20px' },
    label: { display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: '#334155' },
    inputContainer: (isFocused) => ({
      display: 'flex',
      alignItems: 'center',
      border: `1.5px solid ${isFocused ? '#4f46e5' : '#e2e8f0'}`, // Focus unama border eka blue wenawa
      borderRadius: '12px',
      backgroundColor: isFocused ? 'white' : '#f8fafc',
      transition: 'all 0.2s ease',
      boxShadow: isFocused ? '0 0 0 4px rgba(79, 70, 229, 0.1)' : 'none'
    }),
    iconBox: {
      padding: '0 16px',
      color: '#64748b',
      display: 'flex',
      alignItems: 'center'
    },
    input: {
      width: '100%',
      padding: '14px 16px 14px 0',
      border: 'none',
      background: 'transparent',
      outline: 'none',
      fontSize: '15px',
      color: '#1e293b',
      fontWeight: '500'
    },

    // Button
    button: {
      width: '100%',
      padding: '14px',
      backgroundColor: '#4f46e5', // Indigo-600
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      fontSize: '15px',
      fontWeight: '700',
      cursor: 'pointer',
      marginTop: '10px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px',
      transition: 'transform 0.1s ease, background-color 0.2s',
      boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.3)'
    },
    
    // Footer
    footer: { marginTop: '30px', textAlign: 'center', fontSize: '14px', color: '#64748b' },
    link: { color: '#4f46e5', fontWeight: '700', textDecoration: 'none', marginLeft: '5px' }
  };

  return (
    <div style={s.container}>
      
      {/* LEFT SIDE - Branding Image */}
      {/* Note: Window width eka podi unama meka hide karanna CSS media query ekak use karanna puluwan, nathnam inline style walin window width check karanna one */}
      <div style={s.imageSection} className="hidden-on-mobile">
        <div style={s.overlay}></div>
        <div style={s.imageContent}>
          <h1 style={s.brandTitle}>Seamless Hostel Management System</h1>
          <p style={s.brandDesc}>
            Experience the future of student accommodation. Manage bookings, payments, and facilities all in one place with efficiency and ease.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE - Login Form */}
      <div style={s.formSection}>
        <div style={s.formWrapper}>
          
          <div style={s.header}>
            <h2 style={s.title}>Welcome back</h2>
            <p style={s.subTitle}>Please enter your details to sign in.</p>
          </div>

          <form onSubmit={handleSubmit}>
            
            {/* Username Input */}
            <div style={s.inputGroup}>
              <label style={s.label}>Username</label>
              <div style={s.inputContainer(focusedInput === 'username')}>
                <div style={s.iconBox}><User size={20} /></div>
                <input 
                  name="username" 
                  style={s.input} 
                  placeholder="Enter your username" 
                  onChange={handleChange} 
                  onFocus={() => setFocusedInput('username')}
                  onBlur={() => setFocusedInput(null)}
                  required 
                />
              </div>
            </div>

            {/* Password Input */}
            <div style={s.inputGroup}>
              <label style={s.label}>Password</label>
              <div style={s.inputContainer(focusedInput === 'password')}>
                <div style={s.iconBox}><Lock size={20} /></div>
                <input 
                  type="password" 
                  name="password" 
                  style={s.input} 
                  placeholder="••••••••" 
                  onChange={handleChange}
                  onFocus={() => setFocusedInput('password')}
                  onBlur={() => setFocusedInput(null)} 
                  required 
                />
              </div>
            </div>

            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'25px'}}>
               <label style={{display:'flex', alignItems:'center', gap:'8px', fontSize:'13px', color:'#64748b', cursor:'pointer'}}>
                  <input type="checkbox" style={{accentColor:'#4f46e5', width:'16px', height:'16px'}}/> Remember me
               </label>
               <Link to="/forgot-password" style={{fontSize:'13px', color:'#4f46e5', fontWeight:'600', cursor:'pointer', textDecoration:'none'}}>Forgot password?</Link>
            </div>

            <button 
              type="submit" 
              style={{...s.button, opacity: loading ? 0.7 : 1}} 
              disabled={loading}
              onMouseOver={(e) => !loading && (e.currentTarget.style.backgroundColor = '#4338ca')}
              onMouseOut={(e) => !loading && (e.currentTarget.style.backgroundColor = '#4f46e5')}
            >
              {loading ? <Loader2 className="animate-spin" size={20}/> : <>Sign in <ArrowRight size={20}/></>}
            </button>

            <div style={s.footer}>
              Don't have an account? 
              <Link to="/signup" style={s.link}>Create account</Link>
            </div>

          </form>
        </div>
      </div>

      {/* Simple Media Query helper using style tag for hiding image on mobile */}
      <style>{`
        @media (max-width: 900px) {
          .hidden-on-mobile { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default Login;