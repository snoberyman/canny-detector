import { useEffect, useState } from "react";

import SideBar from "./components/sideBar/sideBar";
import MainDisplay from "./components/mainDisplay";
import LogDisplay from "./components/logDisplay";
import { useAppContext } from "./context/useAppContext";
import AlgorithmSelect from "./components/algorithmControl/algorithmSelect";
import AlgorithmControl from "./components/algorithmControl/algorithmControl";

function App() {
  // const [message, setMessage] = useState("");
  const { logMessages, addLogMessage } = useAppContext();
  const [selectedAlgorithm, setSelectedAlgorithm] = useState(0);

  // const prevStatusRef = useRef<string>(null);

  useEffect(() => {
    if (window.electronAPI) {
      const handleStatusUpdate = (response: { status: string }) => {
        // callback function to pass for onStatusMessageUpdate
        addLogMessage([response.status, new Date().toLocaleTimeString()]);
      };

      window.electronAPI.onStatusMessageUpdate(handleStatusUpdate); // pass handleStatusUpdate to be called on straing recieved from the main process

      return () => {
        window.electronAPI.removeAllListeners("status-updated");
      };
    }
  }, [addLogMessage]);

  return (
    <div style={{ textAlign: "center" }}>
      <SideBar />
      <MainDisplay />
      <AlgorithmSelect
        selectedAlgorithm={selectedAlgorithm}
        setSelectedAlgorithm={setSelectedAlgorithm}
      />
      <AlgorithmControl selectedAlgorithm={selectedAlgorithm} />
      <LogDisplay messages={logMessages} />
    </div>
  );
}

export default App;
