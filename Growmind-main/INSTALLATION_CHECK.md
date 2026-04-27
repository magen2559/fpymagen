# Installation Verification & Troubleshooting

## ⚠️ Current Status: Prerequisites Not Detected

The system cannot find Node.js, npm, or Git. This means either:
1. **They are not installed yet** - You need to download and install them
2. **They are installed but PowerShell hasn't refreshed** - You need to restart PowerShell/Terminal

---

## 🔍 Quick Check: Are They Installed?

### Method 1: Check via Windows Search
1. Press `Windows Key`
2. Type "Node.js" - Do you see "Node.js command prompt"?
3. Type "Git" - Do you see "Git Bash" or "Git CMD"?

If you see these, they ARE installed but PowerShell needs to be restarted.

### Method 2: Check Installation Paths
Open File Explorer and check if these folders exist:

**Node.js**:
- `C:\Program Files\nodejs\`
- Look for `node.exe` and `npm.cmd`

**Git**:
- `C:\Program Files\Git\`
- Look for `git.exe`

---

## ✅ Solution 1: Restart PowerShell (If Already Installed)

If the folders above exist, the software IS installed. You just need to:

1. **Close ALL PowerShell/Terminal windows**
2. **Open a NEW PowerShell window**
3. **Run these commands again**:
   ```powershell
   node --version
   npm --version
   git --version
   ```

> **Why?** Windows needs to refresh environment variables after installation.

---

## 📥 Solution 2: Install Now (If Not Installed)

If the folders DON'T exist, you need to install them:

### Install Node.js:
1. Go to: **https://nodejs.org/**
2. Download the **LTS version** (green button)
3. Run the installer
4. ✅ **IMPORTANT**: Check "Automatically install necessary tools"
5. Complete installation
6. **Restart your computer** (recommended)

### Install Git:
1. Go to: **https://git-scm.com/download/win**
2. Download the 64-bit installer
3. Run the installer with default settings
4. **Restart your computer** (recommended)

---

## 🔄 After Installation: Verify Again

After installing and restarting:

1. Open a **NEW** PowerShell window
2. Run verification commands:
   ```powershell
   node --version    # Should show v20.x.x or higher
   npm --version     # Should show 10.x.x or higher
   git --version     # Should show 2.x.x or higher
   ```

---

## 🚨 Still Not Working?

### Check Environment Variables Manually:

1. Press `Windows Key` + type "Environment Variables"
2. Click "Edit the system environment variables"
3. Click "Environment Variables" button
4. Under "System variables", find "Path"
5. Click "Edit"
6. Check if these paths exist:
   - `C:\Program Files\nodejs\`
   - `C:\Program Files\Git\cmd\`

If they're missing, click "New" and add them manually.

---

## 📞 Next Steps

**Once you see version numbers** (e.g., `v20.11.0` for Node.js):

1. ✅ Come back and let me know
2. ✅ I'll help you initialize the Expo project
3. ✅ We'll install all dependencies
4. ✅ Start building GrowMind!

---

## 💡 Alternative: Use Node.js Command Prompt

If you installed Node.js but PowerShell doesn't recognize it:

1. Press `Windows Key`
2. Type "Node.js command prompt"
3. Open it
4. Navigate to your project:
   ```cmd
   cd C:\Users\daniel\Desktop\growmind
   ```
5. Run commands there instead

This is a Node.js-specific terminal that has Node.js pre-configured.

---

## ⏱️ Expected Installation Time

- **Node.js**: 5-10 minutes (including tools)
- **Git**: 2-3 minutes
- **Total**: ~15 minutes + restart

---

**Let me know once you can see the version numbers and we'll continue! 🚀**
