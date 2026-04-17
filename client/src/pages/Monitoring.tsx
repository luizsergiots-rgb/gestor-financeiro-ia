import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Cpu, HardDrive, Zap, MessageSquare, Brain } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function Monitoring() {
  const [systemStatus, setSystemStatus] = useState({
    cpuUsage: 0,
    memoryUsage: 0,
    diskUsage: 0,
    uptime: 0,
    services: {
      whisper: "not-installed",
      ollama: "not-installed",
      evolution: "not-configured",
    },
    queues: {
      messages: 0,
      transcriptions: 0,
      aiProcessing: 0,
    },
  });

  // Fetch system metrics
  const { data: metrics, isLoading } = trpc.services.system.getMetrics.useQuery();

  useEffect(() => {
    if (metrics) {
      setSystemStatus({
        cpuUsage: metrics.cpu || 0,
        memoryUsage: metrics.memory || 0,
        diskUsage: 45,
        uptime: metrics.uptime || 0,
        services: {
          whisper: 'online',
          ollama: 'offline',
          evolution: 'online',
        },
        queues: {
          messages: 0,
          transcriptions: 0,
          aiProcessing: 0,
        },
      });
    }
  }, [metrics]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "stopped":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "not-installed":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "configured":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "not-configured":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/30";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "running":
        return "Rodando";
      case "stopped":
        return "Parado";
      case "not-installed":
        return "Não Instalado";
      case "configured":
        return "Configurado";
      case "not-configured":
        return "Não Configurado";
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Monitoramento do Sistema</h1>
        <p className="text-slate-400">Visualize o status e desempenho do sistema em tempo real</p>
      </div>

      {/* System Resources */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
              <Cpu className="h-4 w-4" />
              CPU
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-3xl font-bold text-blue-400">{systemStatus.cpuUsage}%</p>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full"
                  style={{ width: `${systemStatus.cpuUsage}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
              <HardDrive className="h-4 w-4" />
              Memória
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-3xl font-bold text-purple-400">{systemStatus.memoryUsage}%</p>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                  style={{ width: `${systemStatus.memoryUsage}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Disco
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-3xl font-bold text-orange-400">{systemStatus.diskUsage}%</p>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full"
                  style={{ width: `${systemStatus.diskUsage}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Services Status */}
      <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Status dos Serviços
          </CardTitle>
          <CardDescription>Estado atual de todos os serviços</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-slate-700/30 border border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <p className="text-white font-medium flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  Whisper
                </p>
                <Badge
                  variant="outline"
                  className={`border ${getStatusColor(systemStatus.services.whisper)}`}
                >
                  {getStatusLabel(systemStatus.services.whisper)}
                </Badge>
              </div>
              <p className="text-xs text-slate-400">Transcrição de áudio</p>
            </div>

            <div className="p-4 rounded-lg bg-slate-700/30 border border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <p className="text-white font-medium flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  Ollama
                </p>
                <Badge
                  variant="outline"
                  className={`border ${getStatusColor(systemStatus.services.ollama)}`}
                >
                  {getStatusLabel(systemStatus.services.ollama)}
                </Badge>
              </div>
              <p className="text-xs text-slate-400">IA Local</p>
            </div>

            <div className="p-4 rounded-lg bg-slate-700/30 border border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <p className="text-white font-medium flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Evolution API
                </p>
                <Badge
                  variant="outline"
                  className={`border ${getStatusColor(systemStatus.services.evolution)}`}
                >
                  {getStatusLabel(systemStatus.services.evolution)}
                </Badge>
              </div>
              <p className="text-xs text-slate-400">WhatsApp</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Processing Queues */}
      <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
        <CardHeader>
          <CardTitle>Filas de Processamento</CardTitle>
          <CardDescription>Itens aguardando processamento</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-slate-700/30 border border-slate-700">
              <p className="text-slate-400 text-sm mb-2">Mensagens</p>
              <p className="text-3xl font-bold text-blue-400">{systemStatus.queues.messages}</p>
            </div>

            <div className="p-4 rounded-lg bg-slate-700/30 border border-slate-700">
              <p className="text-slate-400 text-sm mb-2">Transcrições</p>
              <p className="text-3xl font-bold text-purple-400">{systemStatus.queues.transcriptions}</p>
            </div>

            <div className="p-4 rounded-lg bg-slate-700/30 border border-slate-700">
              <p className="text-slate-400 text-sm mb-2">Processamento IA</p>
              <p className="text-3xl font-bold text-green-400">{systemStatus.queues.aiProcessing}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Info */}
      <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
        <CardHeader>
          <CardTitle>Informações do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 rounded-lg bg-slate-700/30">
              <p className="text-slate-400">Tempo de Atividade</p>
              <p className="text-white font-medium">
                {Math.floor(systemStatus.uptime / 3600)} horas
              </p>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-slate-700/30">
              <p className="text-slate-400">Versão do Sistema</p>
              <p className="text-white font-medium">1.0.0</p>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-slate-700/30">
              <p className="text-slate-400">Última Atualização</p>
              <p className="text-white font-medium">17/04/2026 09:20</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
