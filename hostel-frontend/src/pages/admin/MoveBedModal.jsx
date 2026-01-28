import React from "react";
import { X, BedDouble, Building2, Layers, DoorOpen } from "lucide-react";

const MoveBedModal = ({ isOpen, onClose, matchingBeds, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="mr-overlay" onClick={onClose}>
      <div className="mr-modal-content" style={{ width: "480px" }} onClick={(e) => e.stopPropagation()}>
        <div className="mr-modal-header">
          <div>
            <h3 className="mr-modal-title">Select New Bed</h3>
            <p style={{ margin: "2px 0 0", fontSize: "13px", color: "#64748b" }}>Re-assign this reservation to an available bed.</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}>
            <X size={24} />
          </button>
        </div>
        <div style={{ padding: "0", maxHeight: "350px", overflowY: "auto", background: "#f8fafc" }}>
          {matchingBeds.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
              <BedDouble size={32} style={{ marginBottom: "10px", opacity: 0.5 }} />
              <p>No matching available beds found.</p>
            </div>
          ) : (
            matchingBeds.map((b) => (
              <div
                key={b.id}
                onClick={() => onConfirm(b.id)}
                style={{
                  padding: "16px 24px", cursor: "pointer", borderBottom: "1px solid #f1f5f9", background: "white", display: "flex", alignItems: "center", gap: "15px", transition: "background 0.2s"
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
              >
                <div style={{ minWidth: "40px", height: "40px", borderRadius: "10px", background: "#e0e7ff", color: "#4338ca", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <BedDouble size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: "700", color: "#1e293b", fontSize: "15px" }}>Bed {b.bedNumber}</div>
                  <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                    <span style={{ fontSize: "11px", fontWeight: "600", padding: "2px 8px", borderRadius: "4px", background: "#f3f4f6", color: "#4b5563", display: "flex", alignItems: "center", gap: "4px" }}>
                      <Building2 size={10} /> {b.hubNumber || "-"}
                    </span>
                    <span style={{ fontSize: "11px", fontWeight: "600", padding: "2px 8px", borderRadius: "4px", background: "#f3f4f6", color: "#4b5563", display: "flex", alignItems: "center", gap: "4px" }}>
                      <Layers size={10} /> {b.floorNumber || "-"}
                    </span>
                    <span style={{ fontSize: "11px", fontWeight: "600", padding: "2px 8px", borderRadius: "4px", background: "#fff7ed", color: "#c2410c", border: "1px solid #fed7aa", display: "flex", alignItems: "center", gap: "4px" }}>
                      <DoorOpen size={10} /> {b.roomNumber || "-"}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="mr-modal-footer">
          <button className="mr-close-btn" style={{ marginTop: 0, width: "auto" }} onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default MoveBedModal;