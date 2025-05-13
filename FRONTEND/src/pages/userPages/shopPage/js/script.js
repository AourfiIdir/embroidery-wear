let searchBtn = document.querySelector('.search-btn');
let closeBtn = document.querySelector('.close-btn');
let searchBox = document.querySelector('.search-box');

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
document.addEventListener('DOMContentLoaded', function () {
    // Get the current page from the URL
    const currentPage = window.location.pathname.split('/').pop();

    // Select all buttons in the group
    const buttons = document.querySelectorAll('.btn-group .btn');

    // Loop through buttons
    buttons.forEach(button => {
        const buttonHref = button.getAttribute('href').split('/').pop();

        // Remove the active class from all buttons
        button.classList.remove('active-btn');

        // Add the active class to the button matching the current page
        if (buttonHref === currentPage) {
            button.classList.add('active-btn');
        }
    });
});