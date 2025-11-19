# Autonomous Manuscript Generation Setup
## Generate Complete Manuscripts While You Sleep

This guide will help you set up fully autonomous manuscript generation using Claude.ai web credits (not API).

---

## Quick Start (5 Minutes)

### 1. Get Your Claude Session Cookie

**You MUST do this first** - the automation needs your session cookie to use claude.ai on your behalf.

#### Option A: Browser DevTools (Easiest)
1. Open Chrome/Edge and go to https://claude.ai
2. Log in with your account
3. Press `F12` to open DevTools
4. Go to `Application` tab → `Cookies` → `https://claude.ai`
5. Find cookie named `sessionKey` or similar (look for a long string)
6. Copy the entire value
7. Save it for the next step

#### Option B: Use the Test Script
```bash
# This opens a browser for manual login
node scripts/claude-automation.js
# After you log in, it will extract and display your session cookie
```

### 2. Create .env File

```bash
# Copy the example
cp .env.example .env

# Edit .env and add your session cookie
nano .env  # or use any text editor
```

Add this to `.env`:
```env
# Essential - Get this from Step 1
CLAUDE_SESSION_COOKIE=your-session-cookie-here

# Generate a random 32-character string (optional but recommended)
N8N_ENCRYPTION_KEY=generate-random-32-chars-here

# Set a secure password
POSTGRES_PASSWORD=choose-a-secure-password

# Optional: Browserless token (leave blank for no auth)
BROWSERLESS_TOKEN=

# Optional: GitHub for auto-commits
GITHUB_TOKEN=
GITHUB_REPO=scottmcquaig/scoot-kidd-classics
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Choose Your Running Mode

You have 3 options:

---

## Running Modes

### Mode 1: Direct Script (Simplest)

Run the generator directly without Docker:

```bash
# Generate one manuscript
node scripts/autonomous-manuscript-generator.js

# Generate ALL manuscripts continuously
node scripts/autonomous-manuscript-generator.js --continuous
```

**Perfect for:** Testing, running on your local machine while it's on

---

### Mode 2: Docker + n8n (Scheduled Automation)

Run in Docker with n8n scheduling:

```bash
# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

Then:
1. Open http://localhost:5678
2. Create n8n account
3. Import `workflows/autonomous-manuscript-workflow.json`
4. Activate the workflow
5. It will run every 6 hours automatically

**Perfect for:** Server/cloud deployment, scheduled runs, running 24/7

---

### Mode 3: Cron Job (Lightweight)

Set up a cron job to run the script:

```bash
# Edit crontab
crontab -e

# Add this line (runs every 6 hours)
0 */6 * * * cd /path/to/scoot-kidd-classics && node scripts/autonomous-manuscript-generator.js >> logs/manuscript-generator.log 2>&1
```

**Perfect for:** VPS/cloud server, minimal resource usage

---

## How It Works

### The Autonomous Pipeline

```
1. 📚 Load Ideas
   └─ Reads ideas/manuscript-ideas.json
   └─ Selects next manuscript with status "idea"

2. 📝 Generate Outline
   └─ Sends prompt to Claude.ai
   └─ Creates detailed chapter-by-chapter outline
   └─ Saves to manuscripts/outlines/

3. ✍️  Write Chapters (Loop)
   └─ For each chapter:
      ├─ Sends chapter-specific prompt
      ├─ Waits for complete response
      ├─ Saves to manuscripts/drafts/{book-id}/
      └─ Adds 5-second delay (avoid rate limits)

4. ✨ Polish & Combine
   └─ Combines all chapters
   └─ Sends for final polish/edit
   └─ Saves to manuscripts/completed/

5. ✅ Update Status
   └─ Marks manuscript as "completed"
   └─ Moves to next manuscript

6. 🔄 Repeat
   └─ Continues until all manuscripts done
```

### What Gets Created

```
manuscripts/
├── outlines/
│   ├── stoic-trader-outline.md
│   ├── digital-discipline-outline.md
│   └── arena-of-life-outline.md
├── drafts/
│   ├── stoic-trader/
│   │   ├── chapter-01.md
│   │   ├── chapter-02.md
│   │   └── ...
│   └── digital-discipline/
│       └── ...
└── completed/
    ├── stoic-trader.md          ← Final polished manuscript
    ├── digital-discipline.md
    └── arena-of-life.md
```

---

## Customization

### Add More Manuscript Ideas

Edit `ideas/manuscript-ideas.json`:

```json
{
  "manuscripts": [
    {
      "id": "my-new-book",
      "title": "Your Book Title",
      "genre": "Your Genre",
      "tone": "Your Tone/Style",
      "targetWordCount": 50000,
      "chapters": 12,
      "description": "What the book is about",
      "status": "idea"
    }
  ]
}
```

### Adjust Generation Settings

Edit `ideas/manuscript-ideas.json` → `generationSettings`:

```json
{
  "generationSettings": {
    "chapterWordCount": 4000,
    "style": "engaging, conversational yet philosophical",
    "includeExamples": true,
    "includeExercises": true
  }
}
```

### Change Schedule (n8n Mode)

In n8n workflow, modify the Schedule Trigger:
- Every 3 hours: Change `hoursInterval` to `3`
- Every 12 hours: Change to `12`
- Daily at specific time: Use cron expression

---

## Monitoring & Troubleshooting

### Check Progress

```bash
# See what's being generated
ls -la manuscripts/drafts/

# View completed manuscripts
ls -la manuscripts/completed/

# Check current status
cat ideas/manuscript-ideas.json | grep -A 2 "status"
```

### View Logs

**Direct Script Mode:**
```bash
# Logs go to console (STDOUT)
node scripts/autonomous-manuscript-generator.js 2>&1 | tee logs/generation.log
```

**Docker Mode:**
```bash
docker-compose logs -f n8n
docker-compose logs -f browserless
```

### Common Issues

#### ❌ Session Cookie Expired
**Symptom:** Login fails, "Please log in" errors
**Solution:** Get a fresh session cookie (Step 1)

```bash
# Test your session cookie
node scripts/test-browser.js
```

#### ❌ Rate Limiting
**Symptom:** Errors after several prompts
**Solution:** Increase delays in `autonomous-manuscript-generator.js`

```javascript
// Line ~256: Increase delay between chapters
await this.delay(10000); // 10 seconds instead of 5
```

#### ❌ Selectors Not Found
**Symptom:** "Could not find input element"
**Solution:** Claude.ai UI changed, update selectors

```bash
# Check current UI and update:
# scripts/claude-automation.js lines 115-119
```

#### ❌ Docker Services Won't Start
```bash
# Check Docker is running
docker version

# Check ports aren't in use
lsof -i :5678
lsof -i :3000

# Restart everything
docker-compose down
docker-compose up -d
```

---

## Resource Usage & Cost

### Credit Consumption
- **1 Chapter** ≈ 4,000 words ≈ 1 Claude web conversation
- **1 Book** (12 chapters) ≈ 15-20 conversations
- **Outline + Polish** ≈ 2-3 additional conversations

**Estimated:** 1 complete book uses ~20 web credits

### Time Estimates
- **Outline:** 2-3 minutes
- **1 Chapter:** 3-5 minutes (including delays)
- **Complete Book:** 45-60 minutes
- **3 Books:** 2-3 hours total

### Running Continuously
```bash
# Let it run overnight
nohup node scripts/autonomous-manuscript-generator.js --continuous > logs/generation.log 2>&1 &

# Check process
ps aux | grep autonomous

# Stop it
pkill -f autonomous-manuscript-generator
```

---

## Advanced: Cloud Deployment

### Deploy to Cloud Server

1. **Get a cheap VPS** ($5/month)
   - DigitalOcean, Linode, Vultr, etc.
   - Ubuntu 22.04
   - 2GB RAM minimum

2. **Clone repo and set up**
```bash
git clone https://github.com/scottmcquaig/scoot-kidd-classics.git
cd scoot-kidd-classics
npm install
cp .env.example .env
nano .env  # Add your session cookie
```

3. **Run continuously**
```bash
# Using tmux (survives disconnect)
tmux new -s manuscripts
node scripts/autonomous-manuscript-generator.js --continuous

# Detach: Ctrl+B, then D
# Re-attach later: tmux attach -t manuscripts
```

4. **Auto-commit to GitHub** (optional)
```bash
# Add to script/autonomous-manuscript-generator.js after line 198:
const { execSync } = require('child_process');
execSync('git add manuscripts/ && git commit -m "Add manuscript" && git push', { cwd: this.manuscriptsPath });
```

---

## Security Notes

⚠️ **IMPORTANT:**
- Never commit `.env` to git
- Session cookies expire (~30 days)
- Keep your session cookie private
- Use environment variables for all secrets

---

## FAQ

**Q: Can I run this on Windows?**
A: Yes! Use WSL2 or run the Docker mode.

**Q: Will this work with Claude Pro/free tier?**
A: Yes, but rate limits vary. Pro tier recommended for continuous generation.

**Q: Can I edit the manuscripts it creates?**
A: Absolutely! They're saved as markdown files. Edit freely.

**Q: What if Claude's UI changes?**
A: Update the selectors in `scripts/claude-automation.js` (lines 115-119, 195-200)

**Q: Can I pause/resume generation?**
A: Yes! Stop the script, manually update status in `manuscript-ideas.json`, restart.

**Q: How do I add my own writing style?**
A: Edit the prompts in `autonomous-manuscript-generator.js` to include style examples.

---

## Next Steps

1. ✅ Get session cookie
2. ✅ Create .env file
3. ✅ Run test: `node scripts/autonomous-manuscript-generator.js`
4. ✅ Let it run: Add `--continuous` flag
5. 🎉 Wake up to finished manuscripts!

---

**Pro Tip:** Start with one manuscript first to ensure everything works, then let it run continuously for all three.

Good luck with your autonomous manuscript generation! 🚀📚
