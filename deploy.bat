@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion
cd /d "%~dp0"

if not exist "index.html" (
    echo.
    echo   [x] 没找到 index.html
    echo       请把 deploy.bat 放在项目根目录（和 index.html 同一层）
    echo.
    pause
    exit /b 1
)

rem ---- 找一个空闲端口 ----
set PORT=8787
:checkport
netstat -ano | findstr /c:":%PORT% " | findstr /i "LISTENING" >nul
if not errorlevel 1 (
    set /a PORT+=1
    if !PORT! gtr 8820 (
        echo   [x] 8787-8820 都被占用了，请先关掉其他本地服务
        pause
        exit /b 1
    )
    goto checkport
)

echo.
echo   主义星图 · Ism Atlas
echo   ------------------------------------
echo   地址   http://127.0.0.1:%PORT%/
echo   关闭本窗口即停止服务
echo.

rem 延迟 2 秒再开浏览器，等服务器起来
start "" powershell -WindowStyle Hidden -Command "Start-Sleep -Seconds 2; Start-Process 'http://127.0.0.1:%PORT%/'"

rem ---- 依次尝试 py / python / node ----
py -3 -c "print(1)" >nul 2>&1
if not errorlevel 1 (
    echo   [服务] Python ^(py -3^)
    echo.
    py -3 -m http.server %PORT% --bind 127.0.0.1
    goto done
)

python -c "print(1)" >nul 2>&1
if not errorlevel 1 (
    echo   [服务] Python
    echo.
    python -m http.server %PORT% --bind 127.0.0.1
    goto done
)

where node >nul 2>&1
if not errorlevel 1 (
    echo   [服务] Node.js
    echo.
    node "tools\serve.js" %PORT%
    goto done
)

echo   [!] 没检测到 Python 或 Node
echo       改为直接用浏览器打开（功能同样完整，只是不用本地服务）
start "" "index.html"

:done
echo.
echo   服务已停止
pause
