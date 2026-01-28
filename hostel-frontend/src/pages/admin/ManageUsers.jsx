import React, { useEffect, useState, useMemo } from "react";
import { useNotification } from "../../context/NotificationContext";
import ConfirmModal from "../../components/ConfirmModal";
import UserFormModal from "./UserFormModal"; // IMPORTED

import {
  Users, Trash2, Plus, Shield, ShieldCheck, Search, Filter,
  UserCheck, Mail, Phone, ChevronLeft, ChevronRight
} from "lucide-react";
import "./styles/ManageUsers.css";

import userService from "../../services/user.service";

// Helper Component for Stats
const StatCard = ({ icon: Icon, colorClass, value, label }) => (
  <div className="mu-stat-card">
    <div className={`mu-stat-icon ${colorClass}`}><Icon size={24} /></div>
    <div>
      <div className="mu-stat-value">{value}</div>
      <div className="mu-stat-label">{label}</div>
    </div>
  </div>
);

const ManageUsers = () => {
  const notify = useNotification();
  
  // Data State
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false); // For delete actions

  // Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("STAFF");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  // Reset Pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterRole]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await userService.getAllUsers();
      if (res.data.status === "SUCCESS") setUsers(res.data.data);
    } catch (e) {
      console.error(e);
      notify.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (id) => {
    setUserToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    try {
      setIsSubmitting(true);
      await userService.deleteUser(userToDelete);
      notify.success("User Removed Successfully");
      
      // Optimistic Update
      setUsers(prev => prev.filter(u => u.id !== userToDelete));
      
    } catch (e) {
      notify.error("Delete Failed");
    } finally {
      setIsSubmitting(false);
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
    }
  };

  // --- Memoized Filtering ---
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch =
        (user.firstName && user.firstName.toLowerCase().includes(term)) ||
        (user.username && user.username.toLowerCase().includes(term));

      let matchesRole = false;
      if (filterRole === "ALL") {
        matchesRole = true;
      } else if (filterRole === "STAFF") {
        matchesRole = user.role === "ADMIN" || user.role === "WARDEN";
      } else {
        matchesRole = user.role === filterRole;
      }

      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, filterRole]);

  // --- Pagination Logic ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  // --- Memoized Stats ---
  const stats = useMemo(() => ({
    total: users.length,
    admins: users.filter((u) => u.role === "ADMIN").length,
    wardens: users.filter((u) => u.role === "WARDEN").length,
    students: users.filter((u) => u.role === "STUDENT").length,
  }), [users]);

  const getBadgeClass = (role) => {
    const styles = { ADMIN: "badge-admin", WARDEN: "badge-warden", STUDENT: "badge-student", DEFAULT: "badge-default" };
    return styles[role] || styles.DEFAULT;
  };

  const getBadgeIcon = (role) => {
    const icons = { ADMIN: Shield, WARDEN: ShieldCheck, STUDENT: UserCheck, DEFAULT: Users };
    const Icon = icons[role] || icons.DEFAULT;
    return <Icon size={12} />;
  };

  return (
    <div className="mu-container">
      {/* HEADER */}
      <div className="mu-header">
        <div className="mu-title-group">
          <div className="mu-title">
            <div className="mu-title-icon"><Users size={28} /></div>
            Manage Users
          </div>
          <p className="mu-subtitle">Control system access and manage staff accounts.</p>
        </div>
        <button className="mu-add-btn" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} /> Create New User
        </button>
      </div>

      {/* STATS */}
      <div className="mu-stats-grid">
        <StatCard icon={Users} colorClass="icon-blue" value={stats.total} label="Total Users" />
        <StatCard icon={Shield} colorClass="icon-red" value={stats.admins} label="Administrators" />
        <StatCard icon={ShieldCheck} colorClass="icon-green" value={stats.wardens} label="Wardens" />
        <StatCard icon={UserCheck} colorClass="icon-gray" value={stats.students} label="Students" />
      </div>

      {/* TOOLBAR */}
      <div className="mu-toolbar">
        <div className="mu-search-box">
          <Search size={18} color="#9ca3af" />
          <input
            className="mu-search-input"
            placeholder="Search by name or username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="mu-filter-group">
          <Filter size={18} color="#6b7280" />
          <select className="mu-filter-select" value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
            <option value="STAFF">Staff Only (Admins & Wardens)</option>
            <option value="STUDENT">Students Only</option>
            <option value="ALL">Show All Users</option>
            <option disabled>──────────</option>
            <option value="ADMIN">Admins Only</option>
            <option value="WARDEN">Wardens Only</option>
          </select>
        </div>
      </div>

      {/* TABLE */}
      <div className="mu-table-container">
        <table className="mu-table">
          <thead className="mu-thead">
            <tr>
              <th className="mu-th">User Profile</th>
              <th className="mu-th">Access Role</th>
              <th className="mu-th">Contact Info</th>
              <th className="mu-th" style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" className="mu-loading">Loading users...</td></tr>
            ) : filteredUsers.length === 0 ? (
              <tr><td colSpan="4" className="mu-loading">No users found matching this filter.</td></tr>
            ) : (
              currentUsers.map((u) => (
                <tr key={u.id} className="mu-tr">
                  <td className="mu-td">
                    <div className="mu-user-info">
                      <div className="mu-avatar">
                        {u.firstName ? u.firstName.charAt(0).toUpperCase() : "U"}
                      </div>
                      <div>
                        <div className="mu-user-name">{u.firstName} {u.lastName}</div>
                        <div className="mu-user-username">@{u.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="mu-td">
                    <span className={`mu-badge ${getBadgeClass(u.role)}`}>
                      {getBadgeIcon(u.role)} {u.role}
                    </span>
                  </td>
                  <td className="mu-td">
                    <div className="mu-contact-info">
                      <div className="mu-contact-item"><Mail size={12} color="#9ca3b8" /> {u.email}</div>
                      <div className="mu-contact-item"><Phone size={12} color="#9ca3b8" /> {u.contactNumber || "N/A"}</div>
                    </div>
                  </td>
                  <td className="mu-td">
                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                      {u.username !== "admin" && u.role !== "STUDENT" && (
                        <button
                          className="mu-action-btn"
                          onClick={() => openDeleteModal(u.id)}
                          title="Delete User"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination Controls */}
        {!loading && filteredUsers.length > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "15px 20px", borderTop: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: "13px", color: "#64748b" }}>
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredUsers.length)} of {filteredUsers.length} users
            </div>
            <div style={{ display: "flex", gap: "5px" }}>
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  padding: "6px", borderRadius: "6px", border: "1px solid #e2e8f0",
                  background: currentPage === 1 ? "#f1f5f9" : "white",
                  cursor: currentPage === 1 ? "not-allowed" : "pointer",
                  color: currentPage === 1 ? "#94a3b8" : "#475569"
                }}
              >
                <ChevronLeft size={16} />
              </button>
              
              <span style={{ display: "flex", alignItems: "center", padding: "0 10px", fontSize: "13px", fontWeight: "600", color: "#475569" }}>
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  padding: "6px", borderRadius: "6px", border: "1px solid #e2e8f0",
                  background: currentPage === totalPages ? "#f1f5f9" : "white",
                  cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                  color: currentPage === totalPages ? "#94a3b8" : "#475569"
                }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CREATE USER MODAL - Imported */}
      <UserFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchUsers}
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => !isSubmitting && setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Remove User?"
        message="Are you sure? They will lose access immediately."
        confirmText={isSubmitting ? "Removing..." : "Remove User"}
        isDanger={true}
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default ManageUsers;