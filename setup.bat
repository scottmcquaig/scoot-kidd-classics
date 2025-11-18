@echo off
REM Scoot-Kidd Classics Setup Script for Windows
REM Automated n8n + Claude Code + Puppeteer Stack Setup

echo ==========================================
echo    Scoot-Kidd Classics Setup Wizard
echo    n8n + Claude Code + Puppeteer Stack
echo ==========================================
echo.

REM Check for Docker
where docker >nul 2>nul
if %errorlevel% neq 0 (
    echo X Docker is not installed. Please install Docker Desktop first.
    echo   Download from: https://www.docker.com/products/docker-desktop/
    pause
    exit /b 1
)

REM Check for Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo X Node.js is not installed. Please install Node.js first.
    echo   Download from: https://nodejs.org/
    pause
    exit /b 1
)

echo OK Prerequisites checked
echo.

REM Create .env file from example
if not exist .env (
    echo Creating .env file...
    copy .env.example .env >nul

    REM Generate random keys (simplified for Windows)
    echo.
    echo NOTE: Please manually update the following in your .env file:
    echo   - N8N_ENCRYPTION_KEY: Generate a 32-character random string
    echo   - POSTGRES_PASSWORD: Create a secure password
    echo   - CLAUDE_SESSION_COOKIE: Add after logging into Claude
    echo.

    echo OK .env file created (needs manual configuration)
    echo.
) else (
    echo OK .env file already exists
)

REM Install npm dependencies
echo Installing Node.js dependencies...
call npm install

REM Create required directories
echo Creating project directories...
if not exist n8n-data mkdir n8n-data
if not exist workflows mkdir workflows
if not exist scripts mkdir scripts
if not exist logs mkdir logs
if not exist manuscripts mkdir manuscripts
if not exist temp mkdir temp

REM Start Docker services
echo Starting Docker services...
docker-compose up -d

REM Wait for services
echo Waiting for services to start...
timeout /t 10 /nobreak >nul

REM Check service health
echo Checking service status...
docker-compose ps

echo.
echo ==========================================
echo    Setup Complete!
echo ==========================================
echo.
echo Your n8n + Claude automation stack is ready!
echo.
echo Access Points:
echo    - n8n:         http://localhost:5678
echo    - Browserless: http://localhost:3000
echo.
echo Next Steps:
echo    1. Update your .env file with required values
echo    2. Open http://localhost:5678 to access n8n
echo    3. Create your n8n account
echo    4. Import workflow from workflows\claude-manuscript-workflow.json
echo    5. Configure your credentials in n8n
echo    6. Test Claude automation with: npm run test-puppeteer
echo.
echo For detailed instructions, see: USER_GUIDE.md
echo.
pause