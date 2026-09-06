@echo off
title AML - Deploy to Fly.io
color 0A
cls

echo.
echo  ==========================================
echo   AML System - Fly.io Deployment
echo  ==========================================
echo.

set PATH=c:\Users\nourb\fly;%PATH%

echo [1/5] Logging in to Fly.io...
echo      A browser will open - sign up or log in (GitHub works)
echo      After login, come back here - it continues automatically.
echo.
flyctl auth login

echo.
echo [2/5] Destroying old failed app (if any)...
flyctl apps destroy amman-violations --yes 2>nul
echo      Done.

echo.
echo [3/5] Creating app on Fly.io...
cd /d "c:\Users\nourb\OneDrive\Desktop\AML"
flyctl launch --name amman-violations --region cdg --ha=false --no-deploy --copy-config

echo.
echo [4/5] Setting secret key and creating storage...
flyctl secrets set JWT_SECRET=super_secret_camera_violations_key_2026_aml
flyctl volumes create aml_data --region cdg --size 1 --yes

echo.
echo [5/5] Building and deploying (takes 3-4 minutes, please wait)...
echo.
flyctl deploy

echo.
echo  ==========================================
echo   DONE! Your app is live at:
echo   https://amman-violations.fly.dev
echo  ==========================================
echo.
flyctl open
pause
