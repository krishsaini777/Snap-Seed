@echo off
title CropGuard AI - Starting Services
echo ========================================================
echo   Starting AI-Based Crop Disease Detection System
echo ========================================================
echo.

echo [1/3] Starting Python ML Service on http://localhost:8000 ...
start "CropGuard - ML Service (Port 8000)" cmd /k "cd ml-service && python app.py"

echo [2/3] Starting Node.js Backend on http://localhost:5000 ...
start "CropGuard - Backend API (Port 5000)" cmd /k "cd backend && npm start"

echo [3/3] Starting React Frontend on http://localhost:3000 ...
start "CropGuard - React Frontend (Port 3000)" cmd /k "cd frontend && npm start"

echo.
echo All services are launching in separate windows!
echo - Frontend:    http://localhost:3000
echo - Backend API: http://localhost:5000
echo - ML Service:  http://localhost:8000
echo ========================================================
pause

