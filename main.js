'use strict';

const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

var mainWindow = null;

app.on('window-all-closed', function() {
    if (process.platform !== 'darwin')
        app.quit();
});

app.on('ready', function() {

    mainWindow = new BrowserWindow({titleBarStyle: 'hidden', width: 800, height: 800});
    mainWindow.loadURL('file://' + __dirname + '/public/paper-bulk.html');

    mainWindow.on('closed', function() {
        mainWindow = null;
    });
});