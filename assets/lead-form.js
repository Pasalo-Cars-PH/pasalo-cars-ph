// Lead capture form handler
class LeadFormHandler {
  constructor(formId = 'leadForm') {
    this.form = document.getElementById(formId);
    this.init();
  }

  init() {
    if (!this.form) return;
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
  }

  handleSubmit(e) {
    e.preventDefault();

    // Get form data
    const formData = new FormData(this.form);
    const data = {
      name: formData.get('name') || '',
      email: formData.get('email') || '',
      phone: formData.get('phone') || '',
      vehicle: formData.get('vehicle') || 'General Inquiry',
      message: formData.get('message') || '',
      timestamp: new Date().toISOString(),
      source: 'lead-form'
    };

    // Validate data
    if (!this.validateForm(data)) {
      return;
    }

    // Show loading state
    this.setFormState('loading');

    // Send to backend or email service
    this.submitLead(data);
  }

  validateForm(data) {
    // Name validation
    if (!data.name || data.name.trim().length < 2) {
      this.showError('Please enter a valid name');
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email || !emailRegex.test(data.email)) {
      this.showError('Please enter a valid email address');
      return false;
    }

    // Phone validation
    const phoneRegex = /^[0-9\s\-\+\(\)]+$/;
    if (!data.phone || !phoneRegex.test(data.phone) || data.phone.replace(/\D/g, '').length < 10) {
      this.showError('Please enter a valid phone number');
      return false;
    }

    return true;
  }

  submitLead(data) {
    // Prepare email body
    const emailBody = this.formatEmailBody(data);

    // Option 1: Send via FormSubmit (no backend required)
    this.sendViaFormSubmit(data);

    // Option 2: Store in localStorage as fallback
    this.storeLeadLocally(data);

    // Show success message
    setTimeout(() => {
      this.showSuccess();
    }, 500);
  }

  sendViaFormSubmit(data) {
    // Using FormSubmit.co for email delivery (free, no backend needed)
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'https://formsubmit.co/derlonskie0929@gmail.com';
    form.style.display = 'none';

    // Add fields
    form.innerHTML = `
      <input type="text" name="name" value="${this.escapeHtml(data.name)}">
      <input type="email" name="email" value="${this.escapeHtml(data.email)}">
      <input type="text" name="phone" value="${this.escapeHtml(data.phone)}">
      <input type="text" name="vehicle" value="${this.escapeHtml(data.vehicle)}">
      <textarea name="message">${this.escapeHtml(data.message)}</textarea>
      <input type="text" name="_subject" value="New Lead from Pasalo Cars PH">
      <input type="hidden" name="_captcha" value="false">
    `;

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
  }

  storeLeadLocally(data) {
    try {
      const leads = JSON.parse(localStorage.getItem('pasaloLeads') || '[]');
      leads.push(data);
      localStorage.setItem('pasaloLeads', JSON.stringify(leads));
      console.log('Lead stored locally:', data);
    } catch (e) {
      console.warn('Could not store lead locally:', e);
    }
  }

  formatEmailBody(data) {
    return `
Name: ${data.name}
Email: ${data.email}
Phone: ${data.phone}
Vehicle Interest: ${data.vehicle}
Message: ${data.message}
Timestamp: ${data.timestamp}
Source: ${data.source}
    `.trim();
  }

  setFormState(state) {
    const submitBtn = this.form.querySelector('button[type="submit"]');
    if (!submitBtn) return;

    if (state === 'loading') {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';
      submitBtn.style.opacity = '0.6';
    } else if (state === 'success') {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Sent! ✓';
      submitBtn.style.opacity = '1';
    } else {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Message';
      submitBtn.style.opacity = '1';
    }
  }

  showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'form-error';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
      background: #fee;
      color: #c33;
      padding: 12px 16px;
      border-radius: 6px;
      margin-bottom: 16px;
      font-size: 14px;
      border-left: 4px solid #c33;
    `;

    this.form.insertBefore(errorDiv, this.form.firstChild);

    // Remove error after 5 seconds
    setTimeout(() => {
      errorDiv.remove();
    }, 5000);
  }

  showSuccess() {
    const successDiv = document.createElement('div');
    successDiv.className = 'form-success';
    successDiv.textContent = 'Thank you! We\'ll contact you soon.';
    successDiv.style.cssText = `
      background: #efe;
      color: #3c3;
      padding: 12px 16px;
      border-radius: 6px;
      margin-bottom: 16px;
      font-size: 14px;
      border-left: 4px solid #3c3;
    `;

    this.form.insertBefore(successDiv, this.form.firstChild);

    // Reset form
    this.form.reset();
    this.setFormState('success');

    // Remove success message after 5 seconds
    setTimeout(() => {
      successDiv.remove();
      this.setFormState('reset');
    }, 5000);
  }

  escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }

  // Get leads from localStorage (for admin purposes)
  static getStoredLeads() {
    try {
      return JSON.parse(localStorage.getItem('pasaloLeads') || '[]');
    } catch (e) {
      return [];
    }
  }

  // Clear stored leads
  static clearStoredLeads() {
    try {
      localStorage.removeItem('pasaloLeads');
      console.log('Stored leads cleared');
    } catch (e) {
      console.warn('Could not clear stored leads:', e);
    }
  }
}

// Auto-initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('leadForm')) {
    new LeadFormHandler('leadForm');
  }
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LeadFormHandler;
}
