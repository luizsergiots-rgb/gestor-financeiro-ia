import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { transactions } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

export const financialRouter = router({
  // Get all transactions for the current user
  getTransactions: protectedProcedure
    .input(
      z.object({
        type: z.enum(["income", "expense"]).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      const result = await db
        .select()
        .from(transactions)
        .where(eq(transactions.userId, ctx.user.id));

      if (input.type) {
        return result.filter((t) => t.type === input.type);
      }

      return result;
    }),

  // Get transaction by ID
  getTransaction: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      const result = await db
        .select()
        .from(transactions)
        .where(and(eq(transactions.id, input.id), eq(transactions.userId, ctx.user.id)));

      return result.length > 0 ? result[0] : null;
    }),

  // Create a new transaction
  createTransaction: protectedProcedure
    .input(
      z.object({
        type: z.enum(["income", "expense"]),
        amount: z.number().positive(),
        description: z.string().min(1),
        category: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      await db.insert(transactions).values({
        userId: ctx.user.id,
        type: input.type,
        amount: input.amount.toString(),
        description: input.description,
        category: input.category,
      });

      return { success: true };
    }),

  // Update a transaction
  updateTransaction: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        type: z.enum(["income", "expense"]).optional(),
        amount: z.number().positive().optional(),
        description: z.string().min(1).optional(),
        category: z.string().min(1).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      // Verify ownership
      const existing = await db
        .select()
        .from(transactions)
        .where(and(eq(transactions.id, input.id), eq(transactions.userId, ctx.user.id)));

      if (existing.length === 0) {
        throw new Error("Transaction not found");
      }

      const updateData: Record<string, unknown> = {};
      if (input.type) updateData.type = input.type;
      if (input.amount) updateData.amount = input.amount.toString();
      if (input.description) updateData.description = input.description;
      if (input.category) updateData.category = input.category;

      await db.update(transactions).set(updateData).where(eq(transactions.id, input.id));

      return { success: true };
    }),

  // Delete a transaction
  deleteTransaction: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      // Verify ownership
      const existing = await db
        .select()
        .from(transactions)
        .where(and(eq(transactions.id, input.id), eq(transactions.userId, ctx.user.id)));

      if (existing.length === 0) {
        throw new Error("Transaction not found");
      }

      await db.delete(transactions).where(eq(transactions.id, input.id));

      return { success: true };
    }),

  // Get summary (total income, expenses, balance)
  getSummary: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    const allTransactions = await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, ctx.user.id));

    const totalIncome = allTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + (typeof t.amount === 'number' ? t.amount : parseFloat(t.amount as string) || 0), 0);

    const totalExpense = allTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + (typeof t.amount === 'number' ? t.amount : parseFloat(t.amount as string) || 0), 0);

    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      transactionCount: allTransactions.length,
    };
  }),
});
