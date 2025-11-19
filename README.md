# Scoot-Kidd Classics
## Automated Manuscript Generation with n8n + Claude Code Web + Puppeteer

Leverage your Claude Code web credits to automatically generate manuscripts, books, and content using browser automation.

### Features
- 🤖 Automated Claude Code web interface interaction
- 📚 Full manuscript generation pipeline
- 🔄 n8n workflow orchestration
- 🌐 Browserless/Puppeteer integration
- 📝 GitHub manuscript storage
- ⏰ Scheduled content generation

### 🚀 NEW: Autonomous Mode (Recommended!)

Generate complete manuscripts while you sleep! No manual prompting required.

```bash
# Quick setup (5 minutes)
npm install
cp .env.example .env
# Add your Claude session cookie to .env

# Start generating (Mac/Linux)
./run-autonomous.sh

# Start generating (Windows)
run-autonomous.bat
```

**See [AUTONOMOUS_SETUP.md](AUTONOMOUS_SETUP.md) for complete instructions.**

---

### Quick Start (Original n8n Setup)

```bash
# Clone the repository
git clone https://github.com/scottmcquaig/scoot-kidd-classics.git
cd scoot-kidd-classics

# Run setup (Windows)
setup.bat

# Run setup (Mac/Linux)
./setup.sh

# Access n8n
open http://localhost:5678
```

### Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│     n8n     │────▶│  Browserless │────▶│   Claude    │
│  Workflows  │     │   Puppeteer  │     │     Web     │
└─────────────┘     └──────────────┘     └─────────────┘
       │                                         │
       ▼                                         ▼
┌─────────────┐                          ┌─────────────┐
│   GitHub    │                          │ Manuscripts │
│ Repository  │◀─────────────────────────│  Generated  │
└─────────────┘                          └─────────────┘
```

### Requirements
- Docker Desktop
- Node.js 18+
- Claude.ai account with web credits
- GitHub account

### Configuration
1. Get Claude session cookie (see USER_GUIDE.md)
2. Configure `.env` file
3. Import n8n workflow
4. Start generating!

### Documentation
- **[Autonomous Setup Guide](AUTONOMOUS_SETUP.md) - ⭐ Start here! Fully autonomous manuscript generation**
- [User Guide](USER_GUIDE.md) - Complete setup and usage instructions
- [Setup Guide](n8n-setup-guide.md) - Original setup documentation
- [Workflows](workflows/) - n8n workflow templates

### Project Structure
```
scoot-kidd-classics/
├── scripts/                        # Automation scripts
│   ├── autonomous-manuscript-generator.js  # ⭐ Main autonomous script
│   ├── claude-automation.js        # Puppeteer browser automation
│   └── browserless-function.js     # Browserless integration
├── workflows/                      # n8n workflows
│   ├── autonomous-manuscript-workflow.json
│   └── claude-manuscript-workflow.json
├── manuscripts/                    # Generated content
│   ├── drafts/                    # Work in progress
│   ├── completed/                 # Finished manuscripts
│   └── outlines/                  # Book outlines
├── ideas/                         # Manuscript ideas & templates
│   └── manuscript-ideas.json      # Book concepts & settings
├── run-autonomous.sh              # ⭐ Quick start script (Mac/Linux)
├── run-autonomous.bat             # ⭐ Quick start script (Windows)
├── AUTONOMOUS_SETUP.md            # ⭐ Autonomous setup guide
├── docker-compose.yml             # Service orchestration
└── package.json                   # Node dependencies
```

### License
MIT

### Author
Scott McQuaig

### Contributing
Pull requests welcome! Please read the contributing guidelines first.

### Support
Create an issue for bugs or feature requests.