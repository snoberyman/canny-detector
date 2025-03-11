import { useEffect, useState } from "react";
import { AppProvider } from "./context/AppProvider"; // Import context provider

import SideBar from "./components/sideBar";
import MainDisplay from "./components/mainDisplay";
import LogDsipaly from "./components/logDisplay";

// Define the expected type for fetchData
interface FetchDataResponse {
  data: string;
}

function App() {
  // const [message, setMessage] = useState("");
  const [data, setData] = useState<FetchDataResponse | null>(null);
  const [logMessages, setLogMessages] = useState<string[]>([]);

  useEffect(() => {
    if (window.electronAPI) {
      // electronAPI: contains methods that are defined in the main process
      // window.electronAPI.message().then((msg) => setMessage(msg));
      window.electronAPI.fetchData().then((response) => {
        setData(response);
        setLogMessages((prevMessages) => [
          ...prevMessages,
          `<div style="color:#ccc; display:inline"> >> ${new Date().toLocaleTimeString()}:</div> ${
            data ? data : ""
          }`,
        ]);
      });
    }
  }, [data]);

  return (
    <AppProvider>
      <div style={{ textAlign: "center" }}>
        <SideBar />
        <MainDisplay />

        <LogDsipaly messages={logMessages} />
        {/* <p>Message from Electron: {message}</p>
        <p>Data from Main Process: {data ? data.data : "Loading..."}</p> */}
      </div>
    </AppProvider>
  );
}

export default App;
