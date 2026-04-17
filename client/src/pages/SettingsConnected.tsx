import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { AlertCircle, CheckCircle, Download, Trash2, Play, Square, RefreshCw, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export default function SettingsConnected() {
  const [whisperModel, setWhisperModel] = useState("base");
  const [whisperLanguage, setWhisperLanguage] = useState("pt-BR");
  const [ollamaSelectedModel, setOllamaSelectedModel] = useState("llama2");
  const [evolutionApiUrl, setEvolutionApiUrl] = useState("http://localhost:8080");
  const [evolutionApiKey, setEvolutionApiKey] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);

  // Whisper queries and mutations
  const whisperStatus = trpc.services.whisper.getStatus.useQuery();
  const whisperInstall = trpc.services.whisper.install.useMutation();
  const whisperStart = trpc.services.whisper.start.useMutation();
  const whisperStop = trpc.services.whisper.stop.useMutation();
  const whisperSetModel = trpc.services.whisper.setModel.useMutation();
  const whisperSetLanguage = trpc.services.whisper.setLanguage.useMutation();
  const whisperTranscribe = trpc.services.whisper.transcribe.useMutation();

  // Ollama queries and mutations
  const ollamaStatus = trpc.services.ollama.getStatus.useQuery();
  const ollamaInstall = trpc.services.ollama.install.useMutation();
  const ollamaStart = trpc.services.ollama.start.useMutation();
  const ollamaStop = trpc.services.ollama.stop.useMutation();
  const ollamaDownloadModel = trpc.services.ollama.downloadModel.useMutation();
  const ollamaRemoveModel = trpc.services.ollama.removeModel.useMutation();
  const ollamaSetModel = trpc.services.ollama.setModel.useMutation();

  // Evolution API mutations
  const evolutionConfigure = trpc.services.evolutionApi.configure.useMutation();
  const evolutionTestConnection = trpc.services.evolutionApi.testConnection.useMutation();
  const evolutionStatus = trpc.services.evolutionApi.getStatus.useQuery();

  // System metrics query
  const systemMetrics = trpc.services.system.getMetrics.useQuery();

  // Handlers
  const handleInstallWhisper = () => {
    whisperInstall.mutate(undefined, {
      onSuccess: (result) => {
        if (result.success) {
          toast.success(result.message);
          whisperStatus.refetch();
        } else {
          toast.error(result.message || "Erro desconhecido");
        }
      },
      onError: () => {
        toast.error("Erro ao instalar Whisper");
      },
    });
  };

  const handleStartWhisper = () => {
    whisperStart.mutate(undefined, {
      onSuccess: (result) => {
        if (result.success) {
          toast.success(result.message);
          whisperStatus.refetch();
        } else {
          toast.error(result.message || "Erro desconhecido");
        }
      },
    });
  };

  const handleStopWhisper = () => {
    whisperStop.mutate(undefined, {
      onSuccess: (result) => {
        if (result.success) {
          toast.success(result.message);
          whisperStatus.refetch();
        } else {
          toast.error(result.message || "Erro desconhecido");
        }
      },
    });
  };

  const handleWhisperTranscribe = () => {
    if (!audioFile) {
      toast.error("Selecione um arquivo de áudio");
      return;
    }

    whisperTranscribe.mutate(
      { audioUrl: "local-file" },
      {
        onSuccess: (result) => {
          if (result.success) {
            toast.success("Transcrição realizada com sucesso");
          } else {
            toast.error(result.message || "Erro ao transcrever");
          }
        },
      }
    );
  };

  const handleInstallOllama = () => {
    ollamaInstall.mutate(undefined, {
      onSuccess: (result) => {
        if (result.success) {
          toast.success(result.message);
          ollamaStatus.refetch();
        } else {
          toast.error(result.message || "Erro desconhecido");
        }
      },
    });
  };

  const handleStartOllama = () => {
    ollamaStart.mutate(undefined, {
      onSuccess: (result) => {
        if (result.success) {
          toast.success(result.message);
          ollamaStatus.refetch();
        } else {
          toast.error(result.message || "Erro desconhecido");
        }
      },
    });
  };

  const handleStopOllama = () => {
    ollamaStop.mutate(undefined, {
      onSuccess: (result) => {
        if (result.success) {
          toast.success(result.message);
          ollamaStatus.refetch();
        } else {
          toast.error(result.message || "Erro desconhecido");
        }
      },
    });
  };

  const handleDownloadModel = () => {
    ollamaDownloadModel.mutate(
      { modelName: ollamaSelectedModel },
      {
        onSuccess: (result) => {
          if (result.success) {
            toast.success(result.message);
            ollamaStatus.refetch();
          } else {
            toast.error(result.message || "Erro desconhecido");
          }
        },
      }
    );
  };

  const handleConfigureEvolution = () => {
    if (!evolutionApiUrl || !evolutionApiKey) {
      toast.error("Preencha URL e chave da API");
      return;
    }

    evolutionConfigure.mutate(
      { apiUrl: evolutionApiUrl, apiKey: evolutionApiKey },
      {
        onSuccess: (result) => {
          if (result.success) {
            toast.success(result.message);
            evolutionStatus.refetch();
          } else {
            toast.error(result.message || "Erro desconhecido");
          }
        },
      }
    );
  };

  const handleTestEvolutionConnection = () => {
    evolutionTestConnection.mutate(undefined, {
      onSuccess: (result) => {
        if (result.success) {
          toast.success(result.message);
        } else {
          toast.error(result.message || "Erro ao testar conexão");
        }
      },
    });
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="whisper" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="whisper">Whisper</TabsTrigger>
          <TabsTrigger value="ollama">Ollama</TabsTrigger>
          <TabsTrigger value="evolution">Evolution API</TabsTrigger>
        </TabsList>

        {/* Whisper Tab */}
        <TabsContent value="whisper" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Whisper - Transcrição de Áudio</CardTitle>
              <CardDescription>Instale e configure o Whisper para transcrever áudio</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Status */}
              <div className="flex items-center justify-between p-4 bg-slate-900 rounded-lg">
                <div className="flex items-center gap-2">
                  {whisperStatus.data?.status === "installed" ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-yellow-500" />
                  )}
                  <div>
                    <p className="font-medium">Status: {whisperStatus.data?.status || "Carregando..."}</p>
                    <p className="text-sm text-slate-400">
                      {whisperStatus.data?.isRunning ? "Rodando" : "Parado"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Install Button */}
              {whisperStatus.data?.status !== "installed" && (
                <Button
                  onClick={handleInstallWhisper}
                  disabled={whisperInstall.isPending}
                  className="w-full"
                >
                  {whisperInstall.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Instalar Whisper
                </Button>
              )}

              {/* Control Buttons */}
              {whisperStatus.data?.status === "installed" && (
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={handleStartWhisper}
                    disabled={whisperStart.isPending || whisperStatus.data?.isRunning}
                    variant="outline"
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Iniciar
                  </Button>
                  <Button
                    onClick={handleStopWhisper}
                    disabled={whisperStop.isPending || !whisperStatus.data?.isRunning}
                    variant="outline"
                  >
                    <Square className="mr-2 h-4 w-4" />
                    Parar
                  </Button>
                </div>
              )}

              {/* Model Selection */}
              <div className="space-y-2">
                <Label>Modelo</Label>
                <Select value={whisperModel} onValueChange={setWhisperModel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tiny">Tiny (Rápido)</SelectItem>
                    <SelectItem value="base">Base (Recomendado)</SelectItem>
                    <SelectItem value="small">Small (Melhor)</SelectItem>
                    <SelectItem value="medium">Medium (Muito Bom)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Language Selection */}
              <div className="space-y-2">
                <Label>Idioma</Label>
                <Select value={whisperLanguage} onValueChange={setWhisperLanguage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                    <SelectItem value="pt">Português</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Audio Upload */}
              <div className="space-y-2">
                <Label>Testar Transcrição</Label>
                <Input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                />
                <Button
                  onClick={handleWhisperTranscribe}
                  disabled={whisperTranscribe.isPending || !audioFile}
                  className="w-full"
                >
                  {whisperTranscribe.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Transcrever
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ollama Tab */}
        <TabsContent value="ollama" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ollama - IA Local</CardTitle>
              <CardDescription>Instale e configure o Ollama para IA local</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Status */}
              <div className="flex items-center justify-between p-4 bg-slate-900 rounded-lg">
                <div className="flex items-center gap-2">
                  {ollamaStatus.data?.status === "installed" ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-yellow-500" />
                  )}
                  <div>
                    <p className="font-medium">Status: {ollamaStatus.data?.status || "Carregando..."}</p>
                    <p className="text-sm text-slate-400">
                      {ollamaStatus.data?.isRunning ? "Rodando" : "Parado"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Install Button */}
              {ollamaStatus.data?.status !== "installed" && (
                <Button
                  onClick={handleInstallOllama}
                  disabled={ollamaInstall.isPending}
                  className="w-full"
                >
                  {ollamaInstall.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Instalar Ollama
                </Button>
              )}

              {/* Control Buttons */}
              {ollamaStatus.data?.status === "installed" && (
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={handleStartOllama}
                    disabled={ollamaStart.isPending || ollamaStatus.data?.isRunning}
                    variant="outline"
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Iniciar
                  </Button>
                  <Button
                    onClick={handleStopOllama}
                    disabled={ollamaStop.isPending || !ollamaStatus.data?.isRunning}
                    variant="outline"
                  >
                    <Square className="mr-2 h-4 w-4" />
                    Parar
                  </Button>
                </div>
              )}

              {/* Model Selection */}
              <div className="space-y-2">
                <Label>Modelo</Label>
                <Select value={ollamaSelectedModel} onValueChange={setOllamaSelectedModel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="llama2">Llama 2</SelectItem>
                    <SelectItem value="mistral">Mistral</SelectItem>
                    <SelectItem value="neural-chat">Neural Chat</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Download Model Button */}
              <Button
                onClick={handleDownloadModel}
                disabled={ollamaDownloadModel.isPending}
                className="w-full"
              >
                <Download className="mr-2 h-4 w-4" />
                Baixar Modelo
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Evolution API Tab */}
        <TabsContent value="evolution" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Evolution API - WhatsApp</CardTitle>
              <CardDescription>Configure a integração com WhatsApp</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Status */}
              <div className="flex items-center justify-between p-4 bg-slate-900 rounded-lg">
                <div className="flex items-center gap-2">
                  {evolutionStatus.data?.status === "connected" ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-yellow-500" />
                  )}
                  <div>
                    <p className="font-medium">Status: {evolutionStatus.data?.status || "Carregando..."}</p>
                    <p className="text-sm text-slate-400">
                      {evolutionStatus.data?.isRunning ? "Conectado" : "Desconectado"}
                    </p>
                  </div>
                </div>
              </div>

              {/* API URL */}
              <div className="space-y-2">
                <Label>URL da API</Label>
                <Input
                  value={evolutionApiUrl}
                  onChange={(e) => setEvolutionApiUrl(e.target.value)}
                  placeholder="http://localhost:8080"
                />
              </div>

              {/* API Key */}
              <div className="space-y-2">
                <Label>Chave da API</Label>
                <Input
                  type="password"
                  value={evolutionApiKey}
                  onChange={(e) => setEvolutionApiKey(e.target.value)}
                  placeholder="Sua chave de API"
                />
              </div>

              {/* Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={handleConfigureEvolution}
                  disabled={evolutionConfigure.isPending}
                >
                  {evolutionConfigure.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Configurar
                </Button>
                <Button
                  onClick={handleTestEvolutionConnection}
                  disabled={evolutionTestConnection.isPending}
                  variant="outline"
                >
                  {evolutionTestConnection.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Testar Conexão
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* System Metrics */}
      {systemMetrics.data && (
        <Card>
          <CardHeader>
            <CardTitle>Métricas do Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-400">CPU</p>
                <p className="text-2xl font-bold">{systemMetrics.data.cpu}%</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Memória</p>
                <p className="text-2xl font-bold">{systemMetrics.data.memory}%</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Uptime</p>
                <p className="text-2xl font-bold">{systemMetrics.data.uptime} min</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Node.js</p>
                <p className="text-sm font-mono">{systemMetrics.data.nodeVersion}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
