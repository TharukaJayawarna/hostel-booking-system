import React from "react";
import { X, User, Building2, Receipt } from "lucide-react";

const ViewReservationModal = ({ isOpen, onClose, reservation, isLoading }) => {
  if (!isOpen) return null;

  const getStatusBadgeClass = (status) => {
    const map = {
      COMPLETED: "badge-completed",
      APPROVED: "badge-approved",
      PENDING: "badge-pending",
      REJECTED: "badge-rejected",
      REFUNDED: "badge-refunded",
      CANCELLED: "badge-cancelled",
    };
    return map[status] || "badge-pending";
  };

  const getPaymentBadgeClass = (status) => {
    const map = { APPROVED: "pay-approved", PENDING: "pay-pending", REJECTED: "pay-rejected" };
    return map[status] || "pay-na";
  };

  return (
    <div className="mr-overlay" onClick={onClose}>
      <div className="mr-modal-content" style={{ width: "550px" }} onClick={(e) => e.stopPropagation()}>
        {isLoading ? (
          <div className="mr-loading">Loading Details...</div>
        ) : reservation ? (
          <>
            <div className="mr-modal-header">
              <div>
                <h3 className="mr-modal-title">Reservation Details</h3>
                <div style={{ marginTop: "5px" }}>
                  <span className={`mr-badge ${getStatusBadgeClass(reservation.status)}`}>{reservation.status}</span>
                </div>
              </div>
              <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}>
                <X size={24} />
              </button>
            </div>
            <div className="mr-modal-body">
              <div className="mr-section-title"><User size={16} /> Student Information</div>
              <div className="mr-detail-row"><span className="mr-detail-label">Full Name</span><span className="mr-detail-value">{reservation.studentName}</span></div>
              <div className="mr-detail-row"><span className="mr-detail-label">Registration No</span><span className="mr-detail-value">{reservation.studentRegistrationNumber}</span></div>
              <div className="mr-detail-row"><span className="mr-detail-label">Email</span><span className="mr-detail-value">{reservation.studentEmail}</span></div>
              
              <div className="mr-section-title" style={{ marginTop: "25px" }}><Building2 size={16} /> Accommodation</div>
              <div className="mr-detail-row"><span className="mr-detail-label">Room / Bed</span><span className="mr-detail-value">{reservation.roomNumber} - {reservation.bedNumber}</span></div>
              <div className="mr-detail-row"><span className="mr-detail-label">Duration</span><span className="mr-detail-value">{reservation.checkIn} to {reservation.checkOut}</span></div>

              <div className="mr-section-title" style={{ marginTop: "25px" }}><Receipt size={16} /> Payment Information</div>
              <div className="mr-detail-row"><span className="mr-detail-label">Amount</span><span className="mr-detail-value" style={{ color: "#15803d" }}>LKR {reservation.amountPaid}</span></div>
              <div className="mr-detail-row"><span className="mr-detail-label">Status</span><span className="mr-detail-value"><span className={`mr-payment-badge ${getPaymentBadgeClass(reservation.paymentStatus)}`}>{reservation.paymentStatus}</span></span></div>

              <button className="mr-close-btn" onClick={onClose}>Close Details</button>
            </div>
          </>
        ) : (
          <div className="mr-loading" style={{ color: "red" }}>Failed to load data.</div>
        )}
      </div>
    </div>
  );
};

export default ViewReservationModal;