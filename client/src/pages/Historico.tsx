import { useMetricsHistory } from "@/hooks/use-monitor";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Loader2, TrendingUp, Activity, HardDrive } from "lucide-react";

export default function Historico() {
  const { data: dados, isLoading: carregando } = useMetricsHistory();
  const dadosGrafico = dados ? [...dados].sort((a, b) => new Date(a.horario).getTime() - new Date(b.horario).getTime()) : [];

  return (
    <DashboardLayout>
      <div className="max-w-[1600px] mx-auto space-y-8 p-4 md:p-8">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary/10 text-primary border border-primary/20">
            <TrendingUp className="w-10 h-10" />
          </div>
          <div>
            <h2 className="text-4xl font-bold font-mono tracking-tight text-glow">Histórico</h2>
            <p className="text-muted-foreground text-lg">Análise temporal de desempenho e consumo de recursos.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <div className="bg-card border border-border rounded-2xl p-10 shadow-xl hover:border-primary/20 transition-all">
            <div className="flex items-center justify-between mb-10">
               <h3 className="text-2xl font-bold font-mono flex items-center gap-4 text-primary">
                <Activity className="w-8 h-8" /> Desempenho de CPU (%)
              </h3>
              <div className="text-right">
                <span className="text-xs font-mono text-muted-foreground uppercase block">Últimos dados</span>
                <span className="text-primary font-mono font-bold">{dadosGrafico.length} pontos</span>
              </div>
            </div>
            <div className="h-[450px] w-full">
              {carregando ? (
                <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin w-16 h-16 text-primary" /></div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dadosGrafico}>
                    <defs>
                      <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                    <XAxis 
                      dataKey="horario" 
                      tickFormatter={(t) => format(new Date(t), "HH:mm")}
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={14}
                      tickMargin={15}
                    />
                    <YAxis domain={[0, 100]} stroke="hsl(var(--muted-foreground))" fontSize={14} tickMargin={10} />
                    <Tooltip 
                      labelFormatter={(t) => format(new Date(t), "HH:mm:ss")}
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '16px', border: '1px solid hsl(var(--border))', padding: '15px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Area type="monotone" dataKey="usoCpu" stroke="#10b981" fillOpacity={1} fill="url(#colorCpu)" strokeWidth={4} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-10 shadow-xl hover:border-blue-500/20 transition-all">
            <div className="flex items-center justify-between mb-10">
               <h3 className="text-2xl font-bold font-mono flex items-center gap-4 text-blue-500">
                <HardDrive className="w-8 h-8" /> Consumo de Memória (%)
              </h3>
              <div className="text-right">
                <span className="text-xs font-mono text-muted-foreground uppercase block">Estado Atual</span>
                <span className="text-blue-500 font-mono font-bold">Monitorando</span>
              </div>
            </div>
            <div className="h-[450px] w-full">
              {carregando ? (
                <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin w-16 h-16 text-blue-500" /></div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dadosGrafico}>
                    <defs>
                      <linearGradient id="colorMem" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                    <XAxis 
                      dataKey="horario" 
                      tickFormatter={(t) => format(new Date(t), "HH:mm")}
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={14}
                      tickMargin={15}
                    />
                    <YAxis domain={[0, 100]} stroke="hsl(var(--muted-foreground))" fontSize={14} tickMargin={10} />
                    <Tooltip 
                      labelFormatter={(t) => format(new Date(t), "HH:mm:ss")}
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '16px', border: '1px solid hsl(var(--border))', padding: '15px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Area type="monotone" dataKey="memoriaPercentual" stroke="#3b82f6" fillOpacity={1} fill="url(#colorMem)" strokeWidth={4} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
