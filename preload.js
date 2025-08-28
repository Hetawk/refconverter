const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
    // File operations
    openFileDialog: () => ipcRenderer.invoke('open-file-dialog'),
    saveFileDialog: (content, defaultName) => ipcRenderer.invoke('save-file-dialog', content, defaultName),
    saveAsDialog: (content, suggestedName) => ipcRenderer.invoke('save-as-dialog', content, suggestedName),
    quickSave: (content, lastSavedPath, defaultName) => ipcRenderer.invoke('quick-save', content, lastSavedPath, defaultName),
    openFolder: (filePath) => ipcRenderer.invoke('open-folder', filePath),
    readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
    writeFile: (filePath, content) => ipcRenderer.invoke('write-file', filePath, content),

    // Dialog operations
    showMessageBox: (options) => ipcRenderer.invoke('show-message-box', options),

    // Menu event listeners
    onMenuOpenFile: (callback) => ipcRenderer.on('menu-open-file', callback),
    onMenuSaveFile: (callback) => ipcRenderer.on('menu-save-file', callback),
    onMenuAbout: (callback) => ipcRenderer.on('menu-about', callback),
    onMenuDocs: (callback) => ipcRenderer.on('menu-docs', callback),

    // Remove listeners
    removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),

    // Utility functions
    platform: process.platform,
    version: process.versions.electron
});
