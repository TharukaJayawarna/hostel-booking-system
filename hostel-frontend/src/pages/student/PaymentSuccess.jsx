import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useNotification } from "../../context/NotificationContext";
import { Loader2, CheckCircle, XCircle, Home, RefreshCcw } from "lucide-react";
import "./styles/PaymentSuccess.css";

// Service import
import paymentService from "../../services/payment.service";

const PaymentSuccess = () => {
  const notify = useNotification();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [status, setStatus] = useState("PROCESSING"); // PROCESSING | SUCCESS | ERROR
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const orderId = searchParams.get("order_id");

    if (!orderId) {
      setStatus("ERROR");
      setErrorMessage("Invalid payment confirmation link.");
      return;
    }

    const verifyPayment = async () => {
      try {
        // 1. Backend Payment Verification
        const response = await paymentService.verifyPayment(orderId);

        if (response.data.status === "SUCCESS") {
          setStatus("SUCCESS");
          notify.success("Payment Verified Successfully!");

          // 2. Redirect to Booking Receipt Page with Data
          // අපි කලින් හැදූ BookingSuccess පිටුවට අවශ්‍ය දත්ත මෙතැනින් යවමු
          setTimeout(() => {
            navigate("/booking-success", {
              state: {
                orderId: orderId,
                reservationNumber: response.data.data.reservationNumber,
                studentName: response.data.data.studentName,
                studentId: response.data.data.studentId,
                studentEmail: response.data.data.studentEmail,
                roomNumber: response.data.data.roomNumber,
                bedNumber: response.data.data.bedNumber,
                checkIn: response.data.data.checkIn,
                checkOut: response.data.data.checkOut,
                amount: response.data.data.amount,
              },
            });
          }, 1500); // පොඩි ප්‍රමාදයක් (Experience එකට)
        } else {
          throw new Error("Verification failed on server.");
        }

      } catch (err) {
        console.error("Verification Error:", err);
        setStatus("ERROR");
        setErrorMessage(
          err.response?.data?.message || "Payment verification failed. Please contact support."
        );
        notify.error("Payment Verification Failed");
      }
    };

    verifyPayment();
  }, [searchParams, navigate, notify]);

  // --- RENDER UI BASED ON STATUS ---

  return (
    <div className="ps-container">
      <div className="ps-card">
        
        {/* CASE 1: PROCESSING */}
        {status === "PROCESSING" && (
          <div className="ps-content">
            <div className="ps-icon-wrapper processing">
              <Loader2 size={48} className="animate-spin" color="#4f46e5" />
            </div>
            <h2 className="ps-title">Verifying Payment...</h2>
            <p className="ps-subtitle">Please wait while we confirm your reservation.</p>
            <div className="ps-progress-bar">
              <div className="ps-progress-fill"></div>
            </div>
          </div>
        )}

        {/* CASE 2: SUCCESS (Temporary view before redirect) */}
        {status === "SUCCESS" && (
          <div className="ps-content">
            <div className="ps-icon-wrapper success">
              <CheckCircle size={48} color="#16a34a" />
            </div>
            <h2 className="ps-title">Payment Confirmed!</h2>
            <p className="ps-subtitle">Redirecting to your receipt...</p>
          </div>
        )}

        {/* CASE 3: ERROR */}
        {status === "ERROR" && (
          <div className="ps-content">
            <div className="ps-icon-wrapper error">
              <XCircle size={48} color="#dc2626" />
            </div>
            <h2 className="ps-title">Verification Failed</h2>
            <p className="ps-subtitle error-text">{errorMessage}</p>
            
            <div className="ps-actions">
              <button className="ps-btn-secondary" onClick={() => navigate("/")}>
                <Home size={18} /> Return Home
              </button>
              <button className="ps-btn-primary" onClick={() => window.location.reload()}>
                <RefreshCcw size={18} /> Retry
              </button>
            </div>
            
            <div className="ps-contact-support">
              Issue persists? Contact <strong>support@hostel.nsbm.ac.lk</strong>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default PaymentSuccess;