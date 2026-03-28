@ECHO OFF
setlocal

REM change to common directory
CD /D "%~dp0/../"

@RD /S /Q node_modules
@RD /S /Q build

endlocal