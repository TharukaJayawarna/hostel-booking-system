import React, { useState } from "react";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageSquare,
  Facebook,
  Twitter,
  Linkedin,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  ShieldAlert,
} from "lucide-react";
import "./styles/Contact.css";

const Contact = () => {
  const [openFaq, setOpenFaq] = useState(0);

  const faqs = [
    {
      question: "How do I book a room?",
      answer:
        "You can book a room by logging into the student portal, selecting your preferred Building -> Floor -> Room, and then choosing an available bed. Payment can be made online via the payment gateway.",
    },
    {
      question: "Can I change my room after booking?",
      answer:
        "Room changes are allowed only within the first week of booking, subject to availability. Please visit the warden's office or submit an 'Issue Report' to request a change.",
    },
    {
      question: "What is the refund policy?",
      answer:
        "We do not offer refunds for cancellations made after 24 hours of booking. For special cases (medical/academic withdrawal), please contact the administration directly.",
    },
    {
      question: "Who do I contact in case of an emergency?",
      answer:
        "For medical or security emergencies, please call the 24/7 Security Hotline: +94 11 210 0500 or contact the residential warden immediately.",
    },
    {
      question: "Are visitors allowed in the hostel?",
      answer:
        "Visitors are allowed only in the designated lobby area between 9:00 AM and 5:00 PM. No visitors are allowed inside student living quarters.",
    },
  ];

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="contact-container">
      <div className="contact-inner">
        {/* Header */}
        <div className="contact-header">
          <div className="contact-badge">
            <MessageSquare size={14} /> Support Center
          </div>
          <h1 className="contact-title">Contact Administration</h1>
          <p className="contact-subtitle">
            Have questions or need assistance? Reach out to the SLTC accommodation
            team directly through the channels below.
          </p>
        </div>

        <div className="contact-grid">
          <div className="contact-left-col">
            {/* Info Cards Grid */}
            <div className="contact-cards-grid">
              <div className="contact-info-card">
                <div className="contact-icon-box icon-blue">
                  <MapPin size={22} />
                </div>
                <div className="contact-card-content">
                  <div className="contact-card-label">Visit Us</div>
                  <div className="contact-card-value">
                    SLTC Research University,
                    <br />
                    Ingiriya Road, Padukka
                  </div>
                </div>
              </div>

              <div className="contact-info-card">
                <div className="contact-icon-box icon-green">
                  <Phone size={22} />
                </div>
                <div className="contact-card-content">
                  <div className="contact-card-label">Call Us</div>
                  <div className="contact-card-value">
                    +94 11 210 0500
                    <br />
                    <span className="text-sm text-gray-500">
                      Mon-Fri 8:30am-5pm
                    </span>
                  </div>
                </div>
              </div>

              <div className="contact-info-card">
                <div className="contact-icon-box icon-orange">
                  <Mail size={22} />
                </div>
                <div className="contact-card-content">
                  <div className="contact-card-label">Email Us</div>
                  <div className="contact-card-value">
                    info@sltc.ac.lk
                    <br />
                    accommodations@sltc.ac.lk
                  </div>
                </div>
              </div>

              <div className="contact-info-card">
                <div className="contact-icon-box icon-purple">
                  <Clock size={22} />
                </div>
                <div className="contact-card-content">
                  <div className="contact-card-label">Office Hours</div>
                  <div className="contact-card-value">
                    Weekdays: 8:30 - 5:00
                    <br />
                    Weekends: Closed
                  </div>
                </div>
              </div>
            </div>

            {/* Google Map Embed (Correct SLTC Location) */}
            <div className="contact-map-container">
              <iframe
                title="SLTC Research University Location"
                // පහත URL එක මගින් SLTC Padukka පරිශ්‍රය හරියටම මැදට ගෙන පෙන්වයි
                src="https://maps.google.com/maps?q=SLTC+Research+University,+Ingiriya+Road,+Padukka&t=&z=15&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="250"
                style={{ border: 0, borderRadius: "12px" }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>

            {/* Social Media */}
            <div className="contact-social-section">
              <div className="contact-social-label">Follow our updates</div>
              <div className="contact-social-row">
                <a 
                  href="https://www.facebook.com/SLTCResearchUniversity" 
                  target="_blank" 
                  rel="noreferrer"
                  className="contact-social-btn fb"
                >
                  <Facebook size={18} />
                </a>
                <a 
                  href="https://twitter.com/SLTC_LK" 
                  target="_blank" 
                  rel="noreferrer"
                  className="contact-social-btn tw"
                >
                  <Twitter size={18} />
                </a>
                <a 
                  href="https://www.linkedin.com/school/sltc-research-university/" 
                  target="_blank" 
                  rel="noreferrer"
                  className="contact-social-btn ln"
                >
                  <Linkedin size={18} />
                </a>
              </div>
            </div>
          </div>

          <div className="contact-right-col">
            {/* Emergency Box */}
            <div className="contact-emergency-card">
              <div className="pulse-dot"></div>
              <ShieldAlert size={28} className="text-red-600" />
              <div>
                <div className="contact-emer-text">Hostel Warden (Emergency)</div>
                <div className="contact-emer-num">+94 11 210 0500</div>
              </div>
            </div>

            {/* FAQ Accordion */}
            <div className="contact-faq-container">
              <div className="contact-faq-header">
                <HelpCircle size={20} className="text-indigo-600" />
                <span className="contact-faq-title">
                  Frequently Asked Questions
                </span>
              </div>

              <div className="contact-faq-list">
                {faqs.map((faq, index) => (
                  <div
                    key={index}
                    className={`contact-faq-item ${openFaq === index ? "open" : ""}`}
                  >
                    <button
                      className="contact-question-box"
                      onClick={() => toggleFaq(index)}
                      aria-expanded={openFaq === index}
                    >
                      <span className="contact-question-text">
                        {faq.question}
                      </span>
                      {openFaq === index ? (
                        <ChevronUp size={16} color="#4f46e5" />
                      ) : (
                        <ChevronDown size={16} color="#94a3b8" />
                      )}
                    </button>
                    <div
                      className={`contact-answer-box ${openFaq === index ? "show" : ""}`}
                    >
                      {faq.answer}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;