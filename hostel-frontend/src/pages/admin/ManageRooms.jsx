import React, { useEffect, useState, useMemo } from "react";
import { useNotification } from "../../context/NotificationContext";
import ConfirmModal from "../../components/ConfirmModal";
import RoomFormModal from "./RoomFormModal";

import {
  DoorOpen,
  Trash2,
  Plus,
  Search,
  Users,
  Lock,
  Unlock,
  CalendarClock,
  Building,
  Pencil,
  MessageSquare,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import "./styles/ManageRooms.css";

import roomService from "../../services/room.service";
import floorService from "../../services/floor.service";
import hubService from "../../services/hub.service";
import authService from "../../services/auth.service";

const StatCard = ({ icon: Icon, colorClass, value, label }) => (
  <div className="mr-stat-card">
    <div className={`mr-stat-icon ${colorClass}`}>
      <Icon size={24} />
    </div>
    <div>
      <div className="mr-stat-value">{value}</div>
      <div className="mr-stat-label">{label}</div>
    </div>
  </div>
);

const ManageRooms = () => {
  const notify = useNotification();

  const [rooms, setRooms] = useState([]);
  const [floors, setFloors] = useState([]);
  const [hubs, setHubs] = useState([]);

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoveredComment, setHoveredComment] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterFloor, setFilterFloor] = useState("ALL");
  const [filterHub, setFilterHub] = useState("ALL");
  const [filterGender, setFilterGender] = useState("ALL");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [roomToEdit, setRoomToEdit] = useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState(null);

  const user = authService.getCurrentUser();
  const isWarden = user?.role === "WARDEN";

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterFloor, filterHub, filterGender]);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [r, f, h] = await Promise.all([
        roomService.getAllRooms(),
        floorService.getAllFloors(),
        hubService.getAllHubs(),
      ]);
      if (r.data.status === "SUCCESS") setRooms(r.data.data);
      if (f.data.status === "SUCCESS") setFloors(f.data.data);
      if (h.data.status === "SUCCESS") setHubs(h.data.data);
    } catch (e) {
      notify.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async (formData) => {
    try {
      if (isEditMode && roomToEdit) {
        await roomService.updateRoom(roomToEdit.id, formData);
        notify.success("Room Updated Successfully!");
      } else {
        await roomService.createRoom(formData.floorId, formData);
        notify.success("Room Added Successfully!");
      }
      fetchAll();
    } catch (e) {
      notify.error(isEditMode ? "Failed to update room" : "Failed to add room");
      throw e;
    }
  };

  const openEditModal = (room) => {
    setRoomToEdit(room);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setRoomToEdit(null);
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!roomToDelete) return;
    try {
      setIsSubmitting(true);
      await roomService.deleteRoom(roomToDelete);
      notify.success("Room Deleted Successfully");

      setRooms((prev) => prev.filter((r) => r.id !== roomToDelete));
    } catch (e) {
      notify.error("Failed to delete room");
    } finally {
      setIsSubmitting(false);
      setIsDeleteModalOpen(false);
      setRoomToDelete(null);
    }
  };

  const handleMouseEnter = (e, text) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setHoveredComment({ text: text, x: rect.left, y: rect.bottom + 5 });
  };

  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      const rNum = room.roomNumber ? room.roomNumber.toString() : "";
      const matchesSearch = rNum
        .toLowerCase()
        .includes(searchTerm.toLowerCase().trim());
      const matchesFloor =
        filterFloor === "ALL" || room.floorNumber === filterFloor;
      const matchesGender =
        filterGender === "ALL" || room.reservedFor === filterGender;
      const matchesHub = filterHub === "ALL" || room.hubNumber === filterHub;
      return matchesSearch && matchesFloor && matchesGender && matchesHub;
    });
  }, [rooms, searchTerm, filterFloor, filterGender, filterHub]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRooms = filteredRooms.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRooms.length / itemsPerPage);

  const stats = useMemo(
    () => ({
      total: rooms.length,
      private: rooms.filter((r) => r.isPrivate).length,
      shared: rooms.filter((r) => !r.isPrivate).length,
      defaultType: rooms.filter((r) => r.reservationPeriod === "DEFAULT")
        .length,
      monthlyType: rooms.filter((r) => r.reservationPeriod === "MONTHLY")
        .length,
    }),
    [rooms],
  );

  const getAccessBadgeClass = (gender, isPrivate) => {
    if (gender === "BOYS")
      return isPrivate ? "badge-boy-private" : "badge-boy-shared";
    return isPrivate ? "badge-girl-private" : "badge-girl-shared";
  };

  return (
    <div className="mr-container">
      {/* Tooltip */}
      {hoveredComment && (
        <div
          className="mr-tooltip"
          style={{ top: hoveredComment.y, left: hoveredComment.x }}
        >
          {hoveredComment.text}
        </div>
      )}

      {/* Header */}
      <div className="mr-header">
        <div className="mr-title">
          <div className="mr-title-icon">
            <DoorOpen size={28} />
          </div>
          <div>
            Manage Rooms <div className="mr-subtitle">Space & Pricing</div>
          </div>
        </div>
        {!isWarden && (
          <button className="mr-add-btn" onClick={openCreateModal}>
            <Plus size={18} /> Add Room
          </button>
        )}
      </div>

      {/* Stats Grid */}
      <div className="mr-stats-grid">
        <StatCard
          icon={Building}
          colorClass="icon-blue"
          value={stats.total}
          label="Total Rooms"
        />
        <StatCard
          icon={CalendarClock}
          colorClass="icon-cyan"
          value={stats.defaultType}
          label="Default Rooms"
        />
        <StatCard
          icon={CalendarClock}
          colorClass="icon-purple"
          value={stats.monthlyType}
          label="Monthly Rooms"
        />
        <StatCard
          icon={Unlock}
          colorClass="icon-green"
          value={stats.shared}
          label="Shared Rooms"
        />
        <StatCard
          icon={Lock}
          colorClass="icon-red"
          value={stats.private}
          label="Private Rooms"
        />
      </div>

      {/* Toolbar */}
      <div className="mr-toolbar">
        <div className="mr-search-box">
          <Search size={18} color="#9ca3af" />
          <input
            className="mr-search-input"
            placeholder="Search by Room Number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Filter size={18} color="#6b7280" />
        <div style={{ display: "flex", gap: "10px" }}>
          <select
            className="mr-filter-select"
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
          <select
            className="mr-filter-select"
            value={filterFloor}
            onChange={(e) => setFilterFloor(e.target.value)}
          >
            <option value="ALL">All Floors</option>
            {floors
              .filter((f) => filterHub === "ALL" || f.hubNumber === filterHub)
              .map((f) => (
                <option key={f.id} value={f.floorNumber}>
                  {f.floorNumber}
                </option>
              ))}
          </select>
          <select
            className="mr-filter-select"
            value={filterGender}
            onChange={(e) => setFilterGender(e.target.value)}
          >
            <option value="ALL">All Genders</option>
            <option value="BOYS">Boys</option>
            <option value="GIRLS">Girls</option>
          </select>
        </div>
      </div>

      {/* Table Section */}
      <div className="mr-table-container">
        <table className="mr-table">
          <thead className="mr-thead">
            <tr>
              <th className="mr-th">Room</th>
              <th className="mr-th">Location</th>
              <th className="mr-th">Type</th>
              <th className="mr-th">Access</th>
              <th className="mr-th">Pricing Structure (LKR)</th>
              {!isWarden && (
                <th className="mr-th" style={{ textAlign: "right" }}>
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan="6"
                  style={{
                    padding: "40px",
                    textAlign: "center",
                    color: "#94a3b8",
                  }}
                >
                  Loading...
                </td>
              </tr>
            ) : filteredRooms.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  style={{
                    padding: "40px",
                    textAlign: "center",
                    color: "#94a3b8",
                  }}
                >
                  No rooms found.
                </td>
              </tr>
            ) : (
              currentRooms.map((r) => (
                <tr key={r.id} className="mr-tr">
                  <td className="mr-td">
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      <div
                        style={{
                          padding: "8px",
                          background: "#fff7ed",
                          borderRadius: "10px",
                          color: "#ea580c",
                        }}
                      >
                        <DoorOpen size={20} />
                      </div>
                      <div>
                        <span
                          style={{
                            fontWeight: "700",
                            color: "#1e293b",
                            fontSize: "15px",
                          }}
                        >
                          {r.roomNumber}
                        </span>
                        {r.comment && (
                          <div
                            onMouseEnter={(e) => handleMouseEnter(e, r.comment)}
                            onMouseLeave={() => setHoveredComment(null)}
                            className="mr-comment-box"
                          >
                            <MessageSquare
                              size={12}
                              style={{ flexShrink: 0 }}
                            />
                            <span
                              style={{
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                display: "block",
                              }}
                            >
                              {r.comment}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="mr-td">
                    <div style={{ fontSize: "13px", fontWeight: "600" }}>
                      {r.floorNumber}
                    </div>
                    <div style={{ fontSize: "11px", color: "#64748b" }}>
                      {r.hubNumber || "Hub Info"}
                    </div>
                  </td>
                  <td className="mr-td">
                    <span className="mr-type-badge">
                      <Users size={14} />
                      {r.roomType
                        ? r.roomType.replace("SHARING_", "")
                        : "2"}{" "}
                      Person
                    </span>
                  </td>
                  <td className="mr-td">
                    <span
                      className={`mr-access-badge ${getAccessBadgeClass(r.reservedFor, r.isPrivate)}`}
                    >
                      {r.isPrivate ? <Lock size={12} /> : <Unlock size={12} />}
                      {r.reservedFor === "BOYS" ? "Male" : "Female"}
                      <span style={{ opacity: 0.6, margin: "0 4px" }}>|</span>
                      {r.isPrivate ? "Private" : "Shared"}
                    </span>
                  </td>
                  <td className="mr-td">
                    <div className="mr-price-stack">
                      <div
                        className={`mr-price-tag ${r.isPrivate ? "tag-private" : "tag-shared"}`}
                      >
                        {r.isPrivate ? "Full Room Price" : "Per Person Price"}
                      </div>
                      <div className="mr-price-val">
                        Mo:{" "}
                        {parseFloat(r.monthlyPrice).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })}
                      </div>
                      {r.reservationPeriod === "DEFAULT" ? (
                        <>
                          <div className="mr-price-val">
                            We:{" "}
                            {r.weeklyPrice
                              ? parseFloat(r.weeklyPrice).toLocaleString(
                                  "en-US",
                                  { minimumFractionDigits: 2 },
                                )
                              : "-"}
                          </div>
                          <div className="mr-price-val">
                            Da:{" "}
                            {r.dailyPrice
                              ? parseFloat(r.dailyPrice).toLocaleString(
                                  "en-US",
                                  { minimumFractionDigits: 2 },
                                )
                              : "-"}
                          </div>
                        </>
                      ) : (
                        <span
                          style={{
                            fontSize: "11px",
                            color: "#9ca3af",
                            fontStyle: "italic",
                          }}
                        >
                          * Monthly Only
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="mr-td">
                    {!isWarden && (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "flex-end",
                          gap: "8px",
                        }}
                      >
                        <button
                          onClick={() => openEditModal(r)}
                          className="mr-action-btn btn-edit"
                          title="Edit Room"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setRoomToDelete(r.id);
                            setIsDeleteModalOpen(true);
                          }}
                          className="mr-action-btn btn-delete"
                          title="Delete Room"
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

        {!loading && filteredRooms.length > 0 && (
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
              {Math.min(indexOfLastItem, filteredRooms.length)} of{" "}
              {filteredRooms.length} entries
            </div>
            <div style={{ display: "flex", gap: "5px" }}>
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="mr-page-btn"
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
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
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

      <RoomFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isEditMode={isEditMode}
        roomToEdit={roomToEdit}
        floors={floors}
        onSubmit={handleCreateOrUpdate}
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => !isSubmitting && setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Room?"
        message="Are you sure? This action cannot be undone."
        confirmText={isSubmitting ? "Deleting..." : "Delete Room"}
        isDanger={true}
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default ManageRooms;
