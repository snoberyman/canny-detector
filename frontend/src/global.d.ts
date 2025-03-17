export interface ElectronAPI {
  // send: (channel: string, data: string) => void; // You can define `data` more specifically if needed
  fetchCams: () => Promise<{ data: number[] }>;
  onWsPort: (callback: (port: number) => void) => void;
  toggleCamera: (channel: string, cameraStatus: boolean, cameraIndex: number,algorithm: number) => void;
  selectAlgorithm: (channel: string, algorithm: number) => void;
  algorithmsParmas: (channel: string, lowThreshold: number, highThreshold: number, ksize: number, delta: number) => void;
  saveImage: (channel: string, base64Data: string) => Promise<string>;
  onStatusMessageUpdate: (callback: (data: { status: string }) => void) => void;
  on: (channel: string, listener: (_:IpcRendererEvent, message:string) => void) => void 
  removeAllListeners: (channel: string) => void;
  
  
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {}; // Ensure this file is treated as a module
