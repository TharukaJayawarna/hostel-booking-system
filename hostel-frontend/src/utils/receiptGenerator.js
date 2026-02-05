// src/utils/receiptGenerator.js
import jsPDF from "jspdf";
import logoImage from "../assets/logo.png"; // Ensure this path is correct

export const generateReceiptPDF = ({
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
}) => {
  const doc = new jsPDF("p", "mm", "a4");

  /* ------------------ Helpers ------------------ */
  const formatCurrency = (val) =>
    val
      ? parseFloat(val).toLocaleString("en-LK", {
          minimumFractionDigits: 2,
        })
      : "0.00";

  const formattedAmount = formatCurrency(amount);
  const currentDate = new Date().toLocaleDateString("en-GB");

  // Calculate Duration
  let duration = "1 Month";
  if (checkIn && checkOut) {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    duration =
      nights > 30
        ? `${Math.floor(nights / 30)} Month(s)`
        : `${nights} Night(s)`;
  }

  /* ------------------ Colors (Blue Theme) ------------------ */
  const colors = {
    primary: [41, 128, 185],    // Professional Blue
    dark: [44, 62, 80],         // Dark Slate
    text: [60, 60, 60],         // Dark Grey
    textLight: [120, 120, 120], // Light Grey
    bgLight: [248, 250, 252],   // Very Light Blue/Grey
    border: [230, 230, 230],    // Light Border
    white: [255, 255, 255],
    success: [39, 174, 96],     // Green
    watermark: [240, 240, 240], // Light Watermark
  };

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let y = 0;

  /* ================= WATERMARK ================= */
  doc.setTextColor(...colors.watermark);
  doc.setFontSize(60);
  doc.setFont("helvetica", "bold");
  
  doc.saveGraphicsState();
  doc.setGState(new doc.GState({ opacity: 0.5 }));
  doc.text("SLTC HOSTEL", pageWidth / 2, pageHeight / 2, {
    align: "center",
    angle: 45,
    baseline: "middle"
  });
  doc.restoreGraphicsState();

  /* ================= HEADER SECTION ================= */
  const headerHeight = 40;
  
  // Top Banner Background
  doc.setFillColor(...colors.primary);
  doc.rect(0, 0, pageWidth, headerHeight, "F"); 

  // --- LOGO & BACKGROUND CONFIGURATION ---
  const boxWidth = 32;
  const boxHeight = 30;
  
  // Calculate Y to center the box vertically in the header
  // (40 - 30) / 2 = 5
  const boxY = (headerHeight - boxHeight) / 2; 
  
  // 1. Draw White Container Box (Vertically Centered)
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(margin, boxY, boxWidth, boxHeight, 2, 2, "F");

  // 2. Add Logo Image (Centered inside the White Box)
  const logoSize = 26; // Image size
  const logoX = margin + (boxWidth - logoSize) / 2; // Center horizontally in box
  const logoY = boxY + (boxHeight - logoSize) / 2;  // Center vertically in box

  try {
    doc.addImage(logoImage, "PNG", logoX, logoY, logoSize, logoSize);
  } catch (error) {
    // Fallback if image fails
    doc.setTextColor(...colors.primary);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("SLTC", logoX + 10, logoY + 12);
  }

  // --- UNIVERSITY DETAILS (Vertically Centered with Logo) ---
  const headerTextX = margin + boxWidth + 5; // Start after the white box
  
  // We align text block to be vertically centered relative to headerHeight (40)
  // Text Block Approx Height: Title(6) + Sub1(5) + Sub2(5) + Sub3(5) = ~21mm
  // Start Y roughly at 13mm to center the block
  
  doc.setTextColor(...colors.white);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("SLTC RESEARCH UNIVERSITY", headerTextX, 13);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Hostel Management Division", headerTextX, 19);
  doc.text("Ingiriya Road, Padukka, Sri Lanka", headerTextX, 24);
  doc.text("Web: www.sltc.ac.lk | Tel: +94 11 2100 500", headerTextX, 29);

  // --- RECEIPT BOX (Far Right) ---
  const receiptBoxWidth = 50;
  const receiptBoxHeight = 24;
  const receiptBoxX = pageWidth - margin - receiptBoxWidth;
  const receiptBoxY = (headerHeight - receiptBoxHeight) / 2; // Center vertically
  
  doc.setFillColor(...colors.white);
  doc.roundedRect(receiptBoxX, receiptBoxY, receiptBoxWidth, receiptBoxHeight, 2, 2, "F");
  
  doc.setTextColor(...colors.dark);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("RECEIPT", receiptBoxX + (receiptBoxWidth/2), receiptBoxY + 9, { align: "center" });
  
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...colors.primary);
  doc.text(`# ${orderId || "REF-0000"}`, receiptBoxX + (receiptBoxWidth/2), receiptBoxY + 17, { align: "center" });

  y = 60; // Start body content below header

  /* ================= INFO COLUMNS ================= */
  const colLeft = margin;
  const colRight = pageWidth / 2 + 10;

  // --- Left Column: BILL TO ---
  doc.setFontSize(10);
  doc.setTextColor(...colors.dark);
  doc.setFont("helvetica", "bold");
  doc.text("BILLED TO:", colLeft, y);
  
  doc.setDrawColor(...colors.primary);
  doc.setLineWidth(0.5);
  doc.line(colLeft, y + 2, colLeft + 25, y + 2);

  y += 10;
  doc.setFontSize(11);
  doc.text(studentName || "Guest Student", colLeft, y);

  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...colors.text);
  
  const displayId = studentId ? studentId : "N/A";
  doc.text(`Student ID: ${displayId}`, colLeft, y);
  y += 5;
  if (studentEmail) doc.text(studentEmail, colLeft, y);
  y += 5;
  if (studentPhone) doc.text(studentPhone, colLeft, y);

  // --- Right Column: ACCOMMODATION ---
  let yRight = 60;
  doc.setTextColor(...colors.dark);
  doc.setFont("helvetica", "bold");
  doc.text("ACCOMMODATION DETAILS:", colRight, yRight);
  
  doc.line(colRight, yRight + 2, colRight + 55, yRight + 2);

  yRight += 10;
  doc.setTextColor(...colors.text);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  const printDetail = (label, value, currentY) => {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...colors.dark);
    doc.text(label, colRight, currentY);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...colors.text);
    doc.text(value, colRight + 30, currentY);
  };

  printDetail("Room No:", roomNumber || "-", yRight);
  yRight += 6;
  printDetail("Bed No:", bedNumber || "-", yRight);
  yRight += 6;
  printDetail("Check-in:", checkIn || "-", yRight);
  yRight += 6;
  printDetail("Check-out:", checkOut || "-", yRight);
  yRight += 6;
  printDetail("Duration:", duration, yRight);

  y = Math.max(y, yRight) + 15;

  /* ================= META BAR ================= */
  doc.setFillColor(...colors.bgLight);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 14, 2, 2, "F");
  
  const barY = y + 9;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...colors.dark);
  doc.text(`Issued Date: ${currentDate}`, margin + 5, barY);
  doc.text("Status: PAID", pageWidth / 2, barY, { align: "center" });
  doc.text("Method: Online Transfer", pageWidth - margin - 5, barY, { align: "right" });

  y += 25;

  /* ================= PAYMENT TABLE ================= */
  // Header
  doc.setFillColor(...colors.dark);
  doc.rect(margin, y, pageWidth - margin * 2, 10, "F");

  const colDesc = margin + 5;
  const colAmount = pageWidth - margin - 5;

  doc.setTextColor(...colors.white);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("DESCRIPTION", colDesc, y + 6);
  doc.text("AMOUNT (LKR)", colAmount, y + 6, { align: "right" });

  y += 16;

  // Row
  doc.setTextColor(...colors.dark);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Hostel Accommodation Fee", colDesc, y);

  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...colors.textLight);
  doc.text(`Period: ${checkIn} to ${checkOut}`, colDesc, y);

  // Amount
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...colors.dark);
  doc.text(formattedAmount, colAmount, y - 5, { align: "right" });

  y += 8;
  doc.setDrawColor(...colors.border);
  doc.line(margin, y, pageWidth - margin, y);

  /* ================= TOTAL SECTION ================= */
  y += 10;
  const summaryX = pageWidth - margin - 60;
  const valueX = pageWidth - margin - 5;

  // Total Box
  doc.setFillColor(...colors.primary);
  doc.roundedRect(summaryX - 5, y - 6, 65, 12, 1, 1, "F");

  doc.setTextColor(...colors.white);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("TOTAL PAID", summaryX, y + 2);
  doc.text(formattedAmount, valueX, y + 2, { align: "right" });

  /* ================= FOOTER SECTION ================= */
  const footerY = pageHeight - 35;
  
  doc.setDrawColor(...colors.primary);
  doc.setLineWidth(0.5);
  doc.line(margin, footerY, pageWidth - margin, footerY);

  const fY = footerY + 8;
  
  doc.setFontSize(8);
  doc.setTextColor(...colors.dark);
  doc.setFont("helvetica", "bold");
  doc.text("SLTC RESEARCH UNIVERSITY", margin, fY);
  
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...colors.textLight);
  doc.text("Ingiriya Road, Padukka, Sri Lanka", margin, fY + 4);
  doc.text("info@sltc.ac.lk | www.sltc.ac.lk", margin, fY + 8);

  doc.text("This receipt is computer generated and valid without signature.", pageWidth - margin, fY, { align: "right" });
  doc.text("Generated by Hostel Management System", pageWidth - margin, fY + 4, { align: "right" });

  /* ================= SAVE PDF ================= */
  doc.save(`Receipt_${orderId || "HOSTEL"}.pdf`);
};