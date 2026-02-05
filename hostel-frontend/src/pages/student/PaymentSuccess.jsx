import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { useNotification } from "../../context/NotificationContext";
import { Loader2, CheckCircle, XCircle, Home, RefreshCcw } from "lucide-react";
import "./styles/PaymentSuccess.css";

import paymentService from "../../services/payment.service";

const PaymentSuccess = () => {
  const notify = useNotification();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [status, setStatus] = useState("PROCESSING");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    // URL eken ho Reservation page eken ewana state eken Order ID eka gannawa
    const orderId = searchParams.get("order_id") || location.state?.orderId;

    if (!orderId) {
      setStatus("ERROR");
      setErrorMessage("Invalid payment confirmation link.");
      return;
    }

    const verifyPayment = async () => {
      try {
        const response = await paymentService.verifyPayment(orderId);

        if (response.data.status === "SUCCESS") {
          setStatus("SUCCESS");

          // --- DATA RECOVERY LOGIC ---
          
          // 1. Try to get details from React Router State (Works in popup mode)
          let initialDetails = location.state?.bookingDetails || {};

          // 2. If state is empty (Redirect mode), try Session Storage
          if (!initialDetails.studentName) {
             const cachedData = sessionStorage.getItem(`booking_cache_${orderId}`);
             if (cachedData) {
                 try {
                     initialDetails = JSON.parse(cachedData);
                     // Optional: Clear cache after retrieval to keep storage clean
                     // sessionStorage.removeItem(`booking_cache_${orderId}`);
                 } catch (e) {
                     console.error("Failed to parse cached booking data", e);
                 }
             }
          }

          // 3. Backend eken verify karama ena details
          const verifiedDetails = response.data.data || {};

          // 4. Merge Data (Prioritize Verified Backend Data, Fallback to Initial/Cached Data)
          const finalBookingData = {
            ...initialDetails,
            ...verifiedDetails,
            orderId: orderId,
            // Ensure essential fields exist even if one source is missing them
            checkIn: verifiedDetails.fromDate || verifiedDetails.checkIn || initialDetails.checkIn || "N/A",
            checkOut: verifiedDetails.toDate || verifiedDetails.checkOut || initialDetails.checkOut || "N/A",
            amount: verifiedDetails.amountPaid || initialDetails.amount || 0,
            bedNumber: verifiedDetails.bedNumber || initialDetails.bedNumber || "N/A",
            roomNumber: verifiedDetails.roomNumber || initialDetails.roomNumber || "N/A"
          };

          // Wait 6 seconds and redirect
          setTimeout(() => {
            navigate("/booking-success", {
              state: finalBookingData, 
            });
          }, 4000); 
          
        } else {
          throw new Error("Verification failed on server.");
        }
      } catch (err) {
        console.error("Verification Error:", err);
        setStatus("ERROR");
        setErrorMessage(
          err.response?.data?.message ||
            "Payment verification failed. Please contact support.",
        );
        notify.error("Payment Verification Failed");
      }
    };

    verifyPayment();
  }, [searchParams, location.state, navigate, notify]);

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
            <p className="ps-subtitle">
              Please wait while we confirm your reservation.
            </p>
            <div className="ps-progress-bar">
              <div className="ps-progress-fill"></div>
            </div>
          </div>
        )}

        {/* CASE 2: SUCCESS */}
        {status === "SUCCESS" && (
          <div className="ps-content">
            <div className="ps-icon-wrapper success">
              <CheckCircle size={48} color="#16a34a" />
            </div>
            <h2 className="ps-title">Payment Confirmed!</h2>
            <p className="ps-subtitle">
                Your booking has been secured successfully.<br/>
                Redirecting to receipt...
            </p>
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
              <button
                className="ps-btn-secondary"
                onClick={() => navigate("/")}
              >
                <Home size={18} /> Return Home
              </button>
              <button
                className="ps-btn-primary"
                onClick={() => window.location.reload()}
              >
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