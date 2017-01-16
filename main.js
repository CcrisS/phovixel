const {app, BrowserWindow, ipcMain} = require('electron');
const path = require('path');
const url = require('url');

let mainWindow; // Keep a global reference of the window object.
function createMainWindow () {

  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 600,
    title: app.getName(),
    icon: path.join(__dirname, '/app/assets/img/icon.png')
  });

  // Load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'app/index.html'),
    protocol: 'file:',
    slashes: true
  }));

  // mainWindow.webContents.openDevTools(); // Open the DevTools.

  mainWindow.on('closed', () => { // When the window is closed.
    mainWindow = null
  })
}

app.on('ready', createMainWindow);

// Quit when all windows are closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') { // macOS: app stay active until the user quits explicitly with Cmd + Q
    app.quit()
  }
});

app.on('activate', () => {
  if (mainWindow === null) { // macOS: re-create a window when dock icon is clicked
    createMainWindow()
  }
});

// "ri" window
let riWindow;
// params = {'folder', 'doRename', 'moveVideos'};
ipcMain.on('ri-folder-selected', (event, params) => {
  if (riWindow) { // opened yet
    return;
  }

  // template
  let template = '/app/rename-images.html';
  if(params.moveVideos){
    template = '/app/move-videos.html';
  }

  riWindow = new BrowserWindow({height: 600, width: 800, parent: mainWindow});
  riWindow.loadURL('file://' + __dirname + template);
  riWindow.webContents.on('did-finish-load', () => {
    riWindow.webContents.send('ri-load' , params);
  });
  riWindow.on('closed', () => {riWindow = null});
});