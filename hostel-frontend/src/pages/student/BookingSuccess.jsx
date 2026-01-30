import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useNotification } from "../../context/NotificationContext";
import jsPDF from "jspdf";
import {
  CheckCircle,
  Copy,
  Home,
  MapPin,
  User,
  Download,
  Loader2,
  ArrowRight,
  Receipt,
  Mail,
  Phone,
} from "lucide-react";
import "./styles/BookingSuccess.css";

const BookingSuccess = () => {
  const notify = useNotification();
  const location = useLocation();
  const navigate = useNavigate();

  const [isCopied, setIsCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const {
    orderId,
    studentName,
    studentId,
    studentEmail,
    studentPhone,
    bedNumber,
    roomNumber,
    checkIn,
    checkOut,
    amount,
  } = location.state || {};

  const [paymentTime] = useState(
    new Date().toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
  );

  useEffect(() => {
    if (!orderId) {
      navigate("/");
    }
  }, [orderId, navigate]);

  const handleCopy = () => {
    if (!orderId) return;
    navigator.clipboard.writeText(orderId);
    setIsCopied(true);
    notify.success("Reference ID Copied!");
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownload = () => {
    setIsDownloading(true);
    try {
      const doc = new jsPDF();

      const displayStudentId =
        studentId || location.state?.studentRegNo || "N/A";
      const formattedAmount = amount
        ? parseFloat(amount).toLocaleString("en-US", {
            minimumFractionDigits: 2,
          })
        : "0.00";

      let nights = 1;
      let duration = "1 Month";
      if (checkIn && checkOut) {
        const start = new Date(checkIn);
        const end = new Date(checkOut);
        const diffTime = Math.abs(end - start);
        nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        duration =
          nights > 30
            ? `${Math.floor(nights / 30)} Month(s)`
            : `${nights} Night(s)`;
      }

      const primary = [25, 118, 210];
      const secondary = [13, 71, 161];
      const accent = [255, 152, 0];
      const success = [46, 125, 50];
      const textDark = [33, 33, 33];
      const textLight = [97, 97, 97];
      const bgLight = [245, 245, 245];
      const highlight = [255, 243, 224];

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;

      doc.setFillColor(primary[0], primary[1], primary[2]);
      doc.rect(0, 0, pageWidth, 45, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(28);
      doc.text("HOSTEL PMS", margin, 20);

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text("NSBM Green University", margin, 28);

      doc.setFillColor(255, 255, 255);
      doc.roundedRect(pageWidth - 65, 12, 50, 20, 2, 2, "F");
      doc.setTextColor(primary[0], primary[1], primary[2]);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("RECEIPT", pageWidth - 40, 20, { align: "center" });
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(`#${orderId || "000001"}`, pageWidth - 40, 27, {
        align: "center",
      });

      let y = 55;

      doc.setTextColor(textDark[0], textDark[1], textDark[2]);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("FROM:", margin, y);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(textLight[0], textLight[1], textLight[2]);
      y += 5;
      doc.text("Hostel Property Management System", margin, y);
      y += 4;
      doc.text("Homagama, Western Province", margin, y);
      y += 4;
      doc.text("Sri Lanka", margin, y);
      y += 4;
      doc.text("📧 support@hostel.lk", margin, y);
      y += 4;
      doc.text("🌐 www.hostel.lk", margin, y);

      y = 55;
      const rightX = 120;
      doc.setTextColor(textDark[0], textDark[1], textDark[2]);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("RECEIPT DETAILS:", rightX, y);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      y += 5;
      doc.setTextColor(textLight[0], textLight[1], textLight[2]);
      doc.text("Issue Date:", rightX, y);
      doc.setTextColor(textDark[0], textDark[1], textDark[2]);
      doc.text(new Date().toLocaleDateString("en-GB"), rightX + 30, y);

      y += 4;
      doc.setTextColor(textLight[0], textLight[1], textLight[2]);
      doc.text("Payment Status:", rightX, y);
      doc.setTextColor(success[0], success[1], success[2]);
      doc.setFont("helvetica", "bold");
      doc.text("✓ PAID", rightX + 30, y);

      y += 15;

      doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
      doc.roundedRect(margin, y, pageWidth - 2 * margin, 28, 2, 2, "F");

      y += 6;
      doc.setTextColor(primary[0], primary[1], primary[2]);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("BILLED TO:", margin + 5, y);

      y += 6;
      doc.setTextColor(textDark[0], textDark[1], textDark[2]);
      doc.setFontSize(11);
      doc.text(studentName || "Guest Student", margin + 5, y);

      y += 5;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(textLight[0], textLight[1], textLight[2]);
      doc.text(`Student ID: ${displayStudentId}`, margin + 5, y);

      y += 4;
      if (studentEmail) doc.text(`📧 ${studentEmail}`, margin + 5, y);

      y += 4;
      if (studentPhone) doc.text(`📱 ${studentPhone}`, margin + 5, y);

      y += 20;

      doc.setFillColor(secondary[0], secondary[1], secondary[2]);
      doc.rect(margin, y, pageWidth - 2 * margin, 10, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text("DESCRIPTION", margin + 3, y + 6);
      doc.text("DURATION", 100, y + 6, { align: "center" });
      doc.text("QTY", 130, y + 6, { align: "center" });
      doc.text("RATE", 155, y + 6, { align: "right" });
      doc.text("AMOUNT", pageWidth - margin - 3, y + 6, { align: "right" });

      y += 15;
      doc.setTextColor(textDark[0], textDark[1], textDark[2]);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text(`Hostel Accommodation Fee`, margin + 3, y);

      y += 5;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(textLight[0], textLight[1], textLight[2]);
      doc.text(`Room: ${roomNumber} | Bed: ${bedNumber}`, margin + 3, y);

      y += 4;
      doc.text(`Check-in: ${checkIn}`, margin + 3, y);
      y += 4;
      doc.text(`Check-out: ${checkOut}`, margin + 3, y);

      y -= 8;
      doc.setTextColor(textDark[0], textDark[1], textDark[2]);
      doc.text(duration, 100, y, { align: "center" });
      doc.text("1", 130, y, { align: "center" });
      doc.text(formattedAmount, 155, y, { align: "right" });
      doc.text(formattedAmount, pageWidth - margin - 3, y, { align: "right" });

      y += 18;
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.line(margin, y, pageWidth - margin, y);

      y += 10;
      const summaryX = 125;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(textLight[0], textLight[1], textLight[2]);

      doc.text("Subtotal:", summaryX, y);
      doc.setTextColor(textDark[0], textDark[1], textDark[2]);
      doc.text(`LKR ${formattedAmount}`, pageWidth - margin, y, {
        align: "right",
      });

      y += 6;
      doc.setTextColor(textLight[0], textLight[1], textLight[2]);
      doc.text("Tax (0%):", summaryX, y);
      doc.setTextColor(textDark[0], textDark[1], textDark[2]);
      doc.text("LKR 0.00", pageWidth - margin, y, { align: "right" });

      y += 6;
      doc.setTextColor(textLight[0], textLight[1], textLight[2]);
      doc.text("Discount:", summaryX, y);
      doc.setTextColor(textDark[0], textDark[1], textDark[2]);
      doc.text("LKR 0.00", pageWidth - margin, y, { align: "right" });

      y += 8;
      doc.setFillColor(highlight[0], highlight[1], highlight[2]);
      doc.roundedRect(
        summaryX - 5,
        y - 5,
        pageWidth - margin - summaryX + 5,
        12,
        2,
        2,
        "F",
      );

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(secondary[0], secondary[1], secondary[2]);
      doc.text("TOTAL AMOUNT:", summaryX, y + 3);
      doc.setTextColor(accent[0], accent[1], accent[2]);
      doc.setFontSize(14);
      doc.text(`LKR ${formattedAmount}`, pageWidth - margin, y + 3, {
        align: "right",
      });

      y += 25;

      doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
      doc.roundedRect(margin, y, pageWidth - 2 * margin, 25, 2, 2, "F");

      y += 6;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(primary[0], primary[1], primary[2]);
      doc.text("PAYMENT INFORMATION", margin + 5, y);

      y += 5;
      doc.setFont("helvetica", "normal");
      doc.setTextColor(textDark[0], textDark[1], textDark[2]);
      doc.text("Payment Method: Online Portal Transfer", margin + 5, y);

      y += 4;
      doc.text(
        `Transaction Date: ${new Date().toLocaleDateString("en-GB")}`,
        margin + 5,
        y,
      );

      y += 4;
      doc.setTextColor(success[0], success[1], success[2]);
      doc.text("✓ Payment successfully received and confirmed", margin + 5, y);

      y = pageHeight - 35;

      doc.setDrawColor(primary[0], primary[1], primary[2]);
      doc.setLineWidth(1);
      doc.line(margin, y, pageWidth - margin, y);

      y += 8;
      doc.setTextColor(textLight[0], textLight[1], textLight[2]);
      doc.setFont("helvetica", "italic");
      doc.setFontSize(9);
      doc.text("Thank you for choosing Hostel PMS!", pageWidth / 2, y, {
        align: "center",
      });

      y += 5;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text(
        "For any queries, please contact us at support@hostel.lk or visit www.hostel.lk",
        pageWidth / 2,
        y,
        { align: "center" },
      );

      y += 8;
      doc.setTextColor(textLight[0], textLight[1], textLight[2]);
      doc.setFontSize(7);
      doc.text(
        "This is a computer-generated receipt and does not require a signature.",
        pageWidth / 2,
        y,
        { align: "center" },
      );

      doc.save(`HostelReceipt_${orderId}_${displayStudentId}.pdf`);
      notify.success("Receipt downloaded successfully!");
    } catch (error) {
      console.error("PDF Generation Error:", error);
      notify.error("Failed to generate receipt. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  if (!orderId) return null;

  return (
    <div className="booking-success-container">
      <div className="bs-bg-pattern"></div>

      <div className="bs-main-wrapper">
        <div className="bs-card-container">
          <div className="bs-receipt-card">
            {/* Header / Success Banner */}
            <div className="bs-success-banner">
              <div className="bs-icon-pulse">
                <CheckCircle size={48} color="#ffffff" strokeWidth={2.5} />
              </div>
              <h1 className="bs-title">Payment Successful!</h1>
              <p className="bs-subtitle">Your booking is confirmed.</p>
            </div>

            <div className="bs-receipt-body">
              {/* Reference ID Row */}
              <div className="bs-ref-row">
                <div className="bs-ref-label">Reference ID</div>
                <div
                  className="bs-ref-value clickable"
                  onClick={handleCopy}
                  title="Click to Copy"
                >
                  {orderId}
                  {isCopied ? (
                    <CheckCircle size={14} color="#10b981" />
                  ) : (
                    <Copy size={14} color="#64748b" />
                  )}
                </div>
                <div className="bs-ref-time">{paymentTime}</div>
              </div>

              <div className="bs-divider"></div>

              {/* Timeline Section */}
              <div className="bs-timeline-section">
                <div className="bs-timeline-box">
                  <span className="bs-t-label">Check-in</span>
                  <span className="bs-t-date">{checkIn}</span>
                </div>
                <div className="bs-timeline-arrow">
                  <ArrowRight size={20} color="#94a3b8" />
                </div>
                <div className="bs-timeline-box right">
                  <span className="bs-t-label">Check-out</span>
                  <span className="bs-t-date">{checkOut}</span>
                </div>
              </div>

              {/* Details Grid */}
              <div className="bs-grid-section">
                <div className="bs-grid-item">
                  <div className="bs-grid-icon">
                    <User size={16} />
                  </div>
                  <div className="bs-grid-info">
                    <span className="bs-g-label">Student</span>
                    <span className="bs-g-val">{studentName}</span>
                    <span className="bs-g-sub">{studentId}</span>
                  </div>
                </div>
                <div className="bs-grid-item">
                  <div className="bs-grid-icon">
                    <MapPin size={16} />
                  </div>
                  <div className="bs-grid-info">
                    <span className="bs-g-label">Room / Bed</span>
                    <span className="bs-g-val">{roomNumber}</span>
                    <span className="bs-g-sub">Bed No: {bedNumber}</span>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="bs-contact-mini">
                <span>
                  <Mail size={12} /> {studentEmail}
                </span>
                {studentPhone && (
                  <span>
                    <Phone size={12} /> {studentPhone}
                  </span>
                )}
              </div>

              {/* Total Amount */}
              <div className="bs-total-box">
                <span className="bs-total-text">Total Paid</span>
                <span className="bs-total-amount">
                  LKR{" "}
                  {amount
                    ? parseFloat(amount).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })
                    : "0.00"}
                </span>
              </div>
            </div>

            <div className="bs-receipt-footer">
              <Receipt size={14} /> Generated via Hostel Management System
            </div>
          </div>

          <div className="bs-actions">
            
            <button
              className="bs-btn-primary"
              onClick={handleDownload}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Download size={18} />
              )}
              {isDownloading ? "Generating..." : "Download Receipt"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccess;
