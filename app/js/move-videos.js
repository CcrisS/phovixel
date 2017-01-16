let fs = require('fs');
let glob = require('glob');
let path = require('path');
const videoExtensions = ['.webm', '.flv', '.ogg', '.wmv', '.mp4', '.m4p', '.m4v', '.mpg', '.mpeg', '.3gp'];

const {ipcRenderer} = require('electron');
ipcRenderer.on('ri-load', (event, params) => {
    let $container = $('#files');
    moveAllVideos(params.folder, $container);
});

function moveAllVideos(selectedFolder, $container)
{
    $container.append('<h3 class="title">'+selectedFolder+' <span class="counter"></span></h3>');
    $container.append('<div class="loading"><img src="./img/loading.gif" alt="loading..." /></div>');

    glob(selectedFolder+'*/**/*{'+videoExtensions.join(',')+'}', function (err, files) {
        $container.find('.loading').remove();

        if(err == null){
            if(files.length == 0){
                $container.append('<p>No files found.</p>');
            } else {

                // create dir
                let videoFolder = selectedFolder + path.sep + 'videos';
                try {
                    fs.mkdirSync(videoFolder); // error if already exits
                } catch (e) {
                    console.log(e);
                }

                let $fileList = $('<ul>');
                $container.append($fileList);
                $container.find('.title .counter').text(files.length);

                for (let filePath of files) {
                    let fileNativePath = fs.realpathSync(filePath);
                    let $fileItem = $('<li>').text(fileNativePath.replace(selectedFolder, ''));
                    $fileList.append($fileItem);

                    // move
                    let filename = fileNativePath.split(path.sep).pop();
                    let newPath = videoFolder + path.sep + filename;
                    if(fileNativePath != newPath){
                        fs.rename(fileNativePath, newPath, (renameErr) => {
                            if(renameErr == null){
                                $fileItem.append(' <span class="cyan">' + newPath + '</span> ');
                            } else {
                                $fileItem.append(' <span class="error">' + renameErr + '</span> ');
                            }
                        });
                    } else {
                        $fileItem.append(' <span class="error">already moved.</span> ');
                    }
                }
            }
        } else {
            console.log('error: ', err);
            $container.append('<span class="error">' + err + '</span>');
        }
    });
}



