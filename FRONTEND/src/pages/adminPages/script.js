// Récupération des éléments du formulaire avec getElementById
const nomInput = document.getElementById('nom');
const descriptionInput = document.getElementById('description');
const prixInput = document.getElementById('prix');
const promoInput = document.getElementById('promo');
const quantiteInput = document.getElementById('quantite');
const categorieSelect = document.getElementById('categorie');
const photoInput = document.getElementById('photo');
const submitButton = document.querySelector('button[type="submit"]'); // ici querySelector car pas d'id
const addIcon = document.querySelector(".add");

window.addEventListener("DOMContentLoaded", function () {
  const token = LocalStorage.getItem("token");
  if(token){
    //display the 
  }
})


/*c'est poue la nav bar*/
let searchBtn = document.querySelector('.search-btn');
let closeBtn = document.querySelector('.close-btn');
let searchBox = document.querySelector('.search-container');

// Fonctions pour augmenter ou diminuer la quantité
function increaseQuantity() {
  let current = parseInt(quantiteInput.value);
  quantiteInput.value = current + 1;
}

function decreaseQuantity() {
  let current = parseInt(quantiteInput.value);
  if (current > 1) {
    quantiteInput.value = current - 1;
  }
}

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









/*
end point to check if a user is an admin or not*

app.get("/isAdmin",userAuth,(req,res)=>{
  const clientId = user.id;
  
})
*/