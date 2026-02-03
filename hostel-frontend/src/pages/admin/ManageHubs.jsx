import React, { useEffect, useState, useMemo } from "react";
import { useNotification } from "../../context/NotificationContext";
import ConfirmModal from "../../components/ConfirmModal";
import {
  Building2,
  Layers,
  DoorOpen,
  Plus,
  Trash2,
  X,
  Search,
  LayoutGrid,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import "./styles/ManageHubs.css";
import hubService from "../../services/hub.service";
import authService from "../../services/auth.service";

const StatCard = ({ icon: Icon, colorClass, value, label }) => (
  <div className="mh-stat-card">
    <div className={`mh-stat-icon-box ${colorClass}`}>
      <Icon size={24} />
    </div>
    <div>
      <div className="mh-stat-value">{value}</div>
      <div className="mh-stat-label">{label}</div>
    </div>
  </div>
);

const ManageHubs = () => {
  const notify = useNotification();

  const [hubs, setHubs] = useState([]);

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hubName, setHubName] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [hubToDelete, setHubToDelete] = useState(null);

  const user = authService.getCurrentUser();
  const isWarden = user?.role === "WARDEN";

  useEffect(() => {
    fetchHubs();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const fetchHubs = async () => {
    try {
      setLoading(true);
      const res = await hubService.getAllHubs();
      if (res.data.status === "SUCCESS") setHubs(res.data.data);
    } catch (e) {
      notify.error("Error loading hubs");
    } finally {
      setLoading(false);
    }
  };

  const filteredHubs = useMemo(() => {
    return hubs.filter((hub) =>
      hub.hubNumber.toLowerCase().includes(searchTerm.toLowerCase().trim()),
    );
  }, [hubs, searchTerm]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentHubs = filteredHubs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredHubs.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!hubName.trim()) return notify.warning("Hub name is required");

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append("hubNumber", hubName.trim());
      formData.append("description", description);
      if (imageFile) {
        formData.append("image", imageFile);
      }

      await hubService.createHub(formData);

      notify.success("Hub Created Successfully!");

      setHubName("");
      setDescription("");
      setImageFile(null);
      setIsModalOpen(false);

      fetchHubs();
    } catch (e) {
      console.error(e);
      notify.error("Failed to create hub");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDeleteModal = (id) => {
    setHubToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!hubToDelete) return;

    try {
      setIsSubmitting(true);
      await hubService.deleteHub(hubToDelete);

      notify.success("Hub Deleted Successfully");

      setHubs((prev) => prev.filter((h) => h.id !== hubToDelete));
    } catch (e) {
      notify.error("Failed to delete hub");
    } finally {
      setIsSubmitting(false);
      setIsDeleteModalOpen(false);
      setHubToDelete(null);
    }
  };

  const stats = useMemo(
    () => ({
      totalHubs: hubs.length,
      totalFloors: hubs.reduce((acc, hub) => acc + (hub.noOfFloors || 0), 0),
      totalRooms: hubs.reduce((acc, hub) => acc + (hub.noOfRooms || 0), 0),
    }),
    [hubs],
  );

  return (
    <div className="mh-container">
      <div className="mh-header">
        <div className="mh-title-group">
          <div className="mh-title">
            <div className="mh-title-icon">
              <Building2 size={28} />
            </div>
            Manage Hubs
          </div>
          <p className="mh-sub-title">
            Create and manage student accommodation hubs.
          </p>
        </div>

        {!isWarden && (
          <button className="mh-add-btn" onClick={() => setIsModalOpen(true)}>
            <Plus size={18} /> Add New Hub
          </button>
        )}
      </div>

      <div className="mh-stats-grid">
        <StatCard
          icon={Building2}
          colorClass="icon-blue"
          value={stats.totalHubs}
          label="Total Hubs"
        />
        <StatCard
          icon={Layers}
          colorClass="icon-green"
          value={stats.totalFloors}
          label="Total Floors"
        />
        <StatCard
          icon={LayoutGrid}
          colorClass="icon-red"
          value={stats.totalRooms}
          label="Total Rooms"
        />
      </div>

      <div className="mh-toolbar">
        <div className="mh-search-box">
          <Search size={18} color="#9ca3af" />
          <input
            className="mh-search-input"
            placeholder="Search hubs by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="mh-table-container">
        <table className="mh-table">
          <thead className="mh-thead">
            <tr>
              <th className="mh-th">Hub Name</th>
              <th className="mh-th">Floor Capacity</th>
              <th className="mh-th">Room Capacity</th>
              {!isWarden && (
                <th className="mh-th" style={{ textAlign: "right" }}>
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="mh-loading">
                  Loading data...
                </td>
              </tr>
            ) : filteredHubs.length === 0 ? (
              <tr>
                <td colSpan="4" className="mh-loading">
                  No hubs found.
                </td>
              </tr>
            ) : (
              currentHubs.map((hub) => (
                <tr key={hub.id} className="mh-tr">
                  <td className="mh-td">
                    <div className="mh-hub-info">
                      <div className="mh-hub-icon">
                        <Building2 size={20} />
                      </div>
                      <div>
                        <div className="mh-hub-name">{hub.hubNumber}</div>
                        <div className="mh-hub-id">ID: #{hub.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="mh-td">
                    <span className="mh-badge badge-floors">
                      <Layers size={14} /> {hub.noOfFloors} Floors
                    </span>
                  </td>
                  <td className="mh-td">
                    <span className="mh-badge badge-rooms">
                      <DoorOpen size={14} /> {hub.noOfRooms} Rooms
                    </span>
                  </td>

                  <td className="mh-td">
                    {!isWarden && (
                      <div
                        style={{ display: "flex", justifyContent: "flex-end" }}
                      >
                        <button
                          className="mh-action-btn"
                          onClick={() => openDeleteModal(hub.id)}
                          title="Delete Hub"
                          disabled={isSubmitting}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {!loading && filteredHubs.length > 0 && (
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
              {Math.min(indexOfLastItem, filteredHubs.length)} of{" "}
              {filteredHubs.length} entries
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
          className="mh-overlay"
          onClick={() => !isSubmitting && setIsModalOpen(false)}
        >
          <div className="mh-modal" onClick={(e) => e.stopPropagation()}>
            <div className="mh-modal-header">
              <div>
                <h3 className="mh-modal-title">Add New Hub</h3>
                <p className="mh-modal-desc">Create a new building.</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="mh-close-btn"
                disabled={isSubmitting}
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="mh-modal-body">
                <label className="mh-input-label">Hub Name / Number</label>
                <input
                  className="mh-input"
                  value={hubName}
                  onChange={(e) => setHubName(e.target.value)}
                  placeholder="e.g. HUB-A01"
                  autoFocus
                  required
                  disabled={isSubmitting}
                />
                <div style={{ marginBottom: "15px", marginTop: "15px" }}>
                  <label className="mh-input-label">Description</label>
                  <textarea
                    className="mh-textarea"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description..."
                    disabled={isSubmitting}
                  />
                </div>
                <div style={{ marginTop: "15px" }}>
                  <label className="mh-input-label">Hub Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    className="mh-file-input"
                    onChange={(e) => setImageFile(e.target.files[0])}
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              <div className="mh-modal-footer">
                {/* <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="mh-cancel-btn"
                  disabled={isSubmitting}
                >
                  Cancel
                </button> */}
                <button
                  type="submit"
                  className="mh-save-btn"
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
                  {isSubmitting ? "Creating..." : "Create Hub"}
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
        title="Delete Hub?"
        message="Are you sure you want to delete this hub? This action cannot be undone and will remove all related floors and rooms."
        confirmText={isSubmitting ? "Deleting..." : "Delete Hub"}
        isDanger={true}
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default ManageHubs;
