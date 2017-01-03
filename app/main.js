const {app, BrowserWindow, ipcMain} = require('electron');
const path = require('path');
const url = require('url');

//const windowStateKeeper = require('electron-window-state');
//const pjson = require('./package.json');

let mainWindow; // Keep a global reference of the window object.

function createMainWindow () {

  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 600,
    title: app.getName(),
    icon: path.join(__dirname, '/app/assets/img/icon.png')
  });

  // Load the previous window state with fallback to defaults
  //let mainWindowState = windowStateKeeper({
  //  defaultWidth: 1024,
  //  defaultHeight: 768
  //});

  //try{
  //  win = new BrowserWindow({
  //    'width': mainWindowState.width,
  //    'height': mainWindowState.height,
  //    'x': mainWindowState.x,
  //    'y': mainWindowState.y,
  //    'title': app.getName(),
  //    'icon': path.join(__dirname, '/app/assets/img/icon.png'),
  //    'show': false, // Hide your application until your page has loaded
  //    'webPreferences': {
  //      'nodeIntegration': pjson.config.nodeIntegration || true, // Disabling node integration allows to use libraries such as jQuery/React, etc
  //      'preload': path.resolve(path.join(__dirname, 'preload.js'))
  //    }
  //  });
  //} catch (e) {
  //  console.log(e);
  //}

  // mainWindowState.manage(win);

  // Load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }));

  mainWindow.webContents.openDevTools(); // Open the DevTools.

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

/**
 * "ri" events
 */
// Folder selected
let riWindow;
ipcMain.on('ri-folder-selected', (event, params) => {
  if (riWindow) { // opened yet
    return;
  }

  //console.log('event listened, params: ', params);
  riWindow = new BrowserWindow({height: 300, width: 500, parent: mainWindow});
  riWindow.loadURL('file://' + __dirname + '/scripts/rename-images.html');
  riWindow.webContents.on('did-finish-load', () => {
    riWindow.webContents.send('ri-load' , params);
  });
  riWindow.on('closed', () => {riWindow = null});
});