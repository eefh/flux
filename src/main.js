const { app, BrowserWindow, globalShortcut, ipcMain, Tray, Menu, nativeImage } = require('electron');
const prompt = require('electron-prompt');

import { ChatOpenAI } from "langchain/chat_models/openai";
import { HumanChatMessage, SystemChatMessage } from "langchain/schema";
import { run }  from "./agent";
import ElectronStore from "electron-store";
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

let zapierNlaApiKey = process.env.ZAPIER_NLA_API_KEY || "";  

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
    trafficLightPosition: { x: 12, y: 12 }
  });

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }
  const hotkey = process.platform === 'darwin' ? 'Cmd+Shift+F' : 'Ctrl+Shift+F';
  const ret = globalShortcut.register(hotkey, () => {
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.send('main-window-ready');
  });
  mainWindow.on('close', (event) => {
    // Prevent the default close action
    event.preventDefault();
    // Hide the window instead of destroying it
    mainWindow.hide();
  });

  app.on('before-quit', () => {
    mainWindow.removeAllListeners('close');
    mainWindow.close();
  });
  // Open the DevTools
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
/*async function askForApiKey() {
  const apiKey = await prompt({
    title: 'Enter your API key',
    label: 'API Key:',
    inputAttrs: {
      type: 'text',
      placeholder: 'Enter your API key here'
    },
    type: 'input'
  });

  if (apiKey === null) {
    // User canceled the prompt, you can decide what to do, e.g., exit the app
    app.quit();
  } else {
    // Save the API key, for example, in a global variable or to a configuration file
    global.apiKey = apiKey;

    // Continue with creating the main window and starting your app
    createMainWindow();
  }
}*/
app.on('ready', createWindow);


async function runApp() {
  // Call the askForApiKey function and wait for its completion

  // Now, create the tray instance with the icon
  const icon = nativeImage.createFromPath('/images/icon2Template.png');

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

  // Create the main application window
  createWindow();
}

app.whenReady().then(runApp);


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

const updateZapierNlaApiKey = (newApiKey) => {
  zapierNlaApiKey = newApiKey;
};

ipcMain.on('update-zapier-nla-api-key', (event, newApiKey) => {
  updateZapierNlaApiKey(newApiKey);
});

function sendSavedConversation(event) {
  const savedConversation = store.get('history');
  console.log("GET HISTORY: ", savedConversation);
  event.sender.send('saved-conversation', savedConversation);
}
app.on('appWillUnmount', () => {
  // Restore the app's state
  app.restoreState();
});
let database = '';
ipcMain.on("uploadFile", async (event, fileContent) => {
  // Pass the file content to initializeQATool in vectorDB.js
  database = fileContent;
  console.log("Database initialized with uploaded file: ", fileContent);

});

ipcMain.on('request-saved-conversation', (event) => {
  sendSavedConversation(event);
});

ipcMain.on('get-thought', async (event, userInput) => {
  try {
    // Call the GPT-3 API with the user input
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{role: "system", content: "Respond only with a brief 'Thought' (thinking out loud) summary, for example, if the user asks a conversational question respond with: 🗣️ Conversation: insert brief thought here. Keep it brief to under 10 words, with an emoji at the start. currently you have tools such as database search, web browsing/search, etc."},{role: "user", content: userInput}],
    });
    console.log(completion.data.choices[0].message);

    // Get the thought from the API response
    const thought = completion.data.choices[0].message.content;

    // Send the thought back to the renderer process
    event.sender.send('thought-response', thought);
  } catch (error) {
    console.error('Error calling GPT-3:', error);
    event.sender.send('thought-response', 'Error: Failed to get thought data');
  }
});


ipcMain.on('my-channel', async (event, conversation) => {
  console.log('Message received from renderer:', conversation);

  let response = '';
  // Your logic to handle the message
  if (process.env.OPENAI_API_KEY){
    response = await run(conversation[0], conversation[1], event, database, zapierNlaApiKey);
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