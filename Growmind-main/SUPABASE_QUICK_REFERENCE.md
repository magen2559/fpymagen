# Supabase Integration - Quick Reference

## ✅ Configuration Complete!

Your Supabase is now fully integrated with GrowMind.

---

## 📊 Project Details

**Project URL**: https://yomboqzsvclqviuenmfg.supabase.co  
**Project ID**: yomboqzsvclqviuenmfg  
**Region**: Configured

---

## 🔑 API Keys (Saved in .env)

### For Client App (React Native)
- **URL**: `EXPO_PUBLIC_SUPABASE_URL`
- **Anon Key**: `EXPO_PUBLIC_SUPABASE_ANON_KEY`

### For Server/Edge Functions (NOT in app)
- **Service Role Key**: Stored in `supabase-credentials.json`

---

## 📁 Files Created

1. **`app-src/.env`** - Environment variables (NOT in Git ✅)
2. **`app-src/lib/supabase.ts`** - Supabase client configuration
3. **`supabase-credentials.json`** - Backup of all credentials (NOT in Git ✅)

---

## 🚀 How to Use Supabase in Your App

### Import the Client
```typescript
import { supabase } from './lib/supabase';
```

### Example: Sign Up
```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'securepassword123',
});
```

### Example: Sign In
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'securepassword123',
});
```

### Example: Get Current User
```typescript
const { data: { user } } = await supabase.auth.getUser();
```

### Example: Query Database
```typescript
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', user.id);
```

---

## 🗄️ Next Steps: Create Database Tables

Go to your Supabase dashboard and run these SQL commands:

### 1. Enable UUID Extension
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### 2. Create Profiles Table
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  garden_theme TEXT DEFAULT 'zen',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);
```

### 3. Create Sessions Table
```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  duration_seconds INTEGER,
  tag TEXT,
  status TEXT CHECK (status IN ('completed', 'abandoned')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sessions"
  ON sessions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions"
  ON sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### 4. Create Plants Table
```sql
CREATE TABLE plants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('bonsai', 'sakura', 'fern')),
  stage INTEGER DEFAULT 0 CHECK (stage >= 0 AND stage <= 3),
  health FLOAT DEFAULT 1.0 CHECK (health >= 0.0 AND health <= 1.0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE plants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own plants"
  ON plants FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own plants"
  ON plants FOR ALL USING (auth.uid() = user_id);
```

---

## 🔐 Security Reminders

✅ `.env` file is in `.gitignore` - credentials won't be committed  
✅ `supabase-credentials.json` is in `.gitignore`  
✅ Using anon key for client (safe for public apps)  
✅ Service role key kept separate (for Edge Functions only)  
✅ Row Level Security (RLS) enabled on all tables

---

## 📚 Useful Supabase Commands

### Check Auth Status
```typescript
supabase.auth.onAuthStateChange((event, session) => {
  console.log(event, session);
});
```

### Sign Out
```typescript
await supabase.auth.signOut();
```

### Realtime Subscription
```typescript
const channel = supabase
  .channel('public:plants')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'plants' },
    (payload) => console.log(payload)
  )
  .subscribe();
```

---

## 🆘 Troubleshooting

### Error: "Invalid API key"
- Check `.env` file exists in `app-src/` folder
- Verify keys are correct (no extra spaces)
- Restart Expo dev server: `npm start`

### Error: "Row Level Security"
- Make sure RLS policies are created
- Check user is authenticated before querying

### Can't connect to Supabase
- Verify project URL is correct
- Check internet connection
- Ensure Supabase project is active (not paused)

---

**Supabase is ready! Start building with authentication and database! 🚀**
