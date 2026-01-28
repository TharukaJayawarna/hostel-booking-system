import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useNotification } from "../../context/NotificationContext";
import {
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Calendar,
  BedDouble,
  ShieldCheck,
  ArrowLeft,
  Loader2,
  Building2,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import "./styles/Reservation.css";

// Services
import reservationService from "../../services/reservation.service";
import paymentService from "../../services/payment.service";
import authService from "../../services/auth.service";

const Reservation = () => {
  const notify = useNotification();
  const location = useLocation();
  const navigate = useNavigate();

  const { bedId, bedNumber, roomNumber, checkIn, checkOut, reservedFor } =
    location.state || {};

  const [formData, setFormData] = useState({
    studentName: "",
    registrationNumber: "",
    email: "",
    contactNumber: "",
    address: "",
    gender: "MALE",
  });

  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [priceLoading, setPriceLoading] = useState(true);

  // Auto-fill user data
  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      setFormData((prev) => ({
        ...prev,
        studentName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
        email: user.email || "",
        contactNumber: user.contactNumber || user.phone || "",
      }));
    }
  }, []);

  // Fetch Price
  useEffect(() => {
    if (!bedId || !checkIn || !checkOut) {
      notify.error("Session expired. Please restart booking.");
      navigate("/");
      return;
    }
    fetchPrice();
  }, [bedId, checkIn, checkOut, navigate, notify]);

  const fetchPrice = async () => {
    setPriceLoading(true);
    try {
      const response = await reservationService.calculatePrice({
        bedId,
        fromDate: checkIn,
        toDate: checkOut,
      });

      if (response.status === 200) {
        setTotalAmount(
          typeof response.data === "number"
            ? response.data
            : response.data.data || 0
        );
      }
    } catch (error) {
      console.error(error);
      notify.error("Error calculating price. Please try again.");
    } finally {
      setPriceLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePayment = async (e) => {
    e.preventDefault();

    // 1. Validate Form Data
    if (
      !formData.studentName.trim() ||
      !formData.registrationNumber.trim() ||
      !formData.email.trim() ||
      !formData.contactNumber.trim() ||
      !formData.address.trim()
    ) {
      notify.warning("Please fill in all required fields.");
      return;
    }

    // 2. Validate Gender Restriction
    if (reservedFor) {
      const studentGender = formData.gender;
      if (reservedFor === "BOYS" && studentGender === "FEMALE") {
        notify.error("Gender Mismatch! This room is reserved for BOYS only.");
        return;
      }
      if (reservedFor === "GIRLS" && studentGender === "MALE") {
        notify.error("Gender Mismatch! This room is reserved for GIRLS only.");
        return;
      }
    }

    setLoading(true);

    const bookingPayload = {
      ...formData,
      bedId,
      fromDate: checkIn,
      toDate: checkOut,
      amount: Number(totalAmount),
    };

    try {
      // 3. Initiate Reservation
      const response = await reservationService.initiateReservation(bookingPayload);

      if (response.status === 200) {
        openPayHerePopup(response.data.data);
      }
    } catch (error) {
      notify.error(error.response?.data?.message || "Payment initiation failed.");
      setLoading(false);
    }
  };

  const openPayHerePopup = (data) => {
    if (!window.payhere) {
      notify.error("PayHere SDK not loaded! Check internet connection.");
      setLoading(false);
      return;
    }

    const appUrl = import.meta.env.VITE_APP_BASE_URL;
    const notifyUrl = import.meta.env.VITE_PAYHERE_NOTIFY_URL;
    // Check for 'true' string explicitly for env variable
    const isSandbox = import.meta.env.VITE_PAYHERE_IS_SANDBOX === 'true'; 

    const paymentObject = {
      sandbox: isSandbox,
      merchant_id: data.merchantId,
      return_url: `${appUrl}/payment-success`,
      cancel_url: `${appUrl}/payment-cancel`,
      notify_url: notifyUrl,
      order_id: data.orderId,
      items: data.items,
      amount: data.amount.toFixed(2),
      currency: data.currency,
      hash: data.hash,
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email,
      phone: data.contactNumber,
      address: data.address,
      city: data.city,
      country: data.country,
    };

    window.payhere.onCompleted = async function onCompleted(orderId) {
      setLoading(true);
      try {
        // Wait slightly for webhook processing (optional but safer)
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Verify Payment
        const res = await paymentService.verifyPayment(orderId);
        const status = res.data.data.paymentStatus;

        if (status === "APPROVED") {
          notify.success("Payment Verified & Booking Confirmed!");
          navigate("/booking-success", {
            state: {
              ...formData,
              orderId,
              bedNumber,
              roomNumber,
              checkIn,
              checkOut,
              amount: totalAmount,
            },
          });
        } else {
          notify.warn("Payment verification pending. Please check status later.");
          navigate("/payment-success?order_id=" + orderId); // Fallback page
        }
      } catch (error) {
        console.error(error);
        notify.error("Failed to verify payment status.");
        navigate("/payment-success?order_id=" + orderId);
      } finally {
        setLoading(false);
      }
    };

    window.payhere.onDismissed = function onDismissed() {
      setLoading(false);
      notify.info("Payment Cancelled by user.");
    };

    window.payhere.onError = function onError(error) {
      setLoading(false);
      console.error("PayHere Error:", error);
      notify.error("Payment Gateway Error. Please try again.");
    };

    window.payhere.startPayment(paymentObject);
  };

  return (
    <div className="reservation-container">
      {/* --- Left Side: Input Form --- */}
      <div className="res-left-panel">
        <div className="res-header">
          <button className="res-back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} /> Back
          </button>
          <h1 className="res-title">Student Details</h1>
          <p className="res-subtitle">Please complete your registration to secure your spot.</p>
        </div>

        {reservedFor && (
          <div className={`res-warning-box ${reservedFor === "BOYS" ? "info-blue" : "info-pink"}`}>
            <AlertTriangle size={16} />
            This room is reserved for <strong>{reservedFor}</strong> students only.
          </div>
        )}

        <form onSubmit={handlePayment}>
          <div className="res-form-grid">
            <div className="res-input-group">
              <label className="res-label">Full Name <span style={{color:'red'}}>*</span></label>
              <div className="res-input-wrapper">
                <User size={18} className="res-input-icon" />
                <input
                  name="studentName"
                  required
                  onChange={handleInputChange}
                  className="res-input"
                  placeholder="John Doe"
                  value={formData.studentName}
                  disabled={loading}
                />
              </div>
            </div>
            <div className="res-input-group">
              <label className="res-label">Student ID <span style={{color:'red'}}>*</span></label>
              <div className="res-input-wrapper">
                <CreditCard size={18} className="res-input-icon" />
                <input
                  name="registrationNumber"
                  required
                  onChange={handleInputChange}
                  className="res-input"
                  placeholder="ITxxxxxx"
                  value={formData.registrationNumber}
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          <div className="res-form-grid">
            <div className="res-input-group">
              <label className="res-label">Email Address <span style={{color:'red'}}>*</span></label>
              <div className="res-input-wrapper">
                <Mail size={18} className="res-input-icon" />
                <input
                  type="email"
                  name="email"
                  required
                  onChange={handleInputChange}
                  className="res-input"
                  placeholder="student@email.com"
                  value={formData.email}
                  disabled={loading}
                />
              </div>
            </div>
            <div className="res-input-group">
              <label className="res-label">Phone Number <span style={{color:'red'}}>*</span></label>
              <div className="res-input-wrapper">
                <Phone size={18} className="res-input-icon" />
                <input
                  name="contactNumber"
                  required
                  onChange={handleInputChange}
                  className="res-input"
                  placeholder="07xxxxxxxx"
                  value={formData.contactNumber}
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          <div className="res-input-group">
            <label className="res-label">Residential Address <span style={{color:'red'}}>*</span></label>
            <div className="res-input-wrapper">
              <MapPin size={18} className="res-input-icon" />
              <input
                name="address"
                required
                onChange={handleInputChange}
                className="res-input"
                placeholder="Your home address"
                value={formData.address}
                disabled={loading}
              />
            </div>
          </div>

          <div className="res-input-group">
            <label className="res-label">Gender <span style={{color:'red'}}>*</span></label>
            <select
              name="gender"
              onChange={handleInputChange}
              value={formData.gender}
              className="res-select"
              disabled={loading}
            >
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>
          </div>
        </form>
      </div>

      {/* --- Right Side: Ticket Summary --- */}
      <div className="res-right-panel">
        <div className="res-bg-circle-1"></div>
        <div className="res-bg-circle-2"></div>

        <div className="res-ticket-card">
          <div className="res-ticket-header">
            <h2 className="res-ticket-title">Booking Summary</h2>
            <p className="res-ticket-sub">Review your booking details.</p>
          </div>

          <div className="res-room-box">
            <div className="res-room-item">
              <span className="res-room-label">Room</span>
              <span className="res-room-value">
                <Building2 size={16} /> {roomNumber}
              </span>
            </div>
            <div className="res-room-separator"></div>
            <div className="res-room-item">
              <span className="res-room-label">Bed No</span>
              <span className="res-room-value">
                <BedDouble size={16} /> {bedNumber}
              </span>
            </div>
          </div>

          <div className="res-date-line">
            <span className="res-date-label">
              <Calendar size={15} opacity={0.7} /> Check-in
            </span>
            <span className="res-date-val">{checkIn}</span>
          </div>
          <div className="res-date-line">
            <span className="res-date-label">
              <CheckCircle2 size={15} opacity={0.7} /> Check-out
            </span>
            <span className="res-date-val">{checkOut}</span>
          </div>

          {reservedFor && (
            <div className="res-reserved-note">
              RESERVED FOR: {reservedFor}
            </div>
          )}

          <div className="res-total-section">
            <span className="res-total-label">Total Payable</span>
            <span className="res-total-value">
              {priceLoading ? (
                <Loader2 size={24} className="animate-spin" />
              ) : (
                `LKR ${typeof totalAmount === "number" ? totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2 }) : "0.00"}`
              )}
            </span>
          </div>

          <button
            onClick={handlePayment}
            className="res-pay-btn"
            disabled={loading || priceLoading}
          >
            {loading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <>
                Pay Securely <CreditCard size={18} />
              </>
            )}
          </button>

          <div className="res-footer-note">
            <ShieldCheck size={12} /> Secured by PayHere Payment Gateway
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reservation;