@ECHO OFF
setlocal

REM change to root directory
CD /D "%~dp0/../"

REM lint common
call code\common\bin\lint.bat

REM lint frontend
call code\frontend\bin\lint.bat

REM lint server
call code\server\bin\lint.bat

endlocal