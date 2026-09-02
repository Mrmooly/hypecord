const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('hypecordUpdater', {
  getVersion: () => ipcRenderer.invoke('hypecord:get-version'),
  checkForUpdates: () => ipcRenderer.invoke('hypecord:check-for-updates'),
  installUpdate: () => ipcRenderer.invoke('hypecord:install-update'),
  onStatus: (callback) => {
    const listener = (_event, payload) => callback(payload);
    ipcRenderer.on('hypecord:update-status', listener);
    return () => ipcRenderer.removeListener('hypecord:update-status', listener);
  },
});
