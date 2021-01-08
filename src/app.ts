//var fs = require('fs');
var editor = document.getElementById("edit");
var fileData = document.getElementById("file-data");
const {ipcRenderer} = require("electron");

var savePreferences: SaveData = {
    saveName: "Unsaved Note",
    content: "",
    saveInfo: "Unsaved Note*"
}
var saveAs = true;

interface SaveData {
    saveName: string,
    content: string,
    saveInfo: string;
}

function commandSaveFile() {
    var content = (<HTMLInputElement>editor).value;
    ipcRenderer.send("command", "save", content, saveAs, savePreferences.saveName);
}

function commandSaveFileAs() {
    var content = (<HTMLInputElement>editor).value;
    ipcRenderer.send("command", "save", content, true, savePreferences.saveName);
}

function commandOpenFile() {
    ipcRenderer.send("command", "open");
}

function setUnsaved(): void {
    fileData.innerHTML = `${savePreferences.saveName}*`;
}

var saveModal = {
    open: function(): void {
        document.getElementById("save-modal").style.display = "inline";
    },
    close: function(): void {
        document.getElementById("save-modal").style.display = "none";
    }
}

ipcRenderer.on("fileData", (event, data: string, newFileData: string, filename: string) => {
    console.log("Data Received")
    editor.innerHTML = data;
    fileData.innerHTML = newFileData;
    savePreferences.saveName = filename;
});

ipcRenderer.on("fileInfo", (event, data: SaveData) => {
    savePreferences.saveInfo = data.saveInfo;
    savePreferences.saveName = data.saveName;
    fileData.innerHTML = data.saveInfo;
    saveAs = false;
})

ipcRenderer.on("request", (event, data: string) => {
    switch (data) {
        case "save":
            commandSaveFile();
            break;
        case "saveAs":
            commandSaveFileAs();
            break;
    }
})