@echo off
chcp 65001 >nul
set PATH=C:\Users\HP\AppData\Local\Atlassian\SourceTree\git_local\mingw64\bin;%PATH%
cd /d "%~dp0"

git add -A
if "%~1"=="" (
    git commit -m "update"
) else (
    git commit -m "%~1"
)
git push

echo.
echo ---- done ----
pause
