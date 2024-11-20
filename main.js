const { app, BrowserWindow, shell, ipcMain } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const Store = require('electron-store');
const log = require('electron-log');
const { autoUpdater } = require('electron-updater');

const store = new Store();
let mainWindow;
let djangoProcess;

autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App is starting...');

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    resizable: true,
    minWidth: 1280,
    minHeight: 720,
    maxWidth: 1600,
    maxHeight: 900,
    autoHideMenuBar: true,
    icon: path.join(__dirname, '/static/medias/icons/favicon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      sandbox: true,
    },
  });

  mainWindow.loadURL("http://localhost:8000/");

  mainWindow.on("close", () => {
    mainWindow = null;
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  // Supprimer complètement le menu
  mainWindow.setMenu(null);
}

function runDjangoProcess(pythonPath, djangoProjectPath) {
  const django = spawn(pythonPath, ['manage.py', 'runserver'], {
    cwd: djangoProjectPath,
    shell: true,
    stdio: 'inherit',
  });

  django.on('error', (err) => {
    console.error('Échec du démarrage du processus Django :', err);
    app.quit();
  });

  django.on('exit', (code) => {
    if (code !== 0) {
      console.error(`Le processus Django s'est terminé avec le code ${code}`);
    }
    app.quit();
  });

  return django;
}

function startDjango() {
  const appPath = app.isPackaged ? process.resourcesPath : app.getAppPath();
  const pythonPath = path.join(appPath, 'venv', 'Scripts', 'python.exe');
  const djangoProjectPath = appPath;

  if (!fs.existsSync(pythonPath)) {
    console.error(`Python introuvable à l'emplacement ${pythonPath}`);
    app.quit();
    return;
  }

  if (!fs.existsSync(path.join(djangoProjectPath, 'manage.py'))) {
    console.error(`manage.py introuvable dans ${djangoProjectPath}`);
    app.quit();
    return;
  }

  djangoProcess = runDjangoProcess(pythonPath, djangoProjectPath);
  console.log('Processus Django démarré avec le PID :', djangoProcess.pid);
}

app.whenReady().then(() => {
  startDjango();
  createWindow();

  autoUpdater.checkForUpdatesAndNotify();

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.handle('save-last-achievement', (event, achievementId) => {
  store.set('lastAchievement', achievementId);
  return { status: 'success' };
});