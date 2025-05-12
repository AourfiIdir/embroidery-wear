// DOM Elements
const submitButton = document.querySelector('button[type="submit"]');
const addIcon = document.querySelector(".add");
const searchBtn = document.querySelector('.search-btn');
const closeBtn = document.querySelector('.close-btn');
const searchBox = document.querySelector('.search-container');
const closeBtnSmall = document.querySelector('.close-btn3'); 
const searchBtnSmall = document.querySelector('.search-btn3');

// Form elements (moved outside for quantity functions to access)
const nomInput = document.getElementById('nom');
const descriptionInput = document.getElementById('description');
const prixInput = document.getElementById('prix');
const promoInput = document.getElementById('promo');
const quantiteInput = document.getElementById('quantite');
const categorieSelect = document.getElementById('categorie');
const photoInput = document.getElementById('photo');

// Quantity buttons (assuming they exist in your HTML)
const increaseBtn = document.querySelector('.increase-quantity');
const decreaseBtn = document.querySelector('.decrease-quantity');

// Check authentication on page load
window.addEventListener("DOMContentLoaded", function () {
  const token = localStorage.getItem("token");
  if(!token){
    // Redirect to login or show appropriate UI
    window.location.href = '/login.html';
  } else {
    // Any setup for authenticated users
    addIcon.style.display = 'block'; // Example: show add icon
  }
});

// Quantity functions
function increaseQuantity() {
  let current = parseInt(quantiteInput.value) || 0;
  quantiteInput.value = current + 1;
}

function decreaseQuantity() {
  let current = parseInt(quantiteInput.value) || 1;
  if (current > 1) {
    quantiteInput.value = current - 1;
  }
}

// Add event listeners for quantity buttons
if(increaseBtn && decreaseBtn) {
  increaseBtn.addEventListener('click', increaseQuantity);
  decreaseBtn.addEventListener('click', decreaseQuantity);
}

// Search functionality
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

// Form submission
submitButton.addEventListener('click', async (e) => {
  e.preventDefault(); // Prevent default form submission
  
  // Basic form validation
  if(!nomInput.value || !descriptionInput.value || !prixInput.value || !quantiteInput.value) {
    alert('Please fill in all required fields');
    return;
  }

  // Numeric validation
  if(isNaN(parseFloat(prixInput.value)) || isNaN(parseInt(quantiteInput.value))) {
    alert('Price and Quantity must be numbers');
    return;
  }

  const token = localStorage.getItem("token");
  if(!token) {
    alert('Please login to add products');
    window.location.href = '/login.html';
    return;
  }

  try {
    const formData = {
      productName: nomInput.value.trim(),
      description: descriptionInput.value.trim(),
      price: parseFloat(prixInput.value),
      promo: promoInput.value ? parseFloat(promoInput.value) : 0,
      quantity: parseInt(quantiteInput.value),
      categoryName: categorieSelect.value,
      image_path: photoInput.value // Note: For file uploads, you'd need different handling
    };

    const response = await fetch('http://localhost:5000/addProduct', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(formData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to add product');
    }

    if (data.success) {
      alert('Product added successfully!');
      // Reset form after successful submission
      document.querySelector('form').reset();
    } else {
      throw new Error(data.message || 'Unknown error occurred');
    }
  } catch (error) {
    console.error("Error adding product:", error);
    alert(`Error: ${error.message}`);
  }
});