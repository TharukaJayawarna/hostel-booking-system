import React from "react";
import "./styles/LegalPages.css";

const CookiePolicy = () => {
  return (
    <div className="legal-page-container">
      <div className="legal-content">
        <h1>Cookie Policy</h1>
        
        <section>
          <h2>What are Cookies?</h2>
          <p>Cookies are small text files stored on your device to help the website function properly and improve user experience.</p>
        </section>

        <section>
          <h2>How We Use Cookies</h2>
          <ul>
            <li><strong>Essential Cookies:</strong> Required for logging in and keeping your session active.</li>
            <li><strong>Preference Cookies:</strong> Remember your settings (e.g., language).</li>
          </ul>
        </section>

        <section>
          <h2>Managing Cookies</h2>
          <p>You can choose to disable cookies through your browser settings, but this may affect the functionality of the hostel portal (e.g., login issues).</p>
        </section>
      </div>
    </div>
  );
};

export default CookiePolicy;