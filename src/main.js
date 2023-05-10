const { app, BrowserWindow, globalShortcut, ipcMain, Tray, Menu, nativeImage } = require('electron');

import { ChatOpenAI } from "langchain/chat_models/openai";
import { HumanChatMessage, SystemChatMessage } from "langchain/schema";
import { run }  from "./agent";
import ElectronStore from "electron-store";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const store = new ElectronStore();

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      nodeIntegration: true,
    },
    titleBarStyle: 'hidden',
    trafficLightPosition: { x: 12, y: 12 },
    
  });

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }
  const hotkey = process.platform === 'darwin' ? 'Cmd+Shift+F' : 'Ctrl+Shift+F';
  const ret = globalShortcut.register(hotkey, () => {
    mainWindow.show();
  });

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.send('main-window-ready');
  });
  // Open the DevTools
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.


// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);


app.whenReady().then(() => {
  // Create the tray instance with the icon
  const icon = nativeImage.createFromPath('/images/icon2Template.png')

  tray = new Tray(icon);

  // Create a context menu for the tray icon
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Open', click: () => {/* Add your code here to show your app window */} },
    { label: 'Quit', click: () => { app.quit(); } },
  ]);

  // Set the context menu for the tray icon
  tray.setContextMenu(contextMenu);

  // Optionally, you can also add a tooltip for the tray icon
  tray.setToolTip('Your App Name');
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }

});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
const chat = new ChatOpenAI({ temperature: 0.8 });

/*const updateZapierNlaApiKey = (newApiKey) => {
  process.env.ZAPIER_NLA_API_KEY = newApiKey;
};

ipcMain.on('update-zapier-nla-api-key', (event, newApiKey) => {
  updateZapierNlaApiKey(newApiKey);
});
*/

function sendSavedConversation(event) {
  const savedConversation = store.get('history');
  console.log("GET HISTORY: ", savedConversation);
  event.sender.send('saved-conversation', savedConversation);
}

let database = '';
ipcMain.on("uploadFile", async (event, fileContent) => {
  // Pass the file content to initializeQATool in vectorDB.js
  database = fileContent;
  console.log("Database initialized with uploaded file: ", fileContent);

});

ipcMain.on('request-saved-conversation', (event) => {
  sendSavedConversation(event);
});


ipcMain.on('my-channel', async (event, conversation) => {
  console.log('Message received from renderer:', conversation);

  let response = '';
  // Your logic to handle the message
  if (process.env.OPENAI_API_KEY){
    response = await run(conversation[0], conversation[1], event, database);
  } else {
     response = 'Please set your API key';
  }
  if (typeof conversation[2] !== 'undefined') {
    store.set('history', conversation[2]);
  } else {
    // You can delete the 'history' key from the store if it is undefined
    store.delete('history');
  }
  console.log("HISTORY: ", conversation[2]);
  console.log("HISTORY: ", store.get('history'));

  // Send a response back to the renderer process
  event.sender.send('my-channel', response);
});