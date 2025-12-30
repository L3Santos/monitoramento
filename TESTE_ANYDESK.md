# Teste de Detecção de AnyDesk - Guia Completo

## Configuração Inicial

### No seu PC Linux/Ubuntu
```bash
cd seu_projeto
chmod +x rodar.sh
./rodar.sh
```

### No seu PC Windows
```cmd
cd seu_projeto
rodar.bat
```

O script vai instalar TUDO automaticamente e abrir o painel em http://localhost:5000.

## Cenários de Teste

### Cenário 1: Máquina Local (Mesma Rede)

1. **Computador A** (onde roda o script):
   - Roda `./rodar.sh` ou `rodar.bat`
   - AnyDesk abre automaticamente ou manualmente

2. **Computador B** (mesma rede, IP 192.168.1.200):
   - Abre o AnyDesk
   - Digita o ID do Computador A
   - Inicia conexão

3. **Resultado esperado no painel:**
   ```
   IP Remoto: 192.168.1.200
   Porta: 50001 (ou outra)
   Status: ATIVO
   Usuário: seu_usuario
   ```

4. **Nos logs (console):**
   ```
   [HH:MM:SS] ANYDESK DETECTADO: 192.168.1.200:50001
   ```

### Cenário 2: Máquina Externa (Internet)

1. **Computador A** (seu PC):
   - Roda `./rodar.sh` ou `rodar.bat`
   - AnyDesk abierto

2. **Computador C** (fora da rede, IP 200.150.100.50):
   - Acessa seu AnyDesk via ID
   - Faz conexão remota

3. **Resultado esperado no painel:**
   ```
   IP Remoto: 200.150.100.50
   Porta: 50001 (ou outra)
   Status: ATIVO
   Usuário: seu_usuario
   ```

4. **Nos logs:**
   ```
   [HH:MM:SS] ANYDESK DETECTADO: 200.150.100.50:50001
   ```

### Cenário 3: Múltiplas Conexões Simultâneas

1. **Máquina A**: Roda o script com AnyDesk
2. **Máquina B**: Conecta (IP 192.168.1.200)
3. **Máquina C**: Conecta (IP 200.50.25.10)

**Resultado esperado no painel (Aba AnyDesk):**
```
Sessão 1: 192.168.1.200:50001
Sessão 2: 200.50.25.10:50002
```

## O Que o Coletor Detecta

### ✅ CAPTURA
- ✓ Qualquer IP de máquina externa
- ✓ Qualquer IP de rede local
- ✓ Qualquer porta EXCEPT 443
- ✓ Conexões ESTABLISHED
- ✓ Múltiplas conexões simultâneas

### ❌ NÃO CAPTURA
- ✗ IP 0.0.0.0 (inválido)
- ✗ Porta 443 (heartbeat interno)
- ✗ Conexões que não são ESTABLISHED

## Verificação Manual

### Ver processos AnyDesk rodando
```bash
# Linux
ps aux | grep anydesk

# Windows PowerShell
Get-Process -Name AnyDesk
```

### Ver conexões de rede do AnyDesk
```bash
# Linux
netstat -an | grep ESTABLISHED | grep -i anydesk

# Windows PowerShell
netstat -an | findstr ESTABLISHED | findstr anydesk
```

### Testar coletor manualmente
```bash
python3 coletor.py
# Veja os logs em tempo real no console
# Ctrl+C para parar
```

## Logs

### Localizações

**Linux/Mac:**
```bash
./coletor.log        # Log do coletor
tail -f coletor.log  # Watch em tempo real
```

**Windows:**
```cmd
coletor.log          # Mesmo diretório
```

### Exemplo de log com detecção bem-sucedida
```
[18:02:45] Sistema de Monitoramento iniciado em Linux...
[18:02:45] Monitorando AnyDesk e recursos do sistema...
[18:02:50] ANYDESK DETECTADO: 192.168.1.100:50001
[18:02:55] ANYDESK DETECTADO: 200.150.100.50:50002
```

## FAQ - Diagnóstico

### "AnyDesk não aparece no painel"

**1. Verificar se processo existe:**
```bash
ps aux | grep -i anydesk
```
Se não listar nada, AnyDesk não está rodando.

**2. Verificar se tem conexão ESTABLISHED:**
```bash
netstat -an | grep ESTABLISHED
```
Se não houver conexão, ninguém está acessando.

**3. Verificar erro no coletor:**
```bash
tail -20 coletor.log
```
Procure por linhas começando com `[ERRO]`.

**4. Reiniciar tudo:**
```bash
# Parar script
Ctrl+C

# Parar coletor
pkill -f "python3 coletor.py"

# Reiniciar
./rodar.sh
```

### "Aparece com IP inválido"

O coletor REJEITA automaticamente:
- 0.0.0.0 (não é IP válido)
- Porta 443 (servidor interno)

Se aparecer outro IP estranho, é uma máquina real se conectando.

### "Muitas conexões aparecendo"

Cada máquina que se conecta = 1 entrada no painel.

Se tiver muitas, significa muitas máquinas acessando o AnyDesk.

## Checklist de Teste

- [ ] Script rodando (`./rodar.sh` ou `rodar.bat`)
- [ ] AnyDesk aberto no computador A
- [ ] Computador B conecta via AnyDesk
- [ ] Painel mostra IP do computador B
- [ ] Console mostra log da detecção
- [ ] Múltiplas conexões testadas
- [ ] Conexão remota testada
- [ ] Desconexão remove da lista

## Conclusão

Sistema está pronto para detectar **QUALQUER máquina** que acesse AnyDesk:
- ✅ Rede local
- ✅ Internet externa
- ✅ Múltiplas conexões
- ✅ Logs em tempo real
