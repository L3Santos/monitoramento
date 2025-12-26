import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === DEFINIÇÕES DE TABELAS ===

// Monitoramento de conexões AnyDesk
export const sessoesAnydesk = pgTable("sessoes_anydesk", {
  id: serial("id").primaryKey(),
  ipRemoto: text("ip_remoto").notNull(),
  porta: integer("porta"),
  pid: integer("pid"),
  horarioInicio: timestamp("horario_inicio").notNull(),
  horarioFim: timestamp("horario_fim"),
  duracao: integer("duracao"), // em segundos
  status: text("status").notNull(), // 'conectado', 'desconectado'
});

// Métricas do sistema (histórico)
export const metricasSistema = pgTable("metricas_sistema", {
  id: serial("id").primaryKey(),
  usoCpu: integer("uso_cpu").notNull(), // porcentagem 0-100
  memoriaTotal: text("memoria_total").notNull(),
  memoriaUsada: text("memoria_usada").notNull(),
  memoriaPercentual: integer("memoria_percentual").notNull(),
  horario: timestamp("horario").defaultNow().notNull(),
});

// Eventos gerais (logs)
export const eventosSistema = pgTable("eventos_sistema", {
  id: serial("id").primaryKey(),
  tipo: text("tipo").notNull(), // 'processo', 'servico', 'rede', 'sistema'
  mensagem: text("mensagem").notNull(),
  detalhes: jsonb("detalhes"), // Dados adicionais em JSON
  horario: timestamp("horario").defaultNow().notNull(),
});

// === ESQUEMAS ===

export const esquemaInsercaoSessaoAnydesk = createInsertSchema(sessoesAnydesk).omit({ id: true });
export const esquemaInsercaoMetricasSistema = createInsertSchema(metricasSistema).omit({ id: true, horario: true });
export const esquemaInsercaoEventoSistema = createInsertSchema(eventosSistema).omit({ id: true, horario: true });

// === TIPOS ===

export type SessaoAnydesk = typeof sessoesAnydesk.$inferSelect;
export type InsercaoSessaoAnydesk = z.infer<typeof esquemaInsercaoSessaoAnydesk>;

export type MetricaSistema = typeof metricasSistema.$inferSelect;
export type InsercaoMetricaSistema = z.infer<typeof esquemaInsercaoMetricasSistema>;

export type EventoSistema = typeof eventosSistema.$inferSelect;
export type InsercaoEventoSistema = z.infer<typeof esquemaInsercaoEventoSistema>;

// Tipos para o Payload de Coleta (Recebido do Agente)
export const esquemaPayloadColeta = z.object({
  cpu: z.object({
    percentual: z.number(),
  }),
  memoria: z.object({
    total: z.string(),
    usada: z.string(),
    percentual: z.number(),
  }),
  anydesk: z.object({
    ativo: z.boolean(),
    sessoes: z.array(z.object({
      pid: z.number(),
      ip_remoto: z.string(),
      porta: z.number(),
      horario_inicio: z.string(), // ISO date
      status: z.string(),
    })).optional(),
  }),
  processos: z.array(z.object({
    pid: z.number(),
    nome: z.string(),
    cpu_percentual: z.number(),
    memoria_percentual: z.number(),
    usuario: z.string(),
  })).optional(),
  servicos: z.array(z.object({
    nome: z.string(),
    status: z.string(), // 'executando', 'parado'
    pid: z.number().optional(),
  })).optional(),
  rede: z.array(z.object({
    porta_local: z.number(),
    ip_remoto: z.string(),
    estado: z.string(),
    processo: z.string(),
  })).optional(),
});

export type PayloadColeta = z.infer<typeof esquemaPayloadColeta>;

// Tipos de Resposta da API para o Frontend
export interface DadosDashboard {
  sistema: {
    cpu: number;
    memoria: {
      total: string;
      usada: string;
      percentual: number;
    };
  };
  anydesk: {
    ativo: boolean;
    sessoesAtuais: {
      ipRemoto: string;
      porta: number;
      pid: number;
      horarioInicio: string;
    }[];
  };
  principaisProcessos: {
    pid: number;
    nome: string;
    cpu: number;
    memoria: number;
    usuario: string;
  }[];
  servicos: {
    nome: string;
    status: string;
    pid?: number;
  }[];
  rede: {
    porta: number;
    ipRemoto: string;
    estado: string;
    processo: string;
  }[];
  ultimaAtualizacao: string;
}
