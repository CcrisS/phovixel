/**
 * Created by csdieguez on 20/12/2016.
 */


// index.js
var ipc = require('ipc');
var settingsEl = document.querySelector('.settings');
settingsEl.addEventListener('click', function () {
  ipc.send('open-settings-window');
});


// main.js
var settingsWindow = null;
ipc.on('open-settings-window', function () {
  if (settingsWindow) {
    return;
  }

  settingsWindow = new BrowserWindow({
    frame: false,
    height: 200,
    resizable: false,
    width: 200
  });

  settingsWindow.loadUrl('file://' + __dirname + '/app/settings.html');

  settingsWindow.on('closed', function () {
    settingsWindow = null;
  });
});
ipc.on('close-settings-window', function () {
  if (settingsWindow) {
    settingsWindow.close();
  }
});


// settings.js
'use strict';

var ipc = require('ipc');
var closeEl = document.querySelector('.close');
closeEl.addEventListener('click', function (e) {
  ipc.send('close-settings-window');
});