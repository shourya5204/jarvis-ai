const { playYouTube, openYouTube, closeTab } = require("../utils/jarvisBrowser");
const { handleBrowser } = require("../agents/browserAgent");
const { handleFile } = require("../agents/fileAgent");

// =========================
// 🚀 MAIN ROUTER
// =========================
async function route(intent) {

  if (intent.type !== "PLAN") {
    return "Unsupported operation.";
  }

  let result = null;

  for (const step of intent.steps) {

    // =========================
    // 🎬 OS ACTIONS (PUPPETEER ONLY)
    // =========================
    if (step.type === "OS_ACTION") {

      // 🎬 PLAY YOUTUBE
      if (step.action === "youtube_play") {
        try {
          await playYouTube(step.query || "");
          return "Playing now.";
        } catch (err) {
          console.log("YT ERROR:", err);
          return "Failed to play video";
        }
      }

      // 🌐 OPEN YOUTUBE
      if (step.action === "open_youtube") {
        try {
          await openYouTube();
          return "YouTube opened.";
        } catch (err) {
          console.log(err);
          return "Failed to open YouTube";
        }
      }

      // ❌ CLOSE TAB (PUPPETEER)
      if (step.action === "close_tab") {
        try {
          await closeTab();
          return "Closed tab.";
        } catch (err) {
          console.log(err);
          return "Failed to close tab";
        }
      }
    }

    // =========================
    // 🔍 BROWSER SEARCH
    // =========================
    if (step.type === "BROWSER_SEARCH") {
      result = await handleBrowser(step);
    }

    // =========================
    // 📂 FILE OPERATIONS
    // =========================
    if (step.type === "FILE_OPERATION") {
      result = await handleFile(step);
    }
  }

  return result;
}

module.exports = { route };