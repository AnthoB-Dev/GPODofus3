@echo off
call "%~dp0env.bat"
set WINPYWORKDIR=%WINPYDIRBASE%\Notebooks

rem default is as before: Winpython ..\Notebooks
set WINPYWORKDIR1=%WINPYWORKDIR%

rem if we have a file or directory in %1 parameter, we use that directory 
if not "%~1"=="" (
   if exist "%~1" (
      if exist "%~1\" (
         rem echo it is a directory %~1
	     set WINPYWORKDIR1=%~1
	  ) else (
	  rem echo  it is a file %~1, so we take the directory %~dp1
	  set WINPYWORKDIR1=%~dp1
	  )
   )
) else (
rem if it is launched from another directory than icon origin , we keep it that one echo %__CD__%
if not "%__CD__%"=="%~dp0" if not "%__CD__%scripts\"=="%~dp0" set  WINPYWORKDIR1="%__CD__%"
)
rem remove potential doublequote
set WINPYWORKDIR1=%WINPYWORKDIR1:"=%
rem remove some potential last \
if "%WINPYWORKDIR1:~-1%"=="\" set WINPYWORKDIR1=%WINPYWORKDIR1:~0,-1%

FOR /F "delims=" %%i IN ('""%WINPYDIR%\python.exe" "%~dp0WinpythonIni.py""') DO set winpythontoexec=%%i

%winpythontoexec%set winpythontoexec=

rem 2024-08-18: we go initial directory WINPYWORKDIR if no direction and we are on icon directory
rem old NSIS launcher is  by default at icon\scripts level
if  "%__CD__%scripts\"=="%~dp0"  if "%WINPYWORKDIR1%"=="%WINPYDIRBASE%\Notebooks"  cd/D %WINPYWORKDIR1%
rem new shimmy launcher is by default at icon level
if  "%__CD__%"=="%~dp0"  if "%WINPYWORKDIR1%"=="%WINPYDIRBASE%\Notebooks"  cd/D %WINPYWORKDIR1%


rem ******************
rem missing student directory part
rem ******************

if not exist "%WINPYWORKDIR%" mkdir "%WINPYWORKDIR%"

if not exist "%HOME%\.spyder-py%WINPYVER:~0,1%"  mkdir "%HOME%\.spyder-py%WINPYVER:~0,1%"
if not exist "%HOME%\.spyder-py%WINPYVER:~0,1%\workingdir" echo %HOME%\Notebooks>"%HOME%\.spyder-py%WINPYVER:~0,1%\workingdir"

