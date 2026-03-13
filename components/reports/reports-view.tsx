"use client";

import { useState } from "react";
import { BentoCard } from "@/components/ui/bento-card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Package,
  Calendar,
  ArrowUpRight,
  Loader2,
  AlertCircle,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SalesReport {
  revenue: number;
  transactionCount: number;
  itemCount: number;
  revenueChange: number;
  transactionCountChange: number;
  itemCountChange: number;
  period: {
    start: string;
    end: string;
  };
}

interface TopProduct {
  id: string;
  name: string;
  sku: string;
  totalSold: number;
}

function formatChange(change: number): string {
  const sign = change > 0 ? "+" : "";
  return `${sign}${change.toFixed(1)}%`;
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  change,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  change: number;
}) {
  const isPositive = change >= 0;
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;

  return (
    <BentoCard className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-slate-500 mb-1">{title}</p>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white">
            {value}
          </h3>
          <div
            className={cn(
              "mt-2 inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full",
              isPositive
                ? "bg-emerald-500/10 text-emerald-500"
                : "bg-rose-500/10 text-rose-500",
            )}
          >
            <TrendIcon className="size-3" />
            <span>{formatChange(change)} vs previous period</span>
          </div>
        </div>
        <div
          className={cn(
            "size-12 rounded-xl flex items-center justify-center shrink-0",
            color,
          )}
        >
          <Icon className="size-6 text-white" />
        </div>
      </div>
    </BentoCard>
  );
}

export function ReportsView() {
  const [reportType, setReportType] = useState<"daily" | "monthly">("daily");

  const { data: dailyReport, isLoading: isLoadingDaily } = useQuery({
    queryKey: ["reports", "daily"],
    // Data sudah di-prefetch dari server via HydrationBoundary.
    // queryFn hanya dijalankan saat cache stale atau tidak ada data.
    queryFn: () => apiClient.get<SalesReport>("/api/v1/reports?type=daily"),
  });

  const { data: monthlyReport, isLoading: isLoadingMonthly } = useQuery({
    queryKey: ["reports", "monthly"],
    queryFn: () => apiClient.get<SalesReport>("/api/v1/reports?type=monthly"),
  });

  const { data: topProducts, isLoading: isLoadingTop } = useQuery({
    queryKey: ["reports", "top-products"],
    queryFn: () =>
      apiClient.get<TopProduct[]>("/api/v1/reports?type=top-products"),
  });

  const currentReport = reportType === "daily" ? dailyReport : monthlyReport;
  const isLoading = reportType === "daily" ? isLoadingDaily : isLoadingMonthly;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="size-8 animate-spin text-brand" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Reports & Analytics
          </h1>
          <p className="text-sm text-slate-500">
            Track your store performance and sales metrics.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-white/5 rounded-xl p-1">
            <button
              onClick={() => setReportType("daily")}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-bold transition-all",
                reportType === "daily"
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white",
              )}
            >
              Daily
            </button>
            <button
              onClick={() => setReportType("monthly")}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-bold transition-all",
                reportType === "monthly"
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white",
              )}
            >
              Monthly
            </button>
          </div>
          <Button variant="outline">
            <Download className="size-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-6 md:grid-cols-3">
        <StatCard
          title={`${reportType === "daily" ? "Today's" : "This Month's"} Revenue`}
          value={formatCurrency(currentReport?.revenue ?? 0)}
          icon={TrendingUp}
          color="bg-gradient-to-br from-emerald-500 to-emerald-600"
          change={currentReport?.revenueChange ?? 0}
        />
        <StatCard
          title="Total Transactions"
          value={currentReport?.transactionCount ?? 0}
          icon={ShoppingCart}
          color="bg-gradient-to-br from-blue-500 to-blue-600"
          change={currentReport?.transactionCountChange ?? 0}
        />
        <StatCard
          title="Items Sold"
          value={currentReport?.itemCount ?? 0}
          icon={Package}
          color="bg-gradient-to-br from-violet-500 to-violet-600"
          change={currentReport?.itemCountChange ?? 0}
        />
      </div>

      {/* Top Products */}
      <BentoCard className="p-0 overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                <ArrowUpRight className="size-5" />
              </div>
              <div>
                <h2 className="font-bold text-lg text-slate-900 dark:text-white">
                  Top Products
                </h2>
                <p className="text-xs text-slate-500">
                  Best selling products this period
                </p>
              </div>
            </div>
            <Calendar className="size-5 text-slate-400" />
          </div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-white/5">
          {isLoadingTop ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-8 animate-spin text-brand" />
            </div>
          ) : !topProducts || topProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="size-12 text-slate-400 mb-4" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                No sales data yet
              </h3>
              <p className="text-sm text-slate-500">
                Start making sales to see top products
              </p>
            </div>
          ) : (
            topProducts.map((product, index) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-4 hover:bg-slate-50/50 dark:hover:bg-white/2 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      "size-8 rounded-full flex items-center justify-center text-sm font-bold",
                      index === 0 && "bg-amber-500 text-white",
                      index === 1 && "bg-slate-400 text-white",
                      index === 2 && "bg-amber-700 text-white",
                      index > 2 &&
                        "bg-slate-100 dark:bg-white/5 text-slate-500",
                    )}
                  >
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">
                      {product.name}
                    </h4>
                    <p className="text-xs text-slate-500 font-mono">
                      {product.sku}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-brand">
                    {product.totalSold} sold
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </BentoCard>

      {/* Period Info */}
      {currentReport?.period && (
        <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
          <Calendar className="size-4" />
          <span>
            Period:{" "}
            {new Date(currentReport.period.start).toLocaleDateString("id-ID")}{" "}
            &mdash;{" "}
            {new Date(currentReport.period.end).toLocaleDateString("id-ID")}
          </span>
        </div>
      )}
    </div>
  );
}
