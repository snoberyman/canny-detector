import { useEffect, useState } from "react";
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
  const [logMessages, setLogMessages] = useState<string[]>([]);

  useEffect(() => {
    const fetchAndUpdate = async () => {
      if (window.electronAPI) {
        // Fetch new data
        const response = await window.electronAPI.fetchStatus();
        console.log("response is here: ", response);
        // Check if data has changed (avoid adding duplicate logs)
        if (response.status !== status?.status) {
          setStatus(response);
          setLogMessages((prevMessages) => [
            ...prevMessages,
            `<div style="color:#ccc; display:inline"> >> ${new Date().toLocaleTimeString()}:</div> ${
              response.status
            }`,
          ]);
        }
      }
    };

    fetchAndUpdate();

    // Set up polling (or use a setInterval for repeated fetches)
    const intervalId = setInterval(fetchAndUpdate, 1000); // Poll every 2 seconds

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [status]); // Depend on `data` to trigger fetch only when it's changed

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
