let mainWindow = null;

function setWindow(win) {
  mainWindow = win;
}

function sendToUI(data) {
  if (mainWindow) {
    mainWindow.webContents.send("jarvis-state-update", data);
  }
}

module.exports = { setWindow, sendToUI };