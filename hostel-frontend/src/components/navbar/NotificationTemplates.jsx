import React from "react";
import { 
  ClipboardList, 
  AlertTriangle, 
  CalendarRange, 
  UserCircle, 
  BedDouble, 
  XCircle, 
  Info, 
  Phone, 
  Clock, 
  RotateCcw, 
  CheckCircle2, 
  HelpCircle 
} from "lucide-react";

export const ReservationSuccessTemplate = ({ data }) => {
  return (
    <div style={{ padding: "0 5px" }}>
      {/* Header */}
      <div className="bill-header">
        <h2>
          <ClipboardList className="bill-icon" style={{ color: "#3b82f6" }} size={28} />
          Reservation Details
        </h2>
        <p style={{ margin: 0, fontSize: "14px", color: "#475569", fontWeight: 500 }}>
          Your booking confirmation and receipt
        </p>
      </div>

      <p style={{ fontSize: "14px", color: "#334155", marginBottom: "10px" }}>
        Hello <strong>{data.studentName || "Student"}</strong>,
      </p>
      <p style={{ fontSize: "14px", color: "#64748b", marginBottom: "15px" }}>
        {data.introMessage}
      </p>

      {(data.showCancellationWarning === true || data.showCancellationWarning === "true") && (
        <div className="cancellation-warning">
          <strong style={{ color: "#991b1b", display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
            <AlertTriangle size={16} /> IMPORTANT
          </strong>
          <div style={{ color: "#7f1d1d" }}>
            This reservation includes a non-refundable room policy. Cancellation does not guarantee a refund.
          </div>
        </div>
      )}

      <hr className="section-divider" />

      {/* Section 1: Booking Info */}
      <h3 className="section-header">
        <CalendarRange className="section-icon" style={{ color: "#3b82f6" }} size={18} />
        Booking Information
      </h3>
      <table className="info-table">
        <tbody>
          <tr>
            <td>Reservation No</td>
            <td>
              <span className="reservation-number">{data.reservationNumber}</span>
            </td>
          </tr>
          <tr>
            <td>Room / Bed</td>
            <td>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "6px" }}>
                <BedDouble size={16} style={{ color: "#64748b" }} />
                <span>{data.roomNumber} / Bed {data.bedNumber}</span>
              </div>
            </td>
          </tr>
          <tr>
            <td>Check-in</td>
            <td>{data.checkIn}</td>
          </tr>
          <tr>
            <td>Check-out</td>
            <td>{data.checkOut}</td>
          </tr>
          <tr>
            <td>Duration</td>
            <td>{data.nights} Nights</td>
          </tr>
        </tbody>
      </table>

      {/* Section 2: Student Details */}
      <h3 className="section-header">
        <UserCircle className="section-icon" style={{ color: "#3b82f6" }} size={18} />
        Student Details
      </h3>
      <table className="info-table">
        <tbody>
          <tr>
            <td>Name</td>
            <td>{data.studentName}</td>
          </tr>
          <tr>
            <td>Registration No</td>
            <td>{data.studentRegNo || "N/A"}</td>
          </tr>
        </tbody>
      </table>

      {/* Summary Box */}
      <div className="summary-box">
        <div className="summary-row">
          <span style={{ fontWeight: 600 }}>Status</span>
          <span className="status-badge">{data.status || "APPROVED"}</span>
        </div>
        <div className="summary-total">
          <span>Total Paid</span>
          <span>{data.amount}</span>
        </div>
      </div>
    </div>
  );
};

// 2. FAILURE TEMPLATE 
export const ReservationFailedTemplate = ({ data }) => {
  return (
    <div style={{ padding: "0 5px" }}>
      {/* Icon Animation */}
      <div className="failure-container">
        <div className="failure-icon-wrapper">
          <XCircle size={40} color="#dc2626" strokeWidth={2.5} />
        </div>
        
        {/* Header */}
        <div className="failure-header">
          <h2 style={{ color: "#991b1b", margin: 0, fontSize: "20px", fontWeight: 700 }}>Booking Failed</h2>
          <p style={{ margin: "5px 0 0 0", fontSize: "14px", color: "#7f1d1d", fontWeight: 500 }}>
            Payment could not be completed
          </p>
        </div>
      </div>

      <p style={{ fontSize: "14px", color: "#334155" }}>
        Dear <strong>{data.studentName || "Student"}</strong>,
      </p>

      {/* Details Box */}
      <div className="failure-details">
        <p style={{ margin: 0, lineHeight: 1.6 }}>
          We regret to inform you that your reservation attempt{" "}
          <span style={{ display: "inline-block", margin: "5px 0" }}>
            (Ref: <span className="ref-number-fail">{data.reservationNumber || "N/A"}</span>)
          </span>{" "}
          was unsuccessful due to a payment failure or timeout.
        </p>
      </div>

      {/* Info Box */}
      <div className="info-box">
        <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
          <Info size={18} style={{ minWidth: "18px", marginTop: "2px" }} />
          <div>
            <strong>Important:</strong> Your selected bed has been released and is now available for other students. You may try to make a new reservation.
          </div>
        </div>
      </div>

      {/* Support Box */}
      <div className="support-box">
        <strong style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px", color: "#15803d" }}>
          <Phone size={16} /> Need Help?
        </strong>
        <div style={{ lineHeight: 1.5 }}>
          If you continue to experience issues, please contact our support team at +94 11 544 5000 or visit the hostel office.
        </div>
      </div>
    </div>
  );
};

// 3. LATE PAYMENT TEMPLATE 
export const LatePaymentTemplate = ({ data }) => {
  return (
    <div style={{ padding: "0 5px" }}>
      {/* Header */}
      <div className="late-payment-header">
        <h2 style={{ color: "#92400e", margin: "0 0 8px 0", fontSize: "20px", fontWeight: 800, display: "flex", alignItems: "center", gap: "10px" }}>
          <Clock size={28} style={{ color: "#f59e0b" }} />
          Late Payment Received
        </h2>
        <p style={{ margin: 0, fontSize: "14px", color: "#78350f", fontWeight: 500 }}>
          Your payment was processed after reservation expiry
        </p>
      </div>

      <p style={{ fontSize: "14px", color: "#334155" }}>
        Dear <strong>{data.studentName || "Student"}</strong>,
      </p>

      {/* Highlight Box */}
      <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "18px", margin: "20px 0" }}>
        <p style={{ margin: 0, color: "#475569", lineHeight: 1.6, fontSize: "14px" }}>
          We received your payment of{" "}
          <span className="amount-display">{data.amount || "LKR 0.00"}</span>,
          but your reservation time had already expired.
        </p>
      </div>

      {/* Auto Recovery Box */}
      <div className="auto-recovery-box">
        <strong style={{ color: "#15803d", display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px", fontSize: "15px" }}>
          <RotateCcw size={20} /> System Auto-Recovery
        </strong>
        <p style={{ margin: 0, color: "#166534", lineHeight: 1.6, fontSize: "14px" }}>
          If your selected bed is still available, the system will attempt to <strong>automatically re-allocate</strong> it to you within the next{" "}
          <span style={{ background: "#d1fae5", padding: "2px 8px", borderRadius: "4px", fontWeight: 700, border: "1px solid #6ee7b7" }}>
            10 minutes
          </span>.
        </p>
      </div>

      {/* Instructions Box */}
      <div className="instructions-box">
        <strong style={{ color: "#92400e", display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px", fontSize: "15px" }}>
          <HelpCircle size={20} /> If you do not receive a confirmation:
        </strong>
        <ul>
          <li>This means the bed is no longer available.</li>
          <li>Please submit an <strong>Issue Form</strong> regarding this payment.</li>
          <li>Administration will then assist you with an alternative room.</li>
        </ul>
      </div>

      <p style={{ color: "#64748b", fontSize: "13px", textAlign: "center", marginTop: "20px" }}>
        Thank you for your patience and understanding.
      </p>
    </div>
  );
};

// 4. Fallback for unknown types
export const SimpleTemplate = ({ message }) => (
  <div style={{ padding: "30px", textAlign: "center", color: "#475569" }}>
    <Info size={40} style={{ color: "#3b82f6", marginBottom: "15px" }} />
    <p style={{ whiteSpace: "pre-line", lineHeight: 1.6 }}>{message}</p>
  </div>
);