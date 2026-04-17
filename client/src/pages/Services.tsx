import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, Download, Trash2, Play, Square, Settings, AlertCircle, CheckCircle2 } from "lucide-react";

export default function Services() {
  const [whisperStatus, setWhisperStatus] = useState<"not-installed" | "installing" | "running" | "stopped">("not-installed");
  const [ollamaStatus, setOllamaStatus] = useState<"not-installed" | "installing" | "running" | "stopped">("not-installed");
  const [evolutionStatus, setEvolutionStatus] = useState<"not-configured" | "connecting" | "connected" | "error">("not-configured");

  const handleInstallWhisper = async () => {
    setWhisperStatus("installing");
    // Simulated installation
    setTimeout(() => setWhisperStatus("running"), 2000);
  };

  const handleInstallOllama = async () => {
    setOllamaStatus("installing");
    // Simulated installation
    setTimeout(() => setOllamaStatus("running"), 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running":
      case "connected":
        return "bg-green-500/20 text-green-300 border-green-500/50";
      case "installing":
      case "connecting":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/50";
      case "stopped":
      case "not-configured":
        return "bg-slate-500/20 text-slate-300 border-slate-500/50";
      case "not-installed":
        return "bg-red-500/20 text-red-300 border-red-500/50";
      case "error":
        return "bg-red-500/20 text-red-300 border-red-500/50";
      default:
        return "bg-slate-500/20 text-slate-300 border-slate-500/50";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "running":
      case "connected":
        return <CheckCircle2 className="h-4 w-4" />;
      case "installing":
      case "connecting":
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case "error":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Gerenciamento de Serviços</h1>
        <p className="text-slate-400">Instale e controle os serviços de IA e comunicação do sistema</p>
      </div>

      <Tabs defaultValue="whisper" className="space-y-4">
        <TabsList className="bg-slate-800/50 border-slate-700">
          <TabsTrigger value="whisper">Whisper</TabsTrigger>
          <TabsTrigger value="ollama">Ollama</TabsTrigger>
          <TabsTrigger value="evolution">Evolution API</TabsTrigger>
        </TabsList>

        {/* Whisper Tab */}
        <TabsContent value="whisper" className="space-y-4">
          <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <span>Whisper - Transcrição de Voz</span>
                    <Badge className={`${getStatusColor(whisperStatus)} border`}>
                      <span className="flex items-center gap-1">
                        {getStatusIcon(whisperStatus)}
                        {whisperStatus === "not-installed" && "Não Instalado"}
                        {whisperStatus === "installing" && "Instalando..."}
                        {whisperStatus === "running" && "Ativo"}
                        {whisperStatus === "stopped" && "Parado"}
                      </span>
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Transcrição de áudio para texto com IA local
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {whisperStatus === "not-installed" && (
                <Alert className="bg-yellow-950/50 border-yellow-700">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Whisper não está instalado. Clique em "Instalar" para começar.
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-slate-700/30 border border-slate-700">
                  <p className="text-sm text-slate-400 mb-2">Modelo Padrão</p>
                  <p className="text-lg font-semibold text-white">Base</p>
                </div>
                <div className="p-4 rounded-lg bg-slate-700/30 border border-slate-700">
                  <p className="text-sm text-slate-400 mb-2">Idioma</p>
                  <p className="text-lg font-semibold text-white">Português (BR)</p>
                </div>
              </div>

              <div className="flex gap-2">
              {(whisperStatus === "not-installed" || whisperStatus === "stopped") && (
                <Button
                  onClick={handleInstallWhisper}
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                  >
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Instalar Whisper
                    </>
                  </Button>
                )}

                {whisperStatus === "running" && (
                  <>
                    <Button variant="outline" className="border-slate-600">
                      <Play className="mr-2 h-4 w-4" />
                      Testar Transcrição
                    </Button>
                    <Button variant="outline" className="border-slate-600">
                      <Settings className="mr-2 h-4 w-4" />
                      Configurar
                    </Button>
                    <Button
                      variant="outline"
                      className="border-red-600 text-red-400 hover:bg-red-950/50"
                    >
                      <Square className="mr-2 h-4 w-4" />
                      Parar
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ollama Tab */}
        <TabsContent value="ollama" className="space-y-4">
          <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <span>Ollama - IA Local</span>
                    <Badge className={`${getStatusColor(ollamaStatus)} border`}>
                      <span className="flex items-center gap-1">
                        {getStatusIcon(ollamaStatus)}
                        {ollamaStatus === "not-installed" && "Não Instalado"}
                        {ollamaStatus === "installing" && "Instalando..."}
                        {ollamaStatus === "running" && "Ativo"}
                        {ollamaStatus === "stopped" && "Parado"}
                      </span>
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Modelos de IA local para processamento de linguagem natural
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {ollamaStatus === "not-installed" && (
                <Alert className="bg-yellow-950/50 border-yellow-700">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Ollama não está instalado. Clique em "Instalar" para começar.
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-slate-700/30 border border-slate-700">
                  <p className="text-sm text-slate-400 mb-2">Modelos Instalados</p>
                  <p className="text-lg font-semibold text-white">0</p>
                </div>
                <div className="p-4 rounded-lg bg-slate-700/30 border border-slate-700">
                  <p className="text-sm text-slate-400 mb-2">Uso de Memória</p>
                  <p className="text-lg font-semibold text-white">-</p>
                </div>
              </div>

              <div className="flex gap-2">
              {(ollamaStatus === "not-installed" || ollamaStatus === "stopped") && (
                <Button
                  onClick={handleInstallOllama}
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                  >
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Instalar Ollama
                    </>
                  </Button>
                )}

                {ollamaStatus === "running" && (
                  <>
                    <Button variant="outline" className="border-slate-600">
                      <Download className="mr-2 h-4 w-4" />
                      Baixar Modelo
                    </Button>
                    <Button variant="outline" className="border-slate-600">
                      <Settings className="mr-2 h-4 w-4" />
                      Configurar
                    </Button>
                    <Button
                      variant="outline"
                      className="border-red-600 text-red-400 hover:bg-red-950/50"
                    >
                      <Square className="mr-2 h-4 w-4" />
                      Parar
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Evolution API Tab */}
        <TabsContent value="evolution" className="space-y-4">
          <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <span>Evolution API - WhatsApp</span>
                    <Badge className={`${getStatusColor(evolutionStatus)} border`}>
                      <span className="flex items-center gap-1">
                        {getStatusIcon(evolutionStatus)}
                        {evolutionStatus === "not-configured" && "Não Configurado"}
                        {evolutionStatus === "connecting" && "Conectando..."}
                        {evolutionStatus === "connected" && "Conectado"}
                        {evolutionStatus === "error" && "Erro"}
                      </span>
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Integração com WhatsApp via Evolution API
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {evolutionStatus === "not-configured" && (
                <Alert className="bg-yellow-950/50 border-yellow-700">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Evolution API não está configurada. Configure as credenciais para começar.
                  </AlertDescription>
                </Alert>
              )}

              <div className="p-4 rounded-lg bg-slate-700/30 border border-slate-700 space-y-3">
                <div>
                  <p className="text-sm text-slate-400 mb-1">URL da API</p>
                  <input
                    type="text"
                    placeholder="https://api.evolution.ai"
                    className="w-full px-3 py-2 rounded bg-slate-700/50 border border-slate-600 text-white placeholder:text-slate-500"
                  />
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">API Key</p>
                  <input
                    type="password"
                    placeholder="Sua API Key"
                    className="w-full px-3 py-2 rounded bg-slate-700/50 border border-slate-600 text-white placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
                  <Settings className="mr-2 h-4 w-4" />
                  Configurar
                </Button>
                <Button variant="outline" className="border-slate-600">
                  Testar Conexão
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
