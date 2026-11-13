@echo off
cd /d "%~dp0"
title SafeHer - Women Travel Safety Platform
echo ========================================================
echo   Starting SafeHer Full-Stack Application...
echo   Backend:  http://localhost:5000
echo   Frontend: http://localhost:5173
echo ========================================================
echo.

start "SafeHer Backend (Port 5000)" cmd /k "cd /d ""%~dp0server"" && npm.cmd run dev"
timeout /t 3 /nobreak >nul
start "SafeHer Frontend (Port 5173)" cmd /k "cd /d ""%~dp0client"" && npm.cmd run dev"

echo.
echo SafeHer services are running!
echo Launching browser at http://localhost:5173...
timeout /t 2 /nobreak >nul
start http://localhost:5173
