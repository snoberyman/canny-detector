export interface ElectronAPI {
  send: (channel: string, data: unknown) => void; // You can define `data` more specifically if needed
  message: () => Promise<string>;
  fetchData: () => Promise<{ data: string }>;
  on: (channel: string, listener: (_:never, message:string) => void) => void // Use `message: string` here
  removeAllListeners: (channel: string) => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {}; // Ensure this file is treated as a module
