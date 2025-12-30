import { useSystemStatus } from "@/hooks/use-monitor";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { TerminalTable } from "@/components/ui/TerminalTable";
import { Network as NetworkIcon, Globe, Shield, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Rede() {
  const { data: dados, isLoading: carregando } = useSystemStatus();
  const conexoes = dados?.rede || [];
  const estabelecidas = conexoes.filter((c: any) => c.estado === "ESTABLISHED").length;
  const emEscuta = conexoes.filter((c: any) => c.estado === "LISTEN").length;

  return (
    <DashboardLayout>
      <div className="max-w-[1600px] mx-auto space-y-8 p-4 md:p-8">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
            <NetworkIcon className="w-10 h-10" />
          </div>
          <div>
            <h2 className="text-4xl font-bold font-mono tracking-tight text-glow">Rede</h2>
            <p className="text-muted-foreground text-lg">Análise detalhada de tráfego, conexões e portas.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card border border-border rounded-2xl p-8 shadow-lg hover:border-primary/30 transition-all">
            <span className="text-sm text-muted-foreground font-mono uppercase tracking-widest flex items-center gap-2"><Globe className="w-4 h-4" /> Total de Conexões</span>
            <p className="text-5xl font-bold font-mono mt-4">{conexoes.length}</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-8 shadow-lg hover:border-primary/30 transition-all">
            <span className="text-sm text-muted-foreground font-mono text-primary uppercase tracking-widest flex items-center gap-2"><TrendingDown className="w-4 h-4" /> Estabelecidas</span>
            <p className="text-5xl font-bold font-mono text-primary mt-4">{estabelecidas}</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-8 shadow-lg hover:border-blue-500/30 transition-all">
            <span className="text-sm text-muted-foreground font-mono text-blue-500 uppercase tracking-widest flex items-center gap-2"><Shield className="w-4 h-4" /> Portas em Escuta</span>
            <p className="text-5xl font-bold font-mono text-blue-500 mt-4">{emEscuta}</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 shadow-lg overflow-hidden">
          <TerminalTable
            title="Mapa de Conexões e Escuta de Portas"
            data={conexoes}
            isLoading={carregando}
            columns={[
              { 
                header: "PORTA LOCAL", 
                accessorKey: "porta", 
                className: "w-40 font-mono text-primary font-bold text-xl",
                cell: (n: any) => (
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-primary">{n.porta}</span>
                    {[22, 80, 443, 3389, 7070, 50001].includes(n.porta) && (
                      <span className="text-xs bg-yellow-500 text-black px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter">Crítica</span>
                    )}
                  </div>
                )
              },
              { header: "ENDEREÇO IP REMOTO", accessorKey: "ipRemoto", className: "font-mono text-sm text-muted-foreground" },
              { 
                header: "ESTADO DA CONEXÃO", 
                cell: (n: any) => (
                  <span className={cn(
                    "px-4 py-1.5 rounded-lg text-sm font-bold border uppercase tracking-widest shadow-sm",
                    n.estado === "ESTABLISHED" ? "bg-primary text-white border-primary" : "bg-muted/50 text-muted-foreground border-transparent"
                  )}>
                    {n.estado}
                  </span>
                )
              },
              { header: "PROCESSO ASSOCIADO", accessorKey: "processo", className: "text-muted-foreground font-medium italic" },
            ]}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
