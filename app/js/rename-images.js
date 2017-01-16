let ExifImage = require('exif').ExifImage;
let fs = require('fs');
let path = require("path");
const fileExtensions = [
    '.png', '.jpg', '.jpeg', '.gif', '.bmp', '.tif', // images
    '.webm', '.flv', '.ogg', '.wmv', '.mp4', '.m4p', '.m4v', '.mpg', '.mpeg', '.3gp' // videos
];

const {ipcRenderer} = require('electron');
ipcRenderer.on('ri-load', (event, params) => {
    let $container = $('#files');
    renameAllImages(params.folder, params.doRename, $container);
});

function renameAllImages(selectedFolder, doRename, $container)
{
    $container.append('<h3 class="title">'+selectedFolder+'</h3>');

    getFiles(selectedFolder)
        .done(selectedFolderFiles => {
            let $fileList = $('<ul>');
            for (let fileName of selectedFolderFiles) {
                let $fileItem = $('<li>');
                let filePath = selectedFolder + path.sep + fileName;
                getTakenDate(filePath)
                    .done(takenDate => {
                        $fileItem.html('<b>'+fileName+'</b> ');
                        $fileItem.append('<span class="gray">' + takenDate + '</span> ');
                        renameImage(filePath, fileName, takenDate, doRename)
                            .done(newName => {
                                $fileItem.append('<span class="cyan">' + newName + '</span> ');
                            })
                            .fail((errorMsg) => {
                                $fileItem.append('<span class="error">' + errorMsg + '</span> ');
                            })
                        ;
                        $fileList.append($fileItem);
                    })
                    .fail((errorMsg, isDirectory) => {
                        if(errorMsg != null){
                            $fileItem.append('<span class="error">' + errorMsg + '</span> ');
                            $fileList.append($fileItem);
                        } else { // sub-folder
                            let $newContainer = $('<article>').addClass('sub-folder');
                            $container.append($newContainer);
                            renameAllImages(filePath, doRename, $newContainer);
                        }
                    })
                ;
            }
            $container.append($fileList);
        })
        .fail(errorMsg => {
            $container.append('<span class="error">' + errorMsg + '</span>');
        })
    ;
}

/**
 * Get files of a folder
 * @param selectedFolder
 * @returns promise
 */
function getFiles(selectedFolder)
{
    let d = $.Deferred();
    fs.readdir(selectedFolder, (err, files) => {
        if (err == null){
            if(typeof files != 'undefined' && files && files.length > 0){
                d.resolve(files);
            }
        } else {
            d.reject(err.message);
        }
    });

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
    new ExifImage({image : imgPath}, function (err, exifData) {
        if(err == null && exifData.exif && exifData.exif.DateTimeOriginal){
            d.resolve(exifData.exif.DateTimeOriginal);
        } else {
            d.reject();
        }
    });

    // videos and other files
    let d2 = $.Deferred();
    d.promise()
        .fail(() => { // no exif data
            fs.stat(imgPath, (err, stats) => {
                if(err != null){
                    d2.reject(err, false);
                } else {
                    if(stats.isDirectory()){
                        d2.reject(null, true);
                    } else {
                        stats.mtime.setHours(stats.mtime.getHours() + 1); // gmt +01
                        d2.resolve(stats.mtime.toISOString()); //2016-07-06T08:15:42.088Z
                    }
                }
            });
        })
        .done(takenDate => {
            d2.resolve(takenDate);
        })
    ;

    return d2.promise();
}

/**
 * Get new file name (with taken date)
 * @returns string|null
 */
function getNewFileName(fileName, takenDate)
{
    // format taken date str
    takenDate = takenDate.replace(/[-T: ]/g,'').slice(0, 14);

    // check if filename already has this date
    let datePos = fileName.indexOf(takenDate.substr(0, 8));
    if(datePos == 0){ // the file starts with its date
        if(fileName.indexOf(takenDate) == 0){ // already renamed
            return null;
        }
        return fileName.replace(/_/g, ''); // fix samsung date format
    } else if(datePos > 1){ // the file has the date in other position
        let fileNameNoDate = fileName.replace(takenDate.substr(0, 8), ''); // taken date first
        return takenDate + '_' + fileNameNoDate;
    }

    // check if filename has other date
    if(fileName.match(/20\d+/)){
        fileName = fileName.replace(/20\d+/g, '');
    }

    // manage underscores
    fileName = fileName.replace(/__/g, '_'); // double underscores
    fileName = fileName.replace(/^_/, ''); // first underscore

    return takenDate + '_' + fileName;
}

/**
 * rename image
 * @returns promise
 */
function renameImage(filePath, fileName, takenDate, doRename)
{
    let d = $.Deferred();
    let newName = getNewFileName(fileName, takenDate);

    if(newName != null){
        if(fileExtensions.indexOf(path.extname(fileName.toLowerCase())) >= 0){
            if(doRename){ // rename...
                let newFilePath = filePath.replace(fileName, newName);
                fs.rename(filePath, newFilePath, (err) => {
                    (err == null) ? d.resolve(newName) : d.reject(err);
                });
            } else { // only show the new name
                d.resolve(newName);
            }
        } else {
            d.reject('extension not supported');
        }
    } else {
        d.reject('already renamed');
    }

    return d.promise();
}