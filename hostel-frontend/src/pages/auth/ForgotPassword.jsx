import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { useNotification } from '../../context/NotificationContext';
import { Mail, Lock, KeyRound, ArrowRight, Loader2, CheckCircle } from 'lucide-react';

const ForgotPassword = () => {
    const notify = useNotification();
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email, 2: OTP & Reset
  const [loading, setLoading] = useState(false);
  
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Step 1: Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      notify.success("OTP Sent! Check your email.");
      setStep(2);
    } catch (error) {
      notify.error(error.response?.data?.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify & Reset
  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { email, otp, newPassword });
      notify.success("Password Changed Successfully!");
      navigate('/login');
    } catch (error) {
      notify.error(error.response?.data?.message || "Reset failed.");
    } finally {
      setLoading(false);
    }
  };

  const s = {
    container: { minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc', fontFamily: "'Inter', sans-serif" },
    card: { width: '100%', maxWidth: '400px', backgroundColor: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' },
    title: { fontSize: '24px', fontWeight: '800', color: '#1e293b', marginBottom: '10px', textAlign:'center' },
    subtitle: { fontSize: '14px', color: '#64748b', textAlign:'center', marginBottom:'30px' },
    inputGroup: { marginBottom: '20px' },
    inputWrapper: { display: 'flex', alignItems: 'center', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px', backgroundColor: '#f8fafc' },
    input: { border: 'none', background: 'transparent', outline: 'none', marginLeft: '10px', width: '100%', fontSize: '14px' },
    btn: { width: '100%', padding: '14px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', display:'flex', justifyContent:'center', alignItems:'center', gap:'8px' }
  };

  return (
    <div style={s.container}>
      <div style={s.card}>
        {step === 1 ? (
          <form onSubmit={handleSendOtp}>
            <div style={s.title}>Forgot Password?</div>
            <p style={s.subtitle}>Enter your email to receive a verification code.</p>
            
            <div style={s.inputGroup}>
              <div style={s.inputWrapper}>
                <Mail size={18} color="#64748b"/>
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  style={s.input} 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                />
              </div>
            </div>

            <button type="submit" style={s.btn} disabled={loading}>
              {loading ? <Loader2 className="animate-spin" size={20}/> : <>Send OTP <ArrowRight size={18}/></>}
            </button>
          </form>
        ) : (
          <form onSubmit={handleReset}>
            <div style={s.title}>Reset Password</div>
            <p style={s.subtitle}>Enter the OTP sent to {email}</p>

            <div style={s.inputGroup}>
              <div style={s.inputWrapper}>
                <KeyRound size={18} color="#64748b"/>
                <input 
                  type="text" 
                  placeholder="Enter 6-digit OTP" 
                  style={{...s.input, letterSpacing: '2px', fontWeight: 'bold'}} 
                  value={otp} 
                  onChange={(e) => setOtp(e.target.value)} 
                  maxLength={6}
                  required 
                />
              </div>
            </div>

            <div style={s.inputGroup}>
              <div style={s.inputWrapper}>
                <Lock size={18} color="#64748b"/>
                <input 
                  type="password" 
                  placeholder="New Password" 
                  style={s.input} 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  required 
                />
              </div>
            </div>

            <button type="submit" style={{...s.btn, backgroundColor:'#16a34a'}} disabled={loading}>
              {loading ? <Loader2 className="animate-spin" size={20}/> : <>Reset Password <CheckCircle size={18}/></>}
            </button>
          </form>
        )}
        
        <div style={{textAlign:'center', marginTop:'20px'}}>
            <span style={{fontSize:'13px', color:'#64748b', cursor:'pointer'}} onClick={() => navigate('/login')}>Back to Login</span>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;