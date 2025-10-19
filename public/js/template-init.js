// Auto-initialize authentication for all templates
(function() {
  const templateName = document.querySelector('meta[name="template-name"]')?.content || 
                       window.location.pathname.split('/')[2] || 'default';
  
  window.templateAuth = new TemplateAuth(templateName);
  
  // Check if returning from OAuth or on signin/register page
  const urlParams = new URLSearchParams(window.location.search);
  const isAuthPage = window.location.pathname.includes('signin.html') || window.location.pathname.includes('register.html');
  
  if (urlParams.get('auth') === 'template' && isAuthPage) {
    // Redirect to index.html
    const indexUrl = window.location.pathname.replace(/\/(signin|register)\.html/, '/index.html');
    window.location.replace(indexUrl);
  }
  
  // Auto-attach form handlers
  document.addEventListener('DOMContentLoaded', () => {
    // Google auth buttons
    const googleButtons = document.querySelectorAll('button[type="button"]');
    googleButtons.forEach(btn => {
      if (btn.textContent.includes('Google')) {
        btn.onclick = () => window.templateAuth.googleAuth();
      }
    });
    
    // Register form
    const registerForm = document.querySelector('form[action*="register"], form');
    if (registerForm && window.location.pathname.includes('register')) {
      registerForm.onsubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(registerForm);
        const result = await window.templateAuth.register({
          name: formData.get('name') || formData.get('fullName'),
          email: formData.get('email'),
          password: formData.get('password')
        });
        if (result.success) {
          window.location.href = 'index.html';
        } else {
          alert(result.error || 'Registration failed');
        }
      };
    }
    
    // Login form
    const loginForm = document.querySelector('form[action*="signin"], form');
    if (loginForm && window.location.pathname.includes('signin')) {
      loginForm.onsubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(loginForm);
        const result = await window.templateAuth.login(
          formData.get('email'),
          formData.get('password')
        );
        if (result.success) {
          window.location.href = 'index.html';
        } else {
          alert(result.error || 'Login failed');
        }
      };
    }
  });
})();
