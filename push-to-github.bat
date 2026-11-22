@echo off
title Push to GitHub - Snap-Seed
echo ========================================================
echo   Pushing code to https://github.com/krishsaini777/Snap-Seed
echo ========================================================
echo.
cd /d "%~dp0"
git push -u origin main
echo.
echo ========================================================
pause
