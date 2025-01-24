@echo off
set WINPYDIRBASE=%~dp0..
rem set PYTHONUTF8=1 would create issues in "movable" patching
rem get a normalize path
set WINPYDIRBASETMP=%~dp0..
pushd %WINPYDIRBASETMP%
set WINPYDIRBASE=%__CD__%
if "%WINPYDIRBASE:~-1%"=="\" set WINPYDIRBASE=%WINPYDIRBASE:~0,-1%
set WINPYDIRBASETMP=
popd

set WINPYDIR=%WINPYDIRBASE%\python
rem 2019-08-25 pyjulia needs absolutely a variable PYTHON=%WINPYDIR%python.exe
set PYTHON=%WINPYDIR%\python.exe
set PYTHONPATHz=%WINPYDIR%;%WINPYDIR%\Lib;%WINPYDIR%\DLLs
set WINPYVER=3.13.1.0dot
rem 2023-02-12 try utf-8 on console
rem see https://github.com/pypa/pip/issues/11798#issuecomment-1427069681
set PYTHONIOENCODING=utf-8

set HOME=%WINPYDIRBASE%\settings
rem read https://github.com/winpython/winpython/issues/839
rem set USERPROFILE=%HOME%
rem set WINPYDIRBASE=
set JUPYTER_DATA_DIR=%HOME%
set JUPYTER_CONFIG_DIR=%WINPYDIR%\etc\jupyter
set JUPYTER_CONFIG_PATH=%WINPYDIR%\etc\jupyter
set WINPYARCH=WIN32
if  "%WINPYDIR:~-5%"=="amd64" set WINPYARCH=WIN-AMD64
set FINDDIR=%WINDIR%\system32
echo ";%PATH%;" | %FINDDIR%\find.exe /C /I ";%WINPYDIR%\;" >nul
if %ERRORLEVEL% NEQ 0 (
   set "PATH=%WINPYDIR%\Lib\site-packages\PyQt5;%WINPYDIR%\;%WINPYDIR%\DLLs;%WINPYDIR%\Scripts;%WINPYDIR%\..\t;%WINPYDIR%\..\t\Julia\bin;%WINPYDIR%\..\n;%PATH%;"
   cd .
)         

rem force default pyqt5 kit for Spyder if PyQt5 module is there
if exist "%WINPYDIR%\Lib\site-packages\PyQt5\__init__.py" set QT_API=pyqt5
