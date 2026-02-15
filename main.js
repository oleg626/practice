// Supabase client instance
let supabase;

// DOM elements
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

/**
 * Get Supabase configuration from either config.js or meta tags
 * Meta tags are used in production (Fly.io deployment)
 */
function getSupabaseConfig() {
    // Try to get config from config.js (local development)
    if (typeof supabaseConfig !== 'undefined' && supabaseConfig.url && supabaseConfig.anonKey) {
        return supabaseConfig;
    }
    
    // Try to get config from meta tags (production deployment)
    const urlMeta = document.querySelector('meta[name="supabase-url"]');
    const keyMeta = document.querySelector('meta[name="supabase-anon-key"]');
    
    if (urlMeta && keyMeta) {
        const url = urlMeta.getAttribute('content');
        const anonKey = keyMeta.getAttribute('content');
        
        // Validate URL format and that placeholders have been replaced
        const isValidUrl = url && url.startsWith('https://') && !url.includes('PLACEHOLDER');
        // Validate anon key (should be a long string, typically 200+ chars)
        const isValidKey = anonKey && anonKey.length > 100 && !anonKey.includes('PLACEHOLDER');
        
        if (isValidUrl && isValidKey) {
            return { url, anonKey };
        }
    }
    
    return null;
}

/**
 * Initialize Supabase client with configuration
 * Session persistence is configured for 30 days
 */
function initializeSupabase() {
    try {
        // Check if Supabase library is loaded
        if (typeof window.supabase === 'undefined') {
            throw new Error('Supabase library not loaded. Check your internet connection or disable content blockers.');
        }

        const config = getSupabaseConfig();
        if (!config) {
            throw new Error('Supabase configuration not found. Please create config.js file from config.js.example or set environment variables.');
        }

        // Create Supabase client using the global supabase object from CDN
        const { createClient } = window.supabase;
        supabase = createClient(
            config.url,
            config.anonKey,
            {
                auth: {
                    // Store session in localStorage for persistence
                    storage: window.localStorage,
                    // Auto-refresh the session when it expires
                    autoRefreshToken: true,
                    // Persist the session
                    persistSession: true,
                    // Detect session from URL (useful for email confirmation)
                    detectSessionInUrl: true
                }
            }
        );

        console.log('Supabase client initialized successfully');
        return true;
    } catch (error) {
        console.error('Error initializing Supabase:', error);
        showError(error.message);
        return false;
    }
}

/**
 * Show loading indicator
 */
function showLoading() {
    loadingIndicator.style.display = 'flex';
}

/**
 * Hide loading indicator
 */
function hideLoading() {
    loadingIndicator.style.display = 'none';
}

/**
 * Display error message
 */
function showError(message, element = errorMessage) {
    element.textContent = message;
    element.style.display = 'block';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        element.style.display = 'none';
    }, 5000);
}

/**
 * Display success message
 */
function showSuccess(message, element = signupSuccessMessage) {
    element.textContent = message;
    element.style.display = 'block';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        element.style.display = 'none';
    }, 5000);
}

/**
 * Clear all error and success messages
 */
function clearMessages() {
    errorMessage.style.display = 'none';
    signupErrorMessage.style.display = 'none';
    signupSuccessMessage.style.display = 'none';
    errorMessage.textContent = '';
    signupErrorMessage.textContent = '';
    signupSuccessMessage.textContent = '';
}

/**
 * Update UI based on authentication state
 */
function updateUI(session) {
    clearMessages();
    
    if (session && session.user) {
        // User is authenticated
        loginSection.style.display = 'none';
        signupSection.style.display = 'none';
        protectedSection.style.display = 'block';
        userEmail.textContent = session.user.email;
        console.log('User authenticated:', session.user.email);
    } else {
        // User is not authenticated
        loginSection.style.display = 'block';
        signupSection.style.display = 'none';
        protectedSection.style.display = 'none';
        console.log('User not authenticated');
    }
}

/**
 * Handle login form submission
 */
async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    showLoading();
    clearMessages();
    
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        if (error) throw error;
        
        console.log('Login successful:', data);
        updateUI(data.session);
        
        // Clear form
        loginForm.reset();
    } catch (error) {
        console.error('Login error:', error);
        showError(error.message || 'Failed to login. Please check your credentials.');
    } finally {
        hideLoading();
    }
}

/**
 * Handle signup form submission
 */
async function handleSignup(event) {
    event.preventDefault();
    
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    
    showLoading();
    clearMessages();
    
    try {
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password
        });
        
        if (error) throw error;
        
        console.log('Signup successful:', data);
        
        // Check if email confirmation is required
        if (data.user && data.user.identities && data.user.identities.length === 0) {
            showSuccess('User already registered. Please sign in.', signupSuccessMessage);
        } else if (data.user && !data.session) {
            showSuccess('Account created! Please check your email to confirm your account.', signupSuccessMessage);
        } else {
            showSuccess('Account created successfully! You can now sign in.', signupSuccessMessage);
            // Auto-switch to login after 2 seconds
            setTimeout(() => {
                showLoginSection();
            }, 2000);
        }
        
        // Clear form
        signupForm.reset();
    } catch (error) {
        console.error('Signup error:', error);
        showError(error.message || 'Failed to create account. Please try again.', signupErrorMessage);
    } finally {
        hideLoading();
    }
}

/**
 * Handle logout
 */
async function handleLogout() {
    showLoading();
    
    try {
        const { error } = await supabase.auth.signOut();
        
        if (error) throw error;
        
        console.log('Logout successful');
        updateUI(null);
    } catch (error) {
        console.error('Logout error:', error);
        showError(error.message || 'Failed to logout. Please try again.');
    } finally {
        hideLoading();
    }
}

/**
 * Show signup section
 */
function showSignupSection() {
    clearMessages();
    loginSection.style.display = 'none';
    signupSection.style.display = 'block';
}

/**
 * Show login section
 */
function showLoginSection() {
    clearMessages();
    signupSection.style.display = 'none';
    loginSection.style.display = 'block';
}

/**
 * Check current session and update UI.
 * If the access token is expired (e.g. after Fly.io machine suspension),
 * proactively refresh it using the refresh token before updating the UI.
 */
async function checkSession() {
    showLoading();
    
    try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (session) {
            // Check if the access token is expired or about to expire
            const expiresAt = session.expires_at; // Unix timestamp in seconds
            const now = Math.floor(Date.now() / 1000);
            const bufferSeconds = 60; // Refresh if expiring within 60 seconds
            
            if (expiresAt && now >= expiresAt - bufferSeconds) {
                console.log('Access token expired or expiring soon, refreshing...');
                const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
                
                if (refreshError) {
                    console.warn('Session refresh failed, user needs to re-login:', refreshError.message);
                    updateUI(null);
                    return;
                }
                
                updateUI(refreshData.session);
                return;
            }
        }
        
        updateUI(session);
    } catch (error) {
        console.error('Session check error:', error);
        updateUI(null);
    } finally {
        hideLoading();
    }
}

/**
 * Initialize the application
 */
async function init() {
    console.log('Initializing application...');
    showLoading();
    
    // Set up UI navigation event listeners (these work even without Supabase)
    signupLink.addEventListener('click', (e) => {
        e.preventDefault();
        showSignupSection();
    });
    loginLink.addEventListener('click', (e) => {
        e.preventDefault();
        showLoginSection();
    });
    
    // Initialize Supabase client
    const initialized = initializeSupabase();
    if (!initialized) {
        hideLoading();
        showError('Failed to initialize application. Please check configuration.');
        return;
    }
    
    // Set up auth event listeners (these require Supabase)
    loginForm.addEventListener('submit', handleLogin);
    signupForm.addEventListener('submit', handleSignup);
    logoutBtn.addEventListener('click', handleLogout);
    
    // Use onAuthStateChange as the single source of truth for session state.
    // The INITIAL_SESSION event fires on startup, so we don't need a separate
    // checkSession() call (which would race with this listener).
    let initialSessionHandled = false;
    supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('Auth state changed:', event);
        
        // On first load, proactively refresh an expired access token.
        // This handles the case where the Fly.io machine was suspended and
        // the user returns after the short-lived JWT has expired.
        if (event === 'INITIAL_SESSION' && !initialSessionHandled) {
            initialSessionHandled = true;
            
            if (session) {
                const expiresAt = session.expires_at; // Unix timestamp in seconds
                const now = Math.floor(Date.now() / 1000);
                
                if (expiresAt && now >= expiresAt - 60) {
                    console.log('Startup: access token expired, refreshing...');
                    const { data, error } = await supabase.auth.refreshSession();
                    if (error) {
                        console.warn('Startup refresh failed:', error.message);
                        updateUI(null);
                    } else {
                        updateUI(data.session);
                    }
                    hideLoading();
                    return;
                }
            }
            
            updateUI(session);
            hideLoading();
            return;
        }
        
        // For all subsequent auth events (SIGNED_IN, SIGNED_OUT,
        // TOKEN_REFRESHED, etc.), update the UI directly.
        updateUI(session);
    });
    
    console.log('Application initialized');
}

// Initialize the application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
