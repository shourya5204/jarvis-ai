const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("jarvis", {
  startListening: () => {
    ipcRenderer.send("start-listening");
  },

  onStateChange: (callback) => {
    ipcRenderer.on("jarvis-state-update", (_, data) => {
      callback(data);
    });
  },

  // 🔥 ADD THIS (YOUR ERROR FIX)
  saveConfig: (data) => {
    ipcRenderer.send("save-config", data);
  },

  getConfig: () => {
    return ipcRenderer.invoke("get-config");
  },

  // 🔥 ADD THIS
  resetConfig: () => {
    ipcRenderer.send("reset-config");
  }
});