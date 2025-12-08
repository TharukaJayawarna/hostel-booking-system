import React, { useState } from 'react';
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
  ShieldAlert
} from 'lucide-react';

const Contact = () => {
  // FAQ State
  const [openFaq, setOpenFaq] = useState(0);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      question: "How do I book a room?",
      answer: "You can book a room by logging into the student portal, selecting your preferred Hub -> Floor -> Room, and then choosing an available bed. Payment can be made online via PayHere."
    },
    {
      question: "Can I change my room after booking?",
      answer: "Room changes are allowed only within the first week of booking, subject to availability. Please visit the hostel office or submit an 'Issue Report' to request a change."
    },
    {
      question: "What is the refund policy?",
      answer: "We do not offer refunds for cancellations made after 24 hours of booking. For special cases (medical/academic withdrawal), please contact the administration directly."
    },
    {
      question: "Who do I contact in case of an emergency?",
      answer: "For medical or security emergencies, please call the 24/7 Hostel Security Hotline: +94 11 544 5999 or contact your floor warden immediately."
    },
    {
      question: "Are visitors allowed in the hostel?",
      answer: "Visitors are allowed only in the common lobby area between 9:00 AM and 6:00 PM. No visitors are allowed inside student rooms."
    }
  ];

  // --- STYLES ---
  const s = {
    pageContainer: {
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      fontFamily: "'Inter', sans-serif",
      padding: '65px 5px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    },
    innerContainer: { width: '100%', maxWidth: '1100px' },

    // Header
    header: { textAlign: 'center', marginBottom: '50px' },
    badge: {
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        padding: '6px 16px', borderRadius: '99px',
        backgroundColor: '#e0e7ff', color: '#4338ca',
        fontSize: '13px', fontWeight: '600', marginBottom: '15px',
        textTransform: 'uppercase', letterSpacing: '0.5px'
    },
    title: { fontSize: '36px', fontWeight: '900', color: '#0f172a', marginBottom: '10px', letterSpacing: '-0.5px' },
    subTitle: { fontSize: '16px', color: '#64748b', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' },

    // Grid Layout
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '40px',
        alignItems: 'start'
    },

    // Info Section (Left)
    infoSection: { display: 'flex', flexDirection: 'column', gap: '25px' },
    
    infoCard: {
        backgroundColor: 'white', padding: '25px', borderRadius: '20px',
        border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)',
        display: 'flex', alignItems: 'flex-start', gap: '15px',
        transition: 'transform 0.2s', cursor: 'default'
    },
    iconBox: (color) => ({
        width: '45px', height: '45px', borderRadius: '12px',
        backgroundColor: color.bg, color: color.text,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
    }),
    cardContent: { display: 'flex', flexDirection: 'column', gap: '4px' },
    cardLabel: { fontSize: '14px', fontWeight: '700', color: '#334155' },
    cardValue: { fontSize: '15px', color: '#64748b', lineHeight: '1.5' },

    // Social Links
    socialRow: { display: 'flex', gap: '15px', marginTop: '10px' },
    socialBtn: {
        width: '40px', height: '40px', borderRadius: '50%',
        border: '1px solid #e2e8f0', backgroundColor: 'white', color: '#64748b',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', transition: 'all 0.2s'
    },

    // FAQ Section (Right - Replaces Form)
    faqContainer: {
        backgroundColor: 'white', padding: '35px', borderRadius: '24px',
        boxShadow: '0 10px 30px -5px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0'
    },
    faqHeader: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '25px', paddingBottom:'15px', borderBottom:'1px solid #f1f5f9' },
    faqTitle: { fontSize: '20px', fontWeight: '800', color: '#1e293b' },
    
    faqItem: (isOpen) => ({
        border: '1px solid #e2e8f0', borderRadius: '12px', marginBottom: '12px',
        overflow: 'hidden', transition: 'all 0.3s ease',
        backgroundColor: isOpen ? '#f8fafc' : 'white',
        borderColor: isOpen ? '#4f46e5' : '#e2e8f0'
    }),
    questionBox: {
        padding: '16px 20px', cursor: 'pointer', display: 'flex',
        justifyContent: 'space-between', alignItems: 'center', gap: '10px'
    },
    questionText: { fontSize: '15px', fontWeight: '600', color: '#334155' },
    answerBox: {
        padding: '0 20px 20px 20px', fontSize: '14px', color: '#64748b', lineHeight: '1.6',
        borderTop: '1px dashed #e2e8f0', marginTop: '-5px', paddingTop: '15px'
    },

    // Emergency Box
    emergencyCard: {
        marginTop: '25px', background: '#fef2f2', padding: '20px', borderRadius: '16px',
        border: '1px solid #fecaca', display: 'flex', alignItems: 'center', gap: '15px'
    },
    emerText: { fontSize: '14px', fontWeight: '600', color: '#991b1b' },
    emerNum: { fontSize: '18px', fontWeight: '800', color: '#dc2626' }
  };

  return (
    <div style={s.pageContainer}>
      <div style={s.innerContainer}>
        
        {/* Header */}
        <div style={s.header}>
            <div style={s.badge}><MessageSquare size={14}/> Support Center</div>
            <h1 style={s.title}>Contact Administration</h1>
            <p style={s.subTitle}>
                Find answers to common questions or reach out to us directly through the channels below.
            </p>
        </div>

        <div style={s.grid}>
            
            {/* Left Side: Contact Info */}
            <div style={s.infoSection}>
                
                {/* Address */}
                <div style={s.infoCard} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                    <div style={s.iconBox({bg:'#eff6ff', text:'#2563eb'})}><MapPin size={22}/></div>
                    <div style={s.cardContent}>
                        <div style={s.cardLabel}>Visit Us</div>
                        <div style={s.cardValue}>
                            NSBM Green University,<br/>
                            Mahenwatta, Pitipana, Homagama
                        </div>
                    </div>
                </div>

                {/* Phone */}
                <div style={s.infoCard} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                    <div style={s.iconBox({bg:'#f0fdf4', text:'#16a34a'})}><Phone size={22}/></div>
                    <div style={s.cardContent}>
                        <div style={s.cardLabel}>Call Us</div>
                        <div style={s.cardValue}>
                            +94 11 544 5000 (General)<br/>
                            +94 11 544 5001 (Hostel Office)
                        </div>
                    </div>
                </div>

                {/* Email */}
                <div style={s.infoCard} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                    <div style={s.iconBox({bg:'#fff7ed', text:'#ea580c'})}><Mail size={22}/></div>
                    <div style={s.cardContent}>
                        <div style={s.cardLabel}>Email Us</div>
                        <div style={s.cardValue}>
                            inquiries@nsbm.ac.lk<br/>
                            support@hostel.nsbm.ac.lk
                        </div>
                    </div>
                </div>

                {/* Hours */}
                <div style={s.infoCard} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                    <div style={s.iconBox({bg:'#f5f3ff', text:'#7c3aed'})}><Clock size={22}/></div>
                    <div style={s.cardContent}>
                        <div style={s.cardLabel}>Office Hours</div>
                        <div style={s.cardValue}>
                            Weekdays: 8:30 AM - 5:00 PM<br/>
                            Weekends: 9:00 AM - 1:00 PM
                        </div>
                    </div>
                </div>

                {/* Social Media */}
                <div style={{marginTop:'10px'}}>
                    <div style={{fontSize:'13px', fontWeight:'600', color:'#64748b', marginBottom:'8px'}}>Follow us</div>
                    <div style={s.socialRow}>
                        <button style={s.socialBtn}><Facebook size={18}/></button>
                        <button style={s.socialBtn}><Twitter size={18}/></button>
                        <button style={s.socialBtn}><Linkedin size={18}/></button>
                    </div>
                </div>

            </div>

            {/* Right Side: FAQ Section (Replaces Form) */}
            <div>
                <div style={s.faqContainer}>
                    <div style={s.faqHeader}>
                        <div style={{background:'#e0e7ff', padding:'8px', borderRadius:'10px', color:'#4338ca'}}>
                            <HelpCircle size={24}/>
                        </div>
                        <span style={s.faqTitle}>Frequently Asked Questions</span>
                    </div>
                    
                    <div>
                        {faqs.map((faq, index) => (
                            <div key={index} style={s.faqItem(openFaq === index)}>
                                <div style={s.questionBox} onClick={() => toggleFaq(index)}>
                                    <span style={s.questionText}>{faq.question}</span>
                                    {openFaq === index ? <ChevronUp size={18} color="#4f46e5"/> : <ChevronDown size={18} color="#94a3b8"/>}
                                </div>
                                {openFaq === index && (
                                    <div style={s.answerBox}>
                                        {faq.answer}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Emergency Contact Box */}
                <div style={s.emergencyCard}>
                    <ShieldAlert size={32} color="#dc2626"/>
                    <div>
                        <div style={s.emerText}>Emergency Hotline (24/7)</div>
                        <div style={s.emerNum}>+94 11 544 5999</div>
                    </div>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};

export default Contact;