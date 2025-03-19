import { app, BrowserWindow, ipcMain, dialog  } from "electron";
import path from "path";
import os from "os";
const fs = require("fs");
import WebSocket, { WebSocketServer } from "ws";

// load the native (cpp) module (canny detector logic)
const addon = require(path.join(
  __dirname,
  "..",
  "backend",
  "detectorNativeModule",
  "build",
  "Release",
  "camera"
));

const Camera = addon.Camera;
const camera = new Camera();

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


    // Load the built frontend
    if (process.env.NODE_ENV === 'development') {
      mainWindow.loadURL('http://localhost:5173'); // Dev mode
    } else {
      mainWindow.loadFile(path.join(__dirname, '../frontend/dist/renderer/index.html')); // Production mode 
    }

  mainWindow.on("close" , (event) => {
    const stopAndCloseApp = async () => {
      try {
        await camera.stopStreaming(); // Wait for stopStreaming to finish
          if (process.platform !== "darwin") {
            app.quit();
          }
      } catch (err) {
        console.error("Error stopping the stream:", err);
      }
    };

    stopAndCloseApp();
  })

  // Open the Developer Tools window. dev only
  // mainWindow.webContents.openDevTools({'mode':"detach"});
});


ipcMain.on("select-algorithm", (event, algorithm) => {
  camera.selectAlgorithm(() => {}, algorithm);
});

ipcMain.on("algorithms-params", (event, lowThreshold, highThreshold, L2gradient, ksize, delta) => {
  camera.setAlgorithmsParams(() => {}, lowThreshold, highThreshold, L2gradient, ksize, delta);
});

/**
 * Handle captrung a frame frot the stream and save it as jpg
 *  */ 
ipcMain.on("toggle-camera", (event, cameraStatus, cameraIndex) => {
  // listen to channel toggle-camera, when a new message arrives, call backfunction would be called
  if (!cameraStatus) {
    status = camera.stopStreaming(); // release camera from the thread
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
      status = camera.startStreaming((frameBase64: string) => {
        // Relay the frame to the WebSocket client
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(frameBase64);
        }
      },cameraIndex);  // , cameraIndex
      updateStatus();

      ws.on("close", () => {
        // status = "Client disconnected.";
        // updateStatus();
      });
    });
  }
});

/**
 * Handle captrung a frame frot the stream and save it as jpg
 *  */ 
ipcMain.on("save-image", async (event, base64Data) => {
  try {
    const { filePath } = await dialog.showSaveDialog({
      title: "Save Image",
      defaultPath: path.join(app.getPath("pictures"), `captured-${Date.now()}.jpg`),
      filters: [{ name: "Images", extensions: ["jpg"] }],
    });

    if (filePath) {
      // Save the image file
      await fs.promises.writeFile(filePath, base64Data, "base64");
      event.sender.send("image-saved", "Image saved successfully"); // Send success message
    } else {
      event.sender.send("image-saved", "Saving image canceled"); // Send error message if no file was selected
    }
  } catch (err : any) {
    console.error("Failed to save image:", err);
    event.sender.send("image-saved", `Failed to save image: ${err.message}`); // Send error message if something goes wrong
  }
});


/**
 * Handle update status message on the main process, the send it to the renderer process.
 *  */ 
function updateStatus() {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send("status-updated", { status });
  }
}

/**
 * Handle fetching available cams. This is invoked on the program startup.
 *  */ 
ipcMain.handle("fetchCams", async (): Promise<{ data: number[] }> => {
  let indexArray = camera.getAvailableCameraIndexes() 
  return { data: indexArray} 
});
