import React, { useEffect, useState } from "react";
import {
  X,
  Plus,
  AlertCircle,
  Info,
  Lock,
  Unlock,
  Loader2,
} from "lucide-react";
import { useNotification } from "../../context/NotificationContext";

const RoomFormModal = ({
  isOpen,
  onClose,
  isEditMode,
  roomToEdit,
  floors,
  onSubmit,
}) => {
  const notify = useNotification();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialFormState = {
    floorId: "",
    roomNumber: "",
    monthlyPrice: "",
    weeklyPrice: "",
    dailyPrice: "",
    isPrivate: false,
    reservationPeriod: "DEFAULT",
    reservedFor: "BOYS",
    roomType: "SHARING_2",
    comment: "",
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && roomToEdit) {
        const floorObj = floors.find(
          (f) => f.floorNumber === roomToEdit.floorNumber,
        );

        setFormData({
          floorId: floorObj ? floorObj.id : "",
          roomNumber: roomToEdit.roomNumber,
          monthlyPrice: roomToEdit.monthlyPrice,
          weeklyPrice: roomToEdit.weeklyPrice || "",
          dailyPrice: roomToEdit.dailyPrice || "",
          isPrivate: roomToEdit.isPrivate,
          reservationPeriod: roomToEdit.reservationPeriod,
          reservedFor: roomToEdit.reservedFor,
          roomType: roomToEdit.roomType,
          comment: roomToEdit.comment || "",
        });
      } else {
        setFormData(initialFormState);
      }
    }
  }, [isOpen, isEditMode, roomToEdit, floors]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.roomNumber.trim() || !formData.monthlyPrice) {
      notify.warning("Room Number and Monthly Price are required");
      return;
    }

    if (formData.reservationPeriod === "DEFAULT") {
      if (!formData.weeklyPrice || !formData.dailyPrice) {
        notify.warning(
          "Weekly and Daily prices are required for Default period",
        );
        return;
      }
    }

    if (
      Number(formData.monthlyPrice) < 0 ||
      Number(formData.weeklyPrice) < 0 ||
      Number(formData.dailyPrice) < 0
    ) {
      notify.error("Prices cannot be negative!");
      return;
    }

    if (!isEditMode && !formData.floorId) {
      notify.warning("Please select a floor");
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="mr-overlay" onClick={() => !isSubmitting && onClose()}>
      <div className="mr-modal" onClick={(e) => e.stopPropagation()}>
        <div className="mr-modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <div
              style={{
                background: "#f0f9ff",
                padding: "10px",
                borderRadius: "12px",
                border: "1px solid #e0f2fe",
              }}
            >
              <Plus size={24} color="#0284c7" />
            </div>
            <div>
              <div className="mr-modal-title">
                {isEditMode ? "Edit Room Details" : "Create New Room"}
              </div>
              <div className="mr-modal-sub">
                {isEditMode
                  ? "Update existing room information"
                  : "Add a new accommodation unit"}
              </div>
            </div>
          </div>
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

        <form onSubmit={handleSubmit}>
          <div className="mr-modal-body">
            {/* Section 1: Location */}
            <div>
              <div className="mr-section-label">1. Location Details</div>
              <div className="mr-input-grid">
                <div className="mr-input-group">
                  <label className="mr-label">Floor Location</label>
                  <select
                    className="mr-select-dd"
                    style={{
                      opacity: isEditMode ? 0.6 : 1,
                      cursor: isEditMode ? "not-allowed" : "pointer",
                    }}
                    value={formData.floorId}
                    onChange={(e) =>
                      setFormData({ ...formData, floorId: e.target.value })
                    }
                    required={!isEditMode}
                    disabled={isEditMode || isSubmitting}
                  >
                    <option value="">Select Floor</option>
                    {floors.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.hubNumber ? `${f.hubNumber} - ` : ""}
                        {f.floorNumber}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mr-input-group">
                  <label className="mr-label">Room Number</label>
                  <input
                    className="mr-input"
                    style={{
                      opacity: isEditMode ? 0.6 : 1,
                      cursor: isEditMode ? "not-allowed" : "text",
                    }}
                    placeholder="Ex: R-101"
                    value={formData.roomNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, roomNumber: e.target.value })
                    }
                    required
                    disabled={isEditMode || isSubmitting}
                  />
                </div>
              </div>
              {isEditMode && (
                <div
                  style={{
                    fontSize: "11px",
                    color: "#ef4444",
                    marginTop: "8px",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <AlertCircle size={12} /> Room Number and Location cannot be
                  changed after creation.
                </div>
              )}
            </div>

            {/* Section 2: Config */}
            <div>
              <div className="mr-section-label">
                2. Configuration & Capacity
              </div>
              <div className="mr-input-grid">
                <div className="mr-input-group">
                  <label className="mr-label">Capacity (Type)</label>
                  <select
                    className="mr-select-dd"
                    value={formData.roomType}
                    onChange={(e) =>
                      setFormData({ ...formData, roomType: e.target.value })
                    }
                    disabled={isSubmitting}
                  >
                    <option value="SHARING_2">2 Person Sharing</option>
                    <option value="SHARING_4">4 Person Sharing</option>
                    <option value="SHARING_6">6 Person Sharing</option>
                  </select>
                </div>
                <div className="mr-input-group">
                  <label className="mr-label">Reserved For</label>
                  <select
                    className="mr-select-dd"
                    value={formData.reservedFor}
                    onChange={(e) =>
                      setFormData({ ...formData, reservedFor: e.target.value })
                    }
                    disabled={isSubmitting}
                  >
                    <option value="BOYS">👨 Boys</option>
                    <option value="GIRLS">👩 Girls</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 3: Pricing */}
            <div>
              <div className="mr-section-label">3. Pricing & Access</div>
              <div
                className={`mr-price-note ${formData.isPrivate ? "note-private" : "note-shared"}`}
              >
                <Info size={18} style={{ marginTop: "2px", flexShrink: 0 }} />
                <span>
                  <strong>Important:</strong> Please enter the price
                  {formData.isPrivate
                    ? " for the entire private room (Full Room Price)."
                    : " per student / per bed (Per Person Price)."}
                </span>
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label className="mr-label">Pricing Model</label>
                <select
                  className="mr-select-dd"
                  value={formData.reservationPeriod}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      reservationPeriod: e.target.value,
                    })
                  }
                  disabled={isSubmitting}
                >
                  <option value="DEFAULT">Default (Any Duration)</option>
                  <option value="MONTHLY">Monthly Only (30/60/90 Days)</option>
                </select>
              </div>

              <div className="mr-input-grid">
                <div className="mr-input-group">
                  <label className="mr-label">Monthly Price (LKR)</label>
                  <input
                    type="number"
                    min="0"
                    className="mr-input"
                    placeholder="0.00"
                    value={formData.monthlyPrice}
                    onChange={(e) =>
                      setFormData({ ...formData, monthlyPrice: e.target.value })
                    }
                    required
                    disabled={isSubmitting}
                  />
                </div>

                {formData.reservationPeriod === "DEFAULT" && (
                  <>
                    <div className="mr-input-group">
                      <label className="mr-label">Weekly Price (LKR)</label>
                      <input
                        type="number"
                        min="0"
                        className="mr-input"
                        placeholder="0.00"
                        value={formData.weeklyPrice}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            weeklyPrice: e.target.value,
                          })
                        }
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="mr-input-group">
                      <label className="mr-label">Daily Price (LKR)</label>
                      <input
                        type="number"
                        min="0"
                        className="mr-input"
                        placeholder="0.00"
                        value={formData.dailyPrice}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            dailyPrice: e.target.value,
                          })
                        }
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Toggle Private */}
            <div style={{ marginTop: "20px" }}>
              <div
                className={`mr-toggle-card ${formData.isPrivate ? "active" : ""}`}
                onClick={() =>
                  !isSubmitting &&
                  setFormData({ ...formData, isPrivate: !formData.isPrivate })
                }
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "12px" }}
                >
                  <div
                    style={{
                      padding: "8px",
                      borderRadius: "10px",
                      background: formData.isPrivate ? "#e0f2fe" : "#f1f5f9",
                      color: formData.isPrivate ? "#0284c7" : "#64748b",
                    }}
                  >
                    {formData.isPrivate ? (
                      <Lock size={20} />
                    ) : (
                      <Unlock size={20} />
                    )}
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: "700",
                        color: "#1e293b",
                      }}
                    >
                      {formData.isPrivate ? "Private Room" : "Shared Room"}
                    </div>
                    <div style={{ fontSize: "12px", color: "#64748b" }}>
                      {formData.isPrivate
                        ? "Entire room booking (Higher Cost)"
                        : "Individual bed booking"}
                    </div>
                  </div>
                </div>
                <div
                  className={`mr-toggle-container ${formData.isPrivate ? "toggle-on" : "toggle-off"}`}
                >
                  <div
                    className={`mr-toggle-circle ${formData.isPrivate ? "circle-on" : "circle-off"}`}
                  ></div>
                </div>
              </div>
            </div>

            {/* Admin Notes */}
            {isEditMode && (
              <div
                style={{
                  marginTop: "10px",
                  borderTop: "1px dashed #e2e8f0",
                  paddingTop: "20px",
                }}
              >
                <div className="mr-section-label">4. Admin Notes</div>
                <div className="mr-input-group">
                  <label className="mr-label">Room Comment / Status</label>
                  <textarea
                    className="mr-textarea"
                    placeholder="Add a special note (e.g. 'Under Maintenance')."
                    value={formData.comment}
                    onChange={(e) =>
                      setFormData({ ...formData, comment: e.target.value })
                    }
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="mr-modal-footer">
            {/* <button
              type="button"
              onClick={onClose}
              className="mr-cancel-btn"
              disabled={isSubmitting}
            >
              Cancel
            </button> */}
            <button
              type="submit"
              className="mr-save-btn"
              disabled={isSubmitting}
              style={{ display: "flex", gap: "8px" }}
            >
              {isSubmitting && <Loader2 className="animate-spin" size={16} />}
              {isSubmitting
                ? "Saving..."
                : isEditMode
                  ? "Update Changes"
                  : "Save Room"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoomFormModal;
