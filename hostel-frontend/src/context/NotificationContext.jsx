import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  // Notification එකක් add කරන function එක
  const addNotification = useCallback((message, type = 'info') => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, message, type }]);

    // තත්පර 4කට පසු ඉබේම ඉවත් වීම
    setTimeout(() => {
      removeNotification(id);
    }, 5000);
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  }, []);

  // පහසුවෙන් call කරන්න පුළුවන් helpers
  const notify = {
    success: (msg) => addNotification(msg, 'success'),
    error: (msg) => addNotification(msg, 'error'),
    warning: (msg) => addNotification(msg, 'warning'),
    info: (msg) => addNotification(msg, 'info'),
  };

  return (
    <NotificationContext.Provider value={notify}>
      {children}
      {/* Notification Container (තිරයේ දකුණු පැත්තේ පහල) */}
      <div style={s.container}>
        {notifications.map((notif) => (
          <div key={notif.id} style={{...s.toast, ...s[notif.type]}} className="notification-item">
            <div style={s.iconArea}>
              {notif.type === 'success' && <CheckCircle size={20} />}
              {notif.type === 'error' && <AlertCircle size={20} />}
              {notif.type === 'warning' && <AlertTriangle size={20} />}
              {notif.type === 'info' && <Info size={20} />}
            </div>
            <div style={s.message}>{notif.message}</div>
            <button onClick={() => removeNotification(notif.id)} style={s.closeBtn}>
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
      {/* Animation Styles */}
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .notification-item {
          animation: slideIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
      `}</style>
    </NotificationContext.Provider>
  );
};

// --- Styles (Glassmorphism & Modern Look) ---
const s = {
  container: {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    zIndex: 9999,
    pointerEvents: 'none', // පසුබිම click කිරීමට ඉඩ දෙන්න
  },
  toast: {
    pointerEvents: 'auto',
    minWidth: '300px',
    maxWidth: '400px',
    background: 'rgba(255, 255, 255, 0.85)', // Glass effect
    backdropFilter: 'blur(12px)',
    borderRadius: '16px',
    padding: '16px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(255,255,255,0.5)',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#1e293b',
    transition: 'all 0.3s ease',
    cursor: 'default'
  },
  // Types Colors
  success: { borderLeft: '4px solid #10b981', color: '#064e3b' },
  error:   { borderLeft: '4px solid #ef4444', color: '#7f1d1d' },
  warning: { borderLeft: '4px solid #f59e0b', color: '#78350f' },
  info:    { borderLeft: '4px solid #3b82f6', color: '#1e3a8a' },

  iconArea: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    flex: 1,
    lineHeight: '1.4'
  },
  closeBtn: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: '#94a3b8',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    transition: 'color 0.2s',
  }
};