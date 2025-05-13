document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const searchInput = document.getElementById('search-input2');
  const autocompleteResults = document.getElementById('autocomplete-results');
  const searchResults = document.getElementById('search-results');
  const searchOverlay = document.getElementById('searchOverlay');
  const searchBtn = document.querySelector('.search-btn');
  const closeSearchBtn = document.getElementById('closeSearch');

  // Toggle search overlay
  searchBtn.addEventListener('click', () => {
    searchOverlay.style.display = 'flex';
    searchInput.focus();
    document.body.style.overflow = 'hidden'; // Prevent scrolling
  });

  closeSearchBtn.addEventListener('click', closeSearch);
  
  // Close search when clicking outside
  searchOverlay.addEventListener('click', (e) => {
    if (e.target === searchOverlay) {
      closeSearch();
    }
  });

  // Close search function
  function closeSearch() {
    searchOverlay.style.display = 'none';
    searchInput.value = '';
    autocompleteResults.style.display = 'none';
    searchResults.style.display = 'none';
    document.body.style.overflow = 'auto'; // Re-enable scrolling
  }

  // Debounce function
  function debounce(func, delay) {
    let timeout;
    return function() {
      const context = this;
      const args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), delay);
    };
  }

  // Fetch autocomplete suggestions
  const fetchSuggestions = debounce(async (term) => {
    if (term.length < 2) {
      autocompleteResults.style.display = 'none';
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/search?item=${encodeURIComponent(term)}`);
      if (!response.ok) throw new Error('Network response was not ok');
      
      const suggestions = await response.json();
      
      if (suggestions.length > 0) {
        autocompleteResults.innerHTML = suggestions.map(item => `
          <div class="autocomplete-item" data-sku="${item.SKU}">
            ${item.SKU} - ${item.name || item.description.substring(0, 50)}...
          </div>
        `).join('');
        autocompleteResults.style.display = 'block';
      } else {
        autocompleteResults.style.display = 'none';
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      autocompleteResults.style.display = 'none';
    }
  }, 300);

  // Perform full search
  const performSearch = debounce(async (term) => {
    if (term.length < 2) {
      searchResults.innerHTML = '';
      searchResults.style.display = 'none';
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/search/full?term=${encodeURIComponent(term)}`);
      if (!response.ok) throw new Error('Network response was not ok');
      
      const results = await response.json();
      
      searchResults.style.display = 'block';
      if (results.length > 0) {
        searchResults.innerHTML = results.map(item => `
          <div class="result-item" data-sku="${item.SKU}">
            <h3>${item.SKU} - ${item.name || 'Product'}</h3>
            <p>${item.description}</p>
            <p class="price">$${item.price?.toFixed(2) || 'N/A'}</p>
          </div>
        `).join('');
      } else {
        searchResults.innerHTML = '<div class="no-results">No products found matching your search</div>';
      }
    } catch (error) {
      console.error('Error performing search:', error);
      searchResults.innerHTML = '<div class="error-message">Error loading search results</div>';
      searchResults.style.display = 'block';
    }
  }, 500);

  // Event listeners
  searchInput.addEventListener('input', (e) => {
    const term = e.target.value.trim();
    fetchSuggestions(term);
    performSearch(term);
  });

  // Handle selection from autocomplete
  autocompleteResults.addEventListener('click', (e) => {
    if (e.target.classList.contains('autocomplete-item')) {
      searchInput.value = e.target.textContent.trim();
      autocompleteResults.style.display = 'none';
      performSearch(searchInput.value);
    }
  });

  // Handle selection from search results
  searchResults.addEventListener('click', (e) => {
    const resultItem = e.target.closest('.result-item');
    if (resultItem) {
      const sku = resultItem.dataset.sku;
      // Redirect to product page or perform action
      window.location.href = `/product?sku=${sku}`;
    }
  });

  // Handle Enter key
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      autocompleteResults.style.display = 'none';
      performSearch(searchInput.value.trim());
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeSearch();
    }
  });
});