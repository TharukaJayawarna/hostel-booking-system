import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig'; // ඔබේ axios config එක
import { toast } from 'react-toastify';

const Reservation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // කලින් පිටුවෙන් එන data ලබා ගැනීම
  const { bedId, bedNumber, roomNumber, checkIn, checkOut } = location.state || {};

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
  const [isHovered, setIsHovered] = useState(false);

  // --- Styles Object ---
  const styles = {
    pageContainer: {
      width: '100%',
      minHeight: '100vh',
      margin: '0',
      padding: '40px 20px',
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      boxSizing: 'border-box',
      backgroundColor: '#f8f9fa', 
      display: 'flex',
      justifyContent: 'center'
    },
    innerContainer: {
      maxWidth: '1200px',
      width: '100%',
    },
    headerSection: {
      marginBottom: '30px',
      textAlign: 'left'
    },
    pageTitle: {
      fontSize: '28px',
      color: '#1a1a1a',
      marginBottom: '8px',
      fontWeight: '800',
      letterSpacing: '-0.5px'
    },
    subTitle: {
      color: '#666',
      fontSize: '15px'
    },
    contentWrapper: {
      display: 'flex',
      gap: '30px',
      flexWrap: 'wrap',
      alignItems: 'flex-start' 
    },
    formCard: {
      flex: '2',
      minWidth: '350px',
      backgroundColor: '#ffffff',
      padding: '35px',
      borderRadius: '16px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.04)', 
      border: '1px solid #f0f0f0'
    },
    sectionHeader: {
      fontSize: '18px',
      fontWeight: '700',
      color: '#2b5c9e',
      marginBottom: '25px',
      paddingBottom: '15px',
      borderBottom: '2px solid #f0f2f5'
    },
    formGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
      gap: '20px'
    },
    formGroup: {
      marginBottom: '5px' 
    },
    fullWidthGroup: {
      gridColumn: '1 / -1', 
      marginTop: '5px'
    },
    label: {
      display: 'block',
      marginBottom: '8px',
      fontWeight: '600',
      color: '#4b5563',
      fontSize: '13px',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    input: {
      width: '100%',
      padding: '12px 15px',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      fontSize: '15px',
      boxSizing: 'border-box',
      outline: 'none',
      transition: 'all 0.2s ease',
      backgroundColor: '#f9fafb'
    },
    select: {
      width: '100%',
      padding: '12px 15px',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      fontSize: '15px',
      boxSizing: 'border-box',
      backgroundColor: '#f9fafb',
      cursor: 'pointer'
    },
    summarySection: {
      flex: '1',
      minWidth: '320px',
      position: 'sticky', 
      top: '20px'
    },
    summaryCard: {
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      padding: '30px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
      border: '1px solid #e5e7eb'
    },
    summaryTitle: {
      fontSize: '18px',
      fontWeight: '700',
      color: '#111',
      marginBottom: '20px'
    },
    summaryRow: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '15px',
      fontSize: '14px',
      color: '#555'
    },
    summaryLabel: {
      color: '#6b7280',
      fontWeight: '500'
    },
    summaryValue: {
      color: '#111',
      fontWeight: '600',
      textAlign: 'right'
    },
    highlightBox: {
      backgroundColor: '#f0f9ff',
      padding: '15px',
      borderRadius: '10px',
      marginTop: '15px',
      border: '1px solid #e0f2fe'
    },
    roomInfo: {
      fontSize: '13px',
      color: '#0369a1',
      marginBottom: '5px',
      display: 'flex',
      justifyContent: 'space-between'
    },
    divider: {
      border: '0',
      borderTop: '1px dashed #e5e7eb',
      margin: '25px 0'
    },
    totalRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '25px'
    },
    totalLabel: {
      fontSize: '16px',
      fontWeight: '700',
      color: '#374151'
    },
    totalAmount: {
      fontSize: '24px',
      fontWeight: '800',
      color: '#2b5c9e'
    },
    payBtn: {
      width: '100%',
      padding: '16px',
      backgroundColor: isHovered ? '#1e40af' : '#2b5c9e', 
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      fontSize: '16px',
      fontWeight: '700',
      cursor: loading ? 'not-allowed' : 'pointer',
      opacity: loading ? 0.7 : 1,
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 12px rgba(43, 92, 158, 0.3)'
    },
    cancelBtn: {
      width: '100%',
      padding: '12px',
      background: 'transparent',
      border: 'none',
      color: '#ef4444',
      fontWeight: '600',
      marginTop: '12px',
      cursor: 'pointer',
      fontSize: '14px',
      transition: 'color 0.2s'
    }
  };

  useEffect(() => {
    if (!bedId || !checkIn || !checkOut) {
      toast.error("Invalid booking details. Please start again.");
      navigate('/');
      return;
    }
    fetchPrice();
  }, [bedId, checkIn, checkOut]);

  // --- FIXED fetchPrice Function ---
  const fetchPrice = async () => {
    try {
      const response = await api.get(`/reservations/calculate`, {
        params: { bedId, fromDate: checkIn, toDate: checkOut },
        headers: { 'X-Api-Version': 'v1' }
      });

      console.log("Calculate Response:", response.data);

      // Backend returns a Double directly (e.g., 5000.0)
      if (response.status === 200) {
        if (typeof response.data === 'number') {
          setTotalAmount(response.data);
        } else if (response.data && typeof response.data.data === 'number') {
           // In case it's wrapped in an ApiResponse object
           setTotalAmount(response.data.data);
        } else {
           // Fallback to prevent object injection
           setTotalAmount(Number(response.data) || 0);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Error calculating price.");
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- FIXED handlePayment Function ---
  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);

    // FIX: Ensure 'amount' is strictly a Number to prevent JSON parse error
    let finalAmount = totalAmount;
    if (typeof totalAmount === 'object') {
        finalAmount = totalAmount.data || 0;
    }
    finalAmount = Number(finalAmount);

    const bookingPayload = {
      studentName: formData.studentName,
      registrationNumber: formData.registrationNumber,
      email: formData.email,
      contactNumber: formData.phone, // Backend expects 'contactNumber'
      address: formData.address,
      gender: formData.gender,
      bedId: bedId,
      fromDate: checkIn,
      toDate: checkOut,
      amount: finalAmount // Must be a Number (e.g., 5000.0)
    };

    console.log("Sending Payload:", bookingPayload);

    try {
      const response = await api.post('/reservations/initiate', bookingPayload, {
        headers: { 'X-Api-Version': 'v1' }
      });

      // ReservationController returns PayHereInitResponseDTO directly
      if (response.status === 200) {
        const payData = response.data.data; // Direct object
        openPayHerePopup(payData);
      }
    } catch (error) {
      console.error(error);
      const errorMsg = error.response?.data?.message || "Payment initiation failed.";
      toast.error(errorMsg);
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
      "return_url": "https://ursula-brainy-jessi.ngrok-free.dev/payment-success",
      "cancel_url": "https://ursula-brainy-jessi.ngrok-free.dev/payment-cancel",
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
      toast.success("Payment Successful! Booking Confirmed.");
      navigate('/booking-success', { 
        state: {
          orderId: orderId,
          studentName: formData.studentName,
          studentId: formData.registrationNumber,
          bedNumber: bedNumber,
          roomNumber: roomNumber,
          checkIn: checkIn,
          checkOut: checkOut,
          amount: totalAmount
        }
      });
    };

    window.payhere.onDismissed = function onDismissed() {
      setLoading(false);
      toast.warn("Payment Cancelled.");
    };

    window.payhere.onError = function onError(error) {
      setLoading(false);
      console.error("PayHere Error:", error);
      toast.error("Payment Error: " + error);
    };

    window.payhere.startPayment(paymentObject);
  };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.innerContainer}>
        
        <div style={styles.headerSection}>
          <h1 style={styles.pageTitle}>Complete Your Reservation</h1>
          <p style={styles.subTitle}>Please fill in your details to finalize the booking for <strong>{roomNumber}</strong>.</p>
        </div>
        
        <div style={styles.contentWrapper}>
          
          {/* Left Side: Form Card */}
          <div style={styles.formCard}>
            <h3 style={styles.sectionHeader}>Student Information</h3>
            
            <form id="bookingForm" onSubmit={handlePayment} style={styles.formGrid}>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Full Name</label>
                <input type="text" name="studentName" required onChange={handleInputChange} style={styles.input} placeholder="Ex: Kamal Perera" />
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Registration No (ID)</label>
                <input type="text" name="registrationNumber" required onChange={handleInputChange} style={styles.input} placeholder="Ex: IT20001234" />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Email Address</label>
                <input type="email" name="email" required onChange={handleInputChange} style={styles.input} placeholder="student@university.edu" />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Phone Number</label>
                <input type="text" name="phone" required onChange={handleInputChange} style={styles.input} placeholder="0771234567" />
              </div>

              {/* Address takes full width */}
              <div style={styles.fullWidthGroup}>
                <label style={styles.label}>Residential Address</label>
                <input type="text" name="address" required onChange={handleInputChange} style={styles.input} placeholder="City, District" />
              </div>

              <div style={styles.fullWidthGroup}>
                <label style={styles.label}>Gender</label>
                <select name="gender" onChange={handleInputChange} value={formData.gender} style={styles.select}>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                </select>
              </div>
            </form>
          </div>

          {/* Right Side: Summary Card */}
          <div style={styles.summarySection}>
            <div style={styles.summaryCard}>
              <h3 style={styles.summaryTitle}>Booking Summary</h3>

              <div style={styles.highlightBox}>
                <div style={styles.roomInfo}>
                  <span>Room</span>
                  <strong>{roomNumber || "Selected Room"}</strong>
                </div>
                <div style={styles.roomInfo}>
                  <span>Bed</span>
                  <strong>{bedNumber}</strong>
                </div>
              </div>

              <div style={{marginTop: '20px'}}>
                <div style={styles.summaryRow}>
                  <span style={styles.summaryLabel}>Check-in</span>
                  <span style={styles.summaryValue}>{checkIn}</span>
                </div>
                <div style={styles.summaryRow}>
                  <span style={styles.summaryLabel}>Check-out</span>
                  <span style={styles.summaryValue}>{checkOut}</span>
                </div>
                <div style={styles.summaryRow}>
                  <span style={styles.summaryLabel}>Duration</span>
                  <span style={styles.summaryValue}>
                    {checkIn && checkOut 
                      ? Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)) 
                      : 0} Nights
                  </span>
                </div>
              </div>

              <hr style={styles.divider} />

              <div style={styles.totalRow}>
                <span style={styles.totalLabel}>Total Payable</span>
                <span style={styles.totalAmount}>
                    {/* Handle display if totalAmount is somehow still an object or invalid */}
                    LKR {typeof totalAmount === 'number' ? totalAmount.toLocaleString('en-US', {minimumFractionDigits: 2}) : '0.00'}
                </span>
              </div>

              <button 
                type="submit" 
                form="bookingForm" 
                style={styles.payBtn} 
                disabled={loading}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                {loading ? "Processing..." : "Pay Securely"}
              </button>

              <button type="button" style={styles.cancelBtn} onClick={() => navigate(-1)}>
                Cancel Transaction
              </button>
              
              <p style={{textAlign:'center', fontSize:'11px', color:'#aaa', marginTop:'15px'}}>
                Secured by PayHere
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Reservation;