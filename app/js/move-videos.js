let fs = require('fs');
var glob = require('glob');
const videoExtensions = [
    '.webm', '.flv', '.ogg', '.wmv', '.mp4', '.m4p', '.m4v', '.mpg', '.mpeg', '.3gp'
];

const {ipcRenderer} = require('electron');
ipcRenderer.on('ri-load', (event, params) => {
    let $container = $('#files');
    moveAllVideos(params.folder, $container);
});

function moveAllVideos(selectedFolder, $container)
{
    $container.append('<h3 class="title">'+selectedFolder+' <span class="counter"></span></h3>');
    $container.append('<div class="loading"><img src="./img/loading.gif" alt="loading..." /></div>');

    let options = {'matchBase': true};
    let pattern = selectedFolder+'\\*{'+videoExtensions.join(',')+'}';

    console.log('glob', options, pattern);

    glob(pattern, options, function (err, files) {
        $container.find('.loading').remove();
        if(err == null){
            if(files.length == 0){
                $container.append('<p>No files found.</p>');
            } else {
                let $fileList = $('<ul>');
                $container.append($fileList);
                $container.find('.title .counter').text(files.length);
                for (let fileName of files) {
                    let $fileItem = $('<li>').text(fileName);
                    $fileList.append($fileItem);
                }
            }
        } else {
            console.log('error: ', err);
            $container.append('<span class="error">' + err + '</span>');
        }
    });
}



