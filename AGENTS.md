# Agents

This document explains how to work with AI coding agents (such as GitHub Copilot) in this repository and where to find them.

## Where to Find GitHub Copilot Agents

### In Your Browser (github.com)

- **Issues & Pull Requests** — Click the **✨ Copilot** button on any issue or PR to open the Copilot chat panel for that context.
- **Code view** — Click the **Ask Copilot** button in the file browser to ask questions about code.
- **Copilot Chat** — Click the **GitHub Copilot** icon in the top navigation bar on github.com.

### In Your IDE

| IDE | How to open Copilot Chat |
|-----|--------------------------|
| VS Code | Install [GitHub Copilot Chat](https://marketplace.visualstudio.com/items?itemName=GitHub.copilot-chat) → `Ctrl+Alt+I` (Windows/Linux) or `Cmd+Alt+I` (macOS) |
| JetBrains (IntelliJ, WebStorm, etc.) | Install [GitHub Copilot](https://plugins.jetbrains.com/plugin/17718-github-copilot) → click the Copilot panel icon in the sidebar |
| Visual Studio | Install [GitHub Copilot](https://marketplace.visualstudio.com/items?itemName=GitHub.copilot) → open **View > GitHub Copilot Chat** |
| Neovim | Use the [`copilot.vim`](https://github.com/github/copilot.vim) or [`copilot.lua`](https://github.com/zbirenbaum/copilot.lua) plugin |

### In the Terminal

Install the [GitHub CLI Copilot extension](https://github.com/github/gh-copilot):

```bash
gh extension install github/gh-copilot
```

Then use it:

```bash
# Get a command suggestion
gh copilot suggest "deploy this app to Fly.io"

# Explain a command
gh copilot explain "fly secrets set"
```

### Copilot Workspace (for larger tasks)

[Copilot Workspace](https://githubnext.com/projects/copilot-workspace) lets you describe a goal and Copilot plans and implements the changes across the whole repo. Access it from the **"Open in Copilot Workspace"** link on any GitHub issue.

---

## Using Agents with This Project

See [`.github/copilot-instructions.md`](.github/copilot-instructions.md) for project-specific context that GitHub Copilot uses automatically when working in this repository. It covers:

- Architecture overview
- Key design decisions
- File structure
- API routes
- Development setup
