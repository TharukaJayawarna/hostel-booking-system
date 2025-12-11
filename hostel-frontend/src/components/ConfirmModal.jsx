import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';

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
    <div style={s.overlay} onClick={onClose}>
      <div style={s.modal} onClick={e => e.stopPropagation()}>
        
        {/* Icon */}
        <div style={s.iconWrapper(isDanger)}>
          {isDanger ? <AlertTriangle size={32} /> : <Info size={32} />}
        </div>

        {/* Content */}
        <div style={s.content}>
          <h3 style={s.title}>{title}</h3>
          <p style={s.message}>{message}</p>
        </div>

        {/* Buttons */}
        <div style={s.actions}>
          <button onClick={onClose} style={s.cancelBtn}>
            {cancelText}
          </button>
          <button onClick={onConfirm} style={s.confirmBtn(isDanger)}>
            {confirmText}
          </button>
        </div>

      </div>
      <style>{`
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
};

const s = {
  overlay: {
    position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(4px)', zIndex: 9999,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '20px'
  },
  modal: {
    backgroundColor: 'white', borderRadius: '24px', padding: '30px',
    width: '100%', maxWidth: '400px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    animation: 'popIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
    display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center'
  },
  iconWrapper: (isDanger) => ({
    width: '70px', height: '70px', borderRadius: '50%',
    backgroundColor: isDanger ? '#fef2f2' : '#eff6ff',
    color: isDanger ? '#dc2626' : '#2563eb',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: '20px',
    boxShadow: isDanger ? '0 0 0 8px #fef2f2' : '0 0 0 8px #eff6ff'
  }),
  content: { marginBottom: '25px' },
  title: { fontSize: '20px', fontWeight: '800', color: '#1f2937', marginBottom: '8px' },
  message: { fontSize: '14px', color: '#6b7280', lineHeight: '1.5' },
  actions: { display: 'flex', gap: '12px', width: '100%' },
  cancelBtn: {
    flex: 1, padding: '12px', borderRadius: '12px',
    border: '1px solid #e5e7eb', backgroundColor: 'white',
    color: '#374151', fontWeight: '600', fontSize: '14px',
    cursor: 'pointer', transition: 'background 0.2s',
    ':hover': { backgroundColor: '#f9fafb' }
  },
  confirmBtn: (isDanger) => ({
    flex: 1, padding: '12px', borderRadius: '12px', border: 'none',
    backgroundColor: isDanger ? '#dc2626' : '#2563eb',
    color: 'white', fontWeight: '600', fontSize: '14px',
    cursor: 'pointer', boxShadow: isDanger ? '0 4px 12px rgba(220, 38, 38, 0.25)' : '0 4px 12px rgba(37, 99, 235, 0.25)',
    transition: 'transform 0.1s',
    ':hover': { transform: 'scale(1.02)' }
  })
};

export default ConfirmModal;