import { useState, useEffect } from "react";
import { useAppContext } from "../context/useAppContext";

const MainDisplay = () => {
  const { cameraStatus } = useAppContext(); // Get the latest message
  const [videoStream, setVideoStream] = useState<string>("");

  useEffect(() => {
    console.log("Camera status from MainDisplay", cameraStatus);
    // Ensure that the window.electronAPI from preload is available
    if (window.electronAPI && cameraStatus) {
      window.electronAPI.onWsPort((port: number) => {
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
          // setTimeout(() => {
          //   setWs(new WebSocket(`ws://localhost:${port}`));
          // }, 3000);
        };
      });
    } else {
      console.error("window.electronAPI is undefined!");
    }
  }, [cameraStatus]);

  // Log videoStream whenever it changes
  useEffect(() => {}, [videoStream]); // This effect runs when videoStream changes

  return (
    <>
      <div style={{ flex: 1, padding: "20px" }}></div>
      <div>
        {/* Display the video stream using the Base64 data */}
        {videoStream ? (
          <img
            style={{
              width: "640",
              height: "480",
              margin: "auto",
            }}
            id="videoStream"
            src={`data:image/jpg;base64,${videoStream}`}
            alt="WebSocket video stream"
          />
        ) : (
          <div
            style={{
              width: "640",
              height: "480",
              margin: "auto",
            }}
          ></div>
        )}
        {/* <h1>📩 Received Message: {ws?.CLOSED}</h1>
                <p>{latestMessage}</p> */}
      </div>
    </>
  );
};

export default MainDisplay;
