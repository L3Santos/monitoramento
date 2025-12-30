import { useSystemStatus } from "@/hooks/use-monitor";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { TerminalTable } from "@/components/ui/TerminalTable";
import { Cpu, TrendingUp, AlertTriangle, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Processos() {
  const { data: dados, isLoading: carregando } = useSystemStatus();
  const listaProcessos = dados?.principaisProcessos || [];
  const cpuAlta = listaProcessos.filter((p: any) => p.cpu > 50).length;
  const memAlta = listaProcessos.filter((p: any) => p.memoria > 50).length;
  const totalCpu = listaProcessos.reduce((acc: number, p: any) => acc + p.cpu, 0);

  return (
    <DashboardLayout>
      <div className="max-w-[1600px] mx-auto space-y-8 p-4 md:p-8">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary/10 text-primary border border-primary/20">
            <Cpu className="w-10 h-10" />
          </div>
          <div>
            <h2 className="text-4xl font-bold font-mono tracking-tight text-glow">Processos</h2>
            <p className="text-muted-foreground text-lg">Monitoramento detalhado de processos ativos no sistema.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-card border border-border rounded-2xl p-8 shadow-lg hover:border-primary/30 transition-all">
            <span className="text-sm text-muted-foreground font-mono uppercase tracking-widest flex items-center gap-2"><Activity className="w-4 h-4" /> Total Processos</span>
            <p className="text-5xl font-bold font-mono mt-4">{listaProcessos.length}</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-8 shadow-lg hover:border-primary/30 transition-all">
            <span className="text-sm text-muted-foreground font-mono uppercase tracking-widest flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Carga Total CPU</span>
            <p className="text-5xl font-bold font-mono mt-4 text-primary">{totalCpu.toFixed(1)}%</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-8 shadow-lg hover:border-destructive/30 transition-all">
            <span className="text-sm text-muted-foreground font-mono text-destructive uppercase tracking-widest flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> CPU Crítico</span>
            <p className="text-5xl font-bold font-mono text-destructive mt-4">{cpuAlta}</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-8 shadow-lg hover:border-yellow-500/30 transition-all">
            <span className="text-sm text-muted-foreground font-mono text-yellow-500 uppercase tracking-widest flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Memória Alta</span>
            <p className="text-5xl font-bold font-mono text-yellow-500 mt-4">{memAlta}</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 shadow-lg overflow-hidden">
          <TerminalTable
            title="Consumo de Recursos por Processo"
            data={listaProcessos}
            isLoading={carregando}
            columns={[
              { header: "PID", accessorKey: "pid", className: "w-32 font-mono text-sm text-muted-foreground font-bold" },
              { header: "NOME DO EXECUTÁVEL", accessorKey: "nome", className: "font-bold text-primary text-lg" },
              { header: "USUÁRIO", accessorKey: "usuario", className: "text-muted-foreground font-mono" },
              { 
                header: "USO DE CPU", 
                cell: (p: any) => (
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden min-w-[150px] hidden lg:block">
                      <div className={cn("h-full transition-all duration-500", p.cpu > 50 ? "bg-destructive" : "bg-primary")} style={{ width: `${Math.min(p.cpu, 100)}%` }} />
                    </div>
                    <span className={cn("font-mono font-bold text-lg w-20 text-right", p.cpu > 50 ? "text-destructive" : "text-primary")}>{p.cpu.toFixed(1)}%</span>
                  </div>
                )
              },
              { 
                header: "USO DE MEMÓRIA", 
                cell: (p: any) => (
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden min-w-[150px] hidden lg:block">
                      <div className={cn("h-full transition-all duration-500", p.memoria > 50 ? "bg-yellow-500" : "bg-blue-500")} style={{ width: `${Math.min(p.memoria, 100)}%` }} />
                    </div>
                    <span className={cn("font-mono font-bold text-lg w-20 text-right", p.memoria > 50 ? "text-yellow-500" : "text-blue-500")}>{p.memoria.toFixed(1)}%</span>
                  </div>
                )
              },
            ]}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
