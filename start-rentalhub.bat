@echo off
title RentalHub Launcher
echo ====================================================
echo Starting RentalHub MERN Marketplace...
echo ====================================================

:: Start Backend API in a new window
echo Starting Backend API (Port 5000)...
start "RentalHub Backend" cmd /k "cd /d C:\Users\DELL USER\.gemini\antigravity\scratch\rentalhub\backend && npm start"

:: Wait 3 seconds
timeout /t 3 /nobreak >nul

:: Start Frontend React in a new window
echo Starting Frontend UI (Port 3000)...
start "RentalHub Frontend" cmd /k "cd /d C:\Users\DELL USER\.gemini\antigravity\scratch\rentalhub\frontend && npm run dev"

:: Wait 2 seconds and open default browser
timeout /t 2 /nobreak >nul
echo Opening browser at http://localhost:3000...
start http://localhost:3000

echo ====================================================
echo RentalHub is running!
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo ====================================================
pause
