import { describe, it, expect } from "vitest";

describe("Financial Router - Unit Tests", () => {
  // Test transaction calculation logic
  it("should calculate total income correctly", () => {
    const transactions = [
      { type: "income", amount: "1000.00" },
      { type: "income", amount: "500.00" },
      { type: "expense", amount: "200.00" },
    ];

    const totalIncome = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    expect(totalIncome).toBe(1500);
  });

  it("should calculate total expenses correctly", () => {
    const transactions = [
      { type: "income", amount: "1000.00" },
      { type: "expense", amount: "200.00" },
      { type: "expense", amount: "150.00" },
    ];

    const totalExpense = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    expect(totalExpense).toBe(350);
  });

  it("should calculate balance correctly", () => {
    const transactions = [
      { type: "income", amount: "1000.00" },
      { type: "expense", amount: "200.00" },
      { type: "expense", amount: "150.00" },
    ];

    const totalIncome = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const totalExpense = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const balance = totalIncome - totalExpense;

    expect(balance).toBe(650);
  });

  it("should group transactions by category", () => {
    const transactions = [
      { category: "Alimentação", amount: "100.00" },
      { category: "Transporte", amount: "50.00" },
      { category: "Alimentação", amount: "75.00" },
    ];

    const byCategory: Record<string, number> = {};
    transactions.forEach((t) => {
      const cat = t.category || "Uncategorized";
      if (!byCategory[cat]) byCategory[cat] = 0;
      byCategory[cat] += parseFloat(t.amount);
    });

    expect(byCategory["Alimentação"]).toBe(175);
    expect(byCategory["Transporte"]).toBe(50);
  });

  it("should filter transactions by date range", () => {
    const transactions = [
      { date: new Date("2026-04-10"), amount: "100.00" },
      { date: new Date("2026-04-15"), amount: "200.00" },
      { date: new Date("2026-04-20"), amount: "150.00" },
    ];

    const startDate = new Date("2026-04-12");
    const endDate = new Date("2026-04-18");

    const filtered = transactions.filter((t) => t.date >= startDate && t.date <= endDate);

    expect(filtered.length).toBe(1);
    expect(filtered[0].amount).toBe("200.00");
  });

  it("should validate transaction amount", () => {
    const validAmounts = ["100.00", "0.01", "999999.99"];
    const invalidAmounts = ["-100", "abc", "", "100"];

    validAmounts.forEach((amount) => {
      const isValid = /^\d+\.\d{2}$/.test(amount);
      expect(isValid).toBe(true);
    });

    invalidAmounts.forEach((amount) => {
      const isValid = /^\d+\.\d{2}$/.test(amount);
      expect(isValid).toBe(false);
    });
  });

  it("should validate transaction type", () => {
    const validTypes = ["income", "expense"];
    const invalidTypes = ["transfer", "INCOME", "expense ", ""];

    validTypes.forEach((type) => {
      const isValid = ["income", "expense"].includes(type);
      expect(isValid).toBe(true);
    });

    invalidTypes.forEach((type) => {
      const isValid = ["income", "expense"].includes(type);
      expect(isValid).toBe(false);
    });
  });

  it("should format currency correctly", () => {
    const amounts = [100, 1000.5, 0.01, 999999.99];

    amounts.forEach((amount) => {
      const formatted = amount.toFixed(2);
      expect(formatted).toMatch(/^\d+\.\d{2}$/);
    });
  });

  it("should handle CSV export format", () => {
    const transactions = [
      { date: "2026-04-17", type: "income", category: "Salário", amount: "5000.00", description: "Salário" },
      { date: "2026-04-16", type: "expense", category: "Alimentação", amount: "100.00", description: "Supermercado" },
    ];

    const csv = [
      "Data,Tipo,Categoria,Valor,Descrição",
      ...transactions.map(
        (t) => `${t.date},${t.type},${t.category},${t.amount},"${t.description}"`
      ),
    ].join("\n");

    expect(csv).toContain("Data,Tipo,Categoria,Valor,Descrição");
    expect(csv).toContain("2026-04-17,income,Salário,5000.00");
    expect(csv).toContain("2026-04-16,expense,Alimentação,100.00");
  });

  it("should calculate pagination correctly", () => {
    const totalItems = 250;
    const pageSize = 10;
    const currentPage = 2;

    const totalPages = Math.ceil(totalItems / pageSize);
    const skip = (currentPage - 1) * pageSize;

    expect(totalPages).toBe(25);
    expect(skip).toBe(10);
  });
});
