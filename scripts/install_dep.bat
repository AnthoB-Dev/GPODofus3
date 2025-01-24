@echo off

for %%i in ("%~dp0..\..\..\") do set "VENVFOLDER=%%~fi"
for %%i in ("%~dp0..\") do set "APPFOLDER=%%~fi"

REM Construire le chemin absolu vers le fichier requirements.txt en utilisant la base correcte
set "REQUIREMENTS_FILE=%APPFOLDER%\requirements.txt"

REM Vérification si le fichier existe
if not exist "%REQUIREMENTS_FILE%" (
    echo Le fichier requirements.txt est introuvable : "%REQUIREMENTS_FILE%"
    pause
    exit /b
)

REM Construire le chemin de PIP avec VENVFOLDER
set "PIPPATH=%VENVFOLDER%\venv\Scripts\pip.exe"


REM Installer les dépendances Python via pip avec chemin absolu
"%PIPPATH%" install -r "%REQUIREMENTS_FILE%"
if "%errorlevel%" neq "0" (
    echo Erreur lors de l'installation des dépendances Python.
    pause
    exit /b
)
