@ECHO OFF
setlocal

REM change to common directory
CD /D "%~dp0/../"

npm run build

endlocal