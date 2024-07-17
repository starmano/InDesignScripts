﻿/*************

  ~ skripta ponudi možnost preimenovanja datoteke,
  ~ pretvori sliko v .psd, 
  ~ shrani v originalno mapo, 
  ~ pretvori v cmyk barve, 
  ~ NE IZBRIŠE originalne slike (jpg, png ...)

  !! NE ZAMENJA VSEH PONOVITEV !!

*************/

var scriptName = "Resave as PSD-JPG and relink",
    doc, link;

if (typeof arguments == "undefined") {
    ErrorExit("This is a secondary script which should be run from the 'Resave as PSD and relink.jsx' or 'Resave as JPG and relink.jsx' script.", true);
}
var mode = arguments[0];

PreCheck();

//===================================== FUNCTIONS ======================================
function Main() {
    var folderPath,
        filePath = link.filePath;

    // Use the directory of the original file for the folder path
    folderPath = File(filePath).parent.fsName + "/";

    var folder = new Folder(folderPath);
    if (!folder.exists) ErrorExit("The folder '" + decodeURI(folderPath) + "' doesn't exist!", true);
    if ((mode == "PSD") && link.linkType == "Photoshop") ErrorExit("it's already PSD-file");

    if (mode == "PSD") {
        var name = prompt("Enter a new file name.", link.name.replace(/\..{3}$/, ""), scriptName);
    } else {
        name = link.name.replace(/\..{3}$/, "");
    }

    if (name != null) {
        var newLinkFilePath = folderPath + name + ((mode == "PSD") ? ".psd" : ".jpg");
        var newLinkFile = new File(newLinkFilePath);

        if (mode == "PSD") {
            if (!newLinkFile.exists) {
                CreateBridgeTalkMessagePSD(filePath, newLinkFilePath);
                if (newLinkFile.exists) link.relink(newLinkFile);
            } else {
                alert("The file '" + decodeURI(newLinkFile.name) + "' already exists. Try again and choose another name", scriptName, true);
            }
        } else { // JPG
            if (newLinkFile.exists) {
                var answer = confirm("The file '" + decodeURI(newLinkFile.name) + "' already exists. Do you want to overwrite it?", true, scriptName);
            }

            CreateBridgeTalkMessageJPG(filePath, newLinkFilePath);
            if (newLinkFile.exists) link.relink(newLinkFile);
        }
    }
}

//--------------------------------------------------------------------------------------------------------------------------------------------------------
function CreateBridgeTalkMessageJPG(filePath, jpgFilePath) {
    var bt = new BridgeTalk();
    bt.target = "photoshop";
    var script = ResaveAsJPG.toString() + '\r';
    script += 'ResaveAsJPG(\"' + filePath + '\", \"' + jpgFilePath + '\");';
    bt.body = script;
    bt.onResult = function(resObj) {}
    bt.send(100);
}

//--------------------------------------------------------------------------------------------------------------------------------------------------------
function ResaveAsJPG(filePath, jpgFilePath) {
    try {
        app.displayDialogs = DialogModes.NO;
        var doc = app.open(new File(filePath));

        // Convert to CMYK
        doc.changeMode(ChangeMode.CMYK);

        jpgSaveOptions = new JPEGSaveOptions();
        jpgSaveOptions.embedColorProfile = true;
        jpgSaveOptions.formatOptions = FormatOptions.STANDARDBASELINE;
        jpgSaveOptions.matte = MatteType.NONE;
        jpgSaveOptions.quality = 12;
        app.activeDocument.saveAs(new File(jpgFilePath), jpgSaveOptions, false, Extension.LOWERCASE);
        doc.close(SaveOptions.DONOTSAVECHANGES);
        app.displayDialogs = DialogModes.ALL;
    } catch (err) {
        $.writeln(err.message + ", line: " + err.line);
    }
}

//--------------------------------------------------------------------------------------------------------------------------------------------------------
function CreateBridgeTalkMessagePSD(filePath, psdFilePath) {
    var bt = new BridgeTalk();
    bt.target = "photoshop";
    var script = ResaveAsPSD.toString() + '\r';
    script += 'ResaveAsPSD(\"' + filePath + '\", \"' + psdFilePath + '\");';
    bt.body = script;
    bt.onResult = function(resObj) {}
    bt.send(100);
}

//--------------------------------------------------------------------------------------------------------------------------------------------------------
function ResaveAsPSD(filePath, psdFilePath) {
    try {
        app.displayDialogs = DialogModes.NO;
        var doc = app.open(new File(filePath));

        // Convert to CMYK
        doc.changeMode(ChangeMode.CMYK);

        psdSaveOptions = new PhotoshopSaveOptions();
        psdSaveOptions.alphaChannels = true;
        psdSaveOptions.annotations = false;
        psdSaveOptions.embedColorProfile = false;
        psdSaveOptions.layers = true;
        psdSaveOptions.spotColors = false;
        app.activeDocument.saveAs(new File(psdFilePath), psdSaveOptions, false, Extension.LOWERCASE);
        doc.close(SaveOptions.DONOTSAVECHANGES);
        app.displayDialogs = DialogModes.ALL;
    } catch (err) {
        $.writeln(err.message + ", line: " + err.line);
    }
}

//--------------------------------------------------------------------------------------------------------------------------------------------------------
function PreCheck() {
    if (app.documents.length == 0) ErrorExit("Please open a document and try again.", true);
    doc = app.activeDocument;
    if (doc.converted) ErrorExit("The current document has been modified by being converted from older version of InDesign. Please save the document and try again.", true);
    if (!doc.saved) ErrorExit("The current document has not been saved since it was created. Please save the document and try again.", true);
    if (app.selection.length == 0) ErrorExit("Nothing is selected.", true);
    if (app.selection.length > 1) ErrorExit("One image should be selected.", true);
    var sel = app.selection[0];

    if (sel instanceof Image) {
        var image = sel;
    } else if (sel.hasOwnProperty("images") && sel.images.length == 1) {
        var image = sel.images[0];
    } else {
        ErrorExit("Wrong selection! Select an image and try again.", true);
    }

    link = image.itemLink;

    Main();
}

//--------------------------------------------------------------------------------------------------------------------------------------------------------
function ErrorExit(error, icon) {
    alert(error, scriptName, icon);
    exit();
}
