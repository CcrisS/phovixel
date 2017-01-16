let $pf = $('#photos-folder');
let $pft = $('#photos-folder-txt');
let $bshowffiles = $('#show-files-btn');
let $brename = $('#rename-btn');
let $bmovevideos = $('#move-videos-btn')

/** Events **/
$pf.on('change', (e) => {
    selectedFolder = getFolder($pf);
    $pft.val(selectedFolder);
});
$bshowffiles.on('click', () => {
    onSelectedFolder($pft.val());
});
$brename.on('click', () => {
    onSelectedFolder($pft.val(), true);
});
$bmovevideos.on('click', () => {
    onSelectedFolder($pft.val(), false, true);
});

function onSelectedFolder(selectedFolder, doRename = false, moveVideos = false)
{
    // send event to main window
    if(selectedFolder){
        const {ipcRenderer} = require('electron');
        let params = {'folder': selectedFolder, 'doRename': doRename, 'moveVideos': moveVideos};
        console.log('send event to main window', params);
        ipcRenderer.send('ri-folder-selected', params);
    }
}

/**
 * Get selected folder
 * @param $folderInput
 * @returns promise
 */
function getFolder($folderInput)
{
    let pfFiles = $folderInput.prop('files');
    if(pfFiles.length > 0) {
        return pfFiles[0].path;
    }
    return null;
}