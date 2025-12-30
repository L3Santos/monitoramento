import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Shield, AlertCircle, CheckCircle, Plus, Trash2, Globe, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface StatusFirewall {
  ativo: boolean;
  portasLiberadas: number[];
  sistemaOperacional: string;
  mensagem: string;
}

export default function Firewall() {
  const { toast } = useToast();
  const [status, setStatus] = useState<StatusFirewall | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [processando, setProcessando] = useState(false);
  const [novaPorta, setNovaPorta] = useState("");
  const [processandoPorta, setProcessandoPorta] = useState<number | null>(null);

  useEffect(() => {
    buscarStatus();
    const intervalo = setInterval(buscarStatus, 5000);
    return () => clearInterval(intervalo);
  }, []);

  const buscarStatus = async () => {
    try {
      const res = await fetch("/api/firewall/status");
      if (res.ok) {
        const dados = await res.json();
        setStatus(dados);
      }
    } catch (err) {
      console.error("Erro ao buscar status do firewall:", err);
    } finally {
      setCarregando(false);
    }
  };

  const alternarFirewall = async () => {
    setProcessando(true);
    try {
      const res = await fetch("/api/firewall/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ativar: !status?.ativo }),
      });

      if (res.ok) {
        const dados = await res.json();
        setStatus(dados);
        toast({
          title: "Sucesso",
          description: dados.mensagem,
          duration: 3000,
        });
        buscarStatus();
      }
    } catch (err) {
      console.error("Erro:", err);
    } finally {
      setProcessando(false);
    }
  };

  const adicionarPorta = async () => {
    const porta = parseInt(novaPorta);
    if (isNaN(porta) || porta < 1 || porta > 65535) return;

    setProcessandoPorta(porta);
    try {
      const res = await fetch("/api/firewall/porta/adicionar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ porta }),
      });

      if (res.ok) {
        const dados = await res.json();
        setStatus(dados);
        setNovaPorta("");
        toast({ title: "Porta Liberada", description: `A porta ${porta} foi aberta.` });
      }
    } finally {
      setProcessandoPorta(null);
    }
  };

  const removerPorta = async (porta: number) => {
    setProcessandoPorta(porta);
    try {
      const res = await fetch("/api/firewall/porta/remover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ porta }),
      });

      if (res.ok) {
        const dados = await res.json();
        setStatus(dados);
        toast({ title: "Porta Bloqueada", description: `A porta ${porta} foi fechada.` });
      }
    } finally {
      setProcessandoPorta(null);
    }
  };

  if (carregando) {
    return (
      <DashboardLayout>
        <div className="max-w-[1600px] mx-auto space-y-8 animate-pulse">
           <div className="h-20 bg-muted/20 rounded-xl" />
           <div className="h-60 bg-muted/20 rounded-xl" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-[1600px] mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-3xl font-bold font-mono tracking-tight text-glow">Firewall</h2>
            <p className="text-muted-foreground">Gerenciamento avançado de segurança e tráfego de rede.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={cn(
            "lg:col-span-2 p-8 rounded-xl border shadow-sm flex flex-col justify-between transition-all duration-500",
            status?.ativo ? "bg-destructive/5 border-destructive/20" : "bg-primary/5 border-primary/20"
          )}>
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className={cn("p-4 rounded-2xl", status?.ativo ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary")}>
                  <Shield className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold font-mono uppercase tracking-tight">Status do Firewall</h3>
                  <p className={cn("font-mono font-bold mt-1", status?.ativo ? "text-destructive" : "text-primary")}>
                    {status?.ativo ? "PROTEÇÃO ATIVA" : "PROTEÇÃO DESATIVADA"}
                  </p>
                </div>
              </div>
              <p className="text-muted-foreground mb-8 text-sm leading-relaxed max-w-xl">
                O firewall controla todo o tráfego de entrada e saída. Quando ativo, apenas conexões em portas liberadas explicitamente ou conexões de rede local serão permitidas.
              </p>
            </div>
            <button
              onClick={alternarFirewall}
              disabled={processando}
              className={cn(
                "w-full py-4 rounded-xl font-mono text-lg font-bold transition-all transform active:scale-[0.98]",
                status?.ativo ? "bg-destructive text-white hover:bg-destructive/90" : "bg-primary text-white hover:bg-primary/90",
                "disabled:opacity-50 shadow-lg"
              )}
            >
              {processando ? "MODIFICANDO..." : status?.ativo ? "DESATIVAR PROTEÇÃO" : "ATIVAR PROTEÇÃO"}
            </button>
          </div>

          <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
            <h3 className="text-xl font-bold font-mono mb-6 flex items-center gap-3">
              <Plus className="w-6 h-6 text-primary" /> Liberação
            </h3>
            <div className="space-y-6">
              <div>
                <label className="text-xs font-mono text-muted-foreground uppercase mb-2 block">Número da Porta</label>
                <input
                  type="number"
                  value={novaPorta}
                  onChange={(e) => setNovaPorta(e.target.value)}
                  placeholder="Ex: 8080"
                  className="w-full px-4 py-4 bg-secondary/50 border border-border rounded-xl font-mono text-xl focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <button
                onClick={adicionarPorta}
                disabled={processandoPorta !== null || !novaPorta}
                className="w-full py-4 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 rounded-xl font-mono font-bold transition-all disabled:opacity-50"
              >
                LIBERAR ACESSO
              </button>
              <div className="p-4 bg-muted/30 rounded-lg text-[11px] font-mono text-muted-foreground">
                <p>💡 Máquinas locais (mesmo Wi-Fi) não são bloqueadas pelo firewall em conexões de saída.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
          <h3 className="text-xl font-bold font-mono mb-8 flex items-center gap-3">
            <Globe className="w-6 h-6 text-primary" /> Portas com Acesso Externo Liberado
          </h3>
          {status?.portasLiberadas && status.portasLiberadas.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {status.portasLiberadas.map((porta) => (
                <div key={porta} className="flex items-center justify-between bg-secondary/30 border border-border/50 rounded-xl p-4 hover:border-primary/30 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span className="font-mono font-bold text-lg">Porta {porta}</span>
                    {porta === 50001 && <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded font-bold">ANYDESK</span>}
                  </div>
                  <button onClick={() => removerPorta(porta)} className="text-destructive hover:bg-destructive/10 p-2 rounded-lg transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 border border-dashed border-border rounded-2xl">
              <p className="text-muted-foreground font-mono">Nenhuma porta externa liberada no momento.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
