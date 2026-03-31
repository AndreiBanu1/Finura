"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, TrendingUp, TrendingDown, DollarSign, Edit } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AddInvestmentForm, InvestmentFormValues } from "@/components/forms/add-investment-form";
import { createInvestment, getInvestments } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Investment {
  id: string;
  ticker: string;
  type: "stock" | "etf" | "crypto";
  action: "buy" | "sell";
  units: number;
  price_per_unit: number;
  date: string;
}

export default function InvestmentsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchInvestments = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await getInvestments();
      if (response.success && Array.isArray(response.data)) {
        setInvestments(response.data);
      }
    } catch (error) {
      console.error("Error fetching investments:", error);
      toast({
        title: "Error",
        description: "Failed to load investments",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchInvestments();
  }, [fetchInvestments]);

  const handleSubmitInvestment = async (data: InvestmentFormValues) => {
    try {
      // Close modal immediately for optimistic UI
      setIsDialogOpen(false);
      
      await createInvestment(data);
      
      toast({
        title: "Success!",
        description: "Investment added successfully!",
      });
      
      // Refresh data after successful submission
      await fetchInvestments();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add investment",
        variant: "destructive",
      });
      // Re-open modal on error so user can retry
      setIsDialogOpen(true);
      throw error;
    }
  };
  // Calculate portfolio data from investments
  const buyTransactions = investments.filter((inv) => inv.action === "buy");
  const sellTransactions = investments.filter((inv) => inv.action === "sell");

  // Calculate holdings by ticker
  const holdingsMap = new Map<
    string,
    {
      ticker: string;
      units: number;
      totalInvested: number;
      type: string;
      avgPrice: number;
    }
  >();

  buyTransactions.forEach((inv) => {
    const existing = holdingsMap.get(inv.ticker) || {
      ticker: inv.ticker,
      units: 0,
      totalInvested: 0,
      type: inv.type,
      avgPrice: 0,
    };
    existing.units += inv.units;
    existing.totalInvested += inv.units * inv.price_per_unit;
    existing.avgPrice = existing.totalInvested / existing.units;
    holdingsMap.set(inv.ticker, existing);
  });

  sellTransactions.forEach((inv) => {
    const existing = holdingsMap.get(inv.ticker);
    if (existing) {
      existing.units -= inv.units;
      if (existing.units <= 0) {
        holdingsMap.delete(inv.ticker);
      }
    }
  });

  const holdings = Array.from(holdingsMap.values()).map((holding) => {
    // For now, use avgPrice as currentPrice (will be updated when price update feature is implemented)
    const currentPrice = holding.avgPrice;
    const totalValue = holding.units * currentPrice;
    const pnl = totalValue - holding.totalInvested;
    const pnlPercentage = (pnl / holding.totalInvested) * 100;

    return {
      id: holding.ticker,
      ticker: holding.ticker,
      units: holding.units,
      avgPrice: holding.avgPrice,
      currentPrice: currentPrice,
      totalValue: totalValue,
      pnl: pnl,
      pnlPercentage: pnlPercentage,
      type: holding.type.charAt(0).toUpperCase() + holding.type.slice(1),
    };
  });

  // Calculate portfolio overview
  const totalInvested = buyTransactions.reduce(
    (sum, inv) => sum + inv.units * inv.price_per_unit,
    0
  );
  const totalSold = sellTransactions.reduce(
    (sum, inv) => sum + inv.units * inv.price_per_unit,
    0
  );
  const currentValue = holdings.reduce((sum, h) => sum + h.totalValue, 0);
  const totalPnL = currentValue - (totalInvested - totalSold);
  const totalPnLPercentage = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;

  // Calculate asset allocation
  const allocationMap = new Map<string, number>();
  holdings.forEach((holding) => {
    const type = holding.type;
    const current = allocationMap.get(type) || 0;
    allocationMap.set(type, current + holding.totalValue);
  });

  const totalAllocation = Array.from(allocationMap.values()).reduce(
    (sum, val) => sum + val,
    0
  );

  const assetAllocation = Array.from(allocationMap.entries()).map(([type, amount]) => ({
    type,
    amount: Math.round(amount * 100) / 100,
    percentage: totalAllocation > 0 ? Math.round((amount / totalAllocation) * 100) : 0,
    color: getAssetTypeColor(type),
  }));

  function getAssetTypeColor(type: string): string {
    const colors: Record<string, string> = {
      Stock: "#3b82f6",
      Stocks: "#3b82f6",
      ETF: "#10b981",
      Crypto: "#f59e0b",
    };
    return colors[type] || "#6b7280";
  }

  // Get transaction history (sorted by date, most recent first)
  const history = [...investments]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 20);

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Investment Tracker</h1>
          <p className="text-muted-foreground mt-1">Monitor your portfolio performance</p>
        </div>
        <Button className="gap-2" onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          Add Investment
        </Button>
      </div>

      {/* Portfolio Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalInvested.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Initial capital</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Market value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
            {totalPnL >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                totalPnL >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {totalPnL >= 0 ? "+" : ""}
              ${totalPnL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalPnLPercentage >= 0 ? "+" : ""}
              {totalPnLPercentage.toFixed(2)}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Allocation Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Asset Allocation</CardTitle>
          <CardDescription>Portfolio breakdown by asset type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {assetAllocation.map((item) => (
              <div key={item.type} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm font-medium">{item.type}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm">${item.amount.toLocaleString()}</span>
                  <span className="text-sm text-muted-foreground">{item.percentage}%</span>
                </div>
              </div>
            ))}
            <div className="pt-2 text-xs text-muted-foreground text-center">
              Pie chart placeholder - will be replaced with Recharts
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Holdings Gallery */}
      <Card>
        <CardHeader>
          <CardTitle>Holdings</CardTitle>
          <CardDescription>Your current investment positions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {isLoading ? (
              <div className="col-span-full text-center text-muted-foreground py-8">
                Loading holdings...
              </div>
            ) : holdings.length === 0 ? (
              <div className="col-span-full text-center text-muted-foreground py-8">
                No holdings yet. Add your first investment to get started!
              </div>
            ) : (
              holdings.map((holding) => (
              <Card key={holding.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{holding.ticker}</CardTitle>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                      {holding.type}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Units:</span>
                    <span className="font-medium">{holding.units}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Avg Price:</span>
                    <span className="font-medium">${holding.avgPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Current Price:</span>
                    <span className="font-medium">${holding.currentPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Value:</span>
                    <span className="font-semibold">${holding.totalValue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t">
                    <span className="text-muted-foreground">P&L:</span>
                    <span
                      className={`font-semibold ${
                        holding.pnl >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {holding.pnl >= 0 ? "+" : ""}${holding.pnl.toLocaleString()} (
                      {holding.pnlPercentage >= 0 ? "+" : ""}
                      {holding.pnlPercentage}%)
                    </span>
                  </div>
                  <Button variant="outline" size="sm" className="w-full gap-2 mt-2">
                    <Edit className="h-3 w-3" />
                    Update Price
                  </Button>
                </CardContent>
              </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>Buy and sell actions with timestamps</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Ticker</TableHead>
                <TableHead>Units</TableHead>
                <TableHead className="text-right">Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Loading transaction history...
                  </TableCell>
                </TableRow>
              ) : history.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No transactions yet. Add your first investment to get started!
                  </TableCell>
                </TableRow>
              ) : (
                history.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">
                      {format(new Date(transaction.date), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          transaction.action === "buy"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        }`}
                      >
                        {transaction.action.charAt(0).toUpperCase() + transaction.action.slice(1)}
                      </span>
                    </TableCell>
                    <TableCell className="font-semibold">{transaction.ticker}</TableCell>
                    <TableCell>{transaction.units}</TableCell>
                    <TableCell className="text-right font-medium">
                      ${transaction.price_per_unit.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Investment Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Investment</DialogTitle>
            <DialogDescription>
              Record a new buy or sell transaction for your investment portfolio.
            </DialogDescription>
          </DialogHeader>
          <AddInvestmentForm
            onSubmit={handleSubmitInvestment}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

