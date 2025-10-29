// Template session handler - shows user icon when logged in
(function() {
  const DEBUG = true;
  const log = (...args) => DEBUG && console.log('[SESSION DEBUG]', ...args);
  
  checkSession();
  
  function checkSession() {
    const session = JSON.parse(localStorage.getItem('template_session') || 'null');
    log('Template session:', session);
      
    if (session?.user) {
      const authButtons = document.querySelector('.flex.items-center.gap-3');
      if (authButtons && authButtons.querySelector('a[href="signin.html"]')) {
        const user = session.user;
        const userName = user.name || user.email?.split('@')[0] || 'User';
        
        authButtons.innerHTML = `
          <div class="relative group">
            <button class="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <div class="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">${userName.charAt(0).toUpperCase()}</div>
              <span class="text-sm font-medium">${userName}</span>
            </button>
            <div class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <a href="#" class="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg">Profile</a>
              <a href="#" class="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">Settings</a>
              <button id="logout-btn" class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-lg">Sign Out</button>
            </div>
          </div>
        `;
          
        setTimeout(() => {
          const logoutBtn = document.getElementById('logout-btn');
          if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
              localStorage.removeItem('template_session');
              window.location.reload();
            });
          }
        }, 100);
        
        log('UI updated with user info');
      }
    }
  }
})();
