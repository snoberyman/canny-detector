import { contextBridge, ipcRenderer } from "electron";

// Expose the API to the renderer process. Communicate with the main process.
contextBridge.exposeInMainWorld("electronAPI", { // Send messages to main and recieve responses
  message: () => ipcRenderer.invoke("getHelloMessage"),
  fetchData: () => ipcRenderer.invoke("fetchData"),
});


// contextBridge:     safely expose specific functionality from the main process to the renderer process
// exposeInMainWorld: allows to expose specific functionality to the global window object of the renderer process.
// electronAPI:       the name of the object being exposed to the renderer process.