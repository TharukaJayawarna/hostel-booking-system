import React, { useState, useEffect } from "react";
import { useNotification } from "../../context/NotificationContext";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker"; 
import "react-datepicker/dist/react-datepicker.css"; 

import {
  User,
  Mail,
  Phone,
  CreditCard,
  Calendar,
  Send,
  AlertCircle,
  Building2,
  Hash,
  Loader2,
  ChevronDown, 
} from "lucide-react";
import "./styles/IssueForm.css";

import issueService from "../../services/issue.service";

// 1. Updated Bank List (PayHere Removed)
const SRI_LANKAN_BANKS = [
  "Bank of Ceylon (BOC)",
  "People's Bank",
  "Commercial Bank",
  "Hatton National Bank (HNB)",
  "Sampath Bank",
  "Seylan Bank",
  "National Savings Bank (NSB)",
  "Nations Trust Bank (NTB)",
  "DFCC Bank",
  "Union Bank",
  "Pan Asia Bank",
  "Standard Chartered Bank",
  "HSBC",
  "Cargills Bank",
  "Amana Bank",
  "Other",
];

const IssueForm = () => {
  const notify = useNotification();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    studentName: "",
    studentId: "",
    studentEmail: "",
    studentPhone: "",
    duration: "1 Month",
    checkinDate: null, 
    checkoutDate: null,
    bank: "",
    customBank: "", // 2. New state for custom bank name
    paymentDoneDate: null,
    cardLastFour: "",
    comment: "",
  });

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setFormData((prev) => ({
          ...prev,
          studentName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
          studentEmail: user.email || "",
          studentPhone: user.phone || "",
        }));
      } catch (e) {
        console.error("Error parsing user data", e);
      }
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDateChange = (date, name) => {
    setFormData({ ...formData, [name]: date });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.studentName.trim() ||
      !formData.studentId.trim() ||
      !formData.comment.trim()
    ) {
      notify.warning("Please fill in all required fields (Name, ID, Description).");
      return;
    }

    // Validation for Custom Bank
    if (formData.bank === "Other" && !formData.customBank.trim()) {
      notify.warning("Please specify the bank name.");
      return;
    }

    if (formData.checkinDate && formData.checkoutDate) {
      if (formData.checkinDate >= formData.checkoutDate) {
        notify.error("Check-out date must be after Check-in date.");
        return;
      }
    }

    setLoading(true);
    try {
      // 3. Logic to select the correct bank name
      const finalBankName = formData.bank === "Other" ? formData.customBank : formData.bank;

      const payload = {
        ...formData,
        bank: finalBankName, // Send the custom name if 'Other' is selected
        checkinDate: formData.checkinDate ? formData.checkinDate.toISOString().split('T')[0] : "",
        checkoutDate: formData.checkoutDate ? formData.checkoutDate.toISOString().split('T')[0] : "",
        paymentDoneDate: formData.paymentDoneDate ? formData.paymentDoneDate.toISOString().split('T')[0] : "",
      };

      // Remove customBank field from payload as backend might not expect it
      delete payload.customBank;

      await issueService.reportIssue(payload);
      notify.success("Issue reported successfully! Admin will contact you.");
      navigate("/");
    } catch (error) {
      notify.error(
        error.response?.data?.message ||
          "Failed to submit issue. Please try again.",
      );
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="issue-page-container">
      <div className="issue-inner-wrapper">
        <div className="issue-header">
          <div className="issue-title-box">
            <h1 className="issue-title">Report an Issue</h1>
            <p className="issue-subtitle">
              Facing a problem? Let us know and we'll fix it.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="issue-card">
          {/* 1. Student Info */}
          <div className="issue-section-title">
            <User size={20} className="issue-section-icon" /> Student Information
          </div>
          <div className="issue-grid">
            <div className="issue-input-group">
              <label className="issue-label">Full Name <span style={{ color: "red" }}>*</span></label>
              <div className="issue-input-wrapper">
                <User size={18} className="issue-input-icon" />
                <input name="studentName" required value={formData.studentName} onChange={handleChange} className="issue-input" disabled={loading} />
              </div>
            </div>
            <div className="issue-input-group">
              <label className="issue-label">Student ID / Reg No <span style={{ color: "red" }}>*</span></label>
              <div className="issue-input-wrapper">
                <Hash size={18} className="issue-input-icon" />
                <input name="studentId" required value={formData.studentId} onChange={handleChange} className="issue-input" disabled={loading} />
              </div>
            </div>
            <div className="issue-input-group">
              <label className="issue-label">Email Address <span style={{ color: "red" }}>*</span></label>
              <div className="issue-input-wrapper">
                <Mail size={18} className="issue-input-icon" />
                <input type="email" name="studentEmail" required value={formData.studentEmail} onChange={handleChange} className="issue-input" disabled={loading} />
              </div>
            </div>
            <div className="issue-input-group">
              <label className="issue-label">Phone Number</label>
              <div className="issue-input-wrapper">
                <Phone size={18} className="issue-input-icon" />
                <input name="studentPhone" value={formData.studentPhone} onChange={handleChange} className="issue-input" disabled={loading} />
              </div>
            </div>
          </div>

          {/* 2. Reservation Context */}
          <div className="issue-section-title">
            <Calendar size={20} className="issue-section-icon" /> Booking & Payment Details
          </div>
          <div className="issue-grid">
            <div className="issue-input-group">
              <label className="issue-label">Check-in Date</label>
              <div className="issue-input-wrapper date-picker-wrapper">
                <Calendar size={18} className="issue-input-icon z-10" />
                <DatePicker selected={formData.checkinDate} onChange={(date) => handleDateChange(date, "checkinDate")} className="issue-input" placeholderText="Select Date" dateFormat="yyyy-MM-dd" disabled={loading} />
              </div>
            </div>

            <div className="issue-input-group">
              <label className="issue-label">Check-out Date</label>
              <div className="issue-input-wrapper date-picker-wrapper">
                <Calendar size={18} className="issue-input-icon z-10" />
                <DatePicker selected={formData.checkoutDate} onChange={(date) => handleDateChange(date, "checkoutDate")} className="issue-input" placeholderText="Select Date" dateFormat="yyyy-MM-dd" minDate={formData.checkinDate} disabled={loading} />
              </div>
            </div>

            <div className="issue-input-group">
              <label className="issue-label">Duration</label>
              <div className="issue-input-wrapper">
                <select name="duration" value={formData.duration} className="issue-select" onChange={handleChange} disabled={loading}>
                  <option value="1 Month">1 Month</option>
                  <option value="2 Months">2 Months</option>
                  <option value="3 Months">3 Months</option>
                  <option value="Less than 1 Month">Less than 1 Month</option>
                  <option value="Less than 2 Months">Less than 2 Months</option>
                  <option value="Less than 3 Month">Less than 3 Months</option>
                </select>
                <ChevronDown size={16} className="issue-select-arrow" />
              </div>
            </div>

            {/* Bank Selection Dropdown */}
            <div className="issue-input-group">
              <label className="issue-label">Bank</label>
              <div className="issue-input-wrapper">
                <Building2 size={18} className="issue-input-icon" />
                <select
                  name="bank"
                  value={formData.bank}
                  onChange={handleChange}
                  className="issue-select"
                  disabled={loading}
                >
                  <option value="" disabled>Select Bank</option>
                  {SRI_LANKAN_BANKS.map((bank) => (
                    <option key={bank} value={bank}>{bank}</option>
                  ))}
                </select>
                <ChevronDown size={16} className="issue-select-arrow" />
              </div>
            </div>

            {/* 4. Conditional Input for 'Other' Bank */}
            {formData.bank === "Other" && (
              <div className="issue-input-group" style={{ animation: "fadeIn 0.3s" }}>
                <label className="issue-label">Specify Bank Name <span style={{ color: "red" }}>*</span></label>
                <div className="issue-input-wrapper">
                  <Building2 size={18} className="issue-input-icon" />
                  <input
                    name="customBank"
                    value={formData.customBank}
                    onChange={handleChange}
                    className="issue-input"
                    placeholder="Type your bank name here..."
                    disabled={loading}
                    required
                  />
                </div>
              </div>
            )}

            <div className="issue-input-group">
              <label className="issue-label">Payment Date</label>
              <div className="issue-input-wrapper date-picker-wrapper">
                <Calendar size={18} className="issue-input-icon z-10" />
                <DatePicker selected={formData.paymentDoneDate} onChange={(date) => handleDateChange(date, "paymentDoneDate")} className="issue-input" placeholderText="Select Date" dateFormat="yyyy-MM-dd" maxDate={new Date()} disabled={loading} />
              </div>
            </div>

            <div className="issue-input-group">
              <label className="issue-label">Last 4 Digits of the Card</label>
              <div className="issue-input-wrapper">
                <CreditCard size={18} className="issue-input-icon" />
                <input name="cardLastFour" value={formData.cardLastFour} className="issue-input monospace-input" onChange={handleChange} placeholder="XXXX" maxLength={4} disabled={loading} />
              </div>
            </div>
          </div>

          <div className="issue-section-title">
            <AlertCircle size={20} className="issue-section-icon danger" /> Describe Your Issue
          </div>
          <div style={{ marginBottom: "30px" }}>
            <div className="issue-input-group">
              <label className="issue-label">Detailed Description <span style={{ color: "red" }}>*</span></label>
              <textarea required name="comment" value={formData.comment} className="issue-textarea" onChange={handleChange} placeholder="Please explain the issue clearly..." disabled={loading} />
            </div>
          </div>

          <div className="issue-btn-container">
            <button type="button" className="issue-cancel-btn" onClick={() => navigate("/")} disabled={loading}>Cancel</button>
            <button type="submit" className="issue-submit-btn" disabled={loading}>
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              {loading ? "Sending..." : "Submit Ticket"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IssueForm;