import { useContext } from "react";
import { AppContext } from "./AppContext";

export const useAppContext = () => {
  // Use useContext hook to get the context value
  const context = useContext(AppContext);
  // If the context is not found, then the hook is used outside the provider
  if (!context) throw new Error("useAppContext must be used within AppProvider");
  return context;
};