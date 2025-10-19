// Template Authentication Utility
class TemplateAuth {
  constructor(websiteName) {
    this.websiteName = websiteName;
    this.baseUrl = window.location.origin;
  }

  async register(formData) {
    try {
      const response = await fetch(`${this.baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          website_name: this.websiteName,
          template_register: true
        })
      });

      const result = await response.json();
      
      if (response.ok) {
        localStorage.setItem('template_user', JSON.stringify(result.user));
        this.trackEvent('registration_success', { website_name: this.websiteName });
        return { success: true, user: result.user };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return { success: false, error: 'Registration failed' };
    }
  }

  async googleAuth() {
    const redirectUrl = `${window.location.origin}/api/auth/login?template-callback=true&website_name=${encodeURIComponent(this.websiteName)}`;
    const authUrl = `https://nzbmhfayahbypqevsbip.supabase.co/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectUrl)}`;
    window.location.href = authUrl;
    return { success: true };
  }

  async login(email, password) {
    try {
      const response = await fetch(`${this.baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          website_name: this.websiteName,
          template_login: true
        })
      });

      const result = await response.json();
      
      if (response.ok) {
        localStorage.setItem('template_user', JSON.stringify(result.user));
        this.trackEvent('login_success', { website_name: this.websiteName });
        return { success: true, user: result.user };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return { success: false, error: 'Login failed' };
    }
  }

  async trackEvent(eventType, eventData) {
    const user = this.getCurrentUser();
    if (!user) return;

    try {
      await fetch(`${this.baseUrl}/api/analytics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          event_type: eventType,
          event_data: eventData,
          website_name: this.websiteName
        })
      });
    } catch (error) {
      console.error('Analytics tracking failed:', error);
    }
  }

  getCurrentUser() {
    const userStr = localStorage.getItem('template_user');
    return userStr ? JSON.parse(userStr) : null;
  }

  logout() {
    localStorage.removeItem('template_user');
    this.trackEvent('logout', { website_name: this.websiteName });
  }

  isLoggedIn() {
    return !!this.getCurrentUser();
  }
}

// Auto-initialize based on page
window.TemplateAuth = TemplateAuth;