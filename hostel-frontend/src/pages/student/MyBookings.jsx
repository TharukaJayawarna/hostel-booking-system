import React, { useEffect, useState } from "react";
import { useNotification } from "../../context/NotificationContext";
import {
  Calendar,
  Clock,
  Ban,
  Edit3,
  CheckCircle2,
  XCircle,
  BedDouble,
  History,
  X,
  Ticket,
  Loader2,
} from "lucide-react";
import { format, differenceInDays, parseISO } from "date-fns";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import ConfirmModal from "../../components/ConfirmModal";
import GatePassModal from "./GatePassModal"; // <--- අලුත් Import එක මෙතැනට

import "./styles/MyBookings.css";
import reservationService from "../../services/reservation.service";

const MyBookings = () => {
  const notify = useNotification();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [selectedBookingForDate, setSelectedBookingForDate] = useState(null);
  const [dateRange, setDateRange] = useState([
    { startDate: new Date(), endDate: new Date(), key: "selection" },
  ]);
  const [requiredDuration, setRequiredDuration] = useState(0);

  const [isPassModalOpen, setIsPassModalOpen] = useState(false);
  const [passDetails, setPassDetails] = useState(null);
  const [passLoading, setPassLoading] = useState(false);

  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await reservationService.getMyBookings();
      if (res.data.status === "SUCCESS") {
        const activeBookings = res.data.data.filter(
          (booking) =>
            booking.status !== "CANCELLED" && booking.status !== "REJECTED",
        );
        const sortedBookings = activeBookings.sort((a, b) => b.id - a.id);
        setBookings(sortedBookings);
      }
    } catch (e) {
      notify.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelClick = (id) => {
    setBookingToCancel(id);
    setCancelModalOpen(true);
  };

  const confirmCancel = async () => {
    if (!bookingToCancel) return;
    try {
      await reservationService.cancelReservation(bookingToCancel);
      notify.success("Booking Cancelled Successfully");
      fetchBookings();
    } catch (e) {
      notify.error("Cancellation Failed");
    } finally {
      setCancelModalOpen(false);
    }
  };

  const handleViewPass = async (id) => {
    setPassLoading(true);
    setIsPassModalOpen(true);
    setPassDetails(null);
    try {
      const res = await reservationService.getReservationById(id);
      if (res.data.status === "SUCCESS") {
        setPassDetails(res.data.data);
      }
    } catch (e) {
      notify.error("Failed to load pass details");
      setIsPassModalOpen(false);
    } finally {
      setPassLoading(false);
    }
  };

  // --- Date Change Logic ---
  const openDateModal = (booking) => {
    const start = parseISO(booking.checkIn);
    const end = parseISO(booking.checkOut);
    const duration = differenceInDays(end, start);

    setRequiredDuration(duration);
    setSelectedBookingForDate(booking);
    setDateRange([{ startDate: start, endDate: end, key: "selection" }]);
    setIsDateModalOpen(true);
  };

  const handleDateChangeSubmit = async () => {
    const newStart = dateRange[0].startDate;
    const newEnd = dateRange[0].endDate;
    const newDuration = differenceInDays(newEnd, newStart);

    if (newDuration !== requiredDuration) {
      notify.error(
        `Invalid Duration! Please select exactly ${requiredDuration} days.`,
      );
      return;
    }

    try {
      await reservationService.changeBookingDates(selectedBookingForDate.id, {
        newCheckInDate: format(newStart, "yyyy-MM-dd"),
        newCheckOutDate: format(newEnd, "yyyy-MM-dd"),
      });
      notify.success("Dates Updated Successfully!");
      setIsDateModalOpen(false);
      fetchBookings();
    } catch (e) {
      notify.error(e.response?.data?.message || "Update Failed");
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      APPROVED: {
        class: "status-approved",
        icon: CheckCircle2,
        label: "Active",
      },
      PENDING: { class: "status-pending", icon: Clock, label: "Pending" },
      REJECTED: { class: "status-rejected", icon: XCircle, label: "Rejected" },
      CANCELLED: { class: "status-cancelled", icon: Ban, label: "Cancelled" },
      COMPLETED: {
        class: "status-completed",
        icon: History,
        label: "Completed",
      },
    };
    const style = config[status] || config.PENDING;
    const Icon = style.icon;
    return (
      <span className={`status-badge ${style.class}`}>
        <Icon size={14} /> {style.label}
      </span>
    );
  };

  return (
    <div className="mybookings-container">
      <div className="content-wrapper">
        <div className="bookings-header">
          <div>
            <h1 className="page-title">My Reservations</h1>
            <p className="page-subtitle">
              Manage your current and past accommodation bookings.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">
            <Loader2 className="animate-spin" size={40} color="#4f46e5" />
            <p>Loading your bookings...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="empty-state">
            <Calendar size={48} className="empty-icon" />
            <h3>No Active Reservations</h3>
            <p>You haven't made any bookings yet.</p>
          </div>
        ) : (
          bookings.map((booking) => (
            <div key={booking.id} className="booking-card">
              <div className="booking-card-header">
                <div>
                  <div className="res-id">
                    REF: #{booking.reservationNumber}
                  </div>
                  <div className="bed-info">
                    <BedDouble size={20} color="#4f46e5" />
                    <span>
                      {booking.roomNumber} - Bed {booking.bedNumber}
                    </span>
                  </div>
                </div>
                {getStatusBadge(booking.status)}
              </div>

              <div className="booking-card-body">
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Check-in</span>
                    <span className="info-value">
                      <Calendar size={16} /> {booking.checkIn}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Check-out</span>
                    <span className="info-value">
                      <Calendar size={16} /> {booking.checkOut}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Duration</span>
                    <span className="info-value">
                      <Clock size={16} />{" "}
                      {differenceInDays(
                        parseISO(booking.checkOut),
                        parseISO(booking.checkIn),
                      )}{" "}
                      Nights
                    </span>
                  </div>
                </div>
              </div>

              {booking.status === "APPROVED" && (
                <div className="booking-card-footer">
                  <button
                    onClick={() => handleViewPass(booking.id)}
                    className="action-btn btn-pass"
                  >
                    <Ticket size={16} /> View Gate Pass
                  </button>
                  <button
                    onClick={() => openDateModal(booking)}
                    className="action-btn btn-outline"
                  >
                    <Edit3 size={16} /> Change Dates
                  </button>
                  <button
                    onClick={() => handleCancelClick(booking.id)}
                    className="action-btn btn-danger"
                  >
                    <Ban size={16} /> Cancel
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* --- NEW GATE PASS MODAL COMPONENT --- */}
      <GatePassModal 
        isOpen={isPassModalOpen}
        onClose={() => setIsPassModalOpen(false)}
        loading={passLoading}
        passDetails={passDetails}
      />

      {/* --- DATE CHANGE MODAL --- */}
      {isDateModalOpen && (
        <div
          className="modal-overlay"
          onClick={() => setIsDateModalOpen(false)}
        >
          <div
            className="date-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="dm-header">
              <div className="dm-title">Change Dates</div>
              <button
                onClick={() => setIsDateModalOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <X size={20} />
              </button>
            </div>
            <div className="dm-body">
              <div className="dm-note">
                Note: You must select exactly{" "}
                <strong>{requiredDuration} days</strong>.
              </div>
              <div className="dm-calendar-wrapper">
                <DateRange
                  editableDateInputs={true}
                  onChange={(item) => setDateRange([item.selection])}
                  moveRangeOnFirstSelection={false}
                  ranges={dateRange}
                  minDate={new Date()}
                  rangeColors={["#4f46e5"]}
                  color="#4f46e5"
                />
              </div>
            </div>
            <div className="dm-footer">
              <button
                onClick={() => setIsDateModalOpen(false)}
                className="action-btn btn-outline"
              >
                Cancel
              </button>
              <button
                onClick={handleDateChangeSubmit}
                className="action-btn btn-pass"
              >
                Update Dates
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        onConfirm={confirmCancel}
        title="Cancel Booking?"
        message="Are you sure you want to cancel? Payments are non-refundable according to our policy."
        confirmText="Yes, Cancel Booking"
        isDanger={true}
      />
    </div>
  );
};

export default MyBookings;