import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { toast } from 'react-toastify';
import { 
  User, Mail, Phone, MapPin, CreditCard, Calendar, 
  BedDouble, ShieldCheck, ArrowLeft, Loader2, Building2, CheckCircle2, AlertTriangle
} from 'lucide-react';

const Reservation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // 1. මෙතන reservedFor (Room Gender) එක ලබා ගන්නවා
  const { bedId, bedNumber, roomNumber, checkIn, checkOut, reservedFor } = location.state || {};

  const [formData, setFormData] = useState({
    studentName: '',
    registrationNumber: '',
    email: '',
    phone: '',
    address: '',
    gender: 'MALE'
  });

  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [priceLoading, setPriceLoading] = useState(true);

  useEffect(() => {
    if (!bedId || !checkIn || !checkOut) {
      toast.error("Invalid booking details.");
      navigate('/');
      return;
    }
    fetchPrice();
  }, [bedId, checkIn, checkOut]);

  const fetchPrice = async () => {
    setPriceLoading(true);
    try {
      const response = await api.get(`/reservations/calculate`, {
        params: { bedId, fromDate: checkIn, toDate: checkOut },
        headers: { 'X-Api-Version': 'v1' }
      });

      if (response.status === 200) {
        setTotalAmount(typeof response.data === 'number' ? response.data : (response.data.data || 0));
      }
    } catch (error) {
      console.error(error);
      toast.error("Error calculating price.");
    } finally {
      setPriceLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePayment = async (e) => {
    e.preventDefault();

    // --- GENDER VALIDATION LOGIC START ---
    if (reservedFor) {
        const studentGender = formData.gender; // "MALE" or "FEMALE"
        // reservedFor values: "BOYS" or "GIRLS"

        if (reservedFor === 'BOYS' && studentGender === 'FEMALE') {
            toast.error("Gender Mismatch! This room is reserved for BOYS only.");
            return; // Stop execution
        }
        
        if (reservedFor === 'GIRLS' && studentGender === 'MALE') {
            toast.error("Gender Mismatch! This room is reserved for GIRLS only.");
            return; // Stop execution
        }
    }
    // --- GENDER VALIDATION LOGIC END ---

    setLoading(true);

    const bookingPayload = {
      ...formData,
      bedId, fromDate: checkIn, toDate: checkOut,
      amount: Number(totalAmount)
    };

    try {
      const response = await api.post('/reservations/initiate', bookingPayload, {
        headers: { 'X-Api-Version': 'v1' }
      });

      if (response.status === 200) {
        openPayHerePopup(response.data.data);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Payment initiation failed.");
      setLoading(false);
    }
  };

  const openPayHerePopup = (data) => {
    if (!window.payhere) {
      toast.error("PayHere SDK not loaded!");
      setLoading(false);
      return;
    }

    const paymentObject = {
      "sandbox": true,
      "merchant_id": data.merchantId,
      "return_url": "http://localhost:5173/payment-success",
      "cancel_url": "http://localhost:5173/payment-cancel",
      "notify_url": "https://ursula-brainy-jessi.ngrok-free.dev/payments/notify", 
      "order_id": data.orderId,
      "items": data.items,
      "amount": data.amount.toFixed(2), 
      "currency": data.currency,
      "hash": data.hash,
      "first_name": data.firstName,
      "last_name": data.lastName,
      "email": data.email,
      "phone": data.phone,
      "address": data.address,
      "city": data.city,
      "country": data.country
    };

    window.payhere.onCompleted = function onCompleted(orderId) {
      setLoading(false);
      toast.success("Booking Confirmed!");
      navigate('/booking-success', { state: { ...formData, orderId, bedNumber, roomNumber, checkIn, checkOut, amount: totalAmount } });
    };

    window.payhere.onDismissed = function onDismissed() {
      setLoading(false);
      toast.warn("Payment Cancelled.");
    };

    window.payhere.onError = function onError(error) {
      setLoading(false);
      toast.error("Payment Error: " + error);
    };

    window.payhere.startPayment(paymentObject);
  };

  // --- STYLES ---
  const s = {
    // Main Layout (Full Screen, No Scroll)
    container: {
      height: '100vh',
      width: '100vw',
      display: 'flex',
      backgroundColor: '#f3f4f6',
      overflow: 'hidden', // Prevents page scrolling
      fontFamily: "'Inter', sans-serif"
    },
    
    // Left Side (Form)
    leftPanel: {
      flex: '1.2',
      padding: '40px 60px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      backgroundColor: '#ffffff',
      boxShadow: '4px 0 24px rgba(0,0,0,0.05)',
      zIndex: 10,
      overflowY: 'auto' // Only form scrolls if screen is very small
    },
    header: { marginBottom: '30px' },
    backBtn: {
      display: 'inline-flex', alignItems: 'center', gap: '8px',
      background: 'transparent', border: 'none',
      color: '#64748b', fontSize: '14px', fontWeight: '600',
      cursor: 'pointer', marginBottom: '15px',
      transition: 'color 0.2s',
      ':hover': { color: '#1e293b' }
    },
    title: { fontSize: '32px', fontWeight: '800', color: '#1e293b', marginBottom: '5px', letterSpacing: '-0.5px' },
    subTitle: { fontSize: '15px', color: '#64748b' },

    // Form
    formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
    inputGroup: { marginBottom: '15px' },
    label: { display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', marginBottom: '6px' },
    inputWrapper: { position: 'relative', display: 'flex', alignItems: 'center' },
    inputIcon: { position: 'absolute', left: '16px', color: '#94a3b8' },
    input: {
      width: '100%', padding: '14px 16px 14px 45px', borderRadius: '12px',
      border: '1px solid #e2e8f0', fontSize: '14px', color: '#1e293b',
      outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s',
      backgroundColor: '#f8fafc', boxSizing: 'border-box'
    },
    select: {
      width: '100%', padding: '14px 16px', borderRadius: '12px',
      border: '1px solid #e2e8f0', fontSize: '14px', color: '#1e293b',
      outline: 'none', backgroundColor: '#f8fafc', cursor: 'pointer',
      boxSizing: 'border-box'
    },

    // Right Side (Summary Card)
    rightPanel: {
      flex: '0.8',
      background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)', // Dark Indigo Gradient
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px',
      position: 'relative',
      overflow: 'hidden'
    },
    // Background Decoration
    bgCircle1: { position: 'absolute', top: '-10%', right: '-10%', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', zIndex: 0 },
    bgCircle2: { position: 'absolute', bottom: '-10%', left: '-10%', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)', zIndex: 0 },

    ticketCard: {
      width: '100%', maxWidth: '420px',
      backgroundColor: 'rgba(255, 255, 255, 0.1)', // Glass Effect
      backdropFilter: 'blur(20px)',
      borderRadius: '24px',
      padding: '35px',
      color: 'white',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
      border: '1px solid rgba(255,255,255,0.1)',
      zIndex: 1,
      position: 'relative'
    },
    ticketHeader: { borderBottom: '1px solid rgba(255,255,255,0.15)', paddingBottom: '20px', marginBottom: '20px' },
    ticketTitle: { fontSize: '18px', fontWeight: '700', letterSpacing: '0.5px', marginBottom: '5px' },
    ticketSub: { fontSize: '13px', opacity: 0.7 },

    // Room Details in Ticket
    roomBox: { 
      background: 'rgba(0,0,0,0.2)', borderRadius: '16px', padding: '15px', 
      display: 'flex', justifyContent: 'space-between', marginBottom: '25px',
      border: '1px solid rgba(255,255,255,0.05)'
    },
    roomItem: { display: 'flex', flexDirection: 'column', gap: '4px' },
    roomLabel: { fontSize: '11px', textTransform: 'uppercase', opacity: 0.6, fontWeight: '700' },
    roomValue: { fontSize: '16px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' },

    // Date Lines
    dateLine: { display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '12px', opacity: 0.9 },
    
    // Total
    totalSection: {
      marginTop: '30px', paddingTop: '20px', borderTop: '1px dashed rgba(255,255,255,0.3)',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center'
    },
    totalLabel: { fontSize: '15px', fontWeight: '600', opacity: 0.9 },
    totalValue: { fontSize: '28px', fontWeight: '800', color: '#4ade80' }, // Green text for price

    payBtn: {
      width: '100%', padding: '16px', marginTop: '25px',
      background: 'white', color: '#1e1b4b', border: 'none', borderRadius: '14px',
      fontSize: '16px', fontWeight: '800', cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
      boxShadow: '0 4px 15px rgba(0,0,0,0.2)', transition: 'transform 0.2s'
    },
    footerNote: { textAlign: 'center', fontSize: '11px', opacity: 0.5, marginTop: '15px', display: 'flex', justifyContent: 'center', gap: '5px' }
  };

  return (
    <div style={s.container}>
      
      {/* --- Left Side: Input Form --- */}
      <div style={s.leftPanel}>
        <div style={s.header}>
          <button style={s.backBtn} onClick={() => navigate(-1)}>
            <ArrowLeft size={18}/> Back to Beds
          </button>
          <h1 style={s.title}>Student Details</h1>
          <p style={s.subTitle}>Please complete your registration to secure your spot.</p>
        </div>

        {/* 2. Warning message if Gender doesn't match room type (Visual Cue) */}
        {reservedFor && (
            <div style={{marginBottom:'20px', padding:'10px 15px', background:'#fffbeb', border:'1px solid #fcd34d', borderRadius:'10px', color:'#b45309', fontSize:'13px', display:'flex', alignItems:'center', gap:'8px'}}>
                <AlertTriangle size={16}/>
                This room is reserved for <strong>{reservedFor}</strong> students only.
            </div>
        )}

        <form onSubmit={handlePayment}>
          <div style={s.formGrid}>
            <div style={s.inputGroup}>
              <label style={s.label}>Full Name</label>
              <div style={s.inputWrapper}>
                <User size={18} style={s.inputIcon}/>
                <input 
                    name="studentName" required onChange={handleInputChange} 
                    style={s.input} placeholder="John Doe" 
                    onFocus={(e) => e.target.style.borderColor = '#4f46e5'}
                    onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                />
              </div>
            </div>
            <div style={s.inputGroup}>
              <label style={s.label}>Student ID</label>
              <div style={s.inputWrapper}>
                <CreditCard size={18} style={s.inputIcon}/>
                <input 
                    name="registrationNumber" required onChange={handleInputChange} 
                    style={s.input} placeholder="ITxxxxxx" 
                    onFocus={(e) => e.target.style.borderColor = '#4f46e5'}
                    onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                />
              </div>
            </div>
          </div>

          <div style={s.formGrid}>
            <div style={s.inputGroup}>
              <label style={s.label}>Email Address</label>
              <div style={s.inputWrapper}>
                <Mail size={18} style={s.inputIcon}/>
                <input 
                    type="email" name="email" required onChange={handleInputChange} 
                    style={s.input} placeholder="student@email.com" 
                    onFocus={(e) => e.target.style.borderColor = '#4f46e5'}
                    onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                />
              </div>
            </div>
            <div style={s.inputGroup}>
              <label style={s.label}>Phone Number</label>
              <div style={s.inputWrapper}>
                <Phone size={18} style={s.inputIcon}/>
                <input 
                    name="phone" required onChange={handleInputChange} 
                    style={s.input} placeholder="07xxxxxxxx" 
                    onFocus={(e) => e.target.style.borderColor = '#4f46e5'}
                    onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                />
              </div>
            </div>
          </div>

          <div style={s.inputGroup}>
            <label style={s.label}>Residential Address</label>
            <div style={s.inputWrapper}>
              <MapPin size={18} style={s.inputIcon}/>
              <input 
                name="address" required onChange={handleInputChange} 
                style={s.input} placeholder="Your home address" 
                onFocus={(e) => e.target.style.borderColor = '#4f46e5'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>
          </div>

          <div style={s.inputGroup}>
            <label style={s.label}>Gender</label>
            <select name="gender" onChange={handleInputChange} value={formData.gender} style={s.select}>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>
          </div>
        </form>
      </div>

      {/* --- Right Side: Ticket Summary --- */}
      <div style={s.rightPanel}>
        <div style={s.bgCircle1}></div>
        <div style={s.bgCircle2}></div>

        <div style={s.ticketCard}>
          <div style={s.ticketHeader}>
            <div style={s.ticketTitle}>Booking Summary</div>
            <div style={s.ticketSub}>Review your booking details before payment.</div>
          </div>

          <div style={s.roomBox}>
            <div style={s.roomItem}>
              <span style={s.roomLabel}>Room</span>
              <span style={s.roomValue}><Building2 size={16}/> {roomNumber}</span>
            </div>
            <div style={{width:'1px', background:'rgba(255,255,255,0.1)'}}></div>
            <div style={s.roomItem}>
              <span style={s.roomLabel}>Bed No</span>
              <span style={s.roomValue}><BedDouble size={16}/> {bedNumber}</span>
            </div>
          </div>

          <div style={s.dateLine}>
            <span style={{display:'flex', alignItems:'center', gap:'8px'}}><Calendar size={15} opacity={0.7}/> Check-in</span>
            <span style={{fontWeight:'600'}}>{checkIn}</span>
          </div>
          <div style={s.dateLine}>
            <span style={{display:'flex', alignItems:'center', gap:'8px'}}><CheckCircle2 size={15} opacity={0.7}/> Check-out</span>
            <span style={{fontWeight:'600'}}>{checkOut}</span>
          </div>

          {reservedFor && (
             <div style={{margin:'15px 0', fontSize:'12px', textAlign:'center', color:'#fcd34d', fontWeight:'600'}}>
               ROOM RESERVED FOR: {reservedFor}
             </div>
          )}

          <div style={s.totalSection}>
            <span style={s.totalLabel}>Total Payable</span>
            <span style={s.totalValue}>
                {priceLoading ? <Loader2 size={24} className="animate-spin"/> : `LKR ${typeof totalAmount === 'number' ? totalAmount.toLocaleString('en-US', {minimumFractionDigits: 2}) : '0.00'}`}
            </span>
          </div>

          <button 
            onClick={handlePayment} 
            style={{...s.payBtn, opacity: loading ? 0.8 : 1}} 
            disabled={loading}
            onMouseOver={(e) => !loading && (e.currentTarget.style.transform = 'scale(1.02)')}
            onMouseOut={(e) => !loading && (e.currentTarget.style.transform = 'scale(1)')}
          >
            {loading ? <Loader2 size={20} className="animate-spin"/> : <>Pay Securely <CreditCard size={18}/></>}
          </button>

          <div style={s.footerNote}>
            <ShieldCheck size={12}/> Secured by PayHere Payment Gateway
          </div>
        </div>
      </div>

    </div>
  );
};

export default Reservation;