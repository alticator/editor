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
    var documentStyle = {
        fontFamily: editor.style.fontFamily,
        fontSize: editor.style.fontSize,
        lineHeight: editor.style.lineHeight,
        padding: editor.style.padding,
        textAlign: editor.style.textAlign,
        direction: editor.style.direction
    }
    ipcRenderer.send("command", "save", content, saveAs, savePreferences.saveName, documentStyle);
}

function commandSaveFileAs() {
    var content = (<HTMLInputElement>editor).value;
    var documentStyle = {
        font: editor.style.fontFamily,
        fontSize: editor.style.fontSize,
        lineHeight: editor.style.lineHeight,
        margin: editor.style.padding,
        textAlign: editor.style.textAlign,
        writingDirection: editor.style.direction
    }
    ipcRenderer.send("command", "save", content, true, savePreferences.saveName, documentStyle);
}

function commandOpenFile() {
    ipcRenderer.send("command", "open");
}

function editorKeydown(event) {
    if (event.key == "Tab") {
        event.preventDefault();
        var cursorPosition = (<HTMLInputElement>editor).selectionStart;
        var content = (<HTMLInputElement>editor).value;
        (<HTMLInputElement>editor).value = content.substring(0, cursorPosition) + "	" + content.substring(cursorPosition);
    }
}

function setUnsaved(): void {
    fileData.innerHTML = `${savePreferences.saveName}*`;
}

interface ModalOptions {
    open: void,
    close: void
}

var formatModal = {
    open: function(): void {
        var modal = document.getElementById("modal-format");
        modal.style.display = "initial";
    },
    close: function(): void {
        var modal = document.getElementById("modal-format");
        modal.style.display = "none";
    }
}

function setFormat(): void {
    var font = (<HTMLSelectElement>document.getElementById("font")).value;
    var fontSize = (<HTMLSelectElement>document.getElementById("font-size")).value;
    var lineHeight = (<HTMLSelectElement>document.getElementById("line-height")).value;
    var darkMode = (<HTMLInputElement>document.getElementById("dark-theme")).checked;
    var margin = (<HTMLSelectElement>document.getElementById("margin")).value;
    var textAlign = (<HTMLSelectElement>document.getElementById("text-align")).value;
    var writingDirection = (<HTMLSelectElement>document.getElementById("writing-direction")).value;
    editor.style.fontFamily = font;
    editor.style.fontSize = fontSize + "px";
    editor.style.lineHeight = lineHeight;
    editor.style.padding = margin + "px";
    editor.style.textAlign = textAlign;
    editor.style.direction = writingDirection;
    if (darkMode) {
        editor.style.backgroundColor = "#505050";
        editor.style.color = "white";
        document.getElementsByTagName("nav")[0].style.backgroundColor = "#808080";
    }
    else if (!darkMode) {
        editor.style.backgroundColor = "white";
        editor.style.color = "black";
        document.getElementsByTagName("nav")[0].style.backgroundColor = "#505050";
    }
    formatModal.close();
}

ipcRenderer.on("fileData", (event, data: string, newFileData: string, filename: string) => {
    editor.innerHTML = data;
    fileData.innerHTML = newFileData;
    savePreferences.saveName = filename;
});

ipcRenderer.on("fileData-alticatordoc", (event, data: string, newFileData: string, filename: string, styleData: any) => {
    editor.innerHTML = data;
    fileData.innerHTML = newFileData;
    savePreferences.saveName = filename;
    if (styleData.font != "") {
        editor.style.fontFamily = styleData.font;
    }
    if (styleData.fontSize != "") {
        editor.style.fontSize = styleData.fontSize;
    }
    if (styleData.lineHeight != "") {
        editor.style.lineHeight = styleData.lineHeight;
    }
    if (styleData.margin != "") {
        editor.style.padding = styleData.margin;
    }
    if (styleData.textAlign != "") {
        editor.style.textAlign = styleData.textAlign;
    }
    if (styleData.writingDirection != "") {
        editor.style.direction = styleData.writingDirection;
    }
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
        case "formatOptions":
            formatModal.open();
            break;
    }
})