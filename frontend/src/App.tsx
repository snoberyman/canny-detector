import { useEffect, useState, useRef } from "react";
import { AppProvider } from "./context/AppProvider"; // Import context provider

import SideBar from "./components/sideBar";
import MainDisplay from "./components/mainDisplay";
import LogDisplay from "./components/logDisplay";

// Define the expected type for fetchStatus
interface FetchStatusResponse {
  status: string;
}

function App() {
  // const [message, setMessage] = useState("");
  const [status, setStatus] = useState<FetchStatusResponse | null>(null);
  const [logMessages, setLogMessages] = useState<string[][]>([
    ["program started", new Date().toLocaleTimeString()],
  ]);
  const prevStatusRef = useRef<string>(null);

  useEffect(() => {
    const fetchAndUpdate = async () => {
      if (window.electronAPI) {
        // Fetch new data
        await window.electronAPI.fetchStatus().then((response) => {
          // Check if data has changed (avoid adding duplicate logs)
          if (
            response.status !== prevStatusRef.current &&
            response.status != ""
          ) {
            console.log("status:", status);
            console.log("response: ", response);

            setStatus(response);
            prevStatusRef.current = response.status; // Update ref without causing re-renders
            const tmp = [response.status, new Date().toLocaleTimeString()];
            setLogMessages((prevMessages) => [...prevMessages, tmp]);
          }
        });
      }
    };

    fetchAndUpdate();

    // Set up polling to check status every 1 second
    const intervalId = setInterval(fetchAndUpdate, 1000);

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  });

  return (
    <AppProvider>
      <div style={{ textAlign: "center" }}>
        <SideBar />
        <MainDisplay />

        <LogDisplay messages={logMessages} />
        {/* <p>Message from Electron: {message}</p>
        <p>Data from Main Process: {data ? data.data : "Loading..."}</p> */}
      </div>
    </AppProvider>
  );
}

export default App;
