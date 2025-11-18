# Scoot-Kidd Classics User Guide
## n8n + Claude Code Web + Puppeteer Automation Stack

### Table of Contents
1. [Quick Start](#quick-start)
2. [Initial Setup](#initial-setup)
3. [Getting Your Claude Session Cookie](#getting-your-claude-session-cookie)
4. [Running the Stack](#running-the-stack)
5. [Configuring n8n](#configuring-n8n)
6. [Testing the Automation](#testing-the-automation)
7. [Monitoring Progress](#monitoring-progress)
8. [Troubleshooting](#troubleshooting)
9. [Advanced Configuration](#advanced-configuration)

---

## Quick Start

### Prerequisites
- Docker Desktop installed and running
- Node.js v18+ installed
- Chrome/Edge browser for Claude login
- GitHub account for manuscript storage

### One-Command Setup (Windows)
```batch
# Run in PowerShell or Command Prompt
setup.bat
```

### One-Command Setup (Mac/Linux)
```bash
chmod +x setup.sh
./setup.sh
```

---

## Initial Setup

### 1. Clone or Initialize Repository
```bash
git init
git remote add origin https://github.com/scottmcquaig/scoot-kidd-classics.git
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment
Copy `.env.example` to `.env` and update:
```env
# Generate a 32-character key
N8N_ENCRYPTION_KEY=<generate-random-32-char-string>

# Set a secure password
POSTGRES_PASSWORD=<your-secure-password>

# Optional: Browserless auth token
BROWSERLESS_TOKEN=<optional-token>

# Required: Your Claude session (see next section)
CLAUDE_SESSION_COOKIE=<your-session-cookie>

# GitHub config
GITHUB_TOKEN=<your-github-pat>
GITHUB_REPO=scottmcquaig/scoot-kidd-classics
```

---

## Getting Your Claude Session Cookie

### Method 1: Browser Developer Tools
1. Open Chrome/Edge and navigate to https://claude.ai
2. Log in with your account
3. Press `F12` to open Developer Tools
4. Go to `Application` tab → `Cookies` → `https://claude.ai`
5. Find the cookie named `session` or `__Secure-session`
6. Copy the entire value (it's long!)
7. Add to your `.env` file

### Method 2: Automated Extraction
```bash
# This will open a browser for you to log in
node scripts/claude-automation.js

# After login, the script will output your session cookie
# Copy it to your .env file
```

### Cookie Tips
- Session cookies expire after ~30 days
- Keep a backup of working cookies
- If automation fails, refresh the cookie

---

## Running the Stack

### Start All Services
```bash
# Start n8n, Browserless, and PostgreSQL
npm run start

# Or using docker-compose directly
docker-compose up -d
```

### Check Service Status
```bash
docker-compose ps

# Should show:
# n8n           Running   0.0.0.0:5678->5678/tcp
# browserless   Running   0.0.0.0:3000->3000/tcp
# postgres      Running   5432/tcp
```

### Access Points
- **n8n UI**: http://localhost:5678
- **Browserless**: http://localhost:3000
- **Logs**: `npm run logs`

---

## Configuring n8n

### 1. Create n8n Account
1. Open http://localhost:5678
2. Create your admin account
3. Skip the setup wizard

### 2. Import Workflow
1. Click `Workflows` → `Add Workflow` → `Import from File`
2. Select `workflows/claude-manuscript-workflow.json`
3. Click `Import`

### 3. Configure Credentials

#### Browserless Credentials
1. Go to `Credentials` → `Create New`
2. Search for "Header Auth"
3. Name: "Browserless Auth"
4. Add Header:
   - Name: `Authorization`
   - Value: `Bearer YOUR_BROWSERLESS_TOKEN`

#### GitHub Credentials
1. Create Personal Access Token at https://github.com/settings/tokens
2. In n8n: `Credentials` → `Create New` → "GitHub"
3. Add your token with `repo` scope

#### Environment Variables
1. Go to `Settings` → `Variables`
2. Add:
   - `CLAUDE_SESSION_COOKIE`: Your session cookie
   - `GITHUB_REPO`: scottmcquaig/scoot-kidd-classics

### 4. Activate Workflow
1. Open the imported workflow
2. Click the toggle to `Active`
3. Workflow will run on schedule or manually

---

## Testing the Automation

### Test Claude Connection
```bash
# Test browser automation
npm run test-puppeteer

# Should output:
# ✓ Browser launched
# ✓ Claude accessed
# ✓ Session valid
# ✓ Test prompt sent
# ✓ Response received
```

### Test Single Prompt
```javascript
// scripts/test-single.js
const ClaudeAutomation = require('./scripts/claude-automation');

const test = async () => {
    const automation = new ClaudeAutomation(process.env.CLAUDE_SESSION_COOKIE);
    await automation.initialize();
    await automation.login();

    const response = await automation.sendPrompt(
        "Write a haiku about coding"
    );

    console.log("Claude says:", response);
    await automation.close();
};

test();
```

### Manual Workflow Trigger
1. Open workflow in n8n
2. Click `Execute Workflow` button
3. Watch execution in real-time

---

## Monitoring Progress

### Real-time Logs
```bash
# All services
npm run logs

# Specific service
docker-compose logs -f n8n
docker-compose logs -f browserless

# Last 100 lines
docker-compose logs --tail=100
```

### n8n Execution History
1. Open n8n UI
2. Click on workflow
3. Go to `Executions` tab
4. View success/failure and outputs

### Browser Automation Monitoring
```bash
# Watch Puppeteer in action (non-headless mode)
# Edit scripts/claude-automation.js
# Set: headless: false
node scripts/claude-automation.js
```

### Check Generated Manuscripts
```bash
# Local storage
ls manuscripts/

# GitHub repository
https://github.com/scottmcquaig/scoot-kidd-classics
```

---

## Troubleshooting

### Common Issues

#### 1. "Session expired" Error
**Solution**: Get a fresh session cookie
```bash
# Manual login and cookie extraction
node scripts/claude-automation.js
```

#### 2. Docker Services Not Starting
**Solution**: Check Docker and ports
```bash
# Ensure Docker Desktop is running
docker version

# Check port conflicts
netstat -an | findstr :5678
netstat -an | findstr :3000

# Restart services
docker-compose down
docker-compose up -d
```

#### 3. Puppeteer Can't Find Chrome
**Solution**: Install Chrome dependencies
```bash
# Windows: Chrome should work out of box

# Linux: Install dependencies
sudo apt-get update
sudo apt-get install -y chromium-browser
```

#### 4. n8n Workflow Fails
**Check**:
- Credentials are configured correctly
- Environment variables are set
- Check execution logs in n8n UI

#### 5. Claude Selectors Changed
**Solution**: Update selectors in `scripts/claude-automation.js`
```javascript
// Common selectors to update
const inputSelectors = [
    '[data-testid="composer-input"]',  // Current
    'textarea[placeholder*="Claude"]',  // Alternative
    // Add new selectors here
];
```

---

## Advanced Configuration

### Custom Manuscript Templates
Edit `workflows/claude-manuscript-workflow.json`:
```javascript
// Modify the book generation function
const bookIdeas = [
    {
        title: "Your Custom Title",
        genre: "Your Genre",
        tone: "Your Tone",
        chapters: 15,  // Custom chapter count
        wordCount: 50000  // Target word count
    }
];
```

### Parallel Processing
For faster generation, modify docker-compose.yml:
```yaml
browserless:
  environment:
    - CONCURRENT=10  # Increase concurrent sessions
    - MAX_CONCURRENT_SESSIONS=10
```

### Scheduled Runs
In n8n workflow, adjust the Schedule Trigger:
- Daily: Set interval to 24 hours
- Multiple times: Add multiple schedule triggers
- Specific times: Use CRON expression

### Output Formats
Add nodes to export in different formats:
- Markdown → PDF
- Markdown → EPUB
- Markdown → DOCX

### Integration with Other Services
- Slack notifications on completion
- Email manuscripts
- Upload to Google Drive
- Post to Medium/Substack

---

## Maintenance

### Daily Tasks
- Check execution logs
- Verify manuscripts are generating
- Monitor GitHub repository

### Weekly Tasks
- Update Claude session cookie if needed
- Check for n8n updates
- Review generated content quality

### Monthly Tasks
- Clean up old manuscripts
- Backup n8n workflows
- Update dependencies:
```bash
npm update
docker-compose pull
```

---

## Commands Reference

### Docker Commands
```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Restart services
docker-compose restart

# View logs
docker-compose logs -f

# Clean up
docker-compose down -v  # Remove volumes too
```

### NPM Scripts
```bash
npm run start          # Start all services
npm run stop           # Stop all services
npm run logs           # View logs
npm run test-puppeteer # Test Claude automation
npm run dev            # Development mode with nodemon
```

### Maintenance Commands
```bash
# Backup n8n data
docker run --rm -v n8n-writer_n8n-data:/data -v $(pwd):/backup alpine tar czf /backup/n8n-backup.tar.gz /data

# Restore n8n data
docker run --rm -v n8n-writer_n8n-data:/data -v $(pwd):/backup alpine tar xzf /backup/n8n-backup.tar.gz -C /

# Clear logs
echo "" > logs/automation.log

# Reset everything
docker-compose down -v
rm -rf n8n-data/
```

---

## Support & Resources

### Documentation
- [n8n Docs](https://docs.n8n.io)
- [Puppeteer Docs](https://pptr.dev)
- [Browserless Docs](https://docs.browserless.io)

### Project Repository
https://github.com/scottmcquaig/scoot-kidd-classics

### Troubleshooting Help
1. Check logs first: `npm run logs`
2. Review this guide's troubleshooting section
3. Check n8n execution history
4. Verify Claude session is still valid

### Contact
Create an issue on GitHub for bugs or feature requests.

---

## Quick Reference Card

```
🚀 Start Everything:     setup.bat (Windows) or ./setup.sh (Mac/Linux)
📊 View n8n:             http://localhost:5678
📝 Check Logs:           npm run logs
🔄 Restart Services:     docker-compose restart
🧪 Test Claude:          npm run test-puppeteer
📚 View Manuscripts:     manuscripts/ folder
🛑 Stop Everything:      npm run stop
```

---

*Happy automated writing with Scoot-Kidd Classics!*