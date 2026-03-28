@ECHO OFF
setlocal

REM change to root directory
CD /D "%~dp0/../"

REM build common
call code\common\bin\build.bat

REM build server
call code\server\bin\build.bat

REM build frontend
call code\frontend\bin\build-webapp.bat

endlocal