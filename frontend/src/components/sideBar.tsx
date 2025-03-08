import { IpcRendererEvent } from "electron";
import styled from "styled-components";
import SideBtn from "./sideBtn";
import { FaCamera, FaUpload } from "react-icons/fa6";
import { useEffect } from "react";
import { useAppContext } from "../context/useAppContext";

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
  const { setLatestMessage } = useAppContext();

  useEffect(() => {
    // Listen for the reply from the main process
    window.electronAPI.on(
      "camera-status",
      (_: IpcRendererEvent, message: string) => {
        console.log("Camera status from main process:", message); // Should log "Camera started"
        setLatestMessage(message);
      }
    );

    return () => {
      // Cleanup the listener when the component unmounts
      window.electronAPI.removeAllListeners("camera-status");
    };
  }, [setLatestMessage]);

  return (
    <>
      <SidebarContainer>
        <SideBtn
          icon={<FaCamera />}
          onClick={() =>
            window.electronAPI.send("start-camera", "start-camera")
          }
        ></SideBtn>
        <SideBtn
          icon={<FaUpload />}
          onClick={() => alert("Upload Clicked!")}
        ></SideBtn>
      </SidebarContainer>
    </>
  );
};

export default SideBar;
