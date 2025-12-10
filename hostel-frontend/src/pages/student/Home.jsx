import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { 
  ArrowRight, 
  Building2, 
  Info, 
  Wallet, 
  ShieldAlert, 
  AlertTriangle,
  Users,
  Lock,
  Unlock,
  ChevronDown
} from 'lucide-react';

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80";

const Home = () => {
  const [hubs, setHubs] = useState([]);
  const [priceList, setPriceList] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [hubsRes, roomsRes] = await Promise.all([
        api.get('/hubs'),
        api.get('/rooms') 
      ]);

      if (hubsRes.data.status === "SUCCESS") {
        setHubs(hubsRes.data.data);
      }

      if (roomsRes.data.status === "SUCCESS") {
        processPrices(roomsRes.data.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- නව මිල සැකසුම් Logic එක (No Calculations) ---
  const processPrices = (rooms) => {
    const prices = {};

    rooms.forEach(room => {
      // දත්ත නොමැති නම් skip කරන්න
      if (!room.price || !room.roomType) return;

      const type = room.roomType; // e.g., SHARING_2
      const isPrivate = room.isPrivate ? 'private' : 'shared';
      const period = room.reservationPeriod; // DAILY, WEEKLY, MONTHLY
      const price = room.price;

      // Object එක initialize කරන්න (නැත්නම්)
      if (!prices[type]) {
        prices[type] = {
          shared: { DAILY: null, WEEKLY: null, MONTHLY: null },
          private: { DAILY: null, WEEKLY: null, MONTHLY: null }
        };
      }

      const current = prices[type][isPrivate];

      // Calculation නොකර Backend එකෙන් එන විදියටම අදාල තැනට දාන්න
      if (period === 'DAILY') {
         // එකම වර්ගයේ කාමර කිහිපයක් තිබේ නම්, අඩුම මිල ගන්න
         if (current.DAILY === null || price < current.DAILY) current.DAILY = price;
      } else if (period === 'WEEKLY') {
         if (current.WEEKLY === null || price < current.WEEKLY) current.WEEKLY = price;
      } else if (period === 'MONTHLY') {
         if (current.MONTHLY === null || price < current.MONTHLY) current.MONTHLY = price;
      }
    });

    setPriceList(prices);
  };

  const handleSelectHub = (hubId) => {
    navigate(`/hubs/${hubId}/floors`);
  };

  const formatRoomType = (type) => {
    switch(type) {
        case 'SHARING_2': return '2 Person Room';
        case 'SHARING_4': return '4 Person Room';
        case 'SHARING_6': return '6 Person Room';
        default: return type;
    }
  };

  // --- STYLES ---
  const s = {
    pageContainer: {
      width: '100%', minHeight: '100vh', padding: '70px 20px',
      fontFamily: "'Inter', sans-serif", backgroundColor: '#f3f4f6',
      color: '#1e293b', display: 'flex', flexDirection: 'column', alignItems: 'center'
    },
    
    // Hero
    hero: { textAlign: 'center', marginBottom: '0px', maxWidth: '700px', padding: '0 20px' },
    badge: {
      display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 10px', 
      borderRadius: '99px', backgroundColor: '#e0e7ff', color: '#4338ca',
      fontSize: '13px', fontWeight: '600', marginBottom: '20px', textTransform: 'uppercase'
    },
    title: { fontSize: '42px', fontWeight: '900', color: '#0f172a', marginBottom: '16px', lineHeight: '1.2' },
    subtitle: { fontSize: '18px', color: '#64748b', lineHeight: '1.6', fontWeight: '400' },

    // Info Grid
    infoSection: {
      width: '100%', maxWidth: '1200px', marginBottom: '1px',
      display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px', alignItems: 'start'
    },
    
    // Price Container
    priceContainer: {
      backgroundColor: 'white', borderRadius: '24px', padding: '10px',
      border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
    },
    sectionTitle: { fontSize: '20px', fontWeight: '800', color: '#1e293b', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' },
    
    // Table Styles
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '10px' },
    th: { textAlign: 'left', padding: '12px 8px', color: '#64748b', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0', backgroundColor:'#f8fafc' },
    tr: { borderBottom: '1px solid #f1f5f9' },
    td: { padding: '14px 8px', fontSize: '13px', color: '#334155', fontWeight: '500', verticalAlign: 'middle' },
    
    priceBadge: {
        fontFamily: 'monospace', fontWeight: '700', color: '#0f172a',
        backgroundColor: '#f1f5f9', padding: '4px 8px', borderRadius: '6px',
        display: 'inline-block', minWidth: '70px', textAlign: 'center'
    },
    emptyPrice: { color: '#cbd5e1', fontSize: '12px', fontStyle: 'italic' },

    // Policy
    policyContainer: {
      backgroundColor: '#fef2f2', borderRadius: '24px', padding: '30px',
      border: '1px solid #fee2e2'
    },
    warningBox: {
        backgroundColor: '#b91c1c', color: 'white', padding: '15px', borderRadius: '12px',
        fontSize: '14px', fontWeight: '600', lineHeight: '1.5',
        display: 'flex', alignItems: 'start', gap: '10px', marginBottom: '20px',
        boxShadow: '0 4px 6px rgba(185, 28, 28, 0.2)'
    },
    policyList: { display: 'flex', flexDirection: 'column', gap: '15px' },
    policyItem: { display: 'flex', gap: '10px', fontSize: '14px', color: '#991b1b', lineHeight: '1.5' },

    // Scroll Indicator
    actionIndicator: {
      textAlign: 'center', marginBottom: '40px',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
      animation: 'fadeIn 1s ease-in-out'
    },
    actionText: { fontSize: '16px', fontWeight: '700', color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '1px' },
    bounceIcon: { animation: 'bounce 2s infinite' },

    // Hub Grid
    grid: {
      display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
      gap: '30px', width: '100%', maxWidth: '1200px', paddingBottom: '40px'
    },
    card: (isHovered) => ({
      backgroundColor: 'white', borderRadius: '24px', overflow: 'hidden',
      border: '1px solid #e2e8f0', boxShadow: isHovered ? '0 20px 25px -5px rgba(0, 0, 0, 0.1)' : '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
      transition: 'all 0.3s ease', cursor: 'pointer',
      display: 'flex', flexDirection: 'column', transform: isHovered ? 'translateY(-8px)' : 'translateY(0)'
    }),
    imageContainer: { width: '100%', height: '220px', position: 'relative', overflow: 'hidden' },
    image: (isHovered) => ({
      width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease', transform: isHovered ? 'scale(1.05)' : 'scale(1)'
    }),
    content: { padding: '25px', display: 'flex', flexDirection: 'column', flexGrow: 1 },
    hubName: { fontSize: '22px', fontWeight: '800', color: '#1e293b', marginBottom: '8px' },
    descBox: { flexGrow: 1, marginBottom: '25px' },
    descText: { fontSize: '14px', color: '#64748b', lineHeight: '1.6', display: 'flex', gap: '10px', alignItems: 'start' },
    statsRow: { display: 'flex', gap: '15px', marginBottom: '20px' },
    statTag: { fontSize: '12px', fontWeight: '600', color: '#475569', background: '#f1f5f9', padding: '6px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' },
    button: (isHovered) => ({
      width: '100%', padding: '14px', borderRadius: '12px', fontSize: '15px', fontWeight: '700',
      color: 'white', border: 'none', cursor: 'pointer', background: isHovered ? '#4338ca' : '#4f46e5',
      transition: 'background 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
    })
  };

  const PriceCell = ({ price }) => (
    price ? <span style={s.priceBadge}>{price.toLocaleString()}</span> : <span style={s.emptyPrice}>-</span>
  );

  return (
    <div style={s.pageContainer}>
      
      {/* Hero */}
      <div style={s.hero}>
        <div style={s.badge}><Building2 size={14}/> Student Accommodation</div>
        <h1 style={s.title}>Find Your Perfect Space</h1>
        <p style={s.subtitle}>
          Select a hub below to view available floors and rooms.
        </p>
      </div>

      {/* --- INFO SECTION --- */}
      <div style={s.infoSection} className="info-grid">
        
        {/* Detailed Price List */}
        <div style={s.priceContainer}>
            <div style={s.sectionTitle}><Wallet size={24} color="#4f46e5"/> Price List (LKR)</div>
            
            <div style={{overflowX: 'auto'}}>
                <table style={s.table}>
                    <thead>
                        <tr>
                            <th style={s.th}>Room Type</th>
                            <th style={s.th}>Mode</th>
                            <th style={s.th}>Daily</th>
                            <th style={s.th}>Weekly</th>
                            <th style={s.th}>Monthly</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.keys(priceList).length === 0 ? (
                            <tr><td colSpan="5" style={{...s.td, textAlign:'center', color:'#94a3b8', padding:'30px'}}>Loading prices...</td></tr>
                        ) : (
                            Object.keys(priceList).sort().map((type) => (
                                <React.Fragment key={type}>
                                    {/* Shared Row */}
                                    <tr style={s.tr}>
                                        <td style={{...s.td, fontWeight:'700', color:'#1e293b', borderRight:'1px solid #f1f5f9'}} rowSpan="2">
                                            <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                                                <Users size={16} color="#4f46e5"/> {formatRoomType(type)}
                                            </div>
                                        </td>
                                        <td style={s.td}>
                                            <div style={{display:'flex', alignItems:'center', gap:'6px', color:'#64748b', fontSize:'12px'}}>
                                                <Unlock size={12}/> Shared
                                            </div>
                                        </td>
                                        <td style={s.td}><PriceCell price={priceList[type].shared.DAILY}/></td>
                                        <td style={s.td}><PriceCell price={priceList[type].shared.WEEKLY}/></td>
                                        <td style={s.td}><PriceCell price={priceList[type].shared.MONTHLY}/></td>
                                    </tr>
                                    {/* Private Row */}
                                    <tr style={s.tr}>
                                        <td style={s.td}>
                                            <div style={{display:'flex', alignItems:'center', gap:'6px', color:'#059669', fontSize:'12px', fontWeight:'700'}}>
                                                <Lock size={12}/> Private
                                            </div>
                                        </td>
                                        <td style={s.td}><PriceCell price={priceList[type].private.DAILY}/></td>
                                        <td style={s.td}><PriceCell price={priceList[type].private.WEEKLY}/></td>
                                        <td style={s.td}><PriceCell price={priceList[type].private.MONTHLY}/></td>
                                    </tr>
                                </React.Fragment>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            <p style={{fontSize:'12px', color:'#9ca3af', marginTop:'15px', fontStyle:'italic'}}>
                * 'Shared' prices are per bed, while 'Private' prices are for the entire room.
            </p>
        </div>

        {/* Strict Refund Policy */}
        <div style={s.policyContainer}>
            <div style={{...s.sectionTitle, color:'#991b1b'}}><ShieldAlert size={24}/> Refund Policy</div>
            <div style={s.warningBox}>
                <AlertTriangle size={40} style={{flexShrink:0}}/>
                <div>Please review carefully. Payments are non-refundable.</div>
            </div>
            <div style={s.policyList}>
                <div style={s.policyItem}>
                    <ShieldAlert size={18} style={{minWidth:'18px'}}/>
                    <span><strong>STRICT NO-REFUND POLICY:</strong> All payments made are final. We do not offer refunds for cancellations or early check-outs under any circumstances.</span>
                </div>
                <div style={s.policyItem}>
                    <ShieldAlert size={18} style={{minWidth:'18px'}}/>
                    <span>Date changes may be considered based on availability, but money will not be returned.</span>
                </div>
            </div>
        </div>

      </div>

      {/* --- SCROLL INDICATOR --- */}
      <div style={s.actionIndicator}>
        <div style={s.actionText}>Ready to Book? Select a Hub Below</div>
        <ChevronDown size={32} color="#4f46e5" style={s.bounceIcon}/>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(10px); }
        }
        @media (max-width: 1000px) {
          .info-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* Hub Grid */}
      <div style={s.grid}>
        {loading ? <div style={{gridColumn:'1/-1', textAlign:'center'}}>Loading Hubs...</div> : hubs.map((hub) => {
          const isHovered = hoveredCard === hub.id;
          return (
            <div 
              key={hub.id} 
              style={s.card(isHovered)}
              onMouseEnter={() => setHoveredCard(hub.id)}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => handleSelectHub(hub.id)}
            >
              <div style={s.imageContainer}>
                <img 
                  src={hub.image ? hub.image : DEFAULT_IMAGE} 
                  alt="Hub" 
                  style={s.image(isHovered)} 
                  onError={(e) => { e.target.src = DEFAULT_IMAGE; }} 
                />
              </div>  
              <div style={s.content}>
                <h3 style={s.hubName}>{hub.hubNumber}</h3>
                <div style={s.statsRow}>
                    <span style={s.statTag}>{hub.noOfFloors || 0} Floors</span>
                    <span style={s.statTag}>{hub.noOfRooms || 0} Rooms</span>
                </div>
                <div style={s.descBox}>
                  <p style={s.descText}>
                    <Info size={16} color="#94a3b8" style={{minWidth:'16px', marginTop:'3px'}}/>
                    {hub.description || "No description available."} 
                  </p>
                </div>
                <button style={s.button(isHovered)}>
                  View Availability <ArrowRight size={18}/>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Home;