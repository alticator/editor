var editor = document.getElementById("edit");
var fileData = document.getElementById("file-data");
const {ipcRenderer} = require("electron");
var path = require("path");
var fs = require("fs");

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

function askNew() {
    document.getElementById("confirm-close").style.display = "initial";
}

function newFile() {
    (<HTMLInputElement>editor).value = "";
    saveAs = true;
    savePreferences.saveName = "Unsaved Note";
    savePreferences.saveInfo = "Unsaved Note*";
    fileData.innerHTML = savePreferences.saveInfo;
    document.getElementById("confirm-close").style.display = "none";
}

function saveAndNewFile() {
    commandSaveFile();
    setTimeout(() => {
        (<HTMLInputElement>editor).value = "";
        saveAs = true;
        savePreferences.saveName = "Unsaved Note";
        savePreferences.saveInfo = "Unsaved Note*";
        fileData.innerHTML = savePreferences.saveInfo;
        document.getElementById("confirm-close").style.display = "none";
    }, 500);
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

function commandExportHTML() {
    var content = (<HTMLInputElement>editor).value;
    var file = `<!doctype html>
    <html>
    <style>
    body {
        font-family: ${editor.style.fontFamily};
        font-size: ${editor.style.fontSize};
        line-height: ${editor.style.lineHeight};
        margin: ${editor.style.padding};
        text-align: ${editor.style.textAlign};
        unicode-bidi: bidi-override;
        direction: ${editor.style.direction};
        white-space: pre-line;
        max-width: 100%;
    }
    </style>
    ${content}
    </html>`;
    ipcRenderer.send("export", "html", file);
}

function editorKeydown(event) {
    if (event.key == "Tab") {
        event.preventDefault();
        var cursorPosition = (<HTMLInputElement>editor).selectionStart;
        var content = (<HTMLInputElement>editor).value;
        (<HTMLInputElement>editor).value = content.substring(0, cursorPosition) + "	" + content.substring(cursorPosition);
        (<HTMLInputElement>editor).selectionStart = cursorPosition + 1;
        (<HTMLInputElement>editor).selectionEnd = cursorPosition + 1;
    }
}

function setUnsaved(): void {
    fileData.innerHTML = `${path.basename(savePreferences.saveName)}*`;
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
    var darkMode = (<HTMLInputElement>document.getElementById("theme")).value == "dark";
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
        document.getElementsByTagName("nav")[0].style.backgroundColor = "#441bd8dc";
        document.getElementById("toolbar").style.backgroundColor = "#441bd8dc";    }
    else if (!darkMode) {
        editor.style.backgroundColor = "white";
        editor.style.color = "black";
        document.getElementsByTagName("nav")[0].style.backgroundColor = "dodgerblue";
        document.getElementById("toolbar").style.backgroundColor = "dodgerblue";
    }
    formatModal.close();
}

function setView(select): void {
    var newView = (<HTMLInputElement>select).value;
    if (newView == "edit") {
        document.getElementById("edit-view").style.display = "initial";
    }
    else if (newView == "read") {
        document.getElementById("edit-view").style.display = "none";
    }
}

ipcRenderer.on("fileData", (event, data: string, newFileData: string, filename: string) => {
    (<HTMLInputElement>editor).value = data;
    fileData.innerHTML = newFileData;
    savePreferences.saveName = filename;
    savePreferences.saveInfo = `${path.basename(filename)} - Saved`;
    fileData.innerHTML = savePreferences.saveInfo;
});

ipcRenderer.on("fileData-alticatordoc", (event, data: string, newFileData: string, filename: string, styleData: any) => {
    (<HTMLInputElement>editor).value = data;
    fileData.innerHTML = newFileData;
    savePreferences.saveName = filename;
    savePreferences.saveInfo = `${path.basename(filename)} - Saved`;
    fileData.innerHTML = savePreferences.saveInfo;
    if (styleData.font != "") {
        editor.style.fontFamily = styleData.font;
        (<HTMLInputElement>document.getElementById("font")).value = styleData.font;
    }
    if (styleData.fontSize != "") {
        editor.style.fontSize = styleData.fontSize;
        (<HTMLInputElement>document.getElementById("font-size")).value = styleData.fontSize;
    }
    if (styleData.lineHeight != "") {
        editor.style.lineHeight = styleData.lineHeight;
        (<HTMLInputElement>document.getElementById("line-height")).value = styleData.lineHeight;
    }
    if (styleData.margin != "") {
        editor.style.padding = styleData.margin;
        (<HTMLInputElement>document.getElementById("margin")).value = styleData.margin;
    }
    if (styleData.textAlign != "") {
        editor.style.textAlign = styleData.textAlign;
        (<HTMLInputElement>document.getElementById("text-align")).value = styleData.textAlign;
    }
    if (styleData.writingDirection != "") {
        editor.style.direction = styleData.writingDirection;
        (<HTMLInputElement>document.getElementById("writing-direction")).value = styleData.writingDirection;
    }
    saveAs = false;
});

ipcRenderer.on("fileInfo", (event, data: SaveData) => {
    savePreferences.saveInfo = data.saveInfo;
    savePreferences.saveName = data.saveName;
    fileData.innerHTML = data.saveInfo;
    saveAs = false;
})

ipcRenderer.on("request", (event, data: string) => {
    switch (data) {
        case "new":
            askNew();
            break;
        case "save":
            commandSaveFile();
            break;
        case "saveAs":
            commandSaveFileAs();
            break;
        case "formatOptions":
            formatModal.open();
            break;
        case "exportHTML":
            commandExportHTML();
            break;
        case "fileInfo":
            if (!saveAs) {
                document.getElementById("file-name").innerHTML = path.basename(savePreferences.saveName);
                document.getElementById("file-path").innerHTML = savePreferences.saveName;
                var fileFormat = path.extname(savePreferences.saveName);
                var fileFormatName;
                if (fileFormat == ".alticatordoc") {
                    fileFormatName = "AlticatorDoc";
                }
                else if (fileFormat == ".txt") {
                    fileFormatName = "Plain Text";
                }
                else {
                    fileFormatName = `Other (${fileFormatName})`
                }
                document.getElementById("file-format").innerHTML = fileFormatName;
                fs.stat(savePreferences.saveName, (err, data) => {
                    if (err) throw err;
                    if (data.size / 1000000 > 1) {
                        document.getElementById("file-size").innerHTML = `${data.size / 1000000} MB`;
                    }
                    else if (data.size / 1000 > 1) {
                        document.getElementById("file-size").innerHTML = `${data.size / 1000} KB`;
                    }
                    else {
                        document.getElementById("file-size").innerHTML = `${data.size} B`;
                    }
                });
            }
            else {
                document.getElementById("file-name").innerHTML = "Not Saved";
                document.getElementById("file-path").innerHTML = "Not Saved";
                document.getElementById("file-size").innerHTML = "Not Saved";
                document.getElementById("file-format").innerHTML = "Not Saved";
            }
            document.getElementById("file-info").style.display = "initial";
    }
})