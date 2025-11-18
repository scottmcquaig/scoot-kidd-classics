# Adapting the n8n‑Claude workflow for the web interface

You specified that your credits only apply to the **Claude Code web interface** and cannot be used via the Anthropic API. In this situation you need to automate interactions with Claude through a browser rather than through API calls. n8n does not natively control a browser, but you can extend it by using a headless‑browser service such as **Browserless** or **Puppeteer**. Below is a high‑level plan for implementing an automated prompting system through the browser.

## 1 Set up a browser automation service

1.  **Choose Browserless or Puppeteer**:

2.  **Browserless.io** offers a hosted headless Chrome API. n8n integrates with Browserless via the **HTTP Request** node; you send a script written in JavaScript or [Puppeteer](https://pptr.dev/) commands and Browserless executes it. There is a free tier that may be enough for a few hours of tasks.

3.  Alternatively, install **Puppeteer** locally on the server that runs n8n and expose it via a custom endpoint or write a script executed by n8n's **Execute Command** node.

4.  **Acquire an API key** (for Browserless.io) and note the base URL for execution. Authentication typically uses a `token` query parameter.

5.  **Install the community node** (optional): some users have created an `n8n-nodes-browserless` package that wraps Browserless calls. If you prefer not to install external nodes, you can use the generic HTTP Request node to call the Browserless API directly.

## 2 Log in to Claude manually and reuse the session

Headless browsers cannot easily solve CAPTCHAs or two‑factor authentication. To avoid repeated logins:

1.  Open `claude.ai` or `claude.ai/chat` in a normal browser and log in with your account. Inspect your browser's developer tools and extract the **session cookie** (usually named something like `__Secure-session` or `session`).
2.  Store this cookie value securely in n8n credentials so that your headless browser can reuse it. When the script launches a new browser, set the cookie on `claude.ai` before navigating; this bypasses the login page.

> **Important:** Session cookies expire. If Claude logs you out, you'll need to refresh the cookie manually.

## 3 Create a Browserless script to send prompts

Browserless accepts a JavaScript function body to be executed. Here is a simplified example of a script that opens Claude Code, enters a prompt, waits for a reply and returns the reply text. You will need to adapt selectors based on the current Claude UI.

    const puppeteer = require('puppeteer');

    module.exports = async ({ context, page, data }) => {
      // Use saved cookie to bypass login
      await page.goto('https://claude.ai/', { waitUntil: 'networkidle2' });
      await page.setCookie({ name: 'session', value: data.sessionCookie, domain: '.claude.ai', path: '/' });
      await page.reload({ waitUntil: 'networkidle2' });

      // Navigate to Claude Code (adapt URL if necessary)
      await page.goto('https://claude.ai/ide', { waitUntil: 'networkidle2' });

      // Type prompt into the input box (update selector as needed)
      await page.type('textarea[data-testid="chat-input"]', data.prompt);
      await page.keyboard.press('Enter');

      // Wait for response to appear; adjust selector & timeout
      await page.waitForSelector('.message-content', { timeout: 90000 });

      // Extract the last assistant message
      const messages = await page.$$eval('.message-content', nodes => nodes.map(n => n.innerText));
      return messages[messages.length - 1];
    };

Key points: - Use `data.sessionCookie` and `data.prompt` as inputs so you can vary prompts from n8n. - Wait for network idle or specific selectors to ensure Claude finished responding. - Return the assistant's reply so it can be consumed in the next n8n node.

## 4 Integrate Browserless into n8n

1.  In **Credentials**, create a new HTTP credential named `Browserless` with a header or query parameter containing your Browserless API token.
2.  **HTTP Request node**: set URL to `https://chrome.browserless.io/puppeteer?token=<your-token>` (or the self‑hosted instance). Use method **POST** and set the body to a JSON object containing:

<!-- -->

    {
      "code": <your JavaScript function as a string>,
      "context": {},
      "data": {
        "sessionCookie": "<copied-cookie>",
        "prompt": "<dynamic prompt>",
        "timeout": 120000
      }
    }

The `code` field holds the Puppeteer script shown above. The `data` field is passed into the script via `data` parameter.

1.  **Build the workflow** similar to the API‑based approach:

2.  Use a **Set** or **Function** node to construct your prompt (idea generation, outline, chapter writing, editing) based on the "stoic‑manuscript" pattern and SWGSZN tone.

3.  Call the Browserless node with the prompt and session cookie.

4.  Parse the returned string and proceed to the next stage (outline → chapters → review).

5.  **Loop through book ideas** by using **Split In Batches** as previously described. Each iteration sets a new prompt and triggers Browserless to fetch Claude's response.

6.  **Commit to GitHub**: this part remains the same as in the API‑based plan; you can still push manuscripts via the GitHub REST API.

## 5 Limitations and considerations

- **Selector changes**: Claude's interface may change, breaking selectors. Inspect the DOM to update them if automation stops working.
- **Rate limits**: Browserless plans impose concurrency and time limits. Running many requests concurrently may hit those limits.
- **Session stability**: if your session cookie expires or Claude prompts for re‑authentication, the headless script will fail. Keep a fallback manual process ready.
- **Error handling**: Use try/catch in the Puppeteer script and return explicit errors. In n8n, wrap Browserless calls in **Try‑Catch** nodes to retry or skip on failure.
- **Security**: Do not hard‑code credentials in workflow JSON. Store session cookies and tokens in n8n credential records.

## 6 Summary

Even without API access, you can still automate Claude Code through a browser. By combining n8n with a headless browser service like Browserless or Puppeteer, you can send prompts to Claude's web interface, collect the responses, and stitch them together into manuscripts. Although this approach is more brittle than using the API, it allows you to leverage your remaining Claude Code credits before they expire.

------------------------------------------------------------------------
