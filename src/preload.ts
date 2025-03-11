import { contextBridge, ipcRenderer, IpcRendererEvent } from "electron";

// Expose the IPC API to the renderer process
contextBridge.exposeInMainWorld("electronAPI", {
  fetchData: () => ipcRenderer.invoke("fetchData"),
  send: (channel: string, data: string) => ipcRenderer.send(channel, data),
  sendBool: (channel: string, data: boolean) => ipcRenderer.send(channel, data),
  message: () => ipcRenderer.invoke("getHelloMessage"), // async
  
  // startStreaming: () => ipcRenderer.send("start-streaming"),

  onWsPort: (callback: (port: number) => void) => {
    ipcRenderer.on("ws-port", (_event, port: number) => callback(port));
  },
  // Expose event listener methods for communicating from main to renderer 
  on: (channel: string, listener: (_:IpcRendererEvent, message:string) => void) => { // listen for events from the main process by the renderer. Accept bollean or string
    ipcRenderer.on(channel, listener);
  },
  // clean all listneres (after listening)
  removeAllListeners: (channel: string) => { 
    ipcRenderer.removeAllListeners(channel);
  },
});

