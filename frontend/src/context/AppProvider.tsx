import { ReactNode, useState, useEffect } from "react";
import { AppContext } from "./AppContext"; //  context to hold the state

// Use the exposed `electronAPI` object to communicate with the main process
const { on, removeAllListeners } = window.electronAPI; // Access the 'on' and 'removeAllListeners' methods

// Function for listening to Electron events
const listenToMainProcess = (setLatestMessage: (msg: string) => void) => {
  // Use the `on` method to listen for events sent from the main process
  on("fromMainProcess", (_: unknown, message: string) => {
    setLatestMessage(message); // Update the state with the message
  });

  // Return a cleanup function to remove listeners when the component is unmounted
  return () => {
    removeAllListeners("fromMainProcess");
  };
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [latestMessage, setLatestMessage] = useState("No message yet");

  useEffect(() => {
    // Listen to the Electron main process
    const unsubscribe = listenToMainProcess(setLatestMessage);

    // Cleanup listener when the component is unmounted
    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <AppContext.Provider value={{ latestMessage, setLatestMessage }}>
      {children}
    </AppContext.Provider>
  );
};
