

const suivant = document.getElementById("suivBtn");
if(!suivant){
    alert("suivant not found");
}
async function register() {
    // Get form values
    const registeremail = document.getElementById('emailRegister').value.trim();
    const registerpassword = document.getElementById('passwordRegister').value.trim();
    const registerfirstname = document.getElementById('nomRegister').value.trim();
    const registerlastname = document.getElementById('prenomRegister').value.trim();

    // Validate inputs
    if (!registeremail || !registerpassword || !registerfirstname || !registerlastname) {
        alert("All fields are required");
        return;
    }

    // Optional: Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(registeremail)) {
        alert("Please enter a valid email address");
        return;
    }

    // Optional: Validate password strength
    if (registerpassword.length < 8) {
        alert("Password must be at least 8 characters long");
        return;
    }

    try {
        // Send POST request to the server
        const response = await fetch('http://localhost:3000/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                first_name: registerfirstname,
                last_name: registerlastname,
                email: registeremail,
                password: registerpassword, // Ensure the server hashes this
            })
        });

        // Handle response
        if (!response.ok) {
            const errorData = await response.json();
            alert(errorData.error || "Registration failed. Please try again.");
            return;
        }

        const data = await response.json();
        alert(data.message || "Registration successful!");

        // Update UI for next step (e.g., multi-step form)
        suivant.setAttribute("data-bs-target", "#register2");
    } catch (error) {
        console.error('Error:', error);
        alert("An error occurred during registration. Please try again.");
    }
}
//login


const emailLogin = document.getElementById('emailLogin').value;
const passwordLogin = document.getElementById('passwordLogin').value;

async function login() {
    //make a post request to the server
    //the server checks the presence of the user in the database
    //if the user is found, the server sends back a token
    const emailLogin = document.getElementById('emailLogin').value;
    const passwordLogin = document.getElementById('passwordLogin').value;
    const passwordLogin2 = String(passwordLogin); //possible error
    if(!emailLogin || !passwordLogin2){
        alert("All fields are required");
        return;
    }
    try{
        const response = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: emailLogin, password: passwordLogin2 })
        });
    
        if (!response.ok) {
            const message = await response.text();
            alert(message);
            return;
        }
    }catch(error){
        console.log(error);
        alert(error);
    }
    
    //return the token
    const data = await response.json();
    localStorage.setItem('token', data.token);//save the token in the local storage
    localStorage.setItem('user', data.userid);//save the user id in the local storage
    alert("Login successful");


}

//adress shipement
async function ShipementRegister() {
    const selectCountry = document.getElementById('inputCountrySelect');
    const selectCity = document.getElementById('inputCitySelect');
    const selectState = document.getElementById('inputStateSelect');

    const selectedOptionCountry = selectCountry.options[selectCountry.selectedIndex].text;
    const selectedOptionState = selectState.options[selectState.selectedIndex].text;
    const selectedOptionCity = selectCity.options[selectCity.selectedIndex].text;

    const adress = document.getElementById("textShipementRegister").value;
    const zipCode = document.getElementById("zipCode").value;

    if (!adress || !zipCode || !selectedOptionCountry || !selectedOptionState || !selectedOptionCity) {
        alert("All fields are required");
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/Shipment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                address: adress,
                country: selectedOptionCountry,
                city: selectedOptionCity,
                state: selectedOptionState,
                zip_code: zipCode
            })
        });

        if (!response.ok) {
            const message = await response.json();
            alert(message.error);
            return;
        }

        const data = await response.json();
        alert(data.message);
        setUi();
    } catch (error) {
        console.error('Error:', error);
        alert("An error occurred during shipment registration");
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUi();
}

function setUi() {
    const token = localStorage.getItem('token');

    const logindiv = document.getElementById('loginDiv');
    const logoutdiv = document.getElementById('logoutDiv');
    if (token) {
        logoutdiv.style.display = 'block';
        logindiv.style.display = 'none';
    } else {
        logindiv.style.display = 'block';
        logoutdiv.style.display = 'none';
    }
}
function logout(){
    localStorage.removeItem('token');
    localStorage.removeItem('userid');
    setUi();
}

//fucntion to display logout or the login
function setUi(){
    const token = localStorage.getItem.token;

    const logindiv = document.getElementById('loginDiv');
    const logoutdiv = document.getElementById('logoutDiv');
    if(token){
        logoutdiv.style.display='block';
        logindiv.style.display='none';
    } 
    else{
        logindiv.style.display='block';
        logoutdiv.style.display='none';
    }

}