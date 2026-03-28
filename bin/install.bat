@ECHO OFF
setlocal

REM change to root directory
CD /D "%~dp0/../"

REM install common
call code\common\bin\install.bat

REM install frontend
call code\frontend\bin\install.bat

REM install server
call code\server\bin\install.bat

endlocal