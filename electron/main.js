const { app, BrowserWindow } = require("electron");
const path = require("path");
const { ipcMain } = require("electron");
require("../index.js"); // backend


const { saveConfig } = require("../utils/configStore");

ipcMain.on("save-config", (_, data) => {
  saveConfig(data);
});

const { loadConfig } = require("../utils/configStore");

ipcMain.handle("get-config", () => {
  return loadConfig();
});




//reset button for api 


const fs = require("fs");
const os = require("os");

const configPath = path.join(
  os.homedir(),
  "Library/Application Support/Jarvis/config.json"
);

// 🔥 RESET HANDLER
ipcMain.on("reset-config", () => {
  if (fs.existsSync(configPath)) {
    fs.unlinkSync(configPath);
  }

  app.relaunch();
  app.exit(0);
});











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
  const { setWindow } = require("../utils/uiEmitter");
  setWindow(win);
  // 🔥 dev tools

  if (!app.isPackaged) {
  win.webContents.openDevTools();
}



ipcMain.on("start-listening", async () => {
  const { startListening } = require("../index");
  await startListening();
});


}

app.whenReady().then(createWindow);