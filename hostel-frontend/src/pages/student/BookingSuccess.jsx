import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useNotification } from "../../context/NotificationContext";
import { generateReceiptPDF } from "../../utils/receiptGenerator"; // <-- අලුත් Import එක
import {
  CheckCircle,
  Copy,
  MapPin,
  User,
  Download,
  ArrowRight,
  Receipt,
  Mail,
  Phone,
  Loader2,
} from "lucide-react";
import "./styles/BookingSuccess.css";

const BookingSuccess = () => {
  const notify = useNotification();
  const location = useLocation();
  const navigate = useNavigate();

  const [isCopied, setIsCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Destructure state
  const {
    orderId,
    studentName,
    studentRegistrationNumber,
    studentEmail,
    contactNumber: studentPhone,
    bedNumber,
    roomNumber,
    checkIn,
    checkOut,
    amount,
  } = location.state || {};

  const displayStudentId = studentRegistrationNumber || "N/A";

  const [paymentTime] = useState(
    new Date().toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
  );

  useEffect(() => {
    if (!orderId) {
      navigate("/");
    }
  }, [orderId, navigate]);

  const handleCopy = () => {
    if (!orderId) return;
    navigator.clipboard.writeText(orderId);
    setIsCopied(true);
    notify.success("Reference ID Copied!");
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownload = () => {
    setIsDownloading(true);
    try {
      // PDF ජනනය කරන function එක call කිරීම
      generateReceiptPDF({
        orderId,
        studentName,
        studentId: displayStudentId,
        studentEmail,
        studentPhone,
        bedNumber,
        roomNumber,
        checkIn,
        checkOut,
        amount,
      });
      notify.success("Receipt downloaded successfully!");
    } catch (error) {
      console.error("PDF Generation Error:", error);
      notify.error("Failed to generate receipt. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  if (!orderId) return null;

  return (
    <div className="booking-success-container">
      <div className="bs-bg-pattern"></div>

      <div className="bs-main-wrapper">
        <div className="bs-card-container">
          <div className="bs-receipt-card">
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
                <div
                  className="bs-ref-value clickable"
                  onClick={handleCopy}
                  title="Click to Copy"
                >
                  {orderId}
                  {isCopied ? (
                    <CheckCircle size={14} color="#10b981" />
                  ) : (
                    <Copy size={14} color="#64748b" />
                  )}
                </div>
                <div className="bs-ref-time">{paymentTime}</div>
              </div>

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
                  <div className="bs-grid-icon">
                    <User size={16} />
                  </div>
                  <div className="bs-grid-info">
                    <span className="bs-g-label">Student</span>
                    <span className="bs-g-val">{studentName}</span>
                    <span className="bs-g-sub">{displayStudentId}</span>
                    <div className="bs-contact-mini">
                      <span>
                        <Mail size={12} /> {studentEmail}
                      </span>
                      {studentPhone && (
                        <span>
                          <Phone size={12} /> {studentPhone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="bs-grid-item">
                  <div className="bs-grid-icon">
                    <MapPin size={16} />
                  </div>
                  <div className="bs-grid-info">
                    <span className="bs-g-label">Room / Bed</span>
                    <span className="bs-g-val">{roomNumber}</span>
                    <span className="bs-g-sub">Bed No: {bedNumber}</span>
                  </div>
                </div>
              </div>

              {/* Total Amount */}
              <div className="bs-total-box">
                <span className="bs-g-sub">Bed No: {bedNumber}</span>
                <span className="bs-total-text">Total Paid</span>
                <span className="bs-total-amount">
                  LKR{" "}
                  {amount
                    ? parseFloat(amount).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })
                    : "0.00"}
                </span>
              </div>
            </div>

            <div className="bs-receipt-footer">
              <Receipt size={14} /> Generated via Hostel Management System
            </div>
          </div>

          <div className="bs-actions">
            <button
              className="bs-btn-primary"
              onClick={handleDownload}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Download size={18} />
              )}
              {isDownloading ? "Generating..." : "Download Receipt"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccess;
