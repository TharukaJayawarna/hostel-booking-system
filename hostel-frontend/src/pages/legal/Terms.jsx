import React from "react";
import "./styles/LegalPages.css";

const Terms = () => {
  return (
    <div className="legal-page-container">
      <div className="legal-content">
        <h1>Terms & Conditions</h1>
        <p className="last-updated">Last Updated: October 2024</p>

        <section>
          <h2>1. Introduction</h2>
          <p>Welcome to the SLTC Hostel Management System. By accessing or using this portal, you agree to be bound by these terms and the university's code of conduct.</p>
        </section>

        <section>
          <h2>2. Booking & Payments</h2>
          <p>All bookings are provisional until payment is confirmed. Hostel fees are non-refundable except under specific medical or academic withdrawal circumstances as per university policy.</p>
        </section>

        <section>
          <h2>3. Student Conduct</h2>
          <p>Ragging, violence, drug abuse, and alcohol consumption are strictly prohibited within the hostel premises. Violation of these rules will result in immediate expulsion and disciplinary action.</p>
        </section>

        <section>
          <h2>4. Property Damage</h2>
          <p>Students are responsible for the furniture and fittings in their rooms. Any damage caused will be charged to the respective student(s).</p>
        </section>
      </div>
    </div>
  );
};

export default Terms;