@echo off
chcp 65001 > nul
title أمانة عمّان الكبرى - رابط سحابي فوري عبر Cloudflare
cls
echo ============================================================
echo   🇯🇴 أمانة عمّان الكبرى - قسم المخالفات
echo   رابط عام مباشر ومؤمن عبر شبكة Cloudflare العالمية
echo ============================================================
echo.
echo [1/2] تشغيل السيرفر المحلي في الخلفية...
start "" /b node server/src/server.js
timeout /t 2 > nul

echo [2/2] تشغيل نفق Cloudflare السحابي السريع...
echo.
echo الرابط المباشر شغال الآن ويمكنك مشاركته فوراً:
echo.
"%TEMP%\cloudflared.exe" tunnel --url http://localhost:5000
pause
