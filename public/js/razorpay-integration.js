// Add this script to template websites to enable Razorpay payments
(function() {
  // Load Razorpay script
  const script = document.createElement('script');
  script.src = 'https://checkout.razorpay.com/v1/checkout.js';
  script.async = true;
  document.head.appendChild(script);

  // Payment handler
  window.initRazorpayPayment = function(courseId, courseName, amount, userId, websiteId) {
    fetch('/api/payment/razorpay/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseId, userId, amount, courseName, websiteId })
    })
    .then(res => res.json())
    .then(data => {
      if (!data.success) throw new Error('Order creation failed');
      
      const options = {
        key: window.RAZORPAY_KEY_ID,
        amount: data.order.amount,
        currency: data.order.currency,
        name: courseName,
        order_id: data.order.id,
        handler: function(response) {
          fetch('/api/payment/razorpay/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(response)
          })
          .then(res => res.json())
          .then(result => {
            if (result.success) {
              window.location.href = '/payment-success';
            } else {
              alert('Payment verification failed');
            }
          });
        },
        theme: { color: '#3399cc' }
      };

      const rzp = new Razorpay(options);
      rzp.open();
    })
    .catch(error => {
      console.error('Payment error:', error);
      alert('Payment failed');
    });
  };
})();
