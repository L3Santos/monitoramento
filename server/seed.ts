import { storage } from "./storage";

export async function semearBancoDeDados() {
  const metricasExistentes = await storage.obterUltimasMetricasSistema(1);
  if (metricasExistentes.length === 0) {
    console.log("Semeando banco de dados com dados iniciais...");

    await storage.criarMetricaSistema({
      usoCpu: 15,
      memoriaTotal: "16384",
      memoriaUsada: "8192",
      memoriaPercentual: 50,
    });

    await storage.criarSessaoAnydesk({
      ipRemoto: "192.168.1.105",
      porta: 54321,
      pid: 1234,
      horarioInicio: new Date(Date.now() - 3600000),
      horarioFim: new Date(Date.now() - 1800000),
      duracao: 1800,
      status: "desconectado",
    });

    await storage.criarEventoSistema({
      tipo: "sistema",
      mensagem: "Sistema iniciado com sucesso",
      detalhes: { versao: "1.0.0" },
    });

    console.log("Banco de dados semeado com sucesso!");
  }
}
