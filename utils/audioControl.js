const { execSync } = require("child_process");

function getVolume() {
  return parseInt(
    execSync(`osascript -e "output volume of (get volume settings)"`)
      .toString()
      .trim()
  );
}

function setVolume(level) {
  execSync(`osascript -e "set volume output volume ${level}"`);
}

// 🔥 NEW
function mute() {
  execSync(`osascript -e "set volume with output muted"`);
}

function unmute() {
  execSync(`osascript -e "set volume without output muted"`);
}

module.exports = { getVolume, setVolume, mute, unmute };