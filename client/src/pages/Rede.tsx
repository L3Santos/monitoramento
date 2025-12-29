import { useSystemStatus } from "@/hooks/use-monitor";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { TerminalTable } from "@/components/ui/TerminalTable";
import { Network as NetworkIcon, Globe, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Network() {
  const { data, isLoading } = useSystemStatus();

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/20">
            <NetworkIcon className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-3xl font-bold font-mono tracking-tight text-glow">Rede</h2>
            <p className="text-muted-foreground">Conexões ativas e portas em escuta.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-xl border border-border bg-card">
            <div className="flex items-center gap-3 mb-2">
               <Globe className="w-5 h-5 text-primary" />
               <h3 className="font-bold">Total Conexões</h3>
            </div>
            <p className="text-3xl font-mono font-bold">{data?.rede.length || 0}</p>
          </div>
          <div className="p-6 rounded-xl border border-border bg-card">
            <div className="flex items-center gap-3 mb-2">
               <Shield className="w-5 h-5 text-amber-500" />
               <h3 className="font-bold">Portas Críticas</h3>
            </div>
            <p className="text-3xl font-mono font-bold text-amber-500">
               {data?.rede.filter((n: any) => [22, 80, 443, 3389, 7070].includes(n.porta)).length || 0}
            </p>
          </div>
        </div>

        <TerminalTable
          title="Conexões Ativas"
          data={data?.rede || []}
          isLoading={isLoading}
          columns={[
            { header: "Porta Local", accessorKey: "porta", className: "w-32 font-mono text-primary font-bold" },
            { header: "IP Remoto", accessorKey: "ipRemoto", className: "font-mono" },
            { 
              header: "Estado", 
              accessorKey: "estado", 
              cell: (n: any) => (
                <span className={cn(
                  "px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider border",
                  n.estado === "ESTABLISHED" 
                    ? "bg-primary/10 text-primary border-primary/20" 
                    : n.estado === "LISTEN"
                    ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                    : "bg-muted text-muted-foreground border-transparent"
                )}>
                  {n.estado}
                </span>
              )
            },
            { header: "Processo", accessorKey: "processo", className: "text-muted-foreground italic" },
          ]}
        />
      </div>
    </DashboardLayout>
  );
}
