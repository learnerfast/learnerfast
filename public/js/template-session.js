// Template session handler - shows user icon when logged in
(function() {
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
  script.onload = () => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', checkSession);
    } else {
      checkSession();
    }
  };
  document.head.appendChild(script);
  
  async function checkSession() {
    if (!window.supabase) return;
    
    const { createClient } = window.supabase;
    const supabaseClient = createClient(
      'https://bplarfqdpsgadtzzlxur.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwbGFyZnFkcHNnYWR0enpseHVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3NzMzNjgsImV4cCI6MjA3NjM0OTM2OH0.YKUf2RYypzvMlH1FiXZCBlzM3Rn8g8ZXQ6h65ESgWtk'
    );
    
    const { data: { user } } = await supabaseClient.auth.getUser();
      
    if (user) {
      const signinLink = document.querySelector('a[href="signin.html"], a[href*="/signin"]');
      const registerLink = document.querySelector('a[href="register.html"], a[href*="/register"]');
      
      if (signinLink && registerLink && signinLink.parentElement === registerLink.parentElement) {
        const authContainer = signinLink.parentElement;
        const userName = user.user_metadata?.name || user.email?.split('@')[0] || 'User';
        
        authContainer.innerHTML = `
          <div class="relative group">
            <button class="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <div class="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">${userName.charAt(0).toUpperCase()}</div>
              <span class="text-sm font-medium">${userName}</span>
            </button>
            <div class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <button id="logout-btn" class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">Sign Out</button>
            </div>
          </div>
        `;
          
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
          logoutBtn.addEventListener('click', async () => {
            await supabaseClient.auth.signOut();
            window.location.reload();
          });
        }
      }
    }
  }
})();
