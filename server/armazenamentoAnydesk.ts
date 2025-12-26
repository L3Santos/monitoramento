import fs from 'fs';
import path from 'path';

const DIRETORIO_DADOS = path.join(process.cwd(), 'dados');
const ARQUIVO_LOG_ANYDESK = path.join(DIRETORIO_DADOS, 'log_anydesk_completo.jsonl');

if (!fs.existsSync(DIRETORIO_DADOS)) {
  fs.mkdirSync(DIRETORIO_DADOS);
}

export interface RegistroSessaoAnydesk {
  id: string;
  ipRemoto: string;
  porta: number;
  pid: number;
  horarioInicio: string; // ISO string
  horarioFim?: string; // ISO string
  duracao?: number; // em segundos
  usuario?: string;
  nomeComputador?: string;
  status: 'conectado' | 'desconectado';
  motivo?: string; // razão da desconexão
}

export class GerenciadorLogAnydesk {
  private sessoesAtivas: Map<string, RegistroSessaoAnydesk> = new Map();

  constructor() {
    // Carrega sessões ativas do arquivo
    this.carregarSessoesAtivas();
  }

  /**
   * Cria uma chave única para rastrear a sessão
   */
  private criarChaveSessao(ipRemoto: string, pid: number): string {
    return `${ipRemoto}:${pid}`;
  }

  /**
   * Registra uma nova sessão começando
   */
  registrarInicio(sessao: {
    ipRemoto: string;
    porta: number;
    pid: number;
    usuario?: string;
    nomeComputador?: string;
  }): RegistroSessaoAnydesk {
    const chave = this.criarChaveSessao(sessao.ipRemoto, sessao.pid);
    const agora = new Date().toISOString();
    
    const registro: RegistroSessaoAnydesk = {
      id: `${chave}_${Date.now()}`,
      ipRemoto: sessao.ipRemoto,
      porta: sessao.porta,
      pid: sessao.pid,
      horarioInicio: agora,
      usuario: sessao.usuario || 'desconhecido',
      nomeComputador: sessao.nomeComputador || 'desconhecido',
      status: 'conectado',
    };

    this.sessoesAtivas.set(chave, registro);
    this.salvarLogAnydesk(registro);

    console.log(`[LOG_ANYDESK] CONEXÃO INICIADA - IP: ${sessao.ipRemoto}, PID: ${sessao.pid}, Hora: ${agora}`);

    return registro;
  }

  /**
   * Registra o término de uma sessão
   */
  registrarFim(ipRemoto: string, pid: number, motivo = 'desconexão normal'): RegistroSessaoAnydesk | null {
    const chave = this.criarChaveSessao(ipRemoto, pid);
    const sessao = this.sessoesAtivas.get(chave);

    if (!sessao) {
      return null;
    }

    const agora = new Date().toISOString();
    const duracao = Math.floor(
      (new Date(agora).getTime() - new Date(sessao.horarioInicio).getTime()) / 1000
    );

    const sessaoFinalizada: RegistroSessaoAnydesk = {
      ...sessao,
      horarioFim: agora,
      duracao,
      status: 'desconectado',
      motivo,
    };

    this.sessoesAtivas.delete(chave);
    this.salvarLogAnydesk(sessaoFinalizada);

    const durStr = this.formatarDuracao(duracao);
    console.log(`[LOG_ANYDESK] DESCONECTADO - IP: ${ipRemoto}, Duração: ${durStr}, Hora: ${agora}`);

    return sessaoFinalizada;
  }

  /**
   * Obtém todas as sessões ativas
   */
  obterSessoesAtivas(): RegistroSessaoAnydesk[] {
    return Array.from(this.sessoesAtivas.values());
  }

  /**
   * Salva o registro no arquivo JSONL (append-only)
   * Nunca deleta, apenas adiciona
   */
  private salvarLogAnydesk(registro: RegistroSessaoAnydesk): void {
    try {
      const linha = JSON.stringify({
        ...registro,
        dataRegistro: new Date().toISOString(),
      });
      fs.appendFileSync(ARQUIVO_LOG_ANYDESK, linha + '\n');
    } catch (erro) {
      console.error('[LOG_ANYDESK] Erro ao salvar log:', erro);
    }
  }

  /**
   * Lê todos os registros do log
   */
  obterTodosRegistros(limite = 1000): RegistroSessaoAnydesk[] {
    try {
      if (!fs.existsSync(ARQUIVO_LOG_ANYDESK)) {
        return [];
      }

      const conteudo = fs.readFileSync(ARQUIVO_LOG_ANYDESK, 'utf-8');
      const linhas = conteudo.trim().split('\n').filter(l => l.length > 0);

      return linhas
        .slice(-limite) // Últimos N registros
        .map((linha) => {
          try {
            const obj = JSON.parse(linha);
            // Remove dataRegistro antes de retornar
            const { dataRegistro, ...registro } = obj;
            return registro;
          } catch {
            return null;
          }
        })
        .filter((r): r is RegistroSessaoAnydesk => r !== null)
        .reverse(); // Mais recentes primeiro
    } catch (erro) {
      console.error('[LOG_ANYDESK] Erro ao ler log:', erro);
      return [];
    }
  }

  /**
   * Obtém estatísticas do log
   */
  obterEstatisticas() {
    const registros = this.obterTodosRegistros(Infinity);
    const conectados = registros.filter(r => r.status === 'conectado').length;
    const desconectados = registros.filter(r => r.status === 'desconectado').length;

    return {
      totalRegistros: registros.length,
      sessoesAtuais: this.sessoesAtivas.size,
      totalConectados: conectados,
      totalDesconectados: desconectados,
      ipsUnicos: new Set(registros.map(r => r.ipRemoto)).size,
    };
  }

  /**
   * Carrega sessões ativas do arquivo na memória
   */
  private carregarSessoesAtivas(): void {
    try {
      const registros = this.obterTodosRegistros(Infinity);
      
      // Recarrega as sessões que ainda estão em "conectado"
      registros.forEach(registro => {
        if (registro.status === 'conectado') {
          const chave = this.criarChaveSessao(registro.ipRemoto, registro.pid);
          this.sessoesAtivas.set(chave, registro);
        }
      });

      console.log(`[LOG_ANYDESK] Carregadas ${this.sessoesAtivas.size} sessões ativas do arquivo`);
    } catch (erro) {
      console.error('[LOG_ANYDESK] Erro ao carregar sessões ativas:', erro);
    }
  }

  /**
   * Formata duração em segundos para string legível
   */
  private formatarDuracao(segundos: number): string {
    const horas = Math.floor(segundos / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);
    const segs = segundos % 60;

    if (horas > 0) {
      return `${horas}h ${minutos}m ${segs}s`;
    } else if (minutos > 0) {
      return `${minutos}m ${segs}s`;
    } else {
      return `${segs}s`;
    }
  }
}

export const logAnydesk = new GerenciadorLogAnydesk();
