import React from "react";
import "./styles/LegalPages.css"; // Styles පහතින් ඇත

const FAQ = () => {
  return (
    <div className="legal-page-container">
      <div className="legal-content">
        <h1>Frequently Asked Questions</h1>
        <p className="legal-intro">Common questions about SLTC hostel accommodation and booking procedures.</p>

        <div className="faq-item">
          <h3>How do I apply for a hostel room?</h3>
          <p>You can apply directly through this portal by navigating to the "Bookings" section. Select your preferred room type and proceed with the payment.</p>
        </div>

        <div className="faq-item">
          <h3>What facilities are included in the room fee?</h3>
          <p>The fee covers the bed, study table, chair, wardrobe, electricity, water, and Wi-Fi access. Meals are not included and must be purchased from the canteen.</p>
        </div>

        <div className="faq-item">
          <h3>Can I change my room after booking?</h3>
          <p>Room changes are subject to availability and Warden's approval. Please submit a request via the "Report Issue" or contact the hostel office directly.</p>
        </div>

        <div className="faq-item">
          <h3>What is the curfew time?</h3>
          <p>For the safety of all students, the hostel gates close at 9:00 PM. Late entry requires prior written permission from the Warden.</p>
        </div>
      </div>
    </div>
  );
};

export default FAQ;