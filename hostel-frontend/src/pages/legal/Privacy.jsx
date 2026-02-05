import React from "react";
import "./styles/LegalPages.css";

const Privacy = () => {
  return (
    <div className="legal-page-container">
      <div className="legal-content">
        <h1>Privacy Policy</h1>
        <p className="last-updated">Last Updated: October 2024</p>

        <section>
          <h2>1. Information We Collect</h2>
          <p>We collect personal information such as your Name, Registration Number, Contact Details, and Guardian information solely for accommodation management purposes.</p>
        </section>

        <section>
          <h2>2. How We Use Your Data</h2>
          <p>Your data is used to process room allocations, verify identity at security checkpoints (Gate Pass), and communicate emergency alerts.</p>
        </section>

        <section>
          <h2>3. Data Sharing</h2>
          <p>We do not share your personal data with third parties unless required by law or for university administrative purposes (e.g., Student Affairs Division).</p>
        </section>
      </div>
    </div>
  );
};

export default Privacy;