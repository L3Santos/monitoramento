import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import NotFound from "@/pages/not-found";

// Páginas em português
import VisaoGeral from "@/pages/VisaoGeral";
import Anydesk from "@/pages/AnyDesk";
import Servicos from "@/pages/Servicos";
import Processos from "@/pages/Processos";
import Rede from "@/pages/Rede";
import Historico from "@/pages/Historico";
import Firewall from "@/pages/Firewall";

function Router() {
  return (
    <Switch>
      <Route path="/" component={VisaoGeral} />
      <Route path="/anydesk" component={Anydesk} />
      <Route path="/servicos" component={Servicos} />
      <Route path="/processos" component={Processos} />
      <Route path="/rede" component={Rede} />
      <Route path="/firewall" component={Firewall} />
      <Route path="/historico" component={Historico} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
