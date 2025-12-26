import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { TerminalTable } from "@/components/ui/TerminalTable";
import { Users, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

export default function Netbeans() {
  const { data: acessos, isLoading } = useQuery<any[]>({
    queryKey: ["/api/acessos"],
    refetchInterval: 3000,
  });

  return (
    <DashboardLayout>
      <div className="w-full space-y-8">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-primary/10 text-primary border border-primary/20">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-3xl font-bold font-mono tracking-tight text-glow">Netbeans Monitor</h2>
            <p className="text-muted-foreground">Monitoramento de acessos externos ao dashboard.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-xl border border-border bg-card/50 backdrop-blur-sm relative overflow-hidden">
             <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
             <div className="flex items-center gap-3 mb-2">
                <Users className="w-5 h-5 text-primary" />
                <h3 className="font-bold font-mono">Total de Acessos</h3>
             </div>
             <p className="text-3xl font-mono font-bold">{acessos?.length || 0}</p>
          </div>
          <div className="p-6 rounded-xl border border-border bg-card/50 backdrop-blur-sm relative overflow-hidden">
             <div className="absolute -right-4 -top-4 w-24 h-24 bg-destructive/10 rounded-full blur-2xl" />
             <div className="flex items-center gap-3 mb-2">
                <ShieldAlert className="w-5 h-5 text-destructive" />
                <h3 className="font-bold font-mono">IPs Únicos</h3>
             </div>
             <p className="text-3xl font-mono font-bold">
                {new Set(acessos?.map(a => a.ip)).size}
             </p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <TerminalTable
            title="Log de Acessos Recentes"
            data={acessos || []}
            isLoading={isLoading}
            columns={[
              { 
                header: "Horário", 
                accessorKey: "horario", 
                className: "w-48 font-mono text-muted-foreground",
                cell: (a: any) => format(new Date(a.horario), "dd/MM/yyyy HH:mm:ss")
              },
              { header: "IP de Origem", accessorKey: "ip", className: "font-mono font-bold text-primary" },
              { header: "Caminho", accessorKey: "rota", className: "font-mono text-xs" },
              { 
                header: "Navegador / Sistema", 
                accessorKey: "userAgent", 
                className: "text-muted-foreground text-[10px] max-w-xs truncate" 
              },
            ]}
          />
        </motion.div>
      </div>
    </DashboardLayout>
  );
}