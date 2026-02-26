# Supabase Authentication Demo

A secure website that demonstrates user authentication using Supabase with a backend proxy architecture. All Supabase keys stay on the server — the browser never sees any API keys or tokens.

## Features

- **Email/Password Authentication** — Secure login with Supabase via backend proxy
- **httpOnly Cookie Sessions** — Refresh tokens stored in httpOnly cookies (immune to XSS)
- **30-Day Session Persistence** — Stay logged in for up to 30 days, survives Fly.io machine suspension
- **Server-Side Token Management** — No Supabase keys or JWT tokens exposed to the browser
- **Automatic Token Rotation** — Refresh tokens are rotated on every session check
- **Logout with Server-Side Revocation** — Sessions revoked on Supabase when logging out
- **Clean, Modern UI** — Responsive design that works on all devices

## Architecture

```
Browser ──fetch──▶ Express Backend ──@supabase/ssr──▶ Supabase Auth API
               (httpOnly cookie)     (publishable + secret keys)
```

- **Frontend** (`public/`): Vanilla JS — calls our backend API, no Supabase dependency
- **Backend** (`server.js`): Express + `@supabase/ssr` — holds both Supabase keys, manages session cookies automatically
- **Supabase keys used server-side only**:
  - `SUPABASE_PUBLISHABLE_DEFAULT_KEY` — for user-facing auth operations
  - `SUPABASE_SECRET_KEY` — for admin/privileged operations

## Tech Stack

- **Backend**: Node.js, Express, @supabase/ssr, cookie-parser, helmet
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Auth Provider**: Supabase
- **Session Storage**: httpOnly secure cookies (browser-side), no localStorage

## Prerequisites

Before you begin, you'll need:
- A modern web browser (Chrome, Firefox, Safari, or Edge)
- A Supabase account (free tier is sufficient)
- Node.js 20+ (for local development)

## Setup Instructions

### 1. Create a Supabase Project

1. Go to [Supabase](https://supabase.com) and sign up for a free account
2. Click on "New Project"
3. Fill in your project details:
   - **Name**: Choose a name for your project
   - **Database Password**: Create a secure password
   - **Region**: Select the region closest to you
4. Click "Create new project" and wait for it to initialize

### 2. Enable Email Authentication

1. In your Supabase dashboard, navigate to **Authentication** > **Providers**
2. Find **Email** in the list of providers
3. Make sure **Enable Email provider** is turned ON
4. For development, you may want to disable email confirmations

### 3. Configure Session Lifetime (Required for 30-day sessions)

In your **Supabase Dashboard → Authentication → Settings**:

1. **JWT Expiry Limit** — keep at `3600` (1 hour). The backend auto-refreshes this.
2. **Refresh Token Rotation** — set to **Enabled** (recommended for security).
3. **Refresh Token Reuse Interval** — set to a small value, e.g. `10` seconds.
4. **Session Timeout (Refresh Token Lifetime)** — set to **`2592000`** (30 days).

Without step 4, sessions will expire at the Supabase default regardless of client/server settings.

### 4. Get Your Supabase Credentials

In your Supabase dashboard, go to **Project Settings** > **API Keys**. You need three values:

| Dashboard label | Environment variable | Purpose |
|-----------------|---------------------|---------|
| Project URL | `SUPABASE_URL` | Your project's API endpoint |
| Publishable | `SUPABASE_PUBLISHABLE_DEFAULT_KEY` | User-facing auth operations (kept server-side) |
| Secret | `SUPABASE_SECRET_KEY` | Admin operations like session revocation (kept server-side) |

> **Warning:** The secret key bypasses Row Level Security. Never expose it to the browser.

### 5. Deploy to Fly.io (Production)

1. Install the Fly CLI:
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. Login to Fly.io:
   ```bash
   fly auth login
   ```

3. Create a new Fly.io app (first time only):
   ```bash
   fly launch
   ```
   - Choose a unique app name
   - Select a region
   - Do NOT deploy yet

4. Set your Supabase credentials as secrets (all three are required):
   ```bash
   fly secrets set SUPABASE_URL="https://your-project.supabase.co"
   fly secrets set SUPABASE_PUBLISHABLE_DEFAULT_KEY="your-publishable-key-here"
   fly secrets set SUPABASE_SECRET_KEY="your-secret-key-here"
   ```

5. Deploy the application:
   ```bash
   fly deploy
   ```

6. Open your deployed app:
   ```bash
   fly open
   ```

**Note**: All three secrets are required. They are injected as environment variables at runtime and never committed to version control.

### 6. Local Development Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

3. Edit `.env` and fill in your Supabase credentials:
   ```
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_PUBLISHABLE_DEFAULT_KEY=your-publishable-key-here
   SUPABASE_SECRET_KEY=your-secret-key-here
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```
   Then open: `http://localhost:8080`

**IMPORTANT**: The `.env` file is in `.gitignore` to prevent credentials from being committed.

### 7. Run the Website Locally

```bash
# Development (loads .env file automatically)
npm run dev

# Production-style (set env vars manually)
SUPABASE_URL=... SUPABASE_PUBLISHABLE_DEFAULT_KEY=... SUPABASE_SECRET_KEY=... npm start
```
Then open: `http://localhost:8080`

## Usage

### Signing Up (Creating a New Account)

1. Open the website in your browser
2. Click on "Sign up" link at the bottom of the login form
3. Enter your email address and password (minimum 6 characters)
4. Click "Sign Up"
5. If email confirmation is enabled:
   - Check your email for a confirmation link
   - Click the confirmation link
   - Return to the website and log in
6. If email confirmation is disabled:
   - You'll be automatically logged in or can immediately sign in

### Logging in

1. On the login page, enter your email and password
2. Click "Sign In"
3. Upon successful login, you'll see the protected content area

### Using the Protected Area

Once logged in, you'll see:
- A welcome message with your email
- Protected content that's only visible to authenticated users
- A logout button in the header

### Logging out

Click the "Logout" button in the header to sign out and return to the login page.

### Session Persistence

- Your session will automatically persist for **30 days**
- Even if you close the browser or the Fly.io machine is suspended, you'll remain logged in
- Sessions are stored in **httpOnly cookies** (not localStorage — immune to XSS)
- Refresh tokens are automatically rotated on each session check

## File Structure

```
.
├── server.js               # Express backend (auth API + static file serving)
├── package.json            # Node.js dependencies and scripts
├── public/
│   ├── index.html          # Frontend HTML
│   ├── main.js             # Frontend JavaScript (fetch-based, no Supabase dependency)
│   └── styles.css          # CSS styling
├── .github/
│   └── copilot-instructions.md  # GitHub Copilot agent instructions for this repo
├── AGENTS.md               # Guide to finding and using GitHub Copilot agents
├── .env.example            # Environment variable template (for local dev)
├── .env                    # Your actual env vars (not committed)
├── Dockerfile              # Docker configuration for Fly.io deployment
├── fly.toml                # Fly.io app configuration
├── .dockerignore           # Files to exclude from Docker build
├── .gitignore              # Git ignore file
└── README.md               # This file
```

## Deployment Architecture

### Local Development
- Environment variables loaded from `.env` file via `dotenv`
- Express server runs on port 8080
- Same code path as production

### Production (Fly.io)
- Environment variables injected from Fly.io secrets
- Three secrets required: `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_DEFAULT_KEY`, `SUPABASE_SECRET_KEY`
- Express serves static files and handles API routes
- httpOnly cookies persist across machine suspensions
- No Supabase keys or tokens are ever sent to the browser

## Security Considerations

1. **httpOnly Cookies** — Refresh tokens stored in httpOnly cookies, inaccessible to JavaScript (XSS protection)
2. **SameSite=Lax** — Cookies use SameSite attribute for CSRF protection
3. **Secure Flag** — Cookies marked secure in production (HTTPS only)
4. **No Keys in Browser** — Both Supabase keys (publishable + secret) stay on the server
5. **Token Rotation** — Refresh tokens are rotated on every session check
6. **Server-Side Revocation** — Logout revokes the session on Supabase's side
7. **Helmet.js** — Security headers (CSP, X-Frame-Options, etc.) applied via helmet
8. **HTTPS** — Fly.io forces HTTPS in production
9. **RLS** — Configure Row Level Security in Supabase for database protection
10. **Rate Limiting** — Supabase provides built-in rate limiting for auth endpoints

## Troubleshooting

### Server won't start
- Ensure all three environment variables are set (`SUPABASE_URL`, `SUPABASE_PUBLISHABLE_DEFAULT_KEY`, `SUPABASE_SECRET_KEY`)
- For local dev: check `.env` file exists and has valid values
- For Fly.io: run `fly secrets list` to verify

### Login Fails with "Invalid login credentials"
- Verify the email and password are correct
- If you just signed up, check if email confirmation is required
- Make sure email authentication is enabled in Supabase dashboard

### Session Not Persisting
- Ensure cookies are enabled in the browser
- In production, make sure `force_https = true` in `fly.toml` (cookies require HTTPS)
- Check that Supabase refresh token lifetime is set to 2592000 (30 days)

### Fly.io Deployment Issues
- Build fails: Check Dockerfile syntax and ensure all files are present
- App doesn't start: Review logs with `fly logs`
- Secrets not working: Verify with `fly secrets list`
- Machine suspends: This is normal — sessions survive via httpOnly cookies

## How It Works

### Authentication Flow

1. **Page Load**:
   - Frontend calls `GET /api/auth/session`
   - Backend reads httpOnly cookie, refreshes session with Supabase
   - Returns user info if valid, 401 if not

2. **Login**:
   - User submits email/password → `POST /api/auth/login`
   - Backend authenticates with Supabase using the publishable default key
   - Supabase returns access + refresh tokens
   - Backend stores refresh token in httpOnly cookie
   - Returns user info to frontend (no tokens exposed)

3. **Session Persistence**:
   - Refresh token stored in httpOnly cookie (30-day max-age)
   - On each page load, backend refreshes the session with Supabase
   - New refresh token replaces the old one (rotation)
   - Survives Fly.io machine suspension — cookie lives in the browser

4. **Logout**:
   - Frontend calls `POST /api/auth/logout`
   - Backend revokes session on Supabase (via secret key)
   - Cookie is cleared
   - UI returns to login state

### Token Management

- **Access tokens**: Never sent to the browser — used only within backend API calls
- **Refresh tokens**: Stored in httpOnly cookies, rotated on every use
- **Publishable default key**: Used server-side for user-facing auth operations via `@supabase/ssr`
- **Secret key**: Used server-side for admin operations

## Customization

### Session Lifetime

To adjust the 30-day session duration, change **two things**:

1. **Supabase Dashboard** → Authentication → Settings → set refresh token lifetime
2. **`server.js`** → update `COOKIE_OPTIONS.maxAge` to match

### Changing UI Styles

Edit `styles.css` to customize:
- Colors and gradients
- Fonts and typography
- Spacing and layout
- Animations and transitions

### Adding Features

You can extend the application by:
- Adding password reset functionality
- Implementing social authentication (Google, GitHub, etc.)
- Creating user profiles
- Adding protected routes
- Implementing role-based access control

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [JWT Introduction](https://jwt.io/introduction)

## License

This project is open source and available under the MIT License.

## Support

If you encounter any issues or have questions:
1. Check the Troubleshooting section above
2. Review Supabase documentation
3. Check Supabase community forums
4. Open an issue in this repository

## Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation

---

**Note**: This is a demo application for learning purposes. For production use, consider additional security measures, error handling, and user experience enhancements.
