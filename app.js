var fs = require('fs');
var editor = document.getElementById("edit");
var fileData = document.getElementById("file-data");
function saveFile() {
    var savePreferences = {
        saveName: document.getElementById("save-name").value,
        // Express that "editor" is the type of "HTMLInputElement" to allow the use of the "value" property
        content: editor.value,
        path: ""
    };
    fs.writeFile(savePreferences.saveName, savePreferences.content, function (err, data) {
        if (err)
            throw err;
        fileData.innerHTML = savePreferences.saveName + " - Saved";
    });
    saveModal.close();
}
var saveModal = {
    open: function () {
        document.getElementById("save-modal").style.display = "inline";
    },
    close: function () {
        document.getElementById("save-modal").style.display = "none";
    }
};
