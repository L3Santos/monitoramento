import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

// Hook para status em tempo real (polling)
export function useSystemStatus() {
  return useQuery({
    queryKey: ["/api/status"],
    queryFn: async () => {
      const res = await fetch("/api/status");
      if (!res.ok) throw new Error("Falha ao buscar status do sistema");
      return await res.json();
    },
    refetchInterval: 3000,
  });
}

// Hook para histórico do AnyDesk
export function useAnydeskHistory() {
  return useQuery({
    queryKey: ["/api/anydesk/historico"],
    queryFn: async () => {
      const res = await fetch("/api/anydesk/historico");
      if (!res.ok) throw new Error("Falha ao buscar histórico do AnyDesk");
      return await res.json();
    },
  });
}

// Hook para histórico de métricas (CPU/RAM)
export function useMetricsHistory() {
  return useQuery({
    queryKey: ["/api/metricas/historico"],
    queryFn: async () => {
      const res = await fetch("/api/metricas/historico");
      if (!res.ok) throw new Error("Falha ao buscar histórico de métricas");
      return await res.json();
    },
    refetchInterval: 10000,
  });
}
