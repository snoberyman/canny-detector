import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import os from "os";
import WebSocket, { WebSocketServer } from "ws";

// load the native (cpp) module (canny detector logic)
const addon = require(path.join(
  __dirname,
  "..",
  "backend",
  "detectorNativeModule",
  "build",
  "Release",
  "camera.node"
));

let mainWindow: BrowserWindow | null = null;
let wss: WebSocketServer | null = null;
let wsPort: number = 0;
let startCamera = false; // Start camera flag
let status = "";

// determine the appopriate icon format based on OS type
const iconPath =
  os.platform() === "win32"
    ? path.join(__dirname, "../assets/icons/camera.ico") // Windows icon (.ico)
    : os.platform() === "darwin"
    ? path.join(__dirname, "../assets/icons/camera.icns") // macOS icon (.icns)
    : path.join(__dirname, "../assets/icons/camera.png"); // Linux icon (.png)

// run electron app
app.whenReady().then(() => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 1200,
    minHeight: 800,
    maxWidth: 1200,
    maxHeight: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"), // Load Preload script
      nodeIntegration: false, // prevenet frontend from accessing Node APIs. (secuirty best practice)
      contextIsolation: true, // seperate preload code from frontend code
    },
    icon: iconPath, // Use the OS-specific icon
  });

  mainWindow.loadURL("http://localhost:5173"); // Load React (Vite) frontend

  // Open the Developer Tools window. dev only
  mainWindow.webContents.openDevTools({'mode':"detach"});
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});


ipcMain.on("select-algorithm", (event, algorithm) => {
  addon.setSelecteAlgorithm(() => {}, algorithm);
});

ipcMain.on("algorithms-params", (event, lowThreshold, highThreshold, ksize, delta) => {
  addon.setAlgorithmsParams(() => {}, lowThreshold, highThreshold, ksize, delta);
});


ipcMain.on("start-camera", (event, cameraStatus, cameraIndex) => {
  // listen to channel start-camera", when a new message arrives, call backfunction would be called
  if (!cameraStatus) {
    status = addon.stopStreaming(); // release camera from the thread
    updateStatus();
    startCamera = false;


    if (wss) {
      status = "Closing WebSocket server...";
      updateStatus();

      // Close all WebSocket client connections
      wss.clients.forEach((client) => {
        client.terminate(); // Forcefully terminate connections
      });

      // Close the WebSocket server
      wss.close((err) => {
        if (err) {
          status = "Error while closing WebSocket server:", err;
          updateStatus();
        } else {
          status = "WebSocket server closed successfully.";
          updateStatus();
        }
      });

      wss = null; // Remove reference to WebSocket server
    }
  } else {
    startCamera = true;

    if (wss) {
      status = "WebSocket server already running. Restarting...";
      updateStatus();
      wss.close(); // Close existing WebSocket server before creating a new one
      wss = null;
    }

    // Start WebSocket server inside Electron
    wss = new WebSocketServer({
      port: 0, // assign with n
      maxPayload: 1024 * 1024, // Increase max payload size (default is 1MB)
      clientTracking: true, // Track connected clients
      perMessageDeflate: {
        zlibDeflateOptions: { chunkSize: 1024 },
        zlibInflateOptions: { chunkSize: 1024 },
      },
    });

    wsPort = (wss.address() as WebSocket.AddressInfo).port; // Auto-assign an available port

    mainWindow?.webContents.send("ws-port", wsPort); // send port slected to renderer
    // event.sender.send("camera-status", startCamera);   // send camera status to renderer

    wss.on("connection", (ws: WebSocket, req) => {
      // start streaming frames when renderer connect to wss
      
      status = `WebSocket server running on port: ${wsPort}`;
      updateStatus();

      // Start camera streaming and receive frames
      status = addon.startStreaming((frameBase64: string) => {
        // Relay the frame to the WebSocket client
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(frameBase64);
        }
      },cameraIndex);  // , cameraIndex
      updateStatus();

      ws.on("close", () => {
        status = "Client disconnected.";
        updateStatus();
      });
    });
  }
});


/**
 * Handle requests from frontend. communicate between main process and renderer process.
 *  */ 
function updateStatus() {
    if (mainWindow) {
      mainWindow.webContents.send("status-updated", { status });
    }
}


ipcMain.handle("fetchCams", async (): Promise<{ data: number[] }> => {
  let indexArray = addon.getAvailableCameraIndexes() 
  return { data: indexArray} 
});
