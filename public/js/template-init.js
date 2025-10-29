// Template initialization - handles OAuth redirects
(function() {
  // Check if returning from OAuth
  const urlParams = new URLSearchParams(window.location.search);
  const hashParams = new URLSearchParams(window.location.hash.substring(1));
  
  // Supabase OAuth returns tokens in hash
  if (hashParams.get('access_token')) {
    const isAuthPage = window.location.pathname.includes('signin') || window.location.pathname.includes('register');
    if (isAuthPage) {
      // Redirect to index after successful OAuth
      const baseUrl = window.location.pathname.replace(/\/(signin|register)\.html/, '');
      window.location.replace(baseUrl + '/index.html');
    }
  }
})();
