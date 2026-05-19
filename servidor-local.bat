@echo off
setlocal EnableExtensions
chcp 65001 >nul 2>&1
set "PORTA=8765"

call "%~dp0_portable-init.bat" "%~f0"
if errorlevel 1 exit /b 1

if not exist "%ROOT%\index.html" (
  echo [ERRO] index.html nao encontrado em:
  echo   %ROOT%
  pause
  exit /b 1
)

echo.
echo Pasta servida: %ROOT%
echo Abra: http://127.0.0.1:%PORTA%/index.html
echo Porta %PORTA% evita conflito com Live Server do VS Code ^(que usa 5500^).
echo Na raiz / o Python lista arquivos; use index.html para o catalogo.
echo Para encerrar: Ctrl+C
echo.
"%PY%" %PYARGS% -m http.server %PORTA%
if errorlevel 1 (
  echo.
  echo Falha ao subir o servidor. Porta %PORTA% em uso ou Python com erro.
  echo Feche outra janela deste servidor ou altere PORTA em servidor-local.bat.
  echo.
  pause
)
popd >nul 2>&1
exit /b %ERRORLEVEL%
