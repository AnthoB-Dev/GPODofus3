Set objShell = CreateObject("Shell.Application")
Set objFSO = CreateObject("Scripting.FileSystemObject")
strPath = objFSO.GetParentFolderName(WScript.ScriptFullName)
' Utiliser /k pour garder la fenêtre ouverte après l'exécution
objShell.ShellExecute "cmd.exe", "/k """ & strPath & "\do_not_run.bat""", "", "runas", 1