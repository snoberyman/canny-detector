import { contextBridge, ipcRenderer, IpcRendererEvent } from "electron";

// Expose the IPC API to the renderer process
contextBridge.exposeInMainWorld("electronAPI", {
  fetchCams: () => ipcRenderer.invoke("fetchCams"), 
  onWsPort: (callback: (port: number) => void) => {
    ipcRenderer.on("ws-port", (_event, port: number) => callback(port));
  },
  startCamera: (channel: string, cameraStatus: boolean, cameraIndex: number) => ipcRenderer.send(channel, cameraStatus, cameraIndex),
  selectAlgorithm: (channel: string, algorithm: number) => ipcRenderer.send(channel, algorithm),
  onStatusMessageUpdate: (callback: (data: { status: string }) => void) => {
    ipcRenderer.on("status-updated", (_event: IpcRendererEvent, data: { status: string }) => {
      callback(data);
    });
  },
  removeAllListeners: (channel: string) => { 
    ipcRenderer.removeAllListeners(channel);
  },


  // send: (: string, data: string) => ipcRenderer.send(channel, data),
  // startStreaming: () => ipcRenderer.send("start-streaming"),
  // Expose event listener methods for communicating from main to renderer 
  // on: (channel: string, listener: (_:IpcRendererEvent, message:string) => void) => { // listen for events from the main process by the renderer. Accept bollean or string
  //   ipcRenderer.on(channel, listener);
  // },
  // clean all listneres (after listening)

});

