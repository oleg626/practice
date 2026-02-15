// ---------------------------------------------------------------------------
// DOM elements
// ---------------------------------------------------------------------------

const loginSection = document.getElementById('login-section');
const signupSection = document.getElementById('signup-section');
const protectedSection = document.getElementById('protected-section');
const loadingIndicator = document.getElementById('loading-indicator');

const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const logoutBtn = document.getElementById('logout-btn');
const signupLink = document.getElementById('signup-link');
const loginLink = document.getElementById('login-link');

const errorMessage = document.getElementById('error-message');
const signupErrorMessage = document.getElementById('signup-error-message');
const signupSuccessMessage = document.getElementById('signup-success-message');
const userEmail = document.getElementById('user-email');

// ---------------------------------------------------------------------------
// API helpers
// ---------------------------------------------------------------------------

/**
 * Call our backend auth API. Returns the parsed JSON body.
 * Throws on network errors or non-OK responses.
 */
async function authFetch(endpoint, options = {}) {
    const res = await fetch(`/api/auth/${endpoint}`, {
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin', // include cookies
        ...options,
    });
    const body = await res.json();
    if (!res.ok) {
        throw new Error(body.error || `Request failed (${res.status})`);
    }
    return body;
}

// ---------------------------------------------------------------------------
// UI helpers
// ---------------------------------------------------------------------------

function showLoading() {
    loadingIndicator.style.display = 'flex';
}

function hideLoading() {
    loadingIndicator.style.display = 'none';
}

function showError(message, element = errorMessage) {
    element.textContent = message;
    element.style.display = 'block';
    setTimeout(() => { element.style.display = 'none'; }, 5000);
}

function showSuccess(message, element = signupSuccessMessage) {
    element.textContent = message;
    element.style.display = 'block';
    setTimeout(() => { element.style.display = 'none'; }, 5000);
}

function clearMessages() {
    errorMessage.style.display = 'none';
    signupErrorMessage.style.display = 'none';
    signupSuccessMessage.style.display = 'none';
    errorMessage.textContent = '';
    signupErrorMessage.textContent = '';
    signupSuccessMessage.textContent = '';
}

/**
 * Update UI based on whether the user is authenticated.
 * @param {object|null} user — { email, id } or null
 */
function updateUI(user) {
    clearMessages();

    if (user) {
        loginSection.style.display = 'none';
        signupSection.style.display = 'none';
        protectedSection.style.display = 'block';
        userEmail.textContent = user.email;
        console.log('User authenticated:', user.email);
    } else {
        loginSection.style.display = 'block';
        signupSection.style.display = 'none';
        protectedSection.style.display = 'none';
        console.log('User not authenticated');
    }
}

function showSignupSection() {
    clearMessages();
    loginSection.style.display = 'none';
    signupSection.style.display = 'block';
}

function showLoginSection() {
    clearMessages();
    signupSection.style.display = 'none';
    loginSection.style.display = 'block';
}

// ---------------------------------------------------------------------------
// Auth actions — all go through our backend, never directly to Supabase
// ---------------------------------------------------------------------------

/**
 * Handle login form submission.
 */
async function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    showLoading();
    clearMessages();

    try {
        const data = await authFetch('login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });

        console.log('Login successful');
        updateUI(data.user);
        loginForm.reset();
    } catch (error) {
        console.error('Login error:', error);
        showError(error.message || 'Failed to login. Please check your credentials.');
    } finally {
        hideLoading();
    }
}

/**
 * Handle signup form submission.
 */
async function handleSignup(event) {
    event.preventDefault();

    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    showLoading();
    clearMessages();

    try {
        const data = await authFetch('signup', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });

        console.log('Signup successful');

        if (data.session) {
            // Logged in immediately (no email confirmation required)
            updateUI(data.user);
        } else {
            // Show feedback message and switch to login
            showSuccess(
                data.message || 'Account created! Please check your email to confirm.',
                signupSuccessMessage
            );
            setTimeout(showLoginSection, 2000);
        }

        signupForm.reset();
    } catch (error) {
        console.error('Signup error:', error);
        showError(error.message || 'Failed to create account.', signupErrorMessage);
    } finally {
        hideLoading();
    }
}

/**
 * Handle logout button click.
 */
async function handleLogout() {
    showLoading();

    try {
        await authFetch('logout', { method: 'POST' });
        console.log('Logout successful');
        updateUI(null);
    } catch (error) {
        console.error('Logout error:', error);
        showError(error.message || 'Failed to logout.');
    } finally {
        hideLoading();
    }
}

/**
 * Check for an existing session on page load.
 * The backend validates the httpOnly cookie and refreshes the Supabase
 * session if needed — this survives Fly.io machine suspensions because
 * the cookie is stored in the browser, not on the server.
 */
async function checkSession() {
    showLoading();

    try {
        const data = await authFetch('session');
        updateUI(data.user);
    } catch {
        // 401 or network error — not logged in
        updateUI(null);
    } finally {
        hideLoading();
    }
}

// ---------------------------------------------------------------------------
// Initialise
// ---------------------------------------------------------------------------

async function init() {
    console.log('Initializing application...');

    // Navigation links
    signupLink.addEventListener('click', (e) => { e.preventDefault(); showSignupSection(); });
    loginLink.addEventListener('click', (e) => { e.preventDefault(); showLoginSection(); });

    // Auth form handlers
    loginForm.addEventListener('submit', handleLogin);
    signupForm.addEventListener('submit', handleSignup);
    logoutBtn.addEventListener('click', handleLogout);

    // Check for existing session (validates cookie with the backend)
    await checkSession();

    console.log('Application initialized');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
