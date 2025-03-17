# Canny Detector

### Real-Time Video Canny detector

## Technology

- React
- TypeScript
- Electron
- C++

## Packages

- **node-addon-api (N-API)**: Bridges C++ with Node.js for efficient native module integration.
- **node-gyp**: Compiles C++ modules into binary extensions for Node.js.
- **opencv**: The popular real-time copmuter vision library.
- **cpp memory & thread**: Manages threads using smart pointers for safety and cleanup
- **cpp-base64**: Encodes frames to base64 for transmitting.
- **WebSocket**: Real-time transmission of frames from the main thread to the client.
- **styled-components**: Styles React components with dynamic, scoped CSS.

## Features

- **Multi-threading**: One dedicated thread handles real-time frame capture from the camera, while two additional threads process frames using different image processing algorithms.
- **Smart poointers**: Clean thread management with shared and unique pointers.
- **Real-Time processing**: Achieves 30 frames per second (FPS) capture and processing. Frames are captured from the camera, processed in parallel, and sent to Electron's main thread.
- **Uses several alorithms**: Supports several image processing algorithms such as Canny, Sobel, and Laplacian. The user can select which algorithm to apply to the frames in real-time through the UI.
- **Control algorithms parameters**: Enables the user to adjust the parameters of the image processing algorithms in real-time via the user interface.
- **Real-Time transmission with WebSocket**: A WebSocket server is used to transmit processed frames in real-time from the main thread to a rendering thread on the client-side. This provides low-latency communication for live video feed updates.
- **Log messages**: Displays informative log messages throughout the application to reflect the current status.
- **Capture and save image**: Allows the user to capture the current frame and download it as an image
