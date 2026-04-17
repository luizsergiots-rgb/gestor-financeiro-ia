import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Edit2, TrendingUp, TrendingDown, DollarSign } from "lucide-react";

interface Transaction {
  id: number;
  type: "income" | "expense";
  amount: number;
  description: string;
  category: string;
  date: string;
}

export default function Financial() {
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: 1,
      type: "income",
      amount: 5000,
      description: "Salário",
      category: "Renda",
      date: "2026-04-17",
    },
    {
      id: 2,
      type: "expense",
      amount: 1200,
      description: "Aluguel",
      category: "Moradia",
      date: "2026-04-15",
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: "expense" as "income" | "expense",
    amount: "",
    description: "",
    category: "",
  });

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  const handleAddTransaction = () => {
    if (formData.amount && formData.description) {
      const newTransaction: Transaction = {
        id: Math.max(...transactions.map((t) => t.id), 0) + 1,
        type: formData.type,
        amount: parseFloat(formData.amount),
        description: formData.description,
        category: formData.category || "Geral",
        date: new Date().toISOString().split("T")[0],
      };
      setTransactions([newTransaction, ...transactions]);
      setFormData({ type: "expense", amount: "", description: "", category: "" });
      setShowForm(false);
    }
  };

  const handleDeleteTransaction = (id: number) => {
    setTransactions(transactions.filter((t) => t.id !== id));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Painel Financeiro</h1>
        <p className="text-slate-400">Gerencie suas transações e visualize seu saldo</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Saldo Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-3xl font-bold ${balance >= 0 ? "text-green-400" : "text-red-400"}`}>
              R$ {balance.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Receitas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-400">R$ {totalIncome.toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
              <TrendingDown className="h-4 w-4" />
              Despesas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-400">R$ {totalExpense.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Add Transaction Form */}
      {showForm && (
        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
          <CardHeader>
            <CardTitle>Adicionar Transação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-slate-400 mb-2 block">Tipo</label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value as "income" | "expense" })
                  }
                  className="w-full px-3 py-2 rounded bg-slate-700/50 border border-slate-600 text-white"
                >
                  <option value="income">Receita</option>
                  <option value="expense">Despesa</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-2 block">Valor</label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
              </div>
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-2 block">Descrição</label>
              <Input
                type="text"
                placeholder="Descrição da transação"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-slate-700/50 border-slate-600 text-white"
              />
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-2 block">Categoria</label>
              <Input
                type="text"
                placeholder="Ex: Alimentação, Transporte"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="bg-slate-700/50 border-slate-600 text-white"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleAddTransaction}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
              >
                Adicionar
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowForm(false)}
                className="border-slate-600"
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transactions List */}
      <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
        <CardHeader className="flex items-center justify-between">
          <div>
            <CardTitle>Transações</CardTitle>
            <CardDescription>Histórico de todas as transações</CardDescription>
          </div>
          {!showForm && (
            <Button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nova Transação
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-slate-400 text-center py-8">Nenhuma transação registrada</p>
          ) : (
            <div className="space-y-2">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-slate-700/30 border border-slate-700 hover:border-slate-600 transition-all"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          transaction.type === "income"
                            ? "bg-green-500/20"
                            : "bg-red-500/20"
                        }`}
                      >
                        {transaction.type === "income" ? (
                          <TrendingUp
                            className={`h-4 w-4 ${
                              transaction.type === "income"
                                ? "text-green-400"
                                : "text-red-400"
                            }`}
                          />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-white font-medium">{transaction.description}</p>
                        <p className="text-xs text-slate-400">{transaction.date}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className="border-slate-600">
                      {transaction.category}
                    </Badge>
                    <p
                      className={`font-semibold text-lg ${
                        transaction.type === "income"
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {transaction.type === "income" ? "+" : "-"} R${" "}
                      {transaction.amount.toFixed(2)}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-slate-400 hover:text-white"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-300"
                        onClick={() => handleDeleteTransaction(transaction.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
