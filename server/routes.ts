import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { esquemaPayloadColeta } from "@shared/schema";
import { logAnydesk } from "./armazenamentoAnydesk";
import { execSync } from "child_process";
import * as os from "os";

let snapshotAtual = {
  sistema: { cpu: 0, memoria: { total: "0", usada: "0", percentual: 0 } },
  anydesk: { ativo: false, sessoesAtuais: [] as any[] },
  principaisProcessos: [] as any[],
  servicos: [] as any[],
  rede: [] as any[],
  ultimaAtualizacao: new Date().toISOString(),
};

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  app.post("/api/coletar", async (req, res) => {
    try {
      const payload = req.body;
      snapshotAtual = {
        sistema: {
          cpu: payload.cpu?.percentual || 0,
          memoria: payload.memoria || { total: "0", usada: "0", percentual: 0 },
        },
        anydesk: {
          ativo: (payload.anydesk?.sessoes || []).filter((s: any) => s.porta !== 443 && s.porta !== "443").length > 0,
          sessoesAtuais: payload.anydesk?.sessoes?.filter((s: any) => s.porta !== 443 && s.porta !== "443").map((s: any) => ({
            pid: s.pid,
            ipRemoto: s.ip_remoto,
            porta: s.porta,
            horarioInicio: s.horario_inicio,
            status: s.status
          })) || [],
        },
        principaisProcessos: payload.processos?.map((p: any) => ({
          pid: p.pid,
          nome: p.nome,
          cpu: p.cpu_percentual,
          memoria: p.memoria_percentual,
          usuario: p.usuario,
        })) || [],
        servicos: (payload.servicos || []).map((s: any) => ({
          nome: s.nome,
          status: s.status,
          pid: s.pid
        })).concat(
          // Forçar a exibição do serviço AnyDesk se houver sessões ativas
          (payload.anydesk?.sessoes || []).length > 0 && !(payload.servicos || []).some((s: any) => s.nome.toLowerCase().includes('anydesk'))
            ? [{ nome: 'anydesk', status: 'executando', pid: payload.anydesk.sessoes[0].pid }]
            : []
        ),
        rede: payload.rede?.map((n: any) => ({
          porta: n.porta_local,
          ipRemoto: n.ip_remoto,
          estado: n.estado,
          processo: n.processo,
        })) || [],
        ultimaAtualizacao: new Date().toISOString(),
      };

      if (payload.cpu && payload.memoria) {
        await storage.criarMetricaSistema({
          usoCpu: Math.round(payload.cpu.percentual),
          memoriaTotal: String(payload.memoria.total),
          memoriaUsada: String(payload.memoria.usada),
          memoriaPercentual: Math.round(payload.memoria.percentual),
        });
      }

      if (payload.anydesk?.sessoes) {
        for (const s of payload.anydesk.sessoes) {
          // Bloqueio duplo: porta 443 não entra no histórico
          if (s.porta === 443 || s.porta === "443") continue;
          
          await storage.criarSessaoAnydesk({
            ipRemoto: s.ip_remoto,
            porta: s.porta,
            pid: s.pid,
            horarioInicio: new Date(s.horario_inicio),
            status: s.status,
          });
        }
      }
      res.json({ sucesso: true });
    } catch (err) {
      console.error("Erro no processamento do payload:", err);
      res.status(400).json({ mensagem: "Erro no processamento" });
    }
  });

  app.get(api.status.path, (req, res) => res.json(snapshotAtual));

  app.get("/api/anydesk/historico", async (req, res) => {
    res.json(await storage.obterSessoesAnydesk());
  });

  app.get("/api/anydesk/log-completo", (req, res) => {
    const limite = parseInt(req.query.limite as string) || 500;
    res.json(logAnydesk.obterTodosRegistros(limite));
  });

  app.get("/api/anydesk/ativos", (req, res) => {
    res.json(snapshotAtual.anydesk.sessoesAtuais);
  });

  app.get("/api/anydesk/stats", (req, res) => {
    res.json(logAnydesk.obterEstatisticas());
  });

  app.post("/api/anydesk/registrar-sessao", (req, res) => {
    try {
      const { ipRemoto, porta, usuario } = req.body;
      
      if (!ipRemoto || !porta) {
        return res.status(400).json({ mensagem: "IP remoto e porta são obrigatórios" });
      }

      const pid = Math.floor(Math.random() * 100000) + 1000;
      const registro = logAnydesk.registrarInicio({
        ipRemoto,
        porta: Number(porta),
        pid,
        usuario: usuario || "remoto",
        nomeComputador: "anydesk"
      });

      res.json({ sucesso: true, registro });
    } catch (err) {
      console.error("Erro ao registrar sessão AnyDesk:", err);
      res.status(500).json({ mensagem: "Erro ao registrar sessão" });
    }
  });

  app.post("/api/anydesk/finalizar-sessao", (req, res) => {
    try {
      const { ipRemoto, pid } = req.body;
      
      if (!ipRemoto || !pid) {
        return res.status(400).json({ mensagem: "IP remoto e PID são obrigatórios" });
      }

      const registro = logAnydesk.registrarFim(ipRemoto, Number(pid), "finalização manual");
      
      if (!registro) {
        return res.status(404).json({ mensagem: "Sessão não encontrada" });
      }

      res.json({ sucesso: true, registro });
    } catch (err) {
      console.error("Erro ao finalizar sessão AnyDesk:", err);
      res.status(500).json({ mensagem: "Erro ao finalizar sessão" });
    }
  });

  app.get("/api/metricas/historico", async (req, res) => res.json(await storage.obterUltimasMetricasSistema(20)));

  // Endpoints de Firewall
  app.get("/api/firewall/status", async (req, res) => {
    try {
      const sistemaOp = os.platform();
      let statusFirewall = false;
      let portasLiberadas: number[] = [];

      try {
        if (sistemaOp === "win32") {
          const output = execSync("netsh advfirewall show allprofiles state", { encoding: "utf-8" });
          statusFirewall = output.includes("State                                 : on");
          
          try {
            const rulesOutput = execSync("netsh advfirewall firewall show rule name=all dir=in action=allow", { encoding: "utf-8" });
            const regex = /localport\s*:\s*(\d+)/gi;
            let match;
            while ((match = regex.exec(rulesOutput)) !== null) {
              const porta = parseInt(match[1]);
              if (porta > 1000 && !portasLiberadas.includes(porta)) {
                portasLiberadas.push(porta);
              }
            }
          } catch {
            portasLiberadas = [];
          }
        } else {
          try {
            const output = execSync("sudo ufw status numbered 2>/dev/null || true", { encoding: "utf-8" });
            statusFirewall = output.includes("Status: active");
            
            try {
              const statusLines = execSync("sudo ufw status | grep ALLOW || true", { encoding: "utf-8" });
              const lines = statusLines.split("\n");
              for (const line of lines) {
                const match = line.match(/(\d+)\/tcp\s+ALLOW/);
                if (match) {
                  const porta = parseInt(match[1]);
                  if (!portasLiberadas.includes(porta)) {
                    portasLiberadas.push(porta);
                  }
                }
              }
            } catch {
              portasLiberadas = [];
            }
          } catch {
            statusFirewall = false;
          }
        }
      } catch {
        // Ignorar erros de comando
      }

      portasLiberadas.sort((a, b) => a - b);

      res.json({
        ativo: statusFirewall,
        portasLiberadas: portasLiberadas,
        sistemaOperacional: sistemaOp === "win32" ? "Windows" : "Linux/Unix",
        mensagem: "Status do firewall obtido com sucesso"
      });
    } catch (err) {
      console.error("Erro ao obter status do firewall:", err);
      res.status(500).json({ mensagem: "Erro ao obter status do firewall" });
    }
  });

  app.post("/api/firewall/toggle", async (req, res) => {
    try {
      const { ativar } = req.body;
      const sistemaOp = os.platform();
      let sucesso = false;
      let mensagem = "";

      try {
        if (sistemaOp === "win32") {
          const comando = ativar 
            ? "netsh advfirewall set allprofiles state on" 
            : "netsh advfirewall set allprofiles state off";
          execSync(comando, { stdio: "inherit" });
          sucesso = true;
          mensagem = ativar ? "Firewall ATIVADO com sucesso" : "Firewall DESATIVADO com sucesso";
        } else {
          const comando = ativar 
            ? "sudo ufw --force enable" 
            : "sudo ufw disable";
          execSync(comando, { stdio: "inherit" });
          sucesso = true;
          mensagem = ativar ? "Firewall ATIVADO com sucesso" : "Firewall DESATIVADO com sucesso";
        }
      } catch (cmdErr) {
        mensagem = "Erro ao executar comando de firewall. Pode ser necessário permissões de administrador.";
      }

      res.json({
        ativo: ativar,
        porta50001: false,
        sistemaOperacional: sistemaOp === "win32" ? "Windows" : "Linux/Unix",
        mensagem
      });
    } catch (err) {
      console.error("Erro ao alternar firewall:", err);
      res.status(500).json({ mensagem: "Erro ao alternar firewall" });
    }
  });

  app.post("/api/firewall/porta/adicionar", async (req, res) => {
    try {
      const { porta } = req.body;
      
      if (!porta || porta < 1 || porta > 65535) {
        return res.status(400).json({ mensagem: "Porta inválida (1-65535)" });
      }

      const sistemaOp = os.platform();
      let mensagem = "";

      try {
        if (sistemaOp === "win32") {
          const nomeRegra = `Porta${porta}`;
          const comando = `netsh advfirewall firewall add rule name="${nomeRegra}" dir=in action=allow protocol=tcp localport=${porta}`;
          execSync(comando, { stdio: "pipe" });
          mensagem = `Porta ${porta} liberada com sucesso`;
        } else {
          const comando = `sudo ufw allow ${porta}/tcp 2>/dev/null || sudo ufw allow ${porta}`;
          execSync(comando, { stdio: "pipe" });
          mensagem = `Porta ${porta} liberada com sucesso`;
        }
      } catch (cmdErr) {
        mensagem = "Erro ao executar comando. Verifique permissões ou se a porta já existe.";
      }

      // Retorna status atualizado
      const statusRes = await fetch("http://localhost:5000/api/firewall/status");
      if (statusRes.ok) {
        const statusData = await statusRes.json();
        return res.json({ ...statusData, mensagem });
      }

      res.json({
        ativo: false,
        portasLiberadas: [porta],
        sistemaOperacional: sistemaOp === "win32" ? "Windows" : "Linux/Unix",
        mensagem
      });
    } catch (err) {
      console.error("Erro ao adicionar porta:", err);
      res.status(500).json({ mensagem: "Erro ao adicionar porta do firewall" });
    }
  });

  app.post("/api/firewall/porta/remover", async (req, res) => {
    try {
      const { porta } = req.body;
      
      if (!porta || porta < 1 || porta > 65535) {
        return res.status(400).json({ mensagem: "Porta inválida (1-65535)" });
      }

      const sistemaOp = os.platform();
      let mensagem = "";

      try {
        if (sistemaOp === "win32") {
          const nomeRegra = `Porta${porta}`;
          const comando = `netsh advfirewall firewall delete rule name="${nomeRegra}"`;
          try {
            execSync(comando, { stdio: "pipe" });
          } catch {
            // Regra pode não existir
          }
          mensagem = `Porta ${porta} bloqueada com sucesso`;
        } else {
          const comando = `sudo ufw delete allow ${porta}/tcp 2>/dev/null || sudo ufw delete allow ${porta}`;
          try {
            execSync(comando, { stdio: "pipe" });
          } catch {
            // Regra pode não existir
          }
          mensagem = `Porta ${porta} bloqueada com sucesso`;
        }
      } catch (cmdErr) {
        mensagem = "Erro ao executar comando de firewall.";
      }

      // Retorna status atualizado
      const statusRes = await fetch("http://localhost:5000/api/firewall/status");
      if (statusRes.ok) {
        const statusData = await statusRes.json();
        return res.json({ ...statusData, mensagem });
      }

      res.json({
        ativo: false,
        portasLiberadas: [],
        sistemaOperacional: sistemaOp === "win32" ? "Windows" : "Linux/Unix",
        mensagem
      });
    } catch (err) {
      console.error("Erro ao remover porta:", err);
      res.status(500).json({ mensagem: "Erro ao remover porta do firewall" });
    }
  });

  return httpServer;
}
