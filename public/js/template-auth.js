// Template website authentication handler - matches landing page flow
(function() {
  const currentPath = window.location.pathname;
  const isRegister = currentPath.includes('register') || currentPath.includes('signup');
  
  // Wait for Supabase to load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuth);
  } else {
    initAuth();
  }
  
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
    if (!window.supabase) {
      console.error('Supabase not loaded');
      return;
    }
    
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
          const baseUrl = window.location.origin + window.location.pathname.replace(/\/(signin|register)\.html/, '');
          const { error } = await supabaseClient.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: baseUrl + '/index.html' }
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
          
          try {
            if (isRegister) {
              const { data, error } = await supabaseClient.auth.signUp({
                email,
                password,
                options: { data: { full_name: name } }
              });
              
              if (error) {
                if (error.message.includes('429') || error.status === 429) {
                  throw new Error('Too many requests. Please wait a few minutes and try again.');
                }
                throw error;
              }
              
              if (data?.user && data?.user?.identities?.length === 0) {
                throw new Error('This email is already registered. Please sign in instead.');
              }
              
              showToast('Registration successful! Please check your email inbox (and spam folder) to verify your account before signing in.');
              form.reset();
              setTimeout(() => {
                window.location.href = window.location.pathname.replace('register', 'signin');
              }, 5000);
            } else {
              const { error } = await supabaseClient.auth.signInWithPassword({
                email,
                password
              });
              
              if (error) {
                if (error.message.includes('Email not confirmed')) {
                  throw new Error('Please verify your email before signing in. Check your inbox.');
                }
                if (error.message.includes('Invalid login credentials')) {
                  throw new Error('Invalid email or password. Please try again.');
                }
                throw error;
              }
              
              showToast('Signed in successfully!');
              setTimeout(() => {
                const baseUrl = window.location.pathname.replace(/\/signin\.html/, '');
                window.location.href = baseUrl + '/index.html';
              }, 1000);
            }
          } catch (error) {
            let errorMessage = 'Authentication failed';
            if (error.message.includes('already registered') || error.message.includes('User already registered')) {
              errorMessage = 'This email is already registered. Please sign in instead.';
            } else if (error.message.includes('Too many requests')) {
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
