@echo off
rem Inicializacao portavel: pasta do .bat que chamou + Python no PATH/launcher/instalacao padrao
set "ROOT="
set "PY="
set "PYARGS="

if not "%~1"=="" (
  for %%I in ("%~1") do set "ROOT=%%~dpI"
) else (
  set "ROOT=%~dp0"
)
set "ROOT=%ROOT:~0,-1%"

pushd "%ROOT%." 2>nul
if errorlevel 1 (
  echo [ERRO] Nao foi possivel acessar a pasta do projeto:
  echo   %ROOT%
  exit /b 1
)
set "ROOT=%CD%"

call :FindPython
if errorlevel 1 exit /b 1
exit /b 0

:FindPython
where python >nul 2>&1
if not errorlevel 1 (
  for /f "delims=" %%P in ('where python 2^>nul') do (
    echo %%P| findstr /i "\\WindowsApps\\" >nul
    if errorlevel 1 (
      "%%P" -c "import sys" >nul 2>&1
      if not errorlevel 1 (
        set "PY=%%P"
        set "PYARGS="
        goto :FindPython_done
      )
    )
  )
)

for %%V in (-3 -3.13 -3.12 -3.11 -3.10) do (
  py %%V -c "import sys" >nul 2>&1
  if not errorlevel 1 (
    set "PY=py"
    set "PYARGS=%%V"
    goto :FindPython_done
  )
)

for %%F in (
  "%LOCALAPPDATA%\Programs\Python\Python313\python.exe"
  "%LOCALAPPDATA%\Programs\Python\Python312\python.exe"
  "%LOCALAPPDATA%\Programs\Python\Python311\python.exe"
  "%LOCALAPPDATA%\Programs\Python\Python310\python.exe"
  "%ProgramFiles%\Python313\python.exe"
  "%ProgramFiles%\Python312\python.exe"
  "%ProgramFiles%\Python311\python.exe"
) do (
  if exist "%%~F" (
    "%%~F" -c "import sys" >nul 2>&1
    if not errorlevel 1 (
      set "PY=%%~F"
      set "PYARGS="
      goto :FindPython_done
    )
  )
)

rem Ultimo recurso: python da Microsoft Store ^(se estiver funcional^)
where python >nul 2>&1
if not errorlevel 1 (
  for /f "delims=" %%P in ('where python 2^>nul') do (
    "%%P" -c "import sys" >nul 2>&1
    if not errorlevel 1 (
      set "PY=%%P"
      set "PYARGS="
      goto :FindPython_done
    )
  )
)

echo [ERRO] Python 3 nao encontrado.
echo        Instale em https://www.python.org/downloads/ e marque "Add python.exe to PATH"
echo        Ou use o launcher oficial ^(py^).
exit /b 1

:FindPython_done
exit /b 0
