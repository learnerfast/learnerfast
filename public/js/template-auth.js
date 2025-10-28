// Template website authentication handler
(function() {
  const currentPath = window.location.pathname;
  const isRegister = currentPath.includes('register') || currentPath.includes('signup');
  
  // Supabase config
  const SUPABASE_URL = 'https://bplarfqdpsgadtzzlxur.supabase.co';
  const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwbGFyZnFkcHNnYWR0enpseHVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3NzMzNjgsImV4cCI6MjA3NjM0OTM2OH0.YKUf2RYypzvMlH1FiXZCBlzM3Rn8g8ZXQ6h65ESgWtk';
  
  // Handle Google OAuth
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('button, a');
    if (btn && btn.textContent.toLowerCase().includes('google')) {
      e.preventDefault();
      const redirectUrl = `${window.location.origin}/index.html`;
      window.location.href = `${SUPABASE_URL}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectUrl)}`;
    }
  });
  
  // Handle email/password forms
  document.querySelectorAll('form').forEach(form => {
    if (form.querySelector('input[type="email"]') && form.querySelector('input[type="password"]')) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = form.querySelector('input[type="email"]').value;
        const password = form.querySelector('input[type="password"]').value;
        const name = form.querySelector('input[name="name"]')?.value || '';
        
        const endpoint = isRegister ? '/api/auth/template-register' : '/api/auth/template-login';
        
        try {
          const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, name })
          });
          const data = await res.json();
          
          if (data.success) {
            if (data.message) alert(data.message);
            else window.location.href = '/index.html';
          } else {
            alert(data.error || 'Authentication failed');
          }
        } catch (err) {
          alert('Authentication failed');
        }
      });
    }
  });
})();
