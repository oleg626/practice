const express = require('express');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const path = require('path');
const { createServerClient } = require('@supabase/ssr');
const { createClient } = require('@supabase/supabase-js');

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const PORT = process.env.PORT || 8080;

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_PUBLISHABLE_DEFAULT_KEY = process.env.SUPABASE_PUBLISHABLE_DEFAULT_KEY;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_DEFAULT_KEY || !SUPABASE_SECRET_KEY) {
    console.error('Missing required environment variables: SUPABASE_URL, SUPABASE_PUBLISHABLE_DEFAULT_KEY, SUPABASE_SECRET_KEY');
    process.exit(1);
}

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// ---------------------------------------------------------------------------
// Supabase clients
// ---------------------------------------------------------------------------

/**
 * Create a Supabase SSR client for the given Express req/res pair.
 * Uses the publishable key and manages auth session via httpOnly cookies.
 * A new client must be created per request.
 */
function createSupabaseClient(req, res) {
    return createServerClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_DEFAULT_KEY, {
        cookies: {
            getAll() {
                return Object.entries(req.cookies).map(([name, value]) => ({
                    name,
                    value,
                }));
            },
            setAll(cookiesToSet) {
                cookiesToSet.forEach(({ name, value, options }) => {
                    res.cookie(name, value, {
                        ...options,
                        httpOnly: true,
                        secure: IS_PRODUCTION,
                        sameSite: 'lax',
                    });
                });
            },
        },
    });
}

/**
 * Admin client (secret key) for privileged operations.
 * This client bypasses Row Level Security.
 */
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
    },
});

// ---------------------------------------------------------------------------
// Express app
// ---------------------------------------------------------------------------

const app = express();

app.use(express.json());
app.use(cookieParser());

// Security headers
app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                connectSrc: ["'self'"],
                imgSrc: ["'self'", 'data:', 'https:'],
                fontSrc: ["'self'"],
            },
        },
        crossOriginEmbedderPolicy: false,
    })
);

// Serve static frontend files from public/
app.use(express.static(path.join(__dirname, 'public')));

// ---------------------------------------------------------------------------
// Auth API routes
// ---------------------------------------------------------------------------

/**
 * POST /api/auth/signup
 * Body: { email, password }
 *
 * The SSR client automatically sets session cookies via setAll when a
 * session is created (i.e. email confirmation is not required).
 */
app.post('/api/auth/signup', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
    }

    try {
        const supabase = createSupabaseClient(req, res);
        const { data, error } = await supabase.auth.signUp({ email, password });

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        // If a session is returned, email confirmation was not required.
        // Session cookies are set automatically by the SSR client.
        if (data.session) {
            return res.json({
                user: { email: data.user.email, id: data.user.id },
                session: true,
            });
        }

        // Check for already-registered email (identities array is empty)
        if (data.user && data.user.identities && data.user.identities.length === 0) {
            return res.json({
                user: null,
                session: false,
                message: 'User already registered. Please sign in.',
            });
        }

        // Email confirmation required
        return res.json({
            user: data.user ? { email: data.user.email, id: data.user.id } : null,
            session: false,
            message: 'Account created! Please check your email to confirm your account.',
        });
    } catch (err) {
        console.error('Signup error:', err);
        return res.status(500).json({ error: 'Internal server error.' });
    }
});

/**
 * POST /api/auth/login
 * Body: { email, password }
 *
 * Session cookies are set automatically by the SSR client on success.
 */
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
    }

    try {
        const supabase = createSupabaseClient(req, res);
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            return res.status(401).json({ error: error.message });
        }

        return res.json({
            user: { email: data.user.email, id: data.user.id },
        });
    } catch (err) {
        console.error('Login error:', err);
        return res.status(500).json({ error: 'Internal server error.' });
    }
});

/**
 * GET /api/auth/session
 *
 * Validates the session from cookies. The SSR client reads auth cookies via
 * getAll, calls Supabase to verify/refresh the session, and rotates cookies
 * via setAll. This survives Fly.io machine suspension because the cookies
 * live in the browser.
 */
app.get('/api/auth/session', async (req, res) => {
    try {
        const supabase = createSupabaseClient(req, res);

        // getSession() reads the session from cookies and, critically,
        // refreshes the access token using the refresh token when the JWT
        // has expired.  The refreshed tokens are written back to the
        // browser via the setAll cookie callback, so subsequent requests
        // carry valid credentials.
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session) {
            return res.status(401).json({ error: 'Not authenticated.' });
        }

        // Verify the (now-refreshed) token with the Supabase Auth server.
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            return res.status(401).json({ error: 'Not authenticated.' });
        }

        return res.json({
            user: { email: user.email, id: user.id },
        });
    } catch (err) {
        console.error('Session check error:', err);
        return res.status(500).json({ error: 'Internal server error.' });
    }
});

/**
 * POST /api/auth/logout
 *
 * The SSR client's signOut() revokes the session on Supabase and clears
 * session cookies via setAll.
 */
app.post('/api/auth/logout', async (req, res) => {
    try {
        const supabase = createSupabaseClient(req, res);
        await supabase.auth.signOut();

        return res.json({ message: 'Logged out.' });
    } catch (err) {
        console.error('Logout error:', err);
        return res.status(500).json({ error: 'Internal server error.' });
    }
});

// ---------------------------------------------------------------------------
// SPA fallback — serve index.html for any non-API, non-static route
// ---------------------------------------------------------------------------

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
