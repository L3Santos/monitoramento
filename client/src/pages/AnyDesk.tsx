import { useAnydeskHistory, useSystemStatus } from "@/hooks/use-monitor";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { TerminalTable } from "@/components/ui/TerminalTable";
import { ShieldAlert, CheckCircle2, History as HistoryIcon, Database } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";

export default function AnyDesk() {
  const { data: status, isLoading: carregandoStatus } = useSystemStatus();
  const { data: historico, isLoading: carregandoHistorico } = useAnydeskHistory();

  const { data: logCompleto, isLoading: carregandoLog } = useQuery({
    queryKey: ["/api/anydesk/log-completo"],
    queryFn: async () => {
      const res = await fetch("/api/anydesk/log-completo?limite=200");
      if (!res.ok) throw new Error("Falha ao buscar log completo");
      return res.json();
    },
    refetchInterval: 5000,
  });

  const { data: estatisticas } = useQuery({
    queryKey: ["/api/anydesk/stats"],
    queryFn: async () => {
      const res = await fetch("/api/anydesk/stats");
      if (!res.ok) throw new Error("Falha ao buscar estatísticas");
      return res.json();
    },
    refetchInterval: 10000,
  });

  const estaAtivo = status?.anydesk.ativo;

  return (
    <DashboardLayout>
      <div className="max-w-[1600px] mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold font-mono tracking-tight text-glow">Monitor AnyDesk</h2>
            <p className="text-muted-foreground">Gerenciamento e histórico de conexões remotas.</p>
          </div>
        </div>

        <div className={cn(
          "p-6 rounded-xl border transition-all",
          estaAtivo ? 'bg-destructive/10 border-destructive/30' : 'bg-primary/5 border-primary/20'
        )}>
          <div className="flex items-center gap-4">
            <div className={cn(
              "p-3 rounded-full",
              estaAtivo ? 'bg-destructive/20 text-destructive' : 'bg-primary/20 text-primary'
            )}>
              {estaAtivo ? <ShieldAlert className="w-8 h-8" /> : <CheckCircle2 className="w-8 h-8" />}
            </div>
            <div>
              <h3 className="text-xl font-bold font-mono">
                Status: {carregandoStatus ? "..." : (estaAtivo ? "CONEXÃO REMOTA ATIVA" : "Seguro (Sem conexões)")}
              </h3>
              <p className="text-muted-foreground text-sm mt-1">
                {estaAtivo 
                  ? "Há uma ou mais sessões remotas ativas neste momento. Monitore com atenção." 
                  : "Nenhuma sessão do AnyDesk detectada no momento."}
              </p>
            </div>
          </div>
        </div>

        {estaAtivo && (
          <div className="space-y-4">
             <h3 className="text-lg font-bold font-mono flex items-center gap-2 text-destructive">
               <span className="w-2 h-2 rounded-full bg-destructive animate-pulse"></span>
               Sessões Ativas Agora
             </h3>
             <TerminalTable
              data={status?.anydesk.sessoesAtuais || []}
              isLoading={carregandoStatus}
              columns={[
                { header: "PID", accessorKey: "pid" },
                { header: "IP Remoto", accessorKey: "ipRemoto", className: "font-mono font-bold text-destructive" },
                { header: "Porta", accessorKey: "porta" },
                { header: "Início", cell: (s: any) => new Date(s.horarioInicio).toLocaleTimeString() },
                { header: "Duração", cell: (s: any) => {
                    const diff = Math.floor((new Date().getTime() - new Date(s.horarioInicio).getTime()) / 1000 / 60);
                    return `${diff} min`;
                }},
              ]}
            />
          </div>
        )}

        <div className="space-y-6 pt-4">
          {estatisticas && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-card border border-border rounded-lg p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Registrado</p>
                <p className="text-2xl font-mono font-bold text-primary mt-1">{estatisticas.totalRegistros}</p>
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">IPs Únicos</p>
                <p className="text-2xl font-mono font-bold text-primary mt-1">{estatisticas.ipsUnicos}</p>
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Conectados</p>
                <p className="text-2xl font-mono font-bold text-destructive mt-1">{estatisticas.totalConectados}</p>
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Desconectados</p>
                <p className="text-2xl font-mono font-bold text-primary mt-1">{estatisticas.totalDesconectados}</p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="text-lg font-bold font-mono flex items-center gap-2">
               <Database className="w-4 h-4 text-muted-foreground" />
               Log Completo Persistente (Nunca deletado)
            </h3>
            <div className="text-xs text-muted-foreground bg-muted rounded p-3 border border-border">
              📝 Este log é armazenado permanentemente e nunca é deletado. Contém todos os registros históricos de conexões AnyDesk com informações completas: IP, porta, hora de início, hora de término e duração.
            </div>
            <TerminalTable
              data={logCompleto || []}
              isLoading={carregandoLog}
              emptyMessage="Nenhum registro no log completo."
              columns={[
                { header: "IP Remoto", accessorKey: "ipRemoto", className: "font-mono text-primary" },
                { header: "Porta", accessorKey: "porta", className: "w-20" },
                { header: "PID", accessorKey: "pid", className: "w-20" },
                { header: "Início", cell: (r: any) => format(new Date(r.horarioInicio), "dd/MM HH:mm:ss", { locale: ptBR }) },
                { header: "Fim", cell: (r: any) => r.horarioFim ? format(new Date(r.horarioFim), "HH:mm:ss") : "—" },
                { header: "Duração", cell: (r: any) => r.duracao ? `${Math.floor(r.duracao / 60)}m ${r.duracao % 60}s` : "—" },
                { header: "Status", accessorKey: "status", className: "uppercase text-xs font-bold" },
              ]}
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold font-mono flex items-center gap-2">
               <HistoryIcon className="w-4 h-4 text-muted-foreground" />
               Histórico de Conexões
            </h3>
            <TerminalTable
              data={historico || []}
              isLoading={carregandoHistorico}
              emptyMessage="Nenhum histórico de conexão registrado."
              columns={[
                { header: "ID", accessorKey: "id", className: "w-16 text-muted-foreground" },
                { header: "IP Remoto", accessorKey: "ipRemoto", className: "font-mono text-primary" },
                { header: "Início", cell: (h: any) => format(new Date(h.horarioInicio), "dd/MM/yyyy HH:mm:ss", { locale: ptBR }) },
                { header: "Fim", cell: (h: any) => h.horarioFim ? format(new Date(h.horarioFim), "HH:mm:ss") : "Em andamento..." },
                { header: "Duração", cell: (h: any) => h.duracao ? `${Math.floor(h.duracao / 60)} min ${h.duracao % 60}s` : "-" },
                { header: "Status", accessorKey: "status", className: "uppercase text-xs font-bold" },
              ]}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

import { cn } from "@/lib/utils";
