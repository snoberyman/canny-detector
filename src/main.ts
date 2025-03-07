import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import os from "os";

// load the native (cpp) module (canny detector logic)
const addon = require(path.join(__dirname, '..', 'backend' ,'detectorNativeModule', 'build', 'Release', 'hello.node'));

let mainWindow: BrowserWindow | null = null;

// determine the appopriate icon format based on OS type
const iconPath = os.platform() === "win32"
  ? path.join(__dirname, '../assets/icons/camera.ico')  // Windows icon (.ico)
  : os.platform() === "darwin"
  ? path.join(__dirname, '../assets/icons/camera.icns') // macOS icon (.icns)
  : path.join(__dirname, '../assets/icons/camera.png'); // Linux icon (.png)

// run electron app
app.whenReady().then(() => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"), // Load Preload script
      nodeIntegration: false, // prevenet frontend from accessing Node APIs. (secuirty best practice)
      contextIsolation: true, // seperate preload code from frontend code
    },
    icon: iconPath // Use the OS-specific icon
  });

  mainWindow.loadURL("http://localhost:5173"); // Load React (Vite) frontend

  // Open the Developer Tools window. dev only
  mainWindow.webContents.openDevTools();

});

// Handle request from frontend. communicate between main process and renderer process.
ipcMain.handle("getHelloMessage", async () => { // Listen for messages from renderer and send back responses
  return addon.helloWorld();
});

ipcMain.handle("fetchData", (): { data: string } => {
  return { data: "Some data from the main process" };
});
