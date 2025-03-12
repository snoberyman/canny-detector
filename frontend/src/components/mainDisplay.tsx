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
  const { cameraStatus } = useAppContext(); // Get the latest message
  const [videoStream, setVideoStream] = useState<string>("");

  useEffect(() => {
    // console.log("Camera index from MainDisplay", cameraIndex);
    // Ensure that the window.electronAPI from preload is available
    if (window.electronAPI && cameraStatus) {
      window.electronAPI.onWsPort((port: number) => {
        console.log("Camera status from MainDisplay", cameraStatus);
        // connect to websocket server from main. get server port number
        console.log("Connecting to WebSocket on port:", port);

        // Create a new WebSocket instance to connect with the WebSocket server that runs on Electron's main prcess
        const socket = new WebSocket(`ws://localhost:${port}`);

        // Set the event listeners on the socket
        socket.onopen = () => {
          // when connection is established
          console.log("WebSocket connection established.");
          // window.electronAPI.startStreaming(); // Start streaming in the main process
        };

        socket.onmessage = (event: MessageEvent) => {
          // when client recieve message from server
          // console.log("Received from WebSocket:", event.data);
          setVideoStream(event.data); // Set the video stream as the image source
        };

        socket.onclose = () => {
          // when the webSocket connection is closed.
          console.log("WebSocket disconnected");
          setVideoStream("");
          if (socket) {
            socket.close();
          }
          // setTimeout(() => {
          //   setWs(new WebSocket(`ws://localhost:${port}`));
          // }, 3000);
        };
      });
    }
    // Cleanup listener on unmount or cameraStatus change
    return () => {
      window.electronAPI.removeAllListeners("ws-port");
    };
  }, [cameraStatus]);

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
