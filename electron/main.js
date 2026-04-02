const { app, BrowserWindow } = require("electron");
const path = require("path");

// 🔥 Start your backend (Jarvis brain)
require("../index.js");

function createWindow() {
  const win = new BrowserWindow({
    width: 900,
    height: 700,
    frame: false, // 🔥 clean futuristic UI
    transparent: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true
    }
  });

  win.loadFile(path.join(__dirname, "../renderer/index.html"));
}

app.whenReady().then(createWindow);