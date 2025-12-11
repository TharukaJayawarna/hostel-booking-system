import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useNotification } from '../../context/NotificationContext';

const PaymentCancel = () => {
  const notify = useNotification();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id'); // optional display

  // Optional: Show toast on load
  React.useEffect(() => {
    notify.error('Payment was cancelled.');
  }, []);

  return (
    <div className="max-w-md mx-auto mt-20 p-6 border rounded shadow text-center">
      <h2 className="text-2xl font-bold mb-4 text-red-600">Payment Cancelled</h2>
      {orderId && <p>Order ID: <strong>{orderId}</strong></p>}
      <p>Your reservation was not completed. You can try again anytime.</p>
    </div>
  );
};

export default PaymentCancel;
