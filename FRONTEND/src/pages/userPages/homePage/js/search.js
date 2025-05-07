// public/script.js
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input2');
    const autocompleteResults = document.getElementById('autocomplete-results');
    const searchResults = document.getElementById('search-results');
    const submitBtn = document.getElementById('submit');

    // Debounce function to limit API calls
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
        const response = await fetch(`http://localhost:3000/search?item=${encodeURIComponent(term)}`)
        const suggestions = await response.json();
        if (suggestions.length > 0) {
          autocompleteResults.innerHTML = suggestions.map(iteme =>
            `<div class="autocomplete-item">${iteme.SKU}</div>`
          ).join('');
          autocompleteResults.style.display = 'block';
        } else {
          autocompleteResults.style.display = 'none';
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      }
    }, 300);
  
    // Perform full search
    const performSearch = debounce(async (term) => {
      if (term.length < 2) {
        searchResults.innerHTML = '';
        return;
      }
  
      try {
        const response = await fetch(`http://localhost:3000/search/full?term=${encodeURIComponent(term)}`);
        const results = await response.json();
        
        if (results.length > 0) {
          searchResults.innerHTML = results.map(item => `
            <div class="result-item">
              <h3>${item.SKU}</h3>
              <p>${item.description}</p>
            </div>
          `).join('');
        } else {
          searchResults.innerHTML = '<p>No results found</p>';
        }
      } catch (error) {
        console.error('Error performing search:', error);
        searchResults.innerHTML = '<p>Error performing search</p>';
      }
    }, 500);
  
    // Event listeners
    searchInput.addEventListener('input', (e) => {
      const term = e.target.value.trim();
      fetchSuggestions(term);
      performSearch(term);
    });
  
    autocompleteResults.addEventListener('click', (e) => {
      if (e.target.classList.contains('autocomplete-item')) {
        searchInput.value = e.target.textContent;
        autocompleteResults.style.display = 'none';
        performSearch(searchInput.value);
      }
    });
  
    // Hide autocomplete when clicking outside
    document.addEventListener('click', (e) => {
      if (e.target !== searchInput) {
        autocompleteResults.style.display = 'none';
      }
    });

    submitBtn.addEventListener('click',()=>{
        const item  = searchInput.value;
        // make a request to get all the data of this item or get the category ....?
        
    })
  });