import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { transactions } from "../../drizzle/schema";
import { eq, and, gte, lte, like, or, desc, asc } from "drizzle-orm";

export const financialRouter = router({
  // Get all transactions for the current user with advanced filtering
  getTransactions: protectedProcedure
    .input(
      z.object({
        type: z.enum(["income", "expense"]).optional(),
        category: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        search: z.string().optional(),
        sortBy: z.enum(["date", "amount"]).default("date"),
        sortOrder: z.enum(["asc", "desc"]).default("desc"),
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      const conditions = [eq(transactions.userId, ctx.user.id)];

      if (input.type) {
        conditions.push(eq(transactions.type, input.type));
      }

      if (input.category) {
        conditions.push(eq(transactions.category, input.category));
      }

      if (input.startDate) {
        conditions.push(gte(transactions.createdAt, input.startDate));
      }

      if (input.endDate) {
        conditions.push(lte(transactions.createdAt, input.endDate));
      }

      if (input.search) {
        conditions.push(like(transactions.description, `%${input.search}%`));
      }

      let query: any = db.select().from(transactions).where(and(...conditions));

      // Apply sorting
      if (input.sortBy === "date") {
        query = query.orderBy(
          input.sortOrder === "desc"
            ? desc(transactions.createdAt)
            : asc(transactions.createdAt)
        );
      } else if (input.sortBy === "amount") {
        query = query.orderBy(
          input.sortOrder === "desc"
            ? desc(transactions.amount)
            : asc(transactions.amount)
        );
      }

      // Apply pagination
      const result = await query.limit(input.limit).offset(input.offset);

      // Get total count
      const countQuery = db.select().from(transactions).where(and(...conditions));
      const countResult = await countQuery;

      return {
        data: result,
        total: countResult.length,
        limit: input.limit,
        offset: input.offset,
      };
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

  // Get categories
  getCategories: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    const allTransactions = await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, ctx.user.id));

    const categories = Array.from(new Set(allTransactions.map((t) => t.category).filter(Boolean)));
    return categories;
  }),

  // Get summary (total income, expenses, balance) with optional filtering
  getSummary: protectedProcedure
    .input(
      z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        category: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      const conditions = [eq(transactions.userId, ctx.user.id)];

      if (input.startDate) {
        conditions.push(gte(transactions.createdAt, input.startDate));
      }

      if (input.endDate) {
        conditions.push(lte(transactions.createdAt, input.endDate));
      }

      if (input.category) {
        conditions.push(eq(transactions.category, input.category));
      }

      const allTransactions = await db
        .select()
        .from(transactions)
        .where(and(...conditions));

      const totalIncome = allTransactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + (typeof t.amount === 'number' ? t.amount : parseFloat(t.amount as string) || 0), 0);

      const totalExpense = allTransactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + (typeof t.amount === 'number' ? t.amount : parseFloat(t.amount as string) || 0), 0);

      // Group by category
      const byCategory: Record<string, { income: number; expense: number }> = {};
      allTransactions.forEach((t) => {
        const cat = t.category || "Uncategorized";
        if (!byCategory[cat]) {
          byCategory[cat] = { income: 0, expense: 0 };
        }
        const amount = typeof t.amount === 'number' ? t.amount : parseFloat(t.amount as string) || 0;
        if (t.type === "income") {
          byCategory[cat].income += amount;
        } else {
          byCategory[cat].expense += amount;
        }
      });

      return {
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
        transactionCount: allTransactions.length,
        byCategory,
      };
    }),

  // Export transactions to CSV
  exportTransactions: protectedProcedure
    .input(
      z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        category: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      const conditions = [eq(transactions.userId, ctx.user.id)];

      if (input.startDate) {
        conditions.push(gte(transactions.createdAt, input.startDate));
      }

      if (input.endDate) {
        conditions.push(lte(transactions.createdAt, input.endDate));
      }

      if (input.category) {
        conditions.push(eq(transactions.category, input.category));
      }

      const allTransactions = await db
        .select()
        .from(transactions)
        .where(and(...conditions))
        .orderBy(desc(transactions.createdAt));

      // Convert to CSV format
      const headers = ["Date", "Type", "Amount", "Category", "Description", "Source"];
      const rows = allTransactions.map((t) => {
        const amount = typeof t.amount === 'number' ? t.amount : parseFloat(t.amount as string) || 0;
        return [
          new Date(t.createdAt).toLocaleDateString("pt-BR"),
          t.type === "income" ? "Entrada" : "Saída",
          amount.toFixed(2),
          t.category || "-",
          t.description || "-",
          t.source || "-",
        ];
      });

      const csv = [
        headers.join(","),
        ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
      ].join("\n");

      return {
        success: true,
        csv,
        filename: `transactions_${new Date().toISOString().split("T")[0]}.csv`,
      };
    })
});
