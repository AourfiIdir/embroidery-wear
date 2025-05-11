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
  "02": ["Abou El Hassan","Aïn Merane","Beni Bouateb","Beni Haoua","Boukadir","Bouzeghaia","Breira","Chlef","Dahra","El Hadjadj","El Karimia","Harchoun","Herenfa","Labiod Medjadja","Moussadek","Oued Fodda","Oued Sly","Ouled Abbes","Ouled Ben Abdelkader","Oum Drou","Sendjas","Sidi Abderrahmane","Sidi Akkacha","Sobha","Talassa","Tadjena","Ténès","Zeboudja"],
  
  "03": ["Aflou","Aïn Madhi","Beidha","Benacer Benchohra","Brida","El Assafia","El Ghicha","El Haouaita","Gueltat Sidi Saâd","Hadj Mechri","Hassi Delaâ","Hassi R'Mel","Ksar El Hirane","Laghouat","Oued Morra","Sebgag","Sidi Bouzid","Sidi Makhlouf","Taouiala","Tadjmout","Tadjrouna"],
  
  "04": ["Aïn Babouche","Aïn Beïda","Aïn Diss","Aïn Fakroun","Aïn Kercha","Behir Chergui","Berriche","Bir Chouhada","Dhalaa","El Amiria","El Belala","El Djazia","Fkirina","Ksar Sbahi","Meskiana","Oued Nini","Ouled Gacem","Ouled Hamla","Ouled Zouaï","Oum El Bouaghi","Sigus","Souk Naamane","Zorg","El Fedjoudj Boughrara Saïd"],
  "05": ["Batna","Arris","Tazoult","Merouana","Barika","N'Gaous","El Madher","Aïn Touta","Djezzar","Timgad"],
  "06": ["Adekar","laazib","cite mama","les pawpaw","Béjaïa","Amizour","Akbou","Sidi Aïch","Barbacha","Kendira","Ighil Ali","Souk El Ténine","Tazmalt","Timezrit"],
  "07": ["Biskra","Tolga","Ourlal","El Kantara","Zeribet El Oued","Foughala","Lioua","Méchouneche","Sidi Okba","El Haouch"],
  "08": ["Béchar", "El Ouata", "Béni Abbès", "Mechria", "Ksar El Hirane", "Kerzaz", "Igli", "Tombouctou", "Taghit", "Boudjima"],
  "09": ["Blida", "El Affroun", "Bouinan", "Chiffa", "Bordj Menaïel", "Ouled Yaïch", "Bougara", "Sidi Moussa", "Mouzaïa", "Aïn Romana"],
  "10": ["Bouira", "M'Sila", "Lakhdaria", "Aïn Bessam", "Kadiria", "El Adjiba", "Timezrit", "Thénia", "Draa Ben Khedda", "Boudouaou"],
  "11": ["Tamanrasset", "In Salah", "In Guezzam", "Djanet", "Tazrouk", "Tamanrasset Ville", "Tamgounssi", "Ain Amguel", "Tinzaouatine", "Assamakka"],
  "12": ["Tébessa", "El Ogla", "El Hamla", "Ksar El Boukhari", "Aïn Taya", "Tebessa Ville", "Aïn Kermes", "El Maadid", "Tazoult", "Sidi Merouane"],
  "13": ["Tlemcen", "Maghnia", "Sidi Bel Abbes", "Boudouaou", "Hennaya", "Béni Snous", "Aïn Fezza", "Chetouane", "Ouled Mimoune", "El Aricha"],
  "14": ["Tiaret", "Frenda", "Mennoudj", "Aïn Kermes", "Tiberguent", "Ouled Mimoun", "Sidi Slimane", "Aïn Defla", "Mechraa Belksiri", "Boudouaou"],
  "15": ["Tizi Ouzou", "Iferhounene", "Azazga", "Draa El Mizan", "Ouaguenoun", "Amizour", "Maatkas", "Boudouaou", "Boumerdes", "Mekla"],
  "16": ["Alger", "El Harrach", "Bir Mourad Raïs", "Baraki", "Kouba", "Birkhadem", "Chéraga", "Hussein Dey", "Belouizdad", "El Madania"],
  "17": ["Djelfa", "El Idrissia", "Messaad", "Hassi Bahbah", "Birine", "Brahim", "Moudjbara", "Aïn Chouhada", "Ksar El Boukhari", "Boudouaou"],
  "18": ["Jijel", "Ziama Mansouriah", "El Aouana", "Taher", "Salah Bey", "Boudouaou", "Tazmalt", "Koudiet Ben Ziane", "Sidi Abdelaziz", "Boudouaou"],
  "19": ["Sétif", "El Eulma", "Aïn Arnat", "M'lili", "Bir El Arch", "Aïn El Kebira", "Bordj Bou Arreridj", "Guentis", "Beni Fouda", "Setif"],
  "20": ["Saïda", "Tébessa", "Sidi Bouzid", "Aïn Skhouna", "Aïn El Hadjar", "Djemaa", "Ghriss", "Aïn Hachlaf", "Moulay Slissen", "Ouled Djellal"],
  "21": ["Skikda", "Collo", "El Harrouch", "Azzaba", "El Melah", "Tamalous", "Sidi Mezghiche", "Boudouaou", "Aïn Zouit", "Ouled Djelal"],
  "22": ["Sidi Bel Abbès", "Tlemcen", "Aïn Témouchent", "Aïn Guellal", "Bir El Djir", "Moulay Slissen", "Messaoudi", "Sidi Brahim", "Madrassa", "Maassara"],
  "23": ["Annaba", "El Hadjar", "Azzaba", "Berrahal", "Seraïdi", "Chétaïbi", "Rabah", "El Bouni", "Khalouia", "Oued El Aneb"],
  "24": ["Guelma", "Aïn Beïda", "Mellala", "El Tarf", "Boukhadra", "El Mahmal", "Tadmaït", "Zanaoua", "Boudouaou", "Oued Zenati"],
  "25": ["Constantine", "Hamma Bouziane", "Ali Mendjeli", "Zighoud Youcef", "El Khroub", "Boudouaou", "Bir El Djir", "Aïn Abid", "Oued S’goun", "Ouled Aïssa"],
  "26": ["Médéa", "Tizi", "Oued El Alleug", "Hassiane", "Aïn Bouchekif", "Zeribet El Oued", "El Khemis", "El Abadia", "Oued Maachou", "Sidi Lamine"],
  "27": ["Mostaganem", "Aïn Tedles", "Kheïra", "Sirat", "Aïn Nouissy", "Khalouia", "Djenane El Abed", "Hassi Mameche", "Sidi Lakhdar", "Moulay Slissen"],
  "28": ["M’Sila", "Mekhadma", "Aïn El Hadjar", "Dahmouni", "Oum El Khelil", "Sidi Aïssa", "Sidi Slimane", "Boudouaou", "Chorfa", "Tighanimine"],
  "29": ["Mascara", "El Bordj", "Oued El Abtal", "Boudoua", "Tizi", "Sidi Ali", "El Hassi", "Chehata", "Hassi El Ghella", "Foughala"],
  "30": ["Ouargla", "El Guerrara", "Hassi Messaoud", "Tamerna", "Sidi Khouiled", "Ouled Moumen", "Hassi Ben Abdellah", "M'rara", "Sidi Azzouz", "Oued N'sara"],
  "31": ["Oran", "Aïn El Turck", "Bethioua", "Es-Sénia", "Mers El Kébir", "Bir El Djir", "Oued Tlelat", "Hassi Ben Okba", "Chlef", "Sidi Chami"],
  "32": ["El Bayadh", "Bouira", "Mekmen Ben Amar", "Tagdempt", "Ain Khadra", "Sidi Belaid", "Boujdaria", "Bordj Ben El Mokrane", "Ouled Djellal", "El M'Ghair"],
  "33": ["Illizi", "Djanet", "In Salah", "In Guezzam", "Tamanrasset", "El Oueldja", "Oued Chaaba", "Oum El Assel", "Bir El Ater", "Hassi Oum El Djell"],
  "34": ["Bordj Bou Arreridj", "Aïn Tini", "Khazra", "Sidi Maamar", "Toudja", "Bordj El Kiffan", "El Hadjar", "Sidi Brahim", "El Oued", "Oued Ghadra"],
  "35": ["Boumerdès", "Zemmouri", "Boudouaou", "Aïn Taya", "Bordj Menaïel", "Thénia", "Tizi Ouzou", "Khemis El Khechna", "Médéa", "Bordj El Kiffan"],
  "36": ["El Tarf", "Miliyana", "Bordj Bou Arreridj", "Chebaita Mokhtar", "Oum El Bouaghi", "Skikda", "Béjaïa", "Tizi Ouzou", "Annaba", "Sétif"],
  "37": ["Tindouf", "Sidi Bel Abbes", "Ouled Djellal", "Ain Salah", "Touggourt", "M'Sila", "Ghardaïa", "Béchar", "Tamanrasset", "Alger"],
  "38": ["Tissemsilt", "Lamdah", "Sidi Ali", "Guertoufa", "Boudouaou", "Bir El Djir", "Aïn El Hadj", "Sidi Rahal", "Ksar El Boukhari", "M'Daourouch"],
  "39": ["El Oued", "M'Cheria", "Aïn Beida", "Oum El Toub", "Moudjbara", "Mechria", "M'sila", "Sidi Okba", "Hassi Messaoud", "Aïn Ziane"],
  "40": ["Khenchela", "Chechar", "Arris", "Sidi Aïssa", "Tadjma", "Oum El Araïs", "Mekhadma", "Oum Drou", "Ain Djasser", "Boudouaou"],
  "41": ["Souk Ahras", "Daira", "Aïn Zana", "Aïn Oussera", "Boudouaou", "Tebessa", "Bir El Djir", "Tebaa", "Mekhadma", "Oued Rhiou"],
  "42": ["Tipaza", "Boudouaou", "Chlef", "Aïn Defla", "El Harrach", "Boumerdes", "Ain Sidi Djelil", "Bouira", "Djelfa", "Sidi Okba"],
  "43": ["Mila", "Timgad", "Aïn El Hadj", "Mekhadma", "El Djem", "Mers El Kébir", "Tissemsilt", "Aïn Azel", "Guelma", "Oued Fodda"],
  "44": ["Aïn Defla", "Khemis Miliana", "El Khroub", "Bordj Bou Arreridj", "Djenane El Abed", "Bouira", "M'sila", "Chlef", "Oued Sly", "Oum El Bouaghi"],
  "45": ["Naâma", "Mognia", "Oued Lahr", "Aïn Soltane", "Bechar", "Tindouf", "Béchar", "Bordj Bou Arreridj", "Sidi Bel Abbès", "Biskra"],
  "46": ["Aïn Témouchent", "Sidi Bel Abbès", "Mostaganem", "Oran", "Tlemcen", "Ain Temouchent", "Relizane", "Khenchela", "Béchar", "El Bayadh"],
  "47": ["Ghardaïa", "El M'Ghair", "Berriane", "Metlili", "Ouargla", "Bordj Bou Arreridj", "Ouled Djellal", "M'sila", "Biskra", "El Menia"],
  "48": ["Relizane", "Mouzaïa", "Tiaret", "Sidi Bel Abbès", "Chlef", "Tlemcen", "Mostaganem", "Oran", "Béjaïa", "Batna"],
  "49": ["El M'Ghair", "Khenchela", "Tébessa", "El Ouled", "Ghardaïa", "M'sila", "Aïn Témouchent", "Sidi Bel Abbès", "Alger", "Tlemcen"],
  "50": ["El Menia", "M'sila", "Ghardaïa", "El Kheneg", "Ouargla", "In Salah", "Aïn Salah", "El Hassi", "Bordj Bou Arreridj", "Sidi Bel Abbès"],
  "51": ["Ouled Djellal", "Biskra", "Sétif", "Khenchela", "M'sila", "El Oued", "Tébessa", "Aïn Témouchent", "Batna", "Alger"],
  "52": ["Bordj Baji Mokhtar", "Ouargla", "In Guezzam", "Béchar", "El M'Ghair", "In Salah", "Tindouf", "El Menia", "Adrar", "Béni Abbès"],
  "53": ["Béni Abbès", "Mecheria", "Aïn Témouchent", "Tlemcen", "Aïn Defla", "Tiaret", "Chlef", "Oran", "Relizane", "Mascara"],
  "54": ["Timimoun", "Bordj Bou Arreridj", "Biskra", "Ghardaïa", "Ouargla", "Tebessa", "Laghouat", "Alger", "Setif", "Tizi Ouzou"],
  "55": ["Touggourt", "In Salah", "Khenchela", "Mila", "Guelma", "Oum El Bouaghi", "Médéa", "Skikda", "Jijel", "Sidi Bel Abbès"],
  "56": ["Djanet", "Bordj El Haouas", "Illizi", "Debdeb", "In Amenas", "Tassili N'Ajjer", "Idles", "Tihoubar", "Iherir", "Tamadjert"],
  "57": ["In Salah", "Foggaret Ezzoua", "Ain Salah", "Tidikelt", "Hassi Lahdjar", "El Ménia", "Tamanrasset", "Arak", "Tazrouk", "Idles"],
  "58": ["In Guezzam", "Tin Zaouatine", "Tamanrasset", "Idles", "Ain Guezzam", "Tazrouk", "Abalessa", "In Amguel", "Serouenout", "Outoul"],
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
        first_name: IfirstName.value,
        last_name: IlastName.value,
        email: Iemail.value,
        password: IregistPass.value,
        AdminCode: Iadmin?.value || '',
        address: Iadr.value,
        city: Scity.value,
        state: Sstate.value,
        zip_code: Izip.value
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

