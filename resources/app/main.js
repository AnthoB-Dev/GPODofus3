(async () => {
  const { app, BrowserWindow, shell, dialog } = require("electron");
  const { spawn } = require("child_process");
  const path = require("path");
  const fs = require("fs");
  const log = require("electron-log");
  const kill = require("tree-kill");
  const https = require("https");

  let mainWindow;
  let djangoProcess;
  let pythonPath;
  let stdOn = false; // Définir sur false pour désactiver la sortie standard
  let stdio;

  const executeCommand = (command, args) => {
    return new Promise((resolve, reject) => {
      const proc = spawn(command, args, { shell: true });
      let stdout = "";
      let stderr = "";

      proc.stdout.on("data", (data) => {
        stdout += data.toString();
      });

      proc.stderr.on("data", (data) => {
        stderr += data.toString();
      });

      proc.on("close", (code) => {
        if (code === 0) {
          resolve(stdout.trim());
        } else {
          reject(new Error(stderr.trim()));
        }
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
   * @returns {Promise<string>} pythonPath
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
          pythonPath = pyPath;
          return pythonPath;
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
      "Aucune version de Python 3.13 ou supérieure n'a été trouvée. Veuillez installer Python 3.13 ou une version ultérieure avant d'utiliser cette application. https://www.python.org/downloads/release/python-3130/"
    );
    app.quit();
  };

  // Fonction pour créer le virtual environment (venv)
  const createVenv = async (pythonPath) => {
    const venvPath = path.join(__dirname, "../../venv");
    log.info(`Chemin du virtual environment : ${venvPath}`);

    if (fs.existsSync(venvPath)) {
      log.info("Virtual environment déjà existant.");
      return venvPath;
    }

    try {
      log.info("Création du virtual environment...");
      await executeCommand(`"${pythonPath}"`, ["-m", "venv", venvPath]);
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
    return venvPath;
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

      pipPath = await getPipPath(venvPath);

      // Vérifier si pip a été installé correctement
      if (fs.existsSync(pipPath)) {
        log.info(`pip trouvé à : ${pipPath}`);
      } else {
        log.error(`pip.exe n'a pas pu être trouvé dans le venv à : ${pipPath}`);
        dialog.showErrorBox(
          "Erreur",
          `pip.exe n'a pas pu être trouvé dans le virtual environment à : ${pipPath}`
        );
        app.quit();
      }
    }

    const dependenciesInstalled = await areDependenciesInstalled(pipPath);
    if (dependenciesInstalled) {
      log.info("Toutes les dépendances sont déjà installées.");
      return;
    } else {
      try {
        log.info("Installation des dépendances avec pip...");
        await executeCommand(`"${pipPath}"`, [
          "install",
          "-r",
          path.join(__dirname, "requirements.txt"),
        ]);
        log.info("Dépendances installées avec succès.");
      } catch (error) {
        log.error(
          `Erreur lors de l'installation des dépendances : ${error.message}`
        );
        dialog.showErrorBox(
          "Erreur",
          `Erreur lors de l'installation des dépendances : ${error.message}`
        );
        app.quit();
      }
    }
  };

  // Fonction pour vérifier et configurer l'environnement
  const setupEnvironment = async () => {
    try {
      pythonPath = await selectPythonPath();
      const venvPath = await createVenv(pythonPath);
      await installDependencies(venvPath);
      pythonPath = path.join(venvPath, "Scripts", "python.exe");
      return pythonPath;
    } catch (error) {
      console.warn(
        "Erreur lors de la configuration de l'environnement :",
        error
      );
      dialog.showErrorBox(
        "Erreur",
        "Erreur lors de la configuration de l'environnement."
      );
      app.quit();
    }
  };

  // Fonction pour gérer les événements Squirrel
  const handleSquirrelEvent = () => {
    log.info(`process.argv: ${process.argv.join(" ")}`);

    if (process.argv.length === 1) {
      log.info("Aucun argument Squirrel détecté.");
      return false;
    }

    const squirrelEvent = process.argv[1];
    log.info(`Événement Squirrel détecté: ${squirrelEvent}`);

    return new Promise((resolve, reject) => {
      const ChildProcess = require("child_process");
      const appFolder = path.resolve(process.execPath, "..");
      const rootAtomFolder = path.resolve(appFolder, "..");
      const updateDotExe = path.resolve(
        path.join(rootAtomFolder, "Update.exe")
      );
      const exeName = path.basename(process.execPath);

      const spawn = (command, args) => {
        try {
          ChildProcess.spawn(command, args, { detached: true });
          log.info(`Spawned ${command} with args: ${args.join(" ")}`);
        } catch (error) {
          log.error(`Erreur lors du spawn de ${command}: ${error}`);
          reject(error);
        }
      };

      const spawnUpdate = (args) => {
        spawn(updateDotExe, args);
      };

      switch (squirrelEvent) {
        case "--squirrel-install":
          log.info("Traitement de l'événement --squirrel-install");
          spawnUpdate(["--createShortcut", exeName]);

          setupEnvironment()
            .then(() => {
              setTimeout(() => {
                app.quit();
                resolve(true);
              }, 1000);
            })
            .catch((error) => {
              log.error(
                `Erreur lors de la configuration de l'environnement: ${error}`
              );
              dialog.showErrorBox(
                "Erreur",
                "Erreur lors de la configuration de l'environnement."
              );
              app.quit();
              resolve(false);
            });
          return; // Terminer après traitement
        case "--squirrel-updated":
          log.info("Traitement de l'événement --squirrel-updated");
          spawnUpdate(["--createShortcut", exeName]);
          // Ajoutez ici des actions post-mise à jour si nécessaire
          setTimeout(() => {
            app.quit();
            resolve(true);
          }, 1000);
          return; // Terminer après traitement

        case "--squirrel-obsolete":
          log.info("Traitement de l'événement --squirrel-obsolete");
          app.quit();
          resolve(true);
          return; // Terminer après traitement

        default:
          log.warn(`Événement Squirrel inconnu: ${squirrelEvent}`);
          resolve(false);
          return; // Terminer après traitement
      }
    });
  };

  // Appeler la fonction pour gérer les événements Squirrel
  if (await handleSquirrelEvent()) {
    log.info(
      "Un événement Squirrel a été détecté et traité. L'exécution normale est interrompue."
    );
    // Un événement Squirrel a été détecté et traité
    // Ne pas continuer l'exécution normale
    return;
  }

  const gotTheLock = app.requestSingleInstanceLock();

  if (!gotTheLock) {
    app.quit();
  } else {
    app.on("second-instance", () => {
      if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.focus();
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
        pythonPath = await setupEnvironment();
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
            }
          } catch (error) {
            log.error("Erreur lors de l'arrêt du processus Django :", error);
          }
        });
      };

      // Fonction pour créer la fenêtre principale
      const createWindow = () => {
        log.info("- Création de la fenêtre principale.");

        mainWindow = new BrowserWindow({
          width: 1366,
          height: 768,
          resizable: true,
          minWidth: 1280,
          minHeight: 720,
          maxWidth: 1600,
          maxHeight: 900,
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
        await startDjango();
        createWindow();

        app.on("activate", () => {
          log.info("app.on_activate : Application activée.");
          if (BrowserWindow.getAllWindows().length === 0) createWindow();
        });
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
    });
  }
})();
