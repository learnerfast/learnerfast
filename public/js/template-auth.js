// Template website authentication handler - matches landing page flow
(function() {
  const DEBUG = true;
  const log = (...args) => DEBUG && console.log('[AUTH DEBUG]', ...args);
  
  const currentPath = window.location.pathname;
  const isRegister = currentPath.includes('register') || currentPath.includes('signup');
  log('Page type:', isRegister ? 'Register' : 'Sign In');
  
  // Import Supabase from CDN
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
  script.onload = initAuth;
  document.head.appendChild(script);
  
  function showToast(message, isError = false) {
    log('Toast:', message, 'Error:', isError);
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
    log('Initializing auth...');
    if (!window.supabase) {
      console.error('Supabase not loaded');
      return;
    }
    log('Supabase loaded successfully');
    
    const { createClient } = window.supabase;
    const supabaseClient = createClient(
      'https://bplarfqdpsgadtzzlxur.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwbGFyZnFkcHNnYWR0enpseHVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3NzMzNjgsImV4cCI6MjA3NjM0OTM2OH0.YKUf2RYypzvMlH1FiXZCBlzM3Rn8g8ZXQ6h65ESgWtk'
    );
    log('Supabase client created');
    
    // Handle Google OAuth
    document.addEventListener('click', async (e) => {
      const btn = e.target.closest('button, a');
      if (btn && btn.textContent.toLowerCase().includes('google')) {
        e.preventDefault();
        log('Google OAuth clicked');
        btn.disabled = true;
        btn.style.opacity = '0.6';
        
        try {
          const pathParts = window.location.pathname.split('/');
          pathParts.pop();
          const templatePath = pathParts.join('/');
          const redirectUrl = window.location.origin + templatePath + '/home';
          log('OAuth redirect URL:', redirectUrl);
          const { error } = await supabaseClient.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: redirectUrl }
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
    document.querySelectorAll('form').forEach(form => {
      const emailInput = form.querySelector('input[type="email"]');
      const passwordInput = form.querySelector('input[type="password"]');
      
      if (emailInput && passwordInput) {
        log('Form found with email and password inputs');
        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          log('Form submitted');
          
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
          log('Form data:', { email, name, passwordLength: password.length });
          
          // Validate password confirmation for registration
          if (isRegister) {
            const confirmPasswordInput = form.querySelector('input[name="confirm-password"], input[id="confirm-password"]');
            log('Password confirmation check:', password === confirmPasswordInput?.value);
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
            const hostname = window.location.hostname;
            const websiteName = hostname.split('.')[0];
            
            if (isRegister) {
              log('Attempting registration for website:', websiteName);
              
              const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, name, website_name: websiteName })
              });
              
              const result = await response.json();
              log('Registration response:', result);
              
              if (!response.ok) {
                throw new Error(result.error || 'Registration failed');
              }
              
              showToast('Registration successful! Please check your email to verify your account.');
              form.reset();
              setTimeout(() => {
                const redirectUrl = window.location.pathname.replace('register', 'signin');
                log('Redirecting to:', redirectUrl);
                window.location.href = redirectUrl;
              }, 3000);
            } else {
              log('Attempting sign in for website:', websiteName);
              
              const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, website_name: websiteName })
              });
              
              const result = await response.json();
              log('Sign in response:', result);
              log('Session data:', result.session);
              
              if (!response.ok) {
                throw new Error(result.error || 'Sign in failed');
              }
              
              showToast('Signed in successfully!');
              setTimeout(() => {
                const pathParts = window.location.pathname.split('/');
                pathParts.pop();
                const redirectUrl = pathParts.join('/') + '/home';
                log('Redirecting to:', redirectUrl);
                window.location.href = redirectUrl;
              }, 1000);
            }
          } catch (error) {
            log('Caught error:', error);
            let errorMessage = 'Authentication failed';
            if (error.message.includes('Too many requests')) {
              errorMessage = error.message;
            } else if (error.message.includes('Email not confirmed')) {
              errorMessage = error.message;
            } else if (error.message.includes('Invalid login credentials')) {
              errorMessage = error.message;
            } else {
              errorMessage = error.message || 'Authentication failed';
            }
            showToast(errorMessage, true);
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
