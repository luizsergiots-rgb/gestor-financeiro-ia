import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Download, Filter, X, TrendingUp, TrendingDown } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function FinancialFilters() {
  const [filters, setFilters] = useState({
    type: undefined as "income" | "expense" | undefined,
    category: undefined as string | undefined,
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    search: "",
    sortBy: "date" as "date" | "amount",
    sortOrder: "desc" as "asc" | "desc",
  });

  const [page, setPage] = useState(0);
  const pageSize = 25;

  // Fetch transactions with filters
  const { data: transactionsData, isLoading } = trpc.financial.getTransactions.useQuery({
    type: filters.type,
    category: filters.category,
    startDate: filters.startDate,
    endDate: filters.endDate,
    search: filters.search,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
    limit: pageSize,
    offset: page * pageSize,
  });

  // Fetch categories for dropdown
  const { data: categories = [] } = trpc.financial.getCategories.useQuery();

  // Fetch summary with current filters
  const { data: summary } = trpc.financial.getSummary.useQuery({
    startDate: filters.startDate,
    endDate: filters.endDate,
    category: filters.category,
  });

  // Export handler
  const handleExportClick = async () => {
    try {
      const data = await (trpc.financial.exportTransactions as any).useMutation().mutateAsync({
        startDate: filters.startDate,
        endDate: filters.endDate,
        category: filters.category,
      });
      if (data.success && data.csv) {
        // Create download link
        const element = document.createElement("a");
        element.setAttribute("href", "data:text/csv;charset=utf-8," + encodeURIComponent(data.csv));
        element.setAttribute("download", data.filename);
        element.style.display = "none";
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        toast.success("Relatório exportado com sucesso!");
      }
    } catch (error: any) {
      toast.error(`Erro ao exportar: ${error.message}`);
    }
  };

  const transactions = transactionsData?.data || [];
  const total = transactionsData?.total || 0;
  const totalPages = Math.ceil(total / pageSize);

  const handleClearFilters = () => {
    setFilters({
      type: undefined,
      category: undefined,
      startDate: undefined,
      endDate: undefined,
      search: "",
      sortBy: "date",
      sortOrder: "desc",
    });
    setPage(0);
  };



  const hasActiveFilters =
    filters.type ||
    filters.category ||
    filters.startDate ||
    filters.endDate ||
    filters.search;

  return (
    <div className="space-y-6">
      {/* Filters Card */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-cyan-400" />
              <CardTitle>Filtros Avançados</CardTitle>
            </div>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4 mr-2" />
                Limpar Filtros
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Type Filter */}
            <div>
              <label className="text-sm font-medium text-slate-300 mb-2 block">Tipo</label>
              <select
                value={filters.type || ""}
                onChange={(e) => {
                  setFilters({
                    ...filters,
                    type: (e.target.value as "income" | "expense") || undefined,
                  });
                  setPage(0);
                }}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-400"
              >
                <option value="">Todos</option>
                <option value="income">Entrada</option>
                <option value="expense">Saída</option>
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="text-sm font-medium text-slate-300 mb-2 block">Categoria</label>
              <select
                value={filters.category || ""}
                onChange={(e) => {
                  setFilters({
                    ...filters,
                    category: e.target.value || undefined,
                  });
                  setPage(0);
                }}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-400"
              >
                <option value="">Todas</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat || ""}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label className="text-sm font-medium text-slate-300 mb-2 block">Data Inicial</label>
              <input
                type="date"
                value={(filters.startDate ? filters.startDate.toISOString().split("T")[0] : "") || ""}
                onChange={(e) => {
                  setFilters({
                    ...filters,
                    startDate: e.target.value ? new Date(e.target.value) : undefined,
                  });
                  setPage(0);
                }}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-400"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="text-sm font-medium text-slate-300 mb-2 block">Data Final</label>
              <input
                type="date"
                value={(filters.endDate ? filters.endDate.toISOString().split("T")[0] : "") || ""}
                onChange={(e) => {
                  setFilters({
                    ...filters,
                    endDate: e.target.value ? new Date(e.target.value) : undefined,
                  });
                  setPage(0);
                }}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-slate-300 mb-2 block">Buscar</label>
              <Input
                placeholder="Buscar por descrição..."
                value={filters.search || ""}
                onChange={(e) => {
                  setFilters({
                    ...filters,
                    search: e.target.value,
                  });
                  setPage(0);
                }}
                className="bg-slate-700 border-slate-600 text-slate-200 placeholder-slate-400"
              />
            </div>

            {/* Sort */}
            <div>
              <label className="text-sm font-medium text-slate-300 mb-2 block">Ordenar por</label>
              <select
                value={filters.sortBy}
                onChange={(e) => {
                  setFilters({
                    ...filters,
                    sortBy: e.target.value as "date" | "amount",
                  });
                }}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-400"
              >
                <option value="date">Data</option>
                <option value="amount">Valor</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() =>
                setFilters({
                  ...filters,
                  sortOrder: filters.sortOrder === "desc" ? "asc" : "desc",
                })
              }
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              {filters.sortOrder === "desc" ? "↓ Decrescente" : "↑ Crescente"}
            </Button>
            <Button
              onClick={handleExportClick}
              className="bg-cyan-600 hover:bg-cyan-700 text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Entradas</p>
                  <p className="text-2xl font-bold text-green-400">
                    R$ {summary.totalIncome?.toFixed(2) || "0.00"}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-400 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Saídas</p>
                  <p className="text-2xl font-bold text-red-400">
                    R$ {summary.totalExpense?.toFixed(2) || "0.00"}
                  </p>
                </div>
                <TrendingDown className="w-8 h-8 text-red-400 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Saldo</p>
                  <p
                    className={`text-2xl font-bold ${
                      (summary.balance || 0) >= 0 ? "text-cyan-400" : "text-red-400"
                    }`}
                  >
                    R$ {summary.balance?.toFixed(2) || "0.00"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Transactions List */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle>
            Transações{" "}
            <Badge variant="secondary" className="ml-2">
              {total}
            </Badge>
          </CardTitle>
          <CardDescription>
            Página {page + 1} de {totalPages || 1}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-slate-400">Carregando...</div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8 text-slate-400">Nenhuma transação encontrada</div>
          ) : (
            <div className="space-y-2">
              {transactions.map((transaction: any) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-slate-700/30 border border-slate-700 hover:border-slate-600 transition-all"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          transaction.type === "income"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {transaction.type === "income" ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-slate-200">{transaction.description}</p>
                        <p className="text-sm text-slate-400">
                          {transaction.category} •{" "}
                          {new Date(transaction.createdAt).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-lg font-bold ${
                        transaction.type === "income" ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {transaction.type === "income" ? "+" : "-"} R${
                        (typeof transaction.amount === "number"
                          ? transaction.amount
                          : parseFloat(String(transaction.amount) || "0")
                        ).toFixed(2)
                      }
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-700">
              <Button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                variant="outline"
                className="border-slate-600"
              >
                Anterior
              </Button>
              <span className="text-sm text-slate-400">
                Página {page + 1} de {totalPages}
              </span>
              <Button
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page === totalPages - 1}
                variant="outline"
                className="border-slate-600"
              >
                Próxima
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
