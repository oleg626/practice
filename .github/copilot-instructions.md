# GitHub Copilot Instructions

## Project Overview

This is a **Supabase Authentication Demo** — a full-stack web application that demonstrates secure user authentication using a backend-proxy architecture. The browser never receives Supabase API keys or JWT tokens.

## Architecture

```
Browser ──fetch──▶ Express Backend ──@supabase/ssr──▶ Supabase Auth API
               (httpOnly cookie)     (publishable + secret keys)
```

- **Frontend** (`public/`): Vanilla JS — calls our Express backend API, no Supabase client dependency
- **Backend** (`server.js`): Express + `@supabase/ssr` — holds both Supabase keys, manages session cookies

## Key Design Decisions

1. **No Supabase client in the browser.** `public/main.js` uses `fetch()` to call our own `/api/auth/*` endpoints. Do not import or use `@supabase/supabase-js` in frontend code.

2. **httpOnly cookie sessions.** The `@supabase/ssr` SSR client writes auth tokens to httpOnly cookies (not localStorage). This prevents XSS token theft.

3. **Two Supabase keys, both server-side only:**
   - `SUPABASE_PUBLISHABLE_DEFAULT_KEY` — for user-facing auth operations (sign up, login, session check)
   - `SUPABASE_SECRET_KEY` — for admin/privileged operations (bypasses RLS); used only in `supabaseAdmin`

4. **Per-request Supabase client.** `createSupabaseClient(req, res)` in `server.js` must be called on every request — it binds cookie read/write to the specific `req`/`res` pair.

## File Structure

| File | Purpose |
|------|---------|
| `server.js` | Express backend: auth API routes + static file serving |
| `public/index.html` | Frontend HTML |
| `public/main.js` | Frontend JS (fetch-based, no Supabase dependency) |
| `public/styles.css` | CSS styling |
| `.env.example` | Environment variable template |
| `Dockerfile` | Docker config for Fly.io deployment |
| `fly.toml` | Fly.io app configuration |

## Environment Variables

All three are required to start the server:

| Variable | Purpose |
|----------|---------|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_PUBLISHABLE_DEFAULT_KEY` | Publishable (user-facing) key |
| `SUPABASE_SECRET_KEY` | Secret key (admin operations only) |

## API Routes

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/auth/signup` | Create a new user account |
| `POST` | `/api/auth/login` | Sign in with email + password |
| `GET` | `/api/auth/session` | Validate session (also refreshes token) |
| `POST` | `/api/auth/logout` | Sign out and clear session cookie |

## Development

```bash
npm install
cp .env.example .env   # fill in real Supabase credentials
npm run dev            # starts server with dotenv on port 8080
```

## Where to Find GitHub Copilot Agents

GitHub Copilot agents are accessible through:

1. **GitHub.com** — Navigate to any repository and click the **Copilot** icon (✨) or use the **Ask Copilot** button in pull requests, issues, and code views.

2. **GitHub Copilot Chat** — Available in:
   - **VS Code**: Install the [GitHub Copilot Chat](https://marketplace.visualstudio.com/items?itemName=GitHub.copilot-chat) extension, then open the chat panel (`Ctrl+Alt+I` / `Cmd+Alt+I`).
   - **JetBrains IDEs**: Install the [GitHub Copilot](https://plugins.jetbrains.com/plugin/17718-github-copilot) plugin and use the Copilot chat panel.
   - **github.com**: Click the Copilot button (✨) in the top navigation bar.

3. **Copilot in pull requests** — When viewing a PR on GitHub.com, Copilot can summarize changes, suggest reviewers, and answer questions about the diff.

4. **GitHub Copilot Workspace** — For larger tasks, Copilot Workspace lets you specify a goal and Copilot plans, writes, and tests the changes. Access it from [githubnext.com/projects/copilot-workspace](https://githubnext.com/projects/copilot-workspace) or via the "Open in Copilot Workspace" button on issues.

5. **GitHub CLI Copilot extension** — Run `gh copilot suggest` or `gh copilot explain` in your terminal after installing the extension:
   ```bash
   gh extension install github/gh-copilot
   gh copilot suggest "how do I deploy this to Fly.io"
   ```
