import { useMetricsHistory } from "@/hooks/use-monitor";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Loader2 } from "lucide-react";

export default function HistoryPage() {
  const { data, isLoading } = useMetricsHistory();

  // Sort data by horario ascending for the chart
  const chartData = data 
    ? [...data].sort((a, b) => new Date(a.horario).getTime() - new Date(b.horario).getTime())
    : [];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold font-mono tracking-tight text-glow">Histórico de Performance</h2>
          <p className="text-muted-foreground">Evolução do uso de CPU e Memória ao longo do tempo.</p>
        </div>

        {/* CPU Chart */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="font-bold font-mono text-lg flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-primary" />
              Uso de CPU (%)
            </h3>
          </div>
          
          <div className="h-[300px] w-full">
            {isLoading ? (
              <div className="h-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis 
                    dataKey="horario" 
                    tickFormatter={(ts) => format(new Date(ts), "HH:mm")}
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickMargin={10}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12}
                    domain={[0, 100]}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '8px',
                      fontFamily: 'var(--font-mono)'
                    }}
                    labelFormatter={(label) => format(new Date(label), "dd/MM HH:mm:ss", { locale: ptBR })}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="usoCpu" 
                    stroke="hsl(var(--primary))" 
                    fillOpacity={1} 
                    fill="url(#colorCpu)" 
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Memory Chart */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="font-bold font-mono text-lg flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500" />
              Uso de Memória (%)
            </h3>
          </div>
          
          <div className="h-[300px] w-full">
            {isLoading ? (
              <div className="h-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorMem" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis 
                    dataKey="horario" 
                    tickFormatter={(ts) => format(new Date(ts), "HH:mm")}
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickMargin={10}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12}
                    domain={[0, 100]}
                  />
                  <Tooltip 
                     contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '8px',
                      fontFamily: 'var(--font-mono)'
                    }}
                    labelFormatter={(label) => format(new Date(label), "dd/MM HH:mm:ss", { locale: ptBR })}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="memoriaPercentual" 
                    stroke="#3b82f6" 
                    fillOpacity={1} 
                    fill="url(#colorMem)" 
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
