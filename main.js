const {app, BrowserWindow, Menu,ipcMain, shell} = require('electron');
const path = require('path');
const os = require('os');
const resizeImg = require('resize-img');
const filesystemModule = require('fs');
//it uses cromion under the hood
//this file is kinda like backend
const isMac = process.platform === 'darwin';
const isWindows = process.platform === 'win32';
//if we are in dev tools i want option to toggle it 
const isDev = process.env.NODE_ENV !== 'production';
//create the main window 

let mainWindow;
function createMainWindow(){
     mainWindow = new BrowserWindow({
        title : 'Image Resizer',
        width: isDev ? 1000 : 500,
        height : 600,
        webPreferences : {
            contextIsolation : true,
            nodeIntegration : true,
            preload : path.join(__dirname, 'preload.js')
        },
    });
    //Open devtools if in dev enviroment
    if(isDev) {
        mainWindow.webContents.openDevTools();
    }
    mainWindow.loadFile(path.join(__dirname, './renderer/index.html'));
} //this is file we wanna load


//Create About Window 
function createAboutWindow () {
    const aboutWindow = new BrowserWindow({
        title : 'About Image Resizer',
        width: 300,
        height : 300
    });
    aboutWindow.loadFile(path.join(__dirname, './renderer/about.html'));
}
//when app is ready create this main window  
//App is ready 
app.whenReady().then(() => {
    createMainWindow();

    //Implement Menu
    const mainMenu = Menu.buildFromTemplate(menu);
    Menu.setApplicationMenu(mainMenu);
    //Remove mainWindow from memory on close
    mainWindow.on('closed', () => (mainWindow = null));
    
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
          createMainWindow()
        }
      })
});

//Menu template
const menu = [
    ...(isWindows ? [{
        label : app.name,
        submenu : [
            {label : 'About', click : createAboutWindow}
        ]
    }] : []),
    {
        // label : 'File',
        // submenu: [
        //     {
        //         label : 'Quit',
        //         click : () => app.quit(),
        //         accelerator : 'Ctrl/Cmd + W'
        //     }
        // ] role is same for everything up here 
        role : 'fileMenu'
    },
    ...(!isMac ? [{
        label : 'Help',
        submenu : [
            {label : 'About', click : createAboutWindow}
        ]
    }] : [])
];

//Respond to ipcRenderer(resize)
ipcMain.on('image:resize', (e,options) => {
    //options should be data that we send
    //destination for where do we want to that image to go 
    options.dest = path.join(os.homedir(),'imageresizer');
    resizeImage(options);
})

//Resize the image
async function resizeImage({imagePath, width,  height,dest}){
    try{
        const newPath = await 
        resizeImg(filesystemModule.readFileSync(imagePath), {
            width : +width,
            height : +height
        });
        //keep the file a same name when it resizes
        const filename = path.basename(imagePath);

        //Create destination folder if it doesn't exists
        if(!filesystemModule.existsSync(dest)){
            filesystemModule.mkdirSync(dest);
        }
        //Write file to destination folder
        filesystemModule.writeFileSync(path.join(dest, filename), newPath);

        //Send success message to renderer
        createMainWindow.webContents.send('image:done');
        //Open destination folder so that they can see 
        shell.openPath(dest);
    }
    catch(error){
        console.log(error);
    }
}
app.on('window-all-closed', () => {
    if (!isMac !== 'darwin') {
      app.quit();
    }
    if(!isWindows !== 'win32'){
        app.quit();
    }
  });