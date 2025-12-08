import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Mail, 
  Phone, 
  MapPin, 
  ShieldCheck,
  ArrowRight
} from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  // --- STYLES ---
  const s = {
    footer: {
      backgroundColor: '#1e293b', // Slate 800 - Professional Dark Blue/Grey
      color: '#f8fafc',
      padding: '60px 0 20px',
      fontFamily: "'Inter', sans-serif",
      marginTop: 'auto',
      borderTop: '4px solid #4f46e5' // Top accent border
    },
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 24px',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      gap: '40px',
      marginBottom: '40px'
    },
    column: {
      display: 'flex',
      flexDirection: 'column',
      gap: '15px'
    },
    
    // Brand Section
    brandTitle: {
      fontSize: '22px',
      fontWeight: '800',
      marginBottom: '5px',
      color: 'white',
      display: 'flex', alignItems: 'center', gap: '10px'
    },
    brandDesc: {
      fontSize: '14px',
      color: '#94a3b8',
      lineHeight: '1.6'
    },

    // Headings
    heading: {
      fontSize: '16px',
      fontWeight: '700',
      color: '#fff',
      marginBottom: '10px',
      textTransform: 'uppercase',
      letterSpacing: '0.05em'
    },

    // Links
    linkGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '10px'
    },
    footerLink: {
      textDecoration: 'none',
      color: '#cbd5e1',
      fontSize: '14px',
      transition: 'all 0.2s',
      display: 'flex', alignItems: 'center', gap: '6px',
      cursor: 'pointer'
    },
    
    // Contact Items
    contactItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      fontSize: '14px',
      color: '#cbd5e1'
    },
    
    // Bottom Bar
    bottomBar: {
      borderTop: '1px solid #334155',
      paddingTop: '25px',
      maxWidth: '1200px',
      margin: '0 auto',
      paddingLeft: '24px',
      paddingRight: '24px',
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '15px'
    },
    copyright: {
      fontSize: '13px',
      color: '#64748b'
    },
    socialGroup: {
      display: 'flex',
      gap: '15px'
    },
    socialIcon: {
      color: '#94a3b8',
      cursor: 'pointer',
      transition: 'color 0.2s, transform 0.2s',
    }
  };

  return (
    <footer style={s.footer}>
      <div style={s.container}>
        
        {/* Column 1: Brand Info */}
        <div style={s.column}>
          <div style={s.brandTitle}>
            <span>🏠</span> Hostel PMS
          </div>
          <p style={s.brandDesc}>
            Providing safe, comfortable, and modern accommodation solutions for university students. 
            Your home away from home.
          </p>
          <div style={{display:'flex', alignItems:'center', gap:'8px', fontSize:'12px', color:'#10b981', background:'rgba(16, 185, 129, 0.1)', width:'fit-content', padding:'6px 12px', borderRadius:'20px'}}>
            <ShieldCheck size={14}/> Secure & Verified
          </div>
        </div>

        {/* Column 2: Quick Links */}
        <div style={s.column}>
          <h4 style={s.heading}>Quick Links</h4>
          <div style={s.linkGroup}>
            <Link to="/" style={s.footerLink} onMouseOver={e => e.target.style.color='white'} onMouseOut={e => e.target.style.color='#cbd5e1'}>
                <ArrowRight size={14}/> Home
            </Link>
            <Link to="/issue" style={s.footerLink} onMouseOver={e => e.target.style.color='white'} onMouseOut={e => e.target.style.color='#cbd5e1'}>
                <ArrowRight size={14}/> Report Issue
            </Link>
            <Link to="/contact" style={s.footerLink} onMouseOver={e => e.target.style.color='white'} onMouseOut={e => e.target.style.color='#cbd5e1'}>
                <ArrowRight size={14}/> Contact Support
            </Link>
            
          </div>
        </div>

        {/* Column 3: Legal & Help */}
        <div style={s.column}>
          <h4 style={s.heading}>Support</h4>
          <div style={s.linkGroup}>
            <span style={s.footerLink}>FAQ</span>
            <span style={s.footerLink}>Terms & Conditions</span>
            <span style={s.footerLink}>Privacy Policy</span>
            <span style={s.footerLink}>Cookie Policy</span>
          </div>
        </div>

        {/* Column 4: Contact Info */}
        <div style={s.column}>
          <h4 style={s.heading}>Contact Us</h4>
          <div style={s.contactItem}>
            <MapPin size={18} color="#4f46e5"/>
            <span>NSBM Green University,<br/>Homagama, Sri Lanka</span>
          </div>
          <div style={s.contactItem}>
            <Mail size={18} color="#4f46e5"/>
            <span>support@hostel.lk</span>
          </div>
          <div style={s.contactItem}>
            <Phone size={18} color="#4f46e5"/>
            <span>+94 11 544 5000</span>
          </div>
        </div>

      </div>

      {/* Bottom Bar */}
      <div style={s.bottomBar}>
        <div style={s.copyright}>
          © {currentYear} Hostel Management System. All rights reserved.
        </div>
        
        <div style={s.socialGroup}>
          <Facebook size={20} style={s.socialIcon} onMouseOver={e => {e.currentTarget.style.color='#1877F2'; e.currentTarget.style.transform='translateY(-2px)'}} onMouseOut={e => {e.currentTarget.style.color='#94a3b8'; e.currentTarget.style.transform='none'}}/>
          <Twitter size={20} style={s.socialIcon} onMouseOver={e => {e.currentTarget.style.color='#1DA1F2'; e.currentTarget.style.transform='translateY(-2px)'}} onMouseOut={e => {e.currentTarget.style.color='#94a3b8'; e.currentTarget.style.transform='none'}}/>
          <Instagram size={20} style={s.socialIcon} onMouseOver={e => {e.currentTarget.style.color='#E1306C'; e.currentTarget.style.transform='translateY(-2px)'}} onMouseOut={e => {e.currentTarget.style.color='#94a3b8'; e.currentTarget.style.transform='none'}}/>
          <Linkedin size={20} style={s.socialIcon} onMouseOver={e => {e.currentTarget.style.color='#0077B5'; e.currentTarget.style.transform='translateY(-2px)'}} onMouseOut={e => {e.currentTarget.style.color='#94a3b8'; e.currentTarget.style.transform='none'}}/>
        </div>
      </div>
    </footer>
  );
};

export default Footer;