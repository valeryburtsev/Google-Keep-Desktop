const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require("path");

let mainWindow;
let notificationCounter = 0;

const userAgent = 'Chrome';
const windowStateKeeper = require('electron-window-state');


function createWindow() {

  let mainWindowState = windowStateKeeper({
    defaultWidth: 1000,
    defaultHeight: 800
  });

  mainWindow = new BrowserWindow({
    'x': mainWindowState.x,
    'y': mainWindowState.y,
    'width': mainWindowState.width,
    'height': mainWindowState.height,
    titleBarStyle: process.platform == "darwin" ? 'hiddenInset' : '',
    webPreferences: {
      contextIsolation: false,
      preload: path.join(__dirname, 'preload.js'),
      webviewTag: true
    }
  });

  mainWindowState.manage(mainWindow);

  mainWindow.loadURL('https://keep.google.com/', { userAgent });

  mainWindow.webContents.on('did-finish-load', function() {
    mainWindow.webContents.insertCSS('#ognwrapper {-webkit-app-region: drag;}')
    mainWindow.webContents.insertCSS('#gbwa {display:none}')
    if (process.platform == 'darwin') {
      mainWindow.webContents.insertCSS('header, .PvRhvb-bN97Pc, #ognwrapper {margin-top: 24px;}')
    } 
 });


  mainWindow.webContents.on('new-window', (event, url) => {
    shell.openExternal(url);
    event.preventDefault();
  });

  mainWindow.on('close', function (event) {
    if (app.quitting) {
      mainWindow = null
    } else {
      event.preventDefault()
      mainWindow.hide()
    }
  });

  mainWindow.on('focus', function (event) {
    resetBadge()
  });
}

function resetBadge() {
  if (notificationCounter > 0) {
    app.setBadgeCount(0)
    notificationCounter = 0
  }
}

app.on('ready', () => {
  createWindow();
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  } else {
    mainWindow.show()
  }
});
app.on('focus', function () {
  resetBadge()
});

app.on('before-quit', () => app.quitting = true)

ipcMain.on('notification', (event, arg) => {
  if (!mainWindow.isFocused()) {
    notificationCounter++
    app.setBadgeCount(notificationCounter)
  }
})