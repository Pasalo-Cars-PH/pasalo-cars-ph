// Enhanced vehicle detail page functionality
class VehicleDetailPage {
  constructor() {
    this.init();
  }

  init() {
    this.setupContactTracking();
    this.setupShareButtons();
    this.setupImageGallery();
    this.setupRelatedVehicles();
  }

  setupContactTracking() {
    // Track contact button clicks with metadata
    const contactButtons = document.querySelectorAll('[data-contact-method]');
    contactButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const method = btn.dataset.contactMethod;
        const vehicleName = document.querySelector('h1')?.textContent || 'Unknown Vehicle';
        this.trackContactClick(method, vehicleName);
      });
    });
  }

  trackContactClick(method, vehicleName) {
    try {
      const events = JSON.parse(localStorage.getItem('pasaloDetailPageEvents') || '[]');
      events.push({
        type: 'contact_click',
        method: method,
        vehicle: vehicleName,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem('pasaloDetailPageEvents', JSON.stringify(events));
      
      // Send to analytics if available
      if (typeof gtag !== 'undefined') {
        gtag('event', 'vehicle_contact', {
          method: method,
          vehicle: vehicleName
        });
      }
    } catch (e) {
      console.warn('Could not track contact click:', e);
    }
  }

  setupShareButtons() {
    const shareButtons = document.querySelectorAll('[data-share-platform]');
    shareButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const platform = btn.dataset.sharePlatform;
        const url = window.location.href;
        const title = document.querySelector('h1')?.textContent || 'Pasalo Cars PH';
        this.shareVehicle(platform, url, title);
      });
    });
  }

  shareVehicle(platform, url, title) {
    let shareUrl = '';
    switch(platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`;
        break;
      case 'viber':
        shareUrl = `viber://forward?text=${encodeURIComponent(title + ' ' + url)}`;
        break;
    }
    if (shareUrl) window.open(shareUrl, '_blank');
  }

  setupImageGallery() {
    const galleryImages = document.querySelectorAll('[data-gallery-image]');
    const mainImage = document.querySelector('[data-main-image]');
    
    if (mainImage && galleryImages.length > 0) {
      galleryImages.forEach((img, index) => {
        img.addEventListener('click', () => {
          mainImage.src = img.src;
          mainImage.alt = img.alt;
          
          // Update active state
          galleryImages.forEach(i => i.classList.remove('active'));
          img.classList.add('active');
        });
      });
    }
  }

  setupRelatedVehicles() {
    // Load and display related vehicles from data
    const vehicleType = document.querySelector('[data-vehicle-type]')?.textContent;
    const vehicleBrand = document.querySelector('[data-vehicle-brand]')?.textContent;
    
    if (vehicleType && vehicleBrand) {
      this.displayRelatedVehicles(vehicleType, vehicleBrand);
    }
  }

  displayRelatedVehicles(type, brand) {
    const relatedContainer = document.getElementById('relatedVehicles');
    if (!relatedContainer || typeof vehiclesData === 'undefined') return;

    const related = vehiclesData.filter(v => 
      (v.type === type || v.brand === brand) && 
      v.name !== document.querySelector('h1')?.textContent
    ).slice(0, 3);

    if (related.length > 0) {
      relatedContainer.innerHTML = related.map(v => `
        <div class="featured-card">
          <div class="verified-badge">✓ Verified</div>
          <img src="${v.image}" alt="${v.name}" loading="lazy">
          <div class="featured-card-body">
            <span class="type">${v.type}</span>
            <h3><a href="${v.detailsUrl}">${v.name}</a></h3>
            <p class="featured-price">₱${v.price.toLocaleString()}/mo</p>
            <a href="${v.detailsUrl}">View Details →</a>
          </div>
        </div>
      `).join('');
    }
  }

  // Get detail page analytics
  static getDetailPageStats() {
    try {
      const events = JSON.parse(localStorage.getItem('pasaloDetailPageEvents') || '[]');
      const stats = { total: events.length, byMethod: {}, byVehicle: {} };
      events.forEach(event => {
        stats.byMethod[event.method] = (stats.byMethod[event.method] || 0) + 1;
        stats.byVehicle[event.vehicle] = (stats.byVehicle[event.vehicle] || 0) + 1;
      });
      return stats;
    } catch (e) {
      return { total: 0, byMethod: {}, byVehicle: {} };
    }
  }
}

// Auto-initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  new VehicleDetailPage();
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = VehicleDetailPage;
}
