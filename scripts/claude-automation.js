const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
require('dotenv').config();

// Use stealth plugin to avoid detection
puppeteer.use(StealthPlugin());

class ClaudeAutomation {
    constructor(sessionCookie) {
        this.sessionCookie = sessionCookie;
        this.browser = null;
        this.page = null;
    }

    async initialize() {
        this.browser = await puppeteer.launch({
            headless: false, // Set to true for production
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--disable-gpu'
            ]
        });
        this.page = await this.browser.newPage();

        // Set viewport and user agent
        await this.page.setViewport({ width: 1920, height: 1080 });
        await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    }

    async login() {
        try {
            console.log('Setting up Claude session...');

            // Navigate to Claude
            await this.page.goto('https://claude.ai', {
                waitUntil: 'networkidle2',
                timeout: 60000
            });

            // Set the session cookie
            if (this.sessionCookie) {
                await this.page.setCookie({
                    name: 'session',
                    value: this.sessionCookie,
                    domain: '.claude.ai',
                    path: '/',
                    httpOnly: true,
                    secure: true,
                    sameSite: 'Lax'
                });

                // Reload to apply cookie
                await this.page.reload({ waitUntil: 'networkidle2' });
                console.log('Session cookie applied successfully');
            }

            // Check if we're logged in
            await this.page.waitForTimeout(3000);
            const isLoggedIn = await this.checkLoginStatus();

            if (!isLoggedIn) {
                console.log('Manual login required. Please log in through the browser...');
                // Wait for manual login
                await this.page.waitForSelector('[data-testid="composer-input"]', { timeout: 300000 });
                console.log('Login successful!');

                // Extract and save the new session cookie
                const cookies = await this.page.cookies();
                const sessionCookie = cookies.find(c => c.name === 'session' || c.name.includes('session'));
                if (sessionCookie) {
                    console.log('New session cookie obtained:', sessionCookie.value.substring(0, 20) + '...');
                    // Save this cookie for future use
                    return sessionCookie.value;
                }
            }

            return this.sessionCookie;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    async checkLoginStatus() {
        try {
            // Check for common elements that indicate we're logged in
            const loginIndicators = [
                '[data-testid="composer-input"]',
                'textarea[placeholder*="Talk to Claude"]',
                'button[aria-label="New chat"]'
            ];

            for (const selector of loginIndicators) {
                const element = await this.page.$(selector);
                if (element) {
                    return true;
                }
            }
            return false;
        } catch (error) {
            return false;
        }
    }

    async sendPrompt(prompt, waitForResponse = true) {
        try {
            console.log('Sending prompt to Claude...');

            // Find the input area - Claude's selectors may vary
            const inputSelectors = [
                '[data-testid="composer-input"]',
                'textarea[placeholder*="Talk to Claude"]',
                'div[contenteditable="true"]'
            ];

            let inputElement = null;
            for (const selector of inputSelectors) {
                inputElement = await this.page.$(selector);
                if (inputElement) {
                    console.log(`Found input using selector: ${selector}`);
                    break;
                }
            }

            if (!inputElement) {
                throw new Error('Could not find input element');
            }

            // Clear existing text and type the prompt
            await inputElement.click({ clickCount: 3 }); // Select all
            await this.page.keyboard.press('Backspace');
            await inputElement.type(prompt);

            // Submit the prompt
            await this.page.keyboard.press('Enter');
            console.log('Prompt submitted');

            if (waitForResponse) {
                // Wait for response to appear
                await this.waitForResponse();
                const response = await this.getLatestResponse();
                return response;
            }

            return true;
        } catch (error) {
            console.error('Error sending prompt:', error);
            throw error;
        }
    }

    async waitForResponse(timeout = 120000) {
        try {
            console.log('Waiting for Claude response...');

            // Wait for the response to start appearing
            await this.page.waitForFunction(
                () => {
                    const messages = document.querySelectorAll('[data-testid^="message"]');
                    if (messages.length > 0) {
                        const lastMessage = messages[messages.length - 1];
                        return lastMessage && lastMessage.textContent && lastMessage.textContent.length > 10;
                    }
                    return false;
                },
                { timeout }
            );

            // Wait for the response to finish (no typing indicator)
            await this.page.waitForFunction(
                () => {
                    const typingIndicators = document.querySelectorAll('[data-testid="typing-indicator"], .typing-indicator, [class*="typing"]');
                    return typingIndicators.length === 0;
                },
                { timeout: 30000 }
            );

            console.log('Response received');
            await this.page.waitForTimeout(2000); // Extra wait for complete rendering
        } catch (error) {
            console.error('Error waiting for response:', error);
            throw error;
        }
    }

    async getLatestResponse() {
        try {
            const response = await this.page.evaluate(() => {
                // Try multiple selectors for Claude's response
                const messageSelectors = [
                    '[data-testid^="message"]',
                    '.message-content',
                    '[class*="message"]',
                    'div[class*="prose"]'
                ];

                for (const selector of messageSelectors) {
                    const messages = document.querySelectorAll(selector);
                    if (messages.length > 0) {
                        // Get the last message (should be Claude's response)
                        const lastMessage = messages[messages.length - 1];
                        return lastMessage.textContent || lastMessage.innerText;
                    }
                }

                return null;
            });

            if (!response) {
                throw new Error('Could not extract response');
            }

            return response;
        } catch (error) {
            console.error('Error getting response:', error);
            throw error;
        }
    }

    async close() {
        if (this.browser) {
            await this.browser.close();
        }
    }
}

// Export for use in n8n or standalone
module.exports = ClaudeAutomation;

// Standalone execution for testing
if (require.main === module) {
    (async () => {
        const automation = new ClaudeAutomation(process.env.CLAUDE_SESSION_COOKIE);

        try {
            await automation.initialize();
            const newCookie = await automation.login();

            if (newCookie !== process.env.CLAUDE_SESSION_COOKIE) {
                console.log('New session cookie obtained. Update your .env file with:');
                console.log(`CLAUDE_SESSION_COOKIE=${newCookie}`);
            }

            // Test prompt
            const testPrompt = "Hello Claude, please respond with a simple greeting.";
            const response = await automation.sendPrompt(testPrompt);
            console.log('Claude responded:', response);

        } catch (error) {
            console.error('Automation error:', error);
        } finally {
            await automation.close();
        }
    })();
}