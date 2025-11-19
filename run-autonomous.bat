@echo off
REM Autonomous Manuscript Generator - Quick Start Script (Windows)

echo ========================================================
echo    Scoot-Kidd Classics - Autonomous Manuscript Generator
echo ========================================================
echo.

REM Check if .env exists
if not exist .env (
    echo [ERROR] .env file not found!
    echo.
    echo Please create .env file first:
    echo   1. copy .env.example .env
    echo   2. Edit .env and add your CLAUDE_SESSION_COOKIE
    echo.
    echo See AUTONOMOUS_SETUP.md for detailed instructions.
    pause
    exit /b 1
)

REM Check if node_modules exists
if not exist node_modules (
    echo Installing dependencies...
    call npm install
    echo.
)

echo [OK] Configuration looks good!
echo.
echo Choose running mode:
echo.
echo 1) Generate ONE manuscript (test mode)
echo 2) Generate ALL manuscripts continuously
echo 3) Exit
echo.
set /p choice="Enter choice [1-3]: "

if "%choice%"=="1" goto single
if "%choice%"=="2" goto continuous
if "%choice%"=="3" goto exit
goto invalid

:single
echo.
echo Generating one manuscript...
echo This will take 45-60 minutes. Press Ctrl+C to stop.
echo.
node scripts/autonomous-manuscript-generator.js
goto end

:continuous
echo.
echo Running continuously...
echo Will generate all manuscripts in ideas/manuscript-ideas.json
echo Press Ctrl+C to stop.
echo.
node scripts/autonomous-manuscript-generator.js --continuous
goto end

:exit
echo Goodbye!
exit /b 0

:invalid
echo Invalid choice. Exiting.
exit /b 1

:end
echo.
echo Generation complete!
pause
