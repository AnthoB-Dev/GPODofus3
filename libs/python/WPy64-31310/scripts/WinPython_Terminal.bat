@echo off
rem call "%~dp0env_for_icons.bat"
rem if not "%WINPYWORKDIR%"=="%WINPYWORKDIR1%" cd %WINPYWORKDIR1%
rem "%USERPROFILE%\AppData\Local\Microsoft\WindowsApps\wt.exe"
Powershell.exe -Command "& {Start-Process PowerShell.exe -ArgumentList '-ExecutionPolicy RemoteSigned -noexit -File ""%~dp0WinPython_PS_Prompt.ps1""'}"
exit
