const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("jarvis", {
  startListening: () => {
    ipcRenderer.send("start-listening");
  },
});