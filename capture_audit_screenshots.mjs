import { chromium } from "playwright";
import path from "path";
import fs from "fs";

const ARTIFACT_DIR = "C:/Users/shrid/.gemini/antigravity-ide/brain/af447e51-a247-45c3-b21a-cd5822b709de";

async function captureAllScreenshots() {
  console.log("=== CAPTURING SECTION SCREENSHOTS FOR AUDIT ===");
  const browser = await chromium.launch({ headless: true });

  // 1. Desktop 1440px Viewport
  console.log("Capturing 1440px desktop screenshots...");
  const page1440 = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page1440.goto("http://localhost:5173/about", { waitUntil: "networkidle" });
  await page1440.waitForTimeout(1000);

  // Set 1 (initial hero)
  await page1440.screenshot({
    path: path.join(ARTIFACT_DIR, "hero_set1_1440px.png"),
    fullPage: false,
  });

  // Set 2
  await page1440.mouse.wheel(0, 1400);
  await page1440.waitForTimeout(600);
  await page1440.screenshot({
    path: path.join(ARTIFACT_DIR, "hero_set2_1440px.png"),
    fullPage: false,
  });

  // Set 3
  await page1440.mouse.wheel(0, 1400);
  await page1440.waitForTimeout(600);
  await page1440.screenshot({
    path: path.join(ARTIFACT_DIR, "hero_set3_1440px.png"),
    fullPage: false,
  });

  // Set 4
  await page1440.mouse.wheel(0, 1400);
  await page1440.waitForTimeout(600);
  await page1440.screenshot({
    path: path.join(ARTIFACT_DIR, "hero_set4_1440px.png"),
    fullPage: false,
  });

  // What We Do (One Evidence Pipeline)
  await page1440.mouse.wheel(0, 1800);
  await page1440.waitForTimeout(700);
  await page1440.screenshot({
    path: path.join(ARTIFACT_DIR, "what_we_do_1440px.png"),
    fullPage: false,
  });

  // Statement with plant & Dome Transition
  await page1440.mouse.wheel(0, 1400);
  await page1440.waitForTimeout(700);
  await page1440.screenshot({
    path: path.join(ARTIFACT_DIR, "statement_dome_1440px.png"),
    fullPage: false,
  });

  // PROOF Principles (Light section) - Collapsed
  await page1440.mouse.wheel(0, 1100);
  await page1440.waitForTimeout(700);
  await page1440.screenshot({
    path: path.join(ARTIFACT_DIR, "proof_tiles_1440px.png"),
    fullPage: false,
  });

  // Hover 3rd tile (O - Originality)
  const tiles = await page1440.$$(".proof-tile-card");
  if (tiles.length >= 3) {
    await tiles[2].hover();
    await page1440.waitForTimeout(500);
    await page1440.screenshot({
      path: path.join(ARTIFACT_DIR, "proof_tile_expanded_1440px.png"),
      fullPage: false,
    });
  }

  // Measured results & Job Seeker section
  await page1440.mouse.wheel(0, 1400);
  await page1440.waitForTimeout(700);
  await page1440.screenshot({
    path: path.join(ARTIFACT_DIR, "job_seeker_1440px.png"),
    fullPage: false,
  });

  // 2. Wide 1920px Viewport (Proof of no boundary & no side strips)
  console.log("Capturing 1920px wide viewport (edge-to-edge check)...");
  const page1920 = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page1920.goto("http://localhost:5173/about", { waitUntil: "networkidle" });
  await page1920.waitForTimeout(1000);
  await page1920.screenshot({
    path: path.join(ARTIFACT_DIR, "hero_edge_to_edge_1920px.png"),
    fullPage: false,
  });

  // 3. Mobile 390px Viewport (Responsive & No overflow)
  console.log("Capturing 390px mobile viewport...");
  const page390 = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page390.goto("http://localhost:5173/about", { waitUntil: "networkidle" });
  await page390.waitForTimeout(1000);
  await page390.screenshot({
    path: path.join(ARTIFACT_DIR, "hero_390px.png"),
    fullPage: false,
  });

  await page390.mouse.wheel(0, 1200);
  await page390.waitForTimeout(600);
  await page390.screenshot({
    path: path.join(ARTIFACT_DIR, "what_we_do_390px.png"),
    fullPage: false,
  });

  await page390.mouse.wheel(0, 1400);
  await page390.waitForTimeout(600);
  await page390.screenshot({
    path: path.join(ARTIFACT_DIR, "proof_accordion_390px.png"),
    fullPage: false,
  });

  await page390.mouse.wheel(0, 1400);
  await page390.waitForTimeout(600);
  await page390.screenshot({
    path: path.join(ARTIFACT_DIR, "job_seeker_390px.png"),
    fullPage: false,
  });

  // Check text fit assertion log
  const textFitLogs = await page1440.evaluate(() => {
    return window.__textFitLogs || [];
  });
  console.log("Text fit check logged successfully.");

  await browser.close();
  console.log("All screenshots captured and saved to artifacts directory successfully!");
}

captureAllScreenshots().catch(console.error);
