@echo off
setlocal enabledelayedexpansion

REM Gerer le redemarrage a une etape specifique
if "%1" neq "" (
    set "STEP=%1"
) else (
    set "STEP=0"
)

if "%STEP%" leq "0" (
    echo ==========================================
    echo = Debut de l'installation
    echo ==========================================
    echo.
)

REM Definir le chemin vers les installateurs
set "INSTALLER_DIR=dependencies"

REM Obtenir le chemin du dossier contenant le script
set "CURRENT_DIR=%~dp0"

REM Obtenir le dossier parent
for %%I in ("%CURRENT_DIR%..") do set "SCRIPT_DIR=%%~fI"

REM Afficher le résultat pour vérifier
echo SCRIPT_DIR=%SCRIPT_DIR%

REM Changer le repertoire courant vers le script directory
cd /d "%SCRIPT_DIR%"

REM etape 1 : Verification de Python
if "%STEP%" leq "1" (
    echo ===============================
    echo 1. Verification de l'installation de Python...
    echo ===============================
    echo.

    REM Verifier si Python est installe
    python --version >python_version.txt 2>&1
    if "!errorlevel!" neq "0" (
        echo Python n'est pas installe. Lancement de l'installation...
        cmd /c "%SCRIPT_DIR%%INSTALLER_DIR%\python-3.13.0-amd64.exe" /quiet InstallAllUsers=1 PrependPath=1
        set "PYTHON_EXIT_CODE=!errorlevel!"
        if "!PYTHON_EXIT_CODE!" neq "0" (
            echo Erreur lors de l'installation de Python.
            pause
            exit /b
        )
        echo = Python Installe avec Succes
    ) else (
        REM Lire la version installee de Python
        for /f "tokens=2 delims= " %%A in ('type python_version.txt') do set "PYTHON_VERSION=%%A"

        REM Separer la version en ses parties majeures, mineures et patch
        for /f "tokens=1-3 delims=." %%A in ("!PYTHON_VERSION!") do (
            set "PYTHON_MAJOR=%%A"
            set "PYTHON_MINOR=%%B"
            set "PYTHON_PATCH=%%C"
        )

        echo Version actuelle de Python : !PYTHON_MAJOR!.!PYTHON_MINOR!.!PYTHON_PATCH!

        REM Comparer les versions
        if "!PYTHON_MAJOR!" lss "3" (
            echo Version Python trop ancienne. Lancement de l'installation...
            goto install_python
        ) else if "!PYTHON_MAJOR!"=="3" (
            if "!PYTHON_MINOR!" lss "13" (
                echo Version Python trop ancienne. Lancement de l'installation...
                goto install_python
            )
        )
        echo Python est deja installe avec une version suffisante.
    )

    goto step2

    :install_python
    cmd /c "%SCRIPT_DIR%%INSTALLER_DIR%\python-3.13.0-amd64.exe" /quiet InstallAllUsers=1 PrependPath=1
    set "PYTHON_EXIT_CODE=!errorlevel!"
    if "!PYTHON_EXIT_CODE!" neq "0" (
        echo Erreur lors de l'installation de Python.
        pause
        exit /b
    )
    echo = Python Installe avec Succes
)

:step2
REM etape 2 : Verification de Node.js
if "%STEP%" leq "2" (
    echo ===============================
    echo 2. Verification de l'installation de Node.js...
    echo ===============================
    echo.

    node --version >nul 2>&1
    if "!errorlevel!" neq "0" (
        echo Installation de Node.js...
        cmd /c msiexec /i "%SCRIPT_DIR%%INSTALLER_DIR%\node-v22.11.0-x64.msi" /quiet
        set "NODE_EXIT_CODE=!errorlevel!"
        if "!NODE_EXIT_CODE!" neq "0" (
            echo Erreur lors de l'installation de Node.js.
            pause
            exit /b
        )
        echo.
        echo = Node.js Installe avec Succes
        echo Redemarrage du script a l'etape suivante...
        start "" "%~dpnx0" 3
        exit /b
    ) else (
        echo Node.js est deja installe.
    )
)

echo.
echo ===============================
echo 3. Creation de l'environnement virtuel...
echo ===============================
echo.

REM Creer l'environnement virtuel et rediriger les sorties vers un fichier log
python -m venv venv
set "VENV_ERRORLEVEL=!errorlevel!"
if "!VENV_ERRORLEVEL!" neq "0" (
    echo Erreur lors de la creation de l'environnement virtuel.
    echo Affichage du contenu de venv_creation.log:
    type venv_creation.log
    pause
    exit /b
)
echo = Environnement Virtuel Cree

echo.
echo ===============================
echo 4. Activation de l'environnement virtuel...
echo ===============================
echo.

REM Verifier que activate.bat existe
if not exist "venv\Scripts\activate.bat" (
    echo Le fichier activate.bat est introuvable dans "venv\Scripts\".
    echo Contenu du repertoire Scripts :
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
echo = Environnement Virtuel Active

echo.
echo ===============================
echo 5. Installation des dependances Python...
echo ===============================
echo.

REM Verifier la presence de requirements.txt
if not exist "requirements.txt" (
    echo Le fichier requirements.txt est introuvable dans "!SCRIPT_DIR!".
    pause
    exit /b
)

REM Installer les dependances Python via pip avec chemin absolu
"venv\Scripts\pip.exe" install -r "requirements.txt"
if "!errorlevel!" neq "0" (
    echo Erreur lors de l'installation des dependances Python.
    pause
    exit /b
)
echo ===============================
echo = Dependances Python Installees
echo ===============================

echo.
echo ===============================
echo 6. Installation des dependances npm...
echo ===============================
echo.

REM Definir le repertoire courant
cd /d "!SCRIPT_DIR!"

REM Verifier la presence de package.json
if not exist "package.json" (
    echo Le fichier package.json est introuvable dans "!SCRIPT_DIR!".
    pause
    exit /b
)

REM Installer les dependances npm
call npm install --omit=dev
set "NPM_EXIT_CODE=!errorlevel!"
if "!NPM_EXIT_CODE!" gtr "1" (
    echo Erreur lors de l'installation des dependances npm.
    pause
    exit /b
)
echo ===============================
echo = Dependances npm Installees
echo ===============================

echo.
echo ===============================
echo 7. Desactivation de l'environnement virtuel...
echo ===============================
echo.

REM Desactiver l'environnement virtuel
call deactivate
if "!errorlevel!" neq "0" (
    echo Erreur lors de la desactivation de l'environnement virtuel.
    pause
    exit /b
)
echo ===============================
echo = Environnement Virtuel Desactive
echo ===============================

echo.
echo ==========================================
echo = Installation terminee. Vous pouvez fermer ce terminal et lancer run.bat.
echo ==========================================
pause >nul & exit