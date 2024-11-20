@echo off
setlocal

REM Définir le chemin vers le répertoire du projet
set "PROJECT_DIR=%~dp0"

REM Changer le répertoire courant vers le répertoire du projet
cd /d "%PROJECT_DIR%"

REM Lancer Electron avec npm start
npm start

endlocal