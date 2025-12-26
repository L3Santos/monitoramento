import { useSystemStatus } from "@/hooks/use-monitor";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Server, PlayCircle, StopCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Services() {
  const { data, isLoading } = useSystemStatus();

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold font-mono tracking-tight text-glow">Serviços</h2>
          <p className="text-muted-foreground">Estado dos serviços críticos monitorados.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="h-32 bg-card border border-border rounded-xl animate-pulse" />
            ))
          ) : (
            data?.servicos.map((service: any, idx: number) => (
              <div 
                key={idx}
                className={cn(
                  "p-6 rounded-xl border transition-all duration-300 hover:shadow-lg group",
                  service.status === "executando" 
                    ? "bg-card border-border hover:border-primary/50" 
                    : "bg-destructive/5 border-destructive/20 hover:border-destructive/50"
                )}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={cn(
                    "p-2 rounded-lg",
                    service.status === "executando" ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
                  )}>
                    <Server className="w-6 h-6" />
                  </div>
                  <div className={cn(
                    "px-2 py-1 rounded text-xs font-bold uppercase tracking-wide flex items-center gap-1.5",
                    service.status === "executando" ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
                  )}>
                    {service.status === "executando" ? <PlayCircle className="w-3 h-3" /> : <StopCircle className="w-3 h-3" />}
                    {service.status}
                  </div>
                </div>
                
                <h3 className="font-mono font-bold text-lg mb-1">{service.nome}</h3>
                <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                  <span>PID:</span>
                  <span className="text-foreground bg-muted px-1.5 rounded">
                    {service.pid || "N/A"}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
        
        {!isLoading && (!data?.servicos || data.servicos.length === 0) && (
          <div className="text-center py-12 border border-dashed border-border rounded-xl">
             <p className="text-muted-foreground">Nenhum serviço configurado para monitoramento.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
