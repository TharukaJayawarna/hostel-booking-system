// src/components/Footer.jsx
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
              {/* SLTC Logo Placeholder or use actual SLTC logo url if available */}
              <img
                src="src/assets/logo.png"
                alt="SLTC Logo"
                style={{ width: "45px", height: "auto" }}
              />
            </span>{" "}
            SLTC Hostels
          </div>
          <p className="f-brand-desc">
            Official accommodation portal for Sri Lanka Technological Campus. 
            Ensuring a safe, conducive, and vibrant living environment for our research university community.
          </p>
          <div className="f-secure-badge">
            <ShieldCheck size={14} /> Official University Portal
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
              <ArrowRight size={14} /> Contact Us
            </Link>
          </div>
        </div>

        {/* Support Links - Linked to new pages */}
        <div className="footer-column">
          <h4 className="footer-heading">Support & Legal</h4>
          <div className="link-group">
            <Link to="/faq" className="footer-link">FAQ</Link>
            <Link to="/terms" className="footer-link">Terms & Conditions</Link>
            <Link to="/privacy" className="footer-link">Privacy Policy</Link>
            <Link to="/cookies" className="footer-link">Cookie Policy</Link>
          </div>
        </div>

        {/* Contact Info (SLTC Real Details) */}
        <div className="footer-column">
          <h4 className="footer-heading">Contact Us</h4>

          <div className="contact-item">
            <MapPin size={18} className="flex-shrink-0" />
            <span>
              SLTC Research University,
              <br />
              Ingiriya Road, Padukka,
              <br />
              Sri Lanka.
            </span>
          </div>

          <div className="contact-item">
            <Mail size={18} />
            <span>accommodations@sltc.ac.lk</span>
          </div>

          <div className="contact-item">
            <Phone size={18} />
            <span>+94 11 210 0500</span>
          </div>
        </div>
      </div>

      <div className="footer-bottom-minimal">
        <div className="bottom-content">
          <p className="copyright">© {currentYear} SLTC Research University. All rights reserved.</p>
          
          <div className="social-minimal">
            <a href="https://www.facebook.com/SLTCResearchUniversity" target="_blank" rel="noreferrer" aria-label="Facebook"><Facebook size={18} /></a>
            <a href="https://twitter.com/SLTC_LK" target="_blank" rel="noreferrer" aria-label="Twitter"><Twitter size={18} /></a>
            <a href="https://www.instagram.com/sltc_research_university/" target="_blank" rel="noreferrer" aria-label="Instagram"><Instagram size={18} /></a>
            <a href="https://www.linkedin.com/school/sltc-research-university/" target="_blank" rel="noreferrer" aria-label="LinkedIn"><Linkedin size={18} /></a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;