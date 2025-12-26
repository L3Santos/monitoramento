import { useSystemStatus } from "@/hooks/use-monitor";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { TerminalTable } from "@/components/ui/TerminalTable";
import { Cpu } from "lucide-react";

export default function Processes() {
  const { data, isLoading } = useSystemStatus();

  return (
    <DashboardLayout>
      <div className="w-full space-y-8">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-primary/10 text-primary border border-primary/20">
            <Cpu className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-3xl font-bold font-mono tracking-tight text-glow">Processos</h2>
            <p className="text-muted-foreground">Top processos consumindo recursos do sistema.</p>
          </div>
        </div>

        <TerminalTable
          title="Lista de Processos (Top Consumo)"
          data={data?.principaisProcessos || []}
          isLoading={isLoading}
          columns={[
            { header: "PID", accessorKey: "pid", className: "w-24 font-mono text-muted-foreground" },
            { header: "Nome do Processo", accessorKey: "nome", className: "font-bold text-primary" },
            { header: "Usuário", accessorKey: "usuario", className: "text-muted-foreground" },
            { 
              header: "CPU %", 
              cell: (p: any) => (
                <div className="flex items-center gap-2">
                  <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full" 
                      style={{ width: `${Math.min(p.cpu, 100)}%` }}
                    />
                  </div>
                  <span className={p.cpu > 50 ? "text-destructive font-bold" : ""}>{p.cpu.toFixed(1)}%</span>
                </div>
              )
            },
            { 
              header: "Memória %", 
              cell: (p: any) => (
                <div className="flex items-center gap-2">
                  <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full" 
                      style={{ width: `${Math.min(p.memoria, 100)}%` }}
                    />
                  </div>
                  <span className={p.memoria > 50 ? "text-warning font-bold" : ""}>{p.memoria.toFixed(1)}%</span>
                </div>
              )
            },
          ]}
        />
      </div>
    </DashboardLayout>
  );
}
