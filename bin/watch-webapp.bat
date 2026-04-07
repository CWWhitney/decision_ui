@ECHO OFF
setlocal

REM watch frontend
concurrently -k -c auto -n frontend "cmd.exe /c ..\code\frontend\bin\watch-webapp.bat"

endlocal