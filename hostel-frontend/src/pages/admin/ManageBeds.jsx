import React, { useEffect, useState, useMemo } from "react";
import { useNotification } from "../../context/NotificationContext";
import {
  BedDouble,
  Wrench,
  Trash2,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import ConfirmModal from "../../components/ConfirmModal";
import "./styles/ManageBeds.css";

import bedService from "../../services/bed.service";
import roomService from "../../services/room.service";
import authService from "../../services/auth.service";

const ManageBeds = () => {
  const notify = useNotification();

  const [beds, setBeds] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterRoom, setFilterRoom] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ roomId: "", bedNumber: "" });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [bedToDelete, setBedToDelete] = useState(null);

  const user = authService.getCurrentUser();
  const isWarden = user?.role === "WARDEN";

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterRoom, filterStatus]);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [b, r] = await Promise.all([
        bedService.getAllBeds(),
        roomService.getAllRooms(),
      ]);

      if (b.data.status === "SUCCESS") setBeds(b.data.data);
      if (r.data.status === "SUCCESS") setRooms(r.data.data);
    } catch (e) {
      notify.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const filteredBeds = useMemo(() => {
    return beds.filter((bed) => {
      const bedNo = bed.bedNumber ? bed.bedNumber.toString() : "";
      const matchesSearch = bedNo
        .toLowerCase()
        .includes(searchTerm.toLowerCase().trim());
      const matchesRoom = filterRoom === "ALL" || bed.roomNumber === filterRoom;

      let matchesStatus = true;
      if (filterStatus === "BOOKED") matchesStatus = bed.isBooked;
      if (filterStatus === "AVAILABLE")
        matchesStatus = !bed.isBooked && !bed.underMaintenance;
      if (filterStatus === "MAINTENANCE") matchesStatus = bed.underMaintenance;

      return matchesSearch && matchesRoom && matchesStatus;
    });
  }, [beds, searchTerm, filterRoom, filterStatus]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBeds = filteredBeds.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredBeds.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.roomId || !formData.bedNumber.trim()) {
      notify.warning("Please fill all fields");
      return;
    }

    try {
      setIsSubmitting(true);
      await bedService.createBed(formData.roomId, {
        bedNumber: formData.bedNumber.trim(),
      });

      notify.success("Bed Added Successfully!");
      setIsModalOpen(false);
      setFormData({ roomId: "", bedNumber: "" });
      fetchAll();
    } catch (e) {
      notify.error(e.response?.data?.message || "Failed to create bed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!bedToDelete) return;
    try {
      setIsSubmitting(true);
      await bedService.deleteBed(bedToDelete);
      notify.success("Bed Deleted Successfully");

      setBeds((prev) => prev.filter((b) => b.id !== bedToDelete));
    } catch (e) {
      notify.error("Failed to delete bed");
    } finally {
      setIsSubmitting(false);
      setIsDeleteModalOpen(false);
      setBedToDelete(null);
    }
  };

  const toggleMaintenance = async (bed) => {
    if (isWarden) return;

    const previousStatus = bed.underMaintenance;
    const newStatus = !previousStatus;

    const updatedBeds = beds.map((b) =>
      b.id === bed.id ? { ...b, underMaintenance: newStatus } : b,
    );
    setBeds(updatedBeds);

    try {
      await bedService.toggleMaintenance(bed.id, newStatus);
      notify.success(`Maintenance Mode: ${newStatus ? "ON" : "OFF"}`);
    } catch (e) {
      const revertedBeds = beds.map((b) =>
        b.id === bed.id ? { ...b, underMaintenance: previousStatus } : b,
      );
      setBeds(revertedBeds);
      notify.error("Failed to update status");
    }
  };

  const stats = {
    total: beds.length,
    available: beds.filter((b) => !b.isBooked && !b.underMaintenance).length,
    booked: beds.filter((b) => b.isBooked).length,
    maintenance: beds.filter((b) => b.underMaintenance).length,
  };

  return (
    <div className="mb-container">
      <div className="mb-header">
        <div className="mb-title">
          <div className="mb-icon-box">
            <BedDouble size={28} />
          </div>
          <div>
            Manage Beds{" "}
            <div className="mb-subtitle">Inventory & Maintenance</div>
          </div>
        </div>
        {!isWarden && (
          <button className="mb-add-btn" onClick={() => setIsModalOpen(true)}>
            <Plus size={18} /> Add Bed
          </button>
        )}
      </div>

      <div className="mb-stats-grid">
        <div className="mb-stat-card">
          <div className="mb-stat-icon icon-blue">
            <BedDouble size={24} />
          </div>
          <div>
            <div className="mb-stat-value">{stats.total}</div>
            <div className="mb-stat-label">Total Beds</div>
          </div>
        </div>
        <div className="mb-stat-card">
          <div className="mb-stat-icon icon-green">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div className="mb-stat-value">{stats.available}</div>
            <div className="mb-stat-label">Available</div>
          </div>
        </div>
        <div className="mb-stat-card">
          <div className="mb-stat-icon icon-red">
            <XCircle size={24} />
          </div>
          <div>
            <div className="mb-stat-value">{stats.booked}</div>
            <div className="mb-stat-label">Occupied</div>
          </div>
        </div>
        <div className="mb-stat-card">
          <div className="mb-stat-icon icon-amber">
            <Wrench size={24} />
          </div>
          <div>
            <div className="mb-stat-value">{stats.maintenance}</div>
            <div className="mb-stat-label">Maintenance</div>
          </div>
        </div>
      </div>

      <div className="mb-toolbar">
        <div className="mb-search-box">
          <Search size={18} color="#9ca3af" />
          <input
            className="mb-search-input"
            placeholder="Search by Bed Number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="mb-filter-group">
          <Filter size={18} color="#6b7280" />
          <select
            className="mb-select"
            value={filterRoom}
            onChange={(e) => setFilterRoom(e.target.value)}
          >
            <option value="ALL">All Rooms</option>
            {[...new Set(beds.map((b) => b.roomNumber))].map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <select
            className="mb-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="ALL">All Status</option>
            <option value="AVAILABLE">Available</option>
            <option value="BOOKED">Booked</option>
            <option value="MAINTENANCE">Maintenance</option>
          </select>
        </div>
      </div>

      <div className="mb-table-container">
        <table className="mb-table">
          <thead className="mb-thead">
            <tr>
              <th className="mb-th">Bed Info</th>
              <th className="mb-th">Room</th>
              <th className="mb-th">Current Status</th>
              <th className="mb-th">Maintenance Mode</th>
              {!isWarden && (
                <th style={{ textAlign: "right" }} className="mb-th">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="mb-loading">
                  Loading...
                </td>
              </tr>
            ) : filteredBeds.length === 0 ? (
              <tr>
                <td colSpan="5" className="mb-loading">
                  No beds found matching filters.
                </td>
              </tr>
            ) : (
              currentBeds.map((bed) => {
                let statusClass = "badge-available";
                let statusText = "Available";
                let StatusIcon = CheckCircle2;

                if (bed.underMaintenance) {
                  statusClass = "badge-maintenance";
                  statusText = "Maintenance";
                  StatusIcon = Wrench;
                } else if (bed.isBooked) {
                  statusClass = "badge-booked";
                  statusText = "Booked";
                  StatusIcon = XCircle;
                }

                return (
                  <tr key={bed.id} className="mb-tr">
                    <td className="mb-td">
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <div
                          style={{
                            padding: "8px",
                            background: "#f1f5f9",
                            borderRadius: "8px",
                            color: "#475569",
                          }}
                        >
                          <BedDouble size={18} />
                        </div>
                        <span style={{ fontWeight: "700", color: "#1e293b" }}>
                          {bed.bedNumber}
                        </span>
                      </div>
                    </td>
                    <td className="mb-td">
                      <span style={{ fontWeight: "600", color: "#475569" }}>
                        {bed.roomNumber}
                      </span>
                    </td>
                    <td className="mb-td">
                      <span className={`mb-badge ${statusClass}`}>
                        <StatusIcon size={12} /> {statusText}
                      </span>
                    </td>
                    <td className="mb-td">
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <div
                          className={`mb-toggle-container ${bed.underMaintenance ? "mb-toggle-active" : "mb-toggle-inactive"} ${isWarden ? "mb-toggle-disabled" : ""}`}
                          onClick={() => toggleMaintenance(bed)}
                        >
                          <div
                            className={`mb-toggle-circle ${bed.underMaintenance ? "circle-active" : "circle-inactive"}`}
                          ></div>
                        </div>
                        <span
                          style={{
                            fontSize: "12px",
                            fontWeight: "600",
                            color: bed.underMaintenance ? "#d97706" : "#94a3b8",
                          }}
                        >
                          {bed.underMaintenance ? "Active" : "Off"}
                        </span>
                      </div>
                    </td>
                    {!isWarden && (
                      <td className="mb-td">
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "flex-end",
                          }}
                        >
                          <button
                            onClick={() => {
                              setBedToDelete(bed.id);
                              setIsDeleteModalOpen(true);
                            }}
                            className="mb-delete-btn"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {!loading && filteredBeds.length > 0 && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "15px 20px",
              borderTop: "1px solid #e2e8f0",
            }}
          >
            <div style={{ fontSize: "13px", color: "#64748b" }}>
              Showing {indexOfFirstItem + 1} to{" "}
              {Math.min(indexOfLastItem, filteredBeds.length)} of{" "}
              {filteredBeds.length} entries
            </div>
            <div style={{ display: "flex", gap: "5px" }}>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "6px",
                  borderRadius: "6px",
                  border: "1px solid #e2e8f0",
                  background: currentPage === 1 ? "#f1f5f9" : "white",
                  cursor: currentPage === 1 ? "not-allowed" : "pointer",
                  color: currentPage === 1 ? "#94a3b8" : "#475569",
                }}
              >
                <ChevronLeft size={16} />
              </button>

              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "0 10px",
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#475569",
                }}
              >
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "6px",
                  borderRadius: "6px",
                  border: "1px solid #e2e8f0",
                  background: currentPage === totalPages ? "#f1f5f9" : "white",
                  cursor:
                    currentPage === totalPages ? "not-allowed" : "pointer",
                  color: currentPage === totalPages ? "#94a3b8" : "#475569",
                }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* --- Add Bed Modal --- */}
      {isModalOpen && (
        <div
          className="mb-overlay"
          onClick={() => !isSubmitting && setIsModalOpen(false)}
        >
          <div className="mb-modal" onClick={(e) => e.stopPropagation()}>
            <h3
              style={{
                fontSize: "20px",
                fontWeight: "700",
                marginBottom: "5px",
                color: "#111827",
                marginTop: 0,
              }}
            >
              Add New Bed
            </h3>
            <p
              style={{
                fontSize: "13px",
                color: "#6b7280",
                marginBottom: "20px",
              }}
            >
              Manually add a bed to a room.
            </p>
            <form onSubmit={handleCreate}>
              <div className="mb-form-group">
                <label className="mb-label">Select Room</label>
                <select
                  className="mb-select"
                  style={{ width: "100%" }}
                  value={formData.roomId}
                  onChange={(e) =>
                    setFormData({ ...formData, roomId: e.target.value })
                  }
                  required
                  disabled={isSubmitting}
                >
                  <option value="">-- Select --</option>
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.roomNumber}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-form-group">
                <label className="mb-label">Bed Number</label>
                <input
                  className="mb-input"
                  placeholder="e.g. B-101-1"
                  value={formData.bedNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, bedNumber: e.target.value })
                  }
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="mb-modal-footer">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="mb-btn-cancel"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="mb-add-btn"
                  disabled={isSubmitting}
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  {isSubmitting && (
                    <Loader2 className="animate-spin" size={16} />
                  )}
                  {isSubmitting ? "Saving..." : "Save Bed"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- Delete Confirm Modal --- */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => !isSubmitting && setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Bed?"
        message="Are you sure you want to delete this bed? This action cannot be undone."
        confirmText={isSubmitting ? "Deleting..." : "Delete Bed"}
        isDanger={true}
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default ManageBeds;
