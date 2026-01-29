import React, { useEffect, useState, useMemo } from "react";
import { useNotification } from "../../context/NotificationContext";
import ConfirmModal from "../../components/ConfirmModal";
import {
  Layers,
  Building2,
  DoorOpen,
  Plus,
  Trash2,
  X,
  Search,
  LayoutGrid,
  Filter,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import "./styles/ManageFloors.css";
import floorService from "../../services/floor.service";
import hubService from "../../services/hub.service";
import authService from "../../services/auth.service";

const StatCard = ({ icon: Icon, colorClass, value, label }) => (
  <div className="mf-stat-card">
    <div className={`mf-stat-icon-box ${colorClass}`}>
      <Icon size={24} />
    </div>
    <div>
      <div className="mf-stat-value">{value}</div>
      <div className="mf-stat-label">{label}</div>
    </div>
  </div>
);

const ManageFloors = () => {
  const notify = useNotification();

  const [floors, setFloors] = useState([]);
  const [hubs, setHubs] = useState([]);

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterHub, setFilterHub] = useState("ALL");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ hubId: "", floorNumber: "" });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [floorToDelete, setFloorToDelete] = useState(null);

  const user = authService.getCurrentUser();
  const isWarden = user?.role === "WARDEN";

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterHub]);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [f, h] = await Promise.all([
        floorService.getAllFloors(),
        hubService.getAllHubs(),
      ]);

      if (f.data.status === "SUCCESS") setFloors(f.data.data);
      if (h.data.status === "SUCCESS") setHubs(h.data.data);
    } catch (error) {
      notify.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const filteredFloors = useMemo(() => {
    return floors.filter((floor) => {
      const matchesSearch =
        floor.floorNumber
          .toLowerCase()
          .includes(searchTerm.toLowerCase().trim()) ||
        (floor.hubNumber &&
          floor.hubNumber
            .toLowerCase()
            .includes(searchTerm.toLowerCase().trim()));
      const matchesHub = filterHub === "ALL" || floor.hubNumber === filterHub;
      return matchesSearch && matchesHub;
    });
  }, [floors, searchTerm, filterHub]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentFloors = filteredFloors.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredFloors.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleCreate = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.hubId || !formData.floorNumber.trim())
      return notify.warning("Please fill all fields");

    try {
      setIsSubmitting(true);
      await floorService.createFloor(formData.hubId, {
        floorNumber: formData.floorNumber.trim(),
      });

      notify.success("Floor Created Successfully!");
      setIsModalOpen(false);
      setFormData({ hubId: "", floorNumber: "" });
      fetchAll();
    } catch (e) {
      notify.error(e.response?.data?.message || "Failed to create floor");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDeleteModal = (id) => {
    setFloorToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!floorToDelete) return;
    try {
      setIsSubmitting(true);
      await floorService.deleteFloor(floorToDelete);

      notify.success("Floor Deleted Successfully");

      setFloors((prev) => prev.filter((f) => f.id !== floorToDelete));
    } catch (e) {
      notify.error("Failed to delete floor");
    } finally {
      setIsSubmitting(false);
      setIsDeleteModalOpen(false);
      setFloorToDelete(null);
    }
  };

  return (
    <div className="mf-container">
      <div className="mf-header">
        <div className="mf-title-group">
          <div className="mf-title">
            <div className="mf-title-icon">
              <Layers size={28} />
            </div>
            Manage Floors
          </div>
          <p className="mf-sub-title">Organize and manage floors.</p>
        </div>
        {!isWarden && (
          <button className="mf-add-btn" onClick={() => setIsModalOpen(true)}>
            <Plus size={18} /> Add New Floor
          </button>
        )}
      </div>

      <div className="mf-stats-grid">
        <StatCard
          icon={Layers}
          colorClass="icon-blue"
          value={floors.length}
          label="Total Floors"
        />
        <StatCard
          icon={LayoutGrid}
          colorClass="icon-red"
          value={floors.reduce((sum, f) => sum + (f.noOfRooms || 0), 0)}
          label="Total Rooms"
        />
      </div>

      <div className="mf-toolbar">
        <div className="mf-search-box">
          <Search size={18} color="#9ca3af" />
          <input
            className="mf-search-input"
            placeholder="Search floors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="mf-filter-group">
          <Filter size={18} color="#6b7280" />
          <select
            className="mf-filter-select"
            value={filterHub}
            onChange={(e) => setFilterHub(e.target.value)}
          >
            <option value="ALL">All Hubs</option>
            {hubs.map((h) => (
              <option key={h.id} value={h.hubNumber}>
                {h.hubNumber}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mf-table-container">
        <table className="mf-table">
          <thead className="mf-thead">
            <tr>
              <th className="mf-th">Floor Details</th>
              <th className="mf-th">Parent Hub</th>
              <th className="mf-th">Capacity</th>
              {!isWarden && (
                <th style={{ textAlign: "right" }} className="mf-th">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="mf-loading">
                  Loading data...
                </td>
              </tr>
            ) : filteredFloors.length === 0 ? (
              <tr>
                <td colSpan="4" className="mf-loading">
                  No floors found.
                </td>
              </tr>
            ) : (
              currentFloors.map((f) => (
                <tr key={f.id} className="mf-tr">
                  <td className="mf-td">
                    <div className="mf-floor-info">
                      <div className="mf-floor-icon">
                        <Layers size={20} />
                      </div>
                      <div>
                        <div className="mf-floor-name">{f.floorNumber}</div>
                        <div className="mf-floor-id">ID: #{f.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="mf-td">
                    <span className="mf-badge badge-hub">
                      <Building2 size={12} /> {f.hubNumber || "Unassigned"}
                    </span>
                  </td>
                  <td className="mf-td">
                    <span className="mf-badge badge-room">
                      <DoorOpen size={12} /> {f.noOfRooms} Rooms
                    </span>
                  </td>
                  {!isWarden && (
                    <td className="mf-td">
                      <div
                        style={{ display: "flex", justifyContent: "flex-end" }}
                      >
                        <button
                          className="mf-action-btn"
                          onClick={() => openDeleteModal(f.id)}
                          disabled={isSubmitting}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>

        {!loading && filteredFloors.length > 0 && (
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
              {Math.min(indexOfLastItem, filteredFloors.length)} of{" "}
              {filteredFloors.length} entries
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

      {isModalOpen && (
        <div
          className="mf-overlay"
          onClick={() => !isSubmitting && setIsModalOpen(false)}
        >
          <div className="mf-modal" onClick={(e) => e.stopPropagation()}>
            <div className="mf-modal-header">
              <div>
                <h3 className="mf-modal-title">Add New Floor</h3>
                <p className="mf-modal-desc">
                  Select a hub and assign a floor number.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="mf-close-btn"
                disabled={isSubmitting}
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="mf-modal-body">
                <div className="mf-input-group">
                  <label className="mf-input-label">Select Hub</label>
                  <select
                    className="mf-select"
                    value={formData.hubId}
                    onChange={(e) =>
                      setFormData({ ...formData, hubId: e.target.value })
                    }
                    required
                    disabled={isSubmitting}
                  >
                    <option value="">-- Choose a Hub --</option>
                    {hubs.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.hubNumber}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mf-input-group">
                  <label className="mf-input-label">Floor Name / Number</label>
                  <input
                    className="mf-input"
                    value={formData.floorNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, floorNumber: e.target.value })
                    }
                    placeholder="e.g. 1st Floor"
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              <div className="mf-modal-footer">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="mf-cancel-btn"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="mf-save-btn"
                  disabled={isSubmitting}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    justifyContent: "center",
                  }}
                >
                  {isSubmitting && (
                    <Loader2 className="animate-spin" size={16} />
                  )}
                  {isSubmitting ? "Creating..." : "Create Floor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => !isSubmitting && setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Floor?"
        message="Are you sure you want to delete this floor? All rooms inside will be removed."
        confirmText={isSubmitting ? "Deleting..." : "Delete Floor"}
        isDanger={true}
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default ManageFloors;
