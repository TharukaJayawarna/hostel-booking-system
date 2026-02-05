// src/pages/student/GatePassModal.jsx
import React from "react";
import {
  X,
  ShieldCheck,
  User,
  MapPin,
  CreditCard,
  Loader2,
  AlertCircle,
} from "lucide-react";

// CSS Styles (MyBookings.css එකේම styles භාවිතා වේ)
import "./styles/MyBookings.css";

const calculateNights = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 0;
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};
const GatePassModal = ({ isOpen, onClose, loading, passDetails }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="pass-card" onClick={(e) => e.stopPropagation()}>
        <div className="pass-header">
          <button className="pass-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
          <div className="pass-title">Hostel Entry Pass</div>
          <div className="pass-sub">Authorization Ticket</div>
        </div>

        <div className="pass-body">
          {loading ? (
            <div className="loading-msg">
              <Loader2 className="animate-spin" size={24} /> Loading details...
            </div>
          ) : passDetails ? (
            <>
              <div className="pass-section">
                <div className="section-title">
                  <User size={14} /> Student Details
                </div>
                <div className="info-row">
                  <span className="row-label">Name</span>
                  <span className="row-val">{passDetails.studentName}</span>
                </div>
                <div className="info-row">
                  <span className="row-label">Reg No</span>
                  <span className="row-val">
                    {passDetails.studentRegistrationNumber}
                  </span>
                </div>
                <div className="info-row">
                  <span className="row-label">Email</span>
                  <span className="row-val">{passDetails.studentEmail}</span>
                </div>
                <div className="info-row">
                  <span className="row-label">Contact</span>
                  <span className="row-val">{passDetails.studentContact}</span>
                </div>
              </div>

              <div className="pass-section">
                <div className="section-title">
                  <MapPin size={14} /> Accommodation
                </div>
                <div className="info-row">
                  <span className="row-label">Room / Bed</span>
                  <span className="row-val">
                    {passDetails.roomNumber} / {passDetails.bedNumber}
                  </span>
                </div>
                <div className="info-row">
                  <span className="row-label">Check In</span>
                  <span className="row-val">{passDetails.checkIn}</span>
                </div>
                <div className="info-row">
                  <span className="row-label">Check Out</span>
                  <span className="row-val">{passDetails.checkOut}</span>
                </div>
                <div className="info-row">
                  <span className="row-label">Duration</span>
                  <span
                    className="row-val"
                  >
                    {calculateNights(passDetails.checkIn, passDetails.checkOut)}{" "}
                    Nights
                  </span>
                </div>
              </div>

              <div className="pass-section payment-section">
                <div className="section-title">
                  <CreditCard size={14} /> Payment
                </div>
                <div className="info-row">
                  <span className="row-label">Payment ID</span>
                  <span className="row-val mono">
                    {passDetails.reservationNumber}
                  </span>
                </div>
                <div className="info-row">
                  <span className="row-label">Payment Date</span>
                  <span className="row-val mono">
                    {passDetails.paymentDate}
                  </span>
                </div>
                <div className="info-row">
                  <span className="row-label">Payment Time</span>
                  <span className="row-val mono">
                    {passDetails.paymentTime}
                  </span>
                </div>
                <div className="info-row">
                  <span className="row-label">Payment Status</span>
                  <span className="row-val mono">
                    {passDetails.paymentStatus}
                  </span>
                </div>
                <div className="info-row">
                  <span className="row-label">Amount</span>
                  <span className="row-val amount">
                    LKR {passDetails.amountPaid?.toLocaleString()}
                  </span>
                </div>
                <div className="barcode-box">
                  <div className="barcode-lines"></div>
                  <span className="row-label">Reservation ID</span>

                  {passDetails.reservationNumber}
                </div>
              </div>
            </>
          ) : (
            <div className="error-msg">
              <AlertCircle size={20} /> Failed to load pass.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GatePassModal;
