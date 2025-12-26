import { useSystemStatus } from "@/hooks/use-monitor";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { TerminalTable } from "@/components/ui/TerminalTable";
import { MetricCard } from "@/components/ui/MetricCard";
import { Network as NetworkIcon, Globe, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function Network() {
  const { data, isLoading } = useSystemStatus();

  return (
    <DashboardLayout>
      <div className="w-full space-y-8 px-4 md:px-8 pb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/20">
            <NetworkIcon className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-3xl font-bold font-mono tracking-tight text-glow">Rede</h2>
            <p className="text-muted-foreground">Conexões ativas e portas em escuta.</p>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <MetricCard
            title="Total de Conexões"
            value={isLoading ? "..." : (data?.rede.length || 0).toString()}
            subValue="Sessões de rede detectadas"
            icon={Globe}
            color="blue"
          />
          <MetricCard
            title="Portas Críticas"
            value={isLoading ? "..." : (data?.rede.filter((n: any) => [22, 80, 443, 3389, 7070].includes(n.porta)).length || 0).toString()}
            subValue="SSH, HTTP, HTTPS, RDP, AnyDesk"
            icon={Shield}
            color="warning"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
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
              { header: "Processo", accessorKey: "processo", className: "text-muted-foreground italic text-xs" },
            ]}
          />
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
