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
URL_API_REMOTA = "https://c5795771-9cdc-4c7e-81b1-2e7126b53ef5-00-19jjgqjlkimr5.kirk.replit.dev/api/coletar"
INTERVALO = 2  # segundos - verifica a cada 2 segundos
SESSOES_RASTREADAS = {}  # Rastreia PIDs de AnyDesk já registrados
SISTEMA_OPERACIONAL = platform.system()

def obter_sessoes_anydesk():
    """Detecta AnyDesk - captura QUALQUER máquina que se conecta (local ou externa)"""
    sessoes = []
    processadores_anydesk_pids = []
    
    try:
        # Primeiro: procurar processos AnyDesk ativos
        for proc in psutil.process_iter(['pid', 'name', 'username']):
            try:
                nome = proc.info['name'].lower()
                # Detecta AnyDesk em várias formas
                if 'anydesk' in nome or 'ad_svc' in nome:
                    pid = proc.info['pid']
                    processadores_anydesk_pids.append(pid)
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                continue
        
        # Segundo: procurar conexões do AnyDesk
        try:
            # kind='all' captura mais conexões que kind='inet' em alguns sistemas
            todas_conexoes = psutil.net_connections(kind='all')
        except (psutil.AccessDenied, OSError):
            try:
                todas_conexoes = psutil.net_connections(kind='inet')
            except:
                todas_conexoes = []
        
        for conn in todas_conexoes:
            try:
                # Se a conexão pertence a um processo AnyDesk OU usa a porta padrão do AnyDesk (7070)
                is_anydesk_proc = conn.pid and conn.pid in processadores_anydesk_pids
                is_anydesk_port = (conn.laddr and conn.laddr.port == 7070) or (conn.raddr and conn.raddr.port == 7070)
                
                if is_anydesk_proc or is_anydesk_port:
                    # QUALQUER conexão ESTABLISHED ou SYN_SENT/SYN_RECV com raddr válido
                    if conn.status in ['ESTABLISHED', 'SYN_SENT', 'SYN_RECV'] and conn.raddr:
                        ip_remoto = conn.raddr.ip
                        porta_remota = conn.raddr.port
                        
                        # Rejeita apenas 0.0.0.0 (inválido)
                        if ip_remoto != "0.0.0.0":
                            usuario = "desconhecido"
                            try:
                                p = psutil.Process(conn.pid)
                                usuario = p.username() or "desconhecido"
                            except:
                                pass
                            
                            sessoes.append({
                                "pid": conn.pid,
                                "ip_remoto": ip_remoto,
                                "porta": porta_remota,
                                "horario_inicio": datetime.now().isoformat(),
                                "status": "ativo",
                                "usuario": usuario,
                                "nome_computador": "localhost"
                            })
                            print(f"[{datetime.now().strftime('%H:%M:%S')}] ANYDESK DETECTADO: {ip_remoto}:{porta_remota}")
            except (AttributeError, TypeError, psutil.NoSuchProcess):
                continue
    
    except Exception as e:
        print(f"[ERRO] Falha ao detectar AnyDesk: {e}")
    
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
        except Exception as e:
            print(f"[ERRO] Erro na coleta: {e}")
        
        time.sleep(INTERVALO)

if __name__ == "__main__":
    print(f"[{datetime.now().strftime('%H:%M:%S')}] Sistema de Monitoramento iniciado em {SISTEMA_OPERACIONAL}...")
    print(f"[{datetime.now().strftime('%H:%M:%S')}] Monitorando AnyDesk e recursos do sistema...")
    coletar_e_enviar()
