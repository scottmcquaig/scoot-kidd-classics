// This function is designed to be sent to Browserless.io
// It accepts data.sessionCookie and data.prompt as inputs

module.exports = async ({ page, data }) => {
    const { sessionCookie, prompt, timeout = 120000 } = data;

    try {
        // Navigate to Claude
        await page.goto('https://claude.ai', {
            waitUntil: 'networkidle2',
            timeout: 60000
        });

        // Set session cookie if provided
        if (sessionCookie) {
            await page.setCookie({
                name: 'session',
                value: sessionCookie,
                domain: '.claude.ai',
                path: '/',
                httpOnly: true,
                secure: true,
                sameSite: 'Lax'
            });

            await page.reload({ waitUntil: 'networkidle2' });
        }

        // Wait for and find the input element
        const inputSelectors = [
            '[data-testid="composer-input"]',
            'textarea[placeholder*="Talk to Claude"]',
            'div[contenteditable="true"]'
        ];

        let inputFound = false;
        for (const selector of inputSelectors) {
            try {
                await page.waitForSelector(selector, { timeout: 10000 });
                await page.click(selector);
                await page.keyboard.down('Control');
                await page.keyboard.press('A');
                await page.keyboard.up('Control');
                await page.type(selector, prompt);
                inputFound = true;
                break;
            } catch (e) {
                continue;
            }
        }

        if (!inputFound) {
            throw new Error('Could not find input element');
        }

        // Submit the prompt
        await page.keyboard.press('Enter');

        // Wait for response
        await page.waitForFunction(
            () => {
                const messages = document.querySelectorAll('[data-testid^="message"], .message-content, [class*="prose"]');
                return messages.length > 0 && messages[messages.length - 1].textContent.length > 10;
            },
            { timeout }
        );

        // Wait for typing to complete
        await page.waitForFunction(
            () => {
                const typingIndicators = document.querySelectorAll('[data-testid="typing-indicator"], .typing-indicator, [class*="typing"]');
                return typingIndicators.length === 0;
            },
            { timeout: 30000 }
        );

        await page.waitForTimeout(2000);

        // Extract the response
        const response = await page.evaluate(() => {
            const messageSelectors = [
                '[data-testid^="message"]',
                '.message-content',
                '[class*="message"]',
                'div[class*="prose"]'
            ];

            for (const selector of messageSelectors) {
                const messages = document.querySelectorAll(selector);
                if (messages.length > 0) {
                    const lastMessage = messages[messages.length - 1];
                    return lastMessage.textContent || lastMessage.innerText;
                }
            }

            return 'No response found';
        });

        return {
            success: true,
            response: response,
            timestamp: new Date().toISOString()
        };

    } catch (error) {
        return {
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        };
    }
};