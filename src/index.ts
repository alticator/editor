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

// Quit app when all windows closed except on process.platform darwin
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
    click: () => {
      win.webContents.send("request", "save");
    }
  },
  {
    label: "Save As",
    accelerator: process.platform === "darwin" ? "Cmd+Shift+S" : "Ctrl+Shift+S",
    click: () => {
      win.webContents.send("request", "saveAs");
    }
  },
  {
    label: "Open",
    accelerator: process.platform === "darwin" ? "Cmd+O" : "Ctrl+O",
    click: () => openFile()
  }]
}))

menu.append(new MenuItem({
  role: "editMenu"
}));

menu.append(new MenuItem({
  role: "windowMenu"
}));

Menu.setApplicationMenu(menu);

// Save and Open Files
const {ipcMain} = require("electron");
const fs = require("fs");
const {dialog} = require("electron");

ipcMain.on("command", function(event, message: string, content?: string, saveAs?, saveName?): void {
  switch (message) {
    case "open":
      openFile();
      break;
    case "save":
      saveFile(content, saveAs, saveName);
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

function saveFile(editorContent: string, doSaveAs: boolean, saveName: string): void {
  console.log(doSaveAs, " CXII");
  if (doSaveAs) {
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
  else {
    console.log(doSaveAs, " CXXXIV");
    fs.writeFile(saveName, editorContent, (err: any) => {
        if (err)
          throw err;
      });
      var sendData = {
        saveName: saveName,
        content: "",
        saveInfo: `${saveName} - Saved`
      }
      win.webContents.send("fileInfo", sendData);
  }
}