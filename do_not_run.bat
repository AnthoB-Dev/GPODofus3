@echo off
setlocal enabledelayedexpansion
chcp 1252 >nul
echo ==========================================
echo = Dbut de l'installation
echo ==========================================
echo.

REM Dfinir le chemin vers les installateurs
set "INSTALLER_DIR=dependencies"

REM Obtenir le chemin du dossier contenant le script
set "SCRIPT_DIR=%~dp0"

REM Changer le rpertoire courant vers le script directory
cd /d "!SCRIPT_DIR!"

echo.
echo ===============================
echo 1. Vrification de l'installation de Python...
echo ===============================
echo.

REM Vrifier si Python est install
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
    echo = Python Install avec Succs
) else (
    echo Python est dj install.
)

echo.
echo ===============================
echo 2. Vrification de l'installation de Node.js...
echo ===============================
echo.

REM Vrifier si Node.js est install
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
    echo = Node.js Install avec Succs
) else (
    echo Node.js est dj install.
)

echo.
echo ===============================
echo 3. Cration de l'environnement virtuel...
echo ===============================
echo.

REM Crer l'environnement virtuel et rediriger les sorties vers un fichier log
python -m venv venv > venv_creation.log 2>&1
set "VENV_ERRORLEVEL=!errorlevel!"
if "!VENV_ERRORLEVEL!" neq "0" (
    echo Erreur lors de la cration de l'environnement virtuel.
    echo Affichage du contenu de venv_creation.log:
    type venv_creation.log
    pause
    exit /b
)
echo = Environnement Virtuel Cr

echo.
echo ===============================
echo 4. Activation de l'environnement virtuel...
echo ===============================
echo.

REM Vrifier que activate.bat existe
if not exist "venv\Scripts\activate.bat" (
    echo Le fichier activate.bat est introuvable dans "venv\Scripts\".
    echo Contenu du rpertoire Scripts :
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
echo = Environnement Virtuel Activ

echo.
echo ===============================
echo 5. Installation des dpendances Python...
echo ===============================
echo.

REM Vrifier la prsence de requirements.txt
if not exist "requirements.txt" (
    echo Le fichier requirements.txt est introuvable dans "!SCRIPT_DIR!".
    pause
    exit /b
)

REM Installer les dpendances Python via pip avec chemin absolu
"venv\Scripts\pip.exe" install -r "requirements.txt"
if "!errorlevel!" neq "0" (
    echo Erreur lors de l'installation des dpendances Python.
    pause
    exit /b
)
echo ===============================
echo = Dpendances Python Installes
echo ===============================

echo.
echo ===============================
echo 6. Installation des dpendances npm...
echo ===============================
echo.

REM Dfinir le rpertoire courant
cd /d "!SCRIPT_DIR!"

REM Vrifier la prsence de package.json
if not exist "package.json" (
    echo Le fichier package.json est introuvable dans "!SCRIPT_DIR!".
    pause
    exit /b
)

REM Installer les dpendances npm
call npm install
set "NPM_EXIT_CODE=!errorlevel!"
if "!NPM_EXIT_CODE!" gtr "1" (
    echo Erreur lors de l'installation des dpendances npm.
    pause
    exit /b
)
echo ===============================
echo = Dpendances npm Installes
echo ===============================

echo.
echo ===============================
echo 7. Dsactivation de l'environnement virtuel...
echo ===============================
echo.

REM Dsactiver l'environnement virtuel
call deactivate
if "!errorlevel!" neq "0" (
    echo Erreur lors de la dsactivation de l'environnement virtuel.
    pause
    exit /b
)
echo ===============================
echo = Environnement Virtuel Dsactiv
echo ===============================

echo.
echo ==========================================
echo = Installation termine. Vous pouvez fermer ce terminal.
echo ==========================================
pause >nul & exit