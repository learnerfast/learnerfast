// Template initialization - handles OAuth redirects
(function() {
  const DEBUG = true;
  const log = (...args) => DEBUG && console.log('[INIT DEBUG]', ...args);
  
  log('Template init loaded');
  log('Current URL:', window.location.href);
  log('Pathname:', window.location.pathname);
  
  // Check if returning from OAuth
  const urlParams = new URLSearchParams(window.location.search);
  const hashParams = new URLSearchParams(window.location.hash.substring(1));
  
  log('URL params:', Object.fromEntries(urlParams));
  log('Hash params:', Object.fromEntries(hashParams));
  
  // Supabase OAuth returns tokens in hash
  if (hashParams.get('access_token')) {
    log('OAuth access token found');
    
    const pathParts = window.location.pathname.split('/');
    const lastPart = pathParts[pathParts.length - 1];
    
    if (lastPart === 'home' || lastPart === 'home.html') {
      log('Already on home, session established');
      window.history.replaceState({}, '', window.location.pathname.replace('.html', '').replace('#', ''));
    } else {
      pathParts.pop();
      const redirectUrl = pathParts.join('/') + '/home';
      log('Redirecting to:', redirectUrl);
      window.location.replace(redirectUrl);
    }
  }
})();
