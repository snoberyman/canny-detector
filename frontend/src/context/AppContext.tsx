import { createContext } from "react";

interface AppContextType {
  cameraStatus: boolean;
  setCameraStatus: (message: boolean) => void;
  cameraIndex: number | undefined;
  setCameraIndex: (options: number | undefined) => void;
  logMessages: string[][];
  addLogMessage: (message: [string, string]) => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);
