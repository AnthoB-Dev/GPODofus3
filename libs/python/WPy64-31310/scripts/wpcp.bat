@echo off
call "%~dp0env_for_icons.bat"
if not "%WINPYWORKDIR%"=="%WINPYWORKDIR1%" cd/d %WINPYWORKDIR1%
cmd.exe /k "echo wppm & wppm"
