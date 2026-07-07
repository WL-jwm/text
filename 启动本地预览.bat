@echo off
chcp 65001 >nul
title 河北地下水基础资料数据库 - 本地预览服务器
echo.
echo  ╔══════════════════════════════════════════════╗
echo  ║   河北地下水基础资料数据库 v2.0              ║
echo  ║   本地预览服务器                              ║
echo  ╚══════════════════════════════════════════════╝
echo.
echo  正在启动 HTTP 服务器...
echo  请在浏览器中访问: http://localhost:8765
echo.
echo  按 Ctrl+C 停止服务器
echo.

cd /d "%~dp0dist"
python -m http.server 8765 --bind 127.0.0.1

pause
