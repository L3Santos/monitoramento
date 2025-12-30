#!/bin/bash

# MAQUINA CONCILIACAO - Script de Inicialização Completo para Linux/Ubuntu
# Este script prepara o ambiente completo, instala o que falta e inicia o monitoramento

set -e  # Parar em caso de erro

APP_NAME="MaquinaConciliacao"
DIRETORIO_RAIZ=$(pwd)
DIRETORIO_DADOS="$DIRETORIO_RAIZ/dados"
PORTA=5000

echo "================================================"
echo "  INICIANDO $APP_NAME"
echo "================================================"
echo ""

# Detectar distribuição Linux
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
else
    echo "[ERRO] Não foi possível detectar o sistema operacional"
    exit 1
fi

# 1. Verificar e instalar Node.js se necessário
echo "[1/5] Verificando Node.js..."
if ! command -v node &> /dev/null; then
    echo "[AVISO] Node.js não encontrado. Instalando..."
    if [ "$OS" = "ubuntu" ] || [ "$OS" = "debian" ]; then
        sudo apt-get update -qq
        sudo apt-get install -y -qq curl gnupg2
        curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
        sudo apt-get install -y -qq nodejs
    elif [ "$OS" = "fedora" ] || [ "$OS" = "rhel" ]; then
        sudo dnf install -y nodejs
    elif [ "$OS" = "arch" ]; then
        sudo pacman -S --noconfirm nodejs npm
    else
        echo "[ERRO] Distribuição não suportada para instalação automática"
        echo "Instale Node.js 20+ manualmente de: https://nodejs.org/"
        exit 1
    fi
    echo "[OK] Node.js instalado"
else
    NODE_VERSION=$(node -v)
    echo "[OK] Node.js encontrado: $NODE_VERSION"
fi

# 2. Verificar e instalar Python se necessário
echo "[2/5] Verificando Python3..."
if ! command -v python3 &> /dev/null; then
    echo "[AVISO] Python3 não encontrado. Instalando..."
    if [ "$OS" = "ubuntu" ] || [ "$OS" = "debian" ]; then
        sudo apt-get update -qq
        sudo apt-get install -y -qq python3 python3-pip
    elif [ "$OS" = "fedora" ] || [ "$OS" = "rhel" ]; then
        sudo dnf install -y python3 python3-pip
    elif [ "$OS" = "arch" ]; then
        sudo pacman -S --noconfirm python python-pip
    fi
    echo "[OK] Python3 instalado"
else
    PYTHON_VERSION=$(python3 --version)
    echo "[OK] Python3 encontrado: $PYTHON_VERSION"
fi

# 3. Criar estrutura de pastas
echo "[3/5] Criando estrutura de arquivos..."
mkdir -p "$DIRETORIO_DADOS"

# Inicializar arquivos JSON se não existirem
for arquivo in sessoes_anydesk.json metricas_sistema.json eventos_sistema.json; do
    if [ ! -f "$DIRETORIO_DADOS/$arquivo" ] || [ ! -s "$DIRETORIO_DADOS/$arquivo" ]; then
        echo "[]" > "$DIRETORIO_DADOS/$arquivo"
    fi
done
echo "[OK] Estrutura de arquivos pronta"

# 4. Instalar dependências Node.js
echo "[4/5] Instalando dependências Node.js..."
if [ ! -d "node_modules" ] || [ ! -f "package-lock.json" ]; then
    npm install --legacy-peer-deps --quiet
    echo "[OK] Dependências Node.js instaladas"
else
    echo "[OK] Dependências Node.js já existem"
fi

# 5. Instalar dependências Python
echo "[5/5] Instalando dependências Python..."
if ! python3 -c "import psutil, requests" 2>/dev/null; then
    python3 -m pip install psutil requests --user --quiet
    echo "[OK] Dependências Python instaladas"
else
    echo "[OK] Dependências Python já existem"
fi

# Iniciar Coletor em segundo plano
echo ""
echo "Iniciando coletor de dados em segundo plano..."
if pgrep -f "python3 coletor.py" > /dev/null 2>&1; then
    echo "[INFO] Coletor já está rodando"
else
    python3 coletor.py > coletor.log 2>&1 &
    COLETOR_PID=$!
    echo "[OK] Coletor iniciado (PID: $COLETOR_PID)"
fi

# Iniciar Dashboard
echo ""
echo "================================================"
echo "  PAINEL DISPONÍVEL EM: http://localhost:$PORTA"
echo "  ARQUIVOS DE LOG EM:   $DIRETORIO_DADOS"
echo "================================================"
echo ""

# Definir porta e iniciar servidor
export PORT=$PORTA
npm run dev
