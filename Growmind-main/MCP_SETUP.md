# MCP Server Setup Guide - Supabase & GitHub

## 🔌 What are MCP Servers?

**MCP (Model Context Protocol)** servers allow your AI assistant to directly interact with services like Supabase and GitHub, making development faster and more integrated.

### Benefits:
- 🗄️ **Supabase MCP**: Directly query database, manage tables, run migrations
- 🐙 **GitHub MCP**: Create repos, manage issues, push commits, create PRs
- ⚡ **Faster Development**: No need to switch between tools
- 🤖 **AI-Assisted**: Your assistant can help with database queries and Git operations

---

## 📋 Prerequisites

Before setting up MCP servers, you need:

### For Supabase MCP:
- [ ] Supabase account created
- [ ] Supabase project created
- [ ] Project URL and API keys

### For GitHub MCP:
- [ ] GitHub account
- [ ] Personal Access Token (PAT) with appropriate permissions

---

## 🗄️ Part 1: Supabase Setup

### Step 1: Create Supabase Account & Project

1. **Go to Supabase**:
   - Visit: https://supabase.com
   - Click "Start your project"
   - Sign up with GitHub or email

2. **Create New Project**:
   - Click "New Project"
   - **Organization**: Create new or use existing
   - **Project Name**: `growmind`
   - **Database Password**: Create a strong password (SAVE THIS!)
   - **Region**: Choose closest to you (e.g., Southeast Asia - Singapore)
   - Click "Create new project"
   - Wait ~2 minutes for project to initialize

3. **Get Your Credentials**:
   
   Once project is ready, go to **Settings → API**:
   
   ```
   Project URL: https://xxxxxxxxxxxxx.supabase.co
   anon/public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
   
   **Save these securely!**

### Step 2: Configure Supabase MCP Server

The Supabase MCP server configuration depends on your AI assistant's settings. Typically, you'll need to add this to your MCP configuration file:

**Example Configuration** (format may vary):

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-supabase"
      ],
      "env": {
        "SUPABASE_URL": "https://xxxxxxxxxxxxx.supabase.co",
        "SUPABASE_SERVICE_ROLE_KEY": "your-service-role-key-here"
      }
    }
  }
}
```

**Important**: Use the **service_role** key for MCP, not the anon key (it has more permissions).

---

## 🐙 Part 2: GitHub Setup

### Step 1: Create GitHub Personal Access Token

1. **Go to GitHub Settings**:
   - Visit: https://github.com/settings/tokens
   - Or: GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)

2. **Generate New Token**:
   - Click "Generate new token (classic)"
   - **Note**: "GrowMind FYP Development"
   - **Expiration**: 90 days (or custom)
   
3. **Select Scopes** (permissions):
   ```
   ✅ repo (Full control of private repositories)
      ✅ repo:status
      ✅ repo_deployment
      ✅ public_repo
      ✅ repo:invite
   ✅ workflow (Update GitHub Action workflows)
   ✅ write:packages (Upload packages)
   ✅ read:packages (Download packages)
   ✅ delete:packages (Delete packages)
   ```

4. **Generate Token**:
   - Click "Generate token"
   - **COPY THE TOKEN IMMEDIATELY** (you won't see it again!)
   - Save it securely (e.g., password manager)

### Step 2: Configure GitHub MCP Server

**Example Configuration**:

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-github"
      ],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
      }
    }
  }
}
```

---

## 🔧 Part 3: Combined MCP Configuration

### Full Configuration Example

Here's how both servers would look together:

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-supabase"],
      "env": {
        "SUPABASE_URL": "https://xxxxxxxxxxxxx.supabase.co",
        "SUPABASE_SERVICE_ROLE_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
      }
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
      }
    }
  }
}
```

### Where to Add This Configuration

The location depends on your AI assistant:

**For Claude Desktop** (if using):
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`
- Mac: `~/Library/Application Support/Claude/claude_desktop_config.json`

**For other AI assistants**: Check their documentation for MCP configuration location.

---

## 🗄️ Part 4: Set Up Supabase Database Schema

Once Supabase MCP is connected, you can create the database schema for GrowMind.

### Database Tables (from implementation_plan.md)

#### 1. Profiles Table
```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table (extends auth.users)
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

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);
```

#### 2. Sessions Table
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
  ON sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions"
  ON sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

#### 3. Plants Table
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
  ON plants FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own plants"
  ON plants FOR ALL
  USING (auth.uid() = user_id);
```

---

## 🐙 Part 5: Connect GitHub Repository

### Option 1: Create New GitHub Repository

If you want to backup your code to GitHub:

1. **Create Repository on GitHub**:
   - Go to: https://github.com/new
   - **Repository name**: `growmind-fyp`
   - **Description**: "GrowMind - Cinematic Productivity Ecosystem (Final Year Project)"
   - **Visibility**: Private (recommended for academic work)
   - **Don't** initialize with README (we already have files)
   - Click "Create repository"

2. **Connect Local Repository**:
   ```bash
   # Add remote
   git remote add origin https://github.com/YOUR_USERNAME/growmind-fyp.git
   
   # Verify
   git remote -v
   
   # Push to GitHub
   git branch -M main
   git push -u origin main
   ```

### Option 2: Use MCP to Create Repository

Once GitHub MCP is configured, you can ask your AI assistant to:
- Create the repository
- Set up branch protection rules
- Create initial issues
- Set up GitHub Actions

---

## ✅ Verification Checklist

### Supabase Setup
- [ ] Supabase account created
- [ ] Project "growmind" created
- [ ] Project URL saved
- [ ] Service role key saved
- [ ] Supabase MCP server configured
- [ ] Database tables created
- [ ] Row Level Security enabled

### GitHub Setup
- [ ] GitHub account ready
- [ ] Personal Access Token created
- [ ] Token saved securely
- [ ] GitHub MCP server configured
- [ ] (Optional) Remote repository created
- [ ] (Optional) Local repo connected to GitHub

---

## 🔐 Security Best Practices

### Never Commit Secrets!
```bash
# These should NEVER be in Git:
- Supabase service_role key
- GitHub Personal Access Token
- Database passwords
- API keys
```

### Use Environment Variables
Store secrets in `.env` file (already in `.gitignore`):

```env
# .env (in app-src folder)
EXPO_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc... (anon key for client)

# For server/edge functions (NOT in app)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... (service role key)
```

---

## 🚀 Next Steps After MCP Setup

Once MCP servers are configured:

1. **Test Supabase Connection**:
   - Ask AI to query your database
   - Create a test table
   - Verify Row Level Security

2. **Test GitHub Connection**:
   - Ask AI to check repository status
   - Create an issue
   - View commit history

3. **Start Development**:
   - Use AI to help with database queries
   - Get assistance with Git operations
   - Streamline your workflow

---

## 📚 Resources

- **Supabase Docs**: https://supabase.com/docs
- **GitHub PAT Guide**: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token
- **MCP Documentation**: Check your AI assistant's documentation

---

## 🆘 Troubleshooting

### Supabase MCP Not Working
- Verify service_role key (not anon key)
- Check project URL is correct
- Ensure project is fully initialized (not still setting up)

### GitHub MCP Not Working
- Verify token has correct scopes
- Check token hasn't expired
- Ensure token is saved correctly (no extra spaces)

### Can't Find MCP Config File
- Check your AI assistant's documentation
- Look for settings or preferences menu
- May need to create the file manually

---

**MCP servers will supercharge your development workflow! 🚀**
