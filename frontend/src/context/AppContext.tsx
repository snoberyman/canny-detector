import { createContext } from "react";

interface AppContextType {
  cameraStatus: boolean;
  setCameraStatus: (message: boolean) => void;
  statusMessage: string;
  setStatusMessage: (message: string) => void;
  cameraIndex: number;
  setCameraIndex: (options: number) => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);
