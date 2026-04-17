import { useState, useEffect } from "react";
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
  const [whisperLanguage, setWhisperLanguage] = useState("pt");
  const [ollamaSelectedModel, setOllamaSelectedModel] = useState("llama2");
  const [evolutionApiUrl, setEvolutionApiUrl] = useState("http://localhost:8080");
  const [evolutionApiKey, setEvolutionApiKey] = useState("");

  // Whisper queries and mutations
  const whisperStatus = trpc.services.whisper.getStatus.useQuery();
  const whisperInstall = trpc.services.whisper.install.useMutation();
  const whisperStart = trpc.services.whisper.start.useMutation();
  const whisperStop = trpc.services.whisper.stop.useMutation();

  // Ollama queries and mutations
  const ollamaStatus = trpc.services.ollama.getStatus.useQuery();
  const ollamaInstall = trpc.services.ollama.install.useMutation();
  const ollamaStart = trpc.services.ollama.start.useMutation();
  const ollamaStop = trpc.services.ollama.stop.useMutation();
  const ollamaModels = trpc.services.ollama.getModels.useQuery();
  const ollamaDownloadModel = trpc.services.ollama.downloadModel.useMutation();
  const ollamaRemoveModel = trpc.services.ollama.removeModel.useMutation();

  // Evolution API mutations
  const evolutionConfigure = trpc.services.evolution.configure.useMutation();
  const evolutionTestConnection = trpc.services.evolution.testConnection.useMutation();

  // Monitoring query
  const systemStatus = trpc.services.monitoring.getSystemStatus.useQuery();

  // Handlers
  const handleInstallWhisper = async () => {
    try {
      const result = await whisperInstall.mutateAsync();
      if (result.success) {
        toast.success(result.message);
        whisperStatus.refetch();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Erro ao instalar Whisper");
    }
  };

  const handleStartWhisper = async () => {
    try {
      const result = await whisperStart.mutateAsync();
      if (result.success) {
        toast.success(result.message);
        whisperStatus.refetch();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Erro ao iniciar Whisper");
    }
  };

  const handleStopWhisper = async () => {
    try {
      const result = await whisperStop.mutateAsync();
      if (result.success) {
        toast.success(result.message);
        whisperStatus.refetch();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Erro ao parar Whisper");
    }
  };

  const handleInstallOllama = async () => {
    try {
      const result = await ollamaInstall.mutateAsync();
      if (result.success) {
        toast.success(result.message);
        ollamaStatus.refetch();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Erro ao instalar Ollama");
    }
  };

  const handleStartOllama = async () => {
    try {
      const result = await ollamaStart.mutateAsync();
      if (result.success) {
        toast.success(result.message);
        ollamaStatus.refetch();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Erro ao iniciar Ollama");
    }
  };

  const handleStopOllama = async () => {
    try {
      const result = await ollamaStop.mutateAsync();
      if (result.success) {
        toast.success(result.message);
        ollamaStatus.refetch();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Erro ao parar Ollama");
    }
  };

  const handleDownloadOllamaModel = async () => {
    try {
      const result = await ollamaDownloadModel.mutateAsync({ modelName: ollamaSelectedModel });
      if (result.success) {
        toast.success(result.message);
        ollamaModels.refetch();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Erro ao baixar modelo");
    }
  };

  const handleConfigureEvolutionAPI = async () => {
    try {
      const result = await evolutionConfigure.mutateAsync({
        apiUrl: evolutionApiUrl,
        apiKey: evolutionApiKey,
      });
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Erro ao configurar Evolution API");
    }
  };

  const handleTestEvolutionConnection = async () => {
    try {
      const result = await evolutionTestConnection.mutateAsync();
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Erro ao testar conexão");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground mt-2">Gerencie seus serviços e configurações do sistema</p>
      </div>

      <Tabs defaultValue="whisper" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="whisper">Whisper</TabsTrigger>
          <TabsTrigger value="ollama">Ollama</TabsTrigger>
          <TabsTrigger value="evolution">Evolution API</TabsTrigger>
        </TabsList>

        {/* WHISPER TAB */}
        <TabsContent value="whisper" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Whisper - Transcrição de Áudio</CardTitle>
              <CardDescription>Configure e gerencie o serviço de transcrição de áudio</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {whisperStatus.isLoading ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      {whisperStatus.data?.status === "installed" ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-yellow-500" />
                      )}
                      <div>
                        <p className="font-semibold">Status</p>
                        <p className="text-sm text-muted-foreground">{whisperStatus.data?.status || "Desconhecido"}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {whisperStatus.data?.status === "not-installed" ? (
                        <Button onClick={handleInstallWhisper} disabled={whisperInstall.isPending}>
                          {whisperInstall.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                          Instalar
                        </Button>
                      ) : (
                        <>
                          <Button onClick={handleStartWhisper} disabled={whisperStart.isPending} variant="outline">
                            {whisperStart.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
                            Iniciar
                          </Button>
                          <Button onClick={handleStopWhisper} disabled={whisperStop.isPending} variant="destructive">
                            {whisperStop.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Square className="w-4 h-4 mr-2" />}
                            Parar
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {whisperStatus.data?.status === "installed" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="whisper-model">Modelo</Label>
                          <Select value={whisperModel} onValueChange={setWhisperModel}>
                            <SelectTrigger id="whisper-model">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="tiny">Tiny (74 MB)</SelectItem>
                              <SelectItem value="base">Base (140 MB)</SelectItem>
                              <SelectItem value="small">Small (461 MB)</SelectItem>
                              <SelectItem value="medium">Medium (1.5 GB)</SelectItem>
                              <SelectItem value="large">Large (2.9 GB)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="whisper-language">Idioma</Label>
                          <Select value={whisperLanguage} onValueChange={setWhisperLanguage}>
                            <SelectTrigger id="whisper-language">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pt">Português</SelectItem>
                              <SelectItem value="en">English</SelectItem>
                              <SelectItem value="es">Español</SelectItem>
                              <SelectItem value="fr">Français</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* OLLAMA TAB */}
        <TabsContent value="ollama" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ollama - IA Local</CardTitle>
              <CardDescription>Configure e gerencie modelos de IA local</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {ollamaStatus.isLoading ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      {ollamaStatus.data?.status !== "not-installed" ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-yellow-500" />
                      )}
                      <div>
                        <p className="font-semibold">Status</p>
                        <p className="text-sm text-muted-foreground">{ollamaStatus.data?.status || "Desconhecido"}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {ollamaStatus.data?.status === "not-installed" ? (
                        <Button onClick={handleInstallOllama} disabled={ollamaInstall.isPending}>
                          {ollamaInstall.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                          Instalar
                        </Button>
                      ) : (
                        <>
                          <Button onClick={handleStartOllama} disabled={ollamaStart.isPending} variant="outline">
                            {ollamaStart.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
                            Iniciar
                          </Button>
                          <Button onClick={handleStopOllama} disabled={ollamaStop.isPending} variant="destructive">
                            {ollamaStop.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Square className="w-4 h-4 mr-2" />}
                            Parar
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {ollamaStatus.data?.status !== "not-installed" && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="ollama-model">Modelo</Label>
                        <Select value={ollamaSelectedModel} onValueChange={setOllamaSelectedModel}>
                          <SelectTrigger id="ollama-model">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="llama2">Llama 2</SelectItem>
                            <SelectItem value="mistral">Mistral</SelectItem>
                            <SelectItem value="neural-chat">Neural Chat</SelectItem>
                            <SelectItem value="dolphin-mixtral">Dolphin Mixtral</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Button onClick={handleDownloadOllamaModel} disabled={ollamaDownloadModel.isPending} className="w-full">
                        {ollamaDownloadModel.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                        Baixar {ollamaSelectedModel}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* EVOLUTION API TAB */}
        <TabsContent value="evolution" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Evolution API - WhatsApp</CardTitle>
              <CardDescription>Configure a integração com WhatsApp via Evolution API</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="evolution-url">URL da API</Label>
                  <Input
                    id="evolution-url"
                    value={evolutionApiUrl}
                    onChange={(e) => setEvolutionApiUrl(e.target.value)}
                    placeholder="http://localhost:8080"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="evolution-key">Chave da API</Label>
                  <Input
                    id="evolution-key"
                    type="password"
                    value={evolutionApiKey}
                    onChange={(e) => setEvolutionApiKey(e.target.value)}
                    placeholder="Sua chave de API"
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleConfigureEvolutionAPI} disabled={evolutionConfigure.isPending} className="flex-1">
                    {evolutionConfigure.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                    Salvar Configuração
                  </Button>
                  <Button onClick={handleTestEvolutionConnection} disabled={evolutionTestConnection.isPending} variant="outline" className="flex-1">
                    {evolutionTestConnection.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                    Testar Conexão
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
