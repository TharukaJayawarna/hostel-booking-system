import React, { useState } from "react";
import { X, Loader2 } from "lucide-react";
import userService from "../../services/user.service";
import { useNotification } from "../../context/NotificationContext";

const UserFormModal = ({ isOpen, onClose, onSuccess }) => {
  const notify = useNotification();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialForm = {
    firstName: "",
    lastName: "",
    username: "",
    password: "",
    email: "",
    contactNumber: "",
    role: "WARDEN",
  };

  const [formData, setFormData] = useState(initialForm);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.username.trim() || !formData.password.trim() || !formData.email.trim()) {
      return notify.warning("Please fill all required fields");
    }

    try {
      setIsSubmitting(true);
      await userService.createUser(formData);
      
      notify.success("User Created Successfully!");
      setFormData(initialForm); // Reset form
      onSuccess(); // Parent refresh
      onClose();
    } catch (e) {
      notify.error(e.response?.data?.message || "Creation Failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="mu-overlay" onClick={() => !isSubmitting && onClose()}>
      <div className="mu-modal" onClick={(e) => e.stopPropagation()}>
        <div className="mu-modal-header">
          <div>
            <h3 className="mu-modal-title">Create New User</h3>
            <p className="mu-modal-desc">Add a new administrator or warden to the system.</p>
          </div>
          <button onClick={onClose} className="mu-close-btn" disabled={isSubmitting}>
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mu-modal-body">
            <div className="mu-input-grid">
              <div>
                <label className="mu-label">First Name</label>
                <input
                  className="mu-input"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="mu-label">Last Name</label>
                <input
                  className="mu-input"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="mu-input-grid">
              <div>
                <label className="mu-label">Username</label>
                <input
                  className="mu-input"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="mu-label">Password</label>
                <input
                  type="password"
                  className="mu-input"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="mu-input-group">
              <label className="mu-label">Email Address</label>
              <input
                type="email"
                className="mu-input"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="mu-input-grid">
              <div>
                <label className="mu-label">Phone Number</label>
                <input
                  className="mu-input"
                  value={formData.contactNumber}
                  onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                  placeholder="Optional"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="mu-label">Assign Role</label>
                <select
                  className="mu-select"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  disabled={isSubmitting}
                >
                  <option value="WARDEN">Warden (View Only)</option>
                  <option value="ADMIN">Admin (Full Access)</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="mu-modal-footer">
            <button type="button" onClick={onClose} className="mu-cancel-btn" disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="mu-save-btn" disabled={isSubmitting} style={{ display: 'flex', gap: '8px' }}>
              {isSubmitting && <Loader2 className="animate-spin" size={16} />}
              {isSubmitting ? "Creating..." : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserFormModal;