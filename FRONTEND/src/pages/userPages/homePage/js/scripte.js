let searchBtn = document.querySelector('.search-btn');
let closeBtn = document.querySelector('.close-btn');
let searchBox = document.querySelector('.search-container');

searchBtn.onclick = function(){
  searchBox.classList.add('active');
  closeBtn.classList.add('active');
  searchBtn.classList.add('active');
}

closeBtn.onclick = function(){
  searchBox.classList.remove('active');
  closeBtn.classList.remove('active');
  searchBtn.classList.remove('active');
}

let closeBtnSmall = document.querySelector('.close-btn3'); 
let searchBtnSmall = document.querySelector('.search-btn3');

searchBtnSmall.onclick = function(){
  searchBox.classList.add('active');
  closeBtnSmall.classList.add('active');
  searchBtnSmall.classList.add('active');
}

closeBtnSmall.onclick = function(){
  searchBox.classList.remove('active');
  closeBtnSmall.classList.remove('active');
  searchBtnSmall.classList.remove('active');
}


document.addEventListener('DOMContentLoaded', async function() {
  const addIcon = document.getElementById('admin-add-icon');
  
  // Hide by default (until we verify admin status)
  addIcon.style.display = 'none';

  const token = localStorage.getItem('token');
  if (!token) return; // Not logged in → keep hidden
  try {
    const response = await fetch('http://localhost:5000/isAdmin', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) throw new Error("Not an admin");
    
    const { isAdmin } = await response.json();
    
    if (isAdmin) {
      addIcon.style.display = 'block'; // Show if admin
      addIcon.querySelector('i').style.visibility = 'visible';
      addIcon.querySelector('i').style.opacity = '1';
    }
  } catch (error) {
    console.error("Admin check failed:", error);
    addIcon.style.display = 'none'; // Ensure hidden on error
  }
})


document.addEventListener('DOMContentLoaded', async function() {
  const removeIcon = document.getElementById('admin-remove-icon');
  
  // Hide by default (until we verify admin status)
  removeIcon.style.display = 'none';

  const token = localStorage.getItem('token');
  if (!token) return; // Not logged in → keep hidden
  try {
    const response = await fetch('http://localhost:5000/isAdmin', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) throw new Error("Not an admin");
    
    const { isAdmin } = await response.json();
    
    if (isAdmin) {
      removeIcon.style.display = 'block'; // Show if admin
      removeIcon.querySelector('i').style.visibility = 'visible';
      removeIcon.querySelector('i').style.opacity = '1';
    }
  } catch (error) {
    console.error("Admin check failed:", error);
    removeIcon.style.display = 'none'; // Ensure hidden on error
  }
})