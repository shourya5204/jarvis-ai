const puppeteer = require("puppeteer");

let browser = null;
let page = null;

async function getPage() {
  if (!browser) {
    browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
      args: ["--start-maximized"]
    });

    page = await browser.newPage();
  }

  return page;
}

// 🎬 PLAY YOUTUBE
async function playYouTube(query) {
  const page = await getPage();

  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
  await page.goto(url);

  await page.waitForSelector("ytd-video-renderer");

  const video = await page.$("ytd-video-renderer a#thumbnail");

  if (!video) throw new Error("No video found");

  await video.click();
}

// 🌐 OPEN YOUTUBE
async function openYouTube() {
  const page = await getPage();
  await page.goto("https://youtube.com");
}

// ❌ CLOSE TAB (FIXED)
async function closeTab() {
  if (!browser || !page) return;

  try {
    const pages = await browser.pages();

    if (pages.length > 1) {
      await page.close();

      const remaining = await browser.pages();
      page = remaining[0];
    } else {
      // instead of closing last tab → reset
      await page.goto("about:blank");
    }

  } catch (err) {
    console.log("Close tab error:", err);
  }
}

module.exports = { playYouTube, openYouTube, closeTab };