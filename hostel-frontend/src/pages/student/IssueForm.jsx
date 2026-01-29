import React, { useState, useEffect } from "react";
import { useNotification } from "../../context/NotificationContext";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  CreditCard,
  Calendar,
  Send,
  ArrowLeft,
  AlertCircle,
  Building2,
  Hash,
  Loader2,
} from "lucide-react";
import "./styles/IssueForm.css";

import issueService from "../../services/issue.service";

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
    checkinDate: "",
    checkoutDate: "",
    bank: "",
    paymentDoneDate: "",
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.studentName.trim() ||
      !formData.studentId.trim() ||
      !formData.comment.trim()
    ) {
      notify.warning(
        "Please fill in all required fields (Name, ID, Description).",
      );
      return;
    }

    if (formData.checkinDate && formData.checkoutDate) {
      if (new Date(formData.checkinDate) >= new Date(formData.checkoutDate)) {
        notify.error("Check-out date must be after Check-in date.");
        return;
      }
    }

    setLoading(true);
    try {
      await issueService.reportIssue(formData);

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
          <button
            className="issue-back-btn"
            onClick={() => navigate("/")}
            type="button"
          >
            <ArrowLeft size={16} /> Back Home
          </button>
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
            <User size={20} className="issue-section-icon" /> Student
            Information
          </div>
          <div className="issue-grid">
            <div className="issue-input-group">
              <label className="issue-label">
                Full Name <span style={{ color: "red" }}>*</span>
              </label>
              <div className="issue-input-wrapper">
                <User size={18} className="issue-input-icon" />
                <input
                  name="studentName"
                  required
                  value={formData.studentName}
                  onChange={handleChange}
                  className="issue-input"
                  placeholder="Kamal Perera"
                  disabled={loading}
                />
              </div>
            </div>
            <div className="issue-input-group">
              <label className="issue-label">
                Student ID / Reg No <span style={{ color: "red" }}>*</span>
              </label>
              <div className="issue-input-wrapper">
                <Hash size={18} className="issue-input-icon" />
                <input
                  name="studentId"
                  required
                  value={formData.studentId}
                  onChange={handleChange}
                  className="issue-input"
                  placeholder="IT20001234"
                  disabled={loading}
                />
              </div>
            </div>
            <div className="issue-input-group">
              <label className="issue-label">
                Email Address <span style={{ color: "red" }}>*</span>
              </label>
              <div className="issue-input-wrapper">
                <Mail size={18} className="issue-input-icon" />
                <input
                  type="email"
                  name="studentEmail"
                  required
                  value={formData.studentEmail}
                  onChange={handleChange}
                  className="issue-input"
                  placeholder="student@university.edu"
                  disabled={loading}
                />
              </div>
            </div>
            <div className="issue-input-group">
              <label className="issue-label">Phone Number</label>
              <div className="issue-input-wrapper">
                <Phone size={18} className="issue-input-icon" />
                <input
                  name="studentPhone"
                  value={formData.studentPhone}
                  onChange={handleChange}
                  className="issue-input"
                  placeholder="077xxxxxxx"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* 2. Reservation Context */}
          <div className="issue-section-title">
            <Calendar size={20} className="issue-section-icon" /> Booking &
            Payment Details
          </div>
          <div className="issue-grid">
            <div className="issue-input-group">
              <label className="issue-label">Check-in Date</label>
              <div className="issue-input-wrapper">
                <Calendar size={18} className="issue-input-icon" />
                <input
                  type="date"
                  name="checkinDate"
                  value={formData.checkinDate}
                  className="issue-input"
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>
            <div className="issue-input-group">
              <label className="issue-label">Check-out Date</label>
              <div className="issue-input-wrapper">
                <Calendar size={18} className="issue-input-icon" />
                <input
                  type="date"
                  name="checkoutDate"
                  value={formData.checkoutDate}
                  className="issue-input"
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="issue-input-group">
              <label className="issue-label">Duration</label>
              <select
                name="duration"
                value={formData.duration}
                className="issue-select"
                onChange={handleChange}
                disabled={loading}
              >
                <option value="1 Month">1 Month</option>
                <option value="2 Months">2 Months</option>
                <option value="3 Months">3 Months</option>
                <option value="Less than 1 Month">Less than 1 Month</option>
                <option value="Less than 2 Months">Less than 2 Months</option>
                <option value="Less than 3 Month">Less than 3 Months</option>
              </select>
            </div>

            <div className="issue-input-group">
              <label className="issue-label">Bank / Payment Method</label>
              <div className="issue-input-wrapper">
                <Building2 size={18} className="issue-input-icon" />
                <input
                  name="bank"
                  value={formData.bank}
                  className="issue-input"
                  onChange={handleChange}
                  placeholder="e.g. PayHere, BOC"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="issue-input-group">
              <label className="issue-label">Payment Date</label>
              <div className="issue-input-wrapper">
                <Calendar size={18} className="issue-input-icon" />
                <input
                  type="date"
                  name="paymentDoneDate"
                  value={formData.paymentDoneDate}
                  className="issue-input"
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="issue-input-group">
              <label className="issue-label">Last 4 Digits (Reference)</label>
              <div className="issue-input-wrapper">
                <CreditCard size={18} className="issue-input-icon" />
                <input
                  name="cardLastFour"
                  value={formData.cardLastFour}
                  className="issue-input monospace-input"
                  onChange={handleChange}
                  placeholder="XXXX"
                  maxLength={4}
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* 3. Issue Description */}
          <div className="issue-section-title">
            <AlertCircle size={20} className="issue-section-icon danger" />{" "}
            Describe Your Issue
          </div>
          <div style={{ marginBottom: "30px" }}>
            <div className="issue-input-group">
              <label className="issue-label">
                Detailed Description <span style={{ color: "red" }}>*</span>
              </label>
              <textarea
                required
                name="comment"
                value={formData.comment}
                className="issue-textarea"
                onChange={handleChange}
                placeholder="Please explain the issue clearly..."
                disabled={loading}
              />
            </div>
          </div>

          <div className="issue-btn-container">
            <button
              type="button"
              className="issue-cancel-btn"
              onClick={() => navigate("/")}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="issue-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Send size={18} />
              )}
              {loading ? "Sending..." : "Submit Ticket"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IssueForm;
