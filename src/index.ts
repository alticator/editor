// Include
const { app, BrowserWindow, Menu, MenuItem } = require('electron')
const path = require("path");

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
  },
  {
    role: "close"
  }]
}))

menu.append(new MenuItem({
  label: "File",
  submenu: [
    {
      label: "New",
      accelerator: process.platform === "darwin" ? "Cmd+N" : "Ctrl+N",
      click: () => {
        win.webContents.send("request", "new");
      }
    },
    {
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
    }
]
}));

menu.append(new MenuItem({
  role: "editMenu"
}));

menu.append(new MenuItem({
  label: "Format",
  submenu: [{
    label: "Format Options",
    accelerator: process.platform === "darwin" ? "Cmd+Shift+F" : "Ctrl+Shift+F",
    click: () => {
      win.webContents.send("request", "formatOptions");
    }
  }]
}))

menu.append(new MenuItem({
  role: "windowMenu"
}));

Menu.setApplicationMenu(menu);

// Save and Open Files
const {ipcMain} = require("electron");
const fs = require("fs");
const {dialog} = require("electron");

ipcMain.on("command", function(event, message: string, content?, saveAs?, saveName?, styleElem?: any): void {
  switch (message) {
    case "open":
      openFile();
      break;
    case "save":
      saveFile(content, saveAs, saveName, styleElem);
      break;
  }
});

function openFile(): void {
  dialog.showOpenDialog(win, {
    properties: ["openFile"]
  }).then(result => {
    if (result.filePaths[0] != undefined) {
      if (path.extname(result.filePaths[0]) == ".alticatordoc") {
        openAlticatordoc(result.filePaths[0]);
      }
      else {
        open(result.filePaths[0]);
      }
    }
  }).catch(err => {
    console.log(err);
  })
  function openAlticatordoc(fileName: string) {
    fs.readFile(fileName, "utf-8", function(err: any, data: any): void {
      if (err) throw err;
      var parse = JSON.parse(data);
      var content = parse.documentContent;
      var documentStyling = parse.documentStyle;
      win.webContents.send("fileData-alticatordoc", content, `${fileName} - Saved`, fileName, documentStyling);
    });
  }
  function open(fileName: string) {
    fs.readFile(fileName, "utf-8", function(err: any, data: any): void {
      if (err) throw err;
      win.webContents.send("fileData", data, `${fileName} - Saved`, fileName);
    });
  }
}

function saveFile(editorContent: string, doSaveAs: boolean, saveName: string, styleData: any): void {
  function saveAlticatordoc(fileName: string, data: string, styleData: any) {
    var document = {
      documentStyle: {
        font: styleData.fontFamily,
        fontSize: styleData.fontSize,
        lineHeight: styleData.lineHeight,
        margin: styleData.padding,
        textAlign: styleData.textAlign,
        writingDirection: styleData.direction
      },
      documentContent: data
    };
    var saveContent = JSON.stringify(document);
    fs.writeFile(fileName, saveContent, (err: any) => {
      if (err) throw err;
    });
    var sendData = {
      saveName: fileName,
      content: "",
      saveInfo: `${fileName} - Saved`
    }
    win.webContents.send("fileInfo", sendData);
  }
  if (doSaveAs) {
    dialog.showSaveDialog(win, {
      properties: ["showHiddenFiles"],
      filters: [
        {name: "AlticatorDoc", extensions: ["alticatordoc"]},
        {name: "All Files", extensions: ["*"]},
        {name: "Text File", extensions: ["txt"]}
      ]
    }).then(result => {
      if (result.filePath) {
        if (path.extname(result.filePath) == ".alticatordoc") {
          saveAlticatordoc(result.filePath, editorContent, styleData);
        }
        else {
          save(result.filePath, editorContent);
        }
      }
    }).catch(err => {
      console.log(err);
    })
    function save(fileName: string, data: string) {
      fs.writeFile(fileName, data, (err: any) => {
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
    if (path.extname(saveName) == ".alticatordoc") {
      saveAlticatordoc(saveName, editorContent, styleData);
    }
    else {
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
}