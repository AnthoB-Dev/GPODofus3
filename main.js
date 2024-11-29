(async() => {
  const { app, BrowserWindow, shell } = require('electron');
  const { spawn } = require('child_process');
  const path = require('path');
  const fs = require('fs');
  const log = require('electron-log');
  const { exec } = require('child_process');
  
  let mainWindow;
  let djangoProcess;
  let activate_std = false;
  let stdio;
  let isCleaningUp = false;
  
  if (require('electron-squirrel-startup')) {
    app.quit();
  }
  
  log.info('App is starting...');
  
  const createWindow = () => {
    log.info("- Starting window creation in createWindow().");
    
    mainWindow = new BrowserWindow({
      width: 1366,
      height: 768,
      resizable: true,
      minWidth: 1280,
      minHeight: 720,
      maxWidth: 1600,
      maxHeight: 900,
      autoHideMenuBar: true,
      icon: path.join(__dirname, 'static', 'medias', 'icons', 'favicons', 'favicon.ico'),
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
      log.info("Window is closing");
      mainWindow = null;
    });
  
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
      shell.openExternal(url);
      return { action: "deny" };
    });
  
    // Supprimer complètement le menu
    mainWindow.setMenu(null);

    log.info("Window created");
  }
  
  const runDjangoProcess = (pythonPath, djangoProjectPath) => {
    log.info("- Running django process in runDjangoProcess().");

    let activate_std = false;
    let stdio;

    activate_std ? stdio = 'pipe' : stdio = 'ignore';

    const django = spawn(pythonPath, ['manage.py', 'runserver'], {
      cwd: djangoProjectPath,
      stdio: stdio
    });

    if (!django) {
      throw new Error("Failed to start Django process");
    }

    if (activate_std) {
      // Capture de la sortie standard
      django.stdout.on('data', (data) => {
        log.info(`Django stdout: ${data}`);
      });
    
      // Capture de la sortie d'erreur
      django.stderr.on('data', (data) => {
        log.error(`Django stderr: ${data}`);
      });
    }

    django.on('error', (err) => {
      log.error('Echec du démarrage du processus Django :', err);
      app.quit();
    });

    django.on('exit', (code) => {
      if (code !== 0) {
        log.error(`Le processus Django s'est terminé avec le code ${code}`);
      }
      log.info("Django process exited");
      if (!isCleaningUp) {
        app.quit();
      }
    });

    return django;
  }

  const startDjango = () => {
    log.info("- Starting Django in startDjango().");

    return new Promise((resolve) => {
      try {
        const appPath = app.getAppPath();
        log.info(`__App_path: ${appPath}`);

        const pythonPath = path.join(appPath, 'venv', 'Scripts', 'python.exe');
        log.info(`__Python_path: ${pythonPath}`);

        const djangoProjectPath = appPath;
        log.info(`__Django_project_path: ${djangoProjectPath}`);

        const managePyPath = path.join(appPath, 'manage.py');
        log.info(`Chemin vers manage.py : ${managePyPath}`);

        if (!fs.existsSync(pythonPath)) {
          log.error(`python.exe introuvable à l'emplacement : ${pythonPath}`);
          app.quit();
          return;
        }

        if (!fs.existsSync(managePyPath)) {
          log.error(`manage.py introuvable à l'emplacement : ${managePyPath}`);
          app.quit();
          return;
        }

        djangoProcess = runDjangoProcess(pythonPath, djangoProjectPath);
        log.info('Processus Django démarré avec le PID :', djangoProcess.pid);
        resolve("Django process started");

      } catch (error) {
        log.error('Erreur lors du démarrage du processus Django :', error);
        app.quit();
      }
    });
  };
  
  app.on("activate", () => {
    log.info("App activated");
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  const cleanupAndExit = async (signal) => {
    if (isCleaningUp) return;
    isCleaningUp = true;

    log.info(`Received ${signal}. Cleaning up...`);

    if (djangoProcess && !djangoProcess.killed) {
      try {
        if (process.platform === 'win32') {
          // Utiliser taskkill pour Windows
          await new Promise((resolve, reject) => {
            exec(`taskkill /PID ${djangoProcess.pid} /T /F`, (err) => {
              if (err) {
                return reject(err);
              }
              resolve();
            });
          });
        } else {
          // Utiliser process.kill pour Unix/Linux
          process.kill(-djangoProcess.pid, 'SIGTERM'); // Tuer le groupe de processus
        }
        log.info('Processus Django et ses sous-processus terminés.');
      } catch (error) {
        log.error('Erreur lors de l\'arrêt du processus Django :', error);
      }
    } else {
      log.info('Aucun processus Django à terminer.');
    }
  }

  app.once('before-quit', async (event) => {
    if (isCleaningUp) return;
    isCleaningUp = true;

    log.info("Application en cours de fermeture, tentative d'arrêt du processus Django.");
    
    // Empêche Electron de quitter immédiatement
    event.preventDefault();
    
    try {
      await cleanupAndExit('before-quit');
    } catch (error) {
      log.error('Erreur durant le nettoyage :', error);
    }

    // Maintenant, permet à l'application de quitter
    app.quit();
  });

  await app.whenReady();
  await startDjango();
  createWindow();

  app.on("activate", () => {
    log.info("App activated");
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  app.on('window-all-closed', () => {
    log.info("All windows closed, quitting app");
    if (process.platform !== 'darwin') {
      cleanupAndExit('window-all-closed');
    }
  });
  
})();