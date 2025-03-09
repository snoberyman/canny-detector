import { contextBridge, ipcRenderer, IpcRendererEvent } from "electron";

// Expose the IPC API to the renderer process
contextBridge.exposeInMainWorld("electronAPI", {
  send: (channel: string, data: string) => ipcRenderer.send(channel, data),
  message: () => ipcRenderer.invoke("getHelloMessage"), // async
  fetchData: () => ipcRenderer.invoke("fetchData"),
  // startStreaming: () => ipcRenderer.send("start-streaming"),

  onWsPort: (callback: (port: number) => void) => {
    ipcRenderer.on("ws-port", (_event, port: number) => callback(port));
  },
  // Expose event listener methods for communicating between renderer and main process
  on: (channel: string, listener: (_:IpcRendererEvent, message:string) => void) => { // listen for events from the main process by the renderer
    ipcRenderer.on(channel, listener);
  },

  removeAllListeners: (channel: string) => { // clean all listneres (after listening)
    ipcRenderer.removeAllListeners(channel);
  },
});

