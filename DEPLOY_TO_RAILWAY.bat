@echo off
title AML - Deploy to Railway (Free)
color 0A
cls

echo.
echo  ==========================================
echo   AML System - Railway Deployment (FREE)
echo   No credit card needed!
echo  ==========================================
echo.

echo [1/3] Installing Railway CLI...
call npm install -g @railway/cli 2>nul
if %ERRORLEVEL% NEQ 0 (
  echo Trying alternative install...
  powershell -Command "iwr https://railway.app/install.ps1 | iex"
)

echo.
echo [2/3] Logging in to Railway...
echo       A browser will open. Sign in with GITHUB - it's instant and free.
echo       Come back here after logging in.
echo.
railway login

echo.
echo [3/3] Deploying your app...
cd /d "c:\Users\nourb\OneDrive\Desktop\AML"
railway init --name amman-violations
railway variables set PORT=5000 NODE_ENV=production DB_PATH=/app/data/database.sqlite UPLOADS_DIR=/app/data/uploads JWT_SECRET=super_secret_camera_violations_key_2026_aml
railway up --detach

echo.
echo  ==========================================
echo   Getting your live URL...
echo  ==========================================
railway domain
echo.
echo  Done! Share the URL above with anyone.
echo.
pause
