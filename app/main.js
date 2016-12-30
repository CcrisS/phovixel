const {app, BrowserWindow} = require('electron');
const path = require('path');
const url = require('url');
//const windowStateKeeper = require('electron-window-state');
//const pjson = require('./package.json');

let win; // Keep a global reference of the window object.

function createMainWindow () {

  // Create the browser window.
  win = new BrowserWindow({
    width: 800,
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
  win.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }));

  win.webContents.openDevTools(); // Open the DevTools.

  win.on('closed', () => { // When the window is closed.
    win = null
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
  if (win === null) { // macOS: re-create a window when dock icon is clicked
    createMainWindow()
  }
});