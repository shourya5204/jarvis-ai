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
});