import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useNotification } from '../../context/NotificationContext';
import { XCircle, AlertCircle, Home, RefreshCcw } from 'lucide-react';
import './styles/PaymentCancel.css';

const PaymentCancel = () => {
  const notify = useNotification();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id');

  useEffect(() => {
    notify.error('Payment process was cancelled.');
  }, [notify]);

  return (
    <div className="pc-container">
      <div className="pc-card">
        
        {/* Header Icon */}
        <div className="pc-header">
          <div className="pc-icon-wrapper">
            <XCircle size={48} color="#ef4444" />
          </div>
          <h1 className="pc-title">Payment Cancelled</h1>
          <p className="pc-subtitle">
            Your transaction was not completed. No charges were made.
          </p>
        </div>

        {/* Details Box */}
        <div className="pc-details-box">
          <div className="pc-detail-row">
            <span className="pc-label">Status</span>
            <span className="pc-value status-failed">Cancelled</span>
          </div>
          {orderId && (
            <div className="pc-detail-row">
              <span className="pc-label">Reference ID</span>
              <span className="pc-value mono">{orderId}</span>
            </div>
          )}
          <div className="pc-alert">
            <AlertCircle size={16} />
            <span>If you faced a technical issue, please try again or contact support.</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pc-actions">
          <button className="pc-btn-secondary" onClick={() => navigate('/')}>
            <Home size={18} /> Return Home
          </button>
          <button className="pc-btn-primary" onClick={() => navigate(-1)}>
            <RefreshCcw size={18} /> Retry Payment
          </button>
        </div>

      </div>
    </div>
  );
};

export default PaymentCancel;