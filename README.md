# Supabase Authentication Demo

A simple, secure website that demonstrates user authentication using Supabase with JWT tokens and 30-day session persistence.

## Features

- ✅ **Email/Password Authentication** - Secure login with Supabase
- 🔐 **JWT Token Management** - Automatic token handling and refresh
- ⏱️ **30-Day Session Persistence** - Stay logged in for up to 30 days
- 🚪 **Logout Functionality** - Manual logout option
- 🎨 **Clean, Modern UI** - Responsive design that works on all devices
- 🔒 **Protected Content** - Content visible only to authenticated users
- 📱 **Responsive Design** - Works perfectly on mobile, tablet, and desktop

## Tech Stack

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Authentication**: Supabase
- **Storage**: localStorage (for session persistence)
- **CDN**: Supabase JS Client Library v2

## Prerequisites

Before you begin, you'll need:
- A modern web browser (Chrome, Firefox, Safari, or Edge)
- A Supabase account (free tier is sufficient)
- A local web server (or use browser extensions like Live Server)

## Setup Instructions

### 1. Create a Supabase Project

1. Go to [Supabase](https://supabase.com) and sign up for a free account
2. Click on "New Project"
3. Fill in your project details:
   - **Name**: Choose a name for your project
   - **Database Password**: Create a secure password
   - **Region**: Select the region closest to you
4. Click "Create new project" and wait for it to initialize (this may take a few minutes)

### 2. Enable Email Authentication

1. In your Supabase dashboard, navigate to **Authentication** > **Providers**
2. Find **Email** in the list of providers
3. Make sure **Enable Email provider** is turned ON
4. Configure email settings:
   - **Enable email confirmations**: You can enable or disable this based on your needs
   - For development, you might want to disable email confirmations for easier testing
5. Click **Save**

### 3. Get Your Supabase Credentials

1. In your Supabase dashboard, go to **Project Settings** (gear icon in the sidebar)
2. Click on **API** in the left menu
3. You'll find two important values:
   - **Project URL** (looks like: `https://xyzcompany.supabase.co`)
   - **anon public key** (a long JWT token string)
4. Keep these values handy for the next step

### 4. Configure the Project

1. Clone or download this repository
2. Navigate to the project folder
3. Copy the example configuration file:
   ```bash
   cp config.js.example config.js
   ```
4. Open `config.js` in your text editor
5. Replace the placeholder values with your actual Supabase credentials:
   ```javascript
   const supabaseConfig = {
       url: 'https://your-project.supabase.co',  // Your Project URL
       anonKey: 'your-anon-key-here'             // Your anon public key
   };
   ```
6. Save the file

### 5. Add config.js to .gitignore

**IMPORTANT**: To keep your credentials secure, make sure `config.js` is in your `.gitignore` file:

```bash
echo "config.js" >> .gitignore
```

This prevents your credentials from being committed to version control.

### 6. Run the Website Locally

You have several options to run the website locally:

#### Option A: Using Python's Built-in Server
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```
Then open: `http://localhost:8000`

#### Option B: Using Node.js http-server
```bash
# Install http-server globally (one time)
npm install -g http-server

# Run the server
http-server -p 8000
```
Then open: `http://localhost:8000`

#### Option C: Using VS Code Live Server Extension
1. Install the "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"

#### Option D: Direct File Access (Not Recommended)
You can open `index.html` directly in your browser, but some features might not work correctly due to CORS restrictions.

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
- Even if you close the browser, you'll remain logged in when you return
- Sessions are stored securely in localStorage
- JWT tokens are automatically refreshed by Supabase

## File Structure

```
.
├── index.html           # Main HTML file with UI structure
├── main.js             # JavaScript for authentication logic
├── styles.css          # CSS styling
├── config.js.example   # Configuration template
├── config.js           # Your actual config (not committed)
├── .gitignore          # Git ignore file
└── README.md           # This file
```

## Security Considerations

1. **Never commit `config.js`** - Always keep your credentials secure
2. **Use environment variables** in production deployments
3. **Enable email confirmation** for production to prevent spam accounts
4. **Use HTTPS** in production to secure data transmission
5. **Row Level Security (RLS)** - Configure RLS in Supabase for database security
6. **Rate limiting** - Supabase provides built-in rate limiting for auth endpoints

## Troubleshooting

### "Failed to initialize application" Error
- Check that `config.js` exists and has the correct credentials
- Verify your Supabase URL and anon key are correct
- Make sure your Supabase project is active

### Login Fails with "Invalid login credentials"
- Verify the email and password are correct
- If you just signed up, check if email confirmation is required
- Make sure email authentication is enabled in Supabase

### Session Not Persisting
- Check browser's localStorage is enabled
- Make sure you're not in private/incognito mode
- Verify the Supabase session configuration in `main.js`

### CORS Errors
- Use a local web server instead of opening the file directly
- Check Supabase CORS settings in your project dashboard

## How It Works

### Authentication Flow

1. **Page Load**:
   - App initializes Supabase client
   - Checks for existing session in localStorage
   - Automatically logs in if valid session exists

2. **Login**:
   - User submits email/password
   - Supabase validates credentials
   - Returns JWT access token and refresh token
   - Tokens stored in localStorage
   - UI updates to show protected content

3. **Session Persistence**:
   - Session data stored in localStorage
   - JWT tokens automatically refreshed before expiration
   - Session valid for 30 days (or until manual logout)

4. **Logout**:
   - Supabase signs out the user
   - Tokens removed from localStorage
   - UI returns to login state

### JWT Token Management

Supabase handles all JWT token operations automatically:
- **Access tokens**: Short-lived tokens for API requests
- **Refresh tokens**: Long-lived tokens to get new access tokens
- **Automatic refresh**: Tokens refreshed before expiration
- **Secure storage**: Tokens stored in localStorage

## Customization

### Adjusting Session Duration

The 30-day session persistence is handled by Supabase's default settings. To modify:
1. Go to Supabase Dashboard > Authentication > Settings
2. Adjust the JWT expiry settings

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
