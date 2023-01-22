@echo off
setlocal enableextensions
@REM Put your schemas here and put space between them Like the example
set "folders=About ContactUs"
set "originalPath=%cd%\Template"
set "newPath=%cd%\Models\"

for %%i in (%folders%) do (
    echo new Path: %newPath%%%i%
    xcopy "%originalPath%" "%newPath%%%i%" /E /I /Y
     for /f "delims=" %%f in ('dir /b /a-d "%newPath%%%i%\*.*"') do (
        echo %%f
        for %%g in ("%%f") do (
            set "file=%%~ng"
            set "ext=%%~xg"
            ren %newPath%%%i\%%f %%i%%f
)
    )
)

PAUSE

echo All folders have been copied and renamed.