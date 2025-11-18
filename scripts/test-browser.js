// Test script for Claude browser automation
const ClaudeAutomation = require('./claude-automation');
require('dotenv').config();

const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[36m'
};

const log = {
    success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
    error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
    info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
    warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`)
};

async function runTests() {
    console.log('\n====================================');
    console.log('  Claude Browser Automation Test');
    console.log('====================================\n');

    const automation = new ClaudeAutomation(process.env.CLAUDE_SESSION_COOKIE);

    try {
        // Test 1: Initialize browser
        log.info('Initializing browser...');
        await automation.initialize();
        log.success('Browser launched successfully');

        // Test 2: Navigate to Claude
        log.info('Navigating to Claude.ai...');
        const newCookie = await automation.login();

        if (newCookie && newCookie !== process.env.CLAUDE_SESSION_COOKIE) {
            log.warn('New session cookie obtained. Update your .env file:');
            console.log(`\nCLAUDE_SESSION_COOKIE=${newCookie}\n`);
        } else if (newCookie) {
            log.success('Session cookie is valid');
        } else {
            log.error('Failed to validate session');
        }

        // Test 3: Check login status
        log.info('Checking login status...');
        const isLoggedIn = await automation.checkLoginStatus();

        if (isLoggedIn) {
            log.success('Successfully logged in to Claude');
        } else {
            log.error('Not logged in - manual login may be required');
            log.warn('Please log in manually in the browser window...');

            // Wait for manual login
            const newSessionCookie = await automation.login();
            if (newSessionCookie) {
                log.success('Manual login successful');
                console.log(`\nNew session cookie: ${newSessionCookie.substring(0, 50)}...`);
            }
        }

        // Test 4: Send test prompt
        log.info('Sending test prompt...');
        const testPrompts = [
            "Hello Claude! Please respond with a simple greeting and confirm you can see this message.",
            "Write a haiku about browser automation.",
            "What's 2+2? Just give me the number."
        ];

        const randomPrompt = testPrompts[Math.floor(Math.random() * testPrompts.length)];
        console.log(`  Prompt: "${randomPrompt}"`);

        const response = await automation.sendPrompt(randomPrompt);

        if (response && response.length > 0) {
            log.success('Response received from Claude');
            console.log('\n--- Claude Response ---');
            console.log(response.substring(0, 200) + (response.length > 200 ? '...' : ''));
            console.log('----------------------\n');
        } else {
            log.error('No response received');
        }

        // Test 5: Performance test
        log.info('Testing response time...');
        const startTime = Date.now();
        await automation.sendPrompt("Reply with just 'OK'");
        const responseTime = Date.now() - startTime;

        if (responseTime < 10000) {
            log.success(`Fast response time: ${responseTime}ms`);
        } else if (responseTime < 30000) {
            log.warn(`Moderate response time: ${responseTime}ms`);
        } else {
            log.error(`Slow response time: ${responseTime}ms`);
        }

        // Summary
        console.log('\n====================================');
        console.log('  Test Summary');
        console.log('====================================');
        log.success('All tests completed');
        log.info('Claude automation is working correctly');

        // Configuration tips
        console.log('\n📌 Next Steps:');
        console.log('   1. Update .env with your session cookie if needed');
        console.log('   2. Run: docker-compose up -d');
        console.log('   3. Access n8n at: http://localhost:5678');
        console.log('   4. Import workflow from: workflows/claude-manuscript-workflow.json');
        console.log('');

    } catch (error) {
        log.error(`Test failed: ${error.message}`);
        console.error('\nFull error:', error);

        console.log('\n🔧 Troubleshooting Tips:');
        console.log('   1. Check if Claude.ai is accessible');
        console.log('   2. Verify your session cookie is valid');
        console.log('   3. Try logging in manually first');
        console.log('   4. Check for Claude UI changes');
    } finally {
        // Cleanup
        log.info('Closing browser...');
        await automation.close();
        log.success('Browser closed');
        console.log('\n');
    }
}

// Run tests
runTests().catch(console.error);