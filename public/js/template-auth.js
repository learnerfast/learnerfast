// Template website authentication handler
(function() {
  const currentPath = window.location.pathname;
  const isRegister = currentPath.includes('register') || currentPath.includes('signup');
  
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
  script.onload = initAuth;
  document.head.appendChild(script);
  
  const hostname = window.location.hostname;
  const websiteName = hostname.split('.')[0];
  
  function showToast(message, isError = false) {
    const existing = document.getElementById('auth-toast');
    if (existing) existing.remove();
    
    const toast = document.createElement('div');
    toast.id = 'auth-toast';
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 16px 24px;
      border-radius: 0.75rem;
      z-index: 9999;
      font-size: 15px;
      font-weight: 500;
      max-width: 500px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
      animation: slideIn 0.3s ease-out;
      ${isError ? 'background: #ef4444; color: #ffffff;' : 'background: #4f46e5; color: #ffffff;'}
    `;
    toast.textContent = message;
    
    const style = document.createElement('style');
    style.textContent = '@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }';
    document.head.appendChild(style);
    
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 5000);
  }
  
  function initAuth() {
    if (!window.supabase) return;
    
    const { createClient } = window.supabase;
    const supabaseClient = createClient(
      'https://bplarfqdpsgadtzzlxur.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwbGFyZnFkcHNnYWR0enpseHVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3NzMzNjgsImV4cCI6MjA3NjM0OTM2OH0.YKUf2RYypzvMlH1FiXZCBlzM3Rn8g8ZXQ6h65ESgWtk'
    );
    
    // Handle Google OAuth
    document.addEventListener('click', async (e) => {
      const btn = e.target.closest('button, a');
      if (btn && btn.textContent.toLowerCase().includes('google')) {
        e.preventDefault();
        btn.disabled = true;
        btn.style.opacity = '0.6';
        
        try {
          const pathParts = window.location.pathname.split('/');
          pathParts.pop();
          const redirectUrl = window.location.origin + pathParts.join('/') + '/home';
          const returnUrl = sessionStorage.getItem('returnUrl');
          const finalRedirect = returnUrl || redirectUrl;
          if (returnUrl) sessionStorage.removeItem('returnUrl');
          
          const { error } = await supabaseClient.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: finalRedirect }
          });
          if (error) throw error;
        } catch (error) {
          showToast(error.message, true);
          btn.disabled = false;
          btn.style.opacity = '1';
        }
      }
    });
    
    // Handle email/password forms
    let formHandled = false;
    document.querySelectorAll('form').forEach(form => {
      const emailInput = form.querySelector('input[type="email"]');
      const passwordInput = form.querySelector('input[type="password"]');
      
      if (emailInput && passwordInput && !formHandled) {
        formHandled = true;
        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          
          const submitBtn = form.querySelector('button[type="submit"]');
          const originalText = submitBtn ? submitBtn.textContent : '';
          if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = isRegister ? 'Registering...' : 'Signing in...';
          }
          
          const email = emailInput.value;
          const password = passwordInput.value;
          const nameInput = form.querySelector('input[name="name"], input[name="fullname"], input[name="full-name"], #name, #full-name, #fullname');
          const name = nameInput ? nameInput.value : '';
          
          if (isRegister) {
            const confirmPasswordInput = form.querySelector('input[name="confirm-password"], input[id="confirm-password"]');
            if (confirmPasswordInput && password !== confirmPasswordInput.value) {
              showToast('Passwords do not match', true);
              if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
              }
              return;
            }
            if (password.length < 6) {
              showToast('Password must be at least 6 characters', true);
              if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
              }
              return;
            }
          }
          
          try {
            const endpoint = isRegister ? 'template-register' : 'template-login';
            const response = await fetch(`https://www.learnerfast.com/api/auth/${endpoint}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, password, name, website_name: websiteName }),
              mode: 'cors',
              credentials: 'omit'
            });
            
            const result = await response.json();
            
            if (!response.ok) {
              if (isRegister && result.error?.includes('already exists')) {
                showToast('Already registered! Redirecting to login...', true);
                setTimeout(() => {
                  const pathParts = window.location.pathname.split('/');
                  pathParts.pop();
                  window.location.href = pathParts.join('/') + '/signin';
                }, 2000);
                return;
              }
              throw new Error(result.error || 'Authentication failed');
            }
            
            if (result.session) {
              await supabaseClient.auth.setSession({
                access_token: result.session.access_token,
                refresh_token: result.session.refresh_token
              });
            }
            
            showToast(isRegister ? 'Registration successful! Redirecting...' : 'Signed in successfully!');
            setTimeout(() => {
              // Check if there's a return URL
              const returnUrl = sessionStorage.getItem('returnUrl');
              if (returnUrl) {
                sessionStorage.removeItem('returnUrl');
                window.location.href = returnUrl;
              } else {
                const pathParts = window.location.pathname.split('/');
                pathParts.pop();
                window.location.href = pathParts.join('/') + '/home';
              }
            }, 1000);
          } catch (error) {
            showToast(error.message || 'Authentication failed', true);
            if (submitBtn) {
              submitBtn.disabled = false;
              submitBtn.textContent = originalText;
            }
          }
        });
      }
    });
  }
})();
