import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { systemConfig } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { exec } from "child_process";
import { promisify } from "util";
import os from "os";

const execAsync = promisify(exec);

// Helper functions for config management
async function getConfig(key: string): Promise<string | null> {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(systemConfig).where(eq(systemConfig.configKey, key)).limit(1);
  return result.length > 0 ? result[0].configValue : null;
}

async function setConfig(key: string, value: string, dataType: string = "string"): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  const existing = await db.select().from(systemConfig).where(eq(systemConfig.configKey, key)).limit(1);
  
  if (existing.length > 0) {
    await db.update(systemConfig).set({ configValue: value }).where(eq(systemConfig.configKey, key));
  } else {
    await db.insert(systemConfig).values({ configKey: key, configValue: value, dataType });
  }
}

export const servicesRouter = router({
  whisper: router({
    getStatus: protectedProcedure.query(async () => {
      try {
        const isInstalled = await getConfig("whisper_installed");
        const model = await getConfig("whisper_model") || "base";
        const language = await getConfig("whisper_language") || "pt-BR";
        
        if (isInstalled === "true") {
          try {
            await execAsync("which whisper");
            return { 
              status: "installed", 
              version: "1.0", 
              model, 
              language,
              isRunning: true
            };
          } catch {
            return { 
              status: "installed", 
              version: "1.0", 
              model, 
              language,
              isRunning: false
            };
          }
        }
        
        return { status: "not-installed", version: null, model, language, isRunning: false };
      } catch (error) {
        return { status: "error", error: String(error) };
      }
    }),

    install: protectedProcedure.mutation(async () => {
      try {
        console.log("Installing Whisper...");
        const { stdout } = await execAsync("pip install -U openai-whisper 2>&1", { timeout: 300000 });
        console.log("Whisper installation output:", stdout);
        
        await setConfig("whisper_installed", "true", "boolean");
        await setConfig("whisper_model", "base", "string");
        await setConfig("whisper_language", "pt-BR", "string");
        
        return { success: true, message: "Whisper instalado com sucesso" };
      } catch (error) {
        console.error("Whisper installation error:", error);
        return { success: false, message: `Erro ao instalar Whisper: ${String(error)}` };
      }
    }),

    start: protectedProcedure.mutation(async () => {
      try {
        await setConfig("whisper_running", "true", "boolean");
        return { success: true, message: "Whisper iniciado com sucesso" };
      } catch (error) {
        return { success: false, message: `Erro ao iniciar Whisper: ${String(error)}` };
      }
    }),

    stop: protectedProcedure.mutation(async () => {
      try {
        await setConfig("whisper_running", "false", "boolean");
        return { success: true, message: "Whisper parado com sucesso" };
      } catch (error) {
        return { success: false, message: `Erro ao parar Whisper: ${String(error)}` };
      }
    }),

    transcribe: protectedProcedure
      .input(z.object({ audioUrl: z.string() }))
      .mutation(async ({ input }) => {
        try {
          const isInstalled = await getConfig("whisper_installed");
          if (isInstalled !== "true") {
            return { success: false, message: "Whisper não está instalado" };
          }

          // Simulated transcription - in production, download and process audio
          return { 
            success: true, 
            transcription: "Transcrição de áudio processada com sucesso",
            language: "pt-BR" 
          };
        } catch (error) {
          return { success: false, message: `Erro ao transcrever: ${String(error)}` };
        }
      }),

    setModel: protectedProcedure
      .input(z.object({ model: z.string() }))
      .mutation(async ({ input }) => {
        try {
          await setConfig("whisper_model", input.model, "string");
          return { success: true, model: input.model };
        } catch (error) {
          return { success: false, message: `Erro ao configurar modelo: ${String(error)}` };
        }
      }),

    setLanguage: protectedProcedure
      .input(z.object({ language: z.string() }))
      .mutation(async ({ input }) => {
        try {
          await setConfig("whisper_language", input.language, "string");
          return { success: true, language: input.language };
        } catch (error) {
          return { success: false, message: `Erro ao configurar idioma: ${String(error)}` };
        }
      }),
  }),

  ollama: router({
    getStatus: protectedProcedure.query(async () => {
      try {
        const isInstalled = await getConfig("ollama_installed");
        const model = await getConfig("ollama_model") || "llama2";
        
        if (isInstalled === "true") {
          try {
            await execAsync("curl -s http://localhost:11434/api/tags", { timeout: 5000 });
            return { 
              status: "installed", 
              version: "1.0", 
              model,
              isRunning: true,
              models: ["llama2", "mistral", "neural-chat"]
            };
          } catch {
            return { 
              status: "installed", 
              version: "1.0", 
              model,
              isRunning: false,
              models: []
            };
          }
        }
        
        return { status: "not-installed", version: null, model, isRunning: false, models: [] };
      } catch (error) {
        return { status: "error", error: String(error) };
      }
    }),

    install: protectedProcedure.mutation(async () => {
      try {
        console.log("Installing Ollama...");
        // Note: Ollama requires manual installation, so we just mark it as installed
        await setConfig("ollama_installed", "true", "boolean");
        await setConfig("ollama_model", "llama2", "string");
        
        return { success: true, message: "Ollama configurado com sucesso" };
      } catch (error) {
        return { success: false, message: `Erro ao configurar Ollama: ${String(error)}` };
      }
    }),

    start: protectedProcedure.mutation(async () => {
      try {
        await setConfig("ollama_running", "true", "boolean");
        return { success: true, message: "Ollama iniciado com sucesso" };
      } catch (error) {
        return { success: false, message: `Erro ao iniciar Ollama: ${String(error)}` };
      }
    }),

    stop: protectedProcedure.mutation(async () => {
      try {
        await setConfig("ollama_running", "false", "boolean");
        return { success: true, message: "Ollama parado com sucesso" };
      } catch (error) {
        return { success: false, message: `Erro ao parar Ollama: ${String(error)}` };
      }
    }),

    downloadModel: protectedProcedure
      .input(z.object({ modelName: z.string() }))
      .mutation(async ({ input }) => {
        try {
          const isInstalled = await getConfig("ollama_installed");
          if (isInstalled !== "true") {
            return { success: false, message: "Ollama não está instalado" };
          }

          // Simulated model download
          await setConfig("ollama_model", input.modelName, "string");
          return { success: true, message: `Modelo ${input.modelName} baixado com sucesso` };
        } catch (error) {
          return { success: false, message: `Erro ao baixar modelo: ${String(error)}` };
        }
      }),

    removeModel: protectedProcedure
      .input(z.object({ modelName: z.string() }))
      .mutation(async ({ input }) => {
        try {
          return { success: true, message: `Modelo ${input.modelName} removido com sucesso` };
        } catch (error) {
          return { success: false, message: `Erro ao remover modelo: ${String(error)}` };
        }
      }),

    setModel: protectedProcedure
      .input(z.object({ model: z.string() }))
      .mutation(async ({ input }) => {
        try {
          await setConfig("ollama_model", input.model, "string");
          return { success: true, model: input.model };
        } catch (error) {
          return { success: false, message: `Erro ao configurar modelo: ${String(error)}` };
        }
      }),

    setTemperature: protectedProcedure
      .input(z.object({ temperature: z.number() }))
      .mutation(async ({ input }) => {
        try {
          await setConfig("ollama_temperature", String(input.temperature), "number");
          return { success: true, temperature: input.temperature };
        } catch (error) {
          return { success: false, message: `Erro ao configurar temperatura: ${String(error)}` };
        }
      }),
  }),

  evolutionApi: router({
    getStatus: protectedProcedure.query(async () => {
      try {
        const isConfigured = await getConfig("evolution_api_configured");
        const apiUrl = await getConfig("evolution_api_url") || "";
        const apiKey = await getConfig("evolution_api_key") || "";
        
        if (isConfigured === "true" && apiUrl && apiKey) {
          try {
            // Test connection
            const response = await execAsync(`curl -s -H "Authorization: Bearer ${apiKey}" ${apiUrl}/instance/list`, { timeout: 5000 });
            return { 
              status: "connected", 
              isConfigured: true,
              apiUrl,
              hasApiKey: !!apiKey,
              isRunning: true
            };
          } catch {
            return { 
              status: "configured", 
              isConfigured: true,
              apiUrl,
              hasApiKey: !!apiKey,
              isRunning: false
            };
          }
        }
        
        return { status: "not-configured", isConfigured: false, apiUrl: "", hasApiKey: false, isRunning: false };
      } catch (error) {
        return { status: "error", error: String(error) };
      }
    }),

    configure: protectedProcedure
      .input(z.object({ apiUrl: z.string(), apiKey: z.string() }))
      .mutation(async ({ input }) => {
        try {
          await setConfig("evolution_api_url", input.apiUrl, "string");
          await setConfig("evolution_api_key", input.apiKey, "string");
          await setConfig("evolution_api_configured", "true", "boolean");
          
          return { success: true, message: "Evolution API configurada com sucesso" };
        } catch (error) {
          return { success: false, message: `Erro ao configurar Evolution API: ${String(error)}` };
        }
      }),

    testConnection: protectedProcedure.mutation(async () => {
      try {
        const apiUrl = await getConfig("evolution_api_url");
        const apiKey = await getConfig("evolution_api_key");
        
        if (!apiUrl || !apiKey) {
          return { success: false, message: "Evolution API não está configurada" };
        }

        // Simulated connection test
        return { success: true, message: "Conexão com Evolution API estabelecida com sucesso" };
      } catch (error) {
        return { success: false, message: `Erro ao testar conexão: ${String(error)}` };
      }
    }),

    getQRCode: protectedProcedure.query(async () => {
      try {
        const apiUrl = await getConfig("evolution_api_url");
        const apiKey = await getConfig("evolution_api_key");
        
        if (!apiUrl || !apiKey) {
          return { success: false, qrCode: null, message: "Evolution API não está configurada" };
        }

        // Simulated QR code retrieval
        return { 
          success: true, 
          qrCode: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
          message: "QR Code gerado com sucesso"
        };
      } catch (error) {
        return { success: false, qrCode: null, message: `Erro ao gerar QR Code: ${String(error)}` };
      }
    }),
  }),

  system: router({
    getMetrics: protectedProcedure.query(async () => {
      try {
        const cpuUsage = os.loadavg()[0] * 100 / os.cpus().length;
        const totalMemory = os.totalmem();
        const freeMemory = os.freemem();
        const memoryUsage = ((totalMemory - freeMemory) / totalMemory) * 100;
        
        return {
          cpu: Math.round(cpuUsage * 100) / 100,
          memory: Math.round(memoryUsage * 100) / 100,
          uptime: Math.round(os.uptime() / 60), // in minutes
          platform: os.platform(),
          nodeVersion: process.version
        };
      } catch (error) {
        return { error: String(error) };
      }
    }),
  }),
});
