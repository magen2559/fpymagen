# GrowMind: Detailed Technical Implementation Plan

## 1. System Architecture

### 1.1 High-Level Overview
App runs as a **Native Binary** (iOS/Android) built with **Expo (React Native)**. It acts as the primary interface for the 3D Garden and Productivity Timer.
- **Frontend**: React Native + Expo + React Three Fiber (R3F).
- **Backend**: Supabase (PostgreSQL + Auth + Edge Functions).
- **AI Engine**: Google Gemini Pro (accessed via Supabase Edge Function).

### 1.2 Tech Stack Versions
- **Runtime**: Node.js 20+
- **Framework**: Expo SDK 52 (React Native 0.76)
- **Language**: TypeScript 5.x
- **State Management**: `zustand` (Transient updates for high-freq animation state)
- **3D Engine**: `@react-three/fiber` v9, `@react-three/drei`, `expo-gl`
- **Animation**: `react-native-reanimated` (Layout/Gestures) + `gsap` (Sequencing)
- **Navigation**: `expo-router` v4 (File-based routing)
- **Styling**: `StyleSheet` with Design Tokens (No Tailwind, per constraints).

---

## 2. Database Schema (Supabase PostgreSQL)

### 2.1 Tables
#### `profiles` (extends `auth.users`)
- `id`: uuid (PK, FK to `auth.users.id`)
- `username`: text (unique)
- `avatar_url`: text
- `xp`: integer
- `level`: integer
- `garden_theme`: text (default: 'zen')

#### `sessions` (Focus History)
- `id`: uuid (PK)
- `user_id`: uuid (FK to `profiles.id`)
- `start_time`: timestamptz
- `end_time`: timestamptz
- `duration_seconds`: integer
- `tag`: text (e.g., 'Study', 'Code', 'Write')
- `status`: text ('completed', 'abandoned')

#### `plants` (The Virtual Garden)
- `id`: uuid (PK)
- `user_id`: uuid (FK to `profiles.id`)
- `type`: text ('bonsai', 'sakura', 'fern')
- `stage`: integer (0-3, seed -> sprout -> bloom)
- `health`: float (0.0 - 1.0)
- `created_at`: timestamptz

### 2.2 Row Level Security (RLS)
- **Profiles**: Public read, Auth-user update own.
- **Sessions**: Auth-user read/write own.
- **Plants**: Auth-user read/write own.

---

## 3. API & Edge Functions (TypeScript)

### 3.1 `grow-ai-coach` (Edge Function)
- **Trigger**: Called by client when user asks for help or session ends.
- **Input**: `{ message: string, user_stats: object }`
- **Logic**: Calls Google Gemini API with system prompt: *"You are an ancient gardener spirit guiding a student..."*
- **Output**: JSON streaming response (text).

### 3.2 `sync-wisp` (Realtime Channel)
- **Channel**: `room:global_study`
- **Event**: `presence` (User coordinates in 3D space)
- **Payload**: `{ x: float, z: float, status: 'focusing' }`

---

## 4. Folder Structure (Expo Router)

```
/app
  /(tabs)
    index.tsx        (The Garden / Home 3D Scene)
    focus.tsx        (Timer Overlay)
    profile.tsx      (Stats & Settings)
  _layout.tsx        (Root Layout & Providers)
/components
  /3d                (R3F Components)
    /Garden.tsx
    /Plant.tsx
    /Wisp.tsx
  /ui                (2D UI Components)
    /Button.tsx
    /GlassCard.tsx
/hooks               (Custom Logic)
  useGardenStore.ts  (Zustand)
  useFocusTimer.ts
/lib
  supabase.ts        (Client Client)
/constants
  Tokens.ts          (Colors, Gaps, Typography)
```

---

## 5. Implementation Roadmap (12 Weeks)

### Phase 1: Foundation (Weeks 1-3)
- [ ] **W1**: Init Expo project (TypeScript), configure Supabase project, set up Auth (Email/Password).
- [ ] **W2**: Build Basic Layouts (Tab Navigation) and Design System (Tokens).
- [ ] **W3**: Set up R3F Canvas in Expo. Ensure `expo-gl` context is working. Render a simple cube.

### Phase 2: The Garden Engine (Weeks 4-6)
- [ ] **W4**: Model/Import low-poly plant assets (GLTF). Implement `useGLTF` in R3F.
- [ ] **W5**: Implement "Growth Logic". State changes (Seed -> Tree) based on dummy timer data.
- [ ] **W6**: Build the "Focus Timer" Logic. Link Timer start/stop to Plant health/growth state.

### Phase 3: Realtime & AI (Weeks 7-9)
- [ ] **W7**: Integrate Supabase Database (Sessions/Plants tables). Sync timer history to DB.
- [ ] **W8**: Implement "Wisp" System. Subscribe to Supabase Realtime presence. Render other users as glowing orbs in 3D.
- [ ] **W9**: Build `grow-ai-coach` Edge Function. Connect UI Chat interface to Gemini API.

### Phase 4: Polish & Launch (Weeks 10-12)
- [ ] **W10**: Post-Processing (Bloom/Vignette) using `expo-three` or custom shaders (impact on FPS check).
- [ ] **W11**: Haptics & Sounds. Add "ambient garden noise" and tap feedback.
- [ ] **W12**: Final Testing (iOS/Android build), Documentation, and Submission.

---

## 6. Performance Guidelines ("60 FPS or Die")
- **Instancing**: Use `<Instances />` from Drei for grass/flowers.
- **Textures**: Compress all textures to KTX2/Basis.
- **Render Loop**: No logic in `useFrame` that allocates memory (avoid GC spikes).
- **UI**: Use `StyleSheet.create` for static styles. Use `Reanimated` for all UI motion.

---

## 7. Testing Strategy

### 7.1 Unit Testing
**Framework**: Jest + React Native Testing Library

**Test Coverage Areas**:
- **Hooks**: `useFocusTimer`, `useGardenStore` (Zustand state logic)
- **Utilities**: Time formatting, XP calculations, level progression
- **Edge Functions**: Mock Gemini API responses, test prompt engineering

**Example Test**:
```typescript
// __tests__/useFocusTimer.test.ts
describe('useFocusTimer', () => {
  it('should increment elapsed time every second', () => {
    const { result } = renderHook(() => useFocusTimer());
    act(() => result.current.start());
    jest.advanceTimersByTime(5000);
    expect(result.current.elapsed).toBe(5);
  });
});
```

### 7.2 Integration Testing
**Framework**: Detox (E2E for React Native)

**Critical User Flows**:
1. **Auth Flow**: Sign up → Email verification → Login
2. **Timer Flow**: Start timer → Plant grows → Complete session → XP awarded
3. **Garden Flow**: View garden → Interact with plant → Check growth stage
4. **AI Flow**: Open chat → Send message → Receive AI response

**Example Detox Test**:
```typescript
describe('Focus Timer', () => {
  it('should start timer and grow plant', async () => {
    await element(by.id('start-timer-btn')).tap();
    await waitFor(element(by.id('timer-running'))).toBeVisible().withTimeout(2000);
    await element(by.id('stop-timer-btn')).tap();
    await expect(element(by.id('plant-stage'))).toHaveText('sprout');
  });
});
```

### 7.3 Performance Testing
**Tools**: React DevTools Profiler, Expo Performance Monitor

**Metrics to Track**:
- **FPS**: Must maintain 60 FPS in 3D garden scene
- **Memory**: Monitor heap size during long sessions (target: <150MB)
- **Bundle Size**: Keep JS bundle under 5MB (use `expo-updates` compression)
- **Time to Interactive (TTI)**: App should be interactive within 3 seconds

**Automated Performance Tests**:
```typescript
// Use React DevTools Profiler API
it('should render garden scene in under 16ms', () => {
  const { result } = renderHook(() => useGardenScene());
  expect(result.current.renderTime).toBeLessThan(16); // 60 FPS = 16ms per frame
});
```

### 7.4 3D Rendering Tests
**Approach**: Visual regression testing with screenshots

**Tools**: `jest-image-snapshot` + Expo GL snapshots

**Test Cases**:
- Plant model loads correctly at each growth stage
- Lighting and shadows render properly
- Post-processing effects (bloom, vignette) apply correctly
- Wisp particles render in correct positions

### 7.5 User Acceptance Testing (UAT)
**Phase**: Week 11-12

**Test Group**: 10-15 university students

**Feedback Areas**:
- UI/UX intuitiveness
- 3D garden visual appeal
- AI coach helpfulness
- Performance on various devices (iOS 15+, Android 11+)

**Success Criteria**:
- 80% of users complete a full focus session
- Average session rating ≥ 4/5
- No critical bugs reported

---

## 8. Deployment & DevOps

### 8.1 Environment Configuration
**Environments**: Development, Staging, Production

**Environment Variables** (`.env` files):
```bash
# .env.development
EXPO_PUBLIC_SUPABASE_URL=https://dev-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...dev-key
EXPO_PUBLIC_GEMINI_API_KEY=AIza...dev-key

# .env.production
EXPO_PUBLIC_SUPABASE_URL=https://prod-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...prod-key
EXPO_PUBLIC_GEMINI_API_KEY=AIza...prod-key
```

### 8.2 CI/CD Pipeline
**Platform**: GitHub Actions + EAS (Expo Application Services)

**Workflow**:
```yaml
# .github/workflows/build.yml
name: Build and Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20
      - run: npm ci
      - run: npm test
      - run: npm run lint
  
  build-preview:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: expo/expo-github-action@v8
      - run: eas build --platform all --profile preview
```

### 8.3 App Store Submission
**Timeline**: Week 12

**iOS (App Store Connect)**:
- Bundle ID: `com.growmind.app`
- Privacy Policy URL required
- App Store screenshots (6.7", 6.5", 5.5" displays)
- Age rating: 4+ (No objectionable content)

**Android (Google Play Console)**:
- Package name: `com.growmind.app`
- Target API Level: 34 (Android 14)
- Content rating: Everyone
- Privacy policy required

### 8.4 Monitoring & Analytics
**Tools**:
- **Sentry**: Error tracking and crash reporting
- **Expo Analytics**: User engagement metrics
- **Supabase Dashboard**: Database performance, API usage

**Key Metrics**:
- Daily Active Users (DAU)
- Average session duration
- Plant growth completion rate
- AI chat engagement rate

---

## 9. Risk Assessment & Mitigation

### 9.1 Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Poor 3D performance on low-end devices** | High | High | Implement quality settings (Low/Medium/High), use LOD (Level of Detail) for models |
| **Expo GL compatibility issues** | Medium | High | Test early on both iOS/Android, have fallback 2D mode |
| **Gemini API rate limits** | Medium | Medium | Implement request queuing, cache common responses |
| **Supabase Realtime connection drops** | Medium | Medium | Implement reconnection logic, offline mode |
| **Large bundle size** | Low | Medium | Code splitting, lazy loading, asset compression |

### 9.2 Timeline Risks

| Risk | Mitigation |
|------|------------|
| **3D model creation takes longer than expected** | Use free assets from Sketchfab/Poly Haven, simplify models |
| **GLSL shader complexity** | Start with simple shaders, iterate later |
| **AI integration challenges** | Use simpler prompt templates, reduce AI features if needed |

### 9.3 Fallback Strategies

**If 3D performance is poor**:
- Reduce polygon count on models
- Disable post-processing effects
- Offer "Performance Mode" with simplified graphics

**If Realtime Wisps are unstable**:
- Make Wisps optional feature
- Show static "X users studying now" counter instead

**If Gemini API is unreliable**:
- Pre-write motivational messages as fallback
- Use simpler rule-based coaching system

---

## 10. Development Environment Setup

### 10.1 Prerequisites
```bash
# Required Software
- Node.js 20+ (LTS)
- npm 10+ or yarn 1.22+
- Git 2.40+
- Expo CLI
- Android Studio (for Android emulator)
- Xcode 15+ (for iOS simulator, macOS only)
```

### 10.2 Initial Setup Commands
```bash
# 1. Install Expo CLI globally
npm install -g expo-cli eas-cli

# 2. Create new Expo project
npx create-expo-app@52 growmind --template expo-template-blank-typescript

# 3. Navigate to project
cd growmind

# 4. Install core dependencies
npm install @react-three/fiber @react-three/drei expo-gl three
npm install @supabase/supabase-js
npm install zustand react-native-reanimated
npm install expo-router

# 5. Install dev dependencies
npm install -D @types/three jest @testing-library/react-native detox

# 6. Initialize EAS (Expo Application Services)
eas init

# 7. Start development server
npx expo start
```

### 10.3 Project Configuration Files

**`app.json`** (Expo configuration):
```json
{
  "expo": {
    "name": "GrowMind",
    "slug": "growmind",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#1a1a2e"
    },
    "plugins": [
      "expo-router",
      "expo-gl"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.growmind.app"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#1a1a2e"
      },
      "package": "com.growmind.app"
    }
  }
}
```

**`tsconfig.json`** (TypeScript configuration):
```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "paths": {
      "@/*": ["./src/*"],
      "@components/*": ["./components/*"],
      "@hooks/*": ["./hooks/*"],
      "@lib/*": ["./lib/*"]
    }
  }
}
```

### 10.4 Supabase Project Setup
1. Go to [supabase.com](https://supabase.com) and create new project
2. Note down:
   - Project URL
   - Anon/Public API Key
   - Service Role Key (for Edge Functions)
3. Run database migrations (see Section 2.1 for schema)
4. Enable Realtime on `presence` table
5. Deploy Edge Functions:
```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref your-project-ref

# Deploy function
supabase functions deploy grow-ai-coach
```

---

## 11. Code Quality & Standards

### 11.1 Linting & Formatting
**ESLint** + **Prettier** configuration:

```json
// .eslintrc.json
{
  "extends": ["expo", "prettier"],
  "plugins": ["prettier"],
  "rules": {
    "prettier/prettier": "error",
    "no-console": "warn",
    "react-hooks/exhaustive-deps": "warn"
  }
}
```

### 11.2 Git Workflow
**Branching Strategy**: GitHub Flow

- `main`: Production-ready code
- `develop`: Integration branch
- `feature/*`: New features
- `fix/*`: Bug fixes

**Commit Convention**: Conventional Commits
```
feat: add plant growth animation
fix: resolve timer pause bug
docs: update README with setup instructions
test: add unit tests for useGardenStore
```

### 11.3 Code Review Checklist
- [ ] TypeScript types are properly defined (no `any`)
- [ ] Components are properly memoized (`React.memo`, `useMemo`, `useCallback`)
- [ ] No memory leaks (cleanup in `useEffect`)
- [ ] Accessibility labels added (`accessibilityLabel`)
- [ ] Performance tested (no frame drops)
