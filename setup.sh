#!/bin/bash

# Scoot-Kidd Classics Setup Script
# Automated n8n + Claude Code + Puppeteer Stack Setup

echo "=========================================="
echo "   Scoot-Kidd Classics Setup Wizard"
echo "   n8n + Claude Code + Puppeteer Stack"
echo "=========================================="
echo ""

# Check for Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker Desktop first."
    echo "   Download from: https://www.docker.com/products/docker-desktop/"
    exit 1
fi

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

echo "✅ Prerequisites checked"
echo ""

# Create .env file from example
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env

    # Generate random encryption key
    ENCRYPTION_KEY=$(openssl rand -hex 16)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s/your-32-character-encryption-key-here/$ENCRYPTION_KEY/" .env
    else
        sed -i "s/your-32-character-encryption-key-here/$ENCRYPTION_KEY/" .env
    fi

    # Generate random postgres password
    PG_PASSWORD=$(openssl rand -hex 16)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s/your-secure-postgres-password/$PG_PASSWORD/" .env
    else
        sed -i "s/your-secure-postgres-password/$PG_PASSWORD/" .env
    fi

    echo "✅ .env file created with secure defaults"
    echo ""
    echo "⚠️  IMPORTANT: You need to add your Claude session cookie to .env"
    echo "   1. Open Claude.ai in your browser and log in"
    echo "   2. Open Developer Tools (F12)"
    echo "   3. Go to Application -> Cookies"
    echo "   4. Find the 'session' cookie and copy its value"
    echo "   5. Add it to .env as CLAUDE_SESSION_COOKIE"
    echo ""
else
    echo "✅ .env file already exists"
fi

# Install npm dependencies
echo "📦 Installing Node.js dependencies..."
npm install

# Create required directories
echo "📁 Creating project directories..."
mkdir -p n8n-data workflows scripts logs manuscripts temp

# Start Docker services
echo "🐳 Starting Docker services..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Check service health
echo "🔍 Checking service status..."
docker-compose ps

echo ""
echo "=========================================="
echo "   Setup Complete!"
echo "=========================================="
echo ""
echo "🎉 Your n8n + Claude automation stack is ready!"
echo ""
echo "📌 Access Points:"
echo "   • n8n:         http://localhost:5678"
echo "   • Browserless: http://localhost:3000"
echo ""
echo "🚀 Next Steps:"
echo "   1. Open http://localhost:5678 to access n8n"
echo "   2. Create your n8n account"
echo "   3. Import the workflow from workflows/claude-manuscript-workflow.json"
echo "   4. Configure your credentials in n8n"
echo "   5. Test the Claude automation with: npm run test-puppeteer"
echo ""
echo "📖 For detailed instructions, see: USER_GUIDE.md"
echo ""