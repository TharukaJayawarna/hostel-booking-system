import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useNotification } from "../../context/NotificationContext";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import {
  CheckCircle,
  Copy,
  Home,
  MapPin,
  User,
  Download,
  Loader2,
  Clock,
  ArrowRight,
  Receipt,
  Mail,
  Phone
} from "lucide-react";
import "./styles/BookingSuccess.css";

const BookingSuccess = () => {
  const notify = useNotification();
  const location = useLocation();
  const navigate = useNavigate();
  const receiptRef = useRef(null);

  const [isCopied, setIsCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Destructure Data
  const {
    orderId,
    studentName,
    studentId,
    studentEmail,
    studentPhone,
    bedNumber,
    roomNumber,
    checkIn,
    checkOut,
    amount,
  } = location.state || {};

  // Current Timestamp for Receipt
  const [paymentTime] = useState(new Date().toLocaleString("en-US", {
    year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
  }));

  useEffect(() => {
    if (!orderId) {
      navigate("/"); // Redirect if accessed directly
    }
  }, [orderId, navigate]);

  const handleCopy = () => {
    if (!orderId) return;
    navigator.clipboard.writeText(orderId);
    setIsCopied(true);
    notify.success("Reference ID Copied!");
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownload = async () => {
    const element = receiptRef.current;
    if (!element) return;

    setIsDownloading(true);
    try {
      // High Quality Capture settings
      const canvas = await html2canvas(element, {
        scale: 3, // Higher scale for better clarity
        useCORS: true,
        backgroundColor: "#ffffff", // Ensure white background
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgProps = pdf.getImageProperties(imgData);
      const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

      // Center vertically if receipt is small, or top align
      let positionY = 10; 
      
      pdf.addImage(imgData, "PNG", 0, positionY, pdfWidth, imgHeight);
      pdf.save(`Hostel_Receipt_${orderId || "REF"}.pdf`);
      
      notify.success("Receipt downloaded successfully!");
    } catch (error) {
      console.error("Download Error:", error);
      notify.error("Failed to download receipt.");
    } finally {
      setIsDownloading(false);
    }
  };

  if (!orderId) return null; // Avoid flickering before redirect

  return (
    <div className="booking-success-container">
      {/* Animated Background Icon */}
      <div className="bs-bg-pattern"></div>

      <div className="bs-main-wrapper">
        <div className="bs-card-container">
          
          {/* --- RECEIPT SECTION (To be Printed) --- */}
          <div ref={receiptRef} className="bs-receipt-card">
            
            {/* Header / Success Banner */}
            <div className="bs-success-banner">
              <div className="bs-icon-pulse">
                <CheckCircle size={48} color="#ffffff" strokeWidth={2.5} />
              </div>
              <h1 className="bs-title">Payment Successful!</h1>
              <p className="bs-subtitle">Your booking is confirmed.</p>
            </div>

            <div className="bs-receipt-body">
              {/* Reference ID Row */}
              <div className="bs-ref-row">
                <div className="bs-ref-label">Reference ID</div>
                <div className="bs-ref-value clickable" onClick={handleCopy} title="Click to Copy">
                  {orderId} 
                  {isCopied ? <CheckCircle size={14} color="#10b981" /> : <Copy size={14} color="#64748b" />}
                </div>
                <div className="bs-ref-time">{paymentTime}</div>
              </div>

              {/* Dotted Divider */}
              <div className="bs-divider"></div>

              {/* Timeline Section */}
              <div className="bs-timeline-section">
                <div className="bs-timeline-box">
                  <span className="bs-t-label">Check-in</span>
                  <span className="bs-t-date">{checkIn}</span>
                </div>
                <div className="bs-timeline-arrow">
                  <ArrowRight size={20} color="#94a3b8" />
                </div>
                <div className="bs-timeline-box right">
                  <span className="bs-t-label">Check-out</span>
                  <span className="bs-t-date">{checkOut}</span>
                </div>
              </div>

              {/* Details Grid */}
              <div className="bs-grid-section">
                <div className="bs-grid-item">
                  <div className="bs-grid-icon"><User size={16} /></div>
                  <div className="bs-grid-info">
                    <span className="bs-g-label">Student</span>
                    <span className="bs-g-val">{studentName}</span>
                    <span className="bs-g-sub">{studentId}</span>
                  </div>
                </div>
                <div className="bs-grid-item">
                  <div className="bs-grid-icon"><MapPin size={16} /></div>
                  <div className="bs-grid-info">
                    <span className="bs-g-label">Room / Bed</span>
                    <span className="bs-g-val">{roomNumber}</span>
                    <span className="bs-g-sub">Bed No: {bedNumber}</span>
                  </div>
                </div>
              </div>

              {/* Contact Info (Compact) */}
              <div className="bs-contact-mini">
                 <span><Mail size={12}/> {studentEmail}</span>
                 {studentPhone && <span><Phone size={12}/> {studentPhone}</span>}
              </div>

              {/* Total Amount */}
              <div className="bs-total-box">
                <span className="bs-total-text">Total Paid</span>
                <span className="bs-total-amount">
                  LKR {amount ? parseFloat(amount).toLocaleString("en-US", { minimumFractionDigits: 2 }) : "0.00"}
                </span>
              </div>
            </div>

            {/* Receipt Footer (Visible in PDF) */}
            <div className="bs-receipt-footer">
              <Receipt size={14} /> Generated via Hostel Management System
            </div>
          </div>
          {/* --- END RECEIPT SECTION --- */}

          {/* Action Buttons (Not Printed) */}
          <div className="bs-actions">
            <button className="bs-btn-secondary" onClick={() => navigate("/")}>
              <Home size={18} /> Home
            </button>
            <button 
              className="bs-btn-primary" 
              onClick={handleDownload} 
              disabled={isDownloading}
            >
              {isDownloading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
              {isDownloading ? "Generating..." : "Download Receipt"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default BookingSuccess;