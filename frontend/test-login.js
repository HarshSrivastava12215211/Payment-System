const puppeteer = require('puppeteer');

(async () => {
    try {
        console.log("Launching browser...");
        const browser = await puppeteer.launch({ headless: "new" });
        const page = await browser.newPage();

        page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
        page.on('pageerror', error => console.error('BROWSER ERROR:', error.message));
        page.on('requestfailed', request => {
            console.log(`NETWORK FAILED: ${request.url()} - ${request.failure()?.errorText}`);
        });
        page.on('response', response => {
            if (response.url().includes('/auth/') || response.url().includes('/users/')) {
                console.log(`NETWORK RESPONSE: ${response.url()} -> ${response.status()}`);
            }
        });

        console.log("Navigating to login page...");
        await page.goto('http://localhost:4200/login', { waitUntil: 'networkidle2' });

        console.log("Switching to Password tab...");
        await page.click('button:nth-child(2)'); // Password button
        await new Promise(r => setTimeout(r, 500));

        console.log("Entering credentials...");
        await page.type('input[type="text"]', 'srivastavaharsh148@gmail.com');
        await page.type('input[type="password"]', 'wrongpassword123'); // test wrong password first

        console.log("Clicking login...");
        const buttons = await page.$$('button');
        let clicked = false;
        for (const btn of buttons) {
            const text = await page.evaluate(el => el.textContent, btn);
            if (text.includes('SECURE SIGN IN')) {
                await btn.click();
                clicked = true;
                break;
            }
        }
        if (!clicked) {
            console.log("Login button not found! Clicking any primary button.");
            await page.click('.btn-primary');
        }

        console.log("Waiting for network activity...");
        await new Promise(r => setTimeout(r, 3000));

        console.log("Testing complete. Closing...");
        await browser.close();
    } catch (e) {
        console.error("Script failed:", e);
    }
})();
