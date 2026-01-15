'use client';
import { useState } from 'react';

export default function RazorpayCheckout({ courseId, courseName, amount, userId, websiteId }) {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/payment/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, userId, amount, courseName, websiteId })
      });

      const { success, order } = await res.json();
      if (!success) throw new Error('Order creation failed');

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: courseName,
        order_id: order.id,
        handler: async (response) => {
          const verifyRes = await fetch('/api/payment/razorpay/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(response)
          });

          const result = await verifyRes.json();
          if (result.success) {
            window.location.href = '/payment-success';
          } else {
            alert('Payment verification failed');
          }
        },
        prefill: { name: '', email: '', contact: '' },
        theme: { color: '#3399cc' }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handlePayment} disabled={loading}>
      {loading ? 'Processing...' : `Pay ₹${amount}`}
    </button>
  );
}
