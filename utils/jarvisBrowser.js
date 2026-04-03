const { exec } = require("child_process");
const yts = require("yt-search");

const JARVIS_PROFILE_PATH = "/tmp/jarvis-brave-profile";

let browserStarted = false;

// 🧠 Start isolated Brave instance
function startJarvisBrowser() {
  if (browserStarted) return;

  exec(`
  open -na "Brave Browser" --args \
  --user-data-dir="${JARVIS_PROFILE_PATH}" \
  --new-window
  `);

  browserStarted = true;
}

// 🎬 PLAY YOUTUBE
async function playYouTube(query) {
  const results = await yts(query);
  const video = results.videos[0];

  if (!video) throw new Error("No video found");

  const url = video.url;

  startJarvisBrowser();

  setTimeout(() => {
    exec(`
    osascript -e '
    tell application "Brave Browser"
      activate

      tell front window
        if (count of tabs) = 0 then
          make new tab with properties {URL:"${url}"}
        else
          set URL of active tab to "${url}"
        end if
      end tell

    end tell'
    `);
  }, 800);

  return video.title;
}

// 🌐 OPEN YOUTUBE
async function openYouTube() {
  startJarvisBrowser();

  setTimeout(() => {
    exec(`
    osascript -e '
    tell application "Brave Browser"
      activate
      tell front window
        set URL of active tab to "https://youtube.com"
      end tell
    end tell'
    `);
  }, 800);
}

// ❌ CLOSE TAB
async function closeTab() {
  exec(`
  osascript -e '
  tell application "Brave Browser"
    activate
    tell front window to close active tab
  end tell'
  `);
}

module.exports = {
  playYouTube,
  openYouTube,
  closeTab,
};