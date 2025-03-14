export interface ElectronAPI {
  // send: (channel: string, data: string) => void; // You can define `data` more specifically if needed
  fetchCams: () => Promise<{ data: number[] }>;
  onWsPort: (callback: (port: number) => void) => void;
  startCamera: (channel: string, cameraStatus: boolean, cameraIndex: number,algorithm: number) => void;
  selectAlgorithm: (channel: string,algorithm: number) => void;
  onStatusMessageUpdate: (callback: (data: { status: string }) => void) => void;
  removeAllListeners: (channel: string) => void;
  


  
  // startStreaming: () => void;
  // on: (channel: string, listener: (_:IpcRendererEvent, message:string) => void) => void // Use `message: string` here
  
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {}; // Ensure this file is treated as a module
