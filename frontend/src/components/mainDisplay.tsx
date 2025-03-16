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
`;

const MainDisplay = () => {
  const { cameraStatus, addLogMessage } = useAppContext(); // Get the latest message
  const [videoStream, setVideoStream] = useState<string>("");

  useEffect(() => {
    // Ensure that the window.electronAPI from preload is available
    if (window.electronAPI && cameraStatus) {
      window.electronAPI.onWsPort((port: number) => {
        // console.log("Camera status from MainDisplay", cameraStatus);
        // connect to websocket server from main. get server port number
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
        {/* <h1>📩 Received Message: {ws?.CLOSED}</h1>
                <p>{latestMessage}</p> */}
      </div>
    </>
  );
};

export default MainDisplay;
