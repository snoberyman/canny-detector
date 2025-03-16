import { useState, useEffect } from "react";
import { useAppContext } from "../context/useAppContext";
import { FaVideoSlash } from "react-icons/fa6";
import styled from "styled-components";

const VideoContainer = styled.div`
  width: 640px;
  height: 480px;
  margin: auto;
  background-color: #777;
  position: relative;
`;

const PlayButtonContainer = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
`;

const VideoImage = styled.img`
  width: 640px;
  height: 480px;
  margin: auto;
  display: block;
`;

const MainDisplay = () => {
  const { cameraStatus, addLogMessage } = useAppContext(); // Get the latest message
  const [videoStream, setVideoStream] = useState<string>("");
  const [fps, setFps] = useState<string>("0");

  useEffect(() => {
    let lastTimestamp = performance.now(); // initial timestamp (milliseconds)
    // let frameCount = 0;
    // let fps = 0;

    // Ensure that the window.electronAPI from preload is available
    if (window.electronAPI && cameraStatus) {
      window.electronAPI.onWsPort((port: number) => {
        // Create a new WebSocket instance to connect with the WebSocket server that runs on Electron's main prcess
        const socket = new WebSocket(`ws://localhost:${port}`);
        // Set the event listeners on the socket
        socket.onopen = () => {
          // when connection is established
          addLogMessage([
            "WebSocket connection established.",
            new Date().toLocaleTimeString(),
          ]);
          // window.electronAPI.startStreaming(); // Start streaming in the main process
        };
        socket.onmessage = (event: MessageEvent) => {
          const now = performance.now(); // Current timestamp (milliseconds)
          const timeDiff = now - lastTimestamp; // Time difference between two consecutive frames
          lastTimestamp = now; // Update timestamp for the next frame

          // Calculate FPS (convert ms to seconds)
          if (timeDiff > 0) {
            const currentFPS = 1000 / timeDiff; // FPS = 1000ms / frame interval (taken in ms)
            // fps = (fps * frameCount + currentFPS) / (frameCount + 1); // Smoother  FPS with averaging, to prevent suddent spikes
            // frameCount++;
            setFps(currentFPS.toFixed());
          }

          // when client recieve message from server
          setVideoStream(event.data); // Set the video stream as the image source
        };

        socket.onclose = () => {
          // when the webSocket connection is closed.
          addLogMessage([
            "Client disconnected.",
            new Date().toLocaleTimeString(),
          ]);

          setVideoStream("");
          setFps("0");
          if (socket) {
            socket.close();
          }
        };
      });
    }
    // Cleanup listener on unmount or cameraStatus change
    return () => {
      window.electronAPI.removeAllListeners("ws-port");
    };
  }, [cameraStatus, addLogMessage]);

  // Log videoStream whenever it changes
  useEffect(() => {}, [videoStream]); // This effect runs when videoStream changes

  return (
    <>
      <div style={{ flex: 1, padding: "20px" }}></div>
      <div>
        {/* Display the video stream using the Base64 data */}
        {videoStream && cameraStatus ? (
          <VideoImage
            id="videoStream"
            src={`data:image/jpg;base64,${videoStream}`}
            alt="WebSocket video stream"
          />
        ) : (
          <VideoContainer>
            <PlayButtonContainer>
              <FaVideoSlash size={64} />
            </PlayButtonContainer>
          </VideoContainer>
        )}
        <div style={{ fontSize: "14px", marginTop: "5px" }}>FPS: {fps}</div>
      </div>
    </>
  );
};

export default MainDisplay;
