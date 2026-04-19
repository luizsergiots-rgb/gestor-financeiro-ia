import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Download, Play, Settings, AlertCircle, CheckCircle2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

const showNotification = (title: string, message: string, type: 'success' | 'error' = 'success') => {
  console.log(`[${type.toUpperCase()}] ${title}: ${message}`);
  // In production, integrate with a toast library
  alert(`${title}: ${message}`);
};

export default function Services() {
  // Whisper state
  const [whisperModel, setWhisperModel] = useState("base");
  const [whisperLanguage, setWhisperLanguage] = useState("pt-BR");
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  
  // Evolution API state
  const [evolutionApiUrl, setEvolutionApiUrl] = useState("");
  const [evolutionApiKey, setEvolutionApiKey] = useState("");
  const [evolutionDialogOpen, setEvolutionDialogOpen] = useState(false);
  
  // Queries
  const whisperStatus = trpc.services.whisper.getStatus.useQuery();
  const ollamaStatus = trpc.services.ollama.getStatus.useQuery();
  const evolutionStatus = trpc.services.evolutionApi.getStatus.useQuery();
  
  // Mutations
  const installWhisper = trpc.services.whisper.install.useMutation({
    onSuccess: () => {
      showNotification("Sucesso", "Whisper instalado com sucesso");
      whisperStatus.refetch();
    },
    onError: (error) => {
      showNotification("Erro", error.message, 'error');
    },
  });
  
  const installOllama = trpc.services.ollama.install.useMutation({
    onSuccess: () => {
      showNotification("Sucesso", "Ollama configurado com sucesso");
      ollamaStatus.refetch();
    },
    onError: (error) => {
      showNotification("Erro", error.message, 'error');
    },
  });
  
  const setWhisperModelMutation = trpc.services.whisper.setModel.useMutation({
    onSuccess: () => {
      showNotification("Sucesso", "Modelo atualizado com sucesso");
      whisperStatus.refetch();
    },
    onError: (error) => {
      showNotification("Erro", error.message, 'error');
    },
  });
  
  const setWhisperLanguageMutation = trpc.services.whisper.setLanguage.useMutation({
    onSuccess: () => {
      showNotification("Sucesso", "Idioma atualizado com sucesso");
      whisperStatus.refetch();
    },
    onError: (error) => {
      showNotification("Erro", error.message, 'error');
    },
  });
  
  const configureEvolutionApi = trpc.services.evolutionApi.configure.useMutation({
    onSuccess: () => {
      showNotification("Sucesso", "Evolution API configurada com sucesso");
      setEvolutionDialogOpen(false);
      evolutionStatus.refetch();
    },
    onError: (error) => {
      showNotification("Erro", error.message, 'error');
    },
  });
  
  const testEvolutionConnection = trpc.services.evolutionApi.testConnection.useMutation({
    onSuccess: (result) => {
      if (result.success) {
        showNotification("Sucesso", "Conexão estabelecida com sucesso");
      } else {
        showNotification("Erro", result.message, 'error');
      }
    },
    onError: (error) => {
      showNotification("Erro", error.message, 'error');
    },
  });

  // Load Evolution API config on mount
  useEffect(() => {
    if (evolutionStatus.data?.apiUrl) {
      setEvolutionApiUrl(evolutionStatus.data.apiUrl);
    }
  }, [evolutionStatus.data?.apiUrl]);

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

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "not-installed":
        return "Não Instalado";
      case "installed":
        return "Instalado";
      case "not-configured":
        return "Não Configurado";
      case "configured":
        return "Configurado";
      case "connected":
        return "Conectado";
      default:
        return status;
    }
  };

  if (whisperStatus.isLoading || ollamaStatus.isLoading || evolutionStatus.isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

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
                    <Badge className={`${getStatusColor(whisperStatus.data?.status || "not-installed")} border`}>
                      <span className="flex items-center gap-1">
                        {getStatusIcon(whisperStatus.data?.status || "not-installed")}
                        {getStatusLabel(whisperStatus.data?.status || "not-installed")}
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
              {whisperStatus.data?.status === "not-installed" && (
                <Alert className="bg-yellow-950/50 border-yellow-700">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Whisper não está instalado. Clique em "Instalar" para começar.
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-slate-700/30 border border-slate-700">
                  <p className="text-sm text-slate-400 mb-2">Modelo</p>
                  <p className="text-lg font-semibold text-white">{whisperStatus.data?.model || "base"}</p>
                </div>
                <div className="p-4 rounded-lg bg-slate-700/30 border border-slate-700">
                  <p className="text-sm text-slate-400 mb-2">Idioma</p>
                  <p className="text-lg font-semibold text-white">{whisperStatus.data?.language || "pt-BR"}</p>
                </div>
              </div>

              <div className="flex gap-2 flex-wrap">
                {whisperStatus.data?.status === "not-installed" && (
                  <Button
                    onClick={() => installWhisper.mutate()}
                    disabled={installWhisper.isPending}
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                  >
                    {installWhisper.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Instalando...
                      </>
                    ) : (
                      <>
                        <Download className="mr-2 h-4 w-4" />
                        Instalar Whisper
                      </>
                    )}
                  </Button>
                )}

                {whisperStatus.data?.status === "installed" && (
                  <>
                    <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="border-slate-600">
                          <Settings className="mr-2 h-4 w-4" />
                          Configurar
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-slate-900 border-slate-700">
                        <DialogHeader>
                          <DialogTitle>Configurar Whisper</DialogTitle>
                          <DialogDescription>
                            Ajuste as configurações do Whisper
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="model">Modelo</Label>
                            <select
                              id="model"
                              value={whisperModel}
                              onChange={(e) => setWhisperModel(e.target.value)}
                              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-white"
                            >
                              <option value="tiny">Tiny (Rápido)</option>
                              <option value="base">Base (Recomendado)</option>
                              <option value="small">Small</option>
                              <option value="medium">Medium</option>
                              <option value="large">Large (Lento)</option>
                            </select>
                          </div>
                          <div>
                            <Label htmlFor="language">Idioma</Label>
                            <select
                              id="language"
                              value={whisperLanguage}
                              onChange={(e) => setWhisperLanguage(e.target.value)}
                              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-white"
                            >
                              <option value="pt-BR">Português (Brasil)</option>
                              <option value="pt-PT">Português (Portugal)</option>
                              <option value="en">English</option>
                              <option value="es">Español</option>
                            </select>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => {
                                setWhisperModelMutation.mutate({ model: whisperModel });
                                setWhisperLanguageMutation.mutate({ language: whisperLanguage });
                                setConfigDialogOpen(false);
                              }}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              Salvar
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => setConfigDialogOpen(false)}
                            >
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
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
                    <Badge className={`${getStatusColor(ollamaStatus.data?.status || "not-installed")} border`}>
                      <span className="flex items-center gap-1">
                        {getStatusIcon(ollamaStatus.data?.status || "not-installed")}
                        {getStatusLabel(ollamaStatus.data?.status || "not-installed")}
                      </span>
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Modelos de IA executados localmente
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {ollamaStatus.data?.status === "not-installed" && (
                <Alert className="bg-yellow-950/50 border-yellow-700">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Ollama não está instalado. Clique em "Instalar" para começar.
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-slate-700/30 border border-slate-700">
                  <p className="text-sm text-slate-400 mb-2">Modelo Ativo</p>
                  <p className="text-lg font-semibold text-white">{ollamaStatus.data?.model || "llama2"}</p>
                </div>
                <div className="p-4 rounded-lg bg-slate-700/30 border border-slate-700">
                  <p className="text-sm text-slate-400 mb-2">Status</p>
                  <p className="text-lg font-semibold text-white">
                    {ollamaStatus.data?.isRunning ? "Rodando" : "Parado"}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                {ollamaStatus.data?.status === "not-installed" && (
                  <Button
                    onClick={() => installOllama.mutate()}
                    disabled={installOllama.isPending}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    {installOllama.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Configurando...
                      </>
                    ) : (
                      <>
                        <Download className="mr-2 h-4 w-4" />
                        Instalar Ollama
                      </>
                    )}
                  </Button>
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
                    <Badge className={`${getStatusColor(evolutionStatus.data?.status || "not-configured")} border`}>
                      <span className="flex items-center gap-1">
                        {getStatusIcon(evolutionStatus.data?.status || "not-configured")}
                        {getStatusLabel(evolutionStatus.data?.status || "not-configured")}
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
              {evolutionStatus.data?.status === "not-configured" && (
                <Alert className="bg-yellow-950/50 border-yellow-700">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Evolution API não está configurada. Clique em "Configurar" para começar.
                  </AlertDescription>
                </Alert>
              )}

              {evolutionStatus.data?.status === "configured" && (
                <Alert className="bg-blue-950/50 border-blue-700">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Evolution API está configurada mas não conectada. Clique em "Testar Conexão".
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-slate-700/30 border border-slate-700">
                  <p className="text-sm text-slate-400 mb-2">URL da API</p>
                  <p className="text-sm font-mono text-white break-all">{evolutionStatus.data?.apiUrl || "Não configurada"}</p>
                </div>
                <div className="p-4 rounded-lg bg-slate-700/30 border border-slate-700">
                  <p className="text-sm text-slate-400 mb-2">Chave API</p>
                  <p className="text-sm font-mono text-white">
                    {evolutionStatus.data?.hasApiKey ? "••••••••••••••••" : "Não configurada"}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 flex-wrap">
                <Dialog open={evolutionDialogOpen} onOpenChange={setEvolutionDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="border-slate-600">
                      <Settings className="mr-2 h-4 w-4" />
                      Configurar
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-slate-900 border-slate-700">
                    <DialogHeader>
                      <DialogTitle>Configurar Evolution API</DialogTitle>
                      <DialogDescription>
                        Adicione as credenciais da Evolution API
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="api-url">URL da API</Label>
                        <Input
                          id="api-url"
                          placeholder="http://localhost:3001"
                          value={evolutionApiUrl}
                          onChange={(e) => setEvolutionApiUrl(e.target.value)}
                          className="bg-slate-800 border-slate-700"
                        />
                      </div>
                      <div>
                        <Label htmlFor="api-key">Chave API</Label>
                        <Input
                          id="api-key"
                          type="password"
                          placeholder="sua_chave_api_aqui"
                          value={evolutionApiKey}
                          onChange={(e) => setEvolutionApiKey(e.target.value)}
                          className="bg-slate-800 border-slate-700"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => {
                            configureEvolutionApi.mutate({
                              apiUrl: evolutionApiUrl,
                              apiKey: evolutionApiKey,
                            });
                          }}
                          disabled={configureEvolutionApi.isPending}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          {configureEvolutionApi.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Salvando...
                            </>
                          ) : (
                            "Salvar"
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setEvolutionDialogOpen(false)}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                {evolutionStatus.data?.isConfigured && (
                  <Button
                    onClick={() => testEvolutionConnection.mutate()}
                    disabled={testEvolutionConnection.isPending}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {testEvolutionConnection.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Testando...
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        Testar Conexão
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
