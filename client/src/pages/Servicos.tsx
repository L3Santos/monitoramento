import { useSystemStatus } from "@/hooks/use-monitor";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Server, PlayCircle, StopCircle, AlertCircle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Servicos() {
  const { data: dados, isLoading: carregando } = useSystemStatus();
  const listaServicos = dados?.servicos || [];
  const servicosAtivos = listaServicos.filter((s: any) => s.status === "executando").length;
  const servicosInativos = listaServicos.filter((s: any) => s.status !== "executando").length;

  return (
    <DashboardLayout>
      <div className="max-w-[1600px] mx-auto space-y-8 p-4 md:p-8">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
            <Server className="w-10 h-10" />
          </div>
          <div>
            <h2 className="text-4xl font-bold font-mono tracking-tight text-glow">Serviços</h2>
            <p className="text-muted-foreground text-lg">Monitoramento de serviços críticos do sistema.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card border border-border rounded-2xl p-8 shadow-lg hover:border-primary/30 transition-all">
            <span className="text-sm text-muted-foreground font-mono uppercase tracking-widest">Total Serviços</span>
            <p className="text-5xl font-bold font-mono mt-4">{listaServicos.length}</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-8 shadow-lg hover:border-primary/30 transition-all">
            <span className="text-sm text-muted-foreground font-mono text-primary uppercase tracking-widest">Ativos</span>
            <p className="text-5xl font-bold font-mono text-primary mt-4">{servicosAtivos}</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-8 shadow-lg hover:border-destructive/30 transition-all">
            <span className="text-sm text-muted-foreground font-mono text-destructive uppercase tracking-widest">Inativos</span>
            <p className="text-5xl font-bold font-mono text-destructive mt-4">{servicosInativos}</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 shadow-lg">
          <h3 className="text-2xl font-mono font-bold mb-8 flex items-center gap-3">
            <Server className="w-6 h-6 text-muted-foreground" />
            Estado dos Serviços
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {carregando ? (
              Array(6).fill(0).map((_, i) => (
                <div key={i} className="h-60 bg-muted/20 border border-border rounded-2xl animate-pulse" />
              ))
            ) : (
              listaServicos.map((servico: any, index: number) => (
                <div key={index} className={cn(
                  "p-8 rounded-2xl border transition-all duration-300 hover:shadow-xl",
                  servico.status === "executando" ? "bg-secondary/20 border-border" : "bg-destructive/5 border-destructive/20"
                )}>
                  <div className="flex justify-between items-start mb-6">
                    <div className={cn(
                      "p-4 rounded-xl",
                      servico.status === "executando" ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
                    )}>
                      <Server className="w-8 h-8" />
                    </div>
                    {servico.status === "executando" ? <CheckCircle className="w-6 h-6 text-primary" /> : <AlertCircle className="w-6 h-6 text-destructive" />}
                  </div>
                  <h3 className="font-mono font-bold text-2xl mb-6">{servico.nome}</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm font-mono">
                      <span className="text-muted-foreground">STATUS ATUAL:</span>
                      <div className={cn(
                        "px-4 py-1.5 rounded-lg font-bold uppercase tracking-wider",
                        servico.status === "executando" ? "bg-primary text-white" : "bg-destructive text-white"
                      )}>
                        {servico.status.toUpperCase()}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm font-mono border-t border-border pt-4">
                      <span className="text-muted-foreground">IDENTIFICADOR (PID):</span>
                      <span className="bg-muted px-3 py-1 rounded-md text-foreground font-bold">{servico.pid || 'NÃO ATRIBUÍDO'}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
