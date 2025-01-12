@echo off

:: Détecter le répertoire où se trouve ce fichier .bat
set CURRENT_DIR=%~dp0

:: Définir les chemins relatifs du venv et du script Python
set VENV_PATH=%CURRENT_DIR%\venv
set SCRIPT_PATH=%CURRENT_DIR%\resources\app\create_save.py

:: Vérifier si le venv existe
if not exist "%VENV_PATH%\Scripts\activate.bat" (
  echo Environnement virtuel non trouvé !
  pause
  exit /b
)

:: Activer l'environnement virtuel
call "%VENV_PATH%\Scripts\activate.bat"

:: Vérifier si le fichier Python existe
if not exist "%SCRIPT_PATH%" (
  echo Le script Python n'a pas été trouvé !
  pause
  exit /b
)

:: Lancer le script Python
python "%SCRIPT_PATH%"

:: Vérifier si python a renvoyé une erreur
if %ERRORLEVEL% NEQ 0 (
  echo Une erreur s'est produite lors de l'exécution du script Python.
  pause
  exit /b
)

:: Désactiver l'environnement virtuel
deactivate

:: Rester ouvert à la fin
pause
