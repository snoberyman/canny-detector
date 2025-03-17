import { contextBridge, ipcRenderer, IpcRendererEvent } from "electron";

// Expose the IPC API to the renderer process
contextBridge.exposeInMainWorld("electronAPI", {
  fetchCams: () => ipcRenderer.invoke("fetchCams"), 
  onWsPort: (callback: (port: number) => void) => {
    ipcRenderer.on("ws-port", (_event, port: number) => callback(port));
  },
  toggleCamera: (channel: string, cameraStatus: boolean, cameraIndex: number) => ipcRenderer.send(channel, cameraStatus, cameraIndex),
  selectAlgorithm: (channel: string, algorithm: number) => ipcRenderer.send(channel, algorithm),
  algorithmsParmas: (channel: string, lowThreshold: number, highThreshold: number, L2gradient: boolean, ksize: number, delta: number) => 
    ipcRenderer.send(channel, lowThreshold, highThreshold, L2gradient, ksize, delta),
  saveImage: (channel: string, base64Data: string) => ipcRenderer.send(channel, base64Data ),
  onStatusMessageUpdate: (callback: (data: { status: string }) => void) => {
    ipcRenderer.on("status-updated", (_event: IpcRendererEvent, data: { status: string }) => {
      callback(data);
    });
  },
  on: (channel: string, listener: (_:IpcRendererEvent, message:string) => void) => { // listen for events from the main process by the renderer. 
    ipcRenderer.on(channel, listener);
  },
  removeAllListeners: (channel: string) => { 
    ipcRenderer.removeAllListeners(channel);
  },
});

