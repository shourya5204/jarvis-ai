const fs = require("fs");
const path = require("path");
const os = require("os");

const configPath = path.join(
  os.homedir(),
  "Library/Application Support/Jarvis/config.json"
);

// Ensure folder exists
function ensureDir() {
  const dir = path.dirname(configPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function saveConfig(data) {
  ensureDir();
  fs.writeFileSync(configPath, JSON.stringify(data, null, 2));
}

function loadConfig() {
  if (!fs.existsSync(configPath)) return null;
  return JSON.parse(fs.readFileSync(configPath));
}

module.exports = { saveConfig, loadConfig };