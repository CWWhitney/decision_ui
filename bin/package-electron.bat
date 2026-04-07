@ECHO OFF
setlocal

REM change to base directory
CD /D "%~dp0/../"

REM package electron
call code\frontend\bin\package-electron.bat

endlocal