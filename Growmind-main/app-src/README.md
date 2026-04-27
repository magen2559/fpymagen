# GrowMind - Cinematic Productivity Ecosystem

> Transform your study sessions into a living, breathing 3D garden 🌱

## 🎯 Project Overview

**GrowMind** is an immersive mobile productivity app that visualizes your focus time as organic plant growth in a stunning 3D virtual garden. Built with React Native, Expo, and React Three Fiber.

### Key Features
- 🌿 **3D Virtual Garden** - Watch plants grow in real-time as you study
- ⏱️ **Focus Timer** - Pomodoro-style productivity tracking
- 🤖 **AI Garden Coach** - Google Gemini-powered productivity companion
- 👻 **Community Wisps** - See other students studying in real-time
- 📊 **Progress Tracking** - XP, levels, and achievement system

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+ (Currently using v24.13.1)
- npm 10+ (Currently using v11.8.0)
- Expo Go app on your phone (iOS/Android)

### Installation

```bash
# Navigate to project folder
cd app-src

# Install dependencies (already done)
npm install

# Start development server
npm start
```

### Running the App

1. **On Your Phone** (Easiest):
   - Install Expo Go from App Store/Play Store
   - Scan the QR code from terminal
   - App loads on your device!

2. **On Web** (For testing):
   ```bash
   npm run web
   ```

3. **On Android Emulator**:
   ```bash
   npm run android
   ```

---

## 📁 Project Structure

```
app-src/
├── App.tsx              # Main entry point
├── app/                 # Expo Router pages (to be created)
│   ├── (tabs)/
│   │   ├── index.tsx    # Garden 3D scene
│   │   ├── focus.tsx    # Timer overlay
│   │   └── profile.tsx  # Stats & settings
│   └── _layout.tsx      # Root layout
├── components/          # Reusable components
│   ├── 3d/             # React Three Fiber components
│   └── ui/             # 2D UI components
├── hooks/              # Custom React hooks
├── lib/                # Utilities & Supabase client
└── constants/          # Design tokens & config
```

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React Native + Expo SDK 52+
- **Language**: TypeScript
- **3D Graphics**: React Three Fiber + Three.js
- **Animations**: React Native Reanimated + GSAP
- **Navigation**: Expo Router
- **State**: Zustand

### Backend
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Realtime**: Supabase Realtime
- **AI**: Google Gemini Pro (via Edge Functions)

---

## 📦 Installed Dependencies

### Core 3D
- `@react-three/fiber` - React renderer for Three.js
- `@react-three/drei` - Useful helpers for R3F
- `expo-gl` - OpenGL ES bindings for Expo
- `three` - 3D graphics library

### Backend & State
- `@supabase/supabase-js` - Supabase client
- `zustand` - Lightweight state management

### Animations & Navigation
- `react-native-reanimated` - Native animations
- `gsap` - Animation sequencing
- `expo-router` - File-based routing

---

## 🎨 Design Philosophy

GrowMind follows a **"60 FPS or Die"** performance philosophy:
- Optimized 3D rendering with instancing
- Compressed textures (KTX2/Basis)
- Memory-efficient animations
- Premium aesthetics with HSL color palettes

---

## 📋 Development Roadmap

### ✅ Phase 0: Setup (COMPLETE)
- [x] Environment setup
- [x] Expo project initialization
- [x] Core dependencies installed

### 🔄 Phase 1: Foundation (Weeks 1-3)
- [ ] Design system & tokens
- [ ] Tab navigation
- [ ] Basic 3D canvas
- [ ] Supabase configuration

### 📅 Phase 2: Garden Engine (Weeks 4-6)
- [ ] Plant 3D models
- [ ] Growth mechanics
- [ ] Focus timer
- [ ] Plant health system

### 📅 Phase 3: Realtime & AI (Weeks 7-9)
- [ ] Database schema
- [ ] Wisp presence system
- [ ] Gemini AI integration

### 📅 Phase 4: Polish & Launch (Weeks 10-12)
- [ ] Post-processing effects
- [ ] Haptics & sounds
- [ ] Testing & optimization
- [ ] App Store submission

---

## 🧪 Testing

```bash
# Run tests (to be configured)
npm test

# Type checking
npx tsc --noEmit

# Linting
npm run lint
```

---

## 📚 Documentation

- **Setup Guide**: `../SETUP_GUIDE.md`
- **Implementation Plan**: `../implementation_plan.md`
- **Installation Check**: `../INSTALLATION_CHECK.md`

---

## 🤝 Contributing

This is a Final Year Project (FYP). Development is currently solo.

---

## 📄 License

Academic project - All rights reserved

---

## 🎓 Academic Context

**Project**: Final Year Project (FYP)  
**Focus**: Mobile Development, 3D Graphics, AI Integration  
**Duration**: 12 weeks  
**Institution**: [Your University]

---

## 🔗 Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/)
- [Supabase Docs](https://supabase.com/docs)
- [React Native](https://reactnative.dev/)

---

**Built with ❤️ and lots of ☕**
