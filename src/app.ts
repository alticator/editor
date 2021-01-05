var fs = require('fs');
var editor = document.getElementById("edit");
var fileData = document.getElementById("file-data");
var savePreferences: SaveData;

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

require("electron").ipcRenderer.on("ping", (event, message) => {
    switch (message) {
        case "save":
            saveModal.open();
            break;

        case "edit":
            setUnsaved();
            break;
    }
});