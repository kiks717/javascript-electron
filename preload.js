const os = require('os');
const path = require('path');
const Toastify = require('toastify-js');
const { contextBridge, ipcRenderer} = require('electron');
const { channel } = require('diagnostics_channel');

contextBridge.exposeInMainWorld('os', {
    homedir : () => os.homedir()
//   node: () => process.versions.node,
//   chrome: () => process.versions.chrome,
//   electron: () => process.versions.electron,
  // we can also expose variables, not just functions
})
contextBridge.exposeInMainWorld('path', {
    join : (...args) => path.join(...args)
});

contextBridge.exposeInMainWorld('Toastify', {
    toast : (options) => Toastify(options).showToast(),
});

contextBridge.exposeInMainWorld('ipcRenderer', {
    send : (channel,data) => ipcRenderer.send(channel,data),
    on : (channel, fun) =>  ipcRenderer.on(channel,(e, ...args) => fun(...args)),
})