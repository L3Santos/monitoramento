@echo off
REM MAQUINA CONCILIACAO - Script de Inicialização Completo para Windows
REM Este script prepara o ambiente, garante as pastas e inicia o monitoramento.

setlocal enabledelayedexpansion
set APP_NAME=MaquinaConciliacao
set DIRETORIO_RAIZ=%cd%
set DIRETORIO_DADOS=%DIRETORIO_RAIZ%\dados
set PORTA=5000

REM Processar argumentos
set MOSTRAR_LOGS=true
if "%~1"=="--no-log" (
    set MOSTRAR_LOGS=false
)

echo.
echo ================================================
echo   INICIANDO %APP_NAME%
echo ================================================
echo.

REM 1. Verificar Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERRO] Node.js nao encontrado.
    echo Instale em: https://nodejs.org/
    pause
    exit /b 1
)

REM 2. Criar estrutura de pastas se não existir
echo [1/3] Verificando estrutura de arquivos...
if not exist "%DIRETORIO_DADOS%" mkdir "%DIRETORIO_DADOS%"

if not exist "%DIRETORIO_DADOS%\sessoes_anydesk.json" (
    echo [] > "%DIRETORIO_DADOS%\sessoes_anydesk.json"
)
if not exist "%DIRETORIO_DADOS%\metricas_sistema.json" (
    echo [] > "%DIRETORIO_DADOS%\metricas_sistema.json"
)
if not exist "%DIRETORIO_DADOS%\eventos_sistema.json" (
    echo [] > "%DIRETORIO_DADOS%\eventos_sistema.json"
)

REM 3. Instalar dependências
if not exist "node_modules" (
    echo [2/3] Instalando dependencias - isso pode demorar...
    call npm install --quiet
) else (
    echo [2/3] Dependencias ja instaladas.
)

REM 4. Instalar pip e dependências Python e Iniciar Coletor
python --version >nul 2>&1
if errorlevel 1 (
    echo [AVISO] Python nao encontrado. O monitoramento nao funcionara sem o Python.
    echo Instale em: https://www.python.org/downloads/
) else (
    echo [INFO] Verificando requisitos do Python...
    python -m pip --version >nul 2>&1
    if errorlevel 1 (
        echo [AVISO] pip nao encontrado. Instalando pip...
        python -m ensurepip --upgrade --quiet
    )
    python -m pip install psutil requests --user --quiet >nul 2>&1
    
    echo [INFO] Iniciando coletor de dados...
    REM Mata instâncias anteriores para garantir subida limpa
    taskkill /F /IM python.exe /FI "WINDOWTITLE eq ColetorAnyDesk" >nul 2>&1
    
    if "%MOSTRAR_LOGS%"=="true" (
        start "ColetorAnyDesk" python coletor.py
    ) else (
        start /B "ColetorAnyDesk" python coletor.py > coletor.log 2>&1
    )
    echo [OK] Coletor iniciado.
)

REM 5. Iniciar Dashboard
echo [3/3] Iniciando Servidor Dashboard...
echo.
echo ------------------------------------------------
echo PAINEL DISPONIVEL EM: http://localhost:%PORTA%
echo LOGS DO COLETOR:      %MOSTRAR_LOGS% (se false, ver coletor.log)
echo ------------------------------------------------
echo.

REM Definir porta e rodar
set PORT=%PORTA%
call npm run dev

pause
