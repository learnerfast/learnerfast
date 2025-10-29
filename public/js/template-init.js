// Template initialization - handles OAuth redirects
(function() {
  const DEBUG = true;
  const log = (...args) => DEBUG && console.log('[INIT DEBUG]', ...args);
  
  log('Template init loaded');
  log('Current URL:', window.location.href);
  
  // Check if returning from OAuth
  const urlParams = new URLSearchParams(window.location.search);
  const hashParams = new URLSearchParams(window.location.hash.substring(1));
  
  log('URL params:', Object.fromEntries(urlParams));
  log('Hash params:', Object.fromEntries(hashParams));
  
  // Supabase OAuth returns tokens in hash
  if (hashParams.get('access_token')) {
    log('OAuth access token found');
    const isAuthPage = window.location.pathname.includes('signin') || window.location.pathname.includes('register');
    log('Is auth page:', isAuthPage);
    if (isAuthPage) {
      // Redirect to index after successful OAuth
      const baseUrl = window.location.pathname.replace(/\/(signin|register)\.html/, '');
      const redirectUrl = baseUrl + '/index.html';
      log('Redirecting to:', redirectUrl);
      window.location.replace(redirectUrl);
    }
  }
})();
