# Step-by-Step: Supabase MCP Setup

## 🎯 Goal
Configure Supabase MCP server so your AI assistant can directly query and manage your GrowMind database.

---

## Step 1: Locate Your MCP Configuration File

The MCP configuration file location depends on which AI assistant you're using:

### For Google AI Studio / Gemini
- **Windows**: `%APPDATA%\Google\AIStudio\config.json`
- **Full path**: `C:\Users\daniel\AppData\Roaming\Google\AIStudio\config.json`

### For Claude Desktop
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Full path**: `C:\Users\daniel\AppData\Roaming\Claude\claude_desktop_config.json`

### For Other AI Assistants
Check your assistant's documentation for MCP configuration location.

---

## Step 2: Check if Config File Exists

Let's check if the file exists:

```powershell
# For Google AI Studio
Test-Path "$env:APPDATA\Google\AIStudio\config.json"

# For Claude Desktop
Test-Path "$env:APPDATA\Claude\claude_desktop_config.json"
```

If it returns `False`, you'll need to create it.

---

## Step 3: Your Supabase Credentials

You already have these from earlier:

```
Project URL: https://yomboqzsvclqviuenmfg.supabase.co
Service Role Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvbWJvcXpzdmNscXZpdWVubWZnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDkwNzA0NywiZXhwIjoyMDg2NDgzMDQ3fQ.r85P6OPznLZngSlck_jo_ABHtgI2zMl2fy_sVwV8ivQ
```

---

## Step 4: Configuration to Add

Here's the exact configuration for your Supabase MCP:

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
        "SUPABASE_URL": "https://yomboqzsvclqviuenmfg.supabase.co",
        "SUPABASE_SERVICE_ROLE_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvbWJvcXpzdmNscXZpdWVubWZnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDkwNzA0NywiZXhwIjoyMDg2NDgzMDQ3fQ.r85P6OPznLZngSlck_jo_ABHtgI2zMl2fy_sVwV8ivQ"
      }
    }
  }
}
```

---

## Step 5: How to Add the Configuration

### Option A: If File Doesn't Exist (Create New)

1. Open File Explorer
2. Navigate to: `C:\Users\daniel\AppData\Roaming\`
3. Find your AI assistant's folder (Google, Claude, etc.)
4. Create a new file: `config.json` or `claude_desktop_config.json`
5. Paste the configuration above
6. Save the file

### Option B: If File Already Exists (Edit Existing)

1. Open the existing config file in a text editor
2. If it already has `mcpServers`, add the `supabase` section inside it
3. If it's empty or has other settings, merge them together

**Example of merging**:
```json
{
  "existingSetting": "value",
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-supabase"],
      "env": {
        "SUPABASE_URL": "https://yomboqzsvclqviuenmfg.supabase.co",
        "SUPABASE_SERVICE_ROLE_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
      }
    }
  }
}
```

---

## Step 6: Restart Your AI Assistant

After saving the configuration:

1. **Close** your AI assistant completely
2. **Reopen** it
3. The MCP server should now be available

---

## Step 7: Test the Connection

Once your AI assistant restarts, try asking:

```
"Can you list my Supabase tables?"
```

or

```
"Can you show me the schema of my database?"
```

If it works, you'll see your database information! 🎉

---

## 🆘 Troubleshooting

### Can't Find AppData Folder?
1. Open File Explorer
2. Type in address bar: `%APPDATA%`
3. Press Enter
4. This will take you to the AppData\Roaming folder

### MCP Not Working After Restart?
- Check the JSON syntax is correct (no missing commas or brackets)
- Verify the service_role key is complete (no line breaks)
- Check the AI assistant's logs for error messages

### Still Not Working?
- Make sure you're using the **service_role** key, not the anon key
- Verify your Supabase project is active (not paused)
- Try running `npx -y @modelcontextprotocol/server-supabase` in PowerShell to test if the package works

---

## ✅ What You Can Do After Setup

Once Supabase MCP is working, you can ask your AI assistant to:

- 📊 Query your database tables
- 🔍 Check table schemas
- ➕ Create new tables
- 🔐 Set up Row Level Security policies
- 📝 Insert test data
- 🔄 Run migrations
- 🐛 Debug database issues

---

**Let me know which AI assistant you're using, and I can help you find the exact config file location!** 🚀
