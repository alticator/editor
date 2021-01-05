var fs = require('fs');
var editor = document.getElementById("edit");
var fileData = document.getElementById("file-data");
var savePreferences: SaveData = {
    saveName: "Unsaved Note",
    content: "",
    path: ""
}

interface SaveData {
    saveName: string,
    content: string,
    path: string
}

function saveFile() {
    savePreferences = {
        saveName: (<HTMLInputElement>document.getElementById("save-name")).value,
        // Express that "editor" is the type of "HTMLInputElement" to allow the use of the "value" property
        content: (<HTMLInputElement>editor).value,
        path: ""
    };
    fs.writeFile(savePreferences.saveName, savePreferences.content, function (err, data) {
        if (err) throw err;
        fileData.innerHTML = `${savePreferences.saveName} - Saved`;
    });
    saveModal.close();
}

function openFile() {
    var fileName: string = (<HTMLInputElement>document.getElementById("open-name")).value;
    fs.readFile(fileName, function(err, data): void {
        if (err) throw err;
        (<HTMLInputElement>editor).innerHTML = data;
        fileData.innerHTML = `${fileName} - Saved`;
    });
    savePreferences.saveName = fileName;
    openModal.close();
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

var openModal = {
    open: function(): void {
        document.getElementById("open-modal").style.display = "inline";
    },
    close: function(): void {
        document.getElementById("open-modal").style.display = "none";
    }
}

require("electron").ipcRenderer.on("ping", (event, message: string) => {
    switch (message) {
        case "save":
            saveModal.open();
            break;

        case "open":
            openModal.open();
            break;
    }
});