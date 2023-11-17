const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
    getRunRecords: () => ipcRenderer.invoke('getRunRecords')
})