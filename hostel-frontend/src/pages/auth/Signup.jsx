import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { toast } from 'react-toastify';
import { User, Mail, Phone, Lock, Type } from 'lucide-react';

const Signup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    username: '',
    password: '',
    role: 'STUDENT' // Default role
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

  // Reusing similar styles
  const s = {
    container: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6', padding: '20px' },
    card: { width: '100%', maxWidth: '500px', background: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' },
    title: { fontSize: '24px', fontWeight: '800', textAlign: 'center', marginBottom: '30px', color: '#111827' },
    grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' },
    inputGroup: { marginBottom: '15px' },
    label: { display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#374151' },
    inputWrapper: { position: 'relative', display: 'flex', alignItems: 'center' },
    icon: { position: 'absolute', left: '12px', color: '#9ca3af' },
    input: { width: '100%', padding: '10px 10px 10px 38px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', fontSize: '14px', boxSizing: 'border-box' },
    button: { width: '100%', padding: '12px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', marginTop: '10px' },
    footer: { marginTop: '20px', textAlign: 'center', fontSize: '14px', color: '#6b7280' },
    link: { color: '#4f46e5', fontWeight: '600', textDecoration: 'none' }
  };

  return (
    <div style={s.container}>
      <form style={s.card} onSubmit={handleSubmit}>
        <h2 style={s.title}>Create Account</h2>
        
        <div style={s.grid}>
          <div style={s.inputGroup}>
            <label style={s.label}>First Name</label>
            <div style={s.inputWrapper}>
              <Type size={16} style={s.icon}/>
              <input name="firstName" style={s.input} onChange={handleChange} required />
            </div>
          </div>
          <div style={s.inputGroup}>
            <label style={s.label}>Last Name</label>
            <div style={s.inputWrapper}>
              <Type size={16} style={s.icon}/>
              <input name="lastName" style={s.input} onChange={handleChange} required />
            </div>
          </div>
        </div>

        <div style={s.inputGroup}>
          <label style={s.label}>Email Address</label>
          <div style={s.inputWrapper}>
            <Mail size={16} style={s.icon}/>
            <input type="email" name="email" style={s.input} onChange={handleChange} required />
          </div>
        </div>

        <div style={s.inputGroup}>
          <label style={s.label}>Phone Number</label>
          <div style={s.inputWrapper}>
            <Phone size={16} style={s.icon}/>
            <input name="phone" style={s.input} onChange={handleChange} required />
          </div>
        </div>

        <div style={s.inputGroup}>
          <label style={s.label}>Username</label>
          <div style={s.inputWrapper}>
            <User size={16} style={s.icon}/>
            <input name="username" style={s.input} onChange={handleChange} required />
          </div>
        </div>

        <div style={s.inputGroup}>
          <label style={s.label}>Password</label>
          <div style={s.inputWrapper}>
            <Lock size={16} style={s.icon}/>
            <input type="password" name="password" style={s.input} onChange={handleChange} required />
          </div>
        </div>

        <button type="submit" style={s.button} disabled={loading}>
          {loading ? 'Creating Account...' : 'Sign Up'}
        </button>

        <div style={s.footer}>
          Already have an account? <Link to="/login" style={s.link}>Sign in</Link>
        </div>
      </form>
    </div>
  );
};

export default Signup;