import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Monitor, 
  Server, 
  Cpu, 
  Network, 
  History,
  Terminal,
  Menu,
  X,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/components/ThemeProvider";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { theme, toggleTheme } = useTheme();

  const navigation = [
    { name: "Visão Geral", href: "/", icon: LayoutDashboard },
    { name: "AnyDesk", href: "/anydesk", icon: Monitor },
    { name: "Serviços", href: "/servicos", icon: Server },
    { name: "Processos", href: "/processos", icon: Cpu },
    { name: "Rede", href: "/rede", icon: Network },
    { name: "Histórico", href: "/historico", icon: History },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex overflow-hidden">
      {/* Sidebar - Desktop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside 
            initial={{ x: -256 }}
            animate={{ x: 0 }}
            exit={{ x: -256 }}
            transition={{ duration: 0.2 }}
            className="hidden lg:flex flex-col w-64 border-r border-border bg-card/50 backdrop-blur-sm z-20"
          >
            <div className="p-6 flex items-center gap-3 border-b border-border/50">
              <div className="bg-primary/20 p-2 rounded-md">
                <Terminal className="w-6 h-6 text-primary animate-pulse" />
              </div>
              <div className="flex flex-col">
                <h1 className="font-mono font-bold text-base tracking-tight text-primary text-glow leading-none">
                  MAQUINA
                </h1>
                <h1 className="font-mono font-bold text-base tracking-tight text-foreground leading-none mt-1">
                  CONCILIACAO
                </h1>
                <p className="text-[10px] text-muted-foreground font-mono mt-1">v1.0.0 :: ONLINE</p>
              </div>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-1">
              {navigation.map((item) => (
                <Link key={item.name} href={item.href} className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 group relative overflow-hidden",
                  location === item.href 
                    ? "bg-primary/10 text-primary shadow-[0_0_15px_-3px_rgba(34,197,94,0.3)] border border-primary/20" 
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}>
                  <item.icon className={cn("w-5 h-5", location === item.href ? "text-primary" : "group-hover:text-foreground transition-colors")} />
                  {item.name}
                </Link>
              ))}
            </nav>

            <div className="p-4 border-t border-border/50 space-y-4">
              <div className="bg-secondary/50 rounded-lg p-3 text-xs font-mono text-muted-foreground">
                <div className="flex justify-between mb-1">
                  <span>Status:</span>
                  <span className="text-primary">Conectado</span>
                </div>
                <div className="flex justify-between">
                  <span>Uptime:</span>
                  <span>12h 45m</span>
                </div>
              </div>
              <div className="text-xs text-muted-foreground font-mono border-t border-border/30 pt-3 text-center">
                <p>Criado / Desenvolvido por</p>
                <p className="text-primary font-bold">L3Santos</p>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <motion.div 
        className={cn(
          "fixed inset-y-0 left-0 w-64 bg-card border-r border-border z-50 lg:hidden transform transition-transform duration-300 ease-in-out",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-6 flex items-center justify-between border-b border-border/50">
           <div className="flex flex-col">
            <span className="font-mono font-bold text-primary leading-none">MAQUINA</span>
            <span className="font-mono font-bold text-foreground leading-none">CONCILIACAO</span>
          </div>
          <button onClick={() => setMobileMenuOpen(false)}>
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
        <nav className="p-4 space-y-1">
          {navigation.map((item) => (
            <Link key={item.name} href={item.href} onClick={() => setMobileMenuOpen(false)} className={cn(
              "flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium",
              location === item.href 
                ? "bg-primary/10 text-primary border border-primary/20" 
                : "text-muted-foreground hover:bg-secondary"
            )}>
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          ))}
        </nav>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header - Desktop + Mobile */}
        <header className="h-16 border-b border-border flex items-center px-4 justify-between bg-card">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)} 
              className="p-2 -ml-2 text-muted-foreground hover:text-foreground hidden lg:block"
              title={sidebarOpen ? "Ocultar sidebar" : "Mostrar sidebar"}
            >
              {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </button>
            <button onClick={() => setMobileMenuOpen(true)} className="p-2 -ml-2 text-muted-foreground lg:hidden">
              <Menu className="w-6 h-6" />
            </button>
            <span className="font-mono font-bold lg:hidden">MONITORAMENTO</span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={toggleTheme}
              className="p-2 text-muted-foreground hover:text-foreground rounded-md hover:bg-secondary transition-colors"
              title={theme === "dark" ? "Modo claro" : "Modo escuro"}
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-0 scroll-smooth flex flex-col">
          <div className="w-full space-y-8 flex-1 py-8 px-4 md:px-8">
            {children}
          </div>
          <div className="text-xs text-muted-foreground font-mono text-center py-4 border-t border-border/20 mt-8">
            <p>Criado / Desenvolvido por <span className="text-primary font-bold">L3Santos</span></p>
          </div>
        </main>
      </div>
    </div>
  );
}
