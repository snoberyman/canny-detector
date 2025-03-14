import styled from "styled-components";
import SideBtn from "./sideBtn";
import { FaCamera, FaRecordVinyl } from "react-icons/fa6";
import { useAppContext } from "../context/useAppContext";
import SideBtnDd from "./sideBtnDd";

interface SidebarProps {
  bgColor?: string; // bgColor is optional and should be a string (e.g., hex color)
}

const SidebarContainer = styled.div<SidebarProps>`
  height: 100%;
  width: 60px;
  position: fixed;
  left: 0;
  top: 0;
  background-color: #004643;
`;

const SideBar = () => {
  const { cameraStatus, setCameraStatus, cameraIndex } = useAppContext();

  // useEffect(() => {
  //   // Listen for the reply from the main process
  //   window.electronAPI.on(
  //     "camera-status",
  //     (_: IpcRendererEvent, message: string | boolean) => {
  //       console.log("Camera status from main process:", message); // Should log "Camera started"
  //       if (typeof message === "boolean") {
  //         setCameraStatus(message); // Update the state with the message
  //         console.log("FE: Camera is starting.. ");
  //       }
  //     }
  //   );

  //   return () => {
  //     // Cleanup the listener when the component unmounts
  //     window.electronAPI.removeAllListeners("camera-status");
  //   };
  // }, [setCameraStatus]);

  const handleToggleCamera = () => {
    const newStatus = !cameraStatus; // Toggle the current status
    setCameraStatus(newStatus); // Update the state
    if (cameraIndex !== undefined) {
      // Handle the case where cameraIndex is invalid or not set
      window.electronAPI.startCamera("start-camera", newStatus, cameraIndex); // Send the new status (true or false)
    }
  };

  return (
    <>
      <SidebarContainer>
        <SideBtn
          icon={<FaRecordVinyl />}
          onClick={handleToggleCamera}
          $cameraIndex={cameraIndex}
        ></SideBtn>
        <SideBtnDd icon={<FaCamera />} onClick={() => alert("select camera")} />
      </SidebarContainer>
    </>
  );
};

export default SideBar;
