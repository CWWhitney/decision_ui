@ECHO OFF
setlocal

REM change to root directory
CD /D "%~dp0/../"

REM clean common
call code\common\bin\clean.bat

REM clean frontend
call code\frontend\bin\clean.bat

REM clean server
call code\server\bin\clean.bat

endlocal