const fs = require("fs");
const path = require("path");
const { app, BrowserWindow, shell, dialog } = require('electron');
const log = require("electron-log");

const { handleShortcuts, handleVenv, handlePyDependencies, ensureVenvExists } = require('./scripts/electron/squirrelEventsHandlers')
const { startDjango, closeDjango, killDjangoProcess } = require("./scripts/electron/djangoRelated");


const appFolder = path.resolve(process.execPath, '..');               // compilé ? C:\Users\USER\AppData\Local\GPODofus3\app-1.0.5\           : C:\Users\USER\AppData\Roaming\npm\node_modules\electron\dist
const rootFolder = path.resolve(appFolder, '..');                     // compilé ? C:\Users\USER\AppData\Local\GPODofus3\                     : C:\Users\USER\AppData\Roaming\npm\node_modules\electron\
const updateExe = path.resolve(path.join(rootFolder, 'Update.exe'));  // compilé ? C:\Users\USER\AppData\Local\GPODofus3\Update.exe           : C:\Users\USER\AppData\Roaming\npm\node_modules\electron\Update.exe
const gpodExec = path.basename(process.execPath);                     // compilé ?                                       GPOD3.exe            : electron.exe
const libsFolder = path.resolve(path.join(appFolder, "resources", "app", "libs"));


/**
 * Essaie de fermer toutes les fenêtres Electron puis tue les processus Node et Django.
 */
function terminate() {
  log.debug("=== Fn - terminate ===");

  try {
    // Arrête les processus externes, en l'occurence Django.
    log.info("Arrêt du serveur Django...");
    closeDjango();

    // Quitte proprement l'application Electron.
    log.info("Quitte l'application...");
    app.quit();
  } catch (error) {
    log.error("Erreur lors de la tentative de fermeture de l'application :", error);
  } finally {
    // Si tout échoue, force l'arrêt du processus Node.js.
    process.exit(0);
  }
}

async function deleteFolders(...folders) {
  log.debug("=== Fn - deleteFolders ===");

  const venvFolder = ensureVenvExists();

  if (!venvFolder) {
    throw new Error(`Echec de la suppression car le dossier venv n'existe pas.`);
  }

  const deletionPromises = folders.map(async (folder) => {
    if (fs.existsSync(folder)) {
      try {
        await fs.promises.rm(folder, { recursive: true, force: true });
        log.info(`Le dossier ${folder} a été supprimé avec succès.`);
      } catch (error) {
        throw new Error(`Erreur lors de la suppression du dossier ${folder} : ${error}`);
      }
    } else {
      log.warn(`Le dossier ${folder} n'existe pas.`);
    }
  });

  try {
    await Promise.all(deletionPromises);
    log.info("Tous les dossiers ont été supprimés avec succès.");
  } catch (error) {
    log.error(`Erreur lors de la suppression de dossiers : ${error.message}`);
    throw error;
  }
}

// Fonction pour gérer les événements Squirrel
function handleSquirrelEvent() {
  log.debug("=== Fn - handleSquirrelEvent ===");

  if (process.argv.length === 1) {
    return false; // Pas d'argument Squirrel, exécution normale.
  }

  const squirrelEvent = process.argv[1]; // Le 2ème argument est l'event Squirrel

  switch (squirrelEvent) {
    case '--squirrel-install':
    case '--squirrel-updated':
      log.debug(`handleSquirrelEvent : ${squirrelEvent}.`)

      if (!handleVenv(squirrelEvent)) {
        log.error("Échec lors de la gestion du venv. Interruption de l'installation.");
        
        terminate();
        return true;
      }

      if (!handleShortcuts(squirrelEvent)) {      
        log.error("Échec lors de la gestion des raccourcis.");
      }

      log.debug(`Processus ${squirrelEvent} terminé.`)
      terminate();
      return true;

    case '--squirrel-uninstall':
      log.debug(`handleSquirrelEvent : ${squirrelEvent}.`)

      handleShortcuts(squirrelEvent);
      // createProgressSave(); // TODO
      // removeGpodDirectories(); // TODO
      
      log.debug(`Processus ${squirrelEvent} terminé.`)
      
      terminate();
      return true;

    case '--squirrel-obsolete':
      terminate();
      return true;

    case '--squirrel-firstrun':
      log.debug(`handleSquirrelEvent : ${squirrelEvent}.`)

      app.whenReady().then(() => {
        log.debug("Application prête. Execution de handleFirstRun...");
        handleFirstRun().then(() => {
          // TODO : Retirer le Python embarqué
          log.debug("handleFirstRun complété.");
        }).catch((err) => {
          log.error("Une erreur est survenue durant handleFirstRun:", err);
          terminate();
        });
      });

      return true;
      
    default:
      return false; // Si aucun événement n'est détecté, continue le flux normal.
  }
}

// Appel la fonction de gestion des événements Squirrel
if (handleSquirrelEvent()) {
  // Si handleSquirrelEvent retourne "true", app.quit() a déjà été appelé.
  // Le flux d'exécution est terminé.
  return;
}

/**
 * Lancée lors de l'évenement squirrel-firstrun et continue l'installation des éléments manquants.\
 * Il m'était impossible de procéder à l'installation complète lors de squirrel-install car je cite : "I think people who are running >15sec hooks on install are Doing It Wrong". https://github.com/Squirrel/Squirrel.Windows/issues/501#issuecomment-158862334 - Rends moi mes jours perdus stp.
 * - Ouvre la fenêtre installateur, installe les dépendances Python puis si aucune erreur n'est présente, ouvre la fenêtre principale.
 */
async function handleFirstRun() {
  log.debug("=== Fn - handleFirstRun ===")
  
  await createInstallerWindow();

  try {
    const checkPyDependencies = await handlePyDependencies();
    if (!checkPyDependencies) {
      log.error("handlePyDependencies à retourner `false`.")
      return false;
    }

    window.close();
    window = null;

    if (!startDjango()) {
      log.error("Le serveur Django ne peut démarré.")
      terminate();
      return false;
    }
    
    createWindow();

  } catch (error) {
    log.error("Une exception est survenue lors de handleFirstRun :", error);
  }
}

/**
 * Fenêtre d'installation.
 */
function createInstallerWindow() {
  log.debug("=== Fn - createInstallerWindow ===")
  return new Promise((resolve) => {
    log.info("Création de la fenêtre d'installation.")
    
    window = new BrowserWindow({
      width: 445,
      height: 68,
      resizable: false,
      autoHideMenuBar: true,
      show: false,
      frame: false,
      focusable: true,
      icon: path.join(__dirname, "staticfiles", "medias", "icons", "favicons", "icon.ico"),
    })
  
    window.loadURL(path.join(__dirname, "app", "templates", "pages", "installer.html"));

    window.once("ready-to-show", () => {
      log.info("Fenêtre prête à être affichée.");
      window.show();
      setTimeout(() => window.focus(), 200); // Ajoute un léger délai pour assurer le focus
      resolve();
    });

    // Gestion des erreurs éventuelles
    window.webContents.once("did-fail-load", (event, errorCode, errorDescription) => {
      log.error(`Échec du chargement de la fenêtre d'installation : ${errorDescription}`);
      reject(new Error(`Erreur de chargement : ${errorDescription}`));
    });
  })
}

function createSplashScreenWindow() {
  log.debug("=== Fn - createSplashScreenWindow ===")
  log.info("Création de la fenêtre d'installation.")
  
  splash = new BrowserWindow({
    width: 350,
    height: 450,
    resizable: false,
    autoHideMenuBar: true,
    frame: false, 
    alwaysOnTop: true,
    backgroundColor: "#202020",
    icon: path.join(__dirname, "staticfiles", "medias", "icons", "favicons", "icon.ico"),
  })

  splash.loadURL(path.join(__dirname, "app", "templates", "pages", "splashScreen.html"));
  splash.center();

  return splash;
}

/**
 * Créer la fenêtre principale de l'application.
 */
function createWindow() {
  log.debug("=== Fn - createWindow ===");
  log.info("Création de la fenêtre principale.");

  mainWindow = new BrowserWindow({
    width: 1600,
    height: 900,
    resizable: true,
    minWidth: 1280,
    minHeight: 720,
    autoHideMenuBar: true,
    icon: path.join(__dirname, "staticfiles", "medias", "icons", "favicons", "icon.ico"),
    show: false,
    backgroundColor: "#202020",
    
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      sandbox: true,
    },
  });

  mainWindow.loadURL("http://localhost:8000/");

  const splash = createSplashScreenWindow();

  mainWindow.once("ready-to-show", () => {
    log.info("Fenêtre prête à être affichée.");
    splash.close();
    mainWindow.show();
  });

  mainWindow.on("close", () => {
    log.info("Fermeture de la fenêtre principale.");
    mainWindow = null;
    terminate();
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  // Suppression complet du menu
  mainWindow.setMenu(null);

  log.info("Fenêtre principale créée. Fin du processus.");
};

app.whenReady().then(() => {
  const isFirstRun = process.argv.includes('--squirrel-firstrun');

  if (isFirstRun) {
    handleFirstRun();
  } else {
    if (!startDjango()) {
      log.error("Le serveur Django ne peut démarrer.")
      dialog.showErrorBox(
        "[Critique] Le serveur Django ne peut démarrer",
        "Le serveur n'est pas parvenu à démarrer. Impossible de lancer GPOD3."
      );
      terminate();
    }
    createWindow();
  }
  
  app.on("activate", () => {
    log.info("app.on_activate : Application activée.");
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("quit", async () => {
  log.info("app.on_quit : L'application s'est fermée.");
});