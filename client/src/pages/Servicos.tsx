import { useSystemStatus } from "@/hooks/use-monitor";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Server, PlayCircle, StopCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function Services() {
  const { data, isLoading } = useSystemStatus();

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-primary/10 text-primary border border-primary/20">
            <Server className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-3xl font-bold font-mono tracking-tight text-glow">Serviços</h2>
            <p className="text-muted-foreground">Estado dos serviços críticos monitorados.</p>
          </div>
        </div>

        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {isLoading ? (
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="h-32 bg-card border border-border rounded-xl animate-pulse" />
            ))
          ) : (
            data?.servicos.map((service: any, idx: number) => (
              <motion.div 
                key={idx}
                variants={item}
                className={cn(
                  "p-6 rounded-xl border transition-all duration-300 hover:shadow-lg group relative overflow-hidden bg-card/50 backdrop-blur-sm",
                  service.status === "executando" 
                    ? "border-primary/20 hover:border-primary/50" 
                    : "border-destructive/20 hover:border-destructive/50"
                )}
              >
                {/* Background Glow */}
                <div className={cn(
                  "absolute -right-4 -top-4 w-24 h-24 rounded-full blur-3xl opacity-10 transition-opacity group-hover:opacity-20",
                  service.status === "executando" ? "bg-primary" : "bg-destructive"
                )} />

                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className={cn(
                    "p-2 rounded-lg border",
                    service.status === "executando" 
                      ? "bg-primary/10 text-primary border-primary/20" 
                      : "bg-destructive/10 text-destructive border-destructive/20"
                  )}>
                    <Server className="w-6 h-6" />
                  </div>
                  <div className={cn(
                    "px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 border",
                    service.status === "executando" 
                      ? "bg-primary/10 text-primary border-primary/20" 
                      : "bg-destructive/10 text-destructive border-destructive/20"
                  )}>
                    {service.status === "executando" ? <PlayCircle className="w-3 h-3" /> : <StopCircle className="w-3 h-3" />}
                    {service.status}
                  </div>
                </div>
                
                <h3 className="font-mono font-bold text-lg mb-1 relative z-10 tracking-tight">{service.nome.toUpperCase()}</h3>
                <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono relative z-10">
                  <span>IDENTIFICADOR:</span>
                  <span className="text-foreground bg-muted/50 px-2 py-0.5 rounded border border-border/50">
                    {service.pid || "N/A"}
                  </span>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
        
        {!isLoading && (!data?.servicos || data.servicos.length === 0) && (
          <div className="text-center py-12 border border-dashed border-border rounded-xl bg-card/30">
             <p className="text-muted-foreground font-mono">Nenhum serviço detectado no sistema.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
