@ECHO OFF
setlocal

REM change to script directory
CD /D "%~dp0/"

call install-node.bat
call install-r.bat

endlocal