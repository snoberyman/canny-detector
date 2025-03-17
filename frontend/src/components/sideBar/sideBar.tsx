import styled from "styled-components";
import ToggleCmaeraBtnProps from "./toggleCmaeraBtn";
import { FaCamera, FaRecordVinyl, FaImage } from "react-icons/fa6";
import { useAppContext } from "../../context/useAppContext";
import SelectCmaeraBtn from "./selectCmaeraBtn";
import CaptureCmaeraBtn from "./captureCameraBtn";
import { useEffect } from "react";

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

const SideBar = ({ videoStream }: { videoStream: string }) => {
  const { cameraStatus, setCameraStatus, cameraIndex, addLogMessage } =
    useAppContext();

  const algorithm = 0;
  useEffect(() => {
    window.electronAPI.selectAlgorithm("select-algorithm", algorithm);
  }, []);

  const handleToggleCamera = () => {
    const newStatus = !cameraStatus; // Toggle the current status
    setCameraStatus(newStatus); // Update the state
    if (typeof cameraIndex == "number") {
      // Handle the case where cameraIndex is invalid or not set
      window.electronAPI.toggleCamera(
        "toggle-camera",
        newStatus,
        cameraIndex,
        algorithm
      ); // Send the new status (true or false)
    }
  };

  const handleCaptureImage = async () => {
    if (!videoStream) return;

    setCameraStatus(false); // Set camera status to false while saving the imag

    // Send the frame to the main process
    window.electronAPI.saveImage("save-image", videoStream);
  };

  useEffect(() => {
    const handleImageSaved = (_: unknown, message: string) => {
      addLogMessage([message, new Date().toLocaleTimeString()]);
      setCameraStatus(true); // Set camera status back to true
    };

    // Add listener
    window.electronAPI.on("image-saved", handleImageSaved);

    // Clean up the listener on unmount
    return () => {
      window.electronAPI.removeAllListeners("image-saved");
    };
  }, [setCameraStatus, addLogMessage]);

  return (
    <>
      <SidebarContainer>
        <ToggleCmaeraBtnProps
          icon={<FaRecordVinyl />}
          onClick={handleToggleCamera}
          $cameraIndex={cameraIndex}
        ></ToggleCmaeraBtnProps>
        <SelectCmaeraBtn icon={<FaCamera />}></SelectCmaeraBtn>
        <hr></hr>
        <CaptureCmaeraBtn
          icon={<FaImage />}
          onClick={handleCaptureImage}
          $cameraIndex={cameraIndex}
          $cameraStatus={cameraStatus}
        ></CaptureCmaeraBtn>
      </SidebarContainer>
    </>
  );
};

export default SideBar;
