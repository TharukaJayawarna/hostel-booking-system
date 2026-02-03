import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import "../styles/Navbar.css";
import {
  ReservationSuccessTemplate,
  ReservationFailedTemplate,
  SimpleTemplate,
  LatePaymentTemplate,
  ReservationCancelledTemplate,
} from "./NotificationTemplates";
import { ca } from "date-fns/locale";

const NotificationModal = ({ notification, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (notification) {
      setTimeout(() => setIsVisible(true), 10);
    }
  }, [notification]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  if (!notification) return null;

  const renderContent = () => {
    try {
      const data = JSON.parse(notification.message);

      switch (data.notificationType) {
        // Success Cases
        case "RESERVATION_CONFIRMED":
        case "RESERVATION_SUCCESS":
        case "DATES UPDATED":
        case "BOOKING REACTIVATED":
        case "NEW BED ASSIGNED":
          return <ReservationSuccessTemplate data={data} />;

        // Failure Cases
        case "RESERVATION_FAILED":
          return <ReservationFailedTemplate data={data} />;
        
        case "RESERVATION_CANCELLED":
          return <ReservationCancelledTemplate data={data} />;

        case "LATE_PAYMENT":
          return <LatePaymentTemplate data={data} />;

        // Default
        default:
          return (
            <SimpleTemplate
              message={data.introMessage || JSON.stringify(data, null, 2)}
            />
          );
      }
    } catch (e) {
      return <SimpleTemplate message={notification.message} />;
    }
  };

  return (
    <div
      className={`receipt-overlay ${isVisible ? "visible" : ""}`}
      onClick={handleClose}
    >
      <div
        className={`receipt-card ${isVisible ? "pop-up" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="absolute-close-btn" onClick={handleClose}>
          <X size={20} />
        </button>

        <div className="modal-content-wrapper">{renderContent()}</div>

        <div className="receipt-footer">
          <button className="btn-receipt-ok" onClick={handleClose}>
            OK, Got it
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;
