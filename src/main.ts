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

ipcMain.on("start-camera", (event, cameraStatus, cameraIndex) => {
  // listen to channel start-camera", when a new message arrives, call backfunction would be called


  if (!cameraStatus) {
    // camera stopped
    console.log("Stopping camera...");

    status = addon.stopStreaming(); // release camera from the thread

    if (wss) {
      console.log("Closing WebSocket server...");

      // Close all WebSocket client connections
      wss.clients.forEach((client) => {
        client.terminate(); // Forcefully terminate connections
      });

      // Close the WebSocket server
      wss.close((err) => {
        if (err) {
          console.error("Error while closing WebSocket server:", err);
        } else {
          console.log("WebSocket server closed successfully.");
        }
      });

      wss = null; // Remove reference to WebSocket server
    }
  } else {
    console.log("Starting camera...");
    startCamera = true;

    if (wss) {
      console.log("WebSocket server already running. Restarting...");
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

      console.log(`WebSocket server running on port: ${wsPort}`);

      // Start camera streaming and receive frames
      status = addon.startStreaming((frameBase64: string) => {
        // Relay the frame to the WebSocket client
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(frameBase64);
        }
      }, cameraIndex);

      console.log("hereeere", status);

      ws.on("close", () => {
        console.log("Client disconnected.");
      });
    });
  }
});


/**
 * Handle requests from frontend. communicate between main process and renderer process.
 *  */ 
ipcMain.handle("fetchStatus", async (): Promise<{ status: string }> => {
  return { status: status };
  // return { data: result };
});

ipcMain.handle("fetchCams", async (): Promise<{ data: number[] }> => {
  let indexArray = addon.getAvailableCameraIndexes() 
  return { data: indexArray} 
});
