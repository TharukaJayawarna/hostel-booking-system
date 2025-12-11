import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { useNotification } from '../../context/NotificationContext';

const PaymentSuccess = () => {
  const notify = useNotification();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [reservationNumber, setReservationNumber] = useState('');

  useEffect(() => {
    const orderId = searchParams.get('order_id'); // PayHere returns order_id in query params
    if (!orderId) {
      notify.error('Invalid payment confirmation.');
      setLoading(false);
      return;
    }

    // Call backend to verify payment & finalize reservation
    const verifyPayment = async () => {
      try {
        const response = await api.post(
          `/payments/verify/${orderId}`, // Backend endpoint to verify PayHere payment
          {},
          { headers: { 'X-Api-Version': 'v1' } }
        );

        const reservationNo = response.data.data?.reservationNumber;
        setReservationNumber(reservationNo);

        notify.success('Payment successful! Reservation confirmed.');
      } catch (err) {
        console.error(err);
        notify.error(err.response?.data?.message || 'Payment verification failed!');
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [searchParams]);

  if (loading) {
    return <div className="text-center mt-20">Processing your payment...</div>;
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-6 border rounded shadow text-center">
      <h2 className="text-2xl font-bold mb-4 text-green-600">Payment Successful!</h2>
      {reservationNumber && (
        <p className="mb-4">
          Your reservation number is: <strong>{reservationNumber}</strong>
        </p>
      )}
      <p>Thank you for reserving with us. Check your email for details.</p>
    </div>
  );
};

export default PaymentSuccess;
