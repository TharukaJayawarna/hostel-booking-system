import React, { useEffect, useState } from "react";
import { useNotification } from "../../context/NotificationContext";
import ConfirmModal from "../../components/ConfirmModal";
import {
  Settings,
  Save,
  Shield,
  CalendarOff,
  Plus,
  Trash2,
  Clock,
  Loader2,
  AlertCircle,
  Megaphone,
} from "lucide-react";
import "./styles/SystemSettings.css";

import settingsService from "../../services/settings.service";
import announcementService from "../../services/announcement.service";

const SystemSettings = () => {
  const notify = useNotification();

  const [loading, setLoading] = useState(true);
  const [isSavingDays, setIsSavingDays] = useState(false);
  const [isAddingBlock, setIsAddingBlock] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [maxDays, setMaxDays] = useState("90");
  const [blockedPeriods, setBlockedPeriods] = useState([]);

  const [dateForm, setDateForm] = useState({
    startDate: "",
    endDate: "",
    reason: "",
  });

  // --- Modal States ---
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteType, setDeleteType] = useState(null); // 'BLOCKED_DATE' or 'ANNOUNCEMENT'

  // Announcement States
  const [announcements, setAnnouncements] = useState([]);
  const [announcementForm, setAnnouncementForm] = useState({
    title: "",
    message: "",
    type: "INFO", // INFO, WARNING, CRITICAL
  });
  const [isPosting, setIsPosting] = useState(false);

  // 1. Define Fetch Functions
  const fetchAllSettings = async () => {
    try {
      const [maxDaysRes, blockedRes] = await Promise.all([
        settingsService.getMaxBookingDays(),
        settingsService.getBlockedDates(),
      ]);

      if (maxDaysRes.data.status === "SUCCESS")
        setMaxDays(maxDaysRes.data.data);
      if (blockedRes.data.status === "SUCCESS")
        setBlockedPeriods(blockedRes.data.data);
    } catch (e) {
      console.error("Error loading settings");
      notify.error("Failed to load settings.");
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const res = await announcementService.getAllAnnouncements();
      if (res.data.status === "SUCCESS") setAnnouncements(res.data.data);
    } catch (e) {
      console.error(e);
    }
  };

  // 2. Use Effect
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchAllSettings(), fetchAnnouncements()]);
      setLoading(false);
    };
    loadData();
  }, []);

  // --- Handlers ---

  const handleSaveMaxDays = async (e) => {
    e.preventDefault();
    const days = parseInt(maxDays);
    if (!maxDays || isNaN(days) || days < 1) {
      notify.warning("Please enter a valid number of days (Minimum 1).");
      return;
    }
    try {
      setIsSavingDays(true);
      await settingsService.updateMaxBookingDays(maxDays);
      notify.success("Booking duration updated successfully!");
    } catch (e) {
      notify.error("Failed to update settings");
    } finally {
      setIsSavingDays(false);
    }
  };

  const handleBlockDate = async (e) => {
    e.preventDefault();
    if (!dateForm.startDate || !dateForm.endDate) {
      return notify.warning("Please select both start and end dates.");
    }
    const start = new Date(dateForm.startDate);
    const end = new Date(dateForm.endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) return notify.warning("Start date cannot be in the past.");
    if (start > end) return notify.error("Start date cannot be after End date.");

    try {
      setIsAddingBlock(true);
      await settingsService.addBlockedDate(dateForm);
      notify.success("Period Blocked Successfully!");
      setDateForm({ startDate: "", endDate: "", reason: "" });
      
      const res = await settingsService.getBlockedDates();
      if (res.data.status === "SUCCESS") setBlockedPeriods(res.data.data);
    } catch (e) {
      notify.error(e.response?.data?.message || "Failed to block dates.");
    } finally {
      setIsAddingBlock(false);
    }
  };

  // --- UNIVERSAL DELETE HANDLER ---
  const confirmDelete = async () => {
    if (!deleteId || !deleteType) return;
    
    setIsDeleteModalOpen(false); // Close modal first
    setIsDeleting(true);

    try {
      if (deleteType === "BLOCKED_DATE") {
        // Handle Blocked Date Deletion
        const previousPeriods = [...blockedPeriods];
        setBlockedPeriods((prev) => prev.filter((p) => p.id !== deleteId)); // Optimistic update

        try {
          await settingsService.deleteBlockedDate(deleteId);
          notify.success("Restriction removed successfully");
        } catch (e) {
          setBlockedPeriods(previousPeriods); // Revert
          notify.error("Failed to remove restriction");
        }

      } else if (deleteType === "ANNOUNCEMENT") {
        // Handle Announcement Deletion
        const previousAnnouncements = [...announcements];
        setAnnouncements((prev) => prev.filter((a) => a.id !== deleteId)); // Optimistic update

        try {
          await announcementService.deleteAnnouncement(deleteId);
          notify.success("Announcement deleted successfully");
        } catch (e) {
          setAnnouncements(previousAnnouncements); // Revert
          notify.error("Failed to delete announcement");
        }
      }
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
      setDeleteType(null);
    }
  };

  // --- OPEN MODAL HANDLERS ---
  const openDeleteBlockedDateModal = (id) => {
    setDeleteId(id);
    setDeleteType("BLOCKED_DATE");
    setIsDeleteModalOpen(true);
  };

  const openDeleteAnnouncementModal = (id) => {
    setDeleteId(id);
    setDeleteType("ANNOUNCEMENT");
    setIsDeleteModalOpen(true);
  };


  const handlePostAnnouncement = async (e) => {
    e.preventDefault();
    if (!announcementForm.title || !announcementForm.message) return;

    try {
      setIsPosting(true);
      await announcementService.createAnnouncement(announcementForm);
      notify.success("Announcement Posted!");
      setAnnouncementForm({ title: "", message: "", type: "INFO" });
      fetchAnnouncements();
    } catch (e) {
      notify.error("Failed to post");
    } finally {
      setIsPosting(false);
    }
  };

  // Helper to get Modal Texts
  const getModalContent = () => {
    if (deleteType === "BLOCKED_DATE") {
      return {
        title: "Unblock Dates?",
        message: "Are you sure? Students will be able to book rooms during these dates again.",
        confirmText: "Unblock"
      };
    } else {
      return {
        title: "Delete Announcement?",
        message: "Are you sure you want to remove this announcement? This action cannot be undone.",
        confirmText: "Delete"
      };
    }
  };

  const modalContent = getModalContent();

  return (
    <div className="ss-container">
      {/* Header */}
      <div className="ss-header">
        <div className="ss-title">
          <div className="ss-title-icon">
            <Settings size={28} />
          </div>
          System Configurations
        </div>
      </div>

      <div className="ss-content-grid">
        {/* CARD 1: GENERAL RESTRICTIONS (MAX DAYS) */}
        <div className="ss-card">
          <div className="ss-section-title">
            <Clock size={20} color="#4f46e5" /> Booking Duration Policy
          </div>
          <form onSubmit={handleSaveMaxDays}>
            <div className="ss-input-group">
              <label className="ss-label">Max Booking Duration (Days)</label>
              <input
                type="number"
                value={maxDays}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "" || (!isNaN(val) && parseInt(val) >= 0)) {
                    setMaxDays(val);
                  }
                }}
                className="ss-input"
                min="1"
                placeholder="90"
                disabled={isSavingDays || loading}
              />
              <div className="ss-helper-text">
                <AlertCircle
                  size={12}
                  style={{ marginRight: "4px", display: "inline" }}
                />
                Students cannot book a room for more than this number of days
                consecutively.
              </div>
            </div>
            <button
              type="submit"
              className="ss-save-btn"
              disabled={isSavingDays || loading}
              style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "center", marginTop: "20px" }}
            >
              {isSavingDays ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              {isSavingDays ? "Updating..." : "Update Duration"}
            </button>
          </form>
        </div>

        {/* CARD 2: BLACKOUT DATES MANAGEMENT */}
        <div className="ss-card">
          <div className="ss-section-title">
            <CalendarOff size={20} color="#dc2626" /> Blackout Dates & Holidays
          </div>

          <form onSubmit={handleBlockDate} className="ss-date-row">
            <div className="ss-input-group" style={{ marginBottom: 0 }}>
              <label className="ss-label">From Date</label>
              <input
                type="date"
                className="ss-input"
                value={dateForm.startDate}
                onChange={(e) => setDateForm({ ...dateForm, startDate: e.target.value })}
                min={new Date().toISOString().split("T")[0]}
                required
                disabled={isAddingBlock}
              />
            </div>
            <div className="ss-input-group" style={{ marginBottom: 0 }}>
              <label className="ss-label">To Date</label>
              <input
                type="date"
                className="ss-input"
                value={dateForm.endDate}
                onChange={(e) => setDateForm({ ...dateForm, endDate: e.target.value })}
                min={dateForm.startDate || new Date().toISOString().split("T")[0]}
                required
                disabled={isAddingBlock}
              />
            </div>
            <div className="ss-input-group" style={{ marginBottom: 0 }}>
              <label className="ss-label">Reason (Optional)</label>
              <input
                type="text"
                className="ss-input"
                placeholder="e.g. Maintenance"
                value={dateForm.reason}
                onChange={(e) => setDateForm({ ...dateForm, reason: e.target.value })}
                disabled={isAddingBlock}
              />
            </div>
            <button
              type="submit"
              className="ss-add-btn"
              disabled={isAddingBlock}
              style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "center" }}
            >
              {isAddingBlock ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
              {isAddingBlock ? "Blocking..." : "Block"}
            </button>
          </form>

          {/* Blocked Dates List Table */}
          <div className="ss-table-container">
            <table className="ss-table">
              <thead className="ss-thead">
                <tr>
                  <th className="ss-th">Start Date</th>
                  <th className="ss-th">End Date</th>
                  <th className="ss-th">Reason</th>
                  <th className="ss-th" style={{ textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="4" className="ss-empty-state">
                      <Loader2 className="animate-spin" size={20} style={{ display: "inline", marginRight: "10px" }} /> Loading settings...
                    </td>
                  </tr>
                ) : blockedPeriods.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="ss-empty-state">
                      <Shield size={18} style={{ verticalAlign: "middle", marginRight: "5px" }} /> No active restrictions. Booking is open.
                    </td>
                  </tr>
                ) : (
                  blockedPeriods.map((period) => (
                    <tr key={period.id} className="ss-tr">
                      <td className="ss-td"><span className="ss-date-badge">{period.startDate}</span></td>
                      <td className="ss-td"><span className="ss-date-badge">{period.endDate}</span></td>
                      <td className="ss-td" style={{ color: "#64748b", fontStyle: "italic" }}>{period.reason || "N/A"}</td>
                      <td className="ss-td">
                        <div style={{ display: "flex", justifyContent: "flex-end" }}>
                          <button
                            className="ss-delete-btn"
                            onClick={() => openDeleteBlockedDateModal(period.id)}
                            title="Remove Restriction"
                            disabled={isDeleting && deleteId === period.id}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* CARD 3: ANNOUNCEMENTS */}
        <div className="ss-card" style={{ gridColumn: "1 / -1" }}>
          <div className="ss-section-title">
            <Megaphone size={20} color="#e11d48" /> Public Announcements
          </div>

          <form onSubmit={handlePostAnnouncement} className="ss-date-row">
            <div className="ss-input-group" style={{ flex: 1, marginBottom: 0 }}>
              <label className="ss-label">Title</label>
              <input 
                className="ss-input" 
                placeholder="e.g. System Maintenance"
                value={announcementForm.title}
                onChange={e => setAnnouncementForm({...announcementForm, title: e.target.value})}
                required 
              />
            </div>
            
            <div className="ss-input-group" style={{ width: "150px", marginBottom: 0 }}>
              <label className="ss-label">Type</label>
              <select 
                className="ss-input"
                value={announcementForm.type}
                onChange={e => setAnnouncementForm({...announcementForm, type: e.target.value})}
              >
                <option value="INFO">Information</option>
                <option value="WARNING">Warning</option>
                <option value="CRITICAL">Critical Alert</option>
              </select>
            </div>
            
            <div className="ss-input-group" style={{ flex: 2, marginBottom: 0 }}>
              <label className="ss-label">Message</label>
              <input 
                className="ss-input" 
                placeholder="Details..."
                value={announcementForm.message}
                onChange={e => setAnnouncementForm({...announcementForm, message: e.target.value})}
                required 
              />
            </div>
            
            <button type="submit" className="ss-add-btn" disabled={isPosting}>
              {isPosting ? <Loader2 className="animate-spin" size={18}/> : <Plus size={18}/>} Post
            </button>
          </form>

          {/* Announcement List */}
          <div className="ss-table-container">
            <table className="ss-table">
              <thead className="ss-thead">
                <tr>
                  <th className="ss-th">Title</th>
                  <th className="ss-th">Type</th>
                  <th className="ss-th">Message</th>
                  <th className="ss-th" style={{ textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {announcements.map(a => (
                   <tr key={a.id} className="ss-tr">
                     <td className="ss-td"><strong>{a.title}</strong></td>
                     <td className="ss-td">
                       <span className={`ss-type-badge ${a.type.toLowerCase()}`}>{a.type}</span>
                     </td>
                     <td className="ss-td">{a.message}</td>
                     <td className="ss-td" style={{ textAlign: "right" }}>
                       <div style={{ display: "flex", justifyContent: "flex-end" }}>
                          <button
                            className="ss-delete-btn"
                            onClick={() => openDeleteAnnouncementModal(a.id)}
                            title="Delete Announcement"
                            disabled={isDeleting && deleteId === a.id}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                     </td>
                   </tr>
                ))}
                {announcements.length === 0 && (
                  <tr><td colSpan="4" className="ss-empty-state">No active announcements.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => !isDeleting && setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title={modalContent.title}
        message={modalContent.message}
        confirmText={modalContent.confirmText}
        isDanger={true}
      />
    </div>
  );
};

export default SystemSettings;