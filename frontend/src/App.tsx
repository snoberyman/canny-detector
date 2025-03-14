import { useEffect } from "react";

import SideBar from "./components/sideBar";
import MainDisplay from "./components/mainDisplay";
import LogDisplay from "./components/logDisplay";
import { useAppContext } from "./context/useAppContext";

function App() {
  // const [message, setMessage] = useState("");
  const { logMessages, addLogMessage } = useAppContext();
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
      <LogDisplay messages={logMessages} />
    </div>
  );
}

export default App;
