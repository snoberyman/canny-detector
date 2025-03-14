import { contextBridge, ipcRenderer, IpcRendererEvent } from "electron";

// Expose the IPC API to the renderer process
contextBridge.exposeInMainWorld("electronAPI", {
  startCamera: (channel: string, cameraStatus: boolean, cameraIndex: number) => ipcRenderer.send(channel, cameraStatus, cameraIndex),
  // fetchStatus: () => ipcRenderer.invoke("fetchStatus"),
  onStatusMessageUpdate: (callback: (data: { status: string }) => void) => {
    ipcRenderer.on("status-updated", (_event: IpcRendererEvent, data: { status: string }) => {
      callback(data);
    });
  },
  fetchCams: () => ipcRenderer.invoke("fetchCams"), 

  send: (channel: string, data: string) => ipcRenderer.send(channel, data),
  
  
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

