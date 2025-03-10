export interface ElectronAPI {
  send: (channel: string, data: string) => void; // You can define `data` more specifically if needed
  sendBool: (channel: string, data: boolean) => void;
  message: () => Promise<string>;
  fetchData: () => Promise<{ data: string }>;

  onWsPort: (callback: (port: number) => void) => void;
  // startStreaming: () => void;

  on: (channel: string, listener: (_:IpcRendererEvent, message:string) => void) => void // Use `message: string` here
  removeAllListeners: (channel: string) => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {}; // Ensure this file is treated as a module
