# GrowMind Development Environment Setup Guide

## 🚀 Quick Start Checklist

- [ ] Install Node.js 20+ LTS
- [ ] Install Git
- [ ] Install VS Code (recommended)
- [ ] Create Supabase account
- [ ] Initialize Expo project
- [ ] Install dependencies
- [ ] Run first build

---

## Step 1: Install Node.js (Required)

Node.js is the JavaScript runtime that powers React Native and Expo.

### Installation Steps:

1. **Download Node.js**:
   - Go to: https://nodejs.org/
   - Download the **LTS (Long Term Support)** version (v20.x or newer)
   - Choose the Windows Installer (.msi)

2. **Run the Installer**:
   - Double-click the downloaded `.msi` file
   - Follow the installation wizard
   - ✅ Check "Automatically install necessary tools" (includes Python and build tools)
   - Click "Install"

3. **Verify Installation**:
   ```powershell
   # Open a NEW PowerShell window and run:
   node --version
   # Should show: v20.x.x or higher
   
   npm --version
   # Should show: 10.x.x or higher
   ```

> **Important**: Close and reopen PowerShell after installation!

---

## Step 2: Install Git (Required)

Git is used for version control and is required by many development tools.

### Installation Steps:

1. **Download Git**:
   - Go to: https://git-scm.com/download/win
   - Download the 64-bit installer

2. **Run the Installer**:
   - Use default settings for most options
   - **Important**: Select "Git from the command line and also from 3rd-party software"
   - Choose "Use Visual Studio Code as Git's default editor" (if you have VS Code)

3. **Verify Installation**:
   ```powershell
   git --version
   # Should show: git version 2.x.x
   ```

4. **Configure Git** (First time only):
   ```powershell
   git config --global user.name "Your Name"
   git config --global user.email "your.email@example.com"
   ```

---

## Step 3: Install VS Code (Recommended)

Visual Studio Code is the recommended code editor for React Native development.

### Installation Steps:

1. **Download VS Code**:
   - Go to: https://code.visualstudio.com/
   - Download for Windows

2. **Install Recommended Extensions**:
   - Open VS Code
   - Press `Ctrl+Shift+X` to open Extensions
   - Install these extensions:
     - **ES7+ React/Redux/React-Native snippets**
     - **Prettier - Code formatter**
     - **ESLint**
     - **React Native Tools**
     - **TypeScript and JavaScript Language Features**

---

## Step 4: Install Expo CLI & Dependencies

Once Node.js is installed, you can install Expo and other global tools.

### Installation Commands:

```powershell
# Install Expo CLI globally
npm install -g expo-cli

# Install EAS CLI (for building and deploying)
npm install -g eas-cli

# Verify installation
expo --version
eas --version
```

---

## Step 5: Create Supabase Account

Supabase is your backend (database, authentication, real-time features).

### Setup Steps:

1. **Create Account**:
   - Go to: https://supabase.com
   - Click "Start your project"
   - Sign up with GitHub or email

2. **Create New Project**:
   - Click "New Project"
   - Organization: Create new or use existing
   - Project name: `growmind`
   - Database password: **Save this securely!**
   - Region: Choose closest to you (e.g., Southeast Asia)
   - Click "Create new project" (takes ~2 minutes)

3. **Get API Keys**:
   - Once project is ready, go to Settings → API
   - Copy these values (you'll need them later):
     - **Project URL**: `https://xxxxx.supabase.co`
     - **anon/public key**: `eyJhbGc...` (long string)

---

## Step 6: Initialize GrowMind Project

Now let's create the actual project!

### Project Initialization:

```powershell
# Navigate to your project folder
cd C:\Users\daniel\Desktop\growmind

# Create a new Expo app with TypeScript template
npx create-expo-app@52 . --template expo-template-blank-typescript

# This will create the project in the current folder
```

> **Note**: If the folder already has files, you may need to create a subfolder first:
> ```powershell
> mkdir app-src
> cd app-src
> npx create-expo-app@52 . --template expo-template-blank-typescript
> ```

---

## Step 7: Install Project Dependencies

Install all the required packages for 3D graphics, state management, and backend.

```powershell
# Core 3D dependencies
npm install @react-three/fiber @react-three/drei expo-gl three

# Supabase (Backend)
npm install @supabase/supabase-js

# State Management
npm install zustand

# Animations
npm install react-native-reanimated gsap

# Navigation
npm install expo-router

# TypeScript types
npm install -D @types/three

# Testing libraries
npm install -D jest @testing-library/react-native @testing-library/react-hooks

# Code quality
npm install -D eslint prettier eslint-config-prettier eslint-plugin-prettier
```

---

## Step 8: Configure Environment Variables

Create a `.env` file to store your Supabase credentials.

### Create `.env` file:

```powershell
# In the project root, create .env file
New-Item -Path .env -ItemType File
```

### Add your Supabase credentials:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

> **Replace** `your-project` and `your-anon-key-here` with your actual values from Step 5!

---

## Step 9: Initialize Git Repository

Set up version control for your project.

```powershell
# Initialize Git
git init

# Create .gitignore (if not exists)
# Expo template should create this automatically

# Make first commit
git add .
git commit -m "Initial commit: GrowMind FYP project setup"
```

---

## Step 10: Start Development Server

Let's test if everything works!

```powershell
# Start Expo development server
npx expo start
```

### What happens next:

1. A QR code will appear in the terminal
2. A browser window will open with Expo Dev Tools
3. You can run the app on:
   - **Physical device**: Install "Expo Go" app, scan QR code
   - **Android Emulator**: Press `a` in terminal
   - **iOS Simulator**: Press `i` in terminal (macOS only)
   - **Web**: Press `w` in terminal

---

## 📱 Testing on Your Phone (Easiest Option)

1. **Install Expo Go**:
   - Android: https://play.google.com/store/apps/details?id=host.exp.exponent
   - iOS: https://apps.apple.com/app/expo-go/id982107779

2. **Scan QR Code**:
   - Make sure phone and computer are on same WiFi
   - Open Expo Go app
   - Scan the QR code from terminal
   - App should load on your phone!

---

## 🖥️ Setting Up Android Emulator (Optional)

If you want to test on an Android emulator:

1. **Install Android Studio**:
   - Download: https://developer.android.com/studio
   - Install with default settings

2. **Create Virtual Device**:
   - Open Android Studio
   - Tools → Device Manager
   - Create Device → Choose Pixel 5 or similar
   - Download system image (Android 11+)
   - Finish setup

3. **Run Emulator**:
   - Start the emulator from Android Studio
   - In your project terminal, press `a`
   - App should open in emulator

---

## ✅ Verification Checklist

After completing all steps, verify everything works:

```powershell
# Check Node.js
node --version  # Should be v20.x.x+

# Check npm
npm --version   # Should be 10.x.x+

# Check Git
git --version   # Should be 2.x.x+

# Check Expo
expo --version  # Should show version number

# Check project dependencies
npm list --depth=0  # Should show all installed packages
```

---

## 🆘 Troubleshooting

### Issue: "command not found" after installing Node.js
**Solution**: Close and reopen PowerShell. Windows needs to refresh environment variables.

### Issue: Expo won't start
**Solution**: 
```powershell
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -r node_modules
npm install
```

### Issue: Can't connect to Expo Go on phone
**Solution**: 
- Ensure phone and computer are on same WiFi network
- Try using tunnel mode: `npx expo start --tunnel`
- Check firewall settings

### Issue: Port 8081 already in use
**Solution**:
```powershell
# Kill the process using port 8081
npx kill-port 8081

# Or start on different port
npx expo start --port 8082
```

---

## 📚 Next Steps

Once your environment is set up:

1. ✅ Review the `implementation_plan.md` for technical details
2. ✅ Follow Week 1 tasks: Set up basic layouts and design tokens
3. ✅ Create your first 3D scene with React Three Fiber
4. ✅ Set up Supabase database schema

---

## 🔗 Useful Resources

- **Expo Documentation**: https://docs.expo.dev/
- **React Native Docs**: https://reactnative.dev/
- **React Three Fiber**: https://docs.pmnd.rs/react-three-fiber/
- **Supabase Docs**: https://supabase.com/docs
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/

---

## 💡 Pro Tips

1. **Use TypeScript strictly**: It will save you debugging time
2. **Test on real device early**: Performance is different from emulator
3. **Commit often**: Small, frequent commits are better than large ones
4. **Read error messages carefully**: Expo gives helpful error messages
5. **Join communities**: Expo Discord, React Native subreddit

---

**Good luck with your FYP! 🚀🌱**
