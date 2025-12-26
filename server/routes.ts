import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { esquemaPayloadColeta } from "@shared/schema";
import { logAnydesk } from "./armazenamentoAnydesk";

let snapshotAtual = {
  sistema: { cpu: 0, memoria: { total: "0", usada: "0", percentual: 0 } },
  anydesk: { ativo: false, sessoesAtuais: [] as any[] },
  principaisProcessos: [] as any[],
  servicos: [] as any[],
  rede: [] as any[],
  ultimaAtualizacao: new Date().toISOString(),
};

  // Registro de acessos para monitoramento
  const logsAcesso: any[] = [];

  app.use((req, res, next) => {
    // Ignora requisições de API e estáticos internos para não poluir
    if (!req.path.startsWith("/api") && !req.path.includes(".")) {
      const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
      logsAcesso.unshift({
        ip,
        horario: new Date().toISOString(),
        rota: req.path,
        userAgent: req.headers["user-agent"]
      });
      // Mantém apenas os últimos 100 acessos
      if (logsAcesso.length > 100) logsAcesso.pop();
    }
    next();
  });

  app.get("/api/acessos", (req, res) => {
    res.json(logsAcesso);
  });

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
        servicos: payload.servicos?.map((s: any) => ({
          nome: s.nome,
          status: s.status,
          pid: s.pid
        })) || [],
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
    res.json(logAnydesk.obterSessoesAtivas());
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

  return httpServer;
}
