@ECHO OFF
setlocal

REM change to frontend directory
CD /D "%~dp0/../"

REM build setup.exe distributable
npm run build:electron:win

endlocal