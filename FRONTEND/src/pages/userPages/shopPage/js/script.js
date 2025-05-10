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