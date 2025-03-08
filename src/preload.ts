import { contextBridge, ipcRenderer } from "electron";

// Expose the IPC API to the renderer process
contextBridge.exposeInMainWorld("electronAPI", {
  send: (channel: string, data: string) => ipcRenderer.send(channel, data),
  message: () => ipcRenderer.invoke("getHelloMessage"), // async
  fetchData: () => ipcRenderer.invoke("fetchData"),
  
  // Expose event listener methods for communicating between renderer and main process
  on: (channel: string, listener: (...args: any[]) => void) => { // listen for events from the main process by the renderer
    ipcRenderer.on(channel, listener);
  },

  removeAllListeners: (channel: string) => { // clean all listneres (after listening)
    ipcRenderer.removeAllListeners(channel);
  },
});

