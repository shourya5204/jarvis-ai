const { app, BrowserWindow } = require("electron");
const path = require("path");
const { ipcMain } = require("electron");
require("../index.js"); // backend

function createWindow() {
  const win = new BrowserWindow({
    width: 900,
    height: 700,
    backgroundColor: "#000000", // IMPORTANT (fix blank screen)
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js")
    }
  });

  const filePath = path.join(__dirname, "../renderer/dist/index.html");

  console.log("Loading UI from:", filePath); // DEBUG

  win.loadFile(filePath);

  // 🔥 ALWAYS OPEN DEVTOOLS FOR NOW
  win.webContents.openDevTools();



  ipcMain.on("start-listening", async () => {
  console.log("🎤 UI triggered");

  const { startListening } = require("../index");
  await startListening();
});


}

app.whenReady().then(createWindow);