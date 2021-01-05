// Include
const { app, BrowserWindow, Menu, MenuItem } = require('electron')

var win;

// Create Window and Open "index.html"
function createWindow () {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  win.loadFile('src/index.html')
}

app.whenReady().then(createWindow)

// Close window on request
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// Open new window if no windows are open and the app is started
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// Menus
const menu = new Menu()

menu.append(new MenuItem({
  label: 'Editor',
  submenu: [{
    role: 'quit',
  }]
}))

menu.append(new MenuItem({
  label: "File",
  submenu: [{
    label: "Save",
    accelerator: process.platform === "darwin" ? "Cmd+S" : "Ctrl+S",
    click: () => win.webContents.send("ping", "save")
  }]
}))

menu.append(new MenuItem({
  label: "Edit",
  submenu: [{
    role: "undo",
    click: () => win.webContents.send("ping", "undo")
  },
  {
    role: "redo"
  }]
}))

Menu.setApplicationMenu(menu)
