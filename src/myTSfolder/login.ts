import { DataStore } from './models/model.js'; // Ensure the path is correct

// 1. Select the HTML elements
// Using '!' tells TS we are sure these IDs exist in your HTML
const usernameInput = document.getElementById('loginUsername') as HTMLInputElement;
const passwordInput = document.getElementById('loginPassword') as HTMLInputElement;
const loginButton = document.getElementById('submitLogin') as HTMLButtonElement;

// 2. Define the Login Logic
function handleLogin(): void {
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (!username || !password) {
        alert("Please enter both username and password.");
        return;
    }

    // Use your DataStore login method
    const user = DataStore.login(username, password);

    if (user) {
        // Save the current session so other pages know who is logged in
        sessionStorage.setItem('currentUser', JSON.stringify(user));
        
        alert(`Welcome back, ${user.fullName}!`);

        // Redirect based on role
        if (user.role === 'Admin') {
            window.location.href = 'admin.html';
        } else {
            window.location.href = 'student.html';
        }
    } else {
        alert("Invalid username or password.");
    }
}

// 3. Attach Event Listeners
loginButton.addEventListener('click', (e) => {
    e.preventDefault(); // Prevents page reload
    handleLogin();
});

// Optional: Allow "Enter" key to submit
passwordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleLogin();
    }
});