const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');

let mainWindow = null;
let updateCheckTimer = null;

function sendUpdateStatus(status, extra = {}) {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  mainWindow.webContents.send('hypecord:update-status', { status, ...extra });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    backgroundColor: '#111318',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

async function checkForUpdates() {
  if (!app.isPackaged) {
    sendUpdateStatus('dev');
    return;
  }

  try {
    sendUpdateStatus('checking');
    const result = await autoUpdater.checkForUpdates();
    if (!result || !result.updateInfo) {
      sendUpdateStatus('up-to-date', { version: app.getVersion() });
    }
  } catch (error) {
    console.error('Hypecord update check failed:', error);
    sendUpdateStatus('error', { message: error?.message || 'Update check failed.' });
  }
}

function configureAutoUpdater() {
  if (!app.isPackaged) return;

  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = false;
  autoUpdater.allowPrerelease = true;
  autoUpdater.channel = 'beta';

  autoUpdater.on('checking-for-update', () => sendUpdateStatus('checking'));
  autoUpdater.on('update-available', (info) => {
    sendUpdateStatus('available', { version: info.version });
  });
  autoUpdater.on('download-progress', (progress) => {
    sendUpdateStatus('downloading', {
      percent: Math.round(progress.percent || 0),
      transferred: progress.transferred,
      total: progress.total,
    });
  });
  autoUpdater.on('update-downloaded', (info) => {
    sendUpdateStatus('downloaded', { version: info.version });
  });
  autoUpdater.on('update-not-available', (info) => {
    sendUpdateStatus('up-to-date', { version: info.version || app.getVersion() });
  });
  autoUpdater.on('error', (error) => {
    console.error('Hypecord auto-update error:', error);
    sendUpdateStatus('error', { message: error?.message || 'Update failed.' });
  });
}

app.whenReady().then(() => {
  createWindow();
  configureAutoUpdater();

  ipcMain.handle('hypecord:get-version', () => app.getVersion());

  ipcMain.handle('hypecord:check-for-updates', async () => {
    await checkForUpdates();
    return { version: app.getVersion() };
  });

  ipcMain.handle('hypecord:install-update', () => {
    if (!app.isPackaged) return false;
    autoUpdater.quitAndInstall(false, true);
    return true;
  });

  if (app.isPackaged) {
    setTimeout(checkForUpdates, 4000);
    updateCheckTimer = setInterval(checkForUpdates, 30 * 60 * 1000);
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
  if (updateCheckTimer) clearInterval(updateCheckTimer);
});
