Set oShell = CreateObject("WScript.Shell")
oShell.Run "cmd /c cd /d ""c:\Users\surya\Desktop\PROJECTS\MediBill AI\MediBillAI"" & .venv\Scripts\python.exe -m uvicorn backend.main:app --port 8000 > backend_log.txt 2>&1", 0, False

WScript.Sleep 3000

Set oShell2 = CreateObject("WScript.Shell")
oShell2.Run "cmd /c cd /d ""c:\Users\surya\Desktop\PROJECTS\MediBill AI\MediBillAI"" & npm run dev > frontend_log.txt 2>&1", 0, False
