// Floating contact buttons and mobile menu handler
class FloatingContactButtons {
  constructor() {
    this.init();
  }

  init() {
    this.setupFloatingBubble();
    this.setupMobileMenu();
    this.setupContactLinks();
  }

  setupFloatingBubble() {
    // Messenger bubble is already in HTML, just add click handler
    const fbBubble = document.querySelector('.fb-bubble');
    if (fbBubble) {
      fbBubble.addEventListener('click', () => {
        window.open('https://www.facebook.com/share/1KauhZnvHP/?mibextid=wwXIfr', '_blank');
      });
      fbBubble.style.cursor = 'pointer';
    }
  }

  setupMobileMenu() {
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');

    if (navToggle && navLinks) {
      navToggle.addEventListener('click', () => {
        const isOpen = navLinks.classList.toggle('open');
        navToggle.setAttribute('aria-expanded', isOpen);
      });

      // Close menu when a link is clicked
      navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          navLinks.classList.remove('open');
          navToggle.setAttribute('aria-expanded', 'false');
        });
      });

      // Close menu when clicking outside
      document.addEventListener('click', (e) => {
        if (!navToggle.contains(e.target) && !navLinks.contains(e.target)) {
          navLinks.classList.remove('open');
          navToggle.setAttribute('aria-expanded', 'false');
        }
      });
    }
  }

  setupContactLinks() {
    // Set up phone and messaging links with proper formatting
    const phone = '+639950369117';
    const phoneFormatted = '09950369117';

    // Facebook links
    const fbLinks = document.querySelectorAll('a[href*="facebook.com"]');
    fbLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        this.trackContactEvent('facebook');
      });
    });

    // Viber links
    const viberLinks = document.querySelectorAll('a[href*="viber://"]');
    viberLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        this.trackContactEvent('viber');
      });
    });

    // WhatsApp links
    const waLinks = document.querySelectorAll('a[href*="wa.me"]');
    waLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        this.trackContactEvent('whatsapp');
      });
    });
  }

  trackContactEvent(method) {
    // Track contact method usage for analytics
    try {
      if (typeof gtag !== 'undefined') {
        gtag('event', 'contact_click', {
          method: method,
          timestamp: new Date().toISOString()
        });
      }
    } catch (e) {
      console.log('Analytics not available');
    }

    // Store contact event in localStorage
    try {
      const events = JSON.parse(localStorage.getItem('pasaloContactEvents') || '[]');
      events.push({
        method: method,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem('pasaloContactEvents', JSON.stringify(events));
    } catch (e) {
      console.warn('Could not track contact event:', e);
    }
  }

  // Get contact event statistics
  static getContactStats() {
    try {
      const events = JSON.parse(localStorage.getItem('pasaloContactEvents') || '[]');
      const stats = {};
      events.forEach(event => {
        stats[event.method] = (stats[event.method] || 0) + 1;
      });
      return stats;
    } catch (e) {
      return {};
    }
  }
}

// Auto-initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  new FloatingContactButtons();
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FloatingContactButtons;
}
