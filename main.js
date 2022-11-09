const {app, BrowserWindow, Menu} = require('electron')
const path = require('path')
//it uses cromion under the hood
//this file is kinda like backend

const isMac = process.platform === 'darwin';
const isWindows = process.platform === 'win32';

//if we are in dev tools i want option to toggle it 
const isDev = process.env.NODE_ENV !== 'production';
//create the main window 
function createMainWindow(){
    const mainWindow = new BrowserWindow({
        title : 'Image Resizer',
        width: isDev ? 1000 : 500,
        height : 600
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
app.on('window-all-closed', () => {
    if (!isMac !== 'darwin') {
      app.quit();
    }
    if(!isWindows !== 'win32'){
        app.quit();
    }
  });