# Git Setup Completion Guide

## 📥 After Git Installation

Once Git installation is complete, follow these steps to configure and initialize your repository.

---

## Step 1: Verify Git Installation

**Open a NEW PowerShell window** (important - to refresh environment variables)

```powershell
# Check Git version
git --version
# Should show: git version 2.x.x
```

If you get "command not found", restart your computer and try again.

---

## Step 2: Configure Git (First Time Setup)

Set your identity for Git commits:

```powershell
# Set your name (replace with your actual name)
git config --global user.name "Daniel"

# Set your email (replace with your email)
git config --global user.email "your.email@example.com"

# Verify configuration
git config --global --list
```

### Optional but Recommended Settings:

```powershell
# Set default branch name to 'main'
git config --global init.defaultBranch main

# Enable colored output
git config --global color.ui auto

# Set VS Code as default editor (if you have it)
git config --global core.editor "code --wait"
```

---

## Step 3: Initialize Git Repository

Navigate to your project and initialize Git:

```powershell
# Go to project root (not app-src, but the parent folder)
cd C:\Users\daniel\Desktop\growmind

# Initialize Git repository
git init

# Check status
git status
```

---

## Step 4: Create .gitignore

Create a `.gitignore` file to exclude unnecessary files:

```powershell
# Create .gitignore in the growmind folder
New-Item -Path .gitignore -ItemType File
```

Add this content to `.gitignore`:

```
# Node modules
app-src/node_modules/

# Expo
app-src/.expo/
app-src/.expo-shared/

# Environment variables
app-src/.env
app-src/.env.local

# OS files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/

# Logs
*.log
npm-debug.log*

# Build outputs
app-src/dist/
app-src/build/
```

---

## Step 5: Make Your First Commit

```powershell
# Add all files to staging
git add .

# Check what will be committed
git status

# Make your first commit
git commit -m "Initial commit: GrowMind FYP setup complete"

# View commit history
git log --oneline
```

---

## Step 6: (Optional) Connect to GitHub

If you want to backup your code to GitHub:

### Create GitHub Repository

1. Go to https://github.com
2. Click "New repository"
3. Name: `growmind-fyp`
4. Description: "GrowMind - Cinematic Productivity Ecosystem (FYP)"
5. Keep it **Private** (for academic integrity)
6. **Don't** initialize with README (we already have files)
7. Click "Create repository"

### Link Local Repository to GitHub

```powershell
# Add remote repository (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/growmind-fyp.git

# Verify remote
git remote -v

# Push to GitHub
git branch -M main
git push -u origin main
```

---

## Step 7: Verify Everything Works

```powershell
# Check Git status
git status
# Should show: "nothing to commit, working tree clean"

# Check branches
git branch
# Should show: * main

# Check remote (if you set up GitHub)
git remote -v
```

---

## 🎯 Git Workflow for Development

### Daily Workflow

```powershell
# 1. Check current status
git status

# 2. Add changes
git add .

# 3. Commit with descriptive message
git commit -m "feat: add plant growth animation"

# 4. Push to GitHub (if connected)
git push
```

### Commit Message Convention

Use conventional commits format:

```
feat: add new feature
fix: bug fix
docs: documentation changes
style: formatting changes
refactor: code refactoring
test: add tests
chore: maintenance tasks
```

**Examples**:
```bash
git commit -m "feat: implement 3D garden scene"
git commit -m "fix: resolve timer pause bug"
git commit -m "docs: update README with setup instructions"
```

---

## 🔍 Useful Git Commands

```powershell
# View commit history
git log --oneline --graph

# View changes before committing
git diff

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Discard all local changes (careful!)
git reset --hard HEAD

# Create a new branch
git checkout -b feature/new-feature

# Switch branches
git checkout main

# View all branches
git branch -a
```

---

## ✅ Completion Checklist

After completing all steps, verify:

- [ ] Git is installed and recognized in PowerShell
- [ ] Git user name and email configured
- [ ] Repository initialized in `growmind` folder
- [ ] `.gitignore` file created
- [ ] First commit made
- [ ] (Optional) Connected to GitHub
- [ ] Can run `git status` without errors

---

## 🆘 Troubleshooting

### Issue: "git: command not found" after installation
**Solution**: 
1. Close ALL PowerShell windows
2. Open a NEW PowerShell window
3. Try again
4. If still not working, restart your computer

### Issue: "Permission denied" when pushing to GitHub
**Solution**: 
1. Use GitHub Personal Access Token instead of password
2. Go to GitHub Settings → Developer settings → Personal access tokens
3. Generate new token with `repo` scope
4. Use token as password when pushing

### Issue: Accidentally committed sensitive data
**Solution**:
```powershell
# Remove file from Git but keep locally
git rm --cached .env

# Commit the removal
git commit -m "chore: remove .env from Git"
```

---

## 📚 Next Steps After Git Setup

1. ✅ Set up Supabase project
2. ✅ Configure environment variables
3. ✅ Test the 3D scene on your phone
4. ✅ Start Phase 1: Design system and navigation

---

**Git setup complete! You're now ready for professional version control! 🚀**
