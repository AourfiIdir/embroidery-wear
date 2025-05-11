const container = document.querySelector('.container');
const registerBtn = document.querySelector('.register-btn');
const loginBtn = document.querySelector('.login-btn');
const nextBtn = document.querySelector('.next-btn');
const sregister = document.querySelector('.Sregister');
const iconclose = document.querySelector('.iconClose');
const register = document.querySelector('.register'); 
const login = document.querySelector('.login');
const stateSelect = document.getElementById("stateSelect");
const citySelect = document.getElementById("citySelect");

// Button references corrected
const btnRegister = document.querySelector('.registBtn');
const btnLogin = document.querySelector('.loginBtn');

// State-city mapping (keep your existing mapping)
const stateCityMap = {
  "01": ["Adrar","Akabli","Aougrout","Aoulef","Bouda","Charouine","Deldoul","Fenoughil","In Zghmir","Ksar Kaddour","Metarfa","Ouled Ahmed Tammi","Reggane","Sali","Sebaa","Tamantit","Tamest","Tamekten","Timimoun","Tit","Tsabit","Zaouiet Kounta"],
  // ... keep your existing state-city mapping
};

// Next button click handler
nextBtn.addEventListener('click', (event) => {
  event.preventDefault();
  sregister.classList.add('active');
  register.classList.add('active');
});

// Close button click handler
iconclose.addEventListener('click', (event) => {
  event.preventDefault();
  sregister.classList.remove('active');
  register.classList.remove('active');
});

// State selection change handler
stateSelect.addEventListener("change", function() {
  const selectedState = this.value;
  citySelect.innerHTML = '<option selected disabled value="">City</option>';

  if (stateCityMap[selectedState]) {
    citySelect.disabled = false;
    stateCityMap[selectedState].forEach(city => {
      const option = document.createElement("option");
      option.textContent = city;
      option.value = city;
      citySelect.appendChild(option);
    });
  } else {
    citySelect.disabled = true;
  }
});

// Form validation
(() => {
  'use strict'
  const forms = document.querySelectorAll('.needs-validation')
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault()
        event.stopPropagation()
      }
      form.classList.add('was-validated')
    }, false)
  })
})();

// Login button click handler
btnLogin?.addEventListener('click', async (event) => {
  event.preventDefault();
  container.classList.remove('active');
  login.classList.remove('active');
  sregister.classList.remove('active');
  register.classList.remove('active');
  
  const Iusername = document.querySelector('.Iusername');
  const IloginPass = document.querySelector('.IloginPass');

  if(!Iusername.value || !IloginPass.value){
    alert("All fields are required");
    return;
  }
  
  try {
    const response = await fetch('http://localhost:5000/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        email: Iusername.value, 
        password: IloginPass.value 
      })
    });
    
    if (!response.ok) {
      const message = await response.text();
      alert(message);
      return;
    }
    
    const data = await response.json();
    localStorage.setItem('token', data.token);
    alert("Login successful");
    window.location.href = "/FRONTEND/src/pages/userPages/welcomePage/welcom.html";
    
  } catch(error) {
    console.error(error);
    alert("An error occurred during login.");
  }
});

// Register button click handler
btnRegister?.addEventListener('click', async (event) => {
  event.preventDefault();
  
  const IfirstName = document.querySelector('.IfirstName');
  const IlastName = document.querySelector('.IlastName');
  const Iemail = document.querySelector('.Iemail');
  const IregistPass = document.querySelector('.IregistPass');
  const Iadmin = document.querySelector('.Iadmin');
  const Iadr = document.querySelector('.Iadr');
  const Sstate = document.getElementById('stateSelect');
  const Scity = document.getElementById('citySelect');
  const Izip = document.querySelector('.Izip');

  if(!IfirstName.value || !IlastName.value || !Iemail.value || !IregistPass.value || !Iadr.value || !Sstate.value || !Scity.value || !Izip.value){
    alert("All fields are required");
    return;
  }
  
  try {
    const response = await fetch('http://localhost:5000/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        firstName: IfirstName.value,
        lastName: IlastName.value,
        email: Iemail.value,
        password: IregistPass.value,
        admin: Iadmin?.value || '',
        adr: Iadr.value,
        state: Sstate.value,
        city: Scity.value,
        zip: Izip.value
      })
    });
    
    if(!response.ok) {
      const message = await response.text();
      alert(message);
      return;
    }
    
    const data = await response.json();
    if(data.error) {
      alert(data.error);
      return;
    }
    
    alert("Registration successful");
    container.classList.add('active');
    window.location.href = "/FRONTEND/src/pages/userPages/homePage/index.html";
    
  } catch(error) {
    console.error(error);
    alert("An error occurred during registration.");
  }
});

// Toggle between login and register forms
registerBtn?.addEventListener('click', () => {
  container.classList.add('active');
});

loginBtn?.addEventListener('click', () => {
  container.classList.remove('active');
});

// Reset form on page load
window.addEventListener("DOMContentLoaded", function() {
  if (stateSelect) {
    stateSelect.selectedIndex = 0;
  }
  if (citySelect) {
    citySelect.selectedIndex = 0;
  }
});