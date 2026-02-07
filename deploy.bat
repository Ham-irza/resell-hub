@echo off
REM Orangehost Deployment Script for Windows
REM Usage: deploy.bat
REM This script builds and prepares your application for Orangehost deployment

setlocal enabledelayedexpansion

echo.
echo ========================================
echo Orangehost Deployment Script
echo ========================================
echo.

REM Step 1: Install dependencies
echo [1/6] Installing dependencies...
call pnpm install
if errorlevel 1 (
  echo ERROR: Failed to install dependencies
  exit /b 1
)
echo SUCCESS: Dependencies installed
echo.

REM Step 2: Type checking
echo [2/6] Running TypeScript check...
call pnpm typecheck
REM Don't exit on error for typecheck
echo.

REM Step 3: Build frontend
echo [3/6] Building React frontend...
call pnpm build
if errorlevel 1 (
  echo ERROR: Failed to build frontend
  exit /b 1
)
echo SUCCESS: Frontend built
echo.

REM Step 4: Verify environment file
echo [4/6] Verifying environment configuration...
if not exist ".env.production.example" (
  echo WARNING: .env.production.example not found
) else (
  echo SUCCESS: Environment template found
)
echo.

REM Step 5: Create deployment package
echo [5/6] Creating deployment artifacts...
if exist "deployment" rmdir /s /q deployment 2>nul
mkdir deployment

xcopy dist deployment\dist /E /I /Y >nul
xcopy backend deployment\backend /E /I /Y >nul
xcopy server deployment\server /E /I /Y >nul
copy package.json deployment\ >nul
if exist pnpm-lock.yaml (
  copy pnpm-lock.yaml deployment\ >nul
) else (
  copy package-lock.json deployment\ >nul
)

echo SUCCESS: Deployment files prepared
echo.

REM Step 6: Create archive (requires 7-Zip or tar command in Windows 10+)
echo [6/6] Creating compressed archive...
for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c%%a%%b)
for /f "tokens=1-2 delims=/:" %%a in ('time /t') do (set mytime=%%a%%b)
set TIMESTAMP=%mydate%_%mytime%
set ARCHIVE=seller-egrocify_%TIMESTAMP%.tar.gz

REM Try using Windows built-in tar command (Windows 10+)
tar -czf "%ARCHIVE%" deployment\
if errorlevel 1 (
  echo WARNING: Could not create tar.gz archive
  echo Skipping compression. Please manually zip the 'deployment' folder.
  set ARCHIVE=deployment
) else (
  echo SUCCESS: Archive created - %ARCHIVE%
)

echo.
echo ========================================
echo Deployment Instructions
echo ========================================
echo.
echo 1. Upload via FTP/SFTP:
echo    - Host: orangehost.com
echo    - Email: saadhoccane2@gmail.com
echo    - Password: egrocify786$
echo    - Upload to: /public_html/seller.egrocify.com/
echo.
echo 2. Files to upload:
echo    - %ARCHIVE%
echo.
echo 3. SSH/cPanel Terminal Commands:
echo    cd /public_html/seller.egrocify.com/
if "%ARCHIVE%" neq "deployment" (
  echo    tar -xzf %ARCHIVE%
  echo    rm -rf %ARCHIVE%
) else (
  echo    (Extract files from deployment folder)
)
echo    rm -rf deployment
echo.
echo 4. Install dependencies on server:
echo    pnpm install
echo.
echo 5. Create production .env:
echo    cp .env.production.example .env
echo    nano .env  (Edit with actual values)
echo.
echo 6. Build assets:
echo    pnpm build
echo.
echo 7. Configure in cPanel:
echo    - Node.js Selector or Setup Node.js App
echo    - App root: /public_html/seller.egrocify.com
echo    - Startup file: backend/index.js
echo    - Node version: 18+
echo.
echo ========================================
echo Build Complete!
echo ========================================
echo.
echo Next steps:
echo   1. Upload %ARCHIVE% to Orangehost
echo   2. Extract files on server
echo   3. Configure .env with production values
echo   4. Update Alfa Payment Gateway live credentials
echo   5. Update Alfa callback URLs
echo   6. Test at https://seller.egrocify.com
echo.
echo Hosting Details:
echo   - Domain: seller.egrocify.com
echo   - Host: orangehost.com
echo   - Email: saadhoccane2@gmail.com
echo.
pause
