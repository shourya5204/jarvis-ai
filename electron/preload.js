const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("jarvis", {
  send: (msg) => console.log("UI →", msg)
});