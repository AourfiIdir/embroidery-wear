// Function to check login status
function checkAuthStatus() {
    const authSection = document.getElementById('auth-section');
    const token = localStorage.getItem('token');
    
    if (token) {
      // User is logged in - show logout button
      authSection.innerHTML = `
        <button class="nav-link logout-btn" style="background: none; border: none; cursor: pointer;">
          <i class="bx bx-log-out"></i>
        </button>
      `;
      
      // Add logout functionality
      document.querySelector('.logout-btn')?.addEventListener('click', logout);
    } else {
      // User is not logged in - show login/register link
      authSection.innerHTML = `
        <a class="nav-link"  href="/FRONTEND/src/pages/userPages/AccountPage/index.html">
          <i class="bx bx-user"></i>
        </a>
      `;
    }
  }
  
  // Logout function
  function logout() {
    // Remove token and user data from localStorage
    localStorage.removeItem('token');
    
    // Redirect to home page or refresh
    window.location.href = '/FRONTEND/src/pages/userPages/homePage/index.html'; // or location.reload();
  }
  
  // Check auth status when page loads
  document.addEventListener('DOMContentLoaded', checkAuthStatus);
  
  // Also check when navigating between pages (in case of SPA)
  window.addEventListener('storage', function(event) {
    if (event.key === 'token') {
      checkAuthStatus();
    }
  });