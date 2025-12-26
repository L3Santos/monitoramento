import fs from 'fs';
import path from 'path';
import { 
  type SessaoAnydesk, 
  type InsercaoSessaoAnydesk,
  type MetricaSistema, 
  type InsercaoMetricaSistema,
  type EventoSistema,
  type InsercaoEventoSistema
} from "@shared/schema";
import { logAnydesk } from './armazenamentoAnydesk';

const DIRETORIO_DADOS = path.join(process.cwd(), 'dados');
const DIAS_RETENCAO_LOGS = 2;

if (!fs.existsSync(DIRETORIO_DADOS)) {
  fs.mkdirSync(DIRETORIO_DADOS);
}

const ARQUIVO_SESSOES = path.join(DIRETORIO_DADOS, 'sessoes_anydesk.json');
const ARQUIVO_METRICAS = path.join(DIRETORIO_DADOS, 'metricas_sistema.json');
const ARQUIVO_EVENTOS = path.join(DIRETORIO_DADOS, 'eventos_sistema.json');

const inicializarArquivo = (caminho: string) => {
  if (!fs.existsSync(caminho)) {
    fs.writeFileSync(caminho, JSON.stringify([]));
  }
};

inicializarArquivo(ARQUIVO_SESSOES);
inicializarArquivo(ARQUIVO_METRICAS);
inicializarArquivo(ARQUIVO_EVENTOS);

/**
 * Remove registros com mais de X dias
 */
const limparRegistrosAntigos = (caminho: string, diasRetencao: number) => {
  try {
    const dados = JSON.parse(fs.readFileSync(caminho, 'utf-8'));
    if (!Array.isArray(dados)) return;

    const agora = new Date();
    const limiteData = new Date(agora.getTime() - diasRetencao * 24 * 60 * 60 * 1000);

    const dadosFiltratos = dados.filter((item: any) => {
      const horario = item.horario ? new Date(item.horario) : null;
      return horario && horario > limiteData;
    });

    if (dadosFiltratos.length !== dados.length) {
      fs.writeFileSync(caminho, JSON.stringify(dadosFiltratos, null, 2));
      console.log(`[LIMPEZA] ${caminho}: removidos ${dados.length - dadosFiltratos.length} registros antigos`);
    }
  } catch (erro) {
    console.error(`[LIMPEZA] Erro ao limpar ${caminho}:`, erro);
  }
};

// Inicia limpeza automática a cada 1 hora
setInterval(() => {
  limparRegistrosAntigos(ARQUIVO_METRICAS, DIAS_RETENCAO_LOGS);
  limparRegistrosAntigos(ARQUIVO_EVENTOS, DIAS_RETENCAO_LOGS);
}, 60 * 60 * 1000);

export interface IArmazenamento {
  criarSessaoAnydesk(sessao: InsercaoSessaoAnydesk): Promise<SessaoAnydesk>;
  obterSessoesAnydesk(): Promise<SessaoAnydesk[]>;
  obterSessoesAnydeskAtivas(): Promise<SessaoAnydesk[]>;
  criarMetricaSistema(metrica: InsercaoMetricaSistema): Promise<MetricaSistema>;
  obterUltimasMetricasSistema(limite?: number): Promise<MetricaSistema[]>;
  criarEventoSistema(evento: InsercaoEventoSistema): Promise<EventoSistema>;
  obterEventosSistema(limite?: number): Promise<EventoSistema[]>;
}

export class ArmazenamentoArquivo implements IArmazenamento {
  private ler<T>(caminho: string): T[] {
    try {
      return JSON.parse(fs.readFileSync(caminho, 'utf-8'));
    } catch {
      return [];
    }
  }

  private gravar<T>(caminho: string, dados: T[]): void {
    fs.writeFileSync(caminho, JSON.stringify(dados, null, 2));
  }

  async criarSessaoAnydesk(sessao: InsercaoSessaoAnydesk): Promise<SessaoAnydesk> {
    const sessoes = this.ler<SessaoAnydesk>(ARQUIVO_SESSOES);
    const nova: SessaoAnydesk = { ...sessao, id: sessoes.length + 1 };
    sessoes.push(nova);
    this.gravar(ARQUIVO_SESSOES, sessoes);

    // TAMBÉM registra no log persistente do AnyDesk
    logAnydesk.registrarInicio({
      ipRemoto: sessao.ipRemoto,
      porta: sessao.porta || 0,
      pid: sessao.pid || 0,
    });

    return nova;
  }

  async obterSessoesAnydesk(): Promise<SessaoAnydesk[]> {
    // Retorna todos os registros do log persistente
    return logAnydesk.obterTodosRegistros(100).map((r, i) => ({
      id: i,
      ipRemoto: r.ipRemoto,
      porta: r.porta,
      pid: r.pid,
      horarioInicio: new Date(r.horarioInicio),
      horarioFim: r.horarioFim ? new Date(r.horarioFim) : undefined,
      duracao: r.duracao,
      status: r.status,
    }));
  }

  async obterSessoesAnydeskAtivas(): Promise<SessaoAnydesk[]> {
    const ativas = logAnydesk.obterSessoesAtivas();
    return ativas.map((r, i) => ({
      id: i,
      ipRemoto: r.ipRemoto,
      porta: r.porta,
      pid: r.pid,
      horarioInicio: new Date(r.horarioInicio),
      horarioFim: undefined,
      duracao: undefined,
      status: r.status,
    }));
  }

  async criarMetricaSistema(metrica: InsercaoMetricaSistema): Promise<MetricaSistema> {
    const metricas = this.ler<MetricaSistema>(ARQUIVO_METRICAS);
    const nova: MetricaSistema = { ...metrica, id: metricas.length + 1, horario: new Date() };
    metricas.push(nova);
    this.gravar(ARQUIVO_METRICAS, metricas);
    return nova;
  }

  async obterUltimasMetricasSistema(limite = 50): Promise<MetricaSistema[]> {
    return this.ler<MetricaSistema>(ARQUIVO_METRICAS).reverse().slice(0, limite);
  }

  async criarEventoSistema(evento: InsercaoEventoSistema): Promise<EventoSistema> {
    const eventos = this.ler<EventoSistema>(ARQUIVO_EVENTOS);
    const novo: EventoSistema = { ...evento, id: eventos.length + 1, horario: new Date() };
    eventos.push(novo);
    this.gravar(ARQUIVO_EVENTOS, eventos);
    return novo;
  }

  async obterEventosSistema(limite = 100): Promise<EventoSistema[]> {
    return this.ler<EventoSistema>(ARQUIVO_EVENTOS).reverse().slice(0, limite);
  }
}

export const storage = new ArmazenamentoArquivo();
