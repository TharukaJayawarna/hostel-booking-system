import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useNotification } from "../../context/NotificationContext";
import {
  BedDouble,
  CheckCircle2,
  XCircle,
  CalendarDays,
  DoorOpen,
  ArrowLeft,
  Loader2,
  Wrench, // Maintenance Icon
} from "lucide-react";
import "./styles/BedSelection.css";

// roomService import
import roomService from "../../services/room.service";

const BedSelection = () => {
  const notify = useNotification();
  const { roomId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Extract params from location state
  const { checkIn, checkOut, reservedFor } = location.state || {};
  
  const [beds, setBeds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Validation: දින තෝරා නොමැති නම් Redirect කිරීම
    if (!checkIn || !checkOut) {
      notify.error("Session expired or invalid dates. Please start over.");
      navigate("/");
      return;
    }
    fetchBeds();
  }, [roomId, navigate, checkIn, checkOut, notify]);

  const fetchBeds = async () => {
    try {
      setLoading(true);
      const response = await roomService.getBedsByRoom(roomId);

      if (response.data.status === "SUCCESS") {
        setBeds(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching beds:", error);
      notify.error("Failed to load beds.");
    } finally {
      setLoading(false);
    }
  };

  // --- Optimization: Sort Beds Numerically ---
  // B-1, B-2, B-10 ආකාරයට නිවැරදිව Sort කිරීම
  const sortedBeds = useMemo(() => {
    return [...beds].sort((a, b) => 
      a.bedNumber.localeCompare(b.bedNumber, undefined, { numeric: true, sensitivity: 'base' })
    );
  }, [beds]);

  const handleBedSelect = (bed) => {
    // Validation: Booked හෝ Maintenance නම් Click කිරීම වැළැක්වීම
    if (bed.isBooked || bed.underMaintenance) return;

    navigate("/reserve", {
      state: {
        bedId: bed.id,
        bedNumber: bed.bedNumber,
        roomNumber: bed.roomNumber,
        checkIn,
        checkOut,
        reservedFor,
      },
    });
  };

  // Helper function to determine bed status styles
  const getBedStatus = (bed) => {
    if (bed.underMaintenance) return { class: "maintenance", label: "Maintenance", icon: Wrench };
    if (bed.isBooked) return { class: "booked", label: "Occupied", icon: XCircle };
    return { class: "available", label: "Available", icon: CheckCircle2 };
  };

  if (loading) {
    return (
      <div className="bs-loading-container">
        <Loader2 className="animate-spin" size={40} color="#4f46e5" />
        <span style={{ marginTop: "10px", color: "#64748b", fontWeight: 500 }}>Checking availability...</span>
      </div>
    );
  }

  return (
    <div className="bed-selection-container">
      <div className="bs-inner-container">
        {/* Header */}
        <div className="bs-header-section">
          <button className="bs-back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} /> Back
          </button>

          <h1 className="bs-title">Choose Your Bed</h1>
          <div className="bs-subtitle">
            <CalendarDays size={16} />
            Booking for <span className="bs-date-badge">{checkIn}</span> to{" "}
            <span className="bs-date-badge">{checkOut}</span>
          </div>
        </div>

        {/* Beds Grid */}
        <div className="bs-grid">
          {sortedBeds.length === 0 ? (
            <div className="bs-center-message">
              <BedDouble size={48} className="bs-empty-icon" />
              <h3>No beds found in this room.</h3>
              <p>Please try selecting a different room.</p>
            </div>
          ) : (
            sortedBeds.map((bed) => {
              const status = getBedStatus(bed);
              const StatusIcon = status.icon;

              return (
                <div
                  key={bed.id}
                  className={`bs-card ${status.class}`}
                  onClick={() => handleBedSelect(bed)}
                  role="button"
                  tabIndex={status.class === "available" ? 0 : -1} // Accessibility
                  aria-disabled={status.class !== "available"}
                >
                  {/* Icon Box */}
                  <div className={`bs-icon-box ${status.class}`}>
                    <BedDouble size={28} strokeWidth={1.5} />
                  </div>

                  {/* Bed Info */}
                  <div className="bs-bed-title">{bed.bedNumber}</div>
                  <div className="bs-room-label">
                    <DoorOpen size={12} /> {bed.roomNumber || "Room"}
                  </div>

                  {/* Status Badge */}
                  <div className={`bs-status-badge ${status.class}`}>
                    <StatusIcon size={14} />
                    {status.label}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default BedSelection;