import { useEffect, useState } from "react";

import SideBar from "./components/sideBar";

// Define the expected type for fetchData
interface FetchDataResponse {
  data: string;
}

function App() {
  const [message, setMessage] = useState("");
  const [data, setData] = useState<FetchDataResponse | null>(null);

  useEffect(() => {
    if (window.electronAPI) {
      // electronAPI: contains methods that are defined in the main process
      window.electronAPI.message().then((msg) => setMessage(msg));
      window.electronAPI.fetchData().then((response) => {
        setData(response);
      });
    }
  }, []);

  return (
    <div style={{ textAlign: "center", padding: "50px" }}>
      <SideBar />
      <h1>Hello, Electron + React!</h1>
      <p>Message from Electron: {message}</p>
      <p>Data from Main Process: {data ? data.data : "Loading..."}</p>
    </div>
  );
}

export default App;
