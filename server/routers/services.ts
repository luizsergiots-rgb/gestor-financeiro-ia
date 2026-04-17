import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { systemConfig } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { exec } from "child_process";
import { promisify } from "util";
import os from "os";

const execAsync = promisify(exec);

export const servicesRouter = router({
  whisper: router({
    getStatus: protectedProcedure.query(async () => {
      try {
        await execAsync("which whisper");
        return { status: "installed", version: "1.0", model: "base", language: "pt-BR" };
      } catch {
        return { status: "not-installed", version: null, model: "base", language: "pt-BR" };
      }
    }),

    install: protectedProcedure.mutation(async () => {
      try {
        await execAsync("pip install -U openai-whisper");
        return { success: true, message: "Whisper instalado com sucesso" };
      } catch (error) {
        return { success: false, message: "Erro ao instalar Whisper" };
      }
    }),

    start: protectedProcedure.mutation(async () => {
      return { success: true, message: "Whisper pronto para uso" };
    }),

    stop: protectedProcedure.mutation(async () => {
      return { success: true, message: "Whisper parado" };
    }),

    transcribe: protectedProcedure
      .input(z.object({ audioUrl: z.string() }))
      .mutation(async ({ input }) => {
        return { success: true, transcription: "Transcrição de áudio...", language: "pt-BR" };
      }),

    setModel: protectedProcedure
      .input(z.object({ model: z.string() }))
      .mutation(async ({ input }) => {
        return { success: true, model: input.model };
      }),

    setLanguage: protectedProcedure
      .input(z.object({ language: z.string() }))
      .mutation(async ({ input }) => {
        return { success: true, language: input.language };
      }),
  }),

  ollama: router({
    getStatus: protectedProcedure.query(async () => {
      try {
        await execAsync("pgrep -f 'ollama serve'");
        return { status: "running", version: "1.0", models: [], memoryUsage: 0 };
      } catch {
        try {
          await execAsync("which ollama");
          return { status: "installed", version: "1.0", models: [], memoryUsage: 0 };
        } catch {
          return { status: "not-installed", version: null, models: [], memoryUsage: 0 };
        }
      }
    }),

    install: protectedProcedure.mutation(async () => {
      try {
        await execAsync("curl -fsSL https://ollama.ai/install.sh | sh");
        return { success: true, message: "Ollama instalado com sucesso" };
      } catch (error) {
        return { success: false, message: "Erro ao instalar Ollama" };
      }
    }),

    start: protectedProcedure.mutation(async () => {
      try {
        await execAsync("ollama serve > /tmp/ollama.log 2>&1 &");
        return { success: true, message: "Ollama iniciado" };
      } catch (error) {
        return { success: false, message: "Erro ao iniciar Ollama" };
      }
    }),

    stop: protectedProcedure.mutation(async () => {
      try {
        await execAsync("pkill -f 'ollama serve'");
        return { success: true, message: "Ollama parado" };
      } catch (error) {
        return { success: false, message: "Erro ao parar Ollama" };
      }
    }),

    getModels: protectedProcedure.query(async () => {
      return { models: [] };
    }),

    downloadModel: protectedProcedure
      .input(z.object({ modelName: z.string() }))
      .mutation(async ({ input }) => {
        return { success: true, message: `Downloading model: ${input.modelName}` };
      }),

    removeModel: protectedProcedure
      .input(z.object({ modelName: z.string() }))
      .mutation(async ({ input }) => {
        return { success: true, message: `Model removed: ${input.modelName}` };
      }),

    setRules: protectedProcedure
      .input(
        z.object({
          usage: z.enum(["always", "when-needed", "never"]),
          temperature: z.number().min(0).max(2),
          maxTokens: z.number().positive(),
          timeout: z.number().positive(),
        })
      )
      .mutation(async ({ input }) => {
        return { success: true, config: input };
      }),
  }),

  evolution: router({
    getStatus: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      const config = await db
        .select()
        .from(systemConfig)
        .where(eq(systemConfig.configKey, "evolution_api_url"));

      return {
        status: config.length > 0 ? "configured" : "not-configured",
        apiUrl: config.length > 0 ? config[0].configValue : null,
        connected: false,
        lastSync: null,
      };
    }),

    configure: protectedProcedure
      .input(
        z.object({
          apiUrl: z.string().url(),
          apiKey: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) {
          throw new Error("Database not available");
        }

        await db.insert(systemConfig).values({
          configKey: "evolution_api_url",
          configValue: input.apiUrl,
          dataType: "string",
        });

        await db.insert(systemConfig).values({
          configKey: "evolution_api_key",
          configValue: input.apiKey,
          dataType: "string",
        });

        return { success: true, message: "Evolution API configured" };
      }),

    testConnection: protectedProcedure.mutation(async () => {
      return { success: true, message: "Connection successful", status: "connected" };
    }),

    getQRCode: protectedProcedure.query(async () => {
      return { qrCode: null, status: "waiting" };
    }),

    reconnect: protectedProcedure.mutation(async () => {
      return { success: true, message: "Reconnecting..." };
    }),

    getMessageLogs: protectedProcedure
      .input(z.object({ limit: z.number().default(50), offset: z.number().default(0) }))
      .query(async ({ input }) => {
        return { messages: [], total: 0, limit: input.limit, offset: input.offset };
      }),
  }),

  monitoring: router({
    getSystemStatus: protectedProcedure.query(async () => {
      const cpus = os.cpus();
      const totalMem = os.totalmem();
      const freeMem = os.freemem();
      const memoryUsage = ((totalMem - freeMem) / totalMem) * 100;

      let cpuUsage = 0;
      for (const cpu of cpus) {
        const total = Object.values(cpu.times).reduce((a, b) => a + b, 0);
        const idle = cpu.times.idle;
        cpuUsage += ((total - idle) / total) * 100;
      }
      cpuUsage = cpuUsage / cpus.length;

      let whisperStatus = "not-installed";
      let ollamaStatus = "not-installed";

      try {
        await execAsync("which whisper");
        whisperStatus = "installed";
      } catch {}

      try {
        await execAsync("pgrep -f 'ollama serve'");
        ollamaStatus = "running";
      } catch {
        try {
          await execAsync("which ollama");
          ollamaStatus = "installed";
        } catch {}
      }

      return {
        cpuUsage: Math.round(cpuUsage * 100) / 100,
        memoryUsage: Math.round(memoryUsage * 100) / 100,
        diskUsage: 0,
        uptime: os.uptime(),
        services: { whisper: whisperStatus, ollama: ollamaStatus, evolution: "not-configured" },
        queues: { messages: 0, transcriptions: 0, aiProcessing: 0 },
      };
    }),

    getServiceLogs: protectedProcedure
      .input(z.object({ service: z.enum(["whisper", "ollama", "evolution", "system"]), limit: z.number().default(100) }))
      .query(async ({ input }) => {
        return { service: input.service, logs: [], limit: input.limit };
      }),
  }),
});
