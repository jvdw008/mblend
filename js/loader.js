// This is the loader
var libs = ["modalInc", "toolbarInc", "menuInc", "editorInc"];

for (var i in libs) {
    var imported = document.createElement('script');
    imported.src = "/js/" + libs[i] + ".js";
    document.head.appendChild(imported);
}
