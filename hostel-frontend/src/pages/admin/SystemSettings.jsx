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
  Loader2, // Loading Icon
  AlertCircle
} from "lucide-react";
import "./styles/SystemSettings.css";

// Service import
import settingsService from "../../services/settings.service";

const SystemSettings = () => {
  const notify = useNotification();
  
  // --- Loading States ---
  const [loading, setLoading] = useState(true); // Initial Load
  const [isSavingDays, setIsSavingDays] = useState(false); // Max Days Button
  const [isAddingBlock, setIsAddingBlock] = useState(false); // Block Date Button
  const [isDeleting, setIsDeleting] = useState(false); // Delete Action

  // --- Data States ---
  const [maxDays, setMaxDays] = useState("90");
  const [blockedPeriods, setBlockedPeriods] = useState([]);
  
  // --- Form States ---
  const [dateForm, setDateForm] = useState({
    startDate: "",
    endDate: "",
    reason: "",
  });

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // --- Initial Data Fetch ---
  useEffect(() => {
    fetchAllSettings();
  }, []);

  const fetchAllSettings = async () => {
    setLoading(true);
    try {
      const [maxDaysRes, blockedRes] = await Promise.all([
        settingsService.getMaxBookingDays(),
        settingsService.getBlockedDates(),
      ]);

      if (maxDaysRes.data.status === "SUCCESS") setMaxDays(maxDaysRes.data.data);
      if (blockedRes.data.status === "SUCCESS") setBlockedPeriods(blockedRes.data.data);
    } catch (e) {
      console.error("Error loading settings");
      notify.error("Failed to load settings. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  // --- Handler: Save Max Days ---
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

  // --- Handler: Block New Dates ---
  const handleBlockDate = async (e) => {
    e.preventDefault();
    if (!dateForm.startDate || !dateForm.endDate) {
      return notify.warning("Please select both start and end dates.");
    }
    
    // Date Validation
    const start = new Date(dateForm.startDate);
    const end = new Date(dateForm.endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
        return notify.warning("Start date cannot be in the past.");
    }
    if (start > end) {
      return notify.error("Start date cannot be after End date.");
    }

    try {
      setIsAddingBlock(true);
      await settingsService.addBlockedDate(dateForm);

      notify.success("Period Blocked Successfully!");
      setDateForm({ startDate: "", endDate: "", reason: "" }); // Reset Form

      // Refresh Blocked List
      const res = await settingsService.getBlockedDates();
      if (res.data.status === "SUCCESS") setBlockedPeriods(res.data.data);
    } catch (e) {
      notify.error(e.response?.data?.message || "Failed to block dates.");
    } finally {
      setIsAddingBlock(false);
    }
  };

  // --- Handler: Delete Blocked Date (Optimistic UI) ---
  const confirmDelete = async () => {
    if (!deleteId) return;
    
    // Store previous state for rollback
    const previousPeriods = [...blockedPeriods];
    
    // 1. Optimistic Update (Frontend එකෙන් ඉක්මනින් ඉවත් කිරීම)
    setBlockedPeriods(prev => prev.filter(p => p.id !== deleteId));
    setIsDeleteModalOpen(false); // Close modal immediately

    try {
      setIsDeleting(true);
      await settingsService.deleteBlockedDate(deleteId);
      notify.success("Restriction removed successfully");
    } catch (e) {
      // 2. Revert on Failure (Error එකක් ආවොත් පරණ තත්වයට පත් කිරීම)
      setBlockedPeriods(previousPeriods);
      notify.error("Failed to remove restriction");
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  return (
    <div className="ss-container">
      {/* Header */}
      <div className="ss-header">
        <div className="ss-title">
          <div className="ss-title-icon"><Settings size={28} /></div>
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
                  // Allow empty string or positive numbers only
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
                <AlertCircle size={12} style={{marginRight: '4px', display: 'inline'}} />
                Students cannot book a room for more than this number of days consecutively.
              </div>
            </div>
            <button 
                type="submit" 
                className="ss-save-btn" 
                disabled={isSavingDays || loading}
                style={{display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center'}}
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

          {/* Add New Block Form */}
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
                style={{display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center'}}
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
                  <tr><td colSpan="4" className="ss-empty-state"><Loader2 className="animate-spin" size={20} style={{display: 'inline', marginRight: '10px'}}/> Loading settings...</td></tr>
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
                            onClick={() => { setDeleteId(period.id); setIsDeleteModalOpen(true); }}
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
      </div>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => !isDeleting && setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Unblock Dates?"
        message="Are you sure? Students will be able to book rooms during these dates again."
        confirmText="Unblock"
        isDanger={true}
      />
    </div>
  );
};

export default SystemSettings;