Set objShell = CreateObject("Shell.Application")
Set objFSO = CreateObject("Scripting.FileSystemObject")
strPath = objFSO.GetParentFolderName(WScript.ScriptFullName)
objShell.ShellExecute "cmd.exe", "/k """ & strPath & "\static\scripts\do_not_run.bat""", "", "runas", 1