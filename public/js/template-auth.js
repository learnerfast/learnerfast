// Template website authentication handler
(function() {
  const currentPath = window.location.pathname;
  const isRegister = currentPath.includes('register') || currentPath.includes('signup');
  
  // Import Supabase from CDN
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
  script.onload = initAuth;
  document.head.appendChild(script);
  
  function showMessage(message, isError = false) {
    const existing = document.getElementById('auth-message');
    if (existing) existing.remove();
    
    const div = document.createElement('div');
    div.id = 'auth-message';
    div.style.cssText = `position:fixed;top:20px;right:20px;padding:16px 24px;border-radius:8px;z-index:9999;font-size:14px;font-weight:500;box-shadow:0 4px 12px rgba(0,0,0,0.15);${isError ? 'background:#ef4444;color:#fff;' : 'background:#22c55e;color:#fff;'}`;
    div.textContent = message;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 5000);
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
          const redirectUrl = window.TEMPLATE_AUTH_REDIRECT 
            ? window.location.origin + window.TEMPLATE_AUTH_REDIRECT 
            : window.location.origin + '/index.html';
          const { error } = await supabaseClient.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: redirectUrl }
          });
          if (error) throw error;
        } catch (error) {
          showMessage(error.message, true);
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
          const nameInput = form.querySelector('input[name="name"], input[name="full-name"], #name, #full-name');
          const name = nameInput ? nameInput.value : '';
          
          try {
            if (isRegister) {
              const { data, error } = await supabaseClient.auth.signUp({
                email,
                password,
                options: { data: { full_name: name } }
              });
              
              if (error) throw error;
              
              if (data.user && !data.session) {
                showMessage('Registration successful! Please check your email to verify your account.');
                setTimeout(() => {
                  window.location.href = window.location.pathname.replace('register', 'signin');
                }, 2000);
              } else {
                showMessage('Registration successful!');
                setTimeout(() => {
                  window.location.href = window.TEMPLATE_AUTH_REDIRECT || '/index.html';
                }, 1000);
              }
            } else {
              const { error } = await supabaseClient.auth.signInWithPassword({
                email,
                password
              });
              
              if (error) throw error;
              
              showMessage('Signed in successfully!');
              setTimeout(() => {
                window.location.href = window.TEMPLATE_AUTH_REDIRECT || '/index.html';
              }, 1000);
            }
          } catch (error) {
            showMessage(error.message || 'Authentication failed', true);
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
