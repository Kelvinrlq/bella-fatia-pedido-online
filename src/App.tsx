
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/use-auth";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import StatusPedido from "./pages/StatusPedido";
import ConfirmacaoEmail from "./pages/ConfirmacaoEmail";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<Cadastro />} />
            <Route path="/confirmacao-email" element={<ConfirmacaoEmail />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/status-pedido/:orderId" element={<StatusPedido />} />
            {/* ADICIONE TODAS AS ROTAS PERSONALIZADAS ACIMA DA ROTA PADRÃO "*" */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
