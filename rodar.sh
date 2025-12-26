#!/bin/bash

# MAQUINA CONCILIACAO - Script de Inicialização Completo para Ubuntu
# Este script prepara o ambiente, garante as pastas e inicia o monitoramento.

APP_NAME="MaquinaConciliacao"
DIRETORIO_RAIZ=$(pwd)
DIRETORIO_DADOS="$DIRETORIO_RAIZ/dados"
PORTA=5000

echo "================================================"
echo "  INICIANDO $APP_NAME"
echo "================================================"

# 1. Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "[ERRO] Node.js não encontrado."
    echo "Instale com: curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt-get install -y nodejs"
    exit 1
fi

# 2. Criar estrutura de pastas se não existir
echo "[1/3] Verificando estrutura de arquivos..."
mkdir -p "$DIRETORIO_DADOS"
touch "$DIRETORIO_DADOS/sessoes_anydesk.json"
touch "$DIRETORIO_DADOS/metricas_sistema.json"
touch "$DIRETORIO_DADOS/eventos_sistema.json"

# Garantir que os arquivos JSON são arrays válidos se estiverem vazios
for f in "$DIRETORIO_DADOS"/*.json; do
    if [ ! -s "$f" ]; then
        echo "[]" > "$f"
    fi
done

# 3. Instalar dependências
if [ ! -d "node_modules" ]; then
    echo "[2/3] Instalando dependências (isso pode demorar)..."
    npm install --quiet
else
    echo "[2/3] Dependências já instaladas."
fi

# 4. Iniciar Coletor em segundo plano
if command -v python3 &> /dev/null; then
    echo "[INFO] Verificando requisitos do Python..."
    python3 -m pip install psutil requests --user --quiet &> /dev/null
    echo "[INFO] Iniciando coletor de dados..."
    python3 coletor.py > coletor.log 2>&1 &
    COLETOR_PID=$!
    echo "[OK] Coletor rodando (PID: $COLETOR_PID)"
    echo "[DICA] Se os dados não aparecerem, verifique o arquivo 'coletor.log'"
else
    echo "[ERRO] Python3 não encontrado. O monitoramento não funcionará sem o Python."
    echo "Instale com: sudo apt install python3-pip && pip3 install psutil requests"
fi

# 5. Iniciar Dashboard
echo "[3/3] Iniciando Servidor Dashboard..."
echo "------------------------------------------------"
echo "PAINEL DISPONÍVEL EM: http://localhost:$PORTA"
echo "ARQUIVOS DE LOG EM:   $DIRETORIO_DADOS"
echo "------------------------------------------------"

# Definir porta e rodar
export PORT=$PORTA
npm run dev
