import React from "react";
import { X, User, Building2, Receipt, CalendarCheck } from "lucide-react";

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
    const map = {
      APPROVED: "pay-approved",
      PENDING: "pay-pending",
      REJECTED: "pay-rejected",
    };
    return map[status] || "pay-na";
  };

  return (
    <div className="mr-overlay" onClick={onClose}>
      <div className="mr-modal-content view-modal" onClick={(e) => e.stopPropagation()}>
        {isLoading ? (
          <div className="mr-loading">
            <div className="spinner"></div> Loading Details...
          </div>
        ) : reservation ? (
          <>
            {/* Header */}
            <div className="mr-modal-header">
              <div className="header-text-group">
                <h3 className="mr-modal-title">Reservation Details</h3>
                <div className="mr-status-row">
                  <span className={`mr-badge ${getStatusBadgeClass(reservation.status)}`}>
                    {reservation.status}
                  </span>
                  <span className="mr-ref-id">#{reservation.reservationNumber}</span>
                </div>
              </div>
              <button className="mr-close-icon-btn" onClick={onClose}>
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="mr-modal-body">
              {/* Student Section */}
              <div className="mr-section">
                <div className="mr-section-title">
                  <User size={16} /> Student Information
                </div>
                <div className="mr-detail-group">
                  <div className="mr-detail-row">
                    <span className="mr-detail-label">Full Name</span>
                    <span className="mr-detail-value">{reservation.studentName}</span>
                  </div>
                  <div className="mr-detail-row">
                    <span className="mr-detail-label">Registration No</span>
                    <span className="mr-detail-value">{reservation.studentRegistrationNumber}</span>
                  </div>
                  <div className="mr-detail-row">
                    <span className="mr-detail-label">Email</span>
                    <span className="mr-detail-value">{reservation.studentEmail}</span>
                  </div>
                </div>
              </div>

              {/* Accommodation Section */}
              <div className="mr-section">
                <div className="mr-section-title">
                  <Building2 size={16} /> Accommodation
                </div>
                <div className="mr-detail-group">
                  <div className="mr-detail-row">
                    <span className="mr-detail-label">Allocated Space</span>
                    <span className="mr-detail-value highlight">
                      {reservation.roomNumber} <span className="separator">•</span> Bed {reservation.bedNumber}
                    </span>
                  </div>
                  <div className="mr-detail-row">
                    <span className="mr-detail-label">Check-In / Out</span>
                    <span className="mr-detail-value date-range">
                      {reservation.checkIn} <span className="arrow">→</span> {reservation.checkOut}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Section */}
              <div className="mr-section">
                <div className="mr-section-title">
                  <Receipt size={16} /> Payment Status
                </div>
                <div className="mr-detail-group">
                  <div className="mr-detail-row">
                    <span className="mr-detail-label">Total Amount</span>
                    <span className="mr-detail-value amount">
                      LKR {reservation.amountPaid}
                    </span>
                  </div>
                  <div className="mr-detail-row">
                    <span className="mr-detail-label">Payment Status</span>
                    <span className="mr-detail-value">
                      <span className={`mr-payment-badge ${getPaymentBadgeClass(reservation.paymentStatus)}`}>
                        {reservation.paymentStatus}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mr-modal-footer">
              {/* <button className="mr-close-btn-full" onClick={onClose}>
                Close
              </button> */}
            </div>
          </>
        ) : (
          <div className="mr-loading error">
            Failed to load data. Please try again.
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewReservationModal;