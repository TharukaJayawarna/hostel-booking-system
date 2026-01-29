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
        "You can book a room by logging into the student portal, selecting your preferred Hub -> Floor -> Room, and then choosing an available bed. Payment can be made online via PayHere.",
    },
    {
      question: "Can I change my room after booking?",
      answer:
        "Room changes are allowed only within the first week of booking, subject to availability. Please visit the hostel office or submit an 'Issue Report' to request a change.",
    },
    {
      question: "What is the refund policy?",
      answer:
        "We do not offer refunds for cancellations made after 24 hours of booking. For special cases (medical/academic withdrawal), please contact the administration directly.",
    },
    {
      question: "Who do I contact in case of an emergency?",
      answer:
        "For medical or security emergencies, please call the 24/7 Hostel Security Hotline: +94 11 544 5999 or contact your floor warden immediately.",
    },
    {
      question: "Are visitors allowed in the hostel?",
      answer:
        "Visitors are allowed only in the common lobby area between 9:00 AM and 6:00 PM. No visitors are allowed inside student rooms.",
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
            Have questions or need assistance? Reach out to us directly through
            the channels below.
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
                    NSBM Green University,
                    <br />
                    Pitipana, Homagama
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
                    +94 11 544 5000
                    <br />
                    <span className="text-sm text-gray-500">
                      Mon-Fri 8am-5pm
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
                    inquiries@nsbm.ac.lk
                    <br />
                    support@hostel.nsbm.ac.lk
                  </div>
                </div>
              </div>

              <div className="contact-info-card">
                <div className="contact-icon-box icon-purple">
                  <Clock size={22} />
                </div>
                <div className="contact-card-content">
                  <div className="contact-card-label">Hours</div>
                  <div className="contact-card-value">
                    Weekdays: 8:30 - 5:00
                    <br />
                    Weekends: 9:00 - 1:00
                  </div>
                </div>
              </div>
            </div>

            {/* Google Map Embed */}
            <div className="contact-map-container">
              <iframe
                title="NSBM Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3961.575840369592!2d80.0389973147723!3d6.821329095069929!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae2523b05555555%3A0x546c3479b116fb70!2sNSBM%20Green%20University!5e0!3m2!1sen!2slk!4v1629876543210!5m2!1sen!2slk"
                width="100%"
                height="250"
                style={{ border: 0, borderRadius: "12px" }}
                allowFullScreen=""
                loading="lazy"
              ></iframe>
            </div>

            {/* Social Media */}
            <div className="contact-social-section">
              <div className="contact-social-label">Follow our updates</div>
              <div className="contact-social-row">
                <button className="contact-social-btn fb">
                  <Facebook size={18} />
                </button>
                <button className="contact-social-btn tw">
                  <Twitter size={18} />
                </button>
                <button className="contact-social-btn ln">
                  <Linkedin size={18} />
                </button>
              </div>
            </div>
          </div>

          <div className="contact-right-col">
            {/* Emergency Box */}
            <div className="contact-emergency-card">
              <div className="pulse-dot"></div>
              <ShieldAlert size={28} className="text-red-600" />
              <div>
                <div className="contact-emer-text">24/7 Security Hotline</div>
                <div className="contact-emer-num">+94 11 544 5999</div>
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
