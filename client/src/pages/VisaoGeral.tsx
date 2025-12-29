import { useSystemStatus } from "@/hooks/use-monitor";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { MetricCard } from "@/components/ui/MetricCard";
import { TerminalTable } from "@/components/ui/TerminalTable";
import { Cpu, HardDrive, Monitor, ShieldCheck, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function VisaoGeral() {
  const { data, isLoading, error } = useSystemStatus();

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[50vh] text-destructive">
          <AlertTriangle className="w-12 h-12 mb-4" />
          <h2 className="text-xl font-bold font-mono">Erro de Conexão</h2>
          <p className="text-muted-foreground">Não foi possível conectar ao agente local.</p>
        </div>
      </DashboardLayout>
    );
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const item = {
    hidden: { y: 10, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold font-mono tracking-tight text-glow">Visão Geral</h2>
            <p className="text-muted-foreground">Monitoramento em tempo real do sistema local.</p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono bg-card border border-border px-3 py-1.5 rounded-md shadow-sm">
            <span className={cn("w-2 h-2 rounded-full animate-pulse", data && data.sistema.cpu > 0 ? "bg-primary" : "bg-destructive")}></span>
            {data && data.sistema.cpu > 0 ? "AGENTE CONECTADO" : "AGENTE AGUARDANDO DADOS"}
            <span className="mx-2 text-border">|</span>
            {data ? new Date(data.ultimaAtualizacao).toLocaleTimeString() : "--:--:--"}
          </div>
        </div>

        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <motion.div variants={item}>
            <MetricCard
              title="CPU"
              value={isLoading ? "..." : `${data?.sistema.cpu}%`}
              subValue="Uso total do processador"
              icon={Cpu}
              color={data?.sistema.cpu && data.sistema.cpu > 80 ? "destructive" : "primary"}
            />
          </motion.div>
          
          <motion.div variants={item}>
            <MetricCard
              title="Memória"
              value={isLoading ? "..." : `${data?.sistema.memoria.percentual}%`}
              subValue={`${data?.sistema.memoria.usada} / ${data?.sistema.memoria.total}`}
              icon={HardDrive}
              color={data?.sistema.memoria.percentual && data.sistema.memoria.percentual > 85 ? "warning" : "blue"}
            />
          </motion.div>

          <motion.div variants={item}>
            <MetricCard
              title="AnyDesk"
              value={isLoading ? "..." : (data?.anydesk.ativo ? "ATIVO" : "INATIVO")}
              subValue={data?.anydesk.ativo ? `${data.anydesk.sessoesAtuais.length} sessões ativas` : "Nenhuma conexão"}
              icon={Monitor}
              color={data?.anydesk.ativo ? "destructive" : "primary"}
            />
          </motion.div>

          <motion.div variants={item}>
            <MetricCard
              title="Serviços"
              value={isLoading ? "..." : data?.servicos.filter(s => s.status === 'executando').length || 0}
              subValue="Serviços monitorados rodando"
              icon={ShieldCheck}
              color="primary"
            />
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <TerminalTable
              title="Principais Processos (CPU/MEM)"
              data={data?.principaisProcessos || []}
              isLoading={isLoading}
              columns={[
                { header: "PID", accessorKey: "pid", className: "w-20 font-mono text-muted-foreground" },
                { header: "Processo", accessorKey: "nome", className: "font-bold text-primary" },
                { header: "Usuário", accessorKey: "usuario", className: "text-muted-foreground hidden sm:table-cell" },
                { 
                  header: "CPU", 
                  cell: (p: any) => <span className={p.cpu > 50 ? "text-destructive font-bold" : ""}>{p.cpu.toFixed(1)}%</span> 
                },
                { 
                  header: "MEM", 
                  cell: (p: any) => <span className={p.memoria > 50 ? "text-warning font-bold" : ""}>{p.memoria.toFixed(1)}%</span> 
                },
              ]}
            />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
          >
             <TerminalTable
              title="Conexões de Rede Ativas"
              data={data?.rede.slice(0, 5) || []}
              isLoading={isLoading}
              emptyMessage="Nenhuma conexão ativa detectada"
              columns={[
                { header: "Porta", accessorKey: "porta", className: "w-20 font-mono text-muted-foreground" },
                { header: "Remoto", accessorKey: "ipRemoto", className: "font-mono" },
                { 
                  header: "Estado", 
                  accessorKey: "estado", 
                  cell: (n: any) => (
                    <span className={cn(
                      "px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider",
                      n.estado === "ESTABLISHED" ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                    )}>
                      {n.estado}
                    </span>
                  )
                },
                { header: "Processo", accessorKey: "processo", className: "text-xs text-muted-foreground" },
              ]}
            />
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
