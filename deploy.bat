@echo off
echo ========================================================
echo        ASXFLOW - 1-Click Git Push to Remote
echo ========================================================
echo.
echo Make sure you created a new GitHub repo at https://github.com/new
set /p REPO_URL="Enter your GitHub Repository URL (e.g. https://github.com/username/asxflow.git): "

if "%REPO_URL%"=="" (
    echo No URL entered. Aborting.
    pause
    exit /b
)

git remote remove origin 2>nul
git remote add origin %REPO_URL%
git branch -M main
git push -u origin main

echo.
echo ========================================================
echo Code successfully pushed!
echo Now open https://vercel.com/new and click 'Import' on asxflow.
echo ========================================================
pause
