import styled from "styled-components";
import SideBtn from "./sideBtn";
import { FaCamera, FaRecordVinyl } from "react-icons/fa6";
import { useAppContext } from "../context/useAppContext";
import SideBtnDd from "./sideBtnDd";
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

const SideBar = () => {
  const { cameraStatus, setCameraStatus, cameraIndex } = useAppContext();

  const algorithm = 0;
  useEffect(() => {
    window.electronAPI.selectAlgorithm("select-algorithm", algorithm);
  }, []);

  const handleToggleCamera = () => {
    const newStatus = !cameraStatus; // Toggle the current status
    setCameraStatus(newStatus); // Update the state
    if (typeof cameraIndex == "number") {
      // Handle the case where cameraIndex is invalid or not set
      window.electronAPI.startCamera(
        "start-camera",
        newStatus,
        cameraIndex,
        algorithm
      ); // Send the new status (true or false)
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
