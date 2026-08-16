@echo off
cd /d "%~dp0"
rem Avvia il server Python sulla porta 8888 in una nuova finestra del terminale
start "" cmd /c "python -m http.server 8888"
rem Attendi qualche secondo perché il server si avvii
timeout /t 2 > nul
rem Apri il browser predefinito sulla pagina locale
start "" "http://localhost:8888/"
