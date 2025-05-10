# ![Protected Branch Alert](/images/branch-protect.png) Protected Branch Alert

This VS Code extension warns you when you make changes on protected Git branches like `main`, `master`, `release`, or `production`. It helps prevent risky edits directly on critical branches by giving timely, configurable alerts.

## ✨ Features

- 🔒 Warns when editing files on protected Git branches
- ↺ Automatically resets when switching branches
- 🧓 10-minute cooldown between reminders
- ⚙️ Configurable list of protected branches
- 🧠 Smart: only alerts when editing, not just sitting on a branch
- 🔴 Red status bar warning when on a protected branch (always visible)

## ⚙️ Configuration

To customize which branches trigger alerts, add the following to your VS Code settings:

```json
"branchAlert.protectedBranches": ["main", "master", "release", "production"]
```

## 🔔 How It Works

- First edit on a protected branch → shows a warning popup
- If ignored → reminds you again after 10 minutes (only if you're still editing)
- If you switch to another branch → timer resets, no more reminders
- Red status bar alert appears at all times when on a protected branch
- No alerts while idle — only when you actively edit files

## 🧪 Local Installation

If you're installing the extension manually (not from the VS Code Marketplace):

1. From the root of the extension, run:

   ```bash
   npm run package
   ```

   This creates a file like:

   ```
   out/dist/protected-branch-alert-1.0.0.vsix
   ```

2. Install the .vsix file:

   ```bash
   code --install-extension out/dist/protected-branch-alert-1.0.0.vsix
   ```

3. Reload or restart VS Code to activate the extension.

To uninstall:

```bash
code --uninstall-extension protected-branch-alert
```

## 📄 License

MIT

## 📝 Attribution

### Icon

Icon made by [Edt.im](https://www.flaticon.com/authors/edtim) from [www.flaticon.com](https://www.flaticon.com).
