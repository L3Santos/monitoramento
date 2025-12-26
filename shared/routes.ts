import { z } from 'zod';
import { 
  esquemaInsercaoSessaoAnydesk, 
  esquemaInsercaoMetricasSistema, 
  sessoesAnydesk, 
  metricasSistema,
  eventosSistema,
  esquemaPayloadColeta
} from './schema';

export const esquemasErro = {
  validacao: z.object({
    mensagem: z.string(),
    campo: z.string().optional(),
  }),
  interno: z.object({
    mensagem: z.string(),
  }),
};

export const api = {
  // Rota para o AGENTE enviar dados
  coletar: {
    method: 'POST' as const,
    path: '/api/coletar',
    input: esquemaPayloadColeta,
    responses: {
      200: z.object({ sucesso: z.boolean() }),
      400: esquemasErro.validacao,
    },
  },
  // Rotas para o DASHBOARD consultar dados
  status: {
    method: 'GET' as const,
    path: '/api/status',
    responses: {
      200: z.object({
        sistema: z.object({
          cpu: z.number(),
          memoria: z.object({
            total: z.string(),
            usada: z.string(),
            percentual: z.number(),
          }),
        }),
        anydesk: z.object({
          ativo: z.boolean(),
          sessoesAtuais: z.array(z.any()),
        }),
        principaisProcessos: z.array(z.object({
          pid: z.number(),
          nome: z.string(),
          cpu: z.number(),
          memoria: z.number(),
          usuario: z.string(),
        })),
        servicos: z.array(z.object({
          nome: z.string(),
          status: z.string(),
          pid: z.number().optional(),
        })),
        rede: z.array(z.object({
          porta: z.number(),
          ipRemoto: z.string(),
          estado: z.string(),
          processo: z.string(),
        })),
        ultimaAtualizacao: z.string(),
      }),
    },
  },
  anydesk: {
    historico: {
      method: 'GET' as const,
      path: '/api/anydesk/historico',
      responses: {
        200: z.array(z.custom<typeof sessoesAnydesk.$inferSelect>()),
      },
    }
  },
  metricas: {
    historico: {
      method: 'GET' as const,
      path: '/api/metricas/historico',
      responses: {
        200: z.array(z.custom<typeof metricasSistema.$inferSelect>()),
      },
    }
  }
};

export function construirUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
