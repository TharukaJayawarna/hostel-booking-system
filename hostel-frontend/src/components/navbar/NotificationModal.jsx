import React from 'react';
import { X, Clock } from 'lucide-react';
import '../styles/Navbar.css';

const NotificationModal = ({ notification, onClose }) => {
  if (!notification) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={onClose}>
                <X size={18}/>
            </button>
            
            <h3 className="modal-title">{notification.title}</h3>
            <div className="modal-meta">
                <Clock size={14}/> {new Date(notification.createdAt).toLocaleString()}
            </div>

            <div 
                className="modal-body"
                dangerouslySetInnerHTML={{ __html: notification.message }}
            />
            
            <div className="modal-footer">
                <button className="btn-close-modal" onClick={onClose}>
                    Close Message
                </button>
            </div>
        </div>
    </div>
  );
};

export default NotificationModal;