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
    webPreferences: {
      preload: path.join(__dirname, "preload.js"), // Load Preload script
      nodeIntegration: false, // prevenet frontend from accessing Node APIs. (secuirty best practice)
      contextIsolation: true, // seperate preload code from frontend code
    },
    icon: iconPath, // Use the OS-specific icon
  });

  mainWindow.loadURL("http://localhost:5173"); // Load React (Vite) frontend

  // Start WebSocket server inside Electron
  wss = new WebSocketServer({
    port: 0,
    maxPayload: 1024 * 1024, // Increase max payload size (default is 1MB)
    clientTracking: true, // Track connected clients
    perMessageDeflate: {
      zlibDeflateOptions: { chunkSize: 1024 },
      zlibInflateOptions: { chunkSize: 1024 },
    },
  }); 
  wsPort = (wss.address() as WebSocket.AddressInfo).port; // Auto-assign an available port
  console.log(`WebSocket server running on port: ${wsPort}`);

  wss.on("connection", (ws: WebSocket, req) => { 
    console.log("Client connected to WebSocket");
    ws.send("Hello from WebSocket in Electron!");

    const allowedHeaders = ["user-agent", "origin"]; // Adjust as needed

    const filteredHeaders: Record<string, string> = Object.keys(req.headers)
      .filter((key) => allowedHeaders.includes(key))
      .reduce((obj, key) => {
        obj[key] = req.headers[key] as string; // Explicitly cast to string
        return obj;
      }, {} as Record<string, string>); // Provide initial type

    ws.send(JSON.stringify({ type: "headers", data: filteredHeaders }));

    // Start camera streaming and receive frames
    addon.startStreaming((frameBase64: string) => { 
      // Relay the frame to the WebSocket client
      ws.send(frameBase64);
    });
  });

  // Send the WebSocket port to the Renderer process
  mainWindow.webContents.once("did-finish-load", () => { // once entire frontend is loaded..
    mainWindow!.webContents.send("ws-port", wsPort); // send message from the main process to the renderer process, passing the port of WebSocker server
  });

  // Open the Developer Tools window. dev only
  mainWindow.webContents.openDevTools();
});

// Handle request from frontend. communicate between main process and renderer process.
ipcMain.handle("getHelloMessage", async () => {
  // Listen for messages from renderer and send back responses
  return "Hello from Main Process";
});

ipcMain.handle("fetchData", async (): Promise<{ data: string }> => {
  // handle is async.
  return { data: "Some data from the main process" };
  // const result = addon.helloWorld();
  // return { data: result };
});

ipcMain.on("start-camera", (event, data) => {
  // listen to channel start-camera", when a new message arrives, call backfunction would be called
  console.log("Received data from renderer:", data); // Log "hi"
  // Simulate some processing and send a response back
  event.sender.send("camera-status", "Camera started");
});
