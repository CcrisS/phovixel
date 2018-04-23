# PhoviXel

Rename your photos and videos by its taken date recursively.

## Functionality

### {ri} Rename images and videos
1. Select folder
2. The app renames all the image and video files to: `taken_date + previous_name`

### {mv} Move videos
1. Select folder
2. The app moves all the video files to a separate "videos" folder.

## How to build the app

`npm run package:windows`


## Built With

* [Electron js](https://electronjs.org/) - Build cross platform desktop apps with JavaScript, HTML, and CSS
* Electron uses [Chromium](https://www.chromium.org/Home) and [Node.js](https://nodejs.org/)

----------

#### toDo

- [ ] Each "promise" returns `(err, param)`
- [ ] require('electron-window-state');
- [ ] [Packaging and distribution](http://electron.rocks/electron-angular-packing-and-distribution/)
- [ ] electron-packager