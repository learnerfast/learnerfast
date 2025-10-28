// Template website authentication handler
(function() {
  const currentPath = window.location.pathname;
  const isSignin = currentPath.includes('signin') || currentPath.includes('sign-in');
  const isRegister = currentPath.includes('register') || currentPath.includes('signup') || currentPath.includes('sign-up');
  
  // Initialize Supabase client
  const supabaseUrl = 'https://your-project.supabase.co';
  const supabaseKey = 'your-anon-key';
  
  // Handle Google OAuth buttons
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('button, a');
    if (btn) {
      const text = btn.textContent.toLowerCase();
      if (text.includes('google') || text.includes('continue with')) {
        e.preventDefault();
        fetch('/api/auth/google-init', { method: 'POST' })
          .then(r => r.json())
          .then(data => {
            if (data.url) window.location.href = data.url;
          });
      }
    }
  });
  
  // Handle email/password forms
  const forms = document.querySelectorAll('form');
  forms.forEach(form => {
    const hasEmail = form.querySelector('input[type="email"]');
    const hasPassword = form.querySelector('input[type="password"]');
    
    if (hasEmail && hasPassword) {
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
            body: JSON.stringify({ email, password, name }),
            credentials: 'include'
          });
          const data = await res.json();
          
          if (data.success) {
            if (data.message) alert(data.message);
            window.location.href = '/home';
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
