@ECHO OFF
setlocal

REM change to frontend directory
CD /D "%~dp0/../"

@RD /S /Q node_modules
@RD /S /Q dist

endlocal