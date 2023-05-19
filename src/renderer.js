/**
 * This file will automatically be loaded by webpack and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/tutorial/application-architecture#main-and-renderer-processes
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.js` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */
import "./app.jsx"
import './index.css';

console.log('👋 This message is being logged by "renderer.js", included via webpack');
ipcRenderer.on('saved-conversation', (event, savedConversation) => {
    if (savedConversation) {
      // Update your frontend with the saved conversation
      // (This depends on how you're handling the chat UI in your frontend, so replace this with your own implementation)
      savedConversation.forEach(conversation => {
        // Assuming you have an addMessageToUI function that takes the speaker and message as arguments and updates the UI
        addMessageToUI(conversation[0], conversation[1]);
      });
    }
  });
  