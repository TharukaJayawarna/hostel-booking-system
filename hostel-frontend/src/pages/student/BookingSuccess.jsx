import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const BookingSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Reservation පිටුවෙන් එවපු Data ලබාගැනීම
  const { 
    orderId, 
    studentName, 
    studentId, 
    bedNumber, 
    roomNumber, 
    checkIn, 
    checkOut, 
    amount 
  } = location.state || {};

  useEffect(() => {
    if (!orderId) {
      navigate('/'); // Data නැත්නම් Home එකට විසි කරනවා
    }
  }, [orderId, navigate]);

  const handleCopy = () => {
    navigator.clipboard.writeText(orderId);
    toast.success("Booking ID Copied!");
  };

  // --- Styles (Inline CSS matching the screenshot) ---
  const s = {
    container: {
      minHeight: '100vh',
      width: '100%',
      padding: '50px 20px',
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      textAlign: 'center',
      color: '#1f2937',
      backgroundColor: '#dbdce0ff' 
    },
    innerContainer: {
      maxWidth: '900px',
      margin: '0 auto',
      width: '100%'
    },
    successIconContainer: {
      width: '80px',
      height: '80px',
      backgroundColor: '#d1fae5', // Light Green Circle
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 20px auto'
    },
    checkmark: {
      fontSize: '40px',
      color: '#059669' // Green Check
    },
    title: {
      fontSize: '32px',
      fontWeight: '800',
      color: '#111827',
      marginBottom: '10px'
    },
    subtitle: {
      fontSize: '16px',
      color: '#6b7280',
      marginBottom: '40px',
      lineHeight: '1.5'
    },
    // Card
    card: {
      backgroundColor: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
      textAlign: 'left'
    },
    cardHeader: {
      backgroundColor: '#f3f4f6', // Light Grey Header
      padding: '20px 30px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: '1px solid #e5e7eb'
    },
    bookingLabel: { fontSize: '13px', color: '#6b7280', marginBottom: '4px' },
    bookingId: { fontSize: '18px', fontWeight: '700', color: '#1f2937', letterSpacing: '0.5px' },
    copyBtn: {
      background: 'none',
      border: 'none',
      color: '#2563eb',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      gap: '5px'
    },
    cardBody: {
      padding: '30px'
    },
    sectionTitle: {
      fontSize: '18px',
      fontWeight: '700',
      color: '#111827',
      marginBottom: '20px'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '25px',
      marginBottom: '30px',
      borderBottom: '1px solid #e5e7eb',
      paddingBottom: '30px'
    },
    itemLabel: { fontSize: '14px', color: '#6b7280', marginBottom: '5px' },
    itemValue: { fontSize: '16px', fontWeight: '600', color: '#111827' },
    
    // Payment Section
    paymentRow: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '12px',
      fontSize: '15px',
      color: '#4b5563'
    },
    totalRow: {
      display: 'flex',
      justifyContent: 'space-between',
      marginTop: '20px',
      paddingTop: '20px',
      borderTop: '1px solid #e5e7eb',
      fontSize: '20px',
      fontWeight: '800',
      color: '#111827'
    },
    
    // Footer Button
    homeBtn: {
      marginTop: '40px',
      padding: '14px 30px',
      backgroundColor: '#111827', // Dark Black/Blue
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'opacity 0.2s'
    }
  };

  return (
    <div style={s.container}>
      {/* Success Header */}
      <div style={s.successIconContainer}>
        <span style={s.checkmark}>✔</span>
      </div>
      <h1 style={s.title}>Booking Confirmed!</h1>
      <p style={s.subtitle}>
        Thank you for your payment. A confirmation email has been sent to your<br/>
        registered address.
      </p>

      {/* Booking Card */}
      <div style={s.card}>
        
        {/* Card Header */}
        <div style={s.cardHeader}>
          <div>
            <div style={s.bookingLabel}>Booking ID</div>
            <div style={s.bookingId}>{orderId}</div>
          </div>
          <button style={s.copyBtn} onClick={handleCopy}>
            📋 Copy
          </button>
        </div>

        {/* Card Body */}
        <div style={s.cardBody}>
          
          <div style={s.sectionTitle}>Booking Summary</div>
          
          <div style={s.grid}>
            <div>
              <div style={s.itemLabel}>Location</div>
              <div style={s.itemValue}>{roomNumber}, Bed {bedNumber}</div>
            </div>
            <div>
              <div style={s.itemLabel}>Guest</div>
              <div style={s.itemValue}>{studentName} <span style={{color:'#6b7280', fontWeight:'400'}}>(ID: {studentId})</span></div>
            </div>
            <div>
              <div style={s.itemLabel}>Check-in</div>
              <div style={s.itemValue}>{checkIn}</div>
            </div>
            <div>
              <div style={s.itemLabel}>Check-out</div>
              <div style={s.itemValue}>{checkOut}</div>
            </div>
          </div>

          <div style={s.sectionTitle}>Payment Details</div>
          
          <div style={s.paymentRow}>
            <span>Payment Method</span>
            <span style={{fontWeight:'600'}}>Online (PayHere)</span>
          </div>
          <div style={s.paymentRow}>
            <span>Transaction Date</span>
            <span style={{fontWeight:'600'}}>{new Date().toLocaleDateString()}</span>
          </div>
          
          <div style={s.totalRow}>
            <span>Total Amount Paid</span>
            <span>LKR {amount ? amount.toFixed(2) : "0.00"}</span>
          </div>

        </div>
      </div>

      <button 
        style={s.homeBtn}
        onClick={() => navigate('/')}
      >
        Back to Home
      </button>

    </div>
  );
};

export default BookingSuccess;