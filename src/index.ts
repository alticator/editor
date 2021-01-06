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
  },
  {
    label: "Open",
    accelerator: process.platform === "darwin" ? "Cmd+O" : "Ctrl+O",
    click: () => win.webContents.send("ping", "open")
  }]
}))

menu.append(new MenuItem({
  label: "Edit",
  submenu: [{
    role: "undo",
  },
  {
    role: "redo"
  }]
}))

Menu.setApplicationMenu(menu);

// Save and Open Files
const {ipcMain} = require("electron");
const fs = require("fs");
const {dialog} = require("electron");

ipcMain.on("command", function(event, message: string, content?: string): void {
  switch (message) {
    case "open":
      openFile();
      break;
    case "save":
      saveFile(content);
      break;
  }
});

function openFile(): void {
  dialog.showOpenDialog(win, {
    properties: ["openFile"]
  }).then(result => {
    open(result.filePaths[0]);
  }).catch(err => {
    console.log(err);
  })
  function open(fileName: string) {
    fs.readFile(fileName, "utf-8", function(err, data): void {
      if (err) throw err;
      win.webContents.send("fileData", data, `${fileName} - Saved`, fileName);
    });
  }
}

function saveFile(editorContent): void {
  dialog.showSaveDialog(win, {
    properties: ["showHiddenFiles"]
  }).then(result => {
    save(result.filePath, editorContent);
  }).catch(err => {
    console.log(err);
  })
  function save(fileName: string, data: string) {
    fs.writeFile(fileName, data, err => {
      if (err) throw err;
    });
    var sendData = {
      saveName: fileName,
      content: "",
      saveInfo: `${fileName} - Saved`
    }
    win.webContents.send("fileInfo", sendData);
  }
}