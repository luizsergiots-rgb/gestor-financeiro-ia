import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { AlertCircle, CheckCircle, Download, Trash2, Play, Square, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function Settings() {
  const [whisperModel, setWhisperModel] = useState("base");
  const [whisperLanguage, setWhisperLanguage] = useState("pt");
  const [whisperMaxAudio, setWhisperMaxAudio] = useState("25");
  const [whisperInstalled, setWhisperInstalled] = useState(false);
  const [whisperRunning, setWhisperRunning] = useState(false);

  const [ollamaInstalled, setOllamaInstalled] = useState(false);
  const [ollamaRunning, setOllamaRunning] = useState(false);
  const [ollamaModels, setOllamaModels] = useState<string[]>([]);
  const [ollamaSelectedModel, setOllamaSelectedModel] = useState("llama2");
  const [ollamaTemperature, setOllamaTemperature] = useState("0.7");
  const [ollamaMaxTokens, setOllamaMaxTokens] = useState("512");

  const [evolutionApiUrl, setEvolutionApiUrl] = useState("http://localhost:8080");
  const [evolutionApiKey, setEvolutionApiKey] = useState("");
  const [evolutionConnected, setEvolutionConnected] = useState(false);
  const [evolutionQrCode, setEvolutionQrCode] = useState("");

  const [loading, setLoading] = useState(false);

  // Whisper handlers
  const handleInstallWhisper = async () => {
    setLoading(true);
    try {
      toast.loading("Instalando Whisper...");
      // Simular instalação
      await new Promise(r => setTimeout(r, 2000));
      setWhisperInstalled(true);
      toast.success("Whisper instalado com sucesso!");
      // Salvar configuração
      localStorage.setItem("whisper_installed", "true");
      localStorage.setItem("whisper_model", whisperModel);
    } catch (error) {
      toast.error("Erro ao instalar Whisper");
    } finally {
      setLoading(false);
    }
  };

  const handleStartWhisper = async () => {
    setLoading(true);
    try {
      toast.loading("Iniciando Whisper...");
      await new Promise(r => setTimeout(r, 1500));
      setWhisperRunning(true);
      toast.success("Whisper iniciado!");
      localStorage.setItem("whisper_running", "true");
    } catch (error) {
      toast.error("Erro ao iniciar Whisper");
    } finally {
      setLoading(false);
    }
  };

  const handleStopWhisper = async () => {
    setLoading(true);
    try {
      toast.loading("Parando Whisper...");
      await new Promise(r => setTimeout(r, 1500));
      setWhisperRunning(false);
      toast.success("Whisper parado!");
      localStorage.setItem("whisper_running", "false");
    } catch (error) {
      toast.error("Erro ao parar Whisper");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveWhisperConfig = async () => {
    try {
      localStorage.setItem("whisper_model", whisperModel);
      localStorage.setItem("whisper_language", whisperLanguage);
      localStorage.setItem("whisper_max_audio", whisperMaxAudio);
      toast.success("Configurações do Whisper salvas!");
    } catch (error) {
      toast.error("Erro ao salvar configurações");
    }
  };

  // Ollama handlers
  const handleInstallOllama = async () => {
    setLoading(true);
    try {
      toast.loading("Instalando Ollama...");
      await new Promise(r => setTimeout(r, 2000));
      setOllamaInstalled(true);
      toast.success("Ollama instalado com sucesso!");
      localStorage.setItem("ollama_installed", "true");
    } catch (error) {
      toast.error("Erro ao instalar Ollama");
    } finally {
      setLoading(false);
    }
  };

  const handleStartOllama = async () => {
    setLoading(true);
    try {
      toast.loading("Iniciando Ollama...");
      await new Promise(r => setTimeout(r, 1500));
      setOllamaRunning(true);
      toast.success("Ollama iniciado!");
      localStorage.setItem("ollama_running", "true");
    } catch (error) {
      toast.error("Erro ao iniciar Ollama");
    } finally {
      setLoading(false);
    }
  };

  const handleStopOllama = async () => {
    setLoading(true);
    try {
      toast.loading("Parando Ollama...");
      await new Promise(r => setTimeout(r, 1500));
      setOllamaRunning(false);
      toast.success("Ollama parado!");
      localStorage.setItem("ollama_running", "false");
    } catch (error) {
      toast.error("Erro ao parar Ollama");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadOllamaModel = async () => {
    setLoading(true);
    try {
      toast.loading(`Baixando modelo ${ollamaSelectedModel}...`);
      await new Promise(r => setTimeout(r, 3000));
      if (!ollamaModels.includes(ollamaSelectedModel)) {
        setOllamaModels([...ollamaModels, ollamaSelectedModel]);
      }
      toast.success(`Modelo ${ollamaSelectedModel} baixado!`);
    } catch (error) {
      toast.error("Erro ao baixar modelo");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveOllamaModel = async (model: string) => {
    setLoading(true);
    try {
      toast.loading(`Removendo modelo ${model}...`);
      await new Promise(r => setTimeout(r, 1500));
      setOllamaModels(ollamaModels.filter(m => m !== model));
      toast.success(`Modelo ${model} removido!`);
    } catch (error) {
      toast.error("Erro ao remover modelo");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveOllamaConfig = async () => {
    try {
      localStorage.setItem("ollama_temperature", ollamaTemperature);
      localStorage.setItem("ollama_max_tokens", ollamaMaxTokens);
      localStorage.setItem("ollama_selected_model", ollamaSelectedModel);
      toast.success("Configurações do Ollama salvas!");
    } catch (error) {
      toast.error("Erro ao salvar configurações");
    }
  };

  // Evolution API handlers
  const handleConnectEvolutionApi = async () => {
    setLoading(true);
    try {
      toast.loading("Conectando Evolution API...");
      await new Promise(r => setTimeout(r, 2000));
      setEvolutionConnected(true);
      setEvolutionQrCode("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='%23fff' width='200' height='200'/%3E%3Crect fill='%23000' x='10' y='10' width='20' height='20'/%3E%3C/svg%3E");
      toast.success("Evolution API conectado!");
      localStorage.setItem("evolution_api_url", evolutionApiUrl);
      localStorage.setItem("evolution_api_key", evolutionApiKey);
      localStorage.setItem("evolution_connected", "true");
    } catch (error) {
      toast.error("Erro ao conectar Evolution API");
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnectEvolutionApi = async () => {
    setLoading(true);
    try {
      toast.loading("Desconectando Evolution API...");
      await new Promise(r => setTimeout(r, 1500));
      setEvolutionConnected(false);
      setEvolutionQrCode("");
      toast.success("Evolution API desconectado!");
      localStorage.setItem("evolution_connected", "false");
    } catch (error) {
      toast.error("Erro ao desconectar Evolution API");
    } finally {
      setLoading(false);
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
              {/* Status */}
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  {whisperInstalled ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-yellow-500" />
                  )}
                  <div>
                    <p className="font-semibold">Status</p>
                    <p className="text-sm text-muted-foreground">
                      {whisperInstalled ? "Instalado" : "Não instalado"}
                      {whisperRunning && " - Rodando"}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {!whisperInstalled ? (
                    <Button onClick={handleInstallWhisper} disabled={loading}>
                      <Download className="w-4 h-4 mr-2" />
                      Instalar
                    </Button>
                  ) : (
                    <>
                      {!whisperRunning ? (
                        <Button onClick={handleStartWhisper} disabled={loading} variant="outline">
                          <Play className="w-4 h-4 mr-2" />
                          Iniciar
                        </Button>
                      ) : (
                        <Button onClick={handleStopWhisper} disabled={loading} variant="destructive">
                          <Square className="w-4 h-4 mr-2" />
                          Parar
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Configurações */}
              {whisperInstalled && (
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

                  <div className="space-y-2">
                    <Label htmlFor="whisper-max-audio">Limite de Áudio (MB)</Label>
                    <Input
                      id="whisper-max-audio"
                      type="number"
                      value={whisperMaxAudio}
                      onChange={(e) => setWhisperMaxAudio(e.target.value)}
                      min="1"
                      max="100"
                    />
                  </div>

                  <Button onClick={handleSaveWhisperConfig} className="w-full">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Salvar Configurações
                  </Button>
                </div>
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
              {/* Status */}
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  {ollamaInstalled ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-yellow-500" />
                  )}
                  <div>
                    <p className="font-semibold">Status</p>
                    <p className="text-sm text-muted-foreground">
                      {ollamaInstalled ? "Instalado" : "Não instalado"}
                      {ollamaRunning && " - Rodando"}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {!ollamaInstalled ? (
                    <Button onClick={handleInstallOllama} disabled={loading}>
                      <Download className="w-4 h-4 mr-2" />
                      Instalar
                    </Button>
                  ) : (
                    <>
                      {!ollamaRunning ? (
                        <Button onClick={handleStartOllama} disabled={loading} variant="outline">
                          <Play className="w-4 h-4 mr-2" />
                          Iniciar
                        </Button>
                      ) : (
                        <Button onClick={handleStopOllama} disabled={loading} variant="destructive">
                          <Square className="w-4 h-4 mr-2" />
                          Parar
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Configurações */}
              {ollamaInstalled && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
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

                    <div className="space-y-2">
                      <Label htmlFor="ollama-temperature">Temperatura</Label>
                      <Input
                        id="ollama-temperature"
                        type="number"
                        value={ollamaTemperature}
                        onChange={(e) => setOllamaTemperature(e.target.value)}
                        min="0"
                        max="1"
                        step="0.1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ollama-max-tokens">Limite de Tokens</Label>
                    <Input
                      id="ollama-max-tokens"
                      type="number"
                      value={ollamaMaxTokens}
                      onChange={(e) => setOllamaMaxTokens(e.target.value)}
                      min="128"
                      max="4096"
                    />
                  </div>

                  <Button onClick={handleSaveOllamaConfig} className="w-full">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Salvar Configurações
                  </Button>

                  {/* Modelos Instalados */}
                  <div className="space-y-3 pt-4 border-t">
                    <h3 className="font-semibold">Modelos Instalados</h3>
                    {ollamaModels.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Nenhum modelo instalado</p>
                    ) : (
                      <div className="space-y-2">
                        {ollamaModels.map((model) => (
                          <div key={model} className="flex items-center justify-between p-2 bg-muted rounded">
                            <span className="text-sm">{model}</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRemoveOllamaModel(model)}
                              disabled={loading}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Download Modelo */}
                  <div className="space-y-3 pt-4 border-t">
                    <h3 className="font-semibold">Baixar Novo Modelo</h3>
                    <Button onClick={handleDownloadOllamaModel} disabled={loading} className="w-full">
                      <Download className="w-4 h-4 mr-2" />
                      Baixar {ollamaSelectedModel}
                    </Button>
                  </div>
                </div>
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
              {/* Status */}
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  {evolutionConnected ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-yellow-500" />
                  )}
                  <div>
                    <p className="font-semibold">Status</p>
                    <p className="text-sm text-muted-foreground">
                      {evolutionConnected ? "Conectado" : "Desconectado"}
                    </p>
                  </div>
                </div>
                {evolutionConnected ? (
                  <Button onClick={handleDisconnectEvolutionApi} disabled={loading} variant="destructive">
                    Desconectar
                  </Button>
                ) : (
                  <Button onClick={handleConnectEvolutionApi} disabled={loading}>
                    Conectar
                  </Button>
                )}
              </div>

              {/* Configurações */}
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
              </div>

              {/* QR Code */}
              {evolutionConnected && evolutionQrCode && (
                <div className="space-y-3 pt-4 border-t">
                  <h3 className="font-semibold">QR Code para Conexão</h3>
                  <div className="flex justify-center p-4 bg-muted rounded-lg">
                    <img src={evolutionQrCode} alt="QR Code" className="w-48 h-48" />
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    Escaneie o QR Code com seu WhatsApp para conectar
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
