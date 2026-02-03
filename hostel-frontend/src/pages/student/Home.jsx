import React, { useEffect, useState, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
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
  ChevronDown,
  Loader2,
  MapPin,
  Megaphone, 
  X // Import X for Close Button
} from "lucide-react";
import "./styles/Home.css";

import hubService from "../../services/hub.service";
import roomService from "../../services/room.service";
import announcementService from "../../services/announcement.service";

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80";

const Home = () => {
  const navigate = useNavigate();
  const hubSectionRef = useRef(null);

  const [hubs, setHubs] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Announcements State
  const [announcements, setAnnouncements] = useState([]);
  const [showModal, setShowModal] = useState(false); // Modal State

  useEffect(() => {
    fetchData();
    fetchAnnouncements();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [hubsRes, roomsRes] = await Promise.all([
        hubService.getAllHubs(),
        roomService.getAllRooms(),
      ]);

      if (hubsRes.data.status === "SUCCESS") {
        setHubs(hubsRes.data.data);
      }
      if (roomsRes.data.status === "SUCCESS") {
        setRooms(roomsRes.data.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const res = await announcementService.getActiveAnnouncements();
      if (res.data.status === "SUCCESS") {
        const data = res.data.data;
        setAnnouncements(data);

        // Check if user has seen announcements in this session
        const hasSeen = sessionStorage.getItem("hasSeenAnnouncements");
        if (!hasSeen && data.length > 0) {
          setShowModal(true); // Show Popup
          sessionStorage.setItem("hasSeenAnnouncements", "true"); // Mark as seen
        }
      }
    } catch (error) {
      console.error("Error fetching announcements:", error);
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const priceList = useMemo(() => {
    const prices = {};

    rooms.forEach((room) => {
      if (room.reservationPeriod !== "DEFAULT") return;

      const type = room.roomType;
      const isPrivate = room.isPrivate ? "private" : "shared";

      if (!prices[type]) {
        prices[type] = {
          shared: { DAILY: null, WEEKLY: null, MONTHLY: null },
          private: { DAILY: null, WEEKLY: null, MONTHLY: null },
        };
      }

      const current = prices[type][isPrivate];

      if (current.MONTHLY === null || room.monthlyPrice < current.MONTHLY)
        current.MONTHLY = room.monthlyPrice;
      if (
        current.WEEKLY === null ||
        (room.weeklyPrice && room.weeklyPrice < current.WEEKLY)
      )
        current.WEEKLY = room.weeklyPrice;
      if (
        current.DAILY === null ||
        (room.dailyPrice && room.dailyPrice < current.DAILY)
      )
        current.DAILY = room.dailyPrice;
    });

    return prices;
  }, [rooms]);

  const scrollToHubs = () => {
    if (hubSectionRef.current) {
      hubSectionRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSelectHub = (hubId) => {
    navigate(`/hubs/${hubId}/floors`);
  };

  const PriceCell = ({ price }) =>
    price ? (
      <span className="price-badge">
        LKR {parseFloat(price).toLocaleString()}
      </span>
    ) : (
      <span className="empty-price">-</span>
    );

  const formatRoomType = (type) => {
    switch (type) {
      case "SHARING_2":
        return "2 Person Room";
      case "SHARING_4":
        return "4 Person Room";
      case "SHARING_6":
        return "6 Person Room";
      default:
        return type;
    }
  };

  return (
    <div className="home-container">
      
      {/* --- POPUP MODAL FOR ANNOUNCEMENTS --- */}
      {showModal && announcements.length > 0 && (
        <div className="ann-modal-overlay">
          <div className="ann-modal-container">
            <div className="ann-modal-header">
              <div className="ann-modal-title">
                <Megaphone size={24} color="#e11d48" />
                <span>Important Updates</span>
              </div>
              <button className="ann-close-btn" onClick={closeModal}>
                <X size={24} />
              </button>
            </div>
            <div className="ann-modal-body">
              {announcements.map((ann) => (
                <div key={ann.id} className={`ann-modal-item ${ann.type.toLowerCase()}`}>
                  <h4 className="ann-modal-heading">{ann.title}</h4>
                  <p className="ann-modal-text">{ann.message}</p>
                </div>
              ))}
            </div>
            <div className="ann-modal-footer">
              <button className="ann-ack-btn" onClick={closeModal}>
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="home-hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <div className="hero-badge">
            <Building2 size={14} /> University Accommodation
          </div>
          <h1 className="hero-title">
            Find Your Perfect <br /> Space on Campus
          </h1>
          <p className="hero-subtitle">
            Secure, comfortable, and affordable lodging designed for students.
            Select a hub to get started.
          </p>
          <button className="hero-cta-btn" onClick={scrollToHubs}>
            Book Now
          </button>
        </div>
      </div>

      {/* --- INLINE ANNOUNCEMENTS (STILL VISIBLE AFTER CLOSING MODAL) --- */}
      {announcements.length > 0 && (
        <div className="announcement-wrapper">
          {announcements.map((ann) => (
            <div key={ann.id} className={`announcement-card ${ann.type.toLowerCase()}`}>
              <div className="ann-icon-box">
                <Megaphone size={20} />
              </div>
              <div className="ann-content">
                <h4 className="ann-title">{ann.title}</h4>
                <p className="ann-msg">{ann.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="info-grid">
        {/* Pricing Table */}
        <div className="price-container">
          <div className="section-title">
            <Wallet size={24} color="#4f46e5" /> Standard Rates
          </div>

          <div className="price-table-wrapper">
            <table className="price-table">
              <thead>
                <tr>
                  <th className="price-th">Room Configuration</th>
                  <th className="price-th">Mode</th>
                  <th className="price-th">Daily</th>
                  <th className="price-th">Weekly</th>
                  <th className="price-th">Monthly</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="price-loading">
                      <Loader2 className="animate-spin" size={20} /> Loading Rates...
                    </td>
                  </tr>
                ) : Object.keys(priceList).length === 0 ? (
                  <tr>
                    <td colSpan="5" className="price-empty">
                      No pricing information available.
                    </td>
                  </tr>
                ) : (
                  Object.keys(priceList)
                    .sort()
                    .map((type) => (
                      <React.Fragment key={type}>
                        <tr className="price-tr">
                          <td className="price-td price-td-type" rowSpan="2">
                            <div className="room-type-cell">
                              <Users size={16} color="#4f46e5" />{" "}
                              {formatRoomType(type)}
                            </div>
                          </td>
                          <td className="price-td">
                            <div className="mode-cell mode-shared">
                              <Unlock size={12} /> Shared
                            </div>
                          </td>
                          <td className="price-td"><PriceCell price={priceList[type].shared.DAILY} /></td>
                          <td className="price-td"><PriceCell price={priceList[type].shared.WEEKLY} /></td>
                          <td className="price-td"><PriceCell price={priceList[type].shared.MONTHLY} /></td>
                        </tr>
                        <tr className="price-tr">
                          <td className="price-td">
                            <div className="mode-cell mode-private">
                              <Lock size={12} /> Private
                            </div>
                          </td>
                          <td className="price-td"><PriceCell price={priceList[type].private.DAILY} /></td>
                          <td className="price-td"><PriceCell price={priceList[type].private.WEEKLY} /></td>
                          <td className="price-td"><PriceCell price={priceList[type].private.MONTHLY} /></td>
                        </tr>
                      </React.Fragment>
                    ))
                )}
              </tbody>
            </table>
          </div>
          <p className="price-note">
            * 'Shared' prices are per person. 'Private' prices are for the full room occupancy.
          </p>
        </div>

        {/* Refund Policy */}
        <div className="policy-container">
          <div className="section-title title-danger">
            <ShieldAlert size={24} /> Important Policy
          </div>
          <div className="warning-box">
            <AlertTriangle size={32} className="warning-icon" />
            <div>
              Please review carefully. Payments are <strong>non-refundable</strong>.
            </div>
          </div>
          <div className="policy-list">
            <div className="policy-item">
              <ShieldAlert size={18} className="policy-icon" />
              <span>
                <strong>STRICT NO-REFUND POLICY:</strong> All payments made are final. We do not offer refunds for cancellations or early check-outs.
              </span>
            </div>
            <div className="policy-item">
              <Info size={18} className="policy-icon" />
              <span>
                Date changes may be considered based on room availability, but paid amounts will not be returned.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="action-indicator" onClick={scrollToHubs}>
        <div className="action-text">Explore Our Hubs</div>
        <ChevronDown size={32} color="#4f46e5" className="bounce-icon" />
      </div>

      {/* Hub Grid Section */}
      <div className="hub-section" ref={hubSectionRef}>
        {loading ? (
          <div className="hub-loading">
            <Loader2 className="animate-spin" size={40} color="#4f46e5" />
            <p>Loading Accommodation Hubs...</p>
          </div>
        ) : (
          <div className="hub-grid">
            {hubs.map((hub) => (
              <div key={hub.id} className="hub-card" onClick={() => handleSelectHub(hub.id)}>
                <div className="hub-image-container">
                  <img
                    src={hub.image || DEFAULT_IMAGE}
                    alt={hub.hubNumber}
                    className="hub-image"
                    onError={(e) => { e.target.src = DEFAULT_IMAGE; }}
                    loading="lazy"
                  />
                  <div className="hub-badge-overlay">
                    <Building2 size={12} /> {hub.hubNumber}
                  </div>
                </div>
                <div className="hub-content">
                  <h3 className="hub-name">{hub.hubNumber}</h3>
                  <div className="hub-stats-row">
                    <span className="stat-tag">{hub.noOfFloors || 0} Floors</span>
                    <span className="stat-tag">{hub.noOfRooms || 0} Rooms</span>
                  </div>
                  <div className="hub-desc-box">
                    <p className="hub-desc-text">
                      <MapPin size={14} style={{ minWidth: "14px", marginTop: "2px" }} />
                      {hub.description || "Located within the university premises with easy access to all facilities."}
                    </p>
                  </div>
                  <button className="btn-view-hub">
                    Check Availability <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;