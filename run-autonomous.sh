#!/bin/bash
# Autonomous Manuscript Generator - Quick Start Script

echo "🚀 Scoot-Kidd Classics - Autonomous Manuscript Generator"
echo "=========================================================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo ""
    echo "Please create .env file first:"
    echo "  1. cp .env.example .env"
    echo "  2. Add your CLAUDE_SESSION_COOKIE"
    echo ""
    echo "See AUTONOMOUS_SETUP.md for detailed instructions."
    exit 1
fi

# Check if session cookie is set
if ! grep -q "CLAUDE_SESSION_COOKIE=.\\+" .env; then
    echo "❌ CLAUDE_SESSION_COOKIE not set in .env file!"
    echo ""
    echo "Get your session cookie from claude.ai:"
    echo "  1. Open https://claude.ai in Chrome"
    echo "  2. Login to your account"
    echo "  3. Press F12 → Application → Cookies"
    echo "  4. Copy the session cookie value"
    echo "  5. Add to .env file"
    echo ""
    echo "See AUTONOMOUS_SETUP.md for detailed instructions."
    exit 1
fi

# Check if node_modules exists
if [ ! -d node_modules ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

echo "✅ Configuration looks good!"
echo ""
echo "Choose running mode:"
echo ""
echo "1) Generate ONE manuscript (test mode)"
echo "2) Generate ALL manuscripts continuously"
echo "3) Run in background (logs to logs/generation.log)"
echo "4) Exit"
echo ""
read -p "Enter choice [1-4]: " choice

case $choice in
    1)
        echo ""
        echo "🎬 Generating one manuscript..."
        echo "This will take 45-60 minutes. Press Ctrl+C to stop."
        echo ""
        node scripts/autonomous-manuscript-generator.js
        ;;
    2)
        echo ""
        echo "🔄 Running continuously..."
        echo "Will generate all manuscripts in ideas/manuscript-ideas.json"
        echo "Press Ctrl+C to stop."
        echo ""
        node scripts/autonomous-manuscript-generator.js --continuous
        ;;
    3)
        echo ""
        echo "📡 Starting in background mode..."
        mkdir -p logs
        nohup node scripts/autonomous-manuscript-generator.js --continuous > logs/generation.log 2>&1 &
        PID=$!
        echo ""
        echo "✅ Generator started! (PID: $PID)"
        echo ""
        echo "Monitor progress:"
        echo "  tail -f logs/generation.log"
        echo ""
        echo "Stop the generator:"
        echo "  kill $PID"
        echo ""
        ;;
    4)
        echo "Goodbye!"
        exit 0
        ;;
    *)
        echo "Invalid choice. Exiting."
        exit 1
        ;;
esac
