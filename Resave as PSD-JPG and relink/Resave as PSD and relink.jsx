var scriptName = "Resave as PSD and relink",
activeScript = GetActiveScript(),
scriptFile = new File(activeScript.parent.absoluteURI + "/" + "Resave as PSD-JPG and relink.jsx"),
mode = "PSD";

if (scriptFile.exists) {
	app.doScript(scriptFile, ScriptLanguage.JAVASCRIPT, [mode], UndoModes.ENTIRE_SCRIPT, "'\'" + scriptName + "\" script");
}
else {
	alert("The '" + scriptName + "' script should be located in the same folder as this script.", scriptName, true);
}

function GetActiveScript() {
    try {
        return app.activeScript;
    }
    catch(err) {
        return new File(err.fileName);
    }
}

function ErrorExit(error, icon) {
	alert(error, scriptName, icon);
	exit();
}