import { ReactNode, useState } from "react";
import { AppContext } from "./AppContext"; //  context to hold the state

// Use the exposed `electronAPI` object to communicate with the main process
// const { on, removeAllListeners } = window.electronAPI; // Access the 'on' and 'removeAllListeners' methods

// Function for listening to Electron events
// const listenToMainProcess = (setStatusMessage: (message: string) => void) => {
//   // Use the `on` method to listen for events sent from the main process
//   on("fromMainProcess", (_: unknown, message: string) => {
//     setStatusMessage(message);
//     console.log("Received string message:", message); // string of slected camera
//   });

//   // Return a cleanup function to remove listeners when the component is unmounted
//   return () => {
//     removeAllListeners("fromMainProcess");
//   };
// };

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [cameraStatus, setCameraStatus] = useState<boolean>(false);
  const [cameraIndex, setCameraIndex] = useState<number>(1);

  // useEffect(() => {
  //   // Listen to the Electron main process
  //   // const unsubscribe = listenToMainProcess(setStatusMessage);

  //   // Update the state with the message, tne cleanup listener when the component is unmounted
  //   return () => {
  //     // unsubscribe();
  //   };
  // }, []);

  return (
    <AppContext.Provider
      value={{
        cameraStatus,
        setCameraStatus,
        statusMessage,
        setStatusMessage,
        cameraIndex,
        setCameraIndex,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
