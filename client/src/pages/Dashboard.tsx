import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, LogOut, Settings, BarChart3, MessageSquare, Zap, Database, Activity } from "lucide-react";
import SettingsPage from "./Settings";

interface User {
  id: number;
  username: string;
  name: string | null;
  role: string;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth/me");
        if (!response.ok) {
          setLocation("/login");
          return;
        }
        const userData = await response.json();
        setUser(userData);
      } catch (err) {
        console.error("Failed to fetch user:", err);
        setLocation("/login");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [setLocation]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setLocation("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-700/50 bg-slate-800/30 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500">
              <span className="text-white font-bold">GF</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Gestor Financeiro IA</h1>
              <p className="text-xs text-slate-400">Painel de Controle</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-white">{user.name || user.username}</p>
              <p className="text-xs text-slate-400">{user.role}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="text-slate-400 hover:text-white hover:bg-slate-700/50"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Bem-vindo ao Painel</h2>
          <p className="text-slate-400">Gerencie seus serviços, finanças e automações em um único lugar</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Saldo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-white">R$ 0,00</p>
              <p className="text-xs text-slate-400 mt-1">Sem transações</p>
            </CardContent>
          </Card>

          <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Serviços
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-white">0</p>
              <p className="text-xs text-slate-400 mt-1">Ativos</p>
            </CardContent>
          </Card>

          <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Mensagens
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-white">0</p>
              <p className="text-xs text-slate-400 mt-1">Processadas</p>
            </CardContent>
          </Card>

          <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <Database className="h-4 w-4" />
                Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-400">Online</p>
              <p className="text-xs text-slate-400 mt-1">Sistema ativo</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="bg-slate-800/50 border-slate-700">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="services">Serviços</TabsTrigger>
            <TabsTrigger value="financial">Financeiro</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoramento</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
              <CardHeader>
                <CardTitle>Resumo do Sistema</CardTitle>
                <CardDescription>Status geral e informações importantes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-slate-700/30 border border-slate-700">
                    <p className="text-sm text-slate-400 mb-2">Whisper (Transcrição)</p>
                    <p className="text-lg font-semibold text-yellow-400">Não Instalado</p>
                  </div>
                  <div className="p-4 rounded-lg bg-slate-700/30 border border-slate-700">
                    <p className="text-sm text-slate-400 mb-2">Ollama (IA Local)</p>
                    <p className="text-lg font-semibold text-yellow-400">Não Instalado</p>
                  </div>
                  <div className="p-4 rounded-lg bg-slate-700/30 border border-slate-700">
                    <p className="text-sm text-slate-400 mb-2">Evolution API (WhatsApp)</p>
                    <p className="text-lg font-semibold text-yellow-400">Não Configurado</p>
                  </div>
                  <div className="p-4 rounded-lg bg-slate-700/30 border border-slate-700">
                    <p className="text-sm text-slate-400 mb-2">Banco de Dados</p>
                    <p className="text-lg font-semibold text-green-400">Conectado</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="services" className="space-y-4">
            <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
              <CardHeader>
                <CardTitle>Gerenciamento de Serviços</CardTitle>
                <CardDescription>Instale e controle os serviços do sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-slate-400 text-sm mb-4">Gerencie Whisper, Ollama e Evolution API</p>
                <Button
                  onClick={() => setLocation("/dashboard/services")}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                >
                  Acessar Gerenciamento
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="financial" className="space-y-4">
            <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
              <CardHeader>
                <CardTitle>Painel Financeiro</CardTitle>
                <CardDescription>Gerencie suas transações e saldo</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-slate-400 text-sm mb-4">Visualize e controle todas as suas transações</p>
                <Button
                  onClick={() => setLocation("/dashboard/financial")}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                >
                  Acessar Painel Financeiro
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-4">
            <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
              <CardHeader>
                <CardTitle>Monitoramento</CardTitle>
                <CardDescription>Visualize o status e desempenho do sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-slate-400 text-sm mb-4">Acompanhe CPU, memória, serviços e filas</p>
                <Button
                  onClick={() => setLocation("/dashboard/monitoring")}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  Acessar Monitoramento
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <SettingsPage />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
