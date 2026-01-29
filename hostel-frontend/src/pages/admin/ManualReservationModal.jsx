import React, { useEffect, useState } from "react";
import { X, MapPin, User, CreditCard, Loader2 } from "lucide-react";
import hubService from "../../services/hub.service";
import floorService from "../../services/floor.service";
import roomService from "../../services/room.service";
import reservationService from "../../services/reservation.service";
import { useNotification } from "../../context/NotificationContext";

const ManualReservationModal = ({ isOpen, onClose, onSuccess }) => {
  const notify = useNotification();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [hubs, setHubs] = useState([]);
  const [floors, setFloors] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [beds, setBeds] = useState([]);

  const [manualForm, setManualForm] = useState({
    studentName: "",
    registrationNumber: "",
    email: "",
    contactNumber: "",
    address: "",
    gender: "MALE",
    amount: "",
    paymentReference: "",
    fromDate: "",
    toDate: "",
    hubId: "",
    floorId: "",
    roomId: "",
    bedId: "",
  });

  useEffect(() => {
    if (isOpen) {
      hubService
        .getAllHubs()
        .then((res) => setHubs(res.data.data))
        .catch(console.error);
    }
  }, [isOpen]);

  useEffect(() => {
    if (manualForm.hubId) {
      hubService
        .getFloorsByHub(manualForm.hubId)
        .then((res) => setFloors(res.data.data));
    }
    setManualForm((prev) => ({ ...prev, floorId: "", roomId: "", bedId: "" }));
  }, [manualForm.hubId]);

  useEffect(() => {
    if (manualForm.floorId) {
      floorService
        .getRoomsByFloor(manualForm.floorId)
        .then((res) => setRooms(res.data.data));
    }
    setManualForm((prev) => ({ ...prev, roomId: "", bedId: "" }));
  }, [manualForm.floorId]);

  useEffect(() => {
    if (manualForm.roomId) {
      roomService.getBedsByRoom(manualForm.roomId).then((res) => {
        setBeds(
          res.data.data.filter((b) => !b.isBooked && !b.underMaintenance),
        );
      });
    }
    setManualForm((prev) => ({ ...prev, bedId: "" }));
  }, [manualForm.roomId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!manualForm.bedId) return notify.warning("Please select a bed.");

    try {
      setIsSubmitting(true);
      const payload = {
        ...manualForm,
        studentName: manualForm.studentName.trim(),
        registrationNumber: manualForm.registrationNumber.trim(),
        paymentReference: manualForm.paymentReference.trim(),
      };

      await reservationService.createManualReservation(payload);
      onSuccess();
      onClose();

      setManualForm({
        studentName: "",
        registrationNumber: "",
        email: "",
        contactNumber: "",
        address: "",
        gender: "MALE",
        amount: "",
        paymentReference: "",
        fromDate: "",
        toDate: "",
        hubId: "",
        floorId: "",
        roomId: "",
        bedId: "",
      });
    } catch (e) {
      notify.error(e.response?.data?.message || "Creation Failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="mr-overlay" onClick={() => !isSubmitting && onClose()}>
      <div
        className="mr-modal-content"
        style={{ width: "700px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mr-modal-header">
          <h2 className="mr-modal-title">Create Reservation</h2>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#94a3b8",
            }}
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mr-modal-body">
          {/* Section 1: Accommodation */}
          <div className="mr-form-section">
            <div className="mr-form-section-title">
              <MapPin
                size={16}
                style={{ marginRight: "8px", verticalAlign: "text-bottom" }}
              />{" "}
              1. Select Accommodation
            </div>
            <div className="mr-form-row">
              <div className="mr-form-group">
                <label className="mr-form-label">Hub</label>
                <select
                  className="mr-form-select"
                  value={manualForm.hubId}
                  onChange={(e) =>
                    setManualForm({ ...manualForm, hubId: e.target.value })
                  }
                  disabled={isSubmitting}
                >
                  <option value="">-- Select Hub --</option>
                  {hubs.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.hubNumber}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mr-form-group">
                <label className="mr-form-label">Floor</label>
                <select
                  className="mr-form-select"
                  value={manualForm.floorId}
                  onChange={(e) =>
                    setManualForm({ ...manualForm, floorId: e.target.value })
                  }
                  disabled={!manualForm.hubId || isSubmitting}
                >
                  <option value="">-- Select Floor --</option>
                  {floors.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.floorNumber}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mr-form-row">
              <div className="mr-form-group">
                <label className="mr-form-label">Room</label>
                <select
                  className="mr-form-select"
                  value={manualForm.roomId}
                  onChange={(e) =>
                    setManualForm({ ...manualForm, roomId: e.target.value })
                  }
                  disabled={!manualForm.floorId || isSubmitting}
                >
                  <option value="">-- Select Room --</option>
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.roomNumber} ({r.reservedFor})
                    </option>
                  ))}
                </select>
              </div>
              <div className="mr-form-group">
                <label className="mr-form-label">Available Bed</label>
                <select
                  className="mr-form-select"
                  style={{
                    borderColor: manualForm.bedId ? "#22c55e" : "#e2e8f0",
                    background: manualForm.bedId ? "#f0fdf4" : "white",
                  }}
                  value={manualForm.bedId}
                  onChange={(e) =>
                    setManualForm({ ...manualForm, bedId: e.target.value })
                  }
                  disabled={!manualForm.roomId || isSubmitting}
                >
                  <option value="">-- Select Bed --</option>
                  {beds.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.bedNumber}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Student Details */}
          <div className="mr-form-section">
            <div className="mr-form-section-title">
              <User
                size={16}
                style={{ marginRight: "8px", verticalAlign: "text-bottom" }}
              />{" "}
              2. Student Details
            </div>
            <div className="mr-form-row">
              <div className="mr-form-group">
                <label className="mr-form-label">Full Name</label>
                <input
                  className="mr-form-input"
                  value={manualForm.studentName}
                  onChange={(e) =>
                    setManualForm({
                      ...manualForm,
                      studentName: e.target.value,
                    })
                  }
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="mr-form-group">
                <label className="mr-form-label">Reg No / Username</label>
                <input
                  className="mr-form-input"
                  value={manualForm.registrationNumber}
                  onChange={(e) =>
                    setManualForm({
                      ...manualForm,
                      registrationNumber: e.target.value,
                    })
                  }
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="mr-form-row">
              <div className="mr-form-group">
                <label className="mr-form-label">Email</label>
                <input
                  type="email"
                  className="mr-form-input"
                  value={manualForm.email}
                  onChange={(e) =>
                    setManualForm({ ...manualForm, email: e.target.value })
                  }
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="mr-form-group">
                <label className="mr-form-label">Contact No</label>
                <input
                  className="mr-form-input"
                  value={manualForm.contactNumber}
                  onChange={(e) =>
                    setManualForm({
                      ...manualForm,
                      contactNumber: e.target.value,
                    })
                  }
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Payment */}
          <div className="mr-form-section">
            <div className="mr-form-section-title">
              <CreditCard
                size={16}
                style={{ marginRight: "8px", verticalAlign: "text-bottom" }}
              />{" "}
              3. Payment & Dates
            </div>
            <div className="mr-form-row">
              <div className="mr-form-group">
                <label className="mr-form-label">
                  Payment Reference / Slip ID
                </label>
                <input
                  className="mr-form-input"
                  value={manualForm.paymentReference}
                  onChange={(e) =>
                    setManualForm({
                      ...manualForm,
                      paymentReference: e.target.value,
                    })
                  }
                  required
                  placeholder="e.g. SLIP-8821"
                  disabled={isSubmitting}
                />
              </div>
              <div className="mr-form-group">
                <label className="mr-form-label">Amount Paid (LKR)</label>
                <input
                  type="number"
                  className="mr-form-input"
                  value={manualForm.amount}
                  onChange={(e) =>
                    setManualForm({ ...manualForm, amount: e.target.value })
                  }
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>
            <div className="mr-form-row">
              <div className="mr-form-group">
                <label className="mr-form-label">Check-in Date</label>
                <input
                  type="date"
                  className="mr-form-input"
                  value={manualForm.fromDate}
                  onChange={(e) =>
                    setManualForm({ ...manualForm, fromDate: e.target.value })
                  }
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="mr-form-group">
                <label className="mr-form-label">Check-out Date</label>
                <input
                  type="date"
                  className="mr-form-input"
                  value={manualForm.toDate}
                  onChange={(e) =>
                    setManualForm({ ...manualForm, toDate: e.target.value })
                  }
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: "30px",
              display: "flex",
              justifyContent: "flex-end",
              gap: "12px",
              paddingTop: "20px",
              borderTop: "1px solid #f1f5f9",
            }}
          >
            <button
              type="button"
              onClick={onClose}
              className="mr-btn-cancel"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="mr-add-btn"
              style={{ display: "flex", gap: "8px" }}
            >
              {isSubmitting && <Loader2 className="animate-spin" size={16} />}
              {isSubmitting ? "Processing..." : "Confirm Booking"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManualReservationModal;
