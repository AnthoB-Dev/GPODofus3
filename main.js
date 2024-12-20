(async () => {
  const { app, BrowserWindow, shell, dialog } = require("electron");
  const { autoUpdater } = require('electron-updater');
  const { spawn } = require("child_process");
  const path = require("path");
  const fs = require("fs");
  const log = require("electron-log");
  const kill = require("tree-kill");
  const https = require("https");

  let mainWindow;
  let djangoProcess;
  let globalPythonPath;
  let stdOn = false; // Définir sur false pour désactiver la sortie standard
  let stdio;
  const installationMarker = path.join(app.getPath('userData'), '.installation_complete');

  log.info(`Arguments de lancement : ${process.argv.join(' ')}`);

  const handleSquirrelEvent = async () => {
    if (process.argv.length > 1) {
      const squirrelEvent = process.argv[1];
      log.info(`Événement Squirrel détecté : ${squirrelEvent}`);
  
      const appFolder = path.resolve(process.execPath, '..');
      const rootFolder = path.resolve(appFolder, '..');
      const updateExe = path.resolve(path.join(rootFolder, 'Update.exe'));
      const exeName = path.basename(process.execPath);
  
      const spawnUpdate = function(args) {
        let spawnedProcess;
        try {
          spawnedProcess = spawn(updateExe, args, { detached: true });
          spawnedProcess.on('close', (code) => {
            log.info(`Update.exe terminé avec le code ${code}`);
          });
        } catch (error) {
          log.error(`Erreur lors de l'exécution de Update.exe avec les arguments ${args}:`, error);
        }
        return spawnedProcess;
      };

      if (squirrelEvent === '--squirrel-firstrun') {
        log.info("Événement --squirrel-firstrun détecté.");
      
      
        if (!fs.existsSync(installationMarker)) {
          log.info("Installation incomplète lors du premier lancement, attente de l'installation.");
          // Attendre ou exécuter à nouveau l'installation si nécessaire
          await runInstaller();
        }
      
        // Laisser l'application continuer à démarrer normalement
        return false;
      }
  
      if (squirrelEvent === '--squirrel-install' || squirrelEvent === '--squirrel-updated') {
        // Création des raccourcis
        spawnUpdate(['--createShortcut', exeName]);
      
        try {
          log.info("Démarrage de l'installation...");
          await runInstaller();
          log.info("Installation terminée.");
      
          // Redémarrer manuellement l'application après l'installation
          const spawnOptions = {
            detached: true,
            stdio: 'ignore'
          };
          const child = spawn(process.execPath, [], spawnOptions);
          child.unref();
      
        } catch (error) {
          log.error(`Erreur lors de l'installation : ${error.message}`);
          dialog.showErrorBox(
            "Erreur",
            `Erreur lors de l'installation : ${error.message}`
          );
        } finally {
          app.quit();
        }
        return true;
      }
  
      if (squirrelEvent === '--squirrel-uninstall') {
        // Suppression des raccourcis
        spawnUpdate(['--removeShortcut', exeName]);
  
        // Suppression des dossiers spécifiques avec réessai
        try {
          // Fonction de réessai
          const deletePathWithRetry = (targetPath, retries = 3, delay = 1000) => {
            return new Promise((resolve, reject) => {
              const attemptDelete = (currentAttempt) => {
                if (!fs.existsSync(targetPath)) {
                  log.info(`Le dossier n'existe pas : ${targetPath}`);
                  return resolve();
                }
                try {
                  fs.rmSync(targetPath, { recursive: true, force: true });
                  log.info(`Dossier supprimé : ${targetPath}`);
                  resolve();
                } catch (error) {
                  if (currentAttempt < retries) {
                    log.warn(`Tentative ${currentAttempt + 1} échouée pour supprimer ${targetPath}. Nouvelle tentative dans ${delay}ms.`);
                    setTimeout(() => attemptDelete(currentAttempt + 1), delay);
                  } else {
                    reject(error);
                  }
                }
              };
              attemptDelete(0);
            });
          };
  
          // Chemin vers AppData\Local\GPODofus3
          const localAppDataPath = path.join(process.env.LOCALAPPDATA, 'GPODofus3');
          // Chemin vers AppData\Roaming\GPODofus3
          const appDataPath = path.join(process.env.APPDATA, 'GPODofus3');
  
          await deletePathWithRetry(localAppDataPath);
          await deletePathWithRetry(appDataPath);
        } catch (error) {
          log.error(`Erreur lors de la suppression des dossiers : ${error}`);
        }
  
        app.quit();
        return true;
      }
  
      if (squirrelEvent === '--squirrel-obsolete') {
        app.quit();
        return true;
      }
    }
    return false;
  };

  const executeCommand = (command, args) => {
    return new Promise((resolve, reject) => {
      const proc = spawn(command, args, { shell: true });
      let stdout = "";
      let stderr = "";
  
      proc.stdout.on("data", (data) => {
        const output = data.toString();
        stdout += output;
        log.info(`stdout: ${output}`);
      });
  
      proc.stderr.on("data", (data) => {
        const errorOutput = data.toString();
        stderr += errorOutput;
        log.error(`stderr: ${errorOutput}`);
      });
  
      proc.on("close", (code) => {
        log.info(`Processus terminé avec le code ${code}`);
        if (code === 0) {
          resolve(stdout.trim());
        } else {
          const errorMessage = `Commande "${command} ${args.join(' ')}" échouée avec le code ${code}`;
          log.error(errorMessage);
          reject(new Error(stderr.trim() || errorMessage));
        }
      });
  
      proc.on("error", (err) => {
        log.error(`Erreur lors de l'exécution de la commande : ${err.message}`);
        reject(err);
      });
    });
  };

  // Fonction pour extraire la version de Python à partir de la sortie
  const getPythonVersion = (versionOutput) => {
    const match = versionOutput.match(/Python (\d+)\.(\d+)\.(\d+)/);
    if (match) {
      const major = parseInt(match[1], 10);
      const minor = parseInt(match[2], 10);
      const patch = parseInt(match[3], 10);
      return { major, minor, patch };
    }
    return null;
  };

  // Fonction pour trouver tous les chemins de Python
  const findAllPythonPaths = async () => {
    try {
      const pythonPathsRaw = await executeCommand("where", ["python"]);
      const pythonPaths = pythonPathsRaw
        .split("\n")
        .map((p) => p.trim())
        .filter((p) => p.length > 0);
      log.info(`Un ou plusieurs chemins Python trouvé.`);
      return pythonPaths;
    } catch (error) {
      log.error("Erreur lors de la recherche de Python :", error.message);
      return [];
    }
  };

  // Fonction pour sélectionner le meilleur Python (>= 3.13)
  /**
   * @returns {Promise<string>} globalPythonPath (chemin global)
   */
  const selectPythonPath = async () => {
    const pythonPaths = await findAllPythonPaths();
    for (const pyPath of pythonPaths) {
      try {
        const versionOutput = await executeCommand(`"${pyPath}"`, [
          "--version",
        ]);
        log.info(`Version détectée pour ${pyPath} : ${versionOutput}`);
        const version = getPythonVersion(versionOutput);
        if (
          version &&
          (version.major > 3 || (version.major === 3 && version.minor >= 13))
        ) {
          log.info(
            `__ Python approprié trouvé : (Version ${version.major}.${version.minor}.${version.patch})`
          );
          globalPythonPath = pyPath;
          return globalPythonPath;
        } else {
          log.warn(
            `__ Python non approprié trouvé : (Version ${
              version
                ? `${version.major}.${version.minor}.${version.patch}`
                : "Inconnue"
            })`
          );
        }
      } catch (error) {
        log.warn(
          `Impossible de déterminer la version de Python à ${pyPath} :`,
          error.message
        );
      }
    }

    // Si aucun Python approprié n'est trouvé
    dialog.showErrorBox(
      "Erreur de version de Python",
      "Aucune version de Python 3.13 ou supérieure n'a été trouvée. Veuillez installer Python 3.13 ou une version ultérieure avant d'utiliser cette application. Ouverture de la page de téléchargement de Python..."
    );
    link = "https://www.python.org/downloads/release/python-3130/";
    setTimeout(() => {
      shell.openExternal(link);
    }, 3000);
    app.quit();
  };

  const getVenvPath = () => {
    return path.join(__dirname, "../../venv");
  }

  /**
   * Fonction pour créer le virtual environment (venv)
   * @param {globalPythonPath} globalPythonPath 
   * @returns {Promise<string>} venvPath
   */
  const createVenv = async (globalPythonPath) => {
    const venvPath = getVenvPath();
    log.info(`Chemin du virtual environment : ${venvPath}`);

    if (fs.existsSync(venvPath)) {
      log.info("Virtual environment déjà existant.");
      return venvPath;
    }

    try {
      log.info("Création du virtual environment...");
      await executeCommand(`"${globalPythonPath}"`, ["-m", "venv", venvPath]);
      log.info("Virtual environment créé avec succès.");
      return venvPath;
    } catch (error) {
      log.error(`Erreur lors de la création du venv : ${error.message}`);
      dialog.showErrorBox(
        "Erreur",
        `Erreur lors de la création du virtual environment : ${error.message}`
      );
      app.quit();
    }
  };

  const getPipPath = async (venvPath) => {
    return new Promise((resolve, reject) => {
      try {
        const ensurePipOutput = executeCommand(
          `"${path.join(venvPath, "Scripts", "python.exe")}"`,
          ["-m", "ensurepip", "--upgrade"]
        );
        log.info(`Sortie de ensurepip : ${ensurePipOutput}`);
      } catch (ensurepipError) {
        log.warn(
          "Installation de pip via ensurepip a échoué. Essai avec get-pip.py..."
        );

        const getPipPath = path.join(venvPath, "get-pip.py");

        // Télécharger get-pip.py
        const file = fs.createWriteStream(getPipPath);
        https
          .get("https://bootstrap.pypa.io/get-pip.py", (response) => {
            response.pipe(file);
            file.on("finish", () => {
              file.close(resolve);
            });
          })
          .on("error", (err) => {
            fs.unlinkSync(getPipPath);
            reject(err);
          });

        // Exécuter get-pip.py
        executeCommand(`"${path.join(venvPath, "Scripts", "python.exe")}"`, [
          getPipPath,
        ]);
        log.info("pip installé avec succès via get-pip.py");

        // Supprimer get-pip.py après installation
        fs.unlinkSync(getPipPath);

        // Réinitialiser pipPath après installation
        return (pipPath = path.join(venvPath, "Scripts", "pip.exe"));
      }
    });
  };

  // Fonction pour vérifier si les dépendances sont déjà installées
  const areDependenciesInstalled = async (pipPath) => {
    try {
      log.info("Vérification des dépendances avec pip freeze...");
      const installedPackagesRaw = await executeCommand(`"${pipPath}"`, [
        "freeze",
      ]);
      const installedPackages = installedPackagesRaw
        .split("\n")
        .map((line) => line.trim().toLowerCase());
      const requirements = fs
        .readFileSync(path.join(__dirname, "requirements.txt"), "utf-8")
        .split("\n")
        .map((line) => line.trim().toLowerCase());
      for (const requirement of requirements) {
        if (requirement && !installedPackages.includes(requirement)) {
          log.info(`Dépendance ${requirement} manquante.`);
          return false;
        }
      }
      return true;
    } catch (error) {
      log.error(
        `Erreur lors de la vérification des dépendances : ${error.message}`
      );
      return false;
    }
  };

  // Fonction pour installer les dépendances du venv
  const installDependencies = async (venvPath) => {
    let pipPath = path.join(venvPath, "Scripts", "pip.exe");
  
    log.info(`Vérification de pip à : ${pipPath}`);
  
    if (!fs.existsSync(pipPath)) {
      log.error(`pip.exe introuvable dans le venv à : ${pipPath}`);
      log.info("Installation de pip dans le virtual environment...");
  
      try {
        pipPath = await getPipPath(venvPath);
        log.info(`pip installé à : ${pipPath}`);
      } catch (error) {
        log.error(`Erreur lors de l'installation de pip : ${error.message}`);
        dialog.showErrorBox(
          "Erreur",
          `Erreur lors de l'installation de pip : ${error.message}`
        );
        app.quit();
        return;
      }
  
      if (!fs.existsSync(pipPath)) {
        log.error(`pip.exe n'a pas pu être trouvé après installation à : ${pipPath}`);
        dialog.showErrorBox(
          "Erreur",
          `pip.exe n'a pas pu être trouvé dans le virtual environment à : ${pipPath}`
        );
        app.quit();
        return;
      }
    }
  
    const dependenciesInstalled = await areDependenciesInstalled(pipPath);
    if (dependenciesInstalled) {
      log.info("Toutes les dépendances sont déjà installées.");
      return;
    } else {
      try {
        log.info("Installation des dépendances avec pip...");
        log.info(`Commande exécutée : "${pipPath}" install --no-cache-dir -r ${path.join(__dirname, "requirements.txt")}`);
        await executeCommand(pipPath, [
          "install",
          "--no-cache-dir",
          "-r",
          path.join(__dirname, "requirements.txt"),
        ]);
        log.info("Dépendances installées avec succès.");
      } catch (error) {
        log.error(
          `Erreur lors de l'installation des dépendances : ${error.message}`
        );
        log.error(`Détails de l'erreur : ${error.stack}`);
        dialog.showErrorBox(
          "Erreur",
          `Erreur lors de l'installation des dépendances : ${error.message}. Réessayez de lancer l'installateur en tant qu'administrateur.`
        );
        app.quit();
      }
    }
  };

  const getVenvPythonPath = (venvPath) => {
    return path.join(venvPath, "Scripts", "python.exe");
  }

  const runInstaller = async () => {
    
    try {
      globalPythonPath = await selectPythonPath();
      await createVenv(globalPythonPath);
      await installDependencies(getVenvPath());
      log.info("Environnement configuré avec succès.");
    } catch (error) {
      log.error("Erreur lors de la configuration de l'environnement :", error);
      dialog.showErrorBox(
        "Erreur",
        "Erreur lors de la configuration de l'environnement."
      );
      app.quit();
    }
  };

  // Appeler la fonction pour gérer les événements Squirrel
  if (await handleSquirrelEvent()) {
    // L'événement Squirrel a été traité, on arrête l'exécution
    return;
  }

  // Fonction pour exécuter le processus Django
  const runDjangoProcess = (pythonPath, djangoProjectPath) => {
    const managePyPath = path.join(djangoProjectPath, "manage.py");

    log.info("- Lancement du processus Django.");
    log.info(`Chemin Python utilisé : ${pythonPath}`);
    log.info(`Chemin manage.py utilisé : ${managePyPath}`);

    stdOn ? (stdio = "pipe") : (stdio = "ignore");

    const django = spawn(pythonPath, ["manage.py", "runserver"], {
      cwd: djangoProjectPath,
      shell: false,
      stdio: stdio,
    });

    log.info("Django process spawned.");

    if (stdOn) {
      // Capture de la sortie standard
      django.stdout.on("data", (data) => {
        log.info(`Django stdout : ${data}`);
      });

      // Capture de la sortie d'erreur
      django.stderr.on("data", (data) => {
        log.error(`Django stderr : ${data}`);
      });
    }

    django.on("error", (err) => {
      log.error("Échec du démarrage du processus Django :", err);
      dialog.showErrorBox(
        "Erreur",
        "Échec du démarrage du serveur Django."
      );
      app.quit();
    });

    django.on("exit", (code) => {
      if (code !== 0) {
        log.error(`Le processus Django s'est terminé avec le code ${code}`);
        dialog.showErrorBox(
          "Erreur",
          `Le serveur Django s'est arrêté avec le code ${code}.`
        );
      }
      log.info("Processus Django terminé.");
      app.quit();
    });

    return django;
  };

  // Fonction pour démarrer Django
  const startDjango = async () => {
    log.info("- Démarrage de Django. Début du processus.");
    pythonPath = getVenvPythonPath(getVenvPath());
    log.info(`__Python_path : ${pythonPath}`);

    try {
      const djangoProjectPath = path.join(__dirname);
      log.info(`__Django_project_path : ${djangoProjectPath}`);
      djangoProcess = runDjangoProcess(pythonPath, djangoProjectPath);
      log.info("Processus Django démarré avec le PID :", djangoProcess.pid);
    } catch (error) {
      log.error("Erreur lors du démarrage du processus Django :", error);
      dialog.showErrorBox(
        "Erreur",
        "Erreur lors du démarrage du serveur Django."
      );
      app.quit();
    }
  };

  // Fonction pour arrêter Django
  const killDjangoProcess = () => {
    return new Promise((resolve, reject) => {
      try {
        if (djangoProcess && !djangoProcess.killed) {
          log.info("Arrêt du processus Django.");
          kill(djangoProcess.pid, "SIGTERM", (err) => {
            if (err) {
              log.error(
                "Erreur lors de l'arrêt du processus Django :",
                err
              );
              reject(err);
            } else {
              log.info("Processus Django arrêté avec succès.");
              resolve();
            }
          });
        } else {
          log.info("Aucun processus Django actif à arrêter.");
          resolve();
        }
      } catch (error) {
        log.error("Erreur lors de l'arrêt du processus Django :", error);
        reject(error);
      }
    });
  };

  // Fonction pour créer la fenêtre principale
  const createWindow = () => {
    log.info("- Création de la fenêtre principale.");

    mainWindow = new BrowserWindow({
      width: 1600,
      height: 900,
      resizable: true,
      minWidth: 1280,
      minHeight: 720,
      maxWidth: 1920,
      maxHeight: 1080,
      autoHideMenuBar: true,
      icon: path.join(__dirname, "app.ico"),
      
      webPreferences: {
        preload: path.join(__dirname, "preload.js"),
        nodeIntegration: false,
        contextIsolation: true,
        enableRemoteModule: false,
        sandbox: true,
      },
    });

    mainWindow.loadURL("http://localhost:8000/");

    mainWindow.on("close", () => {
      log.info("- Fermeture de la fenêtre principale.");
      mainWindow = null;
    });

    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
      shell.openExternal(url);
      return { action: "deny" };
    });

    // Supprimer complètement le menu
    mainWindow.setMenu(null);

    log.info("Fenêtre principale créée. Fin du processus.");
  };

  // Gérer les événements de l'application
  app.whenReady().then(async () => {
    autoUpdater.checkForUpdatesAndNotify();
    await startDjango();
    createWindow();

    app.on("activate", () => {
      log.info("app.on_activate : Application activée.");
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });

  autoUpdater.on('checking-for-update', () => {
    console.log('Vérification des mises à jour...');
  });

  autoUpdater.on('update-available', (info) => {
    console.log('Nouvelle mise à jour disponible :', info);
  });

  autoUpdater.on('update-not-available', (info) => {
    console.log('Pas de mise à jour disponible.');
  });

  autoUpdater.on('error', (err) => {
    console.error('Erreur pendant la mise à jour :', err);
  });

  autoUpdater.on('update-downloaded', (info) => {
    console.log('Mise à jour téléchargée. Elle sera installée au prochain démarrage.');
    autoUpdater.quitAndInstall(); // Redémarre l'application pour installer la mise à jour
  });

  app.on("window-all-closed", () => {
    log.info(
      "app.on_window-all-closed : Toutes les fenêtres sont fermées."
    );
    if (process.platform !== "darwin") {
      app.quit();
    }
  });

  app.on("before-quit", async () => {
    log.info(
      "app.on_before-quit : Tentative de fermeture de l'application, arrêt du processus Django."
    );
    await killDjangoProcess();
  });

  app.on("quit", async () => {
    log.info("app.on_quit : L'application s'est fermée.");
  });

  // Gestion des signaux de terminaison
  process.on("SIGINT", async () => {
    log.info("SIGINT reçu, fermeture de l'application.");
    await killDjangoProcess();
    app.quit();
  });

  process.on("SIGTERM", async () => {
    log.info("SIGTERM reçu, fermeture de l'application.");
    await killDjangoProcess();
    app.quit();
  });
})();
