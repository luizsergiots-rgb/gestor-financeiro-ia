import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, Upload, Trash2, RefreshCw, Database, Clock } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function DatabaseManagement() {
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<string | null>(null);

  // Fetch backups
  const { data: backupsData, refetch: refetchBackups, isLoading: backupsLoading } = trpc.database.listBackups.useQuery();
  const backups = backupsData?.backups || [];

  // Fetch database statistics
  const { data: stats, refetch: refetchStats } = trpc.database.getStatistics.useQuery();

  // Mutations
  const createBackupMutation = trpc.database.createBackup.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message);
        refetchBackups();
      } else {
        toast.error(data.message);
      }
      setIsCreatingBackup(false);
    },
    onError: (error) => {
      toast.error(`Erro ao criar backup: ${error.message}`);
      setIsCreatingBackup(false);
    },
  });

  const restoreBackupMutation = trpc.database.restoreBackup.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message);
        refetchBackups();
        refetchStats();
      } else {
        toast.error(data.message);
      }
    },
    onError: (error) => {
      toast.error(`Erro ao restaurar backup: ${error.message}`);
    },
  });

  const deleteBackupMutation = trpc.database.deleteBackup.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message);
        refetchBackups();
        setSelectedBackup(null);
      } else {
        toast.error(data.message);
      }
    },
    onError: (error) => {
      toast.error(`Erro ao deletar backup: ${error.message}`);
    },
  });

  const handleDownloadBackupClick = async (filename: string) => {
    try {
      const data = await (trpc.database.downloadBackup as any).query({ filename });
      if (data.success && data.content) {
        // Create download link
        const element = document.createElement("a");
        element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(data.content));
        element.setAttribute("download", data.filename);
        element.style.display = "none";
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        toast.success("Backup baixado com sucesso!");
      }
    } catch (error: any) {
      toast.error(`Erro ao baixar backup: ${error.message}`);
    }
  };

  const handleCreateBackup = async () => {
    setIsCreatingBackup(true);
    await createBackupMutation.mutateAsync();
  };

  const handleRestoreBackup = async (filename: string) => {
    if (confirm("Tem certeza que deseja restaurar este backup? Os dados atuais serão sobrescritos.")) {
      await restoreBackupMutation.mutateAsync({ filename });
    }
  };

  const handleDeleteBackup = async (filename: string) => {
    if (confirm("Tem certeza que deseja deletar este backup?")) {
      await deleteBackupMutation.mutateAsync({ filename });
    }
  };



  return (
    <div className="space-y-6">
      {/* Database Statistics */}
      {stats && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-cyan-400" />
              <CardTitle>Informações do Banco de Dados</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-700">
                <p className="text-sm text-slate-400">Banco de Dados</p>
                <p className="text-lg font-bold text-slate-200">{stats.database}</p>
              </div>
              <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-700">
                <p className="text-sm text-slate-400">Tamanho</p>
                <p className="text-lg font-bold text-slate-200">{stats.size_mb?.toFixed(2)} MB</p>
              </div>
              <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-700">
                <p className="text-sm text-slate-400">Tabelas</p>
                <p className="text-lg font-bold text-slate-200">{stats.tableCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Backup Actions */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle>Ações de Backup</CardTitle>
          <CardDescription>Crie, restaure ou delete backups do banco de dados</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleCreateBackup}
            disabled={isCreatingBackup || createBackupMutation.isPending}
            className="bg-cyan-600 hover:bg-cyan-700 text-white"
          >
            {isCreatingBackup ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Criando Backup...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Criar Novo Backup
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Backups List */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle>Backups Disponíveis</CardTitle>
          <CardDescription>{backups.length} backup(s) encontrado(s)</CardDescription>
        </CardHeader>
        <CardContent>
          {backupsLoading ? (
            <div className="text-center py-8 text-slate-400">Carregando backups...</div>
          ) : backups.length === 0 ? (
            <div className="text-center py-8 text-slate-400">Nenhum backup disponível</div>
          ) : (
            <div className="space-y-3">
              {backups.map((backup: any) => (
                <div
                  key={backup.filename}
                  className={`p-4 rounded-lg border transition-all cursor-pointer ${
                    selectedBackup === backup.filename
                      ? "bg-slate-700/50 border-cyan-400"
                      : "bg-slate-700/30 border-slate-700 hover:border-slate-600"
                  }`}
                  onClick={() => setSelectedBackup(backup.filename)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-slate-200">{backup.filename}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {new Date(backup.createdAt).toLocaleString("pt-BR")}
                        </div>
                        <Badge variant="secondary">{backup.size}</Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadBackupClick(backup.filename);
                        }}
                        variant="outline"
                        size="sm"
                        className="border-slate-600 text-slate-300 hover:bg-slate-700"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRestoreBackup(backup.filename);
                        }}
                        variant="outline"
                        size="sm"
                        disabled={restoreBackupMutation.isPending}
                        className="border-slate-600 text-slate-300 hover:bg-slate-700"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteBackup(backup.filename);
                        }}
                        variant="outline"
                        size="sm"
                        disabled={deleteBackupMutation.isPending}
                        className="border-red-600/50 text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Warning Card */}
      <Card className="bg-red-500/10 border-red-500/30">
        <CardHeader>
          <CardTitle className="text-red-400">⚠️ Aviso Importante</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-red-300">
          <ul className="list-disc list-inside space-y-2">
            <li>Backups são armazenados no servidor e podem ser perdidos em caso de falha</li>
            <li>Sempre mantenha cópias importantes em local seguro</li>
            <li>A restauração de um backup sobrescreverá todos os dados atuais</li>
            <li>Teste a restauração em um ambiente de teste antes de usar em produção</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
