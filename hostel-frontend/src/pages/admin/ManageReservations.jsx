import React, { useEffect, useState, useRef, useMemo } from "react";
import { useNotification } from "../../context/NotificationContext";
import ConfirmModal from "../../components/ConfirmModal";
import ManualReservationModal from "./ManualReservationModal"; // IMPORTED
import ViewReservationModal from "./ViewReservationModal"; // IMPORTED
import MoveBedModal from "./MoveBedModal"; // IMPORTED

import {
  CalendarDays,
  Search,
  Filter,
  MoreVertical,
  Eye,
  RefreshCcw,
  BedDouble,
  Ban,
  Trash2,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  CalendarCheck,
} from "lucide-react";
import "./styles/ManageReservations.css";

import reservationService from "../../services/reservation.service";
import authService from "../../services/auth.service";

// Stat Card Component
const StatCard = ({ icon: Icon, colorClass, value, label }) => (
  <div className="mr-stat-card">
    <div className={`mr-stat-icon-box ${colorClass}`}>
      <Icon size={24} />
    </div>
    <div>
      <div className="mr-stat-value">{value}</div>
      <div className="mr-stat-label">{label}</div>
    </div>
  </div>
);

const ManageReservations = () => {
  const notify = useNotification();

  // Data States
  const [reservations, setReservations] = useState([]);
  const [showTrash, setShowTrash] = useState(false);

  // Filter & Pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // UI States
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const dropdownRef = useRef(null);

  // Modal States
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isReactivateModalOpen, setIsReactivateModalOpen] = useState(false);

  // Selected Item States
  const [selectedResId, setSelectedResId] = useState(null);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [matchingBeds, setMatchingBeds] = useState([]);
  const [reservationToCancel, setReservationToCancel] = useState(null);
  const [reservationToReactivate, setReservationToReactivate] = useState(null);

  const user = authService.getCurrentUser();
  const isWarden = user?.role === "WARDEN";

  useEffect(() => {
    fetchReservations();
  }, [showTrash]);
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, showTrash]);

  // Click Outside Dropdown Logic
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdownId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeDropdownId]);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const res = showTrash
        ? await reservationService.getTrashReservations()
        : await reservationService.getAllReservations();
      if (res.data.status === "SUCCESS") setReservations(res.data.data);
    } catch (e) {
      notify.error("Failed to load reservations");
    } finally {
      setLoading(false);
    }
  };

  const toggleDropdown = (id, e) => {
    e.stopPropagation();
    setActiveDropdownId(activeDropdownId === id ? null : id);
  };

  // --- Filter & Pagination Logic ---
  const filteredReservations = useMemo(() => {
    return reservations.filter((res) => {
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch =
        (res.studentName && res.studentName.toLowerCase().includes(term)) ||
        (res.studentRegNo && res.studentRegNo.toLowerCase().includes(term)) ||
        (res.reservationNumber &&
          res.reservationNumber.toLowerCase().includes(term));
      const matchesStatus =
        filterStatus === "ALL" || res.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [reservations, searchTerm, filterStatus]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentReservations = filteredReservations.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  const totalPages = Math.ceil(filteredReservations.length / itemsPerPage);

  const stats = useMemo(
    () => ({
      total: reservations.length,
      approved: reservations.filter((r) => r.status === "APPROVED").length,
      pending: reservations.filter((r) => r.status === "PENDING").length,
      rejected: reservations.filter(
        (r) => r.status === "REJECTED" || r.status === "CANCELLED",
      ).length,
    }),
    [reservations],
  );

  // --- Handlers ---
  const handleMoveBedOpen = async (id) => {
    setSelectedResId(id);
    setActiveDropdownId(null);
    try {
      const res = await reservationService.getMatchingBeds(id);
      if (res.data.status === "SUCCESS") {
        setMatchingBeds(res.data.data);
        setIsMoveModalOpen(true);
      }
    } catch (e) {
      notify.error("No matching beds found");
    }
  };

  const handleMoveConfirm = async (newBedId) => {
    try {
      await reservationService.assignBed(selectedResId, newBedId);
      notify.success("Bed moved successfully!");
      setIsMoveModalOpen(false);
      fetchReservations();
    } catch (e) {
      notify.error("Failed to move bed");
    }
  };

  const handleViewOpen = async (id) => {
    setIsViewModalOpen(true);
    setIsLoadingDetails(true);
    setSelectedReservation(null);
    try {
      const response = await reservationService.getReservationById(id);
      if (response.data.status === "SUCCESS")
        setSelectedReservation(response.data.data);
    } catch (error) {
      notify.error("Failed to load details");
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleCancelConfirm = async () => {
    if (!reservationToCancel) return;
    try {
      setIsSubmitting(true);
      await reservationService.cancelReservation(reservationToCancel);
      notify.success("Cancelled Successfully");
      fetchReservations();
    } catch (e) {
      notify.error("Cancellation Failed");
    } finally {
      setIsSubmitting(false);
      setIsCancelModalOpen(false);
    }
  };

  const handleReactivateConfirm = async () => {
    if (!reservationToReactivate) return;
    try {
      setIsSubmitting(true);
      await reservationService.reactivateReservation(reservationToReactivate);
      notify.success("Reactivated Successfully!");
      fetchReservations();
    } catch (e) {
      notify.error("Failed to reactivate");
    } finally {
      setIsSubmitting(false);
      setIsReactivateModalOpen(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    const map = {
      COMPLETED: "badge-completed",
      APPROVED: "badge-approved",
      PENDING: "badge-pending",
      REJECTED: "badge-rejected",
      REFUNDED: "badge-refunded",
      CANCELLED: "badge-cancelled",
    };
    return map[status] || "badge-pending";
  };

  return (
    <div className="mr-container" onClick={() => setActiveDropdownId(null)}>
      {/* Header & Stats - Keep as is */}
      <div className="mr-header">
        <div className="mr-title-group">
          <div className="mr-title">
            <div className="mr-title-icon">
              <CalendarDays size={28} />
            </div>
            {showTrash ? "Trash / History" : "Reservations"}
          </div>
          <p className="mr-sub-title">
            Manage student bookings, payments, and cancellations.
          </p>
        </div>
        {!isWarden && (
          <button
            className="mr-create-btn"
            onClick={() => setIsManualModalOpen(true)}
          >
            <Plus size={18} /> New Reservation
          </button>
        )}
      </div>

      <div className="mr-stats-grid">
        <StatCard
          icon={CalendarDays}
          colorClass="icon-blue"
          value={stats.total}
          label="Total Reservations"
        />
        <StatCard
          icon={CheckCircle2}
          colorClass="icon-green"
          value={stats.approved}
          label="Approved"
        />
        <StatCard
          icon={Clock}
          colorClass="icon-amber"
          value={stats.pending}
          label="Pending"
        />
        <StatCard
          icon={XCircle}
          colorClass="icon-red"
          value={stats.rejected}
          label="Rejected / Cancelled"
        />
      </div>

      <div className="mr-toolbar">
        {/* Search and Filters same as before... */}
        <div className="mr-search-box">
          <Search size={18} color="#9ca3af" />
          <input
            className="mr-search-input"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div className="mr-filter-wrapper">
            <Filter size={18} color="#6b7280" />
            <select
              className="mr-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="COMPLETED">Completed</option>
              <option value="REJECTED">Rejected</option>
              <option value="CANCELLED">Cancelled</option>
              {showTrash && <option value="TRASH">Trash</option>}
            </select>
          </div>
          <button
            className={`mr-toggle-btn ${showTrash ? "mr-toggle-active" : "mr-toggle-inactive"}`}
            onClick={() => setShowTrash(!showTrash)}
          >
            {showTrash ? <Filter size={16} /> : <Trash2 size={16} />}
            {showTrash ? "View Active" : "View Trash"}
          </button>
        </div>
      </div>

      <div className="mr-table-container">
        <table className="mr-table">
          <thead className="mr-thead">
            <tr>
              <th className="mr-th">Reservation Info</th>
              <th className="mr-th">Student Details</th>
              <th className="mr-th">Payment</th>
              <th className="mr-th">Dates</th>
              <th className="mr-th">Status</th>
              <th
                style={{ width: "100px", textAlign: "right" }}
                className="mr-th"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="mr-loading">
                  Loading...
                </td>
              </tr>
            ) : filteredReservations.length === 0 ? (
              <tr>
                <td colSpan="6" className="mr-loading">
                  No reservations found.
                </td>
              </tr>
            ) : (
              currentReservations.map((res) => (
                <tr key={res.id} className="mr-tr">
                  <td className="mr-td">
                    <div className="mr-res-number">{res.reservationNumber}</div>
                    <div className="mr-bed-info">
                      <BedDouble size={12} /> Bed {res.bedNumber}
                    </div>
                  </td>
                  <td className="mr-td">
                    <div className="mr-student-name">{res.studentName}</div>
                    <div className="mr-student-reg">{res.studentRegNo}</div>
                  </td>
                  <td className="mr-td">
                    {res.paymentDate ? (
                      <div className="flex flex-col gap-[2px]">
                        <span className="mr-payment-date">
                          {res.paymentDate}
                        </span>
                        <span className="mr-payment-time">
                          <Clock size={10} /> {res.paymentTime}
                        </span>
                      </div>
                    ) : (
                      <span className="mr-payment-na">Not Paid</span>
                    )}
                  </td>
                  <td className="mr-td">
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px",
                      }}
                    >
                      <span className="mr-date-badge">
                        <CalendarCheck size={12} /> In: {res.checkIn}
                      </span>
                      <span className="mr-date-badge">
                        <CalendarCheck size={12} /> Out: {res.checkOut}
                      </span>
                    </div>
                  </td>
                  <td className="mr-td">
                    <span
                      className={`mr-badge ${getStatusBadgeClass(res.status)}`}
                    >
                      {res.status}
                    </span>
                  </td>
                  <td className="mr-td">
                    <div className="mr-action-container">
                      <button
                        className="mr-action-btn"
                        onClick={() => handleViewOpen(res.id)}
                      >
                        <Eye size={16} />
                      </button>
                      {!isWarden && (
                        <>
                          {res.status === "REJECTED" && (
                            <div
                              ref={
                                activeDropdownId === res.id ? dropdownRef : null
                              }
                            >
                              <button
                                className="mr-action-btn"
                                onClick={(e) => toggleDropdown(res.id, e)}
                              >
                                <MoreVertical size={16} />
                              </button>
                              {activeDropdownId === res.id && (
                                <div className="mr-dropdown-menu">
                                  <button
                                    className="mr-dropdown-item item-green"
                                    onClick={() => {
                                      setIsReactivateModalOpen(true);
                                      setReservationToReactivate(res.id);
                                      setActiveDropdownId(null);
                                    }}
                                  >
                                    <RefreshCcw size={14} /> Reactivate
                                  </button>
                                  <button
                                    className="mr-dropdown-item item-orange"
                                    onClick={() => handleMoveBedOpen(res.id)}
                                  >
                                    <BedDouble size={14} /> Move Bed
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                          {(res.status === "COMPLETED" ||
                            res.status === "APPROVED") && (
                            <button
                              className="mr-action-btn mr-cancel-btn"
                              onClick={() => {
                                setReservationToCancel(res.id);
                                setIsCancelModalOpen(true);
                              }}
                            >
                              <Ban size={16} />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {/* Pagination Controls ... (Same as before) */}
        {!loading && filteredReservations.length > 0 && (
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
              {Math.min(indexOfLastItem, filteredReservations.length)} of{" "}
              {filteredReservations.length} entries
            </div>
            <div style={{ display: "flex", gap: "5px" }}>
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="mr-page-btn"
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
                className="mr-page-btn"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* --- SEPARATED MODALS --- */}
      <ManualReservationModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        onSuccess={() => {
          fetchReservations();
          notify.success("Manual Reservation Created!");
        }}
      />

      <ViewReservationModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        reservation={selectedReservation}
        isLoading={isLoadingDetails}
      />

      <MoveBedModal
        isOpen={isMoveModalOpen}
        onClose={() => setIsMoveModalOpen(false)}
        matchingBeds={matchingBeds}
        onConfirm={handleMoveConfirm}
      />

      {/* Generic Confirmation Modals */}
      <ConfirmModal
        isOpen={isReactivateModalOpen}
        onClose={() => !isSubmitting && setIsReactivateModalOpen(false)}
        onConfirm={handleReactivateConfirm}
        title="Reactivate Reservation?"
        message="Are you sure? This will mark the bed as occupied again."
        confirmText={isSubmitting ? "Processing..." : "Yes, Reactivate"}
        isDanger={false}
        isLoading={isSubmitting}
      />

      <ConfirmModal
        isOpen={isCancelModalOpen}
        onClose={() => !isSubmitting && setIsCancelModalOpen(false)}
        onConfirm={handleCancelConfirm}
        title="Cancel Reservation?"
        message="Are you sure? This might affect room availability."
        confirmText={isSubmitting ? "Cancelling..." : "Yes, Cancel"}
        isDanger={true}
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default ManageReservations;
