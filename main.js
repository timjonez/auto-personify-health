const { chromium } = require("playwright");
require("dotenv").config();

(async () => {
  const username = process.env.USERNAME;
  const password = process.env.PASSWORD;

  if (!username || !password) {
    console.error("Please set USERNAME and PASSWORD in .env file");
    process.exit(1);
  }

  console.log("Starting browser...");
  const browser = await chromium.launch({ headless: false, slowMo: 100 });
  const page = await browser.newPage();

  try {
    console.log("Navigating to login page...");
    await page.goto("https://app.personifyhealth.com/#/home", {
      waitUntil: "networkidle",
    });

    // Wait for the page to load and see where we end up
    await page.waitForTimeout(3000);
    console.log("Current URL after initial navigation:", page.url());

    // Try to find username field with multiple possible selectors
    console.log("Looking for username field...");
    const usernameSelectors = [
      'input[name="username"]',
      'input[id="username"]',
      'input[placeholder*="username" i]',
      'input[placeholder*="email" i]',
      'input[type="email"]',
    ];

    let usernameFound = false;
    for (const selector of usernameSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 2000 });
        console.log(`Found username field: ${selector}`);
        await page.fill(selector, username);
        usernameFound = true;
        break;
      } catch (e) {
        // Continue trying
      }
    }

    if (!usernameFound) {
      console.log("Available input fields:");
      const inputs = await page.$$eval("input", (inputs) =>
        inputs.map((input) => ({
          name: input.name,
          id: input.id,
          type: input.type,
          placeholder: input.placeholder,
        })),
      );
      console.log(inputs);
      throw new Error("Username field not found");
    }

    // Find and click continue/next button if it's a multi-step form
    console.log("Looking for continue button...");
    const continueSelectors = [
      'button[type="submit"]',
      'button[id*="continue"]',
      'button[id*="next"]',
      'button:has-text("Continue")',
      'button:has-text("Next")',
      'input[type="submit"]',
    ];

    for (const selector of continueSelectors) {
      try {
        await page.click(selector);
        console.log(`Clicked continue button: ${selector}`);
        await page.waitForTimeout(2000);
        break;
      } catch (e) {
        // Continue trying
      }
    }

    // Now look for password field
    console.log("Looking for password field...");
    await page.waitForSelector(
      'input[name="password"], input[type="password"]',
      { timeout: 10000 },
    );
    await page.fill('input[name="password"], input[type="password"]', password);

    // Click final submit button
    console.log("Submitting login...");
    const submitSelectors = [
      'button[type="submit"]',
      'button[id*="login"]',
      'button:has-text("Log in")',
      'button:has-text("Sign in")',
      'button:has-text("Login")',
      'input[type="submit"]',
    ];

    for (const selector of submitSelectors) {
      try {
        await page.click(selector);
        console.log(`Clicked submit button: ${selector}`);
        break;
      } catch (e) {
        // Continue trying
      }
    }

    console.log("Waiting for authentication to complete...");
    // Wait for navigation with a longer timeout
    try {
      await page.waitForNavigation({
        timeout: 30000,
        waitUntil: "networkidle",
      });
      console.log("Navigation completed. Final URL:", page.url());
    } catch (e) {
      console.log("Navigation timeout, checking current state:", page.url());
    }

    console.log("Authentication successful! Now clicking buttons...");

    // Wait a bit for the page to fully load
    await page.waitForTimeout(1000);

    async function safeClick(selector, description = "", skipWait = false) {
      try {
        if (skipWait) {
          await page.click(selector);
        } else {
          await page.waitForSelector(selector, { timeout: 3000 });
          await page.click(selector);
        }
        console.log(`✓ Clicked ${description || selector}`);
        return true;
      } catch (error) {
        console.log(
          `✗ Element not found: ${description || selector} (${selector})`,
        );
        return false;
      }
    }

    // Helper function to check if element exists
    async function elementExists(selector) {
      try {
        const count = await page.locator(selector).count();
        return count > 0;
      } catch {
        return false;
      }
    }

    await safeClick(
      "#vpg-pagination-btn-forward-boards-1",
      "Pagination forward 1",
    );
    await safeClick(
      "#vpg-pagination-btn-forward-boards-2",
      "Pagination forward 2",
    );
    await safeClick(
      "#vpg-pagination-btn-forward-boards-3",
      "Pagination forward 3",
    );

    if (await elementExists("button#daily-card-not-completed-btn")) {
      await safeClick(
        "#daily-card-not-completed-btn",
        "Daily card not completed",
        true,
      );
    } else {
      await safeClick("#card-true-button", "Card true button", true);
      await safeClick("#quiz-complete-button", "Quiz complete button", true);
    }

    await safeClick(
      "#vpg-pagination-btn-forward-boards-4",
      "Pagination forward 4",
    );

    if (await elementExists("button#daily-card-not-completed-btn")) {
      await safeClick(
        "#daily-card-not-completed-btn",
        "Daily card not completed",
        true,
      );
    } else {
      await safeClick("#card-true-button", "Card true button", true);
      await safeClick("#quiz-complete-button", "Quiz complete button", true);
    }

    await page.goto("https://app.personifyhealth.com/#/stats-page");

    await page.click("#steps-card-button");
    await page.fill("#self-enter-steps-input", "6000");
    await page.click("#activity-save-btn");

    console.log("Add your button clicking code above this line");
  } catch (error) {
    console.error("Error during authentication:", error.message);
    await page.screenshot({ path: "error-screenshot.png" });
    console.log("Error screenshot saved as error-screenshot.png");
  } finally {
    //console.log("Keeping browser open for inspection. Press Ctrl+C to exit.");
    // Keep browser open for debugging - uncomment the line below to auto-close
    await browser.close();
  }
})();
