import { useEffect, useState } from "react";
// Define the expected type for fetchData
interface FetchDataResponse {
  data: string;
}

function App() {
  const [message, setMessage] = useState("");
  const [data, setData] = useState<FetchDataResponse | null>(null);

  useEffect(() => {
    if (window.electronAPI) {
      // contains methods that are defined in the main process
      setMessage(window.electronAPI.message());
      window.electronAPI.fetchData().then((response) => {
        setData(response);
      });
    }
  }, []);

  return (
    <div style={{ textAlign: "center", padding: "50px" }}>
      <h1>Hello, Electron + React!</h1>
      <p>Message from Electron: {message}</p>
      <p>Data from Main Process: {data ? data.data : "Loading..."}</p>
    </div>
  );
}

export default App;
