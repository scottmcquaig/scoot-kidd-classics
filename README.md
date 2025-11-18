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

### Quick Start

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
- [User Guide](USER_GUIDE.md) - Complete setup and usage instructions
- [Setup Guide](n8n-setup-guide.md) - Original setup documentation
- [Workflows](workflows/) - n8n workflow templates

### Project Structure
```
scoot-kidd-classics/
├── scripts/               # Automation scripts
│   ├── claude-automation.js
│   └── browserless-function.js
├── workflows/             # n8n workflows
├── manuscripts/          # Generated content
├── n8n-data/            # n8n persistent data
├── docker-compose.yml   # Service orchestration
├── package.json        # Node dependencies
└── USER_GUIDE.md      # Comprehensive guide
```

### License
MIT

### Author
Scott McQuaig

### Contributing
Pull requests welcome! Please read the contributing guidelines first.

### Support
Create an issue for bugs or feature requests.