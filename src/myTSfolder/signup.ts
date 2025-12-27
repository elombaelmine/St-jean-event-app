import { DataStore } from './models/model.js';

// 1. Select the HTML elements using the IDs from your HTML
const fullNameInput = document.getElementById('fullname') as HTMLInputElement;
const emailInput = document.getElementById('email') as HTMLInputElement;
const usernameInput = document.getElementById('username') as HTMLInputElement;
const passwordInput = document.getElementById('password') as HTMLInputElement;
const signUpButton = document.getElementById('submitsign-up') as HTMLButtonElement;


// refreshing the page
// This ensures the form is blank every time the page is loaded/refreshed
window.onload = () => {
    (document.getElementById('fullname') as HTMLInputElement).value = "";
    (document.getElementById('email') as HTMLInputElement).value = "";
    (document.getElementById('username') as HTMLInputElement).value = "";
    (document.getElementById('password') as HTMLInputElement).value = "";
};

// 2. Define the Sign Up logic
function handleSignUp(): void {
    const fullName = fullNameInput.value.trim();
    const email = emailInput.value.trim();
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    // Basic Validation
    if (!fullName || !email || !username || !password) {
        alert("Please fill in all fields.");
        return;
    }

    // Call the signUp method from your DataStore
    const success = DataStore.signUp(fullName, username, email, password);

    if (success) {
        alert("Account created successfully! Redirecting to login...");
        window.location.href = 'login.html'; // Send them to login page
    } else {
        alert("Username or Email already exists. Please try another.");
    }
}

// 3. Event Listeners
signUpButton.addEventListener('click', (e) => {
    e.preventDefault();
    handleSignUp();
});

// Allow submission via "Enter" key on the password field
passwordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleSignUp();
    }
});