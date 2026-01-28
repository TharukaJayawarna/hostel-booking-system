import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';
import './styles/ConfirmModal.css';

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Yes, Delete",
  cancelText = "Cancel",
  isDanger = true
}) => {
  if (!isOpen) return null;

  return (
    <div className="cm-overlay" onClick={onClose}>
      <div className="cm-modal" onClick={(e) => e.stopPropagation()}>

        {/* Icon */}
        <div className={`cm-icon ${isDanger ? 'danger' : 'info'}`}>
          {isDanger ? <AlertTriangle size={32} /> : <Info size={32} />}
        </div>

        {/* Content */}
        <div className="cm-content">
          <h3 className="cm-title">{title}</h3>
          <p className="cm-message">{message}</p>
        </div>

        {/* Actions */}
        <div className="cm-actions">
          <button className="cm-cancel" onClick={onClose}>
            {cancelText}
          </button>
          <button
            className={`cm-confirm ${isDanger ? 'danger' : 'info'}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>

      </div>
    </div>
  );
};

export default ConfirmModal;
