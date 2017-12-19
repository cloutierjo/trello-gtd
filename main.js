const {app, BrowserWindow, globalShortcut, ipcMain} = require('electron')

const path = require('path')
const url = require('url')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow () {
    ipcMain.on('login-required', (event, arg) => {
        // Create the browser window.
        loginWindow = new BrowserWindow({width: 1, height: 1, frame: false, transparent: true, webPreferences: {nodeIntegration: false}});

        // and load the index.html of the app.
        loginWindow.loadURL(url.format({
            pathname: path.join(__dirname, 'login.html'),
            protocol: 'file:',
            slashes: true
        }));

        // Open the DevTools.
        //loginWindow.webContents.openDevTools();

        // Emitted when the window is closed.
        loginWindow.on('closed', function () {
            // Dereference the window object, usually you would store windows
            // in an array if your app supports multi windows, this is the time
            // when you should delete the corresponding element.
            loginWindow = null
            
            event.sender.send('login-completed', '')
        });
    });    
    
    mainWindow = new BrowserWindow({width: 800, height: 600});

    // and load the index.html of the app.
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }))

    // Open the DevTools.
    //mainWindow.webContents.openDevTools()

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
        app.quit()
    })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', function(){
    createWindow();
    globalShortcut.register('CommandOrControl+Shift+A', () => {
        mainWindow.show();
        ipcMain.send('focus-add', '')
    })
});

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})
