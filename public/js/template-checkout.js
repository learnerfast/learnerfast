(function() {
  if (window.self !== window.top) return;
  
  const urlParams = new URLSearchParams(window.location.search);
  const courseId = urlParams.get('courseId');
  
  if (!courseId) {
    window.location.href = '/courses.html';
    return;
  }
  
  const hostname = window.location.hostname;
  const websiteName = hostname.split('.')[0];
  
  let coursesCache = sessionStorage.getItem(`courses_${websiteName}`);
  if (coursesCache) coursesCache = JSON.parse(coursesCache);
  
  const course = coursesCache?.find(c => c.id === courseId);
  
  if (!course) {
    fetch(`https://www.learnerfast.com/api/courses/by-website?website_name=${websiteName}`)
      .then(r => r.json())
      .then(data => {
        coursesCache = data.courses;
        sessionStorage.setItem(`courses_${websiteName}`, JSON.stringify(coursesCache));
        const foundCourse = coursesCache.find(c => c.id === courseId);
        if (foundCourse) renderCheckout(foundCourse);
        else window.location.href = '/courses.html';
      });
  } else {
    renderCheckout(course);
  }
  
  function renderCheckout(course) {
    document.querySelector('.text-3xl.font-bold.tracking-tight').textContent = `Checkout: ${course.title}`;
    
    const priceElements = document.querySelectorAll('.text-5xl.font-extrabold, .text-lg.font-bold');
    priceElements.forEach(el => {
      if (el.classList.contains('text-5xl')) {
        el.textContent = `₹${course.price}`;
      } else if (el.textContent.includes('$199')) {
        el.textContent = `₹${course.price}`;
      }
    });
    
    const courseName = document.querySelector('.order-summary dd.text-sm.font-medium');
    if (courseName) courseName.textContent = course.title;
    
    const checkoutBtn = document.querySelector('button.bg-primary.w-full');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        checkoutBtn.disabled = true;
        checkoutBtn.innerHTML = '<span class="material-symbols-outlined animate-spin">progress_activity</span> Processing...';
        
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
        script.onload = async () => {
          const { createClient } = window.supabase;
          const supabaseClient = createClient(
            'https://bplarfqdpsgadtzzlxur.supabase.co',
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwbGFyZnFkcHNnYWR0enpseHVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3NzMzNjgsImV4cCI6MjA3NjM0OTM2OH0.YKUf2RYypzvMlH1FiXZCBlzM3Rn8g8ZXQ6h65ESgWtk'
          );
          
          const { data: { user } } = await supabaseClient.auth.getUser();
          if (!user) {
            sessionStorage.setItem('returnUrl', window.location.pathname + window.location.search);
            window.location.href = '/signin';
            return;
          }
          
          try {
            const apiUrl = window.location.hostname.includes('learnerfast.com') 
              ? '/api/payment/razorpay/create-order'
              : 'https://www.learnerfast.com/api/payment/razorpay/create-order';
            
            const response = await fetch(apiUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                courseId: course.id,
                userId: user.id,
                amount: course.price,
                courseName: course.title
              })
            });
            
            const data = await response.json();
            if (data.success && data.order) {
              const options = {
                key: 'rzp_live_S0gDDEqTf2wOwR',
                amount: data.order.amount,
                currency: data.order.currency,
                name: course.title,
                order_id: data.order.id,
                handler: async (response) => {
                  const verifyRes = await fetch(apiUrl.replace('create-order', 'verify'), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(response)
                  });
                  const result = await verifyRes.json();
                  if (result.success) {
                    window.location.href = '/payment-success';
                  } else {
                    alert('Payment verification failed');
                    checkoutBtn.disabled = false;
                    checkoutBtn.innerHTML = '<span class="material-symbols-outlined">lock</span> Secure Checkout';
                  }
                },
                theme: { color: '#3399cc' }
              };
              const rzpScript = document.createElement('script');
              rzpScript.src = 'https://checkout.razorpay.com/v1/checkout.js';
              rzpScript.onload = () => {
                const rzp = new window.Razorpay(options);
                rzp.open();
              };
              document.head.appendChild(rzpScript);
            } else {
              const errorMsg = data.error || 'Payment initiation failed';
              const errorDetails = data.details ? ` (${data.details})` : '';
              alert(`${errorMsg}${errorDetails}. Please try again.`);
              console.error('Payment error:', data);
              checkoutBtn.disabled = false;
              checkoutBtn.innerHTML = '<span class="material-symbols-outlined">lock</span> Secure Checkout';
            }
          } catch (error) {
            console.error('Checkout error:', error);
            alert(`An error occurred: ${error.message}. Please try again.`);
            checkoutBtn.disabled = false;
            checkoutBtn.innerHTML = '<span class="material-symbols-outlined">lock</span> Secure Checkout';
          }
        };
        document.head.appendChild(script);
      });
    }
  }
})();
