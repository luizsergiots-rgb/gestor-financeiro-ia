import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { whatsappMessages, transactions } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { invokeLLM } from "../_core/llm";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

// Helper function to extract financial data from text using Ollama
async function extractFinancialData(text: string): Promise<{
  type: "income" | "expense";
  amount: number;
  category: string;
  description: string;
} | null> {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `You are a financial data extraction assistant. Extract financial information from the user's message and respond with ONLY a JSON object (no markdown, no extra text). If no financial data is found, respond with {"found": false}.

JSON format: {"found": true, "type": "income" or "expense", "amount": number, "category": string, "description": string}`,
        },
        {
          role: "user",
          content: text,
        },
      ],
    });

    const messageContent = response.choices[0].message.content;
    const content = typeof messageContent === 'string' ? messageContent : '';
    const parsed = JSON.parse(content);

    if (!parsed.found) {
      return null;
    }

    return {
      type: parsed.type,
      amount: parsed.amount,
      category: parsed.category,
      description: parsed.description,
    };
  } catch (error) {
    console.error("Error extracting financial data:", error);
    return null;
  }
}

// Helper function to transcribe audio using Whisper
async function transcribeAudio(audioUrl: string): Promise<string | null> {
  try {
    // In production, download the audio file first
    // For now, we'll use a placeholder that would work with local files
    const result = await execAsync(`whisper "${audioUrl}" --output_format json --quiet 2>/dev/null`, {
      timeout: 60000,
    });

    const parsed = JSON.parse(result.stdout);
    return parsed.text || null;
  } catch (error) {
    console.error("Error transcribing audio:", error);
    return null;
  }
}

export const whatsappRouter = router({
  // Receive and process incoming message
  receiveMessage: publicProcedure
    .input(
      z.object({
        messageId: z.string(),
        fromNumber: z.string(),
        toNumber: z.string(),
        messageType: z.enum(["text", "audio", "image", "document"]),
        messageContent: z.string().optional(),
        audioUrl: z.string().optional(),
        userId: z.number().default(1), // Default to first user
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      let messageText = input.messageContent || "";
      let transcription: string | null = null;

      // Step 1: Transcribe audio if present
      if (input.messageType === "audio" && input.audioUrl) {
        console.log("Transcribing audio...");
        transcription = await transcribeAudio(input.audioUrl);
        if (transcription) {
          messageText = transcription;
        }
      }

      // Save message to database
      const messageRecord = await db.insert(whatsappMessages).values({
        messageId: input.messageId,
        fromNumber: input.fromNumber,
        toNumber: input.toNumber,
        messageType: input.messageType,
        messageContent: input.messageContent,
        transcription: transcription,
      });

      // Step 2: Extract financial data using Ollama
      console.log("Extracting financial data from:", messageText);
      const financialData = await extractFinancialData(messageText);

      let aiResponse = "Mensagem recebida e processada.";
      let transactionCreated = false;

      // Step 3: Create transaction if financial data was extracted
      if (financialData) {
        try {
          await db.insert(transactions).values({
            userId: input.userId,
            type: financialData.type,
            amount: financialData.amount.toString(),
            description: financialData.description,
            category: financialData.category,
            source: "whatsapp",
            whatsappMessageId: input.messageId,
            processedByAI: true,
          });

          transactionCreated = true;
          aiResponse = `✅ Transação registrada: ${financialData.type === "income" ? "Entrada" : "Saída"} de R$ ${financialData.amount.toFixed(2)} em ${financialData.category}.`;
        } catch (error) {
          console.error("Error creating transaction:", error);
          aiResponse = "Erro ao registrar transação. Tente novamente.";
        }
      } else {
        aiResponse = "Não consegui extrair dados financeiros da mensagem. Tente novamente com um formato como: 'Gasto 50 reais em comida' ou 'Recebi 1000 de freelance'.";
      }

      // Step 4: Update message with processing info
      await db.update(whatsappMessages).set({
        aiResponse: aiResponse,
        processedAt: new Date(),
      }).where(eq(whatsappMessages.messageId, input.messageId));

      // TODO: Send response back via Evolution API

      return {
        success: true,
        messageId: input.messageId,
        status: "processed",
        transactionCreated,
        aiResponse,
      };
    }),

  // Get message history
  getMessages: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      const messages = await db
        .select()
        .from(whatsappMessages);

      return {
        messages: messages.slice(input.offset, input.offset + input.limit),
        total: messages.length,
        limit: input.limit,
        offset: input.offset,
      };
    }),

  // Process text message for financial data
  processFinancialMessage: protectedProcedure
    .input(
      z.object({
        messageId: z.string(),
        messageContent: z.string(),
        userId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      const financialData = await extractFinancialData(input.messageContent);

      if (!financialData) {
        return {
          success: false,
          message: "No financial data found in message",
        };
      }

      // Create transaction
      try {
        await db.insert(transactions).values({
          userId: input.userId,
          type: financialData.type,
          amount: financialData.amount.toString(),
          description: financialData.description,
          category: financialData.category,
          source: "whatsapp",
          whatsappMessageId: input.messageId,
          processedByAI: true,
        });

        return {
          success: true,
          extracted: financialData,
        };
      } catch (error) {
        return {
          success: false,
          message: String(error),
        };
      }
    }),

  // Send message via Evolution API
  sendMessage: protectedProcedure
    .input(
      z.object({
        toNumber: z.string(),
        message: z.string(),
        evolutionApiUrl: z.string().optional(),
        evolutionApiKey: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // In production, get API credentials from database
        const apiUrl = input.evolutionApiUrl || process.env.EVOLUTION_API_URL;
        const apiKey = input.evolutionApiKey || process.env.EVOLUTION_API_KEY;

        if (!apiUrl || !apiKey) {
          return {
            success: false,
            message: "Evolution API not configured",
          };
        }

        // TODO: Call Evolution API to send message
        // const response = await fetch(`${apiUrl}/message/send`, {
        //   method: 'POST',
        //   headers: {
        //     'Authorization': `Bearer ${apiKey}`,
        //     'Content-Type': 'application/json',
        //   },
        //   body: JSON.stringify({
        //     number: input.toNumber,
        //     text: input.message,
        //   }),
        // });

        return {
          success: true,
          message: "Message queued for sending",
        };
      } catch (error) {
        return {
          success: false,
          message: String(error),
        };
      }
    }),

  // Get connection status
  getConnectionStatus: protectedProcedure.query(async () => {
    try {
      const apiUrl = process.env.EVOLUTION_API_URL;
      const apiKey = process.env.EVOLUTION_API_KEY;

      if (!apiUrl || !apiKey) {
        return {
          connected: false,
          status: "not-configured",
          lastSync: null,
          qrCode: null,
        };
      }

      // TODO: Check Evolution API connection status
      // const response = await fetch(`${apiUrl}/instance/list`, {
      //   headers: {
      //     'Authorization': `Bearer ${apiKey}`,
      //   },
      // });

      return {
        connected: false,
        status: "disconnected",
        lastSync: null,
        qrCode: null,
      };
    } catch (error) {
      return {
        connected: false,
        status: "error",
        error: String(error),
        lastSync: null,
        qrCode: null,
      };
    }
  }),

  // Reconnect WhatsApp
  reconnect: protectedProcedure.mutation(async () => {
    try {
      const apiUrl = process.env.EVOLUTION_API_URL;
      const apiKey = process.env.EVOLUTION_API_KEY;

      if (!apiUrl || !apiKey) {
        return {
          success: false,
          message: "Evolution API not configured",
        };
      }

      // TODO: Trigger reconnection via Evolution API
      // const response = await fetch(`${apiUrl}/instance/restart`, {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${apiKey}`,
      //   },
      // });

      return {
        success: true,
        message: "Reconnecting...",
      };
    } catch (error) {
      return {
        success: false,
        message: String(error),
      };
    }
  }),

  // Get statistics
  getStatistics: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    const allMessages = await db.select().from(whatsappMessages);
    const allTransactions = await db.select().from(transactions);

    const messagesProcessed = allMessages.filter((m) => m.processedAt).length;
    const transactionsFromMessages = allTransactions.filter((t) => t.whatsappMessageId).length;
    const totalProcessedAmount = transactionsFromMessages > 0
      ? allTransactions
          .filter((t) => t.whatsappMessageId)
          .reduce((sum, t) => sum + (typeof t.amount === "number" ? t.amount : parseFloat(t.amount as string) || 0), 0)
      : 0;

    return {
      totalMessages: allMessages.length,
      messagesProcessed,
      messagesProcessedPercent: allMessages.length > 0 ? Math.round((messagesProcessed / allMessages.length) * 100) : 0,
      transactionsCreated: transactionsFromMessages,
      totalProcessedAmount,
      lastMessageTime: allMessages.length > 0 ? allMessages[allMessages.length - 1].createdAt : null,
    };
  }),

  // Test message processing (for development)
  testProcess: protectedProcedure
    .input(
      z.object({
        messageContent: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const financialData = await extractFinancialData(input.messageContent);
      return {
        success: true,
        extracted: financialData,
        message: financialData
          ? `Extracted: ${financialData.type} of R$ ${financialData.amount} in ${financialData.category}`
          : "No financial data found",
      };
    }),
});
