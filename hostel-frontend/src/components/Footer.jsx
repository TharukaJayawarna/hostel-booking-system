import React from "react";
import { Link } from "react-router-dom";
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import "./styles/Footer.css";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Brand */}
        <div className="footer-column">
          <div className="f-brand-title">
            <span>
              <img
                src="https://img.freepik.com/free-vector/editable-hotel-logo-vector-business-corporate-identity-hostel_53876-111553.jpg?semt=ais_se_enriched&w=740&q=80"
                alt="Hostel PMS Logo"
                style={{ width: "40px", height: "40px" }}
              />
            </span>{" "}
            Hostel PMS
          </div>
          <p className="f-brand-desc">
            Providing safe, comfortable, and modern accommodation solutions for
            university students. Your home away from home.
          </p>
          <div className="f-secure-badge">
            <ShieldCheck size={14} /> Secure & Verified
          </div>
        </div>

        {/* Quick Links */}
        <div className="footer-column">
          <h4 className="footer-heading">Quick Links</h4>
          <div className="link-group">
            <Link to="/" className="footer-link">
              <ArrowRight size={14} /> Home
            </Link>
            <Link to="/my-bookings" className="footer-link">
              <ArrowRight size={14} /> My Bookings
            </Link>
            <Link to="/issue" className="footer-link">
              <ArrowRight size={14} /> Report Issue
            </Link>
            <Link to="/contact" className="footer-link">
              <ArrowRight size={14} /> Contact Support
            </Link>
          </div>
        </div>

        {/* Support */}
        <div className="footer-column">
          <h4 className="footer-heading">Support</h4>
          <div className="link-group">
            <span className="footer-link">FAQ</span>
            <span className="footer-link">Terms & Conditions</span>
            <span className="footer-link">Privacy Policy</span>
            <span className="footer-link">Cookie Policy</span>
          </div>
        </div>

        {/* Contact */}
        <div className="footer-column">
          <h4 className="footer-heading">Contact Us</h4>

          <div className="contact-item">
            <MapPin size={18} />
            <span>
              NSBM Green University,
              <br />
              Homagama, Sri Lanka
            </span>
          </div>

          <div className="contact-item">
            <Mail size={18} />
            <span>support@hostel.lk</span>
          </div>

          <div className="contact-item">
            <Phone size={18} />
            <span>+94 11 544 5000</span>
          </div>
        </div>
      </div>

      <div className="footer-bottom-minimal">
        <div className="bottom-content">
          <p className="copyright">© {currentYear} Hostel PMS. All rights reserved.</p>
          
          <div className="social-minimal">
            <a href="#" aria-label="Facebook"><Facebook size={18} /></a>
            <a href="#" aria-label="Twitter"><Twitter size={18} /></a>
            <a href="#" aria-label="Instagram"><Instagram size={18} /></a>
            <a href="#" aria-label="LinkedIn"><Linkedin size={18} /></a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
