import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { ArrowRight, Zap, Brain, MessageSquare, BarChart3, Lock, Smartphone } from "lucide-react";

export default function Home() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Navigation */}
      <nav className="border-b border-slate-700/50 bg-slate-800/30 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500">
              <span className="text-white font-bold">GF</span>
            </div>
            <span className="text-xl font-bold">Gestor Financeiro IA</span>
          </div>
          <Button
            onClick={() => setLocation("/login")}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
          >
            Acessar Painel
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Gestão Financeira Inteligente
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto">
            Automatize suas finanças com inteligência artificial local, WhatsApp e controle total via painel web
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => setLocation("/login")}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-lg px-8"
            >
              Começar Agora
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-slate-600 text-white hover:bg-slate-700/50"
            >
              Saiba Mais
            </Button>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
          <div className="group p-8 rounded-xl border border-slate-700/50 bg-slate-800/30 backdrop-blur hover:border-blue-500/50 transition-all">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 mb-4 group-hover:from-blue-500/40 group-hover:to-cyan-500/40 transition-all">
              <BarChart3 className="h-6 w-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Gestão Financeira</h3>
            <p className="text-slate-400">
              Controle suas transações, saldo e categorias com um painel intuitivo e responsivo
            </p>
          </div>

          <div className="group p-8 rounded-xl border border-slate-700/50 bg-slate-800/30 backdrop-blur hover:border-cyan-500/50 transition-all">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 mb-4 group-hover:from-cyan-500/40 group-hover:to-blue-500/40 transition-all">
              <Brain className="h-6 w-6 text-cyan-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">IA Local</h3>
            <p className="text-slate-400">
              Ollama e Whisper rodando localmente para máxima privacidade e sem custos de API
            </p>
          </div>

          <div className="group p-8 rounded-xl border border-slate-700/50 bg-slate-800/30 backdrop-blur hover:border-green-500/50 transition-all">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20 mb-4 group-hover:from-green-500/40 group-hover:to-emerald-500/40 transition-all">
              <MessageSquare className="h-6 w-6 text-green-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">WhatsApp Automation</h3>
            <p className="text-slate-400">
              Receba mensagens de voz e texto, processe automaticamente e responda inteligentemente
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-slate-800/50 border-y border-slate-700/50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">Funcionalidades Principais</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-gradient-to-br from-blue-500 to-cyan-500">
                  <Zap className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Painel de Controle Total</h3>
                <p className="text-slate-400">
                  Gerencie todos os serviços, configurações e dados sem sair do navegador
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-gradient-to-br from-cyan-500 to-blue-500">
                  <Lock className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">100% Independente</h3>
                <p className="text-slate-400">
                  Nenhuma integração com serviços externos. Seus dados, sua infraestrutura
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-gradient-to-br from-green-500 to-emerald-500">
                  <Smartphone className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Totalmente Responsivo</h3>
                <p className="text-slate-400">
                  Funciona perfeitamente em desktop, tablet e mobile
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-gradient-to-br from-purple-500 to-pink-500">
                  <Brain className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Inteligência Híbrida</h3>
                <p className="text-slate-400">
                  Combina regras rápidas com IA local para máxima eficiência
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="rounded-xl border border-slate-700/50 bg-gradient-to-r from-blue-600/10 to-cyan-600/10 backdrop-blur p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Pronto para começar?</h2>
          <p className="text-xl text-slate-300 mb-8">
            Acesse o painel e comece a gerenciar suas finanças com inteligência artificial
          </p>
          <Button
            size="lg"
            onClick={() => setLocation("/login")}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-lg px-8"
          >
            Acessar Painel
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700/50 bg-slate-800/30 backdrop-blur py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-400">
          <p>&copy; 2026 Gestor Financeiro IA. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
