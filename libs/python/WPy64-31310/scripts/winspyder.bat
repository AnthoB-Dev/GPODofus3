@echo off
call "%~dp0env_for_icons.bat"
rem cd/D "%WINPYWORKDIR%"
"%WINPYDIR%\scripts\spyder.exe" %* -w "%WINPYWORKDIR1%"
