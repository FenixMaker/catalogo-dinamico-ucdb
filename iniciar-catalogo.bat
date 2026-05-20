@echo off
chcp 65001 >nul 2>&1
setlocal EnableExtensions
set "PORTA=8765"
set "URL=http://127.0.0.1:%PORTA%/index.html"

call "%~dp0_portable-init.bat" "%~f0"
if errorlevel 1 (
  pause
  exit /b 1
)

if not exist "%ROOT%\index.html" (
  echo [ERRO] index.html nao encontrado em:
  echo   %ROOT%
  pause
  popd >nul 2>&1
  exit /b 1
)

if not exist "%ROOT%\servidor-local.bat" (
  echo [ERRO] servidor-local.bat nao encontrado em:
  echo   %ROOT%
  pause
  popd >nul 2>&1
  exit /b 1
)

echo Este projeto nao usa pip/npm - apenas Python para o servidor local.
echo.
echo === PASSO UNICO ===
echo Duplo clique SOMENTE neste arquivo. Nao precisa rodar servidor-local.bat antes
echo ^(ele e aberto automaticamente em outra janela^).
echo.
echo Pasta do projeto: %ROOT%
echo Porta %PORTA% ^(evita conflito com Live Server do VS Code na 5500^).
echo.
echo Iniciando servidor HTTP na porta %PORTA%...
start "Catalogo-HTTP-%PORTA%" /min "%ComSpec%" /d /k call "%ROOT%\servidor-local.bat"

echo Aguardando o servidor subir ^(PCs lentos: pode levar alguns segundos^)...
set /a TRIES=0
:wait_server
set /a TRIES+=1
"%PY%" %PYARGS% -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:%PORTA%/', timeout=1)" >nul 2>&1
if not errorlevel 1 goto server_up
curl -s -o nul --connect-timeout 1 "http://127.0.0.1:%PORTA%/" >nul 2>&1
if not errorlevel 1 goto server_up
if %TRIES% geq 20 goto server_up
timeout /t 1 /nobreak >nul 2>nul
if errorlevel 1 ping -n 2 127.0.0.1 >nul
goto wait_server

:server_up
start "" "%URL%"

echo.
echo Abra sempre: %URL%
echo Se o visual nao mudar: feche abas em 127.0.0.1:5500 ^(Live Server^) e use o link acima.
echo.
popd >nul 2>&1
pause
exit /b 0
