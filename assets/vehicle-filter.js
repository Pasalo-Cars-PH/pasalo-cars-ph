// Search and filter functionality for vehicle listings
class VehicleFilter {
  constructor(vehiclesData, containerId) {
    this.vehicles = vehiclesData;
    this.containerId = containerId;
    this.filteredVehicles = [...vehiclesData];
    this.currentFilters = {
      searchTerm: '',
      brand: '',
      type: '',
      priceRange: [0, 150000],
      category: ''
    };
  }

  // Initialize search bar and filters
  init() {
    this.setupEventListeners();
    this.render();
  }

  setupEventListeners() {
    // Search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
    }

    // Filter selects
    const brandFilter = document.getElementById('brandFilter');
    if (brandFilter) {
      brandFilter.addEventListener('change', (e) => this.handleFilterChange('brand', e.target.value));
    }

    const typeFilter = document.getElementById('typeFilter');
    if (typeFilter) {
      typeFilter.addEventListener('change', (e) => this.handleFilterChange('type', e.target.value));
    }

    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
      categoryFilter.addEventListener('change', (e) => this.handleFilterChange('category', e.target.value));
    }

    const priceRange = document.getElementById('priceRange');
    if (priceRange) {
      priceRange.addEventListener('input', (e) => this.handlePriceChange(e.target.value));
    }

    // Reset filters button
    const resetBtn = document.getElementById('resetFilters');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.resetFilters());
    }
  }

  handleSearch(term) {
    this.currentFilters.searchTerm = term.toLowerCase();
    this.applyFilters();
  }

  handleFilterChange(filterType, value) {
    this.currentFilters[filterType] = value;
    this.applyFilters();
  }

  handlePriceChange(value) {
    this.currentFilters.priceRange = [0, parseInt(value)];
    this.applyFilters();
  }

  applyFilters() {
    this.filteredVehicles = this.vehicles.filter(vehicle => {
      // Search term filter
      if (this.currentFilters.searchTerm) {
        const term = this.currentFilters.searchTerm;
        const matchesSearch = 
          vehicle.name.toLowerCase().includes(term) ||
          vehicle.brand.toLowerCase().includes(term) ||
          vehicle.type.toLowerCase().includes(term) ||
          vehicle.tags.some(tag => tag.toLowerCase().includes(term));
        if (!matchesSearch) return false;
      }

      // Brand filter
      if (this.currentFilters.brand && vehicle.brand !== this.currentFilters.brand) {
        return false;
      }

      // Type filter
      if (this.currentFilters.type && vehicle.type !== this.currentFilters.type) {
        return false;
      }

      // Price range filter
      const [minPrice, maxPrice] = this.currentFilters.priceRange;
      if (vehicle.price < minPrice || vehicle.price > maxPrice) {
        return false;
      }

      // Category filter (pasalo or new)
      if (this.currentFilters.category && vehicle.category !== this.currentFilters.category) {
        return false;
      }

      return true;
    });

    this.render();
  }

  resetFilters() {
    this.currentFilters = {
      searchTerm: '',
      brand: '',
      type: '',
      priceRange: [0, 150000],
      category: ''
    };

    // Reset form inputs
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = '';
    
    const brandFilter = document.getElementById('brandFilter');
    if (brandFilter) brandFilter.value = '';
    
    const typeFilter = document.getElementById('typeFilter');
    if (typeFilter) typeFilter.value = '';
    
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) categoryFilter.value = '';
    
    const priceRange = document.getElementById('priceRange');
    if (priceRange) priceRange.value = 150000;

    this.filteredVehicles = [...this.vehicles];
    this.render();
  }

  render() {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    // Show result count
    const resultCount = document.getElementById('resultCount');
    if (resultCount) {
      resultCount.textContent = `${this.filteredVehicles.length} vehicle${this.filteredVehicles.length !== 1 ? 's' : ''} found`;
    }

    // Show no results message
    if (this.filteredVehicles.length === 0) {
      container.innerHTML = '<div class="no-results"><p>No vehicles match your search criteria. Try adjusting your filters.</p></div>';
      return;
    }

    // Render vehicle cards
    container.innerHTML = this.filteredVehicles.map(vehicle => this.createVehicleCard(vehicle)).join('');
  }

  createVehicleCard(vehicle) {
    const statusClass = vehicle.status === 'available' ? '' : 'is-sold';
    const soldStamp = vehicle.status !== 'available' ? '<div class="sold-stamp">SOLD</div>' : '';
    
    return `
      <div class="unit-card ${statusClass}">
        <div class="verified-badge">✓ Verified</div>
        <div class="unit-tag marker">${vehicle.category === 'new' ? 'NEW' : 'PASALO'}</div>
        <img class="unit-photo" src="${vehicle.image}" alt="${vehicle.name}" loading="lazy">
        ${soldStamp}
        <h3><a href="${vehicle.detailsUrl}">${vehicle.name}</a></h3>
        <p class="spec">${vehicle.type}</p>
        <p class="unit-meta">${vehicle.year}</p>
        <div class="unit-price">
          <span class="amount">₱${vehicle.price.toLocaleString()}</span>
          <span class="bank">/mo</span>
        </div>
        <p class="unit-terms">${vehicle.term}</p>
        <div class="unit-chips">
          ${vehicle.tags.map(tag => `<span class="unit-chip">${tag}</span>`).join('')}
        </div>
        <p class="unit-location">${vehicle.colors.join(', ')}</p>
        <a href="${vehicle.detailsUrl}" class="unit-cta">View Details →</a>
        <div class="contact-row">
          <a href="https://www.facebook.com/share/1KauhZnvHP/?mibextid=wwXIfr" target="_blank" rel="noopener" class="contact-btn" title="Message on Facebook">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          </a>
          <a href="viber://chat?number=+639950369117" class="contact-btn viber" title="Chat on Viber">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.6 0C5.2 0 0 4.8 0 10.8c0 2.8.8 5.2 2.4 7.2-1.2 4 1.6 6.8 4.8 5.6 1.2 0 4 1.2 8.4 1.2 6.4 0 11.6-4.8 11.6-10.8 0-6-5.2-10.8-11.6-10.8z"/></svg>
          </a>
          <a href="https://wa.me/639950369117" target="_blank" rel="noopener" class="contact-btn whatsapp" title="Chat on WhatsApp">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-4.782 1.146l-.335-.17-3.476.52.529 3.256-.224.356a9.9 9.9 0 00-.6 4.718c0 5.487 4.476 9.93 9.954 9.93a9.9 9.9 0 007.52-3.39l.333.067 3.449-.525-.532-3.255.231-.358a9.88 9.88 0 00.656-4.73c0-5.487-4.477-9.93-9.955-9.93Z"/></svg>
          </a>
        </div>
      </div>
    `;
  }

  // Get unique values for filter dropdowns
  getUniqueBrands() {
    return [...new Set(this.vehicles.map(v => v.brand))].sort();
  }

  getUniqueTypes() {
    return [...new Set(this.vehicles.map(v => v.type))].sort();
  }

  getCategories() {
    return [...new Set(this.vehicles.map(v => v.category))];
  }

  getMaxPrice() {
    return Math.max(...this.vehicles.map(v => v.price));
  }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = VehicleFilter;
}
