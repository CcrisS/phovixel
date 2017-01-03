let ExifImage = require('exif').ExifImage;
let fs = require('fs');

const {ipcRenderer} = require('electron');
ipcRenderer.on('ri-load', (event, params) => {
    renameAllImages(params.folder, params.doRename);
});

function renameAllImages(selectedFolder, doRename)
{
    $('h3.title').text(selectedFolder);

    getFiles(selectedFolder)
        .done((selectedFolderFiles) => {
            let $fileList = $('<ul>');
            for (let fileName of selectedFolderFiles) {
                let $fileItem = $('<li>');
                let filePath = selectedFolder + '\\' + fileName;
                $fileItem.html('<b>'+fileName+'</b>');
                // $fileItem.append(' <span class="gray">' + (stats.isFile() ? 'file' : 'dir') + '</span>');
                getTakenDate(filePath)
                    .done((takenDate) => {
                        $fileItem.append(' <span class="gray">' + takenDate + '</span>');
                        renameImage(filePath, fileName, takenDate, doRename)
                            .done((newName) => {
                                $fileItem.append(' <span class="cyan">' + newName + '</span>');
                            })
                        ;
                    });
                $fileList.append($fileItem);
            }
            $('#files').append($fileList);
        })
    ;
}

/**
 * Get files of a folder
 * @returns promise
 * @param selectedFolder
 * @param removeFolders
 */
function getFiles(selectedFolder, removeFolders = true)
{
    let d = $.Deferred();
    fs.readdir(selectedFolder, (err, files) => {
        if (err == null){
            console.log(files);
            if(typeof files != 'undefined' && files && files.length > 0){
                if(!removeFolders){
                    d.resolve(files);
                } else {
                    let folderFiles = [];
                    for (let folderFile of files) {
                        let i = 0;
                        fs.stat(selectedFolder + '\\' + folderFile, (err2, stats) => {
                            i++;
                            if(err2 == null && stats.isFile()){
                                folderFiles.push(folderFile);
                            }
                            if(i == files.length){ // resolve on last iteration
                                d.resolve(folderFiles);
                            }
                        });
                    }
                }
            }
        } else {
            console.log('Error: '+error.message);
        }
    })
    return d.promise();
}

/**
 * Get taken date
 * @param imgPath string
 * @returns promise
 */
function getTakenDate(imgPath)
{
    let d = $.Deferred();
    try {
        new ExifImage({image : imgPath}, function (error, exifData) {
            if (error == null){
                if(exifData.exif && exifData.exif.DateTimeOriginal){
                    d.resolve(exifData.exif.DateTimeOriginal);
                }
            } else {
                console.log('Error: '+error.message);
            }
        });
    } catch (error) {
        console.log('Error: ' + error.message);
    }

    return d.promise();
}

/**
 * Get new file name (with taken date)
 * @returns string
 */
function getNewFileName(fileName, takenDate)
{
    let newName;

    // format taken date str
    // takenDate = takenDate.split(':').join('').split(' ').join('');
    takenDate = takenDate.replace(/[: ]/g, '');

    // check if filename already has this date
    let datePos = fileName.indexOf(takenDate.substr(0, 8));
    if(datePos < 0){ // not date
        newName = takenDate + '_' + fileName;
    } else if(datePos > 1){ // taken date first
        let fileNameNoDate = fileName.replace(takenDate.substr(0, 8), '');
        newName = takenDate + '_' + fileNameNoDate;
    } else { // the file starts with its date
        if(fileName.indexOf('DSC') >= 0){ // already renamed
            console.log(fileName+' ya tiene fecha');
        } else {
            newName = fileName.replace(/_/g, ''); // fix samsung date format
        }
    }

    return newName;
}

/**
 * rename image
 * @returns promise
 */
function renameImage(filePath, fileName, takenDate, doRename)
{
    let d = $.Deferred();
    let newName = getNewFileName(fileName, takenDate);

    if(doRename){
        // rename...
        if(newName){
            let newFilePath = filePath.replace(fileName, newName);
            fs.rename(filePath, newFilePath, (err) => {
                if (err == null){
                    d.resolve(newName);
                } else {
                    console.log('ERROR: ' + err);
                    d.reject();
                }
            });
        } else {
            d.reject();
        }
    } else {
        d.resolve(newName); // only show the new name
    }

    return d.promise();
}