@echo off
setlocal enabledelayedexpansion
chcp 1252 >nul
echo ==========================================
echo = Début de l'installation
echo ==========================================
echo.

REM Définir le chemin vers les installateurs
set "INSTALLER_DIR=dependencies"

REM Obtenir le chemin du dossier contenant le script
set "SCRIPT_DIR=%~dp0"

REM Changer le répertoire courant vers le script directory
cd /d "!SCRIPT_DIR!"

echo.
echo ===============================
echo 1. Vérification de l'installation de Python...
echo ===============================
echo.

REM Vérifier si Python est installé
python --version >nul 2>&1
if "!errorlevel!" neq "0" (
    echo Installation de Python...
    cmd /c "!SCRIPT_DIR!!INSTALLER_DIR!\python-3.13.0-amd64.exe" /quiet InstallAllUsers=1 PrependPath=1
    set "PYTHON_EXIT_CODE=!errorlevel!"
    if "!PYTHON_EXIT_CODE!" neq "0" (
        echo Erreur lors de l'installation de Python.
        pause
        exit /b
    )
    echo.
    echo = Python Installé avec Succès
) else (
    echo Python est déjà installé.
)

echo.
echo ===============================
echo 2. Vérification de l'installation de Node.js...
echo ===============================
echo.

REM Vérifier si Node.js est installé
node --version >nul 2>&1
if "!errorlevel!" neq "0" (
    echo Installation de Node.js...
    cmd /c msiexec /i "!SCRIPT_DIR!!INSTALLER_DIR!\node-v22.11.0-x64.msi" /quiet
    set "NODE_EXIT_CODE=!errorlevel!"
    if "!NODE_EXIT_CODE!" neq "0" (
        echo Erreur lors de l'installation de Node.js.
        pause
        exit /b
    )
    echo.
    echo = Node.js Installé avec Succès
) else (
    echo Node.js est déjà installé.
)

echo.
echo ===============================
echo 3. Création de l'environnement virtuel...
echo ===============================
echo.

REM Créer l'environnement virtuel et rediriger les sorties vers un fichier log
python -m venv venv > venv_creation.log 2>&1
set "VENV_ERRORLEVEL=!errorlevel!"
if "!VENV_ERRORLEVEL!" neq "0" (
    echo Erreur lors de la création de l'environnement virtuel.
    echo Affichage du contenu de venv_creation.log:
    type venv_creation.log
    pause
    exit /b
)
echo = Environnement Virtuel Créé

echo.
echo ===============================
echo 4. Activation de l'environnement virtuel...
echo ===============================
echo.

REM Vérifier que activate.bat existe
if not exist "venv\Scripts\activate.bat" (
    echo Le fichier activate.bat est introuvable dans "venv\Scripts\".
    echo Contenu du répertoire Scripts :
    dir /b "venv\Scripts\"
    pause
    exit /b
)

REM Activer l'environnement virtuel
call "venv\Scripts\activate.bat"
if "!errorlevel!" neq "0" (
    echo Erreur lors de l'activation de l'environnement virtuel.
    pause
    exit /b
)
echo = Environnement Virtuel Activé

echo.
echo ===============================
echo 5. Installation des dépendances Python...
echo ===============================
echo.

REM Vérifier la présence de requirements.txt
if not exist "requirements.txt" (
    echo Le fichier requirements.txt est introuvable dans "!SCRIPT_DIR!".
    pause
    exit /b
)

REM Installer les dépendances Python via pip avec chemin absolu
"venv\Scripts\pip.exe" install -r "requirements.txt"
if "!errorlevel!" neq "0" (
    echo Erreur lors de l'installation des dépendances Python.
    pause
    exit /b
)
echo ===============================
echo = Dépendances Python Installées
echo ===============================

echo.
echo ===============================
echo 6. Installation des dépendances npm...
echo ===============================
echo.

REM Définir le répertoire courant
cd /d "!SCRIPT_DIR!"

REM Vérifier la présence de package.json
if not exist "package.json" (
    echo Le fichier package.json est introuvable dans "!SCRIPT_DIR!".
    pause
    exit /b
)

REM Installer les dépendances npm
call npm install
set "NPM_EXIT_CODE=!errorlevel!"
if "!NPM_EXIT_CODE!" gtr "1" (
    echo Erreur lors de l'installation des dépendances npm.
    pause
    exit /b
)
echo ===============================
echo = Dépendances npm Installées
echo ===============================

echo.
echo ===============================
echo 7. Désactivation de l'environnement virtuel...
echo ===============================
echo.

REM Désactiver l'environnement virtuel
call deactivate
if "!errorlevel!" neq "0" (
    echo Erreur lors de la désactivation de l'environnement virtuel.
    pause
    exit /b
)
echo ===============================
echo = Environnement Virtuel Désactivé
echo ===============================

echo.
echo ==========================================
echo = Installation terminée. Vous pouvez fermer ce terminal.
echo ==========================================
pause >nul & exit