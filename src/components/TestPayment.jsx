'use client';
import { useState } from 'react';

export default function TestPayment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePayment = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/payment/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: 'test-course-123',
          userId: 'test-user-123',
          amount: 10, // ₹10
          courseName: 'Test Course'
        })
      });

      const data = await response.json();

      if (data.success) {
        window.location.href = data.checkoutUrl;
      } else {
        setError(data.error || 'Payment failed');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Test PhonePe Payment</h2>
      <button 
        onClick={handlePayment}
        disabled={loading}
        style={{
          padding: '10px 20px',
          background: '#5f50e4',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Processing...' : 'Pay ₹10'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
