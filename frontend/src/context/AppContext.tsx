import { createContext } from "react";

interface AppContextType {
  latestMessage: string;
  setLatestMessage: (msg: string) => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);
