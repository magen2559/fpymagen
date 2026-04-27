# 🌳 GrowMind: A to Z Logic & Architecture

This document explains the full technical "A to Z" of the GrowMind application, covering the architecture, features, and the intelligent logic that connects them.

---

## 🏗️ 1. Project Architecture & Technologies
GrowMind is a hybrid mobile application built using **Expo (React Native)**. It follows a "BFF" (Backend-for-Frontend) architecture where the frontend handles the UI/3D and the backend handles the security and long-term storage.

### Core Tech Stack:
- **Frontend**: React Native with Expo Router (File-based routing).
- **3D Engine**: Three.js & React Three Fiber (R3F).
- **Backend/Database**: Supabase (PostgreSQL + Auth + Edge Functions).
- **Language**: TypeScript (for strict type safety).

---

## 🧬 2. The Type System (TypeScript)
TypeScript acts as the **"Truth"** for the whole app. It prevents bugs by enforcing strict rules.
- **Database Mapping**: Every table in the database has a matching TypeScript interface in `types/database.ts`.
- **Constraint Enforcement**: Things like `garden_theme` or `plantType` use **Enums** so that the code can never accidentally use a theme or plant that doesn't exist.
- **Intellisense**: Developers get instant autocompletion, which speeds up building complex features like the 3D garden.

---

## 🔗 3. Backend Integration (Supabase)
Connected in `lib/supabase.ts`, the app uses a secure bridge to the database.
- **Authentication**: Managed via Supabase Auth. Sessions are persisted using `AsyncStorage`, so you stay logged in after closing the app.
- **Real-time Data**: When you complete a focus session, the database is updated instantly, and the UI reacts using React Hooks.
- **Edge Functions**: The AI Chat doesn't talk to a raw API. It calls a secure "Edge Function" in Supabase, keeping API keys hidden from users.

---

## ⏱️ 4. Core Mechanic: The Focus Timer
The heart of the app is the **Pomodoro Timer** located in `app/(tabs)/focus.tsx`.

### 🛡️ Strict Mode Logic:
This is a critical psychological feature. 
1. The app uses **AppState API** to detect if the user leaves the app (to check social media).
2. If **Strict Mode is ON** and the user leaves, the session is instantly **ABANDONED**.
3. **The Result**: Instead of a healthy tree, a **Dead Tree (gray & withered)** is planted in the garden. This creates a "cost" to being distracted.

---

## 🌲 5. The 3D Garden (Gamification)
Your productivity is visualized as a physical garden in `app/garden_viewer.tsx`.

### Positioning Algorithm (`lib/garden.ts`):
To prevent trees from overlapping, I developed a **Trigonometry-based Spacing Algorithm**:
- Trees are planted in **concentric rings**.
- Each new tree's position $(x, z)$ is calculated using `Math.sin` and `Math.cos` based on the total number of trees already in the garden.
- This ensures the garden grows outward in a beautiful, natural spiral.

### Rendering:
- Trees are built using **Geometries** (Cylinders for trunks, Cones for leaves) rather than heavy 3D files. This keeps the app fast and responsive.
- **Harvesting**: Trees can "glow" with gold spheres. Clicking them triggers a database update to award bonus coins.

---

## 🤖 6. AI Coach (Mental Health Support)
Located in `app/(tabs)/chat.tsx`, the AI coach isn't generic.

### Context Injection:
Whenever you send a message, the app silently bundles your **Stats** (Level, Streak, Coin count) and sends them to the AI.
- **The Logic**: This allows the AI to give advice like: "I see you're on a 5-day streak! Don't push yourself too hard today."
- **Sanitization**: All error messages are "cleaned" so users never see technical jargon, only supportive guidance.

---

## 💰 7. Economy & Progression
The app rewards hard work through a dual-currency system managed in `lib/progression.ts`.

### Logic Flow:
1. **Coins**: Earned per focus session. There is a `DAILY_COIN_LIMIT` (150) to prevent burnout and encourage consistent habits.
2. **XP (Experience Points)**: Every session gives XP. When `XP >= 100`, you level up and earn a new title (e.g., "Seedling" -> "Forest Guardian").
3. **Achievements**: The logic checks your stats after every session (e.g., "Did they just plant their 10th tree?") and unlocks badges in the database.
4. **Voucher Shop**: Users spend their coins here to buy real-world rewards or digital customizations.

---

## 📁 8. Folder Map Summary
- **`/app`**: The UI screens and navigation logic.
- **`/lib`**: The "Engines" (Supabase client, 3D math, Sound manager).
- **`/components`**: Reusable parts like the Timer Ring or Achievement Badges.
- **`/constants`**: Global settings like coin limits and theme colors.
- **`/contexts`**: Manages global states like "Who is the currently logged-in user?"

---
**GrowMind** is designed to turn the abstract concept of "Time Management" into a tangible, digital environment that people care about protecting.
