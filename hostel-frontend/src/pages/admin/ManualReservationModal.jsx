import React, { useEffect, useState } from "react";
import { X, MapPin, User, CreditCard, Loader2, Calendar } from "lucide-react";
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
      
      // Reset form
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
        className="mr-modal-content manual-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mr-modal-header">
          <div>
            <h2 className="mr-modal-title">Create Reservation</h2>
            <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
              Manually book a bed for a student
            </p>
          </div>
          <button
            className="mr-close-icon-btn"
            onClick={onClose}
            disabled={isSubmitting}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mr-modal-body">
            
            {/* Section 1: Accommodation */}
            <div className="mr-section">
              <div className="mr-section-title">
                <MapPin size={16} /> Accommodation Details
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
                    <option value="">Select Hub</option>
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
                    <option value="">Select Floor</option>
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
                    <option value="">Select Room</option>
                    {rooms.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.roomNumber} ({r.reservedFor})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mr-form-group">
                  <label className="mr-form-label">Bed Selection</label>
                  <select
                    className={`mr-form-select ${manualForm.bedId ? "input-success" : ""}`}
                    value={manualForm.bedId}
                    onChange={(e) =>
                      setManualForm({ ...manualForm, bedId: e.target.value })
                    }
                    disabled={!manualForm.roomId || isSubmitting}
                  >
                    <option value="">Select Bed</option>
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
            <div className="mr-section">
              <div className="mr-section-title">
                <User size={16} /> Student Information
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
                    placeholder="Enter student name"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div className="mr-form-group">
                  <label className="mr-form-label">Registration No / User</label>
                  <input
                    className="mr-form-input"
                    value={manualForm.registrationNumber}
                    onChange={(e) =>
                      setManualForm({
                        ...manualForm,
                        registrationNumber: e.target.value,
                      })
                    }
                    placeholder="e.g. 20001234"
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="mr-form-row">
                <div className="mr-form-group">
                  <label className="mr-form-label">Email Address</label>
                  <input
                    type="email"
                    className="mr-form-input"
                    value={manualForm.email}
                    onChange={(e) =>
                      setManualForm({ ...manualForm, email: e.target.value })
                    }
                    placeholder="student@example.com"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div className="mr-form-group">
                  <label className="mr-form-label">Contact Number</label>
                  <input
                    className="mr-form-input"
                    value={manualForm.contactNumber}
                    onChange={(e) =>
                      setManualForm({
                        ...manualForm,
                        contactNumber: e.target.value,
                      })
                    }
                    placeholder="077xxxxxxx"
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Payment */}
            <div className="mr-section">
              <div className="mr-section-title">
                <CreditCard size={16} /> Payment & Duration
              </div>
              <div className="mr-form-row">
                <div className="mr-form-group">
                  <label className="mr-form-label">Slip ID / Reference</label>
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
                  <label className="mr-form-label">Amount (LKR)</label>
                  <input
                    type="number"
                    className="mr-form-input"
                    value={manualForm.amount}
                    onChange={(e) =>
                      setManualForm({ ...manualForm, amount: e.target.value })
                    }
                    placeholder="0.00"
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              <div className="mr-form-row">
                <div className="mr-form-group">
                  <label className="mr-form-label">
                    <Calendar size={12} style={{display:'inline', marginRight:'4px'}}/>
                    Check-in Date
                  </label>
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
                  <label className="mr-form-label">
                    <Calendar size={12} style={{display:'inline', marginRight:'4px'}}/>
                    Check-out Date
                  </label>
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
          </div>

          {/* Footer */}
          <div className="mr-modal-footer">
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="mr-submit-btn"
              style={{ display: "flex", alignItems: "center", gap: "8px" }}
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