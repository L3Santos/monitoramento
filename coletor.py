import os
import psutil
import requests
import time
import subprocess
import json
import platform
import sys
from datetime import datetime

# Configurações
URL_API = "http://localhost:5000/api/coletar"
URL_API_REMOTA = "https://ec7b3897-25db-4d7f-8229-c27435ea5538-00-3k3aqjcyjqqr2.kirk.replit.dev/api/coletar"
INTERVALO = 2  # segundos - verifica a cada 2 segundos
SESSOES_RASTREADAS = {}  # Rastreia PIDs de AnyDesk já registrados
SISTEMA_OPERACIONAL = platform.system()

def eh_ip_interno(ip):
    """Verifica se o IP é interno/privado"""
    if ip == "127.0.0.1" or ip == "0.0.0.0" or ip == "::1":
        return True
    partes = ip.split('.')
    if len(partes) != 4:
        return False
    # Faixas de IP privado: 10.x.x.x, 172.16.x.x-172.31.x.x, 192.168.x.x
    try:
        p1, p2 = int(partes[0]), int(partes[1])
        if p1 == 10:
            return True
        if p1 == 172 and 16 <= p2 <= 31:
            return True
        if p1 == 192 and p2 == 168:
            return True
    except ValueError:
        pass
    return False

def obter_sessoes_anydesk():
    """Detecta sessões AnyDesk ativas silenciosamente"""
    sessoes = []
    try:
        # Procura por todos os processos AnyDesk em execução
        for proc in psutil.process_iter(['pid', 'name', 'username']):
            try:
                nome = proc.info['name'].lower()
                # Detecta AnyDesk em várias formas: anydesk, anydesk.exe, anydesk64, etc
                if 'anydesk' in nome:
                    pid = proc.info['pid']
                    usuario = proc.info['username'] or 'desconhecido'
                    
                    # Busca conexões ESTABLISHED de TODOS os processos
                    for conn in psutil.net_connections(kind='inet'):
                        try:
                            # Verifica se raddr existe antes de acessar .port
                            if conn.status == 'ESTABLISHED' and conn.pid == pid and conn.raddr and conn.raddr.port != 443:
                                ip_remoto = conn.raddr.ip if conn.raddr else "0.0.0.0"
                                # Filtra para pegar apenas IPs externos e não-administrativos
                                if not eh_ip_interno(ip_remoto):
                                    sessoes.append({
                                        "pid": pid,
                                        "ip_remoto": ip_remoto,
                                        "porta": conn.raddr.port if conn.raddr else 0,
                                        "horario_inicio": datetime.now().isoformat(),
                                        "status": "ativo",
                                        "usuario": usuario,
                                        "nome_computador": "localhost"
                                    })
                        except (psutil.NoSuchProcess, psutil.AccessDenied, AttributeError, TypeError):
                            continue
            except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
                continue
    except Exception:
        pass  # Silencioso - sem logs
    
    return sessoes

def obter_servicos_linux():
    """Obtém status de serviços no Linux"""
    servicos_alvo = ['anydesk', 'ssh', 'docker', 'nginx', 'apache2', 'mysql', 'postgresql']
    resultado = []
    for nome in servicos_alvo:
        try:
            status = subprocess.run(['systemctl', 'is-active', nome], capture_output=True, text=True, timeout=2).stdout.strip()
            if status == 'active':
                try:
                    pid_str = subprocess.run(['systemctl', 'show', '--property', 'MainPID', '--value', nome], capture_output=True, text=True, timeout=2).stdout.strip()
                    pid = int(pid_str) if pid_str and pid_str != '0' else None
                except:
                    pid = None
                resultado.append({"nome": nome, "status": "executando", "pid": pid})
            else:
                resultado.append({"nome": nome, "status": "parado", "pid": None})
        except:
            continue
    return resultado

def obter_servicos_windows():
    """Obtém status de serviços no Windows"""
    servicos_alvo = ['AnyDesk', 'sshd', 'Docker', 'nginx', 'Apache2', 'MySQL80', 'PostgreSQL']
    resultado = []
    for nome in servicos_alvo:
        try:
            # Usando Get-Service do PowerShell
            output = subprocess.run(['powershell', '-Command', f'Get-Service -Name "{nome}" -ErrorAction SilentlyContinue | Select-Object -Property Name, Status | Format-List'], 
                                  capture_output=True, text=True, timeout=2)
            if 'Running' in output.stdout:
                # Tentar obter o PID
                pid_output = subprocess.run(['powershell', '-Command', f'(Get-Process -Name "{nome.lower()}" -ErrorAction SilentlyContinue).Id'], 
                                          capture_output=True, text=True, timeout=2)
                try:
                    pid = int(pid_output.stdout.strip()) if pid_output.stdout.strip() else None
                except:
                    pid = None
                resultado.append({"nome": nome, "status": "executando", "pid": pid})
            else:
                resultado.append({"nome": nome, "status": "parado", "pid": None})
        except:
            continue
    return resultado

def obter_servicos():
    """Obtém status de serviços (multiplataforma)"""
    if SISTEMA_OPERACIONAL == "Linux":
        return obter_servicos_linux()
    elif SISTEMA_OPERACIONAL == "Windows":
        return obter_servicos_windows()
    else:
        return []

def obter_conexoes():
    """Obtém conexões de rede ativas"""
    conexoes = []
    try:
        for conn in psutil.net_connections(kind='inet'):
            if conn.status in ['ESTABLISHED', 'LISTEN']:
                try:
                    p = psutil.Process(conn.pid)
                    nome_proc = p.name()
                except:
                    nome_proc = "Desconhecido"
                porta_local = conn.laddr.port if conn.laddr else 0
                ip_remoto = conn.raddr.ip if conn.raddr else "0.0.0.0"
                conexoes.append({
                    "porta_local": porta_local,
                    "ip_remoto": ip_remoto,
                    "estado": conn.status,
                    "processo": nome_proc
                })
    except:
        pass
    return conexoes

def obter_processos():
    """Obtém 10 processos com maior uso de CPU"""
    processos = []
    try:
        for proc in psutil.process_iter(['pid', 'name', 'username', 'cpu_percent', 'memory_percent']):
            try:
                info = proc.info
                processos.append({
                    "pid": info['pid'],
                    "nome": info['name'],
                    "usuario": info['username'] or "root",
                    "cpu_percentual": info['cpu_percent'] or 0.0,
                    "memoria_percentual": info['memory_percent'] or 0.0
                })
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                continue
    except:
        pass
    return sorted(processos, key=lambda x: x['cpu_percentual'], reverse=True)[:10]

def coletar_e_enviar():
    """Loop silencioso de coleta e envio de dados"""
    url_alvo = URL_API
    ultima_impressao = 0
    
    while True:
        try:
            mem = psutil.virtual_memory()
            sessoes_any = obter_sessoes_anydesk()
            
            payload = {
                "cpu": {"percentual": psutil.cpu_percent(interval=0.5)},
                "memoria": {
                    "total": f"{mem.total / (1024**3):.1f}GB",
                    "usada": f"{mem.used / (1024**3):.1f}GB",
                    "percentual": mem.percent
                },
                "anydesk": {"ativo": len(sessoes_any) > 0, "sessoes": sessoes_any},
                "processos": obter_processos(),
                "servicos": obter_servicos(),
                "rede": obter_conexoes(),
                "sistema_operacional": SISTEMA_OPERACIONAL
            }
            
            # Imprime apenas se houver sessão AnyDesk ativa
            agora = time.time()
            if len(sessoes_any) > 0 and (agora - ultima_impressao) > 5:
                print(f"[{datetime.now().strftime('%H:%M:%S')}] ANYDESK DETECTADO: {len(sessoes_any)} sessão(ões)")
                ultima_impressao = agora
            
            try:
                response = requests.post(url_alvo, json=payload, timeout=3)
                if response.status_code != 200:
                    url_alvo = URL_API_REMOTA if url_alvo == URL_API else URL_API
            except:
                url_alvo = URL_API_REMOTA if url_alvo == URL_API else URL_API
                try:
                    requests.post(url_alvo, json=payload, timeout=3)
                except:
                    pass
        except Exception:
            pass
        
        time.sleep(INTERVALO)

if __name__ == "__main__":
    print(f"[{datetime.now().strftime('%H:%M:%S')}] Sistema de Monitoramento iniciado em {SISTEMA_OPERACIONAL}...")
    coletar_e_enviar()
