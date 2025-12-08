import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { toast } from 'react-toastify';
import { LogIn, User, Lock } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

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
        
        // Save user details to localStorage (or Context)
        localStorage.setItem('user', JSON.stringify(user));
        
        toast.success(`Welcome back, ${user.firstName}!`);
        
        // Redirect based on role
        if (user.role === 'ADMIN') {
          navigate('/admin/dashboard');
        } else {
          navigate('/');
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  // Styles
  const s = {
    container: { height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6' },
    card: { width: '100%', maxWidth: '400px', background: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' },
    title: { fontSize: '24px', fontWeight: '800', textAlign: 'center', marginBottom: '30px', color: '#111827' },
    inputGroup: { marginBottom: '20px' },
    label: { display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#374151' },
    inputWrapper: { position: 'relative', display: 'flex', alignItems: 'center' },
    icon: { position: 'absolute', left: '12px', color: '#9ca3af' },
    input: { width: '100%', padding: '12px 12px 12px 40px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', fontSize: '14px', transition: 'border 0.2s', boxSizing: 'border-box' },
    button: { width: '100%', padding: '12px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', marginTop: '10px' },
    footer: { marginTop: '20px', textAlign: 'center', fontSize: '14px', color: '#6b7280' },
    link: { color: '#4f46e5', fontWeight: '600', textDecoration: 'none' }
  };

  return (
    <div style={s.container}>
      <form style={s.card} onSubmit={handleSubmit}>
        <h2 style={s.title}>Sign In</h2>
        
        <div style={s.inputGroup}>
          <label style={s.label}>Username</label>
          <div style={s.inputWrapper}>
            <User size={18} style={s.icon}/>
            <input 
              name="username" 
              style={s.input} 
              placeholder="Enter your username" 
              onChange={handleChange} 
              required 
            />
          </div>
        </div>

        <div style={s.inputGroup}>
          <label style={s.label}>Password</label>
          <div style={s.inputWrapper}>
            <Lock size={18} style={s.icon}/>
            <input 
              type="password" 
              name="password" 
              style={s.input} 
              placeholder="••••••••" 
              onChange={handleChange} 
              required 
            />
          </div>
        </div>

        <button type="submit" style={s.button} disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>

        <div style={s.footer}>
          Don't have an account? <Link to="/signup" style={s.link}>Sign up</Link>
        </div>
      </form>
    </div>
  );
};

export default Login;