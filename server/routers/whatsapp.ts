import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { whatsappMessages, transactions } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

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
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      // Save message to database
      await db.insert(whatsappMessages).values({
        messageId: input.messageId,
        fromNumber: input.fromNumber,
        toNumber: input.toNumber,
        messageType: input.messageType,
        messageContent: input.messageContent,
      });

      // TODO: Process message with Whisper (if audio) and Ollama (for interpretation)
      // TODO: Extract financial data and create transaction if applicable
      // TODO: Generate AI response
      // TODO: Send response back via Evolution API

      return {
        success: true,
        messageId: input.messageId,
        status: "received",
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

      // TODO: Parse financial data from message using Ollama
      // Example patterns: "gasto 50 reais em comida", "recebi 1000 de freelance"
      // Extract: amount, type (income/expense), category, description

      return {
        success: true,
        extracted: {
          type: "expense",
          amount: 0,
          category: "",
          description: "",
        },
      };
    }),

  // Send message via Evolution API
  sendMessage: protectedProcedure
    .input(
      z.object({
        toNumber: z.string(),
        message: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      // TODO: Call Evolution API to send message
      return {
        success: true,
        message: "Message queued for sending",
      };
    }),

  // Get connection status
  getConnectionStatus: protectedProcedure.query(async () => {
    // TODO: Check Evolution API connection status
    return {
      connected: false,
      status: "disconnected",
      lastSync: null,
      qrCode: null,
    };
  }),

  // Reconnect WhatsApp
  reconnect: protectedProcedure.mutation(async () => {
    // TODO: Trigger reconnection via Evolution API
    return {
      success: true,
      message: "Reconnecting...",
    };
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

    return {
      totalMessages: allMessages.length,
      messagesProcessed,
      transactionsCreated: transactionsFromMessages,
      lastMessageTime: allMessages.length > 0 ? allMessages[allMessages.length - 1].createdAt : null,
    };
  }),
});
