import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { 
  CheckCircle, 
  Copy, 
  Home, 
  Calendar, 
  MapPin, 
  User, 
  CreditCard, 
  Download,
  Loader2,
  Clock,
  ArrowRight
} from 'lucide-react';

const BookingSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isCopied, setIsCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const receiptRef = useRef(null); 
  
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

  // ගෙවීම් කළ වේලාව ලෙස දැනට පවතින වේලාව ලබා ගනී
  const [paymentTime] = useState(new Date().toLocaleString('en-US', { 
    year: 'numeric', month: 'short', day: 'numeric', 
    hour: '2-digit', minute: '2-digit' 
  }));

  useEffect(() => {
    if (!orderId) {
      navigate('/'); 
    }
  }, [orderId, navigate]);

  const handleCopy = () => {
    navigator.clipboard.writeText(orderId);
    setIsCopied(true);
    toast.success("Booking ID Copied!");
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownload = async () => {
    const element = receiptRef.current;
    if (!element) return;

    setIsDownloading(true);
    try {
      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgProps = pdf.getImageProperties(imgData);
      const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 20, pdfWidth, imgHeight);
      pdf.save(`Hostel_Receipt_${orderId}.pdf`);
      toast.success("Receipt downloaded successfully!");
    } catch (error) {
      console.error("Download Error:", error);
      toast.error("Failed to download receipt.");
    } finally {
      setIsDownloading(false);
    }
  };

  // --- STYLES ---
  const s = {
    pageContainer: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%)', 
      fontFamily: "'Inter', sans-serif",
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px'
    },
    
    card: {
      backgroundColor: 'white',
      borderRadius: '24px',
      boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)',
      width: '100%',
      maxWidth: '550px', // Slightly wider for better date display
      overflow: 'hidden',
      border: '1px solid #ffffff',
      position: 'relative'
    },

    contentToCapture: {
      backgroundColor: 'white', 
      padding: '40px 35px 25px',
    },

    headerSection: {
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      marginBottom: '30px'
    },
    
    iconWrapper: {
      width: '70px', height: '70px',
      backgroundColor: '#ecfdf5',
      borderRadius: '50%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      marginBottom: '15px',
      color: '#10b981',
      boxShadow: '0 0 0 6px rgba(16, 185, 129, 0.1)'
    },

    title: { fontSize: '24px', fontWeight: '800', color: '#1e293b', marginBottom: '5px' },
    subTitle: { fontSize: '14px', color: '#64748b' },

    // Transaction Info Box
    metaBox: {
      display: 'flex', justifyContent: 'center', gap: '20px',
      marginTop: '20px', width: '100%'
    },
    metaItem: {
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '10px 20px', backgroundColor: '#f8fafc', borderRadius: '12px',
      border: '1px solid #e2e8f0', flex: 1
    },
    metaLabel: { fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' },
    metaValue: { fontSize: '13px', fontWeight: '600', color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' },

    // Date Section (Highlighted)
    dateSection: {
      backgroundColor: '#eff6ff',
      borderRadius: '16px',
      padding: '20px',
      margin: '0 0 25px',
      border: '1px solid #bfdbfe',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    dateBox: { display: 'flex', flexDirection: 'column', gap: '4px' },
    dateLabel: { fontSize: '12px', color: '#60a5fa', fontWeight: '600', textTransform: 'uppercase' },
    dateVal: { fontSize: '16px', fontWeight: '800', color: '#1e40af' },
    arrowIcon: { color: '#93c5fd' },

    // Details Grid
    detailsGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '20px',
      marginBottom: '25px'
    },
    detailItem: { display: 'flex', flexDirection: 'column', gap: '5px' },
    label: { color: '#64748b', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' },
    val: { fontWeight: '600', color: '#1e293b', fontSize: '15px' },
    
    divider: { height: '1px', background: '#e2e8f0', margin: '15px 0' },

    // Total Amount
    totalRow: { 
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      backgroundColor: '#f8fafc', padding: '15px 20px', borderRadius: '12px',
      border: '1px dashed #cbd5e1'
    },
    totalLabel: { fontSize: '14px', fontWeight: '700', color: '#475569' },
    totalVal: { fontSize: '22px', fontWeight: '800', color: '#059669' },

    // Footer Buttons
    footer: {
      padding: '0 35px 35px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    },
    homeBtn: {
      width: '100%', padding: '14px',
      background: '#1e293b', color: 'white',
      border: 'none', borderRadius: '12px',
      fontSize: '15px', fontWeight: '600',
      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
      transition: 'transform 0.1s',
      boxShadow: '0 4px 12px rgba(30, 41, 59, 0.15)'
    },
    downloadBtn: {
      width: '100%', padding: '14px',
      background: 'white', color: '#475569',
      border: '1px solid #e2e8f0', borderRadius: '12px',
      fontSize: '15px', fontWeight: '600',
      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
      transition: 'background 0.2s'
    }
  };

  return (
    <div style={s.pageContainer}>
      <div style={s.card}>
        
        {/* Receipt Content to Capture */}
        <div ref={receiptRef} style={s.contentToCapture}>
            
            {/* Header */}
            <div style={s.headerSection}>
                <div style={s.iconWrapper}>
                    <CheckCircle size={36} strokeWidth={3} />
                </div>
                <h1 style={s.title}>Payment Successful</h1>
                <p style={s.subTitle}>Your booking has been officially confirmed.</p>

                {/* ID & Time */}
                <div style={s.metaBox}>
                    <div style={s.metaItem} onClick={handleCopy} title="Click ID to Copy">
                        <span style={s.metaLabel}>Ref ID</span>
                        <span style={{...s.metaValue, fontFamily: 'monospace', cursor:'pointer'}}>
                            {orderId} {isCopied ? <CheckCircle size={12} color="#10b981"/> : <Copy size={12}/>}
                        </span>
                    </div>
                    <div style={s.metaItem}>
                        <span style={s.metaLabel}>Payment Time</span>
                        <span style={s.metaValue}>
                            <Clock size={12}/> {paymentTime}
                        </span>
                    </div>
                </div>
            </div>

            {/* Date Timeline (Highlighted) */}
            <div style={s.dateSection}>
                <div style={s.dateBox}>
                    <span style={s.dateLabel}>Check-in</span>
                    <span style={s.dateVal}>{checkIn}</span>
                </div>
                <ArrowRight size={24} style={s.arrowIcon}/>
                <div style={{...s.dateBox, alignItems:'flex-end'}}>
                    <span style={s.dateLabel}>Check-out</span>
                    <span style={s.dateVal}>{checkOut}</span>
                </div>
            </div>

            {/* Details */}
            <div style={s.detailsGrid}>
                <div style={s.detailItem}>
                    <span style={s.label}><User size={14}/> Student</span>
                    <span style={s.val}>{studentName}</span>
                    <span style={{fontSize:'12px', color:'#94a3b8'}}>{studentId}</span>
                </div>
                <div style={s.detailItem}>
                    <span style={s.label}><MapPin size={14}/> Accommodation</span>
                    <span style={s.val}>{roomNumber}</span>
                    <span style={{fontSize:'13px', color:'#64748b'}}>Bed No: {bedNumber}</span>
                </div>
            </div>

            {/* Total */}
            <div style={s.totalRow}>
                <span style={s.totalLabel}>Total Paid</span>
                <span style={s.totalVal}>
                    LKR {amount ? amount.toLocaleString('en-US', {minimumFractionDigits: 2}) : "0.00"}
                </span>
            </div>

        </div>

        {/* Footer Buttons (Excluded from PDF) */}
        <div style={s.footer}>
          <button 
            style={s.homeBtn}
            onClick={() => navigate('/')}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <Home size={18}/> Back to Home
          </button>
          
          <button 
            style={s.downloadBtn}
            onClick={handleDownload}
            disabled={isDownloading}
            onMouseOver={(e) => !isDownloading && (e.currentTarget.style.backgroundColor = '#f8fafc')}
            onMouseOut={(e) => !isDownloading && (e.currentTarget.style.backgroundColor = 'white')}
          >
            {isDownloading ? <Loader2 size={18} className="animate-spin"/> : <Download size={18}/>}
            {isDownloading ? "Generating PDF..." : "Download Receipt"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default BookingSuccess;