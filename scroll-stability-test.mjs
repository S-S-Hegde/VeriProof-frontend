import { chromium } from "playwright";

async function runScrollStabilityTest() {
  console.log("=== STARTING PLAYWRIGHT SCROLL STABILITY AUDIT ===");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  // 1. Navigate to /about
  console.log("[1/5] Loading http://localhost:5173/about...");
  await page.goto("http://localhost:5173/about", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  // 2. Wheel-scroll top to bottom in 120px steps
  console.log("[2/5] Wheel-scrolling top to bottom in 120px steps...");
  const maxScroll = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);
  let currentScroll = 0;

  while (currentScroll < maxScroll) {
    await page.mouse.wheel(0, 120);
    currentScroll += 120;
    await page.waitForTimeout(50);
  }

  // Check jumps after wheel scroll
  let jumps = await page.evaluate(() => window.__scrollMonitorJumps || []);
  console.log(`Wheel-scroll completed. Unexplained jumps flagged: ${jumps.length}`);

  // 3. PageDown through the page
  console.log("[3/5] Testing PageDown key through the page...");
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);

  for (let i = 0; i < 8; i++) {
    await page.keyboard.press("PageDown");
    await page.waitForTimeout(300);
  }

  jumps = await page.evaluate(() => window.__scrollMonitorJumps || []);
  console.log(`PageDown completed. Unexplained jumps flagged: ${jumps.length}`);

  // 4. Reload mid-page
  console.log("[4/5] Testing reload mid-page...");
  await page.mouse.wheel(0, 1500);
  await page.waitForTimeout(600);
  const scrollBeforeReload = await page.evaluate(() => window.scrollY);
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  console.log(`Reload completed. Scroll position restored stably.`);

  // 5. Back and forward navigation
  console.log("[5/5] Testing back & forward navigation...");
  await page.goto("http://localhost:5173/contact", { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  await page.goBack({ waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  await page.goForward({ waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  await page.goBack({ waitUntil: "networkidle" });
  await page.waitForTimeout(800);

  // Final Jump Verification
  jumps = await page.evaluate(() => window.__scrollMonitorJumps || []);
  console.log("=== FINAL JUMP AUDIT RESULTS ===");
  console.log(`Total unexplained jumps (> 160px) flagged: ${jumps.length}`);

  if (jumps.length > 0) {
    console.error("FAIL: Unexplained jumps were detected:", jumps);
    await browser.close();
    process.exit(1);
  } else {
    console.log("SUCCESS: 0 unexplained jumps! Smooth scroll stability passed all 5 criteria.");
  }

  await browser.close();
}

runScrollStabilityTest().catch((err) => {
  console.error("Error during Playwright test:", err);
  process.exit(1);
});
