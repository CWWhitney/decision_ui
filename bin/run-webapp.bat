@ECHO OFF
setlocal

REM watch both frontend
concurrently -k -c auto -n server "cmd.exe /c ..\code\server\bin\run.bat"

endlocal